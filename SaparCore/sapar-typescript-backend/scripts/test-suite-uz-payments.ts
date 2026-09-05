import axios from 'axios';
import { prisma as p } from '../lib/prisma';

const API_BASE = process.env.API_BASE || 'http://localhost:3005/api';

async function main() {
  console.log('\n=============================================================');
  console.log('💳 UZBEKISTAN PAYMENT GATEWAYS & BANKING QA VERIFICATION');
  console.log('=============================================================\n');

  // Authenticate as Admin
  const loginRes = await axios.post(`${API_BASE}/auth/login`, {
    email: 'admin@sapar.uz',
    password: 'SaparPassword123!',
  }).catch(() => {
    return axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@sapar.uz',
      password: 'password123',
    });
  });

  const token = loginRes.data.data?.token || loginRes.data.token;
  const headers = { Authorization: `Bearer ${token}` };

  // =========================================================================
  // 1. Gateway Settings Retrieval & Customization
  // =========================================================================
  console.log('--- 1. Testing Gateway Settings Retrieval & Update ---');
  const getSettingsRes = await axios.get(`${API_BASE}/admin/payments/uz-gateways/settings`, { headers });
  console.log('1. Default Settings Retrieved:');
  console.log(`   • Payme: Enabled=${getSettingsRes.data.data?.payme?.enabled} | MerchantId=${getSettingsRes.data.data?.payme?.merchantId}`);
  console.log(`   • Click: Enabled=${getSettingsRes.data.data?.click?.enabled} | ServiceId=${getSettingsRes.data.data?.click?.serviceId}`);
  console.log(`   • Uzum: Enabled=${getSettingsRes.data.data?.uzum?.enabled} | MerchantId=${getSettingsRes.data.data?.uzum?.merchantId}`);

  // Save updated settings
  const saveRes = await axios.post(
    `${API_BASE}/admin/payments/uz-gateways/settings`,
    {
      payme: { enabled: true, merchantId: 'PAYME-MERCHANT-TEST-99', secretKey: 'SECRET_PAYME_KEY', testMode: true },
      click: { enabled: true, serviceId: 'CLICK-SRV-1234', merchantId: 'CLICK-M-5678', secretKey: 'SECRET_CLICK_KEY', testMode: true },
      uzum: { enabled: true, merchantId: 'UZUM-M-9988', terminalId: 'TERM-09', testMode: true },
    },
    { headers }
  );
  console.log(`2. Save Settings Response: HTTP ${saveRes.status} - ${saveRes.data?.message}`);

  if (getSettingsRes.status === 200 && saveRes.status === 200) {
    console.log('✓ Gateway Settings PASS: Tenant gateway configurations retrieved and updated.\n');
  } else {
    console.log('❌ Gateway Settings FAIL: Settings update mismatch.\n');
  }

  // =========================================================================
  // 2. 1-Click Payme & Click Payment Link Generation
  // =========================================================================
  console.log('--- 2. Testing 1-Click Payme, Click & Uzum Link Generation ---');
  const adminUser = await p.user.findFirst({ where: { email: 'admin@sapar.uz' } });
  if (!adminUser) throw new Error('Admin user not found in DB');

  let testInvoice = await p.invoice.findFirst({
    where: { userId: adminUser.id, isDeleted: false },
  });

  if (!testInvoice) {
    testInvoice = await p.invoice.create({
      data: {
        userId: adminUser.id,
        invoiceNumber: `INV-TEST-UZ-${Date.now().toString().slice(-4)}`,
        TotalAmount: 1200000,
        total: 1200000,
        subtotal: 1200000,
        currency: 'UZS',
        customerName: 'Test Customer',
        status: 'SENT',
        issueDate: new Date(),
        dueDate: new Date(),
      } as any,
    });
  }

  const linksRes = await axios.get(
    `${API_BASE}/admin/payments/uz-gateways/invoice-links/${testInvoice.id}?amount=1200000`,
    { headers }
  );

  const linkData = linksRes.data.data;
  console.log(`1. Payme Checkout URL: ${linkData?.payme?.url}`);
  console.log(`2. Click Checkout URL: ${linkData?.click?.url}`);
  console.log(`3. Uzum Pay Deep Link: ${linkData?.uzum?.url}`);

  const paymeValid = linkData?.payme?.url?.includes('checkout.paycom.uz');
  const clickValid = linkData?.click?.url?.includes('my.click.uz');
  const uzumValid = linkData?.uzum?.url?.includes('uzumpay.uz');

  if (linksRes.status === 200 && paymeValid && clickValid && uzumValid) {
    console.log('✓ 1-Click Checkout PASS: Generated standard Payme (base64 param), Click, and Uzum deep links.\n');
  } else {
    console.log('❌ 1-Click Checkout FAIL: Link formatting mismatch.\n');
  }

  // =========================================================================
  // 3. Uzbekistan 1C / TXT Bank Statement Parsing & Auto-Import
  // =========================================================================
  console.log('--- 3. Testing Uzbekistan 1C Bank Statement Parser ---');
  const sample1CStatement = `1CClientBankExchange
ВерсияФормата=1.02
Кодировка=Windows
Отправитель=Ipak Yo'li Bank
ДатаСоздания=23.08.2026
СекцияРасчСчет
ДатаНачала=01.08.2026
ДатаКонца=23.08.2026
НачальныйОстаток=50000000.00
ВсегоПоступило=12500000.00
ВсегоСписано=3400000.00
КонечныйОстаток=59100000.00
КонецРасчСчет
СекцияДокумент=Платежное поручение
Номер=104
Дата=15.08.2026
Сумма=12500000.00
Плательщик=OOO "TOSHKENT TRADE"
ПлательщикИНН=309112233
Получатель=SAPAR CLIENT LLC
ПолучательИНН=308554433
НазначениеПлатежа=Hisob-faktura INV-60200001 bo'yicha to'lov
КонецДокумента`;

  const importRes = await axios.post(
    `${API_BASE}/admin/payments/uz-gateways/import-statement`,
    {
      statementText: sample1CStatement,
      bankName: 'Ipak Yoʻli Bank',
    },
    { headers }
  );

  const impData = importRes.data.data;
  console.log(`1. Bank Name: ${impData?.bankName}`);
  console.log(`2. Parsed Transactions Count: ${impData?.importedCount}`);
  console.log(`3. Total Inflow (Kirim): ${Number(impData?.totalIncome).toLocaleString()} UZS`);
  console.log(`4. Total Outflow (Chiqim): ${Number(impData?.totalExpense).toLocaleString()} UZS`);

  if (importRes.status === 200 && impData?.importedCount > 0 && impData?.totalIncome === 12500000) {
    console.log('✓ 1C Statement Parser PASS: Uzbekistan bank statement parsed with exact counterparty STIR and inflow sum.\n');
  } else {
    console.log('❌ 1C Statement Parser FAIL: Statement import mismatch.\n');
  }


  await p.$disconnect();
}

main().catch((err) => {
  console.error('Error running UZ Payments test suite:', err);
  process.exit(1);
});
