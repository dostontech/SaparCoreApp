/**
 * scripts/test-pos-gl-fix.ts
 *
 * Verifies the POS GL auto-posting fix with split tender & COGS,
 * and investigates the inventory valuation figures.
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
  console.log('🧪 TESTING POS GL POSTING FIX & INVESTIGATING VALUATION GAP');
  console.log('=============================================================\n');

  // 1. Get or Open POS Shift
  let shift = await p.posShift.findFirst({ where: { userId: user.id, status: 'OPEN' } });
  if (!shift) {
    const shiftRes = await axios.post(
      'http://localhost:3001/api/admin/pos/shifts/open',
      { openingCash: 100000, notes: 'QA POS GL Test Shift' },
      { headers }
    );
    shift = shiftRes.data.data;
    console.log(`1. Opened new POS Shift: ID=${shift?.id}`);
  } else {
    console.log(`1. Using Active POS Shift: ID=${shift.id}`);
  }

  // 2. Select product for sale with on-hand stock
  const invWithStock = await p.inventory.findFirst({
    where: { userId: user.id, isDeleted: false, quantityOnHand: { gte: 5 } },
    include: { product: true },
  });
  if (!invWithStock || !invWithStock.product) throw new Error('No in-stock product found');
  const testProd = invWithStock.product;
  const stockBefore = Number(invWithStock.quantityOnHand);
  const sellingPrice = Number(testProd.selling_price) > 0 ? Number(testProd.selling_price) : 20000;
  const saleQty = 2;
  const saleTotal = sellingPrice * saleQty;
  const cashAmount = Math.round(saleTotal * 0.6);
  const cardAmount = saleTotal - cashAmount;

  console.log(`2. Selected Product: '${testProd.name}' (Code: ${testProd.code}, Valuation: ${testProd.valuationMethod})`);
  console.log(`   Stock Before Sale: ${stockBefore} units | Unit Price: ${sellingPrice} UZS | Total: ${saleTotal} UZS`);
  console.log(`   Split Tender: Cash = ${cashAmount} UZS | Card/Uzcard = ${cardAmount} UZS`);

  // 3. Perform POS Split-Tender Sale: 2 units
  console.log(`3. Submitting POS Split-Tender Checkout (${cashAmount} UZS Cash + ${cardAmount} UZS Uzcard)...`);
  const posRes = await axios.post(
    'http://localhost:3001/api/admin/pos/checkout',
    {
      items: [
        {
          id: testProd.id,
          name: testProd.name,
          price: sellingPrice,
          quantity: saleQty,
          barcode: testProd.barcode,
        },
      ],
      subtotal: saleTotal,
      discount: 0,
      vatAmount: 0,
      total: saleTotal,
      paymentMethod: 'Split (Cash + Uzcard)',
      cashAmount,
      uzcardAmount: cardAmount,
      humoAmount: 0,
      qrAmount: 0,
      creditAmount: 0,
    },
    { headers }
  );

  console.log(`   ✓ POS Sale Status: HTTP ${posRes.status} | Receipt No: ${posRes.data.data.receiptId}`);

  // 4. Verify Stock Deduction
  const invAfter = await p.inventory.findFirst({
    where: { productId: testProd.id, userId: user.id },
  });
  const stockAfter = Number(invAfter?.quantityOnHand);
  console.log(`4. Stock After Sale: ${stockAfter} units (Decremented by ${stockBefore - stockAfter})`);

  // 5. Verify General Ledger Auto-Posting
  const receipt = await p.posReceipt.findFirst({
    where: { receiptNumber: posRes.data.data.receiptId },
  });
  const invoiceId = receipt?.invoiceId;
  console.log(`5. Linked Invoice ID: ${invoiceId}`);

  const payments = await p.invoicePayment.findMany({ where: { invoiceId: invoiceId ?? undefined } });
  const paymentIds = payments.map((pay) => pay.id);

  const postedJes = await p.journalEntry.findMany({
    where: {
      OR: [
        { sourceId: invoiceId ?? undefined },
        { sourceId: { in: paymentIds } },
      ],
      userId: user.id,
      isDeleted: false,
    },
    include: {
      lines: {
        include: { account: true },
      },
    },
  });

  console.log(`\n--- 📊 GL Journal Entries Posted for this POS Sale: ${postedJes.length} Entries ---`);
  for (const je of postedJes) {
    console.log(`\n  [Entry: ${je.entryNumber} | SourceType: ${je.sourceType} | Event: ${je.event}]`);
    for (const ln of je.lines) {
      console.log(`    • ${ln.account.code} (${ln.account.name}): Debit = ${ln.baseDebit.toFixed(2)} UZS | Credit = ${ln.baseCredit.toFixed(2)} UZS`);
    }
  }

  // Verify tender-specific debits
  const cashLines = postedJes.flatMap((j) => j.lines).filter((l) => l.account.code === '1010' || l.account.name.toLowerCase().includes('cash') || l.account.name.toLowerCase().includes('kassa'));
  const bankLines = postedJes.flatMap((j) => j.lines).filter((l) => l.account.code === '1200' || l.account.name.toLowerCase().includes('bank'));
  const revenueLines = postedJes.flatMap((j) => j.lines).filter((l) => l.account.code === '4001' || l.account.accountType === 'INCOME');
  const cogsLines = postedJes.flatMap((j) => j.lines).filter((l) => l.account.code === '5001' || l.account.accountType === 'EXPENSE');

  console.log('\n--- GL Account Verification ---');
  console.log(`• Revenue Credited:   ${revenueLines.reduce((s, l) => s.add(l.baseCredit), new Prisma.Decimal(0)).toFixed(2)} UZS (Expected: 40,000.00 UZS)`);
  console.log(`• Cash Debited:       ${cashLines.reduce((s, l) => s.add(l.baseDebit), new Prisma.Decimal(0)).toFixed(2)} UZS (Expected: 25,000.00 UZS)`);
  console.log(`• Bank/Card Debited:  ${bankLines.reduce((s, l) => s.add(l.baseDebit), new Prisma.Decimal(0)).toFixed(2)} UZS (Expected: 15,000.00 UZS)`);
  console.log(`• COGS Debited:       ${cogsLines.reduce((s, l) => s.add(l.baseDebit), new Prisma.Decimal(0)).toFixed(2)} UZS (2 units × 14,000 cost = 28,000.00 UZS)`);

  // =========================================================================
  // 6. Detailed Investigation of Valuation Figures
  // =========================================================================
  console.log('\n=============================================================');
  console.log('🔍 IN-DEPTH INVENTORY VALUATION INVESTIGATION');
  console.log('=============================================================\n');

  const allProducts = await p.product.findMany({
    where: { enable_inventory: true },
    include: {
      inventories: { where: { userId: user.id, isDeleted: false } },
    },
  });

  console.log('Product Catalog & Inventory State:');
  console.log('---------------------------------------------------------------------------------------------------------');
  console.log('Code           | Valuation | On-Hand Qty | WAC AvgCost | WAC Value      | FIFO Layers Count | FIFO Layers Sum');
  console.log('---------------------------------------------------------------------------------------------------------');

  let totalWacSum = new Prisma.Decimal(0);
  let totalFifoSum = new Prisma.Decimal(0);

  for (const prod of allProducts) {
    const inv = prod.inventories[0];
    const qty = new Prisma.Decimal(inv?.quantityOnHand ?? 0);
    const avgCost = new Prisma.Decimal(inv?.avgCost ?? 0);
    const wacVal = qty.mul(avgCost);
    totalWacSum = totalWacSum.add(wacVal);

    const layers = await p.inventoryCostLayer.findMany({
      where: { productId: prod.id, userId: user.id, isDeleted: false },
    });
    const layerSum = layers.reduce((sum, l) => sum.add(new Prisma.Decimal(l.qtyRemaining).mul(l.unitCost)), new Prisma.Decimal(0));
    totalFifoSum = totalFifoSum.add(layerSum);

    console.log(
      `${prod.code.padEnd(14)} | ${prod.valuationMethod.padEnd(9)} | ${qty.toFixed(2).padStart(11)} | ${avgCost.toFixed(2).padStart(11)} | ${wacVal.toFixed(2).padStart(14)} | ${String(layers.length).padStart(17)} | ${layerSum.toFixed(2).padStart(15)}`
    );
  }

  console.log('---------------------------------------------------------------------------------------------------------');
  console.log(`TOTAL WAC VALUATION:   ${totalWacSum.toFixed(2)} UZS`);
  console.log(`TOTAL FIFO VALUATION:  ${totalFifoSum.toFixed(2)} UZS`);

  const glInventoryAcc = await p.account.findFirst({
    where: { userId: user.id, code: '1200' },
    include: {
      journalLines: {
        where: { journalEntry: { userId: user.id, isDeleted: false } },
        select: { baseDebit: true, baseCredit: true },
      },
    },
  });

  let glNet = new Prisma.Decimal(0);
  if (glInventoryAcc) {
    for (const l of glInventoryAcc.journalLines) {
      glNet = glNet.add(l.baseDebit).sub(l.baseCredit);
    }
  }

  console.log(`GL INVENTORY (1200):   ${glNet.toFixed(2)} UZS`);

  await p.$disconnect();
}

main().catch((err) => {
  console.error('Error running test:', err);
  process.exit(1);
});
