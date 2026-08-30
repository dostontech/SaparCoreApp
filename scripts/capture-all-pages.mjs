import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outputDir = path.resolve('module_screenshots');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const pagesToCapture = [
  { name: '01_dashboard.png', url: 'http://localhost:3000/admin/dashboard' },
  { name: '02_contacts_companies.png', url: 'http://localhost:3000/admin/contacts' },
  { name: '03_sales_invoices.png', url: 'http://localhost:3000/admin/invoices' },
  { name: '04_quotations.png', url: 'http://localhost:3000/admin/quotations' },
  { name: '05_delivery_challans.png', url: 'http://localhost:3000/admin/delivery-challans' },
  { name: '06_credit_notes.png', url: 'http://localhost:3000/admin/credit-notes' },
  { name: '07_purchases.png', url: 'http://localhost:3000/admin/purchases' },
  { name: '08_purchase_orders.png', url: 'http://localhost:3000/admin/purchase-orders' },
  { name: '09_debit_notes.png', url: 'http://localhost:3000/admin/debit-notes' },
  { name: '10_products_services.png', url: 'http://localhost:3000/admin/products' },
  { name: '11_inventory_warehouses.png', url: 'http://localhost:3000/admin/inventory' },
  { name: '12_pos_interface.png', url: 'http://localhost:3000/pos' },
  { name: '13_banking_accounts.png', url: 'http://localhost:3000/admin/banking' },
  { name: '14_bank_transactions.png', url: 'http://localhost:3000/admin/banking/transactions' },
  { name: '15_expenses.png', url: 'http://localhost:3000/admin/expenses' },
  { name: '16_payroll_profiles.png', url: 'http://localhost:3000/admin/payroll/profiles' },
  { name: '17_chart_of_accounts.png', url: 'http://localhost:3000/admin/accounting/chart-of-accounts' },
  { name: '18_journal_entries.png', url: 'http://localhost:3000/admin/accounting/journal-entries' },
  { name: '19_reports_sales.png', url: 'http://localhost:3000/admin/reports/sales' },
  { name: '20_reports_income.png', url: 'http://localhost:3000/admin/reports/income' },
  { name: '21_company_settings.png', url: 'http://localhost:3000/admin/settings/company-settings' },
];

async function run() {
  console.log('Launching browser with system Edge/Chrome...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  }
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log('Navigating to app...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 30000 });

  // If on login, click demo button or fill credentials
  const demoBtn = await page.$('button:has-text("Demo"), button:has-text("Admin")');
  if (demoBtn) {
    await demoBtn.click();
    await page.waitForTimeout(1000);
  }

  for (const item of pagesToCapture) {
    try {
      console.log(`Capturing ${item.name} (${item.url})...`);
      await page.goto(item.url, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(800); // Allow render/animations to settle
      const filePath = path.join(outputDir, item.name);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`  ✓ Saved to ${filePath}`);
    } catch (err) {
      console.error(`  ✗ Error capturing ${item.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('All screenshots completed successfully!');
}

run().catch((err) => {
  console.error('Fatal error running screenshot script:', err);
  process.exit(1);
});
