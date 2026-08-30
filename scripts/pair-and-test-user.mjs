async function pairAndTest() {
  const baseUrl = 'http://localhost:8080';

  console.log('1. Authenticating as demo admin...');
  const authRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@demo.sapar.local', password: 'Demo123$' }),
  });
  const authData = await authRes.json();
  const token = authData.token;

  console.log('2. Pairing tenant with Telegram ID: @hi_doston...');
  const pairRes = await fetch(`${baseUrl}/api/admin/settings/telegram/pair-direct`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ chatIdOrUsername: '@hi_doston' }),
  });
  const pairData = await pairRes.json();
  console.log('Pairing result:', pairData);

  console.log('\n3. Triggering Daily Financial Summary for store owner...');
  const sumRes = await fetch(`${baseUrl}/api/admin/settings/telegram/trigger-daily-summary`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const sumData = await sumRes.json();
  console.log('Daily Summary result:', sumData);

  console.log('\n4. Triggering Low Stock Alert for store owner...');
  const stockRes = await fetch(`${baseUrl}/api/admin/settings/telegram/trigger-low-stock`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const stockData = await stockRes.json();
  console.log('Low Stock Alert result:', stockData);
}

pairAndTest().catch(console.error);
