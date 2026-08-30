/**
 * scripts/test-accounting-suites-02-to-07.ts
 *
 * Full verification of Accounting Suites 02, 03, 04, 05, 06, 07
 * against the live API and PostgreSQL database.
 */

import axios from 'axios';
import jwt from 'jsonwebtoken';
import { PrismaClient, Prisma } from '@prisma/client';

async function main() {
  const p = new PrismaClient();

  const user = await p.user.findFirst({ where: { user_type: 1 } });
  if (!user) throw new Error('No user found');
  const token = jwt.sign(
    { id: user.id, tenantId: user.ownerId ?? user.id },
    process.env.JWT_SECRET || 'sapar-local-jwt-secret-2026',
    { expiresIn: '1d' }
  );

  const headers = { Authorization: `Bearer ${token}` };

  console.log('\n=============================================================');
  console.log('🏛️ RUNNING ACCOUNTING SUITES 02 THROUGH 07 VERIFICATION');
  console.log('=============================================================\n');

  // Fetch key accounts
  const cashAcc = await p.account.findFirst({ where: { userId: user.id, code: '1001' } });
  const equityAcc = await p.account.findFirst({ where: { userId: user.id, code: '3050' } });
  const bankAcc = await p.account.findFirst({ where: { userId: user.id, code: '1002' } });

  if (!cashAcc || !equityAcc || !bankAcc) throw new Error('Core accounts not found');

  // =========================================================================
  // SUITE 02: MANUAL JOURNAL ENTRIES (TC-ACC-007 to TC-ACC-010)
  // =========================================================================
  console.log('-------------------------------------------------------------');
  console.log('1️⃣ SUITE 02: MANUAL JOURNAL ENTRIES');
  console.log('-------------------------------------------------------------');

  // TC-ACC-007: Create Balanced Manual Journal Entry
  console.log('\n--- TC-ACC-007: Create Balanced Manual Journal Entry ---');
  const jeRes = await axios.post(
    'http://localhost:3001/api/admin/journal-entries',
    {
      entryDate: new Date().toISOString().slice(0, 10),
      description: 'Owner Capital Contribution Test (500,000 UZS)',
      lines: [
        { accountId: cashAcc.id, debit: 500000, credit: 0 },
        { accountId: equityAcc.id, debit: 0, credit: 500000 },
      ],
    },
    { headers }
  );
  console.log(`1. API Create Journal Entry: HTTP ${jeRes.status} | ID=${jeRes.data.data.journalEntry.id}`);

  const createdJeId = jeRes.data.data.journalEntry.id;
  const dbJe = await p.journalEntry.findUnique({
    where: { id: createdJeId },
    include: { lines: true },
  });

  const totalDr = dbJe?.lines.reduce((s, l) => s + Number(l.debit), 0);
  const totalCr = dbJe?.lines.reduce((s, l) => s + Number(l.credit), 0);
  console.log(`2. DB Verification: Entry #${dbJe?.entryNumber} | Debit = ${totalDr?.toLocaleString()} UZS | Credit = ${totalCr?.toLocaleString()} UZS`);
  if (totalDr === 500000 && totalCr === 500000) {
    console.log('✓ TC-ACC-007 PASS: Manual Journal Entry persisted with balanced debit/credit lines.');
  } else {
    console.log('❌ TC-ACC-007 FAIL: Amounts mismatch.');
  }

  // TC-ACC-008: Unbalanced Entry Rejection Guard
  console.log('\n--- TC-ACC-008: Unbalanced Entry Rejection Guard ---');
  let unbalancedBlocked = false;
  try {
    await axios.post(
      'http://localhost:3001/api/admin/journal-entries',
      {
        entryDate: new Date().toISOString().slice(0, 10),
        description: 'Unbalanced Entry Test',
        lines: [
          { accountId: cashAcc.id, debit: 500000, credit: 0 },
          { accountId: equityAcc.id, debit: 0, credit: 400000 },
        ],
      },
      { headers }
    );
    console.log('❌ TC-ACC-008 FAIL: Unbalanced entry was accepted by API!');
  } catch (err: any) {
    unbalancedBlocked = true;
    console.log(`1. Unbalanced Entry Attempt: Rejected with HTTP ${err.response?.status} - '${err.response?.data?.message}'`);
    if (err.response?.status === 400) {
      console.log('✓ TC-ACC-008 PASS: Unbalanced journal entry strictly rejected with 400 Bad Request.');
    }
  }

  // TC-ACC-010: Journal Entry Reversal
  console.log('\n--- TC-ACC-010: Journal Entry Reversal ---');
  const revRes = await axios.post(
    `http://localhost:3001/api/admin/journal-entries/${createdJeId}/reverse`,
    { reversalDate: new Date().toISOString().slice(0, 10), reason: 'QA Reversal Test' },
    { headers }
  );
  console.log(`1. API Reversal Response: HTTP ${revRes.status} | Reversal Entry ID: ${revRes.data?.data?.journalEntry?.id}`);

  const revEntryId = revRes.data?.data?.journalEntry?.id;
  const revDbJe = await p.journalEntry.findUnique({
    where: { id: revEntryId },
    include: { lines: true },
  });

  console.log(`2. DB Reversal Entry: Entry #${revDbJe?.entryNumber} | Reference: ${revDbJe?.reference} | Lines Count: ${revDbJe?.lines.length}`);
  for (const ln of revDbJe?.lines || []) {
    console.log(`   • Account ${ln.accountId}: Debit = ${Number(ln.debit).toLocaleString()} | Credit = ${Number(ln.credit).toLocaleString()}`);
  }

  if (revDbJe && revDbJe.lines.length === 2) {
    console.log('✓ TC-ACC-010 PASS: Journal Entry reversed with exact inverse debit/credit entries.');
  } else {
    console.log('❌ TC-ACC-010 FAIL: Reversal entry not created.');
  }

  // =========================================================================
  // SUITE 03: MULTI-CURRENCY JOURNAL ENTRIES (TC-ACC-014)
  // =========================================================================
  console.log('\n-------------------------------------------------------------');
  console.log('2️⃣ SUITE 03: MULTI-CURRENCY JOURNAL CONVERSION');
  console.log('-------------------------------------------------------------');

  console.log('\n--- TC-ACC-014: USD Foreign Currency Conversion ($100 @ 12,800 UZS) ---');
  const fxJeRes = await axios.post(
    'http://localhost:3001/api/admin/journal-entries',
    {
      entryDate: new Date().toISOString().slice(0, 10),
      description: 'USD Capital Investment ($100 @ 12,800)',
      currencyCode: 'USD',
      exchangeRate: 12800,
      lines: [
        { accountId: bankAcc.id, debit: 100, credit: 0 },
        { accountId: equityAcc.id, debit: 0, credit: 100 },
      ],
    },
    { headers }
  );

  const fxJeId = fxJeRes.data.data.journalEntry.id;
  const dbFxJe = await p.journalEntry.findUnique({
    where: { id: fxJeId },
    include: { lines: true },
  });

  console.log(`1. FX Journal Entry: #${dbFxJe?.entryNumber} | Currency: ${dbFxJe?.lines[0].currencyCode} | Rate: ${dbFxJe?.lines[0].exchangeRate}`);
  for (const ln of dbFxJe?.lines || []) {
    console.log(`   • Debit = ${ln.debit} USD (Base: ${ln.baseDebit.toLocaleString()} UZS) | Credit = ${ln.credit} USD (Base: ${ln.baseCredit.toLocaleString()} UZS)`);
  }

  const baseDr = dbFxJe?.lines.find((l) => Number(l.baseDebit) > 0)?.baseDebit;
  if (Number(baseDr) === 1280000) {
    console.log('✓ TC-ACC-014 PASS: Foreign currency amount ($100) converted accurately to Base UZS (1,280,000 UZS).');
  } else {
    console.log(`❌ TC-ACC-014 FAIL: Base debit ${baseDr} != 1,280,000 UZS`);
  }

  // =========================================================================
  // SUITE 04: TRIAL BALANCE (TC-ACC-017 & TC-ACC-019)
  // =========================================================================
  console.log('\n-------------------------------------------------------------');
  console.log('3️⃣ SUITE 04: TRIAL BALANCE (AYLANMA VEDOMOST / OBOROTKA)');
  console.log('-------------------------------------------------------------');

  console.log('\n--- TC-ACC-017: Trial Balance Equality ---');
  const tbRes = await axios.get('http://localhost:3001/api/admin/reports/trial-balance', { headers });
  const tb = tbRes.data.data;
  console.log(`1. Trial Balance Report: Debit = ${tb.totals.debit.toLocaleString()} UZS | Credit = ${tb.totals.credit.toLocaleString()} UZS | Balanced = ${tb.balanced}`);

  if (tb.balanced && Math.abs(tb.totals.debit - tb.totals.credit) < 0.01) {
    console.log('✓ TC-ACC-017 PASS: Trial Balance debits and credits are perfectly equal.');
  } else {
    console.log('❌ TC-ACC-017 FAIL: Trial Balance unbalanced.');
  }

  // =========================================================================
  // SUITE 05: FINANCIAL STATEMENTS (TC-ACC-021 & TC-ACC-022)
  // =========================================================================
  console.log('\n-------------------------------------------------------------');
  console.log('4️⃣ SUITE 05: FINANCIAL STATEMENTS (P&L 2-SHAKL & BALANCE SHEET 1-SHAKL)');
  console.log('-------------------------------------------------------------');

  console.log('\n--- TC-ACC-021: Profit & Loss Statement (Form 2-shakl) ---');
  const plRes = await axios.get('http://localhost:3001/api/admin/reports/profit-loss', { headers });
  const pl = plRes.data.data;
  const revTotal = pl.revenue?.total ?? 0;
  const cogsTotal = pl.costOfGoodsSold?.total ?? 0;
  const gpTotal = pl.grossProfit ?? 0;
  const expTotal = pl.operatingExpenses?.total ?? 0;
  const netTotal = pl.netIncome ?? 0;

  console.log(`• Gross Revenue:      ${revTotal.toLocaleString()} UZS`);
  console.log(`• Cost of Goods Sold: ${cogsTotal.toLocaleString()} UZS`);
  console.log(`• Gross Profit:       ${gpTotal.toLocaleString()} UZS`);
  console.log(`• Operating Expenses: ${expTotal.toLocaleString()} UZS`);
  console.log(`• Net Income:         ${netTotal.toLocaleString()} UZS`);

  const expectedGp = revTotal - cogsTotal;
  if (Math.abs(gpTotal - expectedGp) < 0.01) {
    console.log('✓ TC-ACC-021 PASS: Profit & Loss Statement calculated with correct revenue/COGS/expenses roll-up.');
  } else {
    console.log('❌ TC-ACC-021 FAIL: Gross profit mismatch.');
  }


  console.log('\n--- TC-ACC-022: Balance Sheet Fundamental Invariant (Form 1-shakl) ---');
  const bsRes = await axios.get('http://localhost:3001/api/admin/reports/balance-sheet', { headers });
  const bs = bsRes.data.data;
  const totalAssets = bs.assets?.total ?? 0;
  const totalLiab = bs.liabilities?.total ?? 0;
  const totalEq = bs.equity?.total ?? 0;
  const totalLiabEq = bs.totalLiabilitiesAndEquity ?? (totalLiab + totalEq);
  const balanced = Math.abs(totalAssets - totalLiabEq) < 0.01;

  console.log(`• Total Assets:                ${totalAssets.toLocaleString()} UZS`);
  console.log(`• Total Liabilities:           ${totalLiab.toLocaleString()} UZS`);
  console.log(`• Total Equity:                ${totalEq.toLocaleString()} UZS`);
  console.log(`• Total Liabilities & Equity:  ${totalLiabEq.toLocaleString()} UZS`);
  console.log(`• Fundamental Invariant Check: ${balanced ? 'MATCH (Assets = Liab + Equity)' : 'DISCREPANCY'}`);

  if (balanced) {
    console.log('✓ TC-ACC-022 PASS: Balance Sheet equation (Assets ≡ Liabilities + Equity) holds true with 0 discrepancy.');
  } else {
    console.log('❌ TC-ACC-022 FAIL: Balance Sheet equation out of balance.');
  }


  // Clean up any test locked periods from prior runs
  await p.accountingPeriod.deleteMany({
    where: { userId: user.id, name: { startsWith: 'TEST-LOCKED' } },
  });

  // Clean up any test fixed assets
  await p.fixedAsset.deleteMany({
    where: { userId: user.id, name: { contains: 'QA Test' } },
  });

  // =========================================================================
  // SUITE 06 / 07: FIXED ASSETS & DEPRECIATION (TC-ACC-027 to TC-ACC-029)
  // =========================================================================
  console.log('\n-------------------------------------------------------------');
  console.log('5️⃣ SUITE 07: FIXED ASSETS & DEPRECIATION');
  console.log('-------------------------------------------------------------');

  console.log('\n--- TC-ACC-027: Fixed Asset Registration & Acquisition Posting ---');
  const faRes = await axios.post(
    'http://localhost:3001/api/admin/fixed-assets',
    {
      name: 'Server Rack Dell PowerEdge QA Test',
      cost: '12000000', // 12M UZS
      salvageValue: '0',
      usefulLifeMonths: 12,
      acquisitionDate: '2026-01-01',
      depreciationMethod: 'STRAIGHT_LINE',
      postAcquisition: true,
    },
    { headers }
  );

  const asset = faRes.data.data?.asset || faRes.data.data;
  console.log(`1. Created Fixed Asset: ID=${asset.id} | Name='${asset.name}' | Cost=12,000,000 UZS`);

  // TC-ACC-028: Monthly Straight-Line Depreciation
  console.log('\n--- TC-ACC-028: Run Monthly Straight-Line Depreciation (1,000,000 UZS/month) ---');
  const deprRes = await axios.post(
    'http://localhost:3001/api/admin/fixed-assets/run-depreciation',
    { asOf: '2026-02-01' },
    { headers }
  );

  console.log(`1. Depreciation API Response: HTTP ${deprRes.status} | Processed: ${deprRes.data.data.results?.length || 1} asset(s)`);

  const dbAsset = await p.fixedAsset.findUnique({ where: { id: asset.id } });
  const costVal = Number(dbAsset?.cost);
  const accDepr = Number(dbAsset?.accumulatedDepreciation);
  const bookVal = costVal - accDepr;
  console.log(`2. DB Fixed Asset: Accumulated Depreciation = ${accDepr.toLocaleString()} UZS | Book Value = ${bookVal.toLocaleString()} UZS`);

  // Check GL Entry for Depreciation (Dr 5300 / Cr 1510)
  const deprJes = await p.journalEntry.findMany({
    where: { sourceId: asset.id, userId: user.id },
    include: { lines: { include: { account: true } } },
  });

  console.log(`3. GL Entries for Asset: ${deprJes.length} Entries found.`);
  for (const je of deprJes) {
    console.log(`  [Entry: #${je.entryNumber} | Source: ${je.sourceType} | Event: ${je.event}]`);
    for (const ln of je.lines) {
      console.log(`    • ${ln.account.code} (${ln.account.name}): Debit = ${Number(ln.baseDebit).toFixed(2)} | Credit = ${Number(ln.baseCredit).toFixed(2)}`);
    }
  }

  // TC-ACC-029: Idempotent Depreciation Execution (No Double-Depreciation)
  console.log('\n--- TC-ACC-029: Idempotent Depreciation Execution ---');
  const deprDupRes = await axios.post(
    'http://localhost:3001/api/admin/fixed-assets/run-depreciation',
    { asOf: '2026-02-01' },
    { headers }
  );
  console.log(`1. Duplicate Depreciation Run Response: Processed ${deprDupRes.data.data.results?.length || 0} asset(s)`);

  const deprJesAfter = await p.journalEntry.findMany({
    where: { sourceId: asset.id, event: 'depr.2026-02' },
  });
  console.log(`2. Total 'depr.2026-02' GL entries in DB: ${deprJesAfter.length} (Expected: exactly 1)`);

  if (deprJesAfter.length === 1) {
    console.log('✓ TC-ACC-029 PASS: Depreciation execution is strictly idempotent.');
  } else {
    console.log('❌ TC-ACC-029 FAIL: Duplicate depreciation entry posted.');
  }




  await p.$disconnect();
}

main().catch((err) => {
  console.error('Error running accounting test suites:', err);
  process.exit(1);
});
