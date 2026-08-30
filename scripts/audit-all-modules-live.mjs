import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outputDir = path.resolve('module_audit_screenshots');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const baseUrl = 'http://localhost:8080';

const auditChecklist = [
  {
    id: 'MOD-01',
    category: 'Dashboard & Analitika',
    title: 'Asosiy Boshqaruv Paneli (Executive Dashboard)',
    url: `${baseUrl}/admin/dashboard`,
    apiEndpoint: `${baseUrl}/api/dashboard/stats`,
    screenshot: '01_executive_dashboard_audit.png',
    checkElements: ['Total Revenue / Jami Daromad', 'Invoices', 'Receivables', 'Quick Action buttons'],
  },
  {
    id: 'MOD-02',
    category: 'CRM & Mijozlar',
    title: 'Kontaktlar va Kontragentlar Directory',
    url: `${baseUrl}/admin/contacts`,
    apiEndpoint: `${baseUrl}/api/contacts?type=customer`,
    screenshot: '02_crm_contacts_audit.png',
    checkElements: ['Customer table', 'STIR / INN column', 'Balance', 'Akt sverki button', 'Add Contact button'],
  },
  {
    id: 'MOD-03',
    category: 'CRM & Bitimlar',
    title: 'Visual Sales Pipeline (Deals Kanban)',
    url: `${baseUrl}/admin/deals`,
    apiEndpoint: `${baseUrl}/api/deals`,
    screenshot: '03_crm_deals_kanban_audit.png',
    checkElements: ['Kanban columns (Yangi, Muzokara, Taklif, Yutildi, Yoʻqotildi)', 'Drag-drop cards', 'Deal value'],
  },
  {
    id: 'MOD-04',
    category: 'Sotuv Boshqaruvi',
    title: 'Sotuv Hisob-fakturalari (Sales Invoices)',
    url: `${baseUrl}/admin/invoices`,
    apiEndpoint: `${baseUrl}/api/invoices`,
    screenshot: '04_sales_invoices_audit.png',
    checkElements: ['Invoice list table', 'Invoice status tags', 'E-Faktura status', 'Payment status', 'Create Invoice button'],
  },
  {
    id: 'MOD-05',
    category: 'Sotuv Boshqaruvi',
    title: 'Tijorat Takliflari (Commercial Quotations)',
    url: `${baseUrl}/admin/quotations`,
    apiEndpoint: `${baseUrl}/api/quotations`,
    screenshot: '05_quotations_proposals_audit.png',
    checkElements: ['Quotation table', 'Convert to Invoice action', 'PDF Export', 'Create Quotation button'],
  },
  {
    id: 'MOD-06',
    category: 'Sotuv Boshqaruvi',
    title: 'Yetkazib Berish Yukxatlari (Delivery Challans / TTN)',
    url: `${baseUrl}/admin/delivery-challans`,
    apiEndpoint: `${baseUrl}/api/delivery-challans`,
    screenshot: '06_delivery_challans_ttn_audit.png',
    checkElements: ['Challan list table', 'Vehicle & Driver details', 'Dispatched status', 'Create Challan button'],
  },
  {
    id: 'MOD-07',
    category: 'Sotuv Boshqaruvi',
    title: 'Kredit-notalar va Qaytarishlar (Credit Notes)',
    url: `${baseUrl}/admin/credit-notes`,
    apiEndpoint: `${baseUrl}/api/credit-notes`,
    screenshot: '07_sales_credit_notes_audit.png',
    checkElements: ['Credit Note table', 'Refund / Credit amount', 'Invoice linkage', 'Create Credit Note button'],
  },
  {
    id: 'MOD-08',
    category: 'Xaridlar & Taʼminot',
    title: 'Xarid Hisob-fakturalari (Purchase Bills)',
    url: `${baseUrl}/admin/purchases`,
    apiEndpoint: `${baseUrl}/api/purchases`,
    screenshot: '08_purchases_bills_audit.png',
    checkElements: ['Purchase bill table', 'Vendor name', 'Payment status', 'Create Purchase button'],
  },
  {
    id: 'MOD-09',
    category: 'Xaridlar & Taʼminot',
    title: 'Xarid Buyurtmalari (Purchase Orders)',
    url: `${baseUrl}/admin/purchase-orders`,
    apiEndpoint: `${baseUrl}/api/purchase-orders`,
    screenshot: '09_purchase_orders_audit.png',
    checkElements: ['PO list table', 'Approval status', 'Send to Vendor action', 'Create PO button'],
  },
  {
    id: 'MOD-10',
    category: 'Xaridlar & Taʼminot',
    title: 'Debet-notalar (Debit Notes)',
    url: `${baseUrl}/admin/debit-notes`,
    apiEndpoint: `${baseUrl}/api/debit-notes`,
    screenshot: '10_purchases_debit_notes_audit.png',
    checkElements: ['Debit Note table', 'Vendor adjustment', 'Original Bill linkage', 'Create Debit Note button'],
  },
  {
    id: 'MOD-11',
    category: 'Katalog & Mahsulotlar',
    title: 'Mahsulotlar va Xizmatlar Katalogi',
    url: `${baseUrl}/admin/products`,
    apiEndpoint: `${baseUrl}/api/products`,
    screenshot: '11_products_catalog_audit.png',
    checkElements: ['Product table', 'MXIK / IKPU code', 'Barcode / SKU', 'Sales price', 'Stock qty', 'Add Product button'],
  },
  {
    id: 'MOD-12',
    category: 'Ombor Boshqaruvi',
    title: 'Koʻp Omborli Tizim va Qoldiqlar (Inventory)',
    url: `${baseUrl}/admin/inventory`,
    apiEndpoint: `${baseUrl}/api/inventory`,
    screenshot: '12_inventory_warehouses_audit.png',
    checkElements: ['Warehouse filter', 'Stock levels', 'Low stock alert', 'Stock transfer action', 'Stock audit / write-off'],
  },
  {
    id: 'MOD-13',
    category: 'Chakana POS Kassa',
    title: 'Sensorli POS Kassa Terminali (Point of Sale)',
    url: `${baseUrl}/pos`,
    apiEndpoint: `${baseUrl}/api/pos/stats`,
    screenshot: '13_retail_pos_terminal_audit.png',
    checkElements: ['Touch product grid', 'Cart summary', 'Split payment (Naqd/Karta/Nasiya)', 'Barcode input', 'Shift open/close'],
  },
  {
    id: 'MOD-14',
    category: 'Moliya & Bank',
    title: 'Bank Hisoblari va Kassa (Cash & Banks)',
    url: `${baseUrl}/admin/banking`,
    apiEndpoint: `${baseUrl}/api/bank-accounts`,
    screenshot: '14_banking_accounts_audit.png',
    checkElements: ['Bank account cards', 'Current balance', 'Petty cash register', '1C:ClientBank Statement Import'],
  },
  {
    id: 'MOD-15',
    category: 'Moliya & Bank',
    title: 'Bank Tranzaksiyalari va Sverka (Reconciliation)',
    url: `${baseUrl}/admin/banking/transactions`,
    apiEndpoint: `${baseUrl}/api/bank-transactions`,
    screenshot: '15_bank_transactions_audit.png',
    checkElements: ['Transaction ledger table', 'Matched / Unmatched status', 'Debit/Credit columns', 'Auto-match action'],
  },
  {
    id: 'MOD-16',
    category: 'Moliya & Xarajatlar',
    title: 'Operatsion Xarajatlar (Expenses)',
    url: `${baseUrl}/admin/expenses`,
    apiEndpoint: `${baseUrl}/api/expenses`,
    screenshot: '16_operating_expenses_audit.png',
    checkElements: ['Expense table', 'Category breakdown', 'Receipt attachment', 'Payment mode', 'Add Expense button'],
  },
  {
    id: 'MOD-17',
    category: 'HRM & Ish Haqi',
    title: 'Xodimlar Ish Haqi va Oylik Soliqlar (Payroll)',
    url: `${baseUrl}/admin/payroll/profiles`,
    apiEndpoint: `${baseUrl}/api/payroll/profiles`,
    screenshot: '17_hrm_payroll_profiles_audit.png',
    checkElements: ['Employee list', 'Gross salary', 'JShODS 12%', 'Ijtimoiy soliq 12%', 'INPS 0.1%', 'Net payout'],
  },
  {
    id: 'MOD-18',
    category: 'HRM & Ish Vaqti',
    title: 'Ish Vaqti Hisobi va Tabel (Time Tracking)',
    url: `${baseUrl}/admin/time-tracking/my-timesheet`,
    apiEndpoint: `${baseUrl}/api/time-tracking/timesheet`,
    screenshot: '18_hrm_timesheet_tabel_audit.png',
    checkElements: ['Timesheet calendar / table', 'Clock in/out timer', 'Hours logged', 'Project / Task linkage'],
  },
  {
    id: 'MOD-19',
    category: 'Buxgalteriya & Hisoblar',
    title: 'Oʻzbekiston Standarti Hisoblar Rejasi (Chart of Accounts)',
    url: `${baseUrl}/admin/accounting/chart-of-accounts`,
    apiEndpoint: `${baseUrl}/api/accounting/accounts`,
    screenshot: '19_chart_of_accounts_audit.png',
    checkElements: ['Account tree / table', 'Account code (4010, 5110, 6010, etc.)', 'Account type (Active/Passive)', 'Balance'],
  },
  {
    id: 'MOD-20',
    category: 'Buxgalteriya & Bosh Kitob',
    title: 'Bosh Kitob va Jurnal Provodkalari (Journal Entries)',
    url: `${baseUrl}/admin/accounting/journal-entries`,
    apiEndpoint: `${baseUrl}/api/accounting/journal-entries`,
    screenshot: '20_journal_entries_audit.png',
    checkElements: ['Journal entry list', 'Debit / Credit balance check', 'Source document linkage', 'Create Journal Entry'],
  },
  {
    id: 'MOD-21',
    category: 'Moliyaviy Hisobotlar',
    title: 'Moliyaviy Natijalar (1-shakl Balans, 2-shakl P&L)',
    url: `${baseUrl}/admin/reports/income`,
    apiEndpoint: `${baseUrl}/api/reports/pnl`,
    screenshot: '21_financial_reports_pnl_audit.png',
    checkElements: ['Revenue summary', 'Cost of Goods Sold (COGS)', 'Operating expenses', 'Gross Profit', 'Net Profit'],
  },
  {
    id: 'MOD-22',
    category: 'Soliq Hisobotlari',
    title: 'Davlat Soliq Qoʻmitasi (Soliq) Hisobotlari',
    url: `${baseUrl}/admin/reports/soliq`,
    apiEndpoint: `${baseUrl}/api/reports/soliq/vat`,
    screenshot: '22_soliq_tax_reports_audit.png',
    checkElements: ['QQS Form 10006_29 monthly declaration', 'JShODS Form 11101_14 report', 'Turnover tax Form 10104_18'],
  },
  {
    id: 'MOD-23',
    category: 'E-Hujjatlar & E-IMZO',
    title: 'E-IMZO Raqamli Imzo va Didox Integratsiyasi',
    url: `${baseUrl}/admin/e-documents`,
    apiEndpoint: `${baseUrl}/api/e-documents`,
    screenshot: '23_e_documents_signing_audit.png',
    checkElements: ['Pending documents list', 'E-IMZO signing button', 'PKCS#7 signature verification', 'Didox EDI operator status'],
  },
  {
    id: 'MOD-24',
    category: 'Loyihalar Boshqaruvi',
    title: 'Loyihalar va Vazifalar Doskasi (Projects)',
    url: `${baseUrl}/admin/projects`,
    apiEndpoint: `${baseUrl}/api/projects`,
    screenshot: '24_project_workspace_audit.png',
    checkElements: ['Project cards / Kanban', 'Task list', 'Deadlines / Milestones', 'Budget vs Actual expense tracking'],
  },
  {
    id: 'MOD-25',
    category: 'Mijozlarni Qoʻllab-quvvatlash',
    title: 'Helpdesk Mijozlar Murojaatlari (Ticketing)',
    url: `${baseUrl}/admin/helpdesk`,
    apiEndpoint: `${baseUrl}/api/helpdesk/tickets`,
    screenshot: '25_helpdesk_support_audit.png',
    checkElements: ['Ticket list table', 'Priority (High/Medium/Low)', 'Status (Yangi, Jarayonda, Yechildi)', 'Assignee'],
  },
  {
    id: 'MOD-26',
    category: 'Audit & Xavfsizlik',
    title: 'Tizim Audit Jurnali (Activity Logs)',
    url: `${baseUrl}/admin/activity-log`,
    apiEndpoint: `${baseUrl}/api/activity-logs`,
    screenshot: '26_activity_log_audit.png',
    checkElements: ['Timestamp', 'User name', 'Action / Event type', 'IP address', 'Details / Diff'],
  },
  {
    id: 'MOD-27',
    category: 'Sozlamalar',
    title: 'Kompaniya va Tashkilot Sozlamalari',
    url: `${baseUrl}/admin/settings/company-settings`,
    apiEndpoint: `${baseUrl}/api/company-settings`,
    screenshot: '27_company_settings_audit.png',
    checkElements: ['Company name', 'STIR / INN', 'Address', 'Phone', 'Logo upload', 'Tax rate defaults'],
  },
  {
    id: 'MOD-28',
    category: 'Sozlamalar & Moliya',
    title: 'Bank, Valyutalar va Toʻlov Tizimlari Sozlamalari',
    url: `${baseUrl}/admin/settings/bank-accounts`,
    apiEndpoint: `${baseUrl}/api/bank-accounts`,
    screenshot: '28_finance_settings_audit.png',
    checkElements: ['Bank account list', 'Currency list (UZS, USD, EUR)', 'Payment Gateway webhooks (Payme, Click, Uzum)'],
  },
];

