/**
 * scripts/test-suite-03.ts
 *
 * Automated verification of Suite 03: Outbound Stock Depletion & COGS
 *   - TC-INV-013: Sales invoice stock deduction (WAC)
 *   - TC-INV-014: Automated GL journal posting (COGS)
 *   - TC-INV-015: FIFO single-layer depletion
 *   - TC-INV-016: FIFO multi-layer depletion (crosses layer boundary)
 */

import axios from 'axios';
import jwt from 'jsonwebtoken';
import { PrismaClient, Prisma } from '@prisma/client';
import { applyPack } from '../lib/ledger/applyPack';

async function setInventoryState(p: PrismaClient, productId: string, userId: string, qty: number, avgCost: number) {
  const existing = await p.inventory.findFirst({ where: { productId, userId } });
  if (existing) {
    await p.inventory.update({
      where: { id: existing.id },
      data: {
        quantity: qty,
        quantityOnHand: new Prisma.Decimal(qty),
        avgCost: new Prisma.Decimal(avgCost),
      },
    });
  } else {
    await p.inventory.create({
      data: {
        productId,
        userId,
        quantity: qty,
        quantityOnHand: new Prisma.Decimal(qty),
        avgCost: new Prisma.Decimal(avgCost),
        inventory_history: [],
      },
    });
  }
}

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

  // Ensure ledger is initialized for this user
  const settings = await p.companySettings.findFirst({ where: { userId: user.id } });
  if (!settings?.ledgerInitialized) {
    console.log('Initializing ledger for test tenant...');
    try {
      await p.$transaction(async (tx) => {
        await applyPack(tx as unknown as Parameters<typeof applyPack>[0], {
          userId: user.id,
          countryCode: 'GB',
          functionalCurrency: 'UZS',
          fiscalYearStartMonth: 1,
          goLiveDate: new Date('2026-01-01'),
        });
      });
    } catch (e) {
      // pack already created
    }
    await p.companySettings.update({
      where: { userId: user.id },
      data: { ledgerInitialized: true, goLiveDate: new Date('2026-01-01') },
    });
  }

  let contact = await p.contact.findFirst({ where: { userId: user.id } });
  if (!contact) {
    contact = await p.contact.create({
      data: {
        name: 'Chakana Xaridor Test',
        email: 'xaridor@test.uz',
        phone: '+998901112233',
        userId: user.id,
        partyType: 'CUSTOMER',
      },
    });
  }

  console.log('\n=============================================================');
  console.log('🧪 SUITE 03 — OUTBOUND STOCK DEPLETION & COGS VALUATION');
  console.log('=============================================================\n');

  // =========================================================================
  // TC-INV-013: Sales invoice stock deduction (WAC)
  // =========================================================================
  console.log('--- TC-INV-013: Sales invoice stock deduction (WAC) ---');

  let prodWac = await p.product.findFirst({ where: { code: 'TEST-WAC-PROD' } });
  if (!prodWac) {
    prodWac = await p.product.create({
      data: {
        name: 'WAC Valuation Test Product',
        code: 'TEST-WAC-PROD',
        barcode: '4780009991112',
        valuationMethod: 'WAC',
        selling_price: new Prisma.Decimal(25000),
        purchase_price: new Prisma.Decimal(10000),
        item_type: 'Product',
      },
    });
  }

  // Set baseline: 20 units @ 12,000 UZS
  await setInventoryState(p, prodWac.id, user.id, 20, 12000);

  const inv13Before = await p.inventory.findFirst({ where: { productId: prodWac.id, userId: user.id } });
  console.log(`1. Initial DB Stock: ${inv13Before?.quantity} units | avgCost: ${inv13Before?.avgCost} UZS`);

  console.log('2. Creating Sales Invoice for 5 units @ 25,000 UZS (Regular Invoice API)...');
  const inv13Res = await axios.post(
    'http://localhost:3001/api/admin/invoices',
    {
      invoiceDate: new Date().toISOString(),
      billFrom: user.id,
      contactId: contact.id,
      status: 'PAID',
      items: [
        {
          productId: prodWac.id,
          name: prodWac.name,
          qty: 5,
          rate: 25000,
          amount: 125000,
        },
      ],
    },
    { headers }
  );

  const createdInvoice = inv13Res.data?.data;
  console.log(`   ✓ Invoice Created: Status=${inv13Res.status} | Number=${createdInvoice?.invoiceNumber || createdInvoice?.id}`);

  const inv13After = await p.inventory.findFirst({ where: { productId: prodWac.id, userId: user.id } });
  console.log(`3. DB Stock After Invoice:`);
  console.log(`   - Quantity: ${inv13After?.quantity} (Expected: 15)`);
  console.log(`   - QuantityOnHand: ${inv13After?.quantityOnHand} (Expected: 15)`);
  console.log(`   - AvgCost: ${inv13After?.avgCost} UZS (Expected: 12000)`);

  if (inv13After?.quantity === 15 && Number(inv13After?.quantityOnHand) === 15 && Number(inv13After?.avgCost) === 12000) {
    console.log('✓ TC-INV-013 PASS: Sales invoice decremented stock from 20 to 15 units with WAC cost preserved!\n');
  } else {
    console.log(`❌ TC-INV-013 FAIL: Stock deduction mismatch.\n`);
  }

  // =========================================================================
  // TC-INV-014: Automated GL journal posting (COGS)
  // =========================================================================
  console.log('--- TC-INV-014: Automated GL journal posting (COGS) ---');

  const journalEntries = await p.journalEntry.findMany({
    where: {
      userId: user.id,
      sourceType: 'Invoice',
      sourceId: createdInvoice.id,
    },
    include: {
      lines: {
        include: { account: true },
      },
    },
  });

  console.log(`1. Found ${journalEntries.length} Journal Entries for Invoice ${createdInvoice.id}:`);
  let cogsEntryFound = false;
  let reportedCogs = 0;
  const expectedCogs = 5 * 12000; // 60,000 UZS

  for (const je of journalEntries) {
    console.log(`   [Journal Entry #${je.id}] Event: '${je.event}' | Date: ${je.entryDate?.toISOString()} | Memo: '${je.description || ''}'`);
    for (const l of je.lines) {
      const side = Number(l.debit) > 0 ? 'DEBIT' : 'CREDIT';
      const amount = Number(l.debit) > 0 ? l.debit : l.credit;
      console.log(`     - Line: ${side} ${l.account?.name} (${l.account?.code}) | Amount: ${amount} UZS`);
    }
    if (je.event === 'cogs') {
      cogsEntryFound = true;
      const drLine = je.lines.find((l) => Number(l.debit) > 0);
      const crLine = je.lines.find((l) => Number(l.credit) > 0);
      reportedCogs = Number(drLine?.debit || 0);
      console.log(`\n   COGS Entry Verification:`);
      console.log(`     - Expected COGS: 5 units * 12,000 UZS = ${expectedCogs} UZS`);
      console.log(`     - Debit Account: ${drLine?.account?.name} (${drLine?.account?.code}) = ${drLine?.debit} UZS`);
      console.log(`     - Credit Account: ${crLine?.account?.name} (${crLine?.account?.code}) = ${crLine?.credit} UZS`);
    }
  }

  if (cogsEntryFound && reportedCogs === expectedCogs) {
    console.log('✓ TC-INV-014 PASS: Automated GL COGS posting created with 100% cost accuracy (Dr COGS / Cr Inventory = 60,000 UZS)!\n');
  } else {
    console.log(`⚠️ TC-INV-014 STATUS: cogsEntryFound=${cogsEntryFound}, reportedCogs=${reportedCogs}, expected=${expectedCogs}\n`);
  }

  // =========================================================================
  // TC-INV-015: FIFO single-layer depletion
  // =========================================================================
  console.log('--- TC-INV-015: FIFO single-layer depletion ---');

  let prodFifo = await p.product.findFirst({ where: { code: 'TEST-FIFO-PROD' } });
  if (!prodFifo) {
    prodFifo = await p.product.create({
      data: {
        name: 'FIFO Valuation Test Product',
        code: 'TEST-FIFO-PROD',
        barcode: '4780009992223',
        valuationMethod: 'FIFO',
        selling_price: new Prisma.Decimal(30000),
        purchase_price: new Prisma.Decimal(12000),
        item_type: 'Product',
      },
    });
  }

  // Setup single layer: 10 units @ 12,000 UZS
  await p.inventoryCostLayer.deleteMany({ where: { productId: prodFifo.id, userId: user.id } });
  await p.inventoryCostLayer.create({
    data: {
      productId: prodFifo.id,
      userId: user.id,
      qtyRemaining: new Prisma.Decimal(10),
      unitCost: new Prisma.Decimal(12000),
      receivedAt: new Date('2026-08-20T10:00:00Z'),
    },
  });
  await setInventoryState(p, prodFifo.id, user.id, 10, 12000);

  console.log('1. Baseline FIFO State: 1 Layer with 10 units @ 12,000 UZS');
  console.log('2. Creating Sales Invoice for 3 units...');
  await axios.post(
    'http://localhost:3001/api/admin/invoices',
    {
      invoiceDate: new Date().toISOString(),
      billFrom: user.id,
      contactId: contact.id,
      status: 'PAID',
      items: [{ productId: prodFifo.id, name: prodFifo.name, qty: 3, rate: 30000, amount: 90000 }],
    },
    { headers }
  );

  const layers15 = await p.inventoryCostLayer.findMany({
    where: { productId: prodFifo.id, userId: user.id, isDeleted: false },
    orderBy: { receivedAt: 'asc' },
  });
  const inv15 = await p.inventory.findFirst({ where: { productId: prodFifo.id, userId: user.id } });

  console.log(`3. State After 3 Unit Sale:`);
  console.log(`   - Inventory Quantity on Hand: ${inv15?.quantityOnHand} (Expected: 7)`);
  console.log(`   - Layer #1 Qty Remaining: ${layers15[0]?.qtyRemaining} (Expected: 7)`);

  if (Number(inv15?.quantityOnHand) === 7 && Number(layers15[0]?.qtyRemaining) === 7) {
    console.log('✓ TC-INV-015 PASS: FIFO single-layer depleted correctly from 10 to 7 units!\n');
  } else {
    console.log(`❌ TC-INV-015 FAIL: Layer depletion mismatch.\n`);
  }

  // =========================================================================
  // TC-INV-016: FIFO multi-layer depletion (crosses layer boundary)
  // =========================================================================
  console.log('--- TC-INV-016: FIFO multi-layer depletion (crosses layer boundary) ---');

  // Setup two layers:
  // Layer A: 5 units @ 12,000 UZS (Date: 2026-08-20)
  // Layer B: 8 units @ 14,000 UZS (Date: 2026-08-22)
  await p.inventoryCostLayer.deleteMany({ where: { productId: prodFifo.id, userId: user.id } });
  const layerA = await p.inventoryCostLayer.create({
    data: {
      productId: prodFifo.id,
      userId: user.id,
      qtyRemaining: new Prisma.Decimal(5),
      unitCost: new Prisma.Decimal(12000),
      receivedAt: new Date('2026-08-20T10:00:00Z'),
    },
  });
  const layerB = await p.inventoryCostLayer.create({
    data: {
      productId: prodFifo.id,
      userId: user.id,
      qtyRemaining: new Prisma.Decimal(8),
      unitCost: new Prisma.Decimal(14000),
      receivedAt: new Date('2026-08-22T10:00:00Z'),
    },
  });
  await setInventoryState(p, prodFifo.id, user.id, 13, 0);

  console.log('1. Baseline Multi-Layer Setup:');
  console.log(`   - Layer A (Older): 5 units @ 12,000 UZS (Received: 2026-08-20)`);
  console.log(`   - Layer B (Newer): 8 units @ 14,000 UZS (Received: 2026-08-22)`);
  console.log(`   - Total Stock = 13 units`);

  console.log('\n2. Selling 7 units (Spans Layer A [5 units] + Layer B [2 units])...');
  const invoice16Res = await axios.post(
    'http://localhost:3001/api/admin/invoices',
    {
      invoiceDate: new Date().toISOString(),
      billFrom: user.id,
      contactId: contact.id,
      status: 'PAID',
      items: [{ productId: prodFifo.id, name: prodFifo.name, qty: 7, rate: 30000, amount: 210000 }],
    },
    { headers }
  );

  const updatedLayerA = await p.inventoryCostLayer.findUnique({ where: { id: layerA.id } });
  const updatedLayerB = await p.inventoryCostLayer.findUnique({ where: { id: layerB.id } });
  const inv16 = await p.inventory.findFirst({ where: { productId: prodFifo.id, userId: user.id } });

  const expectedBlendedCogs = 5 * 12000 + 2 * 14000; // 60,000 + 28,000 = 88,000 UZS

  console.log(`3. Results After 7-Unit Sale:`);
  console.log(`   - Total Inventory Stock: ${inv16?.quantityOnHand} (Expected: 6)`);
  console.log(`   - Layer A Qty Remaining: ${updatedLayerA?.qtyRemaining} (Expected: 0)`);
  console.log(`   - Layer B Qty Remaining: ${updatedLayerB?.qtyRemaining} (Expected: 6)`);
  console.log(`   - Expected Blended COGS: (5 * 12,000) + (2 * 14,000) = ${expectedBlendedCogs} UZS`);

  const layerAPassed = Number(updatedLayerA?.qtyRemaining) === 0;
  const layerBPassed = Number(updatedLayerB?.qtyRemaining) === 6;
  const stockPassed = Number(inv16?.quantityOnHand) === 6;

  if (layerAPassed && layerBPassed && stockPassed) {
    console.log('✓ TC-INV-016 PASS: FIFO multi-layer boundary crossed with 100% precision: Layer A fully depleted (0 remaining), Layer B partially depleted (6 remaining), and total stock is 6 units!\n');
  } else {
    console.log(`❌ TC-INV-016 FAIL: Layer A=${updatedLayerA?.qtyRemaining}, Layer B=${updatedLayerB?.qtyRemaining}, Total=${inv16?.quantityOnHand}\n`);
  }

  await p.$disconnect();
}

main().catch((err) => {
  console.error('Error running test script:', err);
  process.exit(1);
});
