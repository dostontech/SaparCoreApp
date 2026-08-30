import { chromium } from 'playwright';
import path from 'path';

async function runFastAudit() {
  console.log('1. Fast Playwright POS audit starting...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 1. Direct API Login to get token and set localStorage
  console.log('2. Authenticating via API...');
  const authRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@demo.sapar.local', password: 'Demo123$' }),
  });
  const authData = await authRes.json();
  const token = authData.token;
  const user = authData.data || authData.user;

  console.log('3. Navigating to /pos with auth token...');
  await page.goto('http://localhost:8080/login');
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, { token, user });

  await page.goto('http://localhost:8080/pos', { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  // Click on products to populate cart
  const productCards = await page.$$('.cursor-pointer');
  if (productCards.length >= 2) {
    console.log('Adding products to cart...');
    await productCards[0].click();
    await page.waitForTimeout(400);
    await productCards[1].click();
    await page.waitForTimeout(400);
  }

  // 1. Capture Main POS Terminal Screenshot
  await page.screenshot({ path: path.resolve('module_audit_screenshots/31_sapar_pos_supercharged_terminal.png') });
  console.log('✓ 31_sapar_pos_supercharged_terminal.png saved');

  // 2. Open & Capture Calculator (Alt+C)
  const calcBtn = await page.$('button:has-text("Kalkulyator")');
  if (calcBtn) {
    await calcBtn.click();
    await page.waitForTimeout(600);
    await page.click('button:has-text("7")');
    await page.click('button:has-text("+")');
    await page.click('button:has-text("8")');
    await page.click('button:has-text("=")');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.resolve('module_audit_screenshots/32_sapar_pos_calculator.png') });
    console.log('✓ 32_sapar_pos_calculator.png saved');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }

  // 3. Open & Capture Held Orders (F4)
  const holdBtn = await page.$('button:has-text("Toʻxtatilgan")');
  if (holdBtn) {
    await holdBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.resolve('module_audit_screenshots/33_sapar_pos_held_orders.png') });
    console.log('✓ 33_sapar_pos_held_orders.png saved');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }

  // 4. Quick Cash Tender & Capture Thermal ESC/POS Receipt
  const cashBtn = await page.$('button:has-text("Naqd Toʻlov")');
  if (cashBtn) {
    await cashBtn.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.resolve('module_audit_screenshots/34_sapar_pos_escpos_thermal_receipt.png') });
    console.log('✓ 34_sapar_pos_escpos_thermal_receipt.png saved');
  }

  await browser.close();
  console.log('ALL POS AUDIT SCREENSHOTS READY!');
}

runFastAudit().catch(console.error);
