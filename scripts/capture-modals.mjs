import { chromium } from 'playwright';
import path from 'path';

async function captureModals() {
  const baseUrl = 'http://localhost:8080';
  const authRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@demo.sapar.local', password: 'Demo123$' }),
  });
  const { token, user } = await authRes.json();

  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  await context.addCookies([
    { name: 'authToken', value: token, domain: 'localhost', path: '/' },
    { name: 'authUser', value: JSON.stringify(user), domain: 'localhost', path: '/' },
  ]);

  const page = await context.newPage();
  await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ t, u }) => {
    localStorage.setItem('authToken', t);
    localStorage.setItem('authUser', JSON.stringify(u));
  }, { t: token, u: user });

  await page.goto(`${baseUrl}/pos`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Open Calculator via Alt+C
  console.log('Opening calculator via Alt+C...');
  await page.keyboard.press('Alt+c');
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.resolve('module_audit_screenshots/32_sapar_pos_calculator.png') });
  console.log('Saved 32_sapar_pos_calculator.png');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // 2. Open Held orders via F4
  console.log('Opening held orders via F4...');
  await page.keyboard.press('F4');
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.resolve('module_audit_screenshots/33_sapar_pos_held_orders.png') });
  console.log('Saved 33_sapar_pos_held_orders.png');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // 3. Add product and click Naqd to'lov
  console.log('Adding product and checking out...');
  const prod = await page.$('.cursor-pointer');
  if (prod) {
    await prod.click();
    await page.waitForTimeout(500);
  }
  await page.keyboard.press('F8');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.resolve('module_audit_screenshots/34_sapar_pos_escpos_thermal_receipt.png') });
  console.log('Saved 34_sapar_pos_escpos_thermal_receipt.png');

  await browser.close();
}

captureModals().catch(console.error);
