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

  console.log('2. Navigating to /settings/telegram...');
  await page.goto(`${baseUrl}/settings/telegram`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const outPath = path.resolve('module_audit_screenshots/30_telegram_notification_settings.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('✓ Telegram Notification Settings screenshot saved to:', outPath);

  await browser.close();
}

capture().catch((e) => {
  console.error('Screenshot capture failed:', e);
  process.exit(1);
});
