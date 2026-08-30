import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function generatePdf() {
  const htmlPath = path.resolve('guides/qurilish_mollari_dokoni_qollanma.html');
  const pdfPath = path.resolve('guides/qurilish_mollari_dokoni_qollanma.pdf');

  console.log('Generating PDF from:', htmlPath);

  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  }

  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
    printBackground: true,
  });

  await browser.close();
  console.log('✓ PDF generated successfully:', pdfPath);
}

generatePdf().catch((err) => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
