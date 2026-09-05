import axios from 'axios';
import { EimzoAuthService } from '../services/eimzoAuthService';

const API_BASE = process.env.API_BASE || 'http://localhost:3005/api';

async function runEimzoTestSuite() {
  console.log('\n=============================================================');
  console.log('📜 MODULE 13: E-DOCUMENTS & E-IMZO CRYPTOGRAPHIC TEST SUITE');
  console.log('=============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`   ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`   ❌ FAIL: ${desc}`);
      failed++;
    }
  }

  // 1. Admin Authentication
  console.log('--- Phase 1: Authentication & Setup ---');
  let token = '';
  try {
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@sapar.uz',
      password: 'SaparPassword123!',
    }).catch(() => {
      return axios.post(`${API_BASE}/auth/login`, {
        email: 'admin@sapar.uz',
        password: 'password123',
      });
    });
    token = loginRes.data.data?.token || loginRes.data.token;
    assert(Boolean(token), 'Admin authentication token obtained');
  } catch (err: any) {
    console.error('Failed to log in as admin:', err?.message);
    process.exit(1);
  }

  const authHeaders = { Authorization: `Bearer ${token}` };

  // =========================================================================
  // TC-EIMZO-001: E-IMZO Challenge Generation
  // =========================================================================
  console.log('\n--- TC-EIMZO-001: Challenge Generation (GET /api/auth/eimzo/challenge) ---');
  const challengeRes = await axios.get(`${API_BASE}/auth/eimzo/challenge`);
  assert(challengeRes.status === 200, 'Challenge endpoint returned HTTP 200');
  const challengeData = challengeRes.data?.data || challengeRes.data;
  assert(Boolean(challengeData?.challengeId), `Challenge ID generated: ${challengeData?.challengeId}`);
  assert(Boolean(challengeData?.nonce) && challengeData.nonce.length >= 32, `Secure random nonce generated (length: ${challengeData?.nonce?.length})`);
  assert(Boolean(challengeData?.timestamp), `Challenge timestamp issued: ${challengeData?.timestamp}`);

  // =========================================================================
  // TC-EIMZO-002: E-IMZO Certificate Subject OID Parsing
  // =========================================================================
  console.log('\n--- TC-EIMZO-002: Certificate Subject Parsing (TIN, PINFL, Org, Title) ---');
  const mockRawCert = {
    tin: '302918273',
    pinfl: '31508920190034',
    cn: 'KARIMOV NODIRBEK ALISHEROVICH',
    o: 'SAPAR SOFTWARE SYSTEMS MCHJ',
    title: 'Bosh direktor',
    validFrom: '2025-01-01T00:00:00Z',
    validTo: '2027-01-01T00:00:00Z',
    serialNumber: '5C4A9E2180B72D',
  };

  const parsedCert = EimzoAuthService.parseCertificateSubject(mockRawCert);
  assert(parsedCert.tin === '302918273', `TIN (STIR) correctly parsed: ${parsedCert.tin}`);
  assert(parsedCert.pinfl === '31508920190034', `PINFL (JShShIR) correctly parsed: ${parsedCert.pinfl}`);
  assert(parsedCert.commonName === 'KARIMOV NODIRBEK ALISHEROVICH', `Common Name (CN) parsed: ${parsedCert.commonName}`);
  assert(parsedCert.organization === 'SAPAR SOFTWARE SYSTEMS MCHJ', `Organization (O) parsed: ${parsedCert.organization}`);
  assert(parsedCert.serialNumber === '5C4A9E2180B72D', `Certificate Serial Number parsed: ${parsedCert.serialNumber}`);

  // =========================================================================
  // TC-EIMZO-003: Signature Verification & Anti-Replay Protection
  // =========================================================================
  console.log('\n--- TC-EIMZO-003: Signature Verification & Anti-Replay Protection ---');
  // 1. Verify via HTTP API endpoint (/api/auth/eimzo/verify)
  const authVerifyRes = await axios.post(`${API_BASE}/auth/eimzo/verify`, {
    challengeId: challengeData.challengeId,
    pkcs7Signature: 'MIIBiAYJKoZIhvcNAQcCoIIBezCCAXcCAQExDzANBglghkgBZQMEAgEFADALBgkq...',
    certInfo: mockRawCert,
  });
  assert(authVerifyRes.status === 200, 'First verification via HTTP API succeeded with HTTP 200');
  const issuedToken = authVerifyRes.data?.token || authVerifyRes.data?.data?.token;
  assert(Boolean(issuedToken), `User session & JWT token issued upon E-IMZO verification: ${issuedToken?.substring(0, 20)}...`);

  // 2. Anti-Replay: reused challenge ID must be rejected by HTTP API
  const authReplayRes = await axios.post(`${API_BASE}/auth/eimzo/verify`, {
    challengeId: challengeData.challengeId,
    pkcs7Signature: 'MIIBiAYJKoZIhvcNAQcCoIIBezCCAXcCAQExDzANBglghkgBZQMEAgEFADALBgkq...',
    certInfo: mockRawCert,
  }).catch((e) => e.response);
  assert(authReplayRes?.status === 400, 'Replay protection active: reused challenge ID immediately rejected with HTTP 400');

  // 3. Unit test in-memory EimzoAuthService directly
  const localChallenge = EimzoAuthService.createChallenge();
  const localVerify = EimzoAuthService.verifySignature(
    localChallenge.challengeId,
    'MIIBiAYJKoZIhvcNAQcCoIIBezCCAXcCAQExDzANBglghkgBZQMEAgEFADALBgkq...',
    mockRawCert
  );
  assert(localVerify.valid === true, 'In-memory EimzoAuthService verifySignature succeeded');
  const localReplay = EimzoAuthService.verifySignature(
    localChallenge.challengeId,
    'MIIBiAYJKoZIhvcNAQcCoIIBezCCAXcCAQExDzANBglghkgBZQMEAgEFADALBgkq...',
    mockRawCert
  );
  assert(localReplay.valid === false, 'In-memory challenge consumed and protected against replay');

  // =========================================================================
  // TC-EIMZO-004: In-House E-Document Creation (Hisob-faktura / Invoice)
  // =========================================================================
  console.log('\n--- TC-EIMZO-004: E-Invoice Creation with MXIK & 12% VAT ---');
  const invoicePayload = {
    docType: 'INVOICE',
    docNumber: `INV-${Date.now().toString().slice(-6)}`,
    title: 'Elektron Hisob-faktura (Didox/Factura mosligi)',
    sellerName: 'SAPAR SOFTWARE SYSTEMS MCHJ',
    sellerTin: '302918273',
    buyerName: 'SAMARQAND MEGA SAVDO MCHJ',
    buyerTin: '305556677',
    items: [
      {
        ordNo: 1,
        name: 'ERP Platformasi Oylik Litsenziyasi',
        catalogCode: '06201001001000000', // 17-digit MXIK
        packageCode: '796', // dona
        packageName: 'dona',
        count: 2,
        summa: 1200000,
        vatRate: 12,
        vatSum: 288000,
        totalSum: 2688000,
      },
    ],
    subtotal: 2400000,
    vatTotal: 288000,
    totalSum: 2688000,
    currency: 'UZS',
  };

  const createInvRes = await axios.post(`${API_BASE}/admin/e-documents`, invoicePayload, { headers: authHeaders });
  assert(createInvRes.status === 200, 'E-Invoice created successfully with HTTP 200');
  const createdInv = createInvRes.data?.data?.document;
  assert(createdInv?.status === 'DRAFT', `Initial status is DRAFT: ${createdInv?.status}`);
  assert(Boolean(createdInv?.publicSignToken), `Unique publicSignToken generated: ${createdInv?.publicSignToken}`);
  assert(Boolean(createdInv?.canonicalHash), `SHA-256 canonical hash generated: ${createdInv?.canonicalHash}`);
  assert(createdInv?.totalSum === 2688000, `Total sum matches 12% VAT computation: ${createdInv?.totalSum.toLocaleString()} UZS`);

  // =========================================================================
  // TC-EIMZO-005: Automated Template: Solishtirma Dalolatnoma (Akt Sverki)
  // =========================================================================
  console.log('\n--- TC-EIMZO-005: National Template: Solishtirma Dalolatnoma (Akt Sverki) ---');
  const aktPayload = {
    counterpartyName: 'TOSHKENT G‘ISHT ZAVODI MCHJ',
    counterpartyTin: '308889900',
    openingBalance: 0,
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    customLedgerLines: [
      {
        date: '2025-01-01',
        docType: 'Boshlangʻich qoldiq',
        docNumber: '-',
        description: 'Davr boshiga qoldiq',
        debit: 5000000,
        credit: 0,
      },
      {
        date: '2025-02-15',
        docType: 'Hisob-faktura',
        docNumber: 'HF-2025/112',
        description: 'Yetkazib berilgan g‘isht mahsulotlari',
        debit: 15000000,
        credit: 0,
      },
      {
        date: '2025-03-01',
        docType: 'Bank to‘lovi',
        docNumber: 'TT-409',
        description: 'Bank orqali qisman to‘lov',
        debit: 0,
        credit: 12000000,
      },
    ],
  };

  const createAktRes = await axios.post(`${API_BASE}/admin/e-documents/generate/akt-sverki`, aktPayload, { headers: authHeaders });
  assert(createAktRes.status === 200, 'Akt Sverki generated with HTTP 200');
  const createdAkt = createAktRes.data?.data?.document;
  assert(createdAkt?.docType === 'ACT_RECONCILIATION', `DocType is ACT_RECONCILIATION`);
  assert(createdAkt?.metaData?.closingBalance === 8000000, `Calculated Closing Balance exact: ${createdAkt?.metaData?.closingBalance.toLocaleString()} UZS (Debit 20M - Credit 12M = 8M)`);
  assert(Boolean(createdAkt?.publicSignToken), `Public sign token generated for counterparty: ${createdAkt?.publicSignToken}`);

  // =========================================================================
  // TC-EIMZO-006: Automated Template: Ishonchnoma (Power of Attorney Form № M-2)
  // =========================================================================
  console.log('\n--- TC-EIMZO-006: National Template: Ishonchnoma (Form № M-2) ---');
  const empowermentPayload = {
    attorneyName: 'RAHIMOV SHOHRUH BAXTIYOROVICH',
    attorneyPosition: 'Ta’minot bo‘limi boshlig‘i',
    attorneyPassport: 'AA 9876543',
    attorneyPassportIssuedBy: 'Toshkent sh. Mirzo Ulug‘bek IIO FMB',
    attorneyPinfl: '32001950180029',
    supplierName: 'QURILISH SAVDO BAZASI MCHJ',
    supplierTin: '304443322',
    validUntil: '2025-12-31',
    items: [
      {
        name: 'Tsement M-500',
        catalogCode: '04701001001000000',
        packageCode: '166', // kg
        packageName: 'qop',
        count: 100,
        summa: 65000,
        vatRate: 12,
        vatSum: 780000,
        totalSum: 7280000,
      },
    ],
  };

  const createIshRes = await axios.post(`${API_BASE}/admin/e-documents/generate/empowerment`, empowermentPayload, { headers: authHeaders });
  assert(createIshRes.status === 200, 'Ishonchnoma Form № M-2 generated with HTTP 200');
  const createdIsh = createIshRes.data?.data?.document;
  assert(createdIsh?.docType === 'EMPOWERMENT', 'DocType is EMPOWERMENT');
  assert(createdIsh?.metaData?.attorneyPassport === 'AA 9876543', `Attorney passport recorded: ${createdIsh?.metaData?.attorneyPassport}`);
  assert(createdIsh?.metaData?.attorneyPinfl === '32001950180029', `Attorney PINFL recorded: ${createdIsh?.metaData?.attorneyPinfl}`);

  // =========================================================================
  // TC-EIMZO-007: Automated Template: Shartnoma (Commercial Contract)
  // =========================================================================
  console.log('\n--- TC-EIMZO-007: National Template: Shartnoma (Contract with E-IMZO Clause) ---');
  const contractPayload = {
    templateType: 'SALES',
    counterpartyName: 'BUXORO TEXTILE CLUSTER MCHJ',
    counterpartyTin: '301112233',
    totalSum: 50000000,
    vatRate: 12,
    paymentDays: 3,
    deliveryDays: 5,
    validityDays: 365,
  };

  const createContractRes = await axios.post(`${API_BASE}/admin/e-documents/generate/contract`, contractPayload, { headers: authHeaders });
  assert(createContractRes.status === 200, 'Contract generated with HTTP 200');
  const createdContract = createContractRes.data?.data?.document;
  assert(createdContract?.docType === 'CONTRACT', 'DocType is CONTRACT');
  assert(Array.isArray(createdContract?.legalArticles) && createdContract?.legalArticles.length >= 6, `Standard legal articles generated (count: ${createdContract?.legalArticles?.length})`);
  const eimzoClause = createdContract?.legalArticles?.find((a: any) => a.title.includes('Raqamli imzo'));
  assert(Boolean(eimzoClause), 'Legal Article 6 (E-IMZO raqamli imzo va yuridik kuch) present');

  // =========================================================================
  // TC-EIMZO-008: Sender Cryptographic Signing (E-IMZO)
  // =========================================================================
  console.log('\n--- TC-EIMZO-008: Sender Cryptographic Signing (E-IMZO) ---');
  const signSenderRes = await axios.post(`${API_BASE}/admin/e-documents/${createdInv.id}/sign-sender`, {
    pkcs7Signature: 'MIIBiAYJKoZIhvcNAQcCoIIBezCCAXcCAQExDzANBglghkgBZQMEAgEFADALBgkq...',
    certInfo: {
      CN: 'KARIMOV NODIRBEK ALISHEROVICH',
      TIN: '302918273',
      PINFL: '31508920190034',
      O: 'SAPAR SOFTWARE SYSTEMS MCHJ',
      T: 'Bosh direktor',
      serialNumber: '5C4A9E2180B72D',
    },
  }, { headers: authHeaders });

  assert(signSenderRes.status === 200, 'Sender E-IMZO signature accepted with HTTP 200');
  const senderSignedDoc = signSenderRes.data?.data?.document;
  assert(senderSignedDoc?.status === 'WAITING_COUNTERPARTY', `Status transitioned to WAITING_COUNTERPARTY: ${senderSignedDoc?.status}`);
  assert(senderSignedDoc?.senderSignature?.signedBy === 'KARIMOV NODIRBEK ALISHEROVICH', `Sender signature CN saved: ${senderSignedDoc?.senderSignature?.signedBy}`);
  assert(senderSignedDoc?.senderSignature?.isValid === true, 'Sender signature marked valid');

  // =========================================================================
  // TC-EIMZO-009: Public Counterparty Signing Portal (No Login Required)
  // =========================================================================
  console.log('\n--- TC-EIMZO-009: Public Counterparty Signing (No Login via Token) ---');
  const publicToken = createdInv.publicSignToken;
  const signRecipientRes = await axios.post(`${API_BASE}/public/e-documents/${publicToken}/sign-recipient`, {
    pkcs7Signature: 'MIIBiAYJKoZIhvcNAQcCoIIBezCCAXcCAQExDzANBglghkgBZQMEAgEFADALBgkq_RECIPIENT...',
    certInfo: {
      CN: 'TOSHEV BOBUR ILHOMOVICH',
      TIN: '305556677',
      PINFL: '31904890120018',
      O: 'SAMARQAND MEGA SAVDO MCHJ',
      T: 'Direktor',
      serialNumber: '3D81EA9910C24A',
    },
  });

  assert(signRecipientRes.status === 200, 'Counterparty public E-IMZO signature accepted with HTTP 200');
  const fullySignedDoc = signRecipientRes.data?.data?.document;
  assert(fullySignedDoc?.status === 'FULLY_SIGNED', `Document status transitioned to FULLY_SIGNED: ${fullySignedDoc?.status}`);
  assert(fullySignedDoc?.recipientSignature?.signedBy === 'TOSHEV BOBUR ILHOMOVICH', `Recipient signature CN saved: ${fullySignedDoc?.recipientSignature?.signedBy}`);
  assert(Boolean(fullySignedDoc?.senderSignature) && Boolean(fullySignedDoc?.recipientSignature), 'Both cryptographic signatures present on document');

  // =========================================================================
  // TC-EIMZO-010: Public Digital Verification via QR Code Link
  // =========================================================================
  console.log('\n--- TC-EIMZO-010: Public Verification Endpoint via QR Code Link ---');
  const verifyRes = await axios.get(`${API_BASE}/public/e-documents/${publicToken}/verify`);
  assert(verifyRes.status === 200, 'Public verification endpoint returned HTTP 200');
  const verifyData = verifyRes.data?.data;
  assert(verifyData?.isAuthentic === true, 'Document verified authentic: isAuthentic=true');
  assert(verifyData?.status === 'FULLY_SIGNED', 'Verification confirms FULLY_SIGNED status');
  assert(verifyData?.seller?.tin === '302918273', `Seller TIN verified: ${verifyData?.seller?.tin}`);
  assert(verifyData?.buyer?.tin === '305556677', `Buyer TIN verified: ${verifyData?.buyer?.tin}`);
  assert(verifyData?.totalSum === 2688000, `Verified total sum matches: ${verifyData?.totalSum.toLocaleString()} UZS`);

  // =========================================================================
  // TC-EIMZO-011: Counterparty Rejection Workflow
  // =========================================================================
  console.log('\n--- TC-EIMZO-011: Counterparty Rejection Workflow ---');
  const rejDocRes = await axios.post(`${API_BASE}/admin/e-documents`, {
    docType: 'INVOICE',
    docNumber: `INV-REJ-${Date.now().toString().slice(-4)}`,
    title: 'Hisob-faktura (Rad etish testi)',
    sellerName: 'SAPAR SOFTWARE SYSTEMS MCHJ',
    sellerTin: '302918273',
    buyerName: 'RAD ETUVCHI KORXONA MCHJ',
    buyerTin: '307778899',
    items: [],
    currency: 'UZS',
  }, { headers: authHeaders });

  const rejDoc = rejDocRes.data?.data?.document;
  const rejectRes = await axios.post(`${API_BASE}/public/e-documents/${rejDoc.publicSignToken}/reject`, {
    reason: 'Tovarlar to‘liq hajmda yetkazib berilmagan, hisob-faktura tuzatilsin',
  });

  assert(rejectRes.status === 200, 'Rejection processed with HTTP 200');
  const rejectedDoc = rejectRes.data?.data?.document;
  assert(rejectedDoc?.status === 'REJECTED', `Status transitioned to REJECTED: ${rejectedDoc?.status}`);
  assert(rejectedDoc?.rejectionReason.includes('yetkazib berilmagan'), `Rejection reason saved: ${rejectedDoc?.rejectionReason}`);
  assert(Boolean(rejectedDoc?.rejectedAt), `Rejection timestamp saved: ${rejectedDoc?.rejectedAt}`);

  // =========================================================================
  // TC-EIMZO-012: Listing & Stats Aggregation
  // =========================================================================
  console.log('\n--- TC-EIMZO-012: Document Listing & Stats Verification ---');
  const listRes = await axios.get(`${API_BASE}/admin/e-documents`, { headers: authHeaders });
  assert(listRes.status === 200, 'Document list retrieved successfully');
  const listData = listRes.data?.data;
  assert(Array.isArray(listData?.documents), `Documents array returned (count: ${listData?.documents?.length})`);
  assert(typeof listData?.counts?.all === 'number' && listData.counts.all >= 3, `Total document count aggregated: ${listData?.counts?.all}`);
  assert(typeof listData?.counts?.signed === 'number' && listData.counts.signed >= 1, `Fully signed count tracked: ${listData?.counts?.signed}`);

  // =========================================================================
  // TC-EIMZO-013: Multi-Tenant Zero-Leakage & Token Security
  // =========================================================================
  console.log('\n--- TC-EIMZO-013: Security & Token Validation ---');
  const invalidTokenRes = await axios.get(`${API_BASE}/public/e-documents/token-non-existent-9999/verify`)
    .catch((e) => e.response);
  assert(invalidTokenRes.status === 404, 'Non-existent public sign token returns HTTP 404');

  // =========================================================================
  // TC-EIMZO-014: Document Deletion & Cleanup
  // =========================================================================
  console.log('\n--- TC-EIMZO-014: Document Deletion & Cleanup ---');
  const deleteRes = await axios.delete(`${API_BASE}/admin/e-documents/${rejDoc.id}`, { headers: authHeaders });
  assert(deleteRes.status === 200, 'Rejected test document cleaned up with HTTP 200');

  // Summary
  console.log('\n=============================================================');
  console.log(`🏁 MODULE 13 (E-DOCUMENTS & E-IMZO) RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runEimzoTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
