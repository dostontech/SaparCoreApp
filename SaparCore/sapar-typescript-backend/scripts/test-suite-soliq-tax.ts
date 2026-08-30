import axios from 'axios';
import { prisma as p } from '../lib/prisma';

const API_BASE = 'http://localhost:3001/api';

async function main() {
  console.log('\n=============================================================');
  console.log('🏛️ UZBEKISTAN SOLIQ TAX REPORTING & E-IMZO QA VERIFICATION');
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
  // 1. Soliq QQS (12% VAT) Monthly Declaration (Form 10006_29)
  // =========================================================================
  console.log('--- 1. Testing Soliq QQS Monthly Declaration (Form 10006_29) ---');
  const qqsRes = await axios.get(`${API_BASE}/admin/reports/soliq-qqs`, { headers });
  const qqsData = qqsRes.data.data;

  console.log(`1. QQS Form Code: ${qqsData?.formCode} | Tax: ${qqsData?.taxType}`);
  console.log(`2. Summary: Outward Turnover = ${Number(qqsData?.summary?.totalOutwardTurnover).toLocaleString()} UZS | Output VAT = ${Number(qqsData?.summary?.calculatedOutputVat).toLocaleString()} UZS`);
  console.log(`3. Soliq Boxes Count: ${qqsData?.soliqBoxes?.length} rows (Rows 010 through 070)`);

  if (qqsRes.status === 200 && qqsData?.formCode === '10006_29' && qqsData?.soliqBoxes?.length >= 7) {
    console.log('✓ Form 10006_29 PASS: QQS monthly tax return generated with official Soliq box breakdown.\n');
  } else {
    console.log('❌ Form 10006_29 FAIL: QQS generation mismatch.\n');
  }

  // =========================================================================
  // 2. Soliq JShODS & Ijtimoiy Soliq Declaration (Form 11101_14)
  // =========================================================================
  console.log('--- 2. Testing Soliq JShODS & Ijtimoiy Soliq Declaration (Form 11101_14) ---');
  const jshodsRes = await axios.get(`${API_BASE}/admin/reports/soliq-jshods`, { headers });
  const jshodsData = jshodsRes.data.data;

  console.log(`1. JShODS Form Code: ${jshodsData?.formCode} | Tax: ${jshodsData?.taxType}`);
  console.log(`2. Payroll Fund (MHTF): ${Number(jshodsData?.summary?.grossPayrollFund).toLocaleString()} UZS`);
  console.log(`3. JShODS 12% = ${Number(jshodsData?.summary?.incomeTaxSum).toLocaleString()} UZS | Social Tax 12% = ${Number(jshodsData?.summary?.socialTaxSum).toLocaleString()} UZS | INPS 0.1% = ${Number(jshodsData?.summary?.inpsPensionSum).toLocaleString()} UZS`);
  console.log(`4. Soliq Boxes Count: ${jshodsData?.soliqBoxes?.length} rows (Rows 010 through 080)`);

  if (jshodsRes.status === 200 && jshodsData?.formCode === '11101_14' && jshodsData?.soliqBoxes?.length >= 8) {
    console.log('✓ Form 11101_14 PASS: JShODS & Ijtimoiy soliq payroll return generated.\n');
  } else {
    console.log('❌ Form 11101_14 FAIL: JShODS generation mismatch.\n');
  }

  // =========================================================================
  // 3. Soliq Aylanmadan Olinadigan Soliq 4% (Form 10104_18)
  // =========================================================================
  console.log('--- 3. Testing Soliq Turnover Tax 4% Declaration (Form 10104_18) ---');
  const aylanmaRes = await axios.get(`${API_BASE}/admin/reports/soliq-aylanma`, { headers });
  const aylanmaData = aylanmaRes.data.data;

  console.log(`1. Turnover Tax Form Code: ${aylanmaData?.formCode} | Tax: ${aylanmaData?.taxType}`);
  console.log(`2. Gross Revenue = ${Number(aylanmaData?.summary?.grossRevenue).toLocaleString()} UZS | Rate = ${aylanmaData?.taxRatePercent}% | Soliq = ${Number(aylanmaData?.summary?.calculatedTaxSum).toLocaleString()} UZS`);
  console.log(`3. Soliq Boxes Count: ${aylanmaData?.soliqBoxes?.length} rows`);

  if (aylanmaRes.status === 200 && aylanmaData?.formCode === '10104_18' && aylanmaData?.taxRatePercent === 4) {
    console.log('✓ Form 10104_18 PASS: Turnover tax 4% declaration generated cleanly.\n');
  } else {
    console.log('❌ Form 10104_18 FAIL: Turnover tax generation mismatch.\n');
  }

  // =========================================================================
  // 4. Submit Soliq Declaration with E-IMZO PKCS#7 Digital Signature
  // =========================================================================
  console.log('--- 4. Testing Soliq Declaration E-IMZO PKCS#7 Submission ---');
  const submitRes = await axios.post(
    `${API_BASE}/admin/reports/soliq-submit`,
    {
      formCode: '10006_29',
      period: '2026-yil Avgust',
      payload: qqsData,
      pkcs7Signature: 'MIAGCSqGSIb3DQEHAqCAMIACAQExDzANBglghkgBZQMEAgEFADCABgkqhkiG9w0BBwEAAKCAMIIC...TEST_PKCS7_SIGNATURE',
      certInfo: {
        commonName: 'RAHIMOVA AZIZA BOTIROVNA (Bosh Buxgalter)',
        tin: '309876543',
        pinfl: '31204956780012',
      },
    },
    { headers }
  );

  const submitData = submitRes.data.data;
  console.log(`1. Submission Status: ${submitData?.protocol?.status} | Protocol №: ${submitData?.protocol?.regNumber}`);
  console.log(`2. Signer: ${submitData?.protocol?.signer} | STIR: ${submitData?.protocol?.tin} | PINFL: ${submitData?.protocol?.pinfl}`);
  console.log(`3. Soliq QR Verification Link: ${submitData?.protocol?.soliqQrCodeUrl}`);

  if (submitRes.status === 200 && submitData?.protocol?.status === 'ACCEPTED' && submitData?.protocol?.regNumber) {
    console.log('✓ Soliq E-IMZO Submission PASS: Digital declaration accepted with official registration protocol.\n');
  } else {
    console.log('❌ Soliq E-IMZO Submission FAIL: Submission failed.\n');
  }

  await p.$disconnect();
}

main().catch((err) => {
  console.error('Error running Soliq Tax Reporting test suite:', err);
  process.exit(1);
});
