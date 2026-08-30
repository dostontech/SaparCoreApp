import { chromium } from 'playwright';
import path from 'path';

async function testLandingPage() {
  console.log('1. Launching browser for SaaS Landing Page audit...');
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

  console.log('2. Navigating to http://localhost:8080/landing/index.html...');
  await page.goto('http://localhost:8080/landing/index.html', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2000);

  // 1. Capture Full Public Landing Page
  const out1 = path.resolve('module_audit_screenshots/35_sapar_saas_public_landing_page.png');
  await page.screenshot({ path: out1, fullPage: true });
  console.log('✓ 35_sapar_saas_public_landing_page.png saved to:', out1);

  // 2. Click "14 Kun Bepul Boshlash"
  console.log('3. Opening 1-Step Telegram Onboarding Modal...');
  const trialBtn = await page.$('button:has-text("14 Kun Bepul Boshlash")');
  if (trialBtn) {
    await trialBtn.click();
    await page.waitForTimeout(600);

    // Fill form
    await page.fill('input[placeholder*="Samarqand Stroy"]', 'Buxoro Qurilish Savdo MCHJ');
    await page.fill('input[placeholder*="+998901234567"]', '+998907654321');
    await page.fill('input[placeholder*="Doston Aliyev"]', 'Dostonbek');
    await page.waitForTimeout(400);

    // Capture modal screenshot with filled inputs
    const out2 = path.resolve('module_audit_screenshots/36_sapar_fast_telegram_onboarding_modal.png');
    await page.screenshot({ path: out2 });
    console.log('✓ 36_sapar_fast_telegram_onboarding_modal.png saved to:', out2);

    // Submit trial request
    console.log('Submitting trial lead...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Capture success state
    const out3 = path.resolve('module_audit_screenshots/37_sapar_trial_onboarding_success.png');
    await page.screenshot({ path: out3 });
    console.log('✓ 37_sapar_trial_onboarding_success.png saved to:', out3);
  }

  await browser.close();
  console.log('ALL LANDING & ONBOARDING AUDITS COMPLETE!');
}

testLandingPage().catch(console.error);
