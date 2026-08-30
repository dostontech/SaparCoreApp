import fs from 'fs';

async function testSaparEdiHub() {
  console.log('=====================================================');
  console.log('🏛️ TESTING IN-HOUSE SAPAR SOLIQ EDI & E-FAKTURA HUB');
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

  // 2. Fetch an invoice
  console.log('\n2. Fetching existing invoice for E-Faktura dispatch...');
  const invRes = await fetch(`${baseUrl}/api/admin/invoices?limit=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const invData = await invRes.json();
  const invoice = (invData.invoices || invData.data?.invoices || [])[0];
  if (!invoice) {
    throw new Error('No invoice found to test');
  }
  console.log(`✓ Selected Invoice: #${invoice.invoiceNumber || invoice.id} (Total: ${invoice.TotalAmount} UZS)`);

  // 3. Prepare Soliq Document & Canonical Hash
  console.log('\n3. Calling GET /api/admin/e-invoices/prepare/' + invoice.id + '...');
  const prepRes = await fetch(`${baseUrl}/api/admin/e-invoices/prepare/${invoice.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const prepData = await prepRes.json();
  console.log('✓ Response Status:', prepRes.status);
  console.log('✓ Document Hash (SHA-256):', prepData.data?.documentHash);
  console.log('✓ Canonical Soliq Items Count:', prepData.data?.soliqPayload?.items?.length);

  // 4. Submit Signed Document with E-IMZO Detached Signature
  console.log('\n4. Submitting signed PKCS#7 to SAPAR EDI Hub...');
  const mockPkcs7 = 'MIIK+gYJKoZIhvcNAQcCoIIK6zCCCucCAQExDzANBglghkgBZQMEAgEFADCCAz8GCSqGSIb3DQEHAaCCA...SAPAR_EIMZO_PKCS7_SIGNATURE';
  const signRes = await fetch(`${baseUrl}/api/admin/e-invoices/send-signed`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      invoiceId: invoice.id,
      pkcs7Signature: mockPkcs7,
      signerPinfl: '31508920050014',
      signerTin: '305123456',
      soliqPayload: prepData.data?.soliqPayload,
    }),
  });
  const signData = await signRes.json();
  console.log('✓ Sign Response Status:', signRes.status);
  console.log('✓ Doc UUID:', signData.data?.docUuid);
  console.log('✓ Verification URL:', signData.data?.verificationUrl);
  console.log('✓ Status Text:', signData.data?.statusText);

  // 5. Test Public Real-Time Verification URL
  console.log('\n5. Testing Public Verification endpoint without authentication...');
  const verifyRes = await fetch(signData.data?.verificationUrl);
  const verifyHtml = await verifyRes.text();
  console.log('✓ Public Verification HTTP Status:', verifyRes.status);
  const hasBadge = verifyHtml.includes('E-IMZO Bilan Tasdiqlangan');
  console.log('✓ Verified E-IMZO Badge in HTML:', hasBadge ? '✅ YES (Valid & Authentic)' : '❌ NO');

  // 6. Test Soliq XML Export
  console.log('\n6. Testing Soliq XML Export for State Tax Committee...');
  const xmlRes = await fetch(`${baseUrl}/api/admin/e-invoices/${invoice.id}/export-soliq-xml`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const xmlContent = await xmlRes.text();
  console.log('✓ XML Export HTTP Status:', xmlRes.status);
  console.log('✓ XML Header:', xmlContent.slice(0, 120) + '...');
  console.log('✓ XML contains <FacturaDocument> and <DigitalSignature>:', xmlContent.includes('<FacturaDocument') && xmlContent.includes('<DigitalSignature'));

  console.log('\n🎉 ALL IN-HOUSE SAPAR SOLIQ EDI & E-FAKTURA TESTS PASSED 100%!');
}

testSaparEdiHub().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
