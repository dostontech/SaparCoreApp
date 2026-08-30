async function sendAllThree() {
  const token = '8910237594:AAF2wO2WF6jvCKhDVfY_mN1FcjyrkvB6iYw';
  const chatId = '7676609522';

  // 1. Send Cashier Shift Z-Report
  const zReportHtml = `
<b>SAPAR POS — KASSIR Z-HISOBOTI (SMENA YOPILDI)</b>
Smena kodi: <b>SHIFT-0042</b>
Kassir: <b>Rustam Aliyev</b>
Ochilgan: 2026-08-26 08:30
Yopilgan: 2026-08-26 20:45
----------------------------------------
<b>Smena Tushumi Tafsiloti:</b>
• Boshlangʻich kassa qoldigʻi: <b>1,000,000 UZS</b>
• Naqd pul savdosi: <b>18,500,000 UZS</b>
• Terminal (Uzcard / Humo): <b>11,200,000 UZS</b>
• Nasiya (Qarzga berildi): <b>950,000 UZS</b>
• Jami savdo aylanmasi: <b>30,650,000 UZS</b> (36 ta chek)
----------------------------------------
<b>Kassa Sanoqi va Sverka:</b>
• Kutilgan naqd pul: <b>19,500,000 UZS</b>
• Haqiqiy sanalgan naqd: <b>19,500,000 UZS</b>
• Farq: <b>0 UZS (Aniq / Kamomad yoʻq)</b>
----------------------------------------
Status: <b>Smena yopildi va balansga olindi</b>
`;

  console.log('Sending Z-Report to Telegram...');
  const res1 = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: zReportHtml.trim(), parse_mode: 'HTML' }),
  });
  console.log('Z-Report result:', (await res1.json()).ok);

  // 2. Send Low Stock Alert
  const lowStockHtml = `
<b>SAPAR OMBOR OGOHLANTIRISHI — QOLDIQ KAMAYDI</b>
Vaqt: <b>2026-08-26 23:22</b>
----------------------------------------
Quyidagi tovarlar minimal meʼyordan kam qoldi (3 ta tovar):

• <b>Sement M-500 (50kg)</b>: Qoldiq: <b>8 qop</b> (Minimal meʼyor: 30 qop)
• <b>Armatura 12mm</b>: Qoldiq: <b>45 metr</b> (Minimal meʼyor: 200 metr)
• <b>Gipsokarton Knauf 9.5mm</b>: Qoldiq: <b>4 list</b> (Minimal meʼyor: 25 list)
----------------------------------------
Iltimos, taʼminotchilarga yangi Xarid Buyurtmasi shakllantiring.
Tizim: <b>SAPAR Ombor Boshqaruvi</b>
`;

  console.log('Sending Low Stock Alert to Telegram...');
  const res2 = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: lowStockHtml.trim(), parse_mode: 'HTML' }),
  });
  console.log('Low Stock Alert result:', (await res2.json()).ok);
}

sendAllThree().catch(console.error);
