import { chromium } from 'playwright';
import path from 'path';

async function inspect() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('1. Logging in as cashier (cashier@demo.test / cashier1234)...');
  await page.goto('https://hyper-pos.eshopweb.store/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"], input[name="email"]', 'cashier@demo.test');
  await page.fill('input[type="password"], input[name="password"]', 'cashier1234');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(4000);
  console.log('Current URL after cashier login:', page.url());

  await page.screenshot({ path: path.resolve('module_audit_screenshots/hyper_pos_cashier_screen.png'), fullPage: true });

  // Get all navigation links
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, button')).map((el) => ({
      text: el.textContent?.trim(),
      href: el.getAttribute('href'),
    })).filter((x) => x.text);
  });

  console.log('Available Navigation Links:', JSON.stringify(links.slice(0, 25), null, 2));

  // If there is a direct POS link, let's navigate
  const posLink = links.find((l) => l.text?.toLowerCase().includes('pos') || l.href?.includes('pos'));
  if (posLink && posLink.href) {
    console.log('Navigating to POS URL:', posLink.href);
    await page.goto(posLink.href.startsWith('http') ? posLink.href : `https://hyper-pos.eshopweb.store${posLink.href}`, {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.resolve('module_audit_screenshots/hyper_pos_terminal.png'), fullPage: true });
  }

  await browser.close();
}

inspect().catch(console.error);
