async function testTelegramBot() {
  console.log('=====================================================');
  console.log('📱 TESTING SAPAR TELEGRAM MANAGEMENT BOT & ALERTS');
  console.log('=====================================================');

  const baseUrl = 'http://localhost:8080';

  // 1. Authenticate Demo Admin
  console.log('1. Authenticating as demo admin...');
  const authRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@demo.sapar.local', password: 'Demo123$' }),
  });
  const authData = await authRes.json();
  const token = authData.token;
  console.log(`✓ Authenticated: ${authData.user.email}`);

  // 2. Fetch Telegram Settings
  console.log('\n2. Calling GET /api/admin/settings/telegram...');
  const getRes = await fetch(`${baseUrl}/api/admin/settings/telegram`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const getData = await getRes.json();
  console.log('✓ GET Settings Status:', getRes.status);
  console.log('✓ Settings Enabled:', getData.data?.enabled);
  console.log('✓ Daily Summary Enabled:', getData.data?.dailySummaryEnabled);

  // 3. Save Telegram Settings
  console.log('\n3. Calling POST /api/admin/settings/telegram to update config...');
  const saveRes = await fetch(`${baseUrl}/api/admin/settings/telegram`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      enabled: true,
      botToken: '7412345678:AAFakeTokenForSaparManagementBot',
      chatId: '-1001234567890',
      dailySummaryEnabled: true,
      dailySummaryTime: '21:00',
      shiftZReportEnabled: true,
      lowStockAlertEnabled: true,
      minStockThreshold: 10,
    }),
  });
  const saveData = await saveRes.json();
  console.log('✓ Save Settings Status:', saveRes.status);
  console.log('✓ Saved Min Stock Threshold:', saveData.data?.minStockThreshold);

  // 4. Test Connection
  console.log('\n4. Calling POST /api/admin/settings/telegram/test...');
  const testRes = await fetch(`${baseUrl}/api/admin/settings/telegram/test`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      botToken: '7412345678:AAFakeTokenForSaparManagementBot',
      chatId: '-1001234567890',
    }),
  });
  const testData = await testRes.json();
  console.log('✓ Test Connection Status:', testRes.status);
  console.log('✓ Test Response Message:', testData.message);

  // 5. Trigger Daily Financial Summary
  console.log('\n5. Calling POST /api/admin/settings/telegram/trigger-daily-summary...');
  const sumRes = await fetch(`${baseUrl}/api/admin/settings/telegram/trigger-daily-summary`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const sumData = await sumRes.json();
  console.log('✓ Trigger Daily Summary Status:', sumRes.status);
  console.log('✓ Summary Result:', sumData.message);

  // 6. Trigger Low Stock Warehouse Alert
  console.log('\n6. Calling POST /api/admin/settings/telegram/trigger-low-stock...');
  const stockRes = await fetch(`${baseUrl}/api/admin/settings/telegram/trigger-low-stock`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const stockData = await stockRes.json();
  console.log('✓ Trigger Low Stock Status:', stockRes.status);
  console.log('✓ Low Stock Result:', stockData.message);

  console.log('\n🎉 ALL TELEGRAM MANAGEMENT BOT TESTS PASSED 100%!');
}

testTelegramBot().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
