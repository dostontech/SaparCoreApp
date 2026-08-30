/**
 * scripts/diagnose-valuation-gap.ts
 *
 * Investigates why GL Inventory, WAC on-hand valuation, and FIFO layers
 * have different totals across the database.
 */

import { PrismaClient, Prisma } from '@prisma/client';

async function main() {
  const p = new PrismaClient();
  const user = await p.user.findFirst({ where: { user_type: 1 } });
  if (!user) throw new Error('No user found');

  console.log('\n=============================================================');
  console.log('🔬 IN-DEPTH VALUATION GAP DIAGNOSIS');
  console.log('=============================================================\n');

  // 1. All inventory rows in database
  const allInventories = await p.inventory.findMany({
    where: { userId: user.id },
    include: { product: true },
  });

  console.log(`Found ${allInventories.length} Inventory rows:`);
  console.log('-------------------------------------------------------------------------------------------------------------');
  console.log('Product Name                    | Code            | Method | QtyOnHand | AvgCost     | Total WAC Value | Deleted');
  console.log('-------------------------------------------------------------------------------------------------------------');

  let activeWacSum = new Prisma.Decimal(0);
  let allWacSum = new Prisma.Decimal(0);

  for (const inv of allInventories) {
    const qty = new Prisma.Decimal(inv.quantityOnHand);
    const avgCost = new Prisma.Decimal(inv.avgCost);
    const val = qty.mul(avgCost);
    allWacSum = allWacSum.add(val);
    if (!inv.isDeleted) activeWacSum = activeWacSum.add(val);

    console.log(
      `${(inv.product?.name || 'Unknown').slice(0, 31).padEnd(31)} | ${(inv.product?.code || 'None').padEnd(15)} | ${(inv.product?.valuationMethod || 'WAC').padEnd(6)} | ${qty.toFixed(2).padStart(9)} | ${avgCost.toFixed(2).padStart(11)} | ${val.toFixed(2).padStart(15)} | ${inv.isDeleted}`
    );
  }

  console.log('-------------------------------------------------------------------------------------------------------------');
  console.log(`Active WAC Sum (isDeleted = false): ${activeWacSum.toFixed(2)} UZS`);
  console.log(`Total WAC Sum (all rows):           ${allWacSum.toFixed(2)} UZS\n`);

  // 2. All FIFO Cost Layers
  const allLayers = await p.inventoryCostLayer.findMany({
    where: { userId: user.id },
    orderBy: { receivedAt: 'asc' },
  });

  console.log(`Found ${allLayers.length} FIFO Cost Layers:`);
  console.log('-------------------------------------------------------------------------------------------------------------');
  console.log('Product Name                    | Layer ID                             | QtyRem   | UnitCost    | Total Layer Val | ReceivedAt');
  console.log('-------------------------------------------------------------------------------------------------------------');

  let activeFifoSum = new Prisma.Decimal(0);
  for (const l of allLayers) {
    const qty = new Prisma.Decimal(l.qtyRemaining);
    const cost = new Prisma.Decimal(l.unitCost);
    const val = qty.mul(cost);
    if (!l.isDeleted) activeFifoSum = activeFifoSum.add(val);

    console.log(
      `${l.productId.slice(0, 31).padEnd(31)} | ${l.id.padEnd(36)} | ${qty.toFixed(2).padStart(8)} | ${cost.toFixed(2).padStart(11)} | ${val.toFixed(2).padStart(15)} | ${l.receivedAt.toISOString().slice(0, 10)}`
    );
  }

  console.log('-------------------------------------------------------------------------------------------------------------');
  console.log(`Active FIFO Layers Sum:             ${activeFifoSum.toFixed(2)} UZS\n`);

  // 3. GL Account 1200 Journal Entries Audit
  const glLines = await p.journalLine.findMany({
    where: {
      account: { code: '1200', userId: user.id },
      journalEntry: { userId: user.id, isDeleted: false },
    },
    include: {
      journalEntry: {
        select: { id: true, entryNumber: true, entryDate: true, sourceType: true, event: true, reference: true },
      },
    },
    orderBy: { journalEntry: { entryDate: 'asc' } },
  });

  console.log(`Found ${glLines.length} Journal Lines on Account 1200 (Inventory Asset):`);
  console.log('-------------------------------------------------------------------------------------------------------------');
  console.log('Entry Date | EntryNo    | SourceType       | Event        | BaseDebit (Dr) | BaseCredit (Cr) | Running Balance');
  console.log('-------------------------------------------------------------------------------------------------------------');

  let runningBal = new Prisma.Decimal(0);
  for (const l of glLines) {
    runningBal = runningBal.add(l.baseDebit).sub(l.baseCredit);
    console.log(
      `${l.journalEntry.entryDate.toISOString().slice(0, 10)} | ${(l.journalEntry.entryNumber || 'None').padEnd(10)} | ${(l.journalEntry.sourceType || 'None').padEnd(16)} | ${(l.journalEntry.event || 'None').padEnd(12)} | ${l.baseDebit.toFixed(2).padStart(14)} | ${l.baseCredit.toFixed(2).padStart(15)} | ${runningBal.toFixed(2).padStart(15)}`
    );
  }

  console.log('-------------------------------------------------------------------------------------------------------------');
  console.log(`Final GL Account 1200 Net Balance:  ${runningBal.toFixed(2)} UZS\n`);

  await p.$disconnect();
}

main().catch((err) => {
  console.error('Error running diagnosis:', err);
  process.exit(1);
});
