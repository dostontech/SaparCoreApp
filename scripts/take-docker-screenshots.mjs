import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outputDir = path.resolve('module_screenshots');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const baseUrl = 'http://localhost:8080';

const pages = [
  // Auth Pages
  { name: '00_auth_login.png', url: `${baseUrl}/login` },
  { name: '00_auth_register.png', url: `${baseUrl}/register` },

  // Dashboards
  { name: '01_executive_dashboard.png', url: `${baseUrl}/admin/dashboard` },
  { name: '02_sales_dashboard.png', url: `${baseUrl}/admin/sales-dashboard` },
  { name: '03_finance_dashboard.png', url: `${baseUrl}/admin/finance-dashboard` },
  { name: '04_hrm_dashboard.png', url: `${baseUrl}/admin/hrm-dashboard` },

  // CRM & Contacts
  { name: '05_crm_contacts_companies.png', url: `${baseUrl}/admin/contacts` },
  { name: '06_crm_deals_pipeline_kanban.png', url: `${baseUrl}/admin/deals` },

  // Sales & Invoicing
  { name: '07_sales_invoices.png', url: `${baseUrl}/admin/invoices` },
  { name: '08_commercial_quotations.png', url: `${baseUrl}/admin/quotations` },
  { name: '09_delivery_challans_ttn.png', url: `${baseUrl}/admin/delivery-challans` },
  { name: '10_sales_credit_notes.png', url: `${baseUrl}/admin/credit-notes` },

  // Purchases
  { name: '11_purchases_bills.png', url: `${baseUrl}/admin/purchases` },
  { name: '12_purchase_orders.png', url: `${baseUrl}/admin/purchase-orders` },
  { name: '13_debit_notes_returns.png', url: `${baseUrl}/admin/debit-notes` },

  // Products & Inventory
  { name: '14_products_services_catalog.png', url: `${baseUrl}/admin/products` },
  { name: '15_multi_warehouse_inventory.png', url: `${baseUrl}/admin/inventory` },

  // Retail POS
  { name: '16_retail_pos_touch_terminal.png', url: `${baseUrl}/pos` },

  // Banking & Cash
  { name: '17_banking_accounts.png', url: `${baseUrl}/admin/banking` },
  { name: '18_bank_transactions_reconciliation.png', url: `${baseUrl}/admin/banking/transactions` },
  { name: '19_operating_expenses.png', url: `${baseUrl}/admin/expenses` },

  // HRM & Payroll
  { name: '20_hrm_payroll_profiles.png', url: `${baseUrl}/admin/payroll/profiles` },
  { name: '21_time_tracking_timesheet.png', url: `${baseUrl}/admin/time-tracking/my-timesheet` },

  // Accounting & Ledger
  { name: '22_chart_of_accounts.png', url: `${baseUrl}/admin/accounting/chart-of-accounts` },
  { name: '23_general_ledger_journal_entries.png', url: `${baseUrl}/admin/accounting/journal-entries` },

  // Reports
  { name: '24_sales_revenue_reports.png', url: `${baseUrl}/admin/reports/sales` },
  { name: '25_financial_statements_pnl_balance_sheet.png', url: `${baseUrl}/admin/reports/income` },
  { name: '26_soliq_tax_filing_reports.png', url: `${baseUrl}/admin/reports/soliq` },

  // E-Docs & E-IMZO
  { name: '27_e_documents_digital_signing.png', url: `${baseUrl}/admin/e-documents` },

  // Project & Support
  { name: '28_project_task_board.png', url: `${baseUrl}/admin/projects` },
  { name: '29_helpdesk_customer_support.png', url: `${baseUrl}/admin/helpdesk` },
  { name: '30_audit_activity_log.png', url: `${baseUrl}/admin/activity-log` },

  // Settings
  { name: '31_company_settings.png', url: `${baseUrl}/admin/settings/company-settings` },
  { name: '32_finance_settings.png', url: `${baseUrl}/admin/settings/bank-accounts` },
];

async function run() {
  console.log('🚀 Launching browser via system Edge/Chrome...');
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

  const page = await context.newPage();

  // 1. Capture Auth Pages first
  console.log(`📸 Capturing ${pages[0].name}...`);
  await page.goto(pages[0].url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, pages[0].name), fullPage: true });

  console.log(`📸 Capturing ${pages[1].name}...`);
  await page.goto(pages[1].url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, pages[1].name), fullPage: true });

  // 2. Perform Login
  console.log('🔑 Performing demo login...');
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  const demoBtn = await page.$('button:has-text("Demo"), button:has-text("Admin"), button:has-text("Kirish")');
  if (demoBtn) {
    await demoBtn.click();
    await page.waitForTimeout(1500);
  }

  // 3. Capture all remaining module pages
  for (let i = 2; i < pages.length; i++) {
    const item = pages[i];
    try {
      console.log(`📸 [${i + 1}/${pages.length}] Capturing ${item.name} (${item.url})...`);
      await page.goto(item.url, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(700);
      const targetPath = path.join(outputDir, item.name);
      await page.screenshot({ path: targetPath, fullPage: true });
      console.log(`  ✓ Saved: ${item.name}`);
    } catch (err) {
      console.error(`  ✗ Error on ${item.name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('🎉 All module screenshots captured and saved successfully!');
}

run().catch((err) => {
  console.error('Fatal error in screenshot runner:', err);
  process.exit(1);
});
