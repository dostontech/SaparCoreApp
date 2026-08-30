import { chromium } from 'playwright';
import path from 'path';

async function captureAllPosModals() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const authRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@demo.sapar.local', password: 'Demo123$' }),
  });
  const authData = await authRes.json();
  const token = authData.token;
  const user = authData.data || authData.user;

  await page.goto('http://localhost:8080/login');
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, { token, user });

  await page.goto('http://localhost:8080/pos', { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  // 1. Add product to cart
  const productCards = await page.$$('.cursor-pointer');
  if (productCards.length > 0) {
    await productCards[0].click();
    await page.waitForTimeout(500);
  }

  // 2. Open Calculator
  console.log('Opening calculator...');
  await page.keyboard.press('Alt+c');
  await page.waitForTimeout(800);
  await page.click('button:has-text("7")');
  await page.click('button:has-text("+")');
  await page.click('button:has-text("8")');
  await page.click('button:has-text("=")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.resolve('module_audit_screenshots/32_sapar_pos_calculator.png') });
  console.log('Saved 32_sapar_pos_calculator.png');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // 3. Open Held Orders
  console.log('Opening held orders...');
  await page.keyboard.press('F4');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.resolve('module_audit_screenshots/33_sapar_pos_held_orders.png') });
  console.log('Saved 33_sapar_pos_held_orders.png');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // 4. Quick Cash Tender & Receipt
  console.log('Testing quick cash...');
  await page.keyboard.press('F8');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.resolve('module_audit_screenshots/34_sapar_pos_escpos_thermal_receipt.png') });
  console.log('Saved 34_sapar_pos_escpos_thermal_receipt.png');

  await browser.close();
}

captureAllPosModals().catch(console.error);
