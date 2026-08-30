import { chromium } from 'playwright';
import path from 'path';

const outputDir = path.resolve('module_screenshots');

const extraPages = [
  { name: '22_crm_deals_kanban.png', url: 'http://localhost:3000/admin/deals' },
  { name: '23_helpdesk_support.png', url: 'http://localhost:3000/admin/helpdesk' },
  { name: '24_soliq_tax_reports.png', url: 'http://localhost:3000/admin/reports/soliq' },
  { name: '25_e_documents_signing.png', url: 'http://localhost:3000/admin/e-documents' },
  { name: '26_time_tracking.png', url: 'http://localhost:3000/admin/time-tracking/my-timesheet' },
  { name: '27_activity_log.png', url: 'http://localhost:3000/admin/activity-log' },
];

async function run() {
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

  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 30000 });
  const demoBtn = await page.$('button:has-text("Demo"), button:has-text("Admin")');
  if (demoBtn) {
    await demoBtn.click();
    await page.waitForTimeout(1000);
  }

  for (const item of extraPages) {
    try {
      console.log(`Capturing ${item.name}...`);
      await page.goto(item.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(600);
      const filePath = path.join(outputDir, item.name);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`  ✓ Saved ${item.name}`);
    } catch (err) {
      console.error(`  ✗ Error on ${item.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('Extra pages captured successfully!');
}

run();
