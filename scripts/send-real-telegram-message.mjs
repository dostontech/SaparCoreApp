async function sendRealTelegram() {
  const token = '8910237594:AAF2wO2WF6jvCKhDVfY_mN1FcjyrkvB6iYw';

  console.log('1. Checking getUpdates on bot @SaparBizOS_bot...');
  const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
  const data = await res.json();
  console.log('getUpdates result:', JSON.stringify(data, null, 2));

  let chatId = null;
  let userName = '';

  if (data.result && data.result.length > 0) {
    const lastUpdate = data.result[data.result.length - 1];
    chatId = lastUpdate.message?.chat?.id || lastUpdate.channel_post?.chat?.id;
    userName = lastUpdate.message?.from?.first_name || lastUpdate.message?.from?.username || '';
    console.log(`Found chatId: ${chatId} (${userName})`);
  }

  // If not found from getUpdates, let's try sending to @hi_doston or ask user to click Start
  if (!chatId) {
    console.log('No recent updates found yet. Attempting to send to @hi_doston...');
    chatId = '@hi_doston';
  }

  // 2. Save into SAPAR tenant settings via API
  const baseUrl = 'http://localhost:8080';
  const authRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@demo.sapar.local', password: 'Demo123$' }),
  });
  const authData = await authRes.json();
  const jwtToken = authData.token;

  console.log('2. Saving real token into SAPAR settings...');
  const saveRes = await fetch(`${baseUrl}/api/admin/settings/telegram`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      enabled: true,
      botToken: token,
      chatId: String(chatId),
      dailySummaryEnabled: true,
      dailySummaryTime: '21:00',
      shiftZReportEnabled: true,
      lowStockAlertEnabled: true,
      minStockThreshold: 10,
    }),
  });
  const saveData = await saveRes.json();
  console.log('Save result:', saveData);

  // 3. Send direct real message via Telegram Bot API
  console.log('3. Sending Store Owner Daily Financial Summary to Telegram...');
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().slice(0, 5);

  const messageHtml = `
<b>SAPAR ERP — KUNLIK MOLIYA XULOSASI</b>
Korxona: <b>"SAMARQAND STROY MARKET" MCHJ</b>
Sana: <b>${dateStr}</b> (Vaqt: ${timeStr})
----------------------------------------
<b>Savdo va Daromad Koʻrsatkichlari:</b>
• Jami sotuv hajmi: <b>38,450,000 UZS</b> (42 ta xarid)
• Naqd pul tushumi: <b>21,200,000 UZS</b>
• Karta (Uzcard / Humo): <b>12,800,000 UZS</b>
• Hisob-raqam (Bank): <b>3,000,000 UZS</b>
• Nasiya (Qarzdorlik): <b>1,450,000 UZS</b>
----------------------------------------
<b>Xarajatlar va Sof Natija:</b>
• Kunlik operatsion xarajat: <b>4,200,000 UZS</b>
• Kunlik sof foyda: <b>+34,250,000 UZS</b>
----------------------------------------
Hisobot shakllantirildi: <b>SAPAR Cloud ERP</b>
`;

  const sendRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: messageHtml.trim(),
      parse_mode: 'HTML',
    }),
  });

  const sendData = await sendRes.json();
  console.log('Telegram API direct send response:', sendData);
}

sendRealTelegram().catch(console.error);
