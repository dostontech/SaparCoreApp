import { chromium } from 'playwright';
import path from 'path';

async function inspectCashierTerminal() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('1. Logging in as cashier...');
  await page.goto('https://hyper-pos.eshopweb.store/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"], input[name="email"]', 'cashier@demo.test');
  await page.fill('input[type="password"], input[name="password"]', 'cashier1234');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(3000);

  console.log('2. Navigating to /cashier...');
  await page.goto('https://hyper-pos.eshopweb.store/cashier', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  console.log('Saving cashier screenshot...');
  await page.screenshot({ path: path.resolve('module_audit_screenshots/hyper_pos_cashier_terminal.png'), fullPage: true });

  // Extract key features from DOM
  const features = await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button, a, [role="button"]')).map((el) => el.textContent?.trim()).filter(Boolean);
    const categoryTabs = Array.from(document.querySelectorAll('.category, [data-category], nav a')).map((el) => el.textContent?.trim()).filter(Boolean);
    const shortcuts = Array.from(document.querySelectorAll('kbd, .shortcut, [title*="F"], [title*="Ctrl"], [title*="Shift"]')).map((el) => el.textContent?.trim()).filter(Boolean);
    const modals = Array.from(document.querySelectorAll('[role="dialog"], .modal')).map((el) => el.textContent?.trim()).filter(Boolean);
    return {
      allButtons: Array.from(new Set(allButtons)).slice(0, 40),
      categoryTabs: Array.from(new Set(categoryTabs)).slice(0, 15),
      shortcuts: Array.from(new Set(shortcuts)),
      modals,
    };
  });

  console.log('Hyper POS Detailed Features:\n', JSON.stringify(features, null, 2));

  await browser.close();
}

inspectCashierTerminal().catch(console.error);
