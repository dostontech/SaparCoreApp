import { chromium } from 'playwright';
import path from 'path';

async function capture() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  }

  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.goto('http://localhost:8080/api/public/e-invoice/verify/SAPAR-EDI-693f757f-f4bf-4555-bbe2-60c8b9f8b461', {
    waitUntil: 'networkidle',
  });

  const outPath = path.resolve('module_audit_screenshots/29_sapar_edi_hub_public_verification.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('✓ Public verification certificate screenshot saved to:', outPath);

  await browser.close();
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
