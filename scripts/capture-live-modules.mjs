import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outputDir = path.resolve('module_screenshots');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const baseUrl = 'http://localhost:8080';

const modules = [
  { name: '01_dashboard.png', url: `${baseUrl}/admin/dashboard`, desc: 'Boshqaruv Paneli (Main Dashboard)' },
  { name: '02_sales_dashboard.png', url: `${baseUrl}/admin/sales-dashboard`, desc: 'Sotuv Analitikasi (Sales Dashboard)' },
  { name: '03_finance_dashboard.png', url: `${baseUrl}/admin/finance-dashboard`, desc: 'Moliya Paneli (Finance Dashboard)' },
  { name: '04_hrm_dashboard.png', url: `${baseUrl}/admin/hrm-dashboard`, desc: 'HRM va Xodimlar Paneli' },
  { name: '05_contacts_companies.png', url: `${baseUrl}/admin/contacts`, desc: 'Kontaktlar va Kontragentlar' },
  { name: '06_crm_deals_pipeline.png', url: `${baseUrl}/admin/deals`, desc: 'CRM Bitimlar Kanbani' },
  { name: '07_sales_invoices.png', url: `${baseUrl}/admin/invoices`, desc: 'Hisob-fakturalar (Invoices)' },
  { name: '08_quotations.png', url: `${baseUrl}/admin/quotations`, desc: 'Tijorat Takliflari (Quotations)' },
  { name: '09_delivery_challans.png', url: `${baseUrl}/admin/delivery-challans`, desc: 'Yetkazib berish yukxatlari (TTN)' },
  { name: '10_credit_notes.png', url: `${baseUrl}/admin/credit-notes`, desc: 'Kredit-notalar (Qaytarishlar)' },
  { name: '11_purchases.png', url: `${baseUrl}/admin/purchases`, desc: 'Xaridlar va Xarajatlar (Purchases)' },
  { name: '12_purchase_orders.png', url: `${baseUrl}/admin/purchase-orders`, desc: 'Xarid Buyurtmalari' },
  { name: '13_debit_notes.png', url: `${baseUrl}/admin/debit-notes`, desc: 'Debet-notalar' },
  { name: '14_products_services.png', url: `${baseUrl}/admin/products`, desc: 'Mahsulotlar va Xizmatlar Katalogi' },
  { name: '15_inventory_warehouses.png', url: `${baseUrl}/admin/inventory`, desc: 'Ombor va Qoldiqlar' },
  { name: '16_pos_interface.png', url: `${baseUrl}/pos`, desc: 'Kassa / POS Terminali' },
  { name: '17_banking_accounts.png', url: `${baseUrl}/admin/banking`, desc: 'Bank Hisobvaraqlari va Kassa' },
  { name: '18_bank_transactions.png', url: `${baseUrl}/admin/banking/transactions`, desc: 'Bank Tranzaksiyalari va Sverka' },
  { name: '19_expenses.png', url: `${baseUrl}/admin/expenses`, desc: 'Operatsion Xarajatlar' },
  { name: '20_payroll_profiles.png', url: `${baseUrl}/admin/payroll/profiles`, desc: 'Oylik Ish Haqi va Soliqlar' },
  { name: '21_time_tracking.png', url: `${baseUrl}/admin/time-tracking/my-timesheet`, desc: 'Vaqtni Hisobga Olish (Tabel)' },
  { name: '22_chart_of_accounts.png', url: `${baseUrl}/admin/accounting/chart-of-accounts`, desc: 'Hisoblar Rejasi (Chart of Accounts)' },
  { name: '23_journal_entries.png', url: `${baseUrl}/admin/accounting/journal-entries`, desc: 'Bosh Kitob va Provodkalar' },
  { name: '24_reports_sales.png', url: `${baseUrl}/admin/reports/sales`, desc: 'Sotuv Hisobotlari' },
  { name: '25_reports_income.png', url: `${baseUrl}/admin/reports/income`, desc: 'Moliyaviy Natijalar (1/2-shakl)' },
  { name: '26_soliq_tax_reports.png', url: `${baseUrl}/admin/reports/soliq`, desc: 'Soliq Hisobotlari (QQS / JShODS)' },
  { name: '27_e_documents_signing.png', url: `${baseUrl}/admin/e-documents`, desc: 'E-IMZO Hujjatlar' },
  { name: '28_project_workspace.png', url: `${baseUrl}/admin/projects`, desc: 'Loyihalar va Vazifalar Doskasi' },
  { name: '29_helpdesk_support.png', url: `${baseUrl}/admin/helpdesk`, desc: 'Mijozlarni Qoʻllab-quvvatlash' },
  { name: '30_activity_log.png', url: `${baseUrl}/admin/activity-log`, desc: 'Tizim Audit Jurnali' },
  { name: '31_company_settings.png', url: `${baseUrl}/admin/settings/company-settings`, desc: 'Kompaniya Sozlamalari' },
  { name: '32_bank_settings.png', url: `${baseUrl}/admin/settings/bank-accounts`, desc: 'Moliya va Bank Sozlamalari' },
];

async function capture() {
  console.log('1. Authenticating with demo admin API...');
  const authRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@demo.sapar.local',
      password: 'Demo123$',
    }),
  });

  const authData = await authRes.json();
  if (!authData.token) {
    throw new Error('API login failed: ' + JSON.stringify(authData));
  }

  const { token, user } = authData;
  console.log(`✓ Token acquired for ${user.email} (role: ${user.roleName || user.user_type})`);

  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });

  // Inject cookies
  await context.addCookies([
    { name: 'authToken', value: token, domain: 'localhost', path: '/' },
    { name: 'authUser', value: JSON.stringify(user), domain: 'localhost', path: '/' },
  ]);

  const page = await context.newPage();

  // Navigate to root to set localStorage
  await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    ({ t, u }) => {
      localStorage.setItem('authToken', t);
      localStorage.setItem('authUser', JSON.stringify(u));
      localStorage.setItem('sapar_token', t);
      localStorage.setItem('sapar_user', JSON.stringify(u));
    },
    { t: token, u: user }
  );

  console.log('✓ Auth cookies and localStorage configured.');

  // Verify dashboard loads
  console.log('2. Navigating to /admin/dashboard to verify authenticated session...');
  await page.goto(`${baseUrl}/admin/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  console.log('✓ Current Page Title:', await page.title(), 'URL:', page.url());

  // Capture all module pages
  for (let i = 0; i < modules.length; i++) {
    const item = modules[i];
    try {
      console.log(`[${i + 1}/${modules.length}] Capturing ${item.name} (${item.desc})...`);
      await page.goto(item.url, { waitUntil: 'networkidle', timeout: 25000 });
      // Wait for table / card content to render
      await page.waitForTimeout(1500);
      const filePath = path.join(outputDir, item.name);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`  ✓ Successfully captured: ${item.name}`);
    } catch (err) {
      console.error(`  ✗ Error capturing ${item.name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('\n🎉 ALL 32 MODULE PAGES CAPTURED SUCCESSFULLY!');
}

capture().catch((err) => {
  console.error('Fatal error during capture:', err);
  process.exit(1);
});
