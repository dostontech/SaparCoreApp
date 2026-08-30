const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function generateClientPdf() {
  const artifactDir = 'C:/Users/Doston/.gemini/antigravity-ide/brain/8c176676-cf61-460f-9f09-b442047428a8';
  const outputPath = path.join(artifactDir, 'SAPAR_ERP_Uzbekistan_Client_Presentation.pdf');

  // Convert images to base64 for reliable self-contained PDF rendering
  const toBase64 = (filename) => {
    const filePath = path.join(artifactDir, filename);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath);
      return `data:image/png;base64,${data.toString('base64')}`;
    }
    return '';
  };

  const imgAuth = toBase64('sapar_pdf_01_auth.png');
  const imgDashboard = toBase64('sapar_pdf_02_dashboard.png');
  const imgCoa = toBase64('sapar_pdf_03_coa.png');
  const imgJournals = toBase64('sapar_pdf_04_journals.png');
  const imgContras = toBase64('sapar_pdf_05_contras.png');
  const imgReports = toBase64('sapar_pdf_06_reports_hub.png');
  const imgSoliq = toBase64('sapar_pdf_07_soliq_qqs.png');

  const htmlContent = `
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>SAPAR ERP — Oʻzbekiston Buxgalteriya Platformasi</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    body {
      background: #f8fafc;
      color: #0f172a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm 18mm;
      margin: 0 auto 10mm auto;
      background: #ffffff;
      page-break-after: always;
      position: relative;
      overflow: hidden;
    }

    @page {
      size: A4 portrait;
      margin: 0;
    }

    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: linear-gradient(145deg, #042f2e 0%, #0f172a 100%);
      color: #ffffff;
      padding: 25mm 20mm;
    }

    .badge-national {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 9999px;
      background: rgba(2, 195, 154, 0.15);
      border: 1px solid rgba(2, 195, 154, 0.4);
      color: #02c39a;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      width: fit-content;
    }

    .cover-title {
      font-size: 32px;
      font-weight: 900;
      line-height: 1.2;
      letter-spacing: -0.5px;
      margin-top: 15px;
    }

    .cover-subtitle {
      font-size: 15px;
      color: #94a3b8;
      margin-top: 12px;
      line-height: 1.6;
      max-width: 540px;
    }

    .cover-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-top: 25px;
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 14px;
    }

    .feature-card h4 {
      font-size: 13px;
      color: #02c39a;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .feature-card p {
      font-size: 11px;
      color: #cbd5e1;
      line-height: 1.4;
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 2px solid #f1f5f9;
      margin-bottom: 16px;
    }

    .header-logo {
      font-size: 16px;
      font-weight: 900;
      color: #0f172a;
    }

    .header-logo span {
      color: #028090;
    }

    .header-tag {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .section-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.3px;
      margin-bottom: 6px;
    }

    .section-desc {
      font-size: 11.5px;
      color: #64748b;
      line-height: 1.5;
      margin-bottom: 14px;
    }

    .screenshot-frame {
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.07);
      margin-bottom: 14px;
      background: #f8fafc;
    }

    .screenshot-frame img {
      width: 100%;
      display: block;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-top: 10px;
    }

    .bullet-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 12px;
    }

    .bullet-box strong {
      display: block;
      font-size: 11px;
      color: #028090;
      margin-bottom: 3px;
    }

    .bullet-box span {
      font-size: 10.5px;
      color: #475569;
      line-height: 1.4;
    }

    .footer-bar {
      position: absolute;
      bottom: 12mm;
      left: 18mm;
      right: 18mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 8px;
    }

    .table-spec {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      margin-top: 10px;
    }

    .table-spec th {
      background: #042f2e;
      color: #ffffff;
      padding: 8px 10px;
      text-align: left;
      font-weight: 600;
    }

    .table-spec td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }

    .table-spec tr:nth-child(even) {
      background: #f8fafc;
    }
  </style>
</head>
<body>

  <!-- PAGE 1: COVER -->
  <div class="page cover-page">
    <div>
      <div class="badge-national">
        🇺🇿 Oʻzbekiston Respublikasi Milliy Standartlari
      </div>
      <div style="margin-top: 35px;">
        <div style="font-size: 20px; font-weight: 900; color: #02c39a; letter-spacing: 1px;">SAPAR ERP</div>
        <h1 class="cover-title">
          Buxgalteriya, Moliya va Soliq Hisobotlari Platformasi
        </h1>
        <p class="cover-subtitle">
          Korxonalar va professional buxgalterlar uchun 21-son BHMS, Davlat Soliq Qoʻmitasi (Soliq.uz) deklaratsiyalari va E-IMZO raqamli imzosi bilan toʻliq integratsiyalashgan zamonaviy ERP tizimi.
        </p>
      </div>

      <div class="cover-grid">
        <div class="feature-card">
          <h4>🏛️ 21-son BHMS Standarti</h4>
          <p>Milliy hisoblar rejasi, Bosh kitob, 1-shakl Balans, 2-shakl P&L va avtomatik buxgalteriya provodkalari.</p>
        </div>
        <div class="feature-card">
          <h4>📊 Davlat Soliq (Soliq.uz)</h4>
          <p>12% QQS (10006_29), 12% JShODS & Ijtimoiy soliq (11101_14) va 4% Aylanma soliq hisobotlari.</p>
        </div>
        <div class="feature-card">
          <h4>🔑 E-IMZO & Flash Kalit</h4>
          <p>USB e-Kalit, .pfx fayllari va mobil QR-kod orqali parolsiz, 1 bosishda xavfsiz autentifikatsiya.</p>
        </div>
        <div class="feature-card">
          <h4>⚡ Vzaimozachet & Akt Sverki</h4>
          <p>Mijoz va yetkazib beruvchi oʻrtasidagi oʻzaro qarzdorlikni toʻlovsiz qoplash va E-Hujjatlar aylanmasi.</p>
        </div>
      </div>
    </div>

    <div style="border-top: 1px solid rgba(255,255,255,0.15); padding-top: 15px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #94a3b8;">
      <div>Taqdimot: <strong>Mijozlar va Hamkorlar uchun</strong></div>
      <div>Versiya: <strong>SAPAR ERP v2.9 (2026)</strong></div>
    </div>
  </div>

  <!-- PAGE 2: DASHBOARD & KPIS -->
  <div class="page">
    <div class="header-bar">
      <div class="header-logo">SAPAR<span>.ERP</span></div>
      <div class="header-tag">01 / Boshqaruv Paneli</div>
    </div>

    <h2 class="section-title">Moliyaviy Boshqaruv Paneli (Executive Dashboard)</h2>
    <p class="section-desc">
      Rahbar va bosh buxgalter uchun korxonaning barcha moliyaviy oqimlari, bank hisobvaraqlari qoldiqlari, debitorlik va kreditorlik koʻrsatkichlari real vaqt rejimida yagona ekranda aks etadi.
    </p>

    <div class="screenshot-frame">
      <img src="${imgDashboard}" alt="SAPAR Dashboard" />
    </div>

    <div class="grid-2">
      <div class="bullet-box">
        <strong>⚡ Bank va Kassa Balansi</strong>
        <span>Ipak Yoʻli Bank, Kapitalbank, Milliy Bank va kassa qoldiqlari toʻliq avtomatlashtirilgan.</span>
      </div>
      <div class="bullet-box">
        <strong>📈 Kirim va Chiqim Dinamikasi</strong>
        <span>Oylik sof tushum, xarajatlar va rentabellik grafiklari real buxgalteriya yozuvlari asosida tuziladi.</span>
      </div>
    </div>

    <div class="footer-bar">
      <span>SAPAR ERP — Oʻzbekiston Buxgalteriya Standartlari</span>
      <span>2-bet</span>
    </div>
  </div>

  <!-- PAGE 3: CHART OF ACCOUNTS & JOURNALS -->
  <div class="page">
    <div class="header-bar">
      <div class="header-logo">SAPAR<span>.ERP</span></div>
      <div class="header-tag">02 / Buxgalteriya Hisobi</div>
    </div>

    <h2 class="section-title">21-son BHMS Hisoblar Rejasi va Provodkalar</h2>
    <p class="section-desc">
      Oʻzbekiston Respublikasi buxgalteriya hisobining milliy standarti boʻyicha barcha aktiv, majburiyat, kapital, daromad va xarajat hisoblari integratsiya qilingan.
    </p>

    <div class="screenshot-frame">
      <img src="${imgCoa}" alt="Chart of Accounts" />
    </div>

    <div class="screenshot-frame">
      <img src="${imgJournals}" alt="Journal Entries" />
    </div>

    <div class="grid-2">
      <div class="bullet-box">
        <strong>📋 Debet va Kredit Muvozanati</strong>
        <span>Avtomatik balanslash, koʻp qatorli provodkalar va valyuta kurslari qayta baholanishi.</span>
      </div>
      <div class="bullet-box">
        <strong>🔍 Bosh Kitob va Oborotka</strong>
        <span>Har bir hisob boʻyicha boshlangʻich qoldiq, davr aylanmasi va yakuniy qoldiqlar yuritiladi.</span>
      </div>
    </div>

    <div class="footer-bar">
      <span>SAPAR ERP — Oʻzbekiston Buxgalteriya Standartlari</span>
      <span>3-bet</span>
    </div>
  </div>

  <!-- PAGE 4: CONTRAS & RECONCILIATION -->
  <div class="page">
    <div class="header-bar">
      <div class="header-logo">SAPAR<span>.ERP</span></div>
      <div class="header-tag">03 / Oʻzaro Hisob-kitoblar</div>
    </div>

    <h2 class="section-title">Oʻzaro Hisob-kitoblarni Qoplash (Vzaimozachet / Contras)</h2>
    <p class="section-desc">
      Bir vaqtning oʻzida ham mijoz, ham yetkazib beruvchi boʻlgan hamkorlar bilan toʻlanmagan hisob-fakturalarni toʻlovsiz qoplash va tegishli provodkalarni avtomatik oʻtkazish tizimi.
    </p>

    <div class="screenshot-frame">
      <img src="${imgContras}" alt="Contras List" />
    </div>

    <table class="table-spec">
      <thead>
        <tr>
          <th>Operatsiya Turi</th>
          <th>Debet Hisobi</th>
          <th>Kredit Hisobi</th>
          <th>Avtomatlashtirish</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Yetkazib beruvchi / Xaridor qoplami</strong></td>
          <td>6010 (Kreditorlik)</td>
          <td>4010 (Debitorlik)</td>
          <td>1 bosishda hisob-fakturalarni yopish</td>
        </tr>
        <tr>
          <td><strong>Solishtirma Dalolatnoma (Akt sverki)</strong></td>
          <td>Davriy aylanma</td>
          <td>Yakuniy saldo</td>
          <td>E-IMZO orqali ikki tomonlama imzo</td>
        </tr>
        <tr>
          <td><strong>Elektron Ishonchnoma (Doverennost)</strong></td>
          <td>M-2 / M-2a shakl</td>
          <td>Tovarni qabul qilish</td>
          <td>QR-kodli raqamli muhr bilan</td>
        </tr>
      </tbody>
    </table>

    <div class="footer-bar">
      <span>SAPAR ERP — Oʻzbekiston Buxgalteriya Standartlari</span>
      <span>4-bet</span>
    </div>
  </div>

  <!-- PAGE 5: SOLIQ REPORTS & FINANCIAL HUB -->
  <div class="page">
    <div class="header-bar">
      <div class="header-logo">SAPAR<span>.ERP</span></div>
      <div class="header-tag">04 / Davlat Soliq Hisobotlari</div>
    </div>

    <h2 class="section-title">Davlat Soliq Qoʻmitasi (Soliq.uz) & Moliyaviy Hub</h2>
    <p class="section-desc">
      Oylik va choraklik Davlat soliq organlariga topshiriladigan rasmiy hisobotlar birlamchi buxgalteriya hujjatlari asosida 1 bosishda toʻliq shakllanadi.
    </p>

    <div class="screenshot-frame">
      <img src="${imgReports}" alt="Reports Hub" />
    </div>

    <div class="screenshot-frame">
      <img src="${imgSoliq}" alt="Soliq QQS Report" />
    </div>

    <div class="grid-2">
      <div class="bullet-box">
        <strong>📑 1-shakl Balans & 2-shakl P&L</strong>
        <span>Statistika va Soliq organlariga taqdim etiladigan rasmiy davlat moliyaviy hisobotlari.</span>
      </div>
      <div class="bullet-box">
        <strong>🏛️ QQS 12% Deklaratsiyasi</strong>
        <span>Sotuv va xarid hisob-fakturalari asosida avtomatik hisoblangan va hisobga olinadigan QQS summasi.</span>
      </div>
    </div>

    <div class="footer-bar">
      <span>SAPAR ERP — Oʻzbekiston Buxgalteriya Standartlari</span>
      <span>5-bet</span>
    </div>
  </div>

  <!-- PAGE 6: SECURITY & MULTI-FACTOR AUTH -->
  <div class="page">
    <div class="header-bar">
      <div class="header-logo">SAPAR<span>.ERP</span></div>
      <div class="header-tag">05 / Xavfsizlik va Autentifikatsiya</div>
    </div>

    <h2 class="section-title">Oʻzbekiston Milliy E-IMZO va Telefon SMS Kirish</h2>
    <p class="section-desc">
      Foydalanuvchilar va buxgalterlar uchun xavfsiz, qulay va tezkor kirish mexanizmlari:
    </p>

    <div class="screenshot-frame" style="max-height: 180mm;">
      <img src="${imgAuth}" alt="E-IMZO and Phone Auth" />
    </div>

    <div class="grid-2" style="margin-top: 15px;">
      <div class="bullet-box">
        <strong>🔑 E-IMZO USB Flash / e-Kalit</strong>
        <span>127.0.0.1:64443 orqali kompyuterdagi USB e-token va .pfx sertifikatlarini avtomatik aniqlash va imzolash.</span>
      </div>
      <div class="bullet-box">
        <strong>📱 Telefon SMS OTP (+998)</strong>
        <span>Eskiz.uz va PlayMobile shlyuzlari orqali 6 xonali SMS kod bilan parolsiz tezkor autentifikatsiya.</span>
      </div>
      <div class="bullet-box">
        <strong>📲 Mobil E-IMZO (QR Kod)</strong>
        <span>Telefon ilovasi orqali ekrandagi dinamik QR-kodni skanerlab darhol tizimga kirish.</span>
      </div>
      <div class="bullet-box">
        <strong>🔒 256-bit Shifrlash & Xavfsizlik</strong>
        <span>Barcha maʼlumotlar shifrlangan va Oʻzbekiston qonunchiligiga toʻliq mos ravishda saqlanadi.</span>
      </div>
    </div>

    <div class="footer-bar">
      <span>SAPAR ERP — Oʻzbekiston Buxgalteriya Standartlari</span>
      <span>6-bet</span>
    </div>
  </div>

</body>
</html>
  `;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  });

  await browser.close();
  console.log(`✅ Client Presentation PDF successfully created at: ${outputPath}`);
}

generateClientPdf().catch(console.error);
