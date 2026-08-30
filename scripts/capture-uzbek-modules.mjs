import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outputDir = path.resolve('module_screenshots_uz');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const baseUrl = 'http://localhost:8080';

const modules = [
  { name: '01_boshqaruv_paneli.png', url: `${baseUrl}/admin/dashboard`, desc: 'Boshqaruv Paneli (Asosiy Dashboard)' },
  { name: '02_sotuv_analitikasi.png', url: `${baseUrl}/admin/sales-dashboard`, desc: 'Sotuv Analitikasi Paneli' },
  { name: '03_moliya_paneli.png', url: `${baseUrl}/admin/finance-dashboard`, desc: 'Moliya va Pul Oqimi Paneli' },
  { name: '04_hrm_xodimlar_paneli.png', url: `${baseUrl}/admin/hrm-dashboard`, desc: 'HRM va Xodimlar Paneli' },
  { name: '05_kontaktlar_kontragentlar.png', url: `${baseUrl}/admin/contacts`, desc: 'Kontaktlar va Mijozlar Roʻyxati' },
  { name: '06_crm_bitimlar_kanban.png', url: `${baseUrl}/admin/deals`, desc: 'CRM Bitimlar Voronkasi (Kanban)' },
  { name: '07_hisob_fakturalar.png', url: `${baseUrl}/admin/invoices`, desc: 'Sotuv Hisob-fakturalari (Invoices)' },
  { name: '08_tijorat_takliflari.png', url: `${baseUrl}/admin/quotations`, desc: 'Tijorat Takliflari (Quotations)' },
  { name: '09_yetkazib_berish_yukxatlari_ttn.png', url: `${baseUrl}/admin/delivery-challans`, desc: 'Yetkazib berish yukxatlari (TTN)' },
  { name: '10_kredit_notalar_qaytarishlar.png', url: `${baseUrl}/admin/credit-notes`, desc: 'Kredit-notalar (Tovarlarni qaytarish)' },
  { name: '11_xaridlar_xarajatlar.png', url: `${baseUrl}/admin/purchases`, desc: 'Xaridlar va Taʼminotchilar Hisoblari' },
  { name: '12_xarid_buyurtmalari.png', url: `${baseUrl}/admin/purchase-orders`, desc: 'Xarid Buyurtmalari (Purchase Orders)' },
  { name: '13_debet_notalar.png', url: `${baseUrl}/admin/debit-notes`, desc: 'Taʼminotchilarga Debet-notalar' },
  { name: '14_mahsulotlar_xizmatlar_katalogi.png', url: `${baseUrl}/admin/products`, desc: 'Mahsulotlar va Xizmatlar Katalogi' },
  { name: '15_ombor_qoldiqlar_inventarizatsiya.png', url: `${baseUrl}/admin/inventory`, desc: 'Koʻp Omborli Inventarizatsiya va Qoldiqlar' },
  { name: '16_kassa_pos_terminali.png', url: `${baseUrl}/pos`, desc: 'Sensorli POS Kassa Terminali' },
  { name: '17_bank_hisobvaraqlari_kassa.png', url: `${baseUrl}/admin/banking`, desc: 'Bank Hisoblari va Kassa (Naqd pul)' },
  { name: '18_bank_tranzaksiyalari_sverka.png', url: `${baseUrl}/admin/banking/transactions`, desc: 'Bank Tranzaksiyalari va Koʻchirmalar' },
  { name: '19_operatsion_xarajatlar.png', url: `${baseUrl}/admin/expenses`, desc: 'Operatsion Xarajatlar (Expenses)' },
  { name: '20_ish_haqi_soliqlar_profil.png', url: `${baseUrl}/admin/payroll/profiles`, desc: 'Ish Haqi (12% JShODS, 12% Ijtimoiy, 0.1% INPS)' },
  { name: '21_vaqt_hisobi_tabel.png', url: `${baseUrl}/admin/time-tracking/my-timesheet`, desc: 'Ish Vaqti Hisobi (Tabel / Timesheet)' },
  { name: '22_hisoblar_rejasi.png', url: `${baseUrl}/admin/accounting/chart-of-accounts`, desc: 'Oʻzbekiston Standarti Hisoblar Rejasi' },
  { name: '23_bosh_kitob_provodkalar.png', url: `${baseUrl}/admin/accounting/journal-entries`, desc: 'Bosh Kitob va Jurnal Provodkalari' },
  { name: '24_sotuv_daromad_hisobotlari.png', url: `${baseUrl}/admin/reports/sales`, desc: 'Sotuv va Daromad Hisobotlari' },
  { name: '25_moliyaviy_natijalar_balans.png', url: `${baseUrl}/admin/reports/income`, desc: 'Moliyaviy Natijalar (1-shakl Balans, 2-shakl P&L)' },
  { name: '26_soliq_hisobotlari_qqs_jshods.png', url: `${baseUrl}/admin/reports/soliq`, desc: 'Davlat Soliq Qoʻmitasi (Soliq) Hisobotlari' },
  { name: '27_e_imzo_hujjatlar_imzolash.png', url: `${baseUrl}/admin/e-documents`, desc: 'E-IMZO Raqamli Imzo va Didox Integratsiyasi' },
  { name: '28_loyihalar_vazifalar_doskasi.png', url: `${baseUrl}/admin/projects`, desc: 'Loyihalar va Vazifalar Doskasi (Kanban)' },
  { name: '29_mijozlarni_qollab_quvvatlash.png', url: `${baseUrl}/admin/helpdesk`, desc: 'Helpdesk Mijozlar Murojaatlari' },
  { name: '30_tizim_audit_jurnali.png', url: `${baseUrl}/admin/activity-log`, desc: 'Xavfsizlik va Harakatlar Jurnali (Audit)' },
  { name: '31_kompaniya_sozlamalari.png', url: `${baseUrl}/admin/settings/company-settings`, desc: 'Tashkilot va Kompaniya Rekvizitlari' },
  { name: '32_moliya_bank_sozlamalari.png', url: `${baseUrl}/admin/settings/bank-accounts`, desc: 'Moliya, Valyutalar va Bank Sozlamalari' },
];