async function runAudit() {
  console.log('=====================================================');
  console.log('🔍 STARTING SYSTEMATIC LIVE AUDIT OF ALL 28 MODULES');
  console.log('=====================================================');

  console.log('1. Authenticating demo admin via API...');
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
  console.log(`✓ Authenticated as: ${user.email} (token length: ${token.length})`);

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

  await context.addCookies([
    { name: 'authToken', value: token, domain: 'localhost', path: '/' },
    { name: 'authUser', value: JSON.stringify(user), domain: 'localhost', path: '/' },
  ]);

  const page = await context.newPage();

  // Navigate to login to initialize localStorage
  await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    ({ t, u }) => {
      localStorage.setItem('authToken', t);
      localStorage.setItem('authUser', JSON.stringify(u));
      localStorage.setItem('sapar_token', t);
      localStorage.setItem('sapar_user', JSON.stringify(u));
      localStorage.setItem('sapar_lang', 'uz');
      localStorage.setItem('i18nextLng', 'uz');
    },
    { t: token, u: user }
  );

  const auditResults = [];

  for (let i = 0; i < auditChecklist.length; i++) {
    const item = auditChecklist[i];
    console.log(`\n[${i + 1}/${auditChecklist.length}] Auditing ${item.id}: ${item.title}...`);

    let uiStatus = 'FAILED';
    let apiStatus = 'FAILED';
    let detectedFeatures = [];
    let loadTimeMs = 0;

    // Test UI Navigation & Render
    try {
      const startTime = Date.now();
      const response = await page.goto(item.url, { waitUntil: 'networkidle', timeout: 25000 });
      loadTimeMs = Date.now() - startTime;

      if (response && response.status() < 400) {
        uiStatus = '200 OK';
      } else {
        uiStatus = `HTTP ${response ? response.status() : 'Error'}`;
      }

      await page.waitForTimeout(1200);

      // Save screenshot
      const screenshotPath = path.join(outputDir, item.screenshot);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      // Check text content on page
      const pageText = await page.innerText('body');
      for (const elem of item.checkElements) {
        const words = elem.split(' ')[0];
        if (pageText.toLowerCase().includes(words.toLowerCase())) {
          detectedFeatures.push(elem);
        }
      }
      console.log(`  ✓ UI rendered in ${loadTimeMs}ms. Detected features: ${detectedFeatures.length}/${item.checkElements.length}`);
      console.log(`  ✓ Screenshot saved: ${item.screenshot}`);
    } catch (err) {
      console.error(`  ✗ UI Error: ${err.message}`);
      uiStatus = `Error: ${err.message}`;
    }

    // Test API Endpoint
    try {
      const apiRes = await fetch(item.apiEndpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (apiRes.status < 400) {
        apiStatus = `200 OK`;
      } else {
        apiStatus = `HTTP ${apiRes.status}`;
      }
    } catch (err) {
      apiStatus = `API Error`;
    }

    auditResults.push({
      id: item.id,
      category: item.category,
      title: item.title,
      url: item.url,
      uiStatus,
      apiStatus,
      loadTimeMs,
      screenshot: item.screenshot,
      detectedFeatures,
      totalExpectedFeatures: item.checkElements.length,
      completionRate: Math.round((detectedFeatures.length / item.checkElements.length) * 100),
    });
  }

  await browser.close();

  // Write JSON Audit Log
  const reportPath = path.resolve('module_audit_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2));
  console.log(`\n🎉 Live audit completed! Full results saved to: ${reportPath}`);
}

runAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
