const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function convertLogos() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }
  const page = await browser.newPage();
  
  const logoDir = path.resolve(__dirname);
  const svgContent = fs.readFileSync(path.join(logoDir, 'sapar_logo.svg'), 'utf8');

  // 1. High-Res Horizontal Logo (1200x400, White Background)
  await page.setViewportSize({ width: 1200, height: 400 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; background: #ffffff; display: flex; align-items: center; justify-content: center; height: 100vh; }
          svg { width: 900px; height: auto; }
        </style>
      </head>
      <body>${svgContent}</body>
    </html>
  `);
  await page.screenshot({ path: path.join(logoDir, 'sapar_logo_horizontal_white_bg.png'), type: 'png' });

  // 2. High-Res Horizontal Logo (1200x400, Transparent Background)
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; background: transparent; display: flex; align-items: center; justify-content: center; height: 100vh; }
          svg { width: 900px; height: auto; }
        </style>
      </head>
      <body>${svgContent}</body>
    </html>
  `);
  await page.screenshot({ path: path.join(logoDir, 'sapar_logo_horizontal_transparent.png'), type: 'png', omitBackground: true });

  // 3. Square App Icon (512x512, White Background with Teal Badge)
  await page.setViewportSize({ width: 512, height: 512 });
  const iconSvgMark = `
    <svg width="260" height="280" viewBox="0 0 45 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.571411 14.4812V25.6239L7.62723 21.7237V14.8521L18.3063 8.90914L11.4419 4.82776L3.89365 8.95446C1.84171 10.0763 0.571411 12.1895 0.571411 14.4812Z" fill="#02C39A" />
      <path d="M41 30.0855V18.9429L33.9442 22.843V29.7146L23.2651 35.6576L30.1295 39.739L37.6778 35.6123C39.7298 34.4904 41 32.3772 41 30.0855Z" fill="#028090" />
      <path d="M40.6892 14.0206L40.8093 15.6004L33.7535 19.3148V14.8575L13.7302 4.08136L20.5946 0L37.3268 8.93073C39.2607 9.96294 40.5263 11.8787 40.6892 14.0206Z" fill="#0B2B33" />
      <path d="M0.12016 30.925L0 29.3451L7.05584 25.6307V30.088L27.0791 40.8642L20.2147 44.9456L3.48254 36.0148C1.54864 34.9826 0.283068 33.0668 0.12016 30.925Z" fill="#0B2B33" />
    </svg>
  `;

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; background: #ffffff; display: flex; align-items: center; justify-content: center; height: 100vh; }
          .card { width: 440px; height: 440px; border-radius: 90px; background: linear-gradient(135deg, #F0FBF8 0%, #FFFFFF 100%); border: 2px solid #DCE9E5; display: flex; align-items: center; justify-content: center; box-shadow: 0 20px 40px rgba(2, 128, 144, 0.12); }
        </style>
      </head>
      <body>
        <div class="card">${iconSvgMark}</div>
      </body>
    </html>
  `);
  await page.screenshot({ path: path.join(logoDir, 'sapar_project_logo_512x512.png'), type: 'png' });

  // 4. Square App Icon (1024x1024, High Definition for President Tech Award application)
  await page.setViewportSize({ width: 1024, height: 1024 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; background: #ffffff; display: flex; align-items: center; justify-content: center; height: 100vh; }
          .card { width: 880px; height: 880px; border-radius: 180px; background: linear-gradient(135deg, #F0FBF8 0%, #FFFFFF 100%); border: 4px solid #DCE9E5; display: flex; align-items: center; justify-content: center; box-shadow: 0 40px 80px rgba(2, 128, 144, 0.14); }
          svg { width: 520px; height: auto; }
        </style>
      </head>
      <body>
        <div class="card">${iconSvgMark}</div>
      </body>
    </html>
  `);
  await page.screenshot({ path: path.join(logoDir, 'sapar_project_logo_1024x1024.png'), type: 'png' });

  // 5. Square Icon Transparent (512x512)
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; background: transparent; display: flex; align-items: center; justify-content: center; height: 100vh; }
          svg { width: 360px; height: auto; }
        </style>
      </head>
      <body>${iconSvgMark}</body>
    </html>
  `);
  await page.screenshot({ path: path.join(logoDir, 'sapar_icon_transparent_512x512.png'), type: 'png', omitBackground: true });

  await browser.close();
  console.log('Successfully generated all PNG logos in resources/logo/ !');
}

convertLogos().catch(console.error);
