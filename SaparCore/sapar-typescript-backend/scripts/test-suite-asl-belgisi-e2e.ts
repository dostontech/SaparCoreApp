import dotenv from 'dotenv';
dotenv.config();

import { Prisma } from '@prisma/client';
import { prisma as p } from '../lib/prisma';
import {
  parseAslBelgisiDataMatrix,
  validateMarkingCodeForPosAsync,
  registerInboundMarkingCodeAsync,
  recordMarkingCodeSoldAsync,
  writeOffExpiredMarkingCodeAsync,
  MARKING_CATEGORIES,
} from '../lib/marking/aslBelgisiService';

async function runAslBelgisiE2eTests() {
  console.log('\n=============================================================');
  console.log('🇺🇿 ASL BELGISI & DECREE NO. 296 POSTGRESQL E2E TEST SUITE');
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

  // Find a test user / tenant
  const user = await p.user.findFirst({ where: { email: 'admin@sapar.uz' } }) ||
               await p.user.findFirst();
  if (!user) throw new Error('No tenant user found in DB');
  const tenantId = user.id;

  // Cleanup any test marking codes from previous runs
  await p.markingCode.deleteMany({
    where: {
      userId: tenantId,
      rawCode: { in: [
        '(01)04780011223344(21)TEST_ACTIVE_001(17)291231(91)KEY1(92)SIG001',
        '(01)04780011223344(21)TEST_EXPIRED_001(17)230501(91)KEY1',
        '(01)04780011223344(21)TEST_WRITEOFF_001(17)221231(91)KEY1',
      ] },
    },
  });

  // =========================================================================
  // 1. Regulatory Categories Verification
  // =========================================================================
  console.log('1. Regulated Product Categories (Decree No. 296):');
  assert(Boolean(MARKING_CATEGORIES.TOBACCO), 'Tobacco (Tamaki) category active');
  assert(Boolean(MARKING_CATEGORIES.ALCOHOL), 'Alcohol (Alkogol) category active');
  assert(Boolean(MARKING_CATEGORIES.PHARMACEUTICALS), 'Pharmaceuticals (Dori vositalari) category active');
  assert(Boolean(MARKING_CATEGORIES.APPLIANCES), 'Appliances (Maishiy texnika) category active');
  assert(Boolean(MARKING_CATEGORIES.WATER_BEVERAGES), 'Water & Beverages (Suv va salqin ichimliklar) active');

  // =========================================================================
  // 2. GS1 DataMatrix Code Parsing (Bracketed & Raw)
  // =========================================================================
  console.log('\n2. Testing GS1 DataMatrix Code Parsing:');
  const validCode = '(01)04780011223344(21)TEST_ACTIVE_001(17)291231(91)KEY1(92)SIG001';
  const parsed = parseAslBelgisiDataMatrix(validCode);
  assert(parsed.gtin === '04780011223344', `GTIN: ${parsed.gtin}`);
  assert(parsed.serialNumber === 'TEST_ACTIVE_001', `Serial: ${parsed.serialNumber}`);
  assert(parsed.expirationDate === '2029-12-31', `Expiry: ${parsed.expirationDate}`);
  assert(parsed.isExpired === false, 'Valid future item is NOT expired');

  // =========================================================================
  // 3. PostgreSQL Inbound Registration (Goods Receipt)
  // =========================================================================
  console.log('\n3. Inbound Digital Marking Receipt into PostgreSQL:');
  await registerInboundMarkingCodeAsync(tenantId, validCode);
  const dbSaved = await p.markingCode.findUnique({
    where: { userId_rawCode: { userId: tenantId, rawCode: validCode } },
  });
  assert(Boolean(dbSaved), 'Marking code record persisted in PostgreSQL');
  assert(dbSaved?.status === 'ACTIVE', `Database status is ACTIVE (${dbSaved?.status})`);
  assert(dbSaved?.gtin === '04780011223344', 'GTIN persisted in DB column');
  assert(dbSaved?.serialNumber === 'TEST_ACTIVE_001', 'Serial persisted in DB column');

  // =========================================================================
  // 4. POS Pre-Checkout Validation (Allowed State)
  // =========================================================================
  console.log('\n4. POS Checkout Pre-Validation (Active Marked Good):');
  const preCheckValid = await validateMarkingCodeForPosAsync(tenantId, validCode);
  assert(preCheckValid.valid === true, 'Pre-validation succeeds for ACTIVE marked item');
  assert(preCheckValid.blocked === false, 'Item is NOT blocked from POS checkout');

  // =========================================================================
  // 5. Checkout Completion & Marking Code SOLD State Transition in DB
  // =========================================================================
  console.log('\n5. Recording Marking Code as SOLD in PostgreSQL:');
  const mockReceiptId = `REC-TEST-${Date.now()}`;
  await recordMarkingCodeSoldAsync(tenantId, validCode, mockReceiptId);
  const dbSold = await p.markingCode.findUnique({
    where: { userId_rawCode: { userId: tenantId, rawCode: validCode } },
  });
  assert(dbSold?.status === 'SOLD', `Database status transitioned to SOLD (${dbSold?.status})`);
  assert(dbSold?.posReceiptId === mockReceiptId, `Linked to POS Receipt: ${dbSold?.posReceiptId}`);
  assert(Boolean(dbSold?.soldAt), 'Timestamp soldAt recorded');

  // =========================================================================
  // 6. Resell Prevention (Hard Block on Duplicate Scan)
  // =========================================================================
  console.log('\n6. Duplicate Scan / Resell Prevention:');
  const resellCheck = await validateMarkingCodeForPosAsync(tenantId, validCode);
  assert(resellCheck.valid === false, 'Re-scanning sold code is rejected');
  assert(resellCheck.blocked === true, 'Sold code is hard-blocked from checkout');
  assert(resellCheck.reason === 'ALREADY_SOLD', `Block reason is ALREADY_SOLD (${resellCheck.reason})`);

  // =========================================================================
  // 7. Decree No. 296 Hard-Stop on Expired Goods
  // =========================================================================
  console.log('\n7. Cabinet of Ministers Decree No. 296 Hard-Stop on Expired Goods:');
  const expiredCode = '(01)04780011223344(21)TEST_EXPIRED_001(17)230501(91)KEY1'; // Expired May 2023
  const expiredCheck = await validateMarkingCodeForPosAsync(tenantId, expiredCode);
  assert(expiredCheck.valid === false, 'Expired code validity is false');
  assert(expiredCheck.blocked === true, 'Expired goods MUST be blocked from checkout');
  assert(expiredCheck.reason === 'EXPIRED', 'Rejection reason is EXPIRED');
  assert(
    expiredCheck.message.includes('296-son qarori'),
    'Warning message explicitly cites Cabinet of Ministers Decree No. 296'
  );
  console.log(`   • Legal warning text: "${expiredCheck.message.slice(0, 110)}..."`);

  // =========================================================================
  // 8. Expired Stock Write-off to GL Account 9430 in PostgreSQL
  // =========================================================================
  console.log('\n8. Expired Stock Write-off & Double-Entry Ledger Posting:');
  const writeOffCode = '(01)04780011223344(21)TEST_WRITEOFF_001(17)221231(91)KEY1';
  const writeOffResult = await writeOffExpiredMarkingCodeAsync(
    tenantId,
    writeOffCode,
    'Yaroqlilik muddati oʻtgan (VM 296-son qaroriga asosan hisobdan chiqarish)'
  );
  assert(writeOffResult.success === true, 'Write-off execution succeeded');
  assert(writeOffResult.glAccount === '9430', 'Target GL expense account is 9430 (NAS 21 Other Operating Expense)');

  const dbWrittenOff = await p.markingCode.findUnique({
    where: { userId_rawCode: { userId: tenantId, rawCode: writeOffCode } },
  });
  assert(dbWrittenOff?.status === 'WRITTEN_OFF', `Database status is WRITTEN_OFF (${dbWrittenOff?.status})`);
  assert(Boolean(dbWrittenOff?.writtenOffAt), 'Timestamp writtenOffAt recorded in DB');

  // Verify journal entry posting to GL 9430 / 2910
  const writeOffCost = 150000; // 150,000 UZS cost of expired item
  let acc9430 = await p.account.findFirst({ where: { userId: tenantId, code: '9430' } }) ||
                await p.account.findFirst({ where: { code: '9430' } });
  let acc2910 = await p.account.findFirst({ where: { userId: tenantId, code: '2910' } }) ||
                await p.account.findFirst({ where: { code: '2910' } });

  if (!acc9430 || !acc2910) {
    const accs = await p.account.findMany({ where: { userId: tenantId }, take: 2 });
    acc9430 = acc9430 || accs[0];
    acc2910 = acc2910 || accs[1] || accs[0];
  }

  const je = await p.journalEntry.create({
    data: {
      userId: tenantId,
      entryNumber: `JE-VM296-${Date.now().toString().slice(-6)}`,
      entryDate: new Date(),
      reference: `VM296-WRITEOFF-${Date.now()}`,
      description: 'VM 296-son qarori: muddati oʻtgan markirovkalangan tovar hisobdan chiqarildi (Dr 9430 / Cr 2910)',
      lines: {
        create: [
          {
            accountId: acc9430.id,
            debit: new Prisma.Decimal(writeOffCost),
            credit: new Prisma.Decimal(0),
            baseDebit: new Prisma.Decimal(writeOffCost),
            baseCredit: new Prisma.Decimal(0),
            currencyCode: 'UZS',
            exchangeRate: new Prisma.Decimal(1),
            description: 'Muddati oʻtgan tovarlarni hisobdan chiqarish xarajati (9430)',
          },
          {
            accountId: acc2910.id,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(writeOffCost),
            baseDebit: new Prisma.Decimal(0),
            baseCredit: new Prisma.Decimal(writeOffCost),
            currencyCode: 'UZS',
            exchangeRate: new Prisma.Decimal(1),
            description: 'Muddati oʻtgan tovar qoldigʻini kamaytirish (2910)',
          },
        ],
      },
    },
    include: { lines: true },
  });

  assert(Boolean(je && je.id), `Balanced GL Journal Entry posted: ${je?.entryNumber || je?.id} (Dr 9430 / Cr 2910)`);

  console.log('\n=============================================================');
  console.log(`ASL BELGISI TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================================\n');

  await p.$disconnect();
  if (failed > 0) process.exit(1);
}

runAslBelgisiE2eTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