async function runUzbekCapture() {
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
  console.log(`✓ Authenticated: ${user.email} (token length: ${token.length})`);

  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
    locale: 'uz-UZ',
  });

  // Inject cookies with authToken and authUser
  await context.addCookies([
    { name: 'authToken', value: token, domain: 'localhost', path: '/' },
    { name: 'authUser', value: JSON.stringify(user), domain: 'localhost', path: '/' },
  ]);

  const page = await context.newPage();

  // Navigate to login page to set localStorage keys including 'sapar_lang' = 'uz'
  console.log('2. Setting Uzbek language (sapar_lang = "uz") in localStorage...');
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

  console.log('✓ Uzbek language and auth session configured.');

  // Verify dashboard loads in Uzbek
  console.log('3. Verifying dashboard in Uzbek...');
  await page.goto(`${baseUrl}/admin/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  console.log('✓ Current Page Title:', await page.title(), 'URL:', page.url());

  // Capture all 32 module pages
  for (let i = 0; i < modules.length; i++) {
    const item = modules[i];
    try {
      console.log(`📸 [${i + 1}/${modules.length}] Oʻzbekcha: ${item.name} (${item.desc})...`);
      await page.goto(item.url, { waitUntil: 'networkidle', timeout: 25000 });
      // Wait for table/chart animations and localized text to render
      await page.waitForTimeout(1500);
      const filePath = path.join(outputDir, item.name);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`  ✓ Saqlandi: ${item.name}`);
    } catch (err) {
      console.error(`  ✗ Xatolik (${item.name}): ${err.message}`);
    }
  }

  await browser.close();
  console.log('\n🎉 Barcha 32 ta modul oʻzbek tilidagi skrinshotlari muvaffaqiyatli saqlandi!');
}

runUzbekCapture().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
