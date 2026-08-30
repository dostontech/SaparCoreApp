import { chromium } from 'playwright';
import path from 'path';

async function testSuperchargedPos() {
  console.log('1. Launching browser for supercharged POS audit...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('2. Navigating to login...');
  await page.goto('http://localhost:8080/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"], input[name="email"]', 'admin@demo.sapar.local');
  await page.fill('input[type="password"], input[name="password"]', 'Demo123$');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(3000);

  console.log('3. Navigating to /pos...');
  await page.goto('http://localhost:8080/pos', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Click on 2 products to add to cart
  const productCards = await page.$$('.cursor-pointer');
  if (productCards.length >= 2) {
    console.log('Adding products to cart...');
    await productCards[0].click();
    await page.waitForTimeout(500);
    await productCards[1].click();
    await page.waitForTimeout(500);
  }

  // Screenshot 1: Main POS Terminal with Cart & Hotkey triggers
  await page.screenshot({ path: path.resolve('module_audit_screenshots/31_sapar_pos_supercharged_terminal.png') });
  console.log('Saved 31_sapar_pos_supercharged_terminal.png');

  // Test Calculator (Alt+C or click Calculator button)
  console.log('Opening Calculator modal...');
  const calcBtn = await page.$('button:has-text("Kalkulyator")');
  if (calcBtn) {
    await calcBtn.click();
    await page.waitForTimeout(800);
    // Click 7, 8, 9, +, 5, =
    await page.click('button:has-text("7")');
    await page.click('button:has-text("+")');
    await page.click('button:has-text("8")');
    await page.click('button:has-text("=")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.resolve('module_audit_screenshots/32_sapar_pos_calculator.png') });
    console.log('Saved 32_sapar_pos_calculator.png');
    // Close calculator
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  // Test Hold Order (F4 or click To'xtatilgan)
  console.log('Opening Held Orders modal...');
  const holdBtn = await page.$('button:has-text("Toʻxtatilgan")');
  if (holdBtn) {
    await holdBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.resolve('module_audit_screenshots/33_sapar_pos_held_orders.png') });
    console.log('Saved 33_sapar_pos_held_orders.png');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  // Test Checkout (F8 Quick Cash or Payment Tender)
  console.log('Testing Quick Cash Checkout...');
  const cashBtn = await page.$('button:has-text("Naqd Toʻlov")');
  if (cashBtn) {
    await cashBtn.click();
    await page.waitForTimeout(2500);
    // Check if receipt modal is open
    await page.screenshot({ path: path.resolve('module_audit_screenshots/34_sapar_pos_escpos_thermal_receipt.png') });
    console.log('Saved 34_sapar_pos_escpos_thermal_receipt.png');
  }

  await browser.close();
  console.log('✓ All POS screenshots captured successfully!');
}

testSuperchargedPos().catch(console.error);
