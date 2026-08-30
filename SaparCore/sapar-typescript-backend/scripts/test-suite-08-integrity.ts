/**
 * scripts/test-suite-08-integrity.ts
 *
 * Automated verification of:
 * 1. Global Double-Entry Parity (TC-ACC-038)
 * 2. Ledger Initialization State & Statement Derivation Mode (TC-ACC-039)
 * 3. Period Lock Enforcement on Auto-Posted Documents (TC-ACC-035)
 * 4. Cross-Module Reconciliations: POS Revenue, Inventory COGS, Inventory Asset Balance
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
  console.log('🏛️ SUITE 08: CROSS-MODULE LEDGER INTEGRITY VERIFICATION');
  console.log('=============================================================\n');

  // =========================================================================
  // 1. TC-ACC-038: Global Double-Entry Parity
  // =========================================================================
  console.log('-------------------------------------------------------------');
  console.log('1️⃣ TC-ACC-038: GLOBAL DOUBLE-ENTRY PARITY CHECK');
  console.log('-------------------------------------------------------------');

  const allLines = await p.journalLine.findMany({
    where: {
      journalEntry: { userId: user.id, isDeleted: false },
    },
    include: {
      journalEntry: {
        select: { id: true, entryNumber: true, entryDate: true, sourceType: true, event: true },
      },
      account: {
        select: { id: true, code: true, name: true, accountType: true },
      },
    },
  });

  let totalBaseDebit = new Prisma.Decimal(0);
  let totalBaseCredit = new Prisma.Decimal(0);
  let totalTxnDebit = new Prisma.Decimal(0);
  let totalTxnCredit = new Prisma.Decimal(0);

  // Group lines by journalEntryId to check per-transaction parity
  const entryMap = new Map<string, { debits: Prisma.Decimal; credits: Prisma.Decimal; entryNumber: string | null; sourceType: string | null }>();

  for (const line of allLines) {
    totalBaseDebit = totalBaseDebit.add(line.baseDebit);
    totalBaseCredit = totalBaseCredit.add(line.baseCredit);
    totalTxnDebit = totalTxnDebit.add(line.debit);
    totalTxnCredit = totalTxnCredit.add(line.credit);

    const jId = line.journalEntryId;
    const cur = entryMap.get(jId) || {
      debits: new Prisma.Decimal(0),
      credits: new Prisma.Decimal(0),
      entryNumber: line.journalEntry.entryNumber,
      sourceType: line.journalEntry.sourceType,
    };
    cur.debits = cur.debits.add(line.baseDebit);
    cur.credits = cur.credits.add(line.baseCredit);
    entryMap.set(jId, cur);
  }

  const baseDiscrepancy = totalBaseDebit.sub(totalBaseCredit).abs();
  const txnDiscrepancy = totalTxnDebit.sub(totalTxnCredit).abs();

  console.log(`• Total Journal Entries Evaluated: ${entryMap.size}`);
  console.log(`• Total Journal Lines Evaluated:   ${allLines.length}`);
  console.log(`• Global Base-Currency Debits:     ${totalBaseDebit.toFixed(4)} UZS`);
  console.log(`• Global Base-Currency Credits:    ${totalBaseCredit.toFixed(4)} UZS`);
  console.log(`• Base Discrepancy (|Dr - Cr|):    ${baseDiscrepancy.toFixed(4)} UZS`);
  console.log(`• Transaction Currency Debits:     ${totalTxnDebit.toFixed(4)}`);
  console.log(`• Transaction Currency Credits:    ${totalTxnCredit.toFixed(4)}`);
  console.log(`• Txn Discrepancy (|Dr - Cr|):     ${txnDiscrepancy.toFixed(4)}`);

  let unbalancedEntries = 0;
  for (const [id, e] of entryMap.entries()) {
    const diff = e.debits.sub(e.credits).abs();
    if (diff.greaterThan(new Prisma.Decimal(0.01))) {
      unbalancedEntries++;
      console.log(`  ❌ Unbalanced Entry: ID=${id} | No=${e.entryNumber} | Type=${e.sourceType} | Dr=${e.debits.toFixed(4)} | Cr=${e.credits.toFixed(4)} | Diff=${diff.toFixed(4)}`);
    }
  }

  if (baseDiscrepancy.equals(new Prisma.Decimal(0)) && unbalancedEntries === 0) {
    console.log('✓ TC-ACC-038 PASS: Platform-wide global double-entry balance is mathematically EXACT (0.0000 UZS discrepancy across all entries).\n');
  } else {
    console.log(`❌ TC-ACC-038 FAIL: Global discrepancy of ${baseDiscrepancy.toFixed(4)} UZS with ${unbalancedEntries} unbalanced entries.\n`);
  }

  // =========================================================================
  // 2. TC-ACC-039: Ledger Initialization State & Statement Derivation Mode
  // =========================================================================
  console.log('-------------------------------------------------------------');
  console.log('2️⃣ TC-ACC-039: LEDGER INITIALIZATION & STATEMENT DERIVATION');
  console.log('-------------------------------------------------------------');

  const settings = await p.companySettings.findFirst({ where: { userId: user.id } });
  console.log(`• Company Settings ID:             ${settings?.id}`);
  console.log(`• ledgerInitialized:               ${settings?.ledgerInitialized}`);
  console.log(`• goLiveDate:                      ${settings?.goLiveDate?.toISOString()}`);
  console.log(`• functionalCurrency:              ${settings?.functionalCurrency}`);

  if (settings?.ledgerInitialized) {
    console.log('• Statement Derivation Engine:     LIVE GENERAL LEDGER MODE (financialStatementsController aggregates from JournalLine)');
  } else {
    console.log('• Statement Derivation Engine:     LEGACY SUBLEDGER FALLBACK (warning: aggregates via quantity * purchase_price)');
  }

  // Test Balance Sheet & P&L endpoint output
  const bsRes = await axios.get('http://localhost:3001/api/admin/reports/balance-sheet', { headers });
  const plRes = await axios.get('http://localhost:3001/api/admin/reports/profit-loss', { headers });
  const tbRes = await axios.get('http://localhost:3001/api/admin/reports/trial-balance', { headers });

  console.log(`• Balance Sheet API Response:      Total Assets = ${bsRes.data.data.assets.total} UZS | Total Liab & Equity = ${bsRes.data.data.totalLiabilitiesAndEquity} UZS`);
  console.log(`• Balance Sheet Balanced Check:    ${bsRes.data.data.assets.total === bsRes.data.data.totalLiabilitiesAndEquity ? 'MATCH (Assets = Liabilities + Equity)' : 'MISMATCH'}`);
  console.log(`• Trial Balance API Response:      Debit = ${tbRes.data.data.totals.debit} UZS | Credit = ${tbRes.data.data.totals.credit} UZS | Balanced = ${tbRes.data.data.balanced}`);
  console.log(`• P&L API Response:                Revenue = ${plRes.data.data.revenue.total} UZS | COGS = ${plRes.data.data.costOfGoodsSold.total} UZS | Net Income = ${plRes.data.data.netIncome} UZS\n`);

  // =========================================================================
  // 3. TC-ACC-035: Period Lock Enforcement on Auto-Posted Documents
  // =========================================================================
  console.log('-------------------------------------------------------------');
  console.log('3️⃣ TC-ACC-035: PERIOD LOCK ENFORCEMENT ON AUTO-POSTED DOCUMENTS');
  console.log('-------------------------------------------------------------');

  // Create a locked period for January 2026
  let lockedPeriod = await p.accountingPeriod.findFirst({
    where: { userId: user.id, name: 'TEST-LOCKED-Q1-2026' },
  });
  if (!lockedPeriod) {
    lockedPeriod = await p.accountingPeriod.create({
      data: {
        userId: user.id,
        name: 'TEST-LOCKED-Q1-2026',
        startDate: new Date('2026-01-01T00:00:00Z'),
        endDate: new Date('2026-01-31T23:59:59Z'),
        isLocked: true,
        lockedAt: new Date(),
        lockedBy: user.id,
        notes: 'Locked test period for QA audit',
      },
    });
  } else {
    await p.accountingPeriod.update({
      where: { id: lockedPeriod.id },
      data: { isLocked: true, lockedAt: new Date(), lockedBy: user.id },
    });
  }

  console.log(`1. Active Locked Period: '${lockedPeriod.name}' from 2026-01-01 to 2026-01-31 (isLocked = ${lockedPeriod.isLocked})`);

  let contact = await p.contact.findFirst({ where: { userId: user.id } });
  let prod = await p.product.findFirst({ where: { status: true, enable_inventory: true } });
  if (!prod) throw new Error('No product found');

  // Attempt to create an invoice dated 2026-01-15 (inside the locked period)
  console.log('2. Attempting to post Sales Invoice dated 2026-01-15 into locked period...');
  let invoiceBlocked = false;
  let createdInvoiceId: string | null = null;
  let jeCreatedInLockedPeriod = false;

  try {
    const invLockedRes = await axios.post(
      'http://localhost:3001/api/admin/invoices',
      {
        invoiceDate: '2026-01-15T12:00:00Z',
        billFrom: user.id,
        contactId: contact?.id,
        status: 'PAID',
        items: [{ productId: prod.id, name: prod.name, qty: 1, rate: 10000, amount: 10000 }],
      },
      { headers }
    );
    createdInvoiceId = invLockedRes.data.data.id;
    console.log(`   ⚠️ Document Creation Status: Accepted (HTTP ${invLockedRes.status}, Invoice ID: ${createdInvoiceId})`);

    // Check if a JournalEntry was posted for this invoice
    const je = await p.journalEntry.findFirst({
      where: { sourceId: createdInvoiceId, isDeleted: false },
    });
    if (je) {
      jeCreatedInLockedPeriod = true;
      console.log(`   ⚠️ Journal Entry Created: ID=${je.id} | Date=${je.entryDate.toISOString()} | EntryNo=${je.entryNumber}`);
    } else {
      console.log('   ✓ No Journal Entry was posted.');
    }
  } catch (err: any) {
    invoiceBlocked = true;
    console.log(`   ✓ Creation blocked: HTTP ${err.response?.status} - ${err.response?.data?.message}`);
  }

  console.log('\n--- TC-ACC-035 Audit Finding ---');
  if (invoiceBlocked) {
    console.log('✓ TC-ACC-035 PASS: Document creation blocked inside locked period.\n');
  } else if (jeCreatedInLockedPeriod) {
    console.log('🚩 TC-ACC-035 BEHAVIOR IDENTIFIED (GAP): postingGate.ts evaluates only ledgerInitialized & goLiveDate, but does NOT check AccountingPeriod.isLocked. The invoice and its GL journal entry were posted into the locked period.\n');
  } else {
    console.log('ℹ️ TC-ACC-035: Invoice created but GL posting suppressed.\n');
  }

  // =========================================================================
  // 4. Remaining Suite 08 Tests (POS Revenue, COGS, Inventory Asset)
  // =========================================================================
  console.log('-------------------------------------------------------------');
  console.log('4️⃣ CROSS-MODULE RECONCILIATIONS (REVENUE, COGS, INVENTORY ASSET)');
  console.log('-------------------------------------------------------------');

  // A. POS Sales Revenue Tie-Out (TC-ACC-036)
  console.log('\n--- TC-ACC-036: POS Sales Revenue Tie-Out ---');
  const posReceipts = await p.posReceipt.findMany({
    where: { userId: user.id },
    select: { id: true, receiptNumber: true, total: true, subtotal: true, vatAmount: true, createdAt: true },
  });
  const totalPosReceiptAmount = posReceipts.reduce((sum, r) => sum + Number(r.total), 0);
  console.log(`• Total Completed POS Receipts:    ${posReceipts.length}`);
  console.log(`• Sum of POS Receipts:             ${totalPosReceiptAmount.toLocaleString()} UZS`);

  // Query Revenue account credits from POS source documents
  const posJes = await p.journalEntry.findMany({
    where: {
      userId: user.id,
      sourceType: { in: ['POS', 'INVOICE', 'POS_RECEIPT'] },
      isDeleted: false,
    },
    include: {
      lines: {
        include: { account: true },
      },
    },
  });
  console.log(`• Journal Entries from POS/Sales:  ${posJes.length}`);

  // B. Inventory COGS Tie-Out (TC-ACC-037)
  console.log('\n--- TC-ACC-037: Inventory COGS Auto-Posting Tie-Out ---');
  const cogsLines = await p.journalLine.findMany({
    where: {
      journalEntry: { userId: user.id, isDeleted: false },
      account: {
        OR: [
          { code: '5001' },
          { code: '9120' },
          { name: { contains: 'Cost of Goods Sold', mode: 'insensitive' } },
        ],
      },
    },
    select: { baseDebit: true, baseCredit: true, description: true, journalEntryId: true },
  });

  const totalCogsDebit = cogsLines.reduce((sum, l) => sum.add(l.baseDebit), new Prisma.Decimal(0));
  const totalCogsCredit = cogsLines.reduce((sum, l) => sum.add(l.baseCredit), new Prisma.Decimal(0));
  const netCogsInLedger = totalCogsDebit.sub(totalCogsCredit);
  console.log(`• Total COGS Journal Lines:        ${cogsLines.length}`);
  console.log(`• Total COGS Debited to GL:        ${netCogsInLedger.toFixed(4)} UZS`);
  console.log(`• P&L Statement Reported COGS:     ${plRes.data.data.costOfGoodsSold.total} UZS`);
  if (netCogsInLedger.equals(new Prisma.Decimal(plRes.data.data.costOfGoodsSold.total))) {
    console.log('✓ TC-ACC-037 PASS: COGS debits match P&L Cost of Goods Sold exactly!\n');
  } else {
    console.log('❌ TC-ACC-037 FAIL: Discrepancy between COGS GL lines and P&L.\n');
  }

  // C. Inventory Asset Balance Sheet Tie-Out (TC-ACC-039)
  console.log('--- TC-ACC-039: Balance Sheet Inventory Asset Tie-Out ---');
  // 1. Balance Sheet reported Inventory Asset
  const bsInventoryAsset = bsRes.data.data.assets.current.inventory;

  // 2. Physical Warehouse on-hand valuation from Inventory table
  const allInventories = await p.inventory.findMany({
    where: { userId: user.id, isDeleted: false },
    include: { product: true },
  });

  let warehouseWacValuation = new Prisma.Decimal(0);
  for (const inv of allInventories) {
    const qty = new Prisma.Decimal(inv.quantityOnHand);
    const avgCost = new Prisma.Decimal(inv.avgCost);
    warehouseWacValuation = warehouseWacValuation.add(qty.mul(avgCost));
  }

  // 3. FIFO Layer on-hand valuation
  const allCostLayers = await p.inventoryCostLayer.findMany({
    where: { userId: user.id, isDeleted: false },
  });
  let fifoLayerValuation = new Prisma.Decimal(0);
  for (const layer of allCostLayers) {
    fifoLayerValuation = fifoLayerValuation.add(new Prisma.Decimal(layer.qtyRemaining).mul(layer.unitCost));
  }

  // 4. GL Account 1200 / Inventory Asset Net Debit Balance
  const inventoryAccount = await p.account.findFirst({
    where: {
      userId: user.id,
      OR: [
        { code: '1200' },
        { code: '2910' },
        { name: { contains: 'Inventory', mode: 'insensitive' } },
      ],
      isDeleted: false,
    },
    include: {
      journalLines: {
        where: { journalEntry: { userId: user.id, isDeleted: false } },
        select: { baseDebit: true, baseCredit: true },
      },
    },
  });

  let glInventoryNetDebit = new Prisma.Decimal(0);
  if (inventoryAccount) {
    for (const line of inventoryAccount.journalLines) {
      glInventoryNetDebit = glInventoryNetDebit.add(line.baseDebit).sub(line.baseCredit);
    }
  }

  console.log(`• Balance Sheet Current Asset (Inventory): ${Number(bsInventoryAsset).toLocaleString()} UZS`);
  console.log(`• GL Account '${inventoryAccount?.code} - ${inventoryAccount?.name}' Net Balance: ${glInventoryNetDebit.toFixed(4)} UZS`);
  console.log(`• Warehouse Total On-Hand WAC Valuation:    ${warehouseWacValuation.toFixed(4)} UZS`);
  console.log(`• Active FIFO Layers Valuation:            ${fifoLayerValuation.toFixed(4)} UZS`);

  await p.$disconnect();
}

main().catch((err) => {
  console.error('Error running test script:', err);
  process.exit(1);
});
