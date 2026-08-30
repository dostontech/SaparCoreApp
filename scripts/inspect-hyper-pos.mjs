import { chromium } from 'playwright';
import path from 'path';

async function inspectHyperPos() {
  console.log('1. Launching browser to inspect Hyper POS...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('2. Navigating to https://hyper-pos.eshopweb.store/login...');
  await page.goto('https://hyper-pos.eshopweb.store/login', { waitUntil: 'networkidle', timeout: 30000 });

  await page.screenshot({ path: path.resolve('module_audit_screenshots/hyper_pos_login.png'), fullPage: true });

  console.log('3. Filling login credentials (admin@gmail.com / 12345678)...');
  await page.fill('input[type="email"], input[name="email"]', 'admin@gmail.com');
  await page.fill('input[type="password"], input[name="password"]', '12345678');
  await page.click('button[type="submit"]');

  console.log('4. Waiting for dashboard or POS page...');
  await page.waitForTimeout(5000);

  const currentUrl = page.url();
  console.log('Current URL after login:', currentUrl);
  await page.screenshot({ path: path.resolve('module_audit_screenshots/hyper_pos_dashboard.png'), fullPage: true });

  // Navigate to POS terminal page if separate
  const posLink = await page.$('a[href*="pos"], button:has-text("POS")');
  if (posLink) {
    console.log('Found POS link, clicking...');
    await posLink.click();
    await page.waitForTimeout(4000);
  } else {
    await page.goto('https://hyper-pos.eshopweb.store/pos', { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(3000);
  }

  console.log('POS Terminal URL:', page.url());
  await page.screenshot({ path: path.resolve('module_audit_screenshots/hyper_pos_terminal.png'), fullPage: true });

  // Extract key features from DOM
  const pageDetails = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a')).map((el) => el.textContent?.trim()).filter(Boolean);
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, .title')).map((el) => el.textContent?.trim()).filter(Boolean);
    const inputs = Array.from(document.querySelectorAll('input')).map((el) => ({ placeholder: el.placeholder, type: el.type, name: el.name }));
    return { buttons: Array.from(new Set(buttons)).slice(0, 30), headings: Array.from(new Set(headings)).slice(0, 20), inputs };
  });

  console.log('Hyper POS DOM Features:', JSON.stringify(pageDetails, null, 2));

  await browser.close();
}

inspectHyperPos().catch(console.error);
