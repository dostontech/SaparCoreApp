import dotenv from 'dotenv';
dotenv.config();

import { postOpeningStock, type PostingTx } from '../lib/ledger/ledgerPosting';
import { toDecimal } from '../lib/ledger/money';

async function runOpeningStockGlTests() {
  console.log('\n=============================================================');
  console.log('🏛️ OPENING STOCK GL POSTING & LEDGER PARITY TEST SUITE');
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

  // 1. Mock Posting Transaction with ledger mapping & accounts
  const createdEntries: any[] = [];
  const mockTx: PostingTx = {
    companySettings: {
      findFirst: async () => ({
        ledgerInitialized: true,
        goLiveDate: new Date('2026-01-01'),
      }),
    },
    accountingPeriod: {
      findFirst: async () => null, // Not locked
    },
    ledgerAccountMapping: {
      findMany: async () => [
        { roleKey: 'INVENTORY', accountId: 'acc-2910' },
        { roleKey: 'OPENING_BALANCE_EQUITY', accountId: 'acc-8330' },
      ],
    },
    journalEntry: {
      findFirst: async () => null,
      create: async (args: any) => {
        createdEntries.push(args.data);
        return { id: `je-open-${Date.now()}` };
      },
      update: async () => ({ id: 'updated' }),
    },
  };

  console.log('1. Testing postOpeningStock Double-Entry Creation:');
  const userId = 'tenant-client-onboarding';
  const stockQty = 50;
  const unitCost = 120000; // 120,000 UZS
  const totalCost = (stockQty * unitCost).toFixed(4); // 6,000,000.0000 UZS

  const entry = await postOpeningStock(mockTx, {
    userId,
    productId: 'prod-cement-400',
    productCode: 'CEMENT-M400',
    productName: 'Sement M-400 (50kg)',
    cost: totalCost,
  });

  assert(Boolean(entry?.id), `Opening journal entry generated successfully: ${entry?.id}`);
  assert(createdEntries.length === 1, 'Exactly 1 journal entry persisted');

  const posted = createdEntries[0];
  const lines = posted?.lines?.create || [];
  console.log(`   • Stamped Description: "${posted?.description}"`);
  console.log(`   • Stamped SourceType: "${posted?.sourceType}"`);
  console.log(`   • Number of Ledger Lines: ${lines.length}`);

  assert(posted?.sourceType === 'OPENING_STOCK', 'Source type is OPENING_STOCK');
  assert(lines.length === 2, 'Entry contains exactly 2 balanced lines');

  // 2. Assert Debit / Credit Equality
  const debits = lines.reduce((sum: any, l: any) => sum.plus(toDecimal(l.debit || 0)), toDecimal(0));
  const credits = lines.reduce((sum: any, l: any) => sum.plus(toDecimal(l.credit || 0)), toDecimal(0));

  console.log(`\n2. Verifying Double-Entry Equality (Debits === Credits):`);
  console.log(`   • Total Debits:  ${debits.toFixed(2)} UZS (Dr 2910 Inventory)`);
  console.log(`   • Total Credits: ${credits.toFixed(2)} UZS (Cr 8330 Opening Balance Equity)`);

  assert(debits.equals(credits), 'Debits strictly equal Credits (0.00 discrepancy)');
  assert(debits.equals(toDecimal(totalCost)), `Posted amount matches cost valuation: ${totalCost} UZS`);

  // 3. Assert correct account mapping
  const debitLine = lines.find((l: any) => toDecimal(l.debit).greaterThan(0));
  const creditLine = lines.find((l: any) => toDecimal(l.credit).greaterThan(0));

  assert(debitLine?.accountId === 'acc-2910', 'Debit line targets Account 2910 (Inventory Asset)');
  assert(creditLine?.accountId === 'acc-8330', 'Credit line targets Account 8330 (Opening Equity)');

  console.log('\n=============================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runOpeningStockGlTests().catch(console.error);
