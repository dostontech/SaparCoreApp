import dotenv from 'dotenv';
dotenv.config();

import {
  parseAslBelgisiDataMatrix,
  validateMarkingCodeForPos,
  recordMarkingCodeSold,
  writeOffExpiredMarkingCode,
  MARKING_CATEGORIES,
} from '../lib/marking/aslBelgisiService';

async function runAslBelgisiTests() {
  console.log('\n=============================================================');
  console.log('🇺🇿 ASL BELGISI DIGITAL MARKING & DECREE NO. 296 QA TEST SUITE');
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

  // 1. Test Regulated Categories
  console.log('1. Testing Asl Belgisi Regulated Product Categories:');
  assert(Boolean(MARKING_CATEGORIES.TOBACCO), 'Tobacco category registered');
  assert(Boolean(MARKING_CATEGORIES.ALCOHOL), 'Alcohol category registered');
  assert(Boolean(MARKING_CATEGORIES.PHARMACEUTICALS), 'Pharmaceuticals category registered');
  assert(Boolean(MARKING_CATEGORIES.APPLIANCES), 'Appliances category registered');
  assert(Boolean(MARKING_CATEGORIES.WATER_BEVERAGES), 'Water & Beverages category registered');

  // 2. Test DataMatrix Parsing (Bracketed AI format)
  console.log('\n2. Testing GS1 DataMatrix Code Parsing:');
  const validCode = '(01)04780012345678(21)SRL998877(17)281231(91)KEY1(92)SIG1234567890';
  const parsedValid = parseAslBelgisiDataMatrix(validCode);
  assert(parsedValid.gtin === '04780012345678', `GTIN extracted correctly: ${parsedValid.gtin}`);
  assert(parsedValid.serialNumber === 'SRL998877', `Serial extracted correctly: ${parsedValid.serialNumber}`);
  assert(parsedValid.expirationDate === '2028-12-31', `Expiry formatted: ${parsedValid.expirationDate}`);
  assert(parsedValid.isExpired === false, 'Valid future item is NOT expired');

  // 3. Test Decree No. 296 Hard-Stop on Expired Goods
  console.log('\n3. Testing Cabinet of Ministers Decree No. 296 Hard-Stop on Expired Stock:');
  const expiredCode = '(01)04780012345678(21)EXP112233(17)240101(91)KEY1'; // Expired 2024-01-01
  const tenantId = 'tenant-test-296';
  const validationExpired = validateMarkingCodeForPos(tenantId, expiredCode, { name: 'Dori Vositalari' });

  assert(validationExpired.valid === false, 'Expired code validity is false');
  assert(validationExpired.blocked === true, 'Expired code MUST be blocked from POS checkout');
  assert(validationExpired.reason === 'EXPIRED', 'Block reason is EXPIRED');
  assert(
    validationExpired.message.includes('296-son qarori'),
    'Warning message explicitly cites Decree No. 296'
  );
  console.log(`   • Block message: "${validationExpired.message}"`);

  // 4. Test Valid Sale and POS State Tracking
  console.log('\n4. Testing POS Checkout Validation & Sold State Tracking:');
  const validPosCode = '(01)04780099999999(21)GOOD001(17)290630(91)KEY1';
  const validationPos = validateMarkingCodeForPos(tenantId, validPosCode);
  assert(validationPos.valid === true, 'Valid code allowed at checkout');
  assert(validationPos.blocked === false, 'Valid code is not blocked');

  // Mark as sold
  recordMarkingCodeSold(tenantId, validPosCode, 'REC-2026-0001', 'prod-123');

  // Re-scanning sold code must be blocked
  const validationResold = validateMarkingCodeForPos(tenantId, validPosCode);
  assert(validationResold.blocked === true, 'Previously sold code cannot be resold');
  assert(validationResold.reason === 'ALREADY_SOLD', 'Resell rejected with ALREADY_SOLD');

  // 5. Test Expired Stock Write-off to GL Account 9430
  console.log('\n5. Testing Expired Stock Write-Off Flow (GL Account 9430):');
  const writeOffCode = '(01)04780088888888(21)SPOIL001(17)231231(91)KEY1';
  const writeOffRes = writeOffExpiredMarkingCode(tenantId, writeOffCode, 'Muddati oʻtgan (VM 296)');
  assert(writeOffRes.success === true, 'Write-off execution succeeded');
  assert(writeOffRes.glAccount === '9430', 'Assigned GL expense account is 9430 (NAS 21 Other Operating Expense)');
  assert(writeOffRes.record?.status === 'WRITTEN_OFF', 'Marking code status updated to WRITTEN_OFF');

  console.log('\n=============================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAslBelgisiTests().catch(console.error);
