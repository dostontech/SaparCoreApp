import { chromium } from 'playwright';
import path from 'path';

async function capture() {
  const baseUrl = 'http://localhost:8080';

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
  const { token, user } = authData;

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

  console.log('2. Navigating to /pos...');
  await page.goto(`${baseUrl}/pos`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2500);

  // Add items to cart
  const productCards = await page.$$('.cursor-pointer');
  if (productCards.length >= 2) {
    console.log('Adding products to cart...');
    await productCards[0].click();
    await page.waitForTimeout(400);
    await productCards[1].click();
    await page.waitForTimeout(400);
  }

  // 1. Capture Main POS Terminal Screenshot
  const out1 = path.resolve('module_audit_screenshots/31_sapar_pos_supercharged_terminal.png');
  await page.screenshot({ path: out1 });
  console.log('✓ 31_sapar_pos_supercharged_terminal.png saved to:', out1);

  // 2. Open & Capture Calculator (Alt+C)
  const calcBtn = await page.$('button[title*="kalkulyatori"]');
  if (calcBtn) {
    console.log('Opening calculator...');
    await calcBtn.click();
    await page.waitForTimeout(600);
    await page.click('button:has-text("7")');
    await page.click('button:has-text("+")');
    await page.click('button:has-text("8")');
    await page.click('button:has-text("=")');
    await page.waitForTimeout(400);
    const out2 = path.resolve('module_audit_screenshots/32_sapar_pos_calculator.png');
    await page.screenshot({ path: out2 });
    console.log('✓ 32_sapar_pos_calculator.png saved to:', out2);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }

  // 3. Open & Capture Held Orders (F4)
  const holdBtn = await page.$('button[title*="Toʻxtatilgan"]');
  if (holdBtn) {
    console.log('Opening held orders...');
    await holdBtn.click();
    await page.waitForTimeout(600);
    const out3 = path.resolve('module_audit_screenshots/33_sapar_pos_held_orders.png');
    await page.screenshot({ path: out3 });
    console.log('✓ 33_sapar_pos_held_orders.png saved to:', out3);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }

  // 4. Quick Cash Tender & Capture Thermal ESC/POS Receipt
  const cashBtn = await page.$('button:has-text("Naqd Toʻlov")');
  if (cashBtn) {
    console.log('Clicking Quick Cash Tender...');
    await cashBtn.click();
    await page.waitForTimeout(2500);
    const out4 = path.resolve('module_audit_screenshots/34_sapar_pos_escpos_thermal_receipt.png');
    await page.screenshot({ path: out4 });
    console.log('✓ 34_sapar_pos_escpos_thermal_receipt.png saved to:', out4);
  }

  await browser.close();
  console.log('ALL POS SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

capture().catch(console.error);
