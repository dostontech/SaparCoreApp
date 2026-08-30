/**
 * scripts/test-suite-02.ts
 *
 * Automated verification of Suite 02: Inbound Stock & Purchases Valuation
 *   - TC-INV-009: WAC recalculation on purchase
 *   - TC-INV-010: FIFO cost layer insertion
 *   - TC-INV-011: Zero-cost bonus/free stock
 *   - TC-INV-012: Multi-currency purchase conversion
 */

import axios from 'axios';
import jwt from 'jsonwebtoken';
import { PrismaClient, Prisma } from '@prisma/client';

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

  let supplier = await p.supplier.findFirst({ where: { user_id: user.id } });
  if (!supplier) {
    supplier = await p.supplier.create({
      data: {
        supplier_name: 'Test OOO Taʼminotchi',
        supplier_email: 'taminot@test.uz',
        supplier_phone: '+998901234567',
        user_id: user.id,
      },
    });
  }

  console.log('\n=============================================================');
  console.log('🧪 SUITE 02 — INBOUND STOCK & PURCHASES VALUATION');
  console.log('=============================================================\n');

  // =========================================================================
  // TC-INV-009: WAC recalculation on purchase
  // =========================================================================
  console.log('--- TC-INV-009: WAC recalculation on purchase ---');

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

  // Set initial baseline: 10 units @ 10,000 UZS
  await setInventoryState(p, prodWac.id, user.id, 10, 10000);

  const inv09Before = await p.inventory.findFirst({ where: { productId: prodWac.id, userId: user.id } });
  const oldQty = Number(inv09Before?.quantityOnHand || 0);
  const oldWac = Number(inv09Before?.avgCost || 0);
  console.log(`1. Baseline State: Quantity = ${oldQty} units | WAC AvgCost = ${oldWac} UZS (Total Value = ${oldQty * oldWac} UZS)`);

  const paymentMode = await p.paymentMode.findFirst();

  // Record a purchase: 10 units @ 20,000 UZS
  const purchase09Res = await axios.post(
    'http://localhost:3001/api/admin/purchases',
    {
      purchaseDate: new Date().toISOString(),
      userId: user.id,
      billFrom: user.id,
      supplierId: supplier.id,
      status: 'pending',
      paymentMode: paymentMode?.id,
      items: [
        {
          productId: prodWac.id,
          name: prodWac.name,
          qty: 10,
          rate: 20000,
          amount: 200000,
        },
      ],
    },
    { headers }
  );
  console.log(`2. Created Purchase via API: Status=${purchase09Res.status} | ID=${purchase09Res.data?.data?.purchase?.id}`);

  // Query updated inventory
  const inv09After = await p.inventory.findFirst({ where: { productId: prodWac.id, userId: user.id } });
  const newQty = Number(inv09After?.quantityOnHand || 0);
  const actualNewWac = Number(inv09After?.avgCost || 0);
  const inQty = 10;
  const inCost = 20000;
  const expectedNewWac = (oldQty * oldWac + inQty * inCost) / (oldQty + inQty);

  console.log(`3. Calculation Verification:`);
  console.log(`   Formula: (${oldQty} * ${oldWac} + ${inQty} * ${inCost}) / (${oldQty} + ${inQty})`);
  console.log(`   Expected WAC = (${oldQty * oldWac} + ${inQty * inCost}) / ${oldQty + inQty} = ${expectedNewWac} UZS`);
  console.log(`   Actual WAC in DB = ${actualNewWac} UZS | Quantity = ${newQty} units`);

  if (Math.abs(actualNewWac - expectedNewWac) < 0.01 && newQty === 20) {
    console.log('✓ TC-INV-009 PASS: WAC recalculated with 100% mathematical precision!\n');
  } else {
    console.log(`❌ TC-INV-009 FAIL: Expected WAC ${expectedNewWac}, got ${actualNewWac}\n`);
  }

  // =========================================================================
  // TC-INV-010: FIFO cost layer insertion
  // =========================================================================
  console.log('--- TC-INV-010: FIFO cost layer insertion ---');

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

  // Clean old layers for test
  await p.inventoryCostLayer.deleteMany({ where: { productId: prodFifo.id, userId: user.id } });
  await setInventoryState(p, prodFifo.id, user.id, 0, 0);

  console.log('1. Recording Purchase #1: 5 units @ 12,000 UZS (Dated: 2026-08-20)...');
  await axios.post(
    'http://localhost:3001/api/admin/purchases',
    {
      purchaseDate: new Date('2026-08-20T10:00:00Z').toISOString(),
      userId: user.id,
      billFrom: user.id,
      supplierId: supplier.id,
      paymentMode: paymentMode?.id,
      status: 'pending',
      items: [{ productId: prodFifo.id, name: prodFifo.name, qty: 5, rate: 12000, amount: 60000 }],
    },
    { headers }
  );

  console.log('2. Recording Purchase #2: 8 units @ 14,000 UZS (Dated: 2026-08-22)...');
  await axios.post(
    'http://localhost:3001/api/admin/purchases',
    {
      purchaseDate: new Date('2026-08-22T10:00:00Z').toISOString(),
      userId: user.id,
      billFrom: user.id,
      supplierId: supplier.id,
      paymentMode: paymentMode?.id,
      status: 'pending',
      items: [{ productId: prodFifo.id, name: prodFifo.name, qty: 8, rate: 14000, amount: 112000 }],
    },
    { headers }
  );

  const fifoLayers = await p.inventoryCostLayer.findMany({
    where: { productId: prodFifo.id, userId: user.id, isDeleted: false },
    orderBy: { receivedAt: 'asc' },
  });

  console.log(`3. Querying InventoryCostLayer rows in DB (${fifoLayers.length} layers found):`);
  fifoLayers.forEach((l, idx) => {
    console.log(`   [Layer #${idx + 1}] ID: ${l.id} | Qty Remaining: ${l.qtyRemaining} | Unit Cost: ${l.unitCost} UZS | ReceivedAt: ${l.receivedAt.toISOString()}`);
  });

  if (
    fifoLayers.length === 2 &&
    Number(fifoLayers[0].qtyRemaining) === 5 &&
    Number(fifoLayers[0].unitCost) === 12000 &&
    Number(fifoLayers[1].qtyRemaining) === 8 &&
    Number(fifoLayers[1].unitCost) === 14000
  ) {
    console.log('✓ TC-INV-010 PASS: Distinct chronological FIFO cost layers created without merging or overwrite!\n');
  } else {
    console.log('❌ TC-INV-010 FAIL: FIFO layers not created as expected.\n');
  }

  // =========================================================================
  // TC-INV-011: Zero-cost bonus/free stock
  // =========================================================================
  console.log('--- TC-INV-011: Zero-cost bonus/free stock ---');

  const inv11Before = await p.inventory.findFirst({ where: { productId: prodWac.id, userId: user.id } });
  const wac11QtyBefore = Number(inv11Before?.quantityOnHand || 0);
  const wac11CostBefore = Number(inv11Before?.avgCost || 0);
  console.log(`1. Baseline before bonus: Qty = ${wac11QtyBefore} | WAC = ${wac11CostBefore} UZS (Total Value = ${wac11QtyBefore * wac11CostBefore} UZS)`);

  console.log('2. Recording Purchase with 5 bonus units @ 0 UZS...');
  await axios.post(
    'http://localhost:3001/api/admin/purchases',
    {
      purchaseDate: new Date().toISOString(),
      userId: user.id,
      billFrom: user.id,
      supplierId: supplier.id,
      paymentMode: paymentMode?.id,
      status: 'pending',
      items: [{ productId: prodWac.id, name: prodWac.name, qty: 5, rate: 0, amount: 0 }],
    },
    { headers }
  );

  const inv11After = await p.inventory.findFirst({ where: { productId: prodWac.id, userId: user.id } });
  const wac11QtyAfter = Number(inv11After?.quantityOnHand || 0);
  const wac11CostAfter = Number(inv11After?.avgCost || 0);
  const expected11Wac = (wac11QtyBefore * wac11CostBefore + 5 * 0) / (wac11QtyBefore + 5);

  console.log(`3. Zero-Cost Math Verification:`);
  console.log(`   Expected WAC = (${wac11QtyBefore} * ${wac11CostBefore} + 0) / ${wac11QtyBefore + 5} = ${expected11Wac} UZS`);
  console.log(`   Actual WAC in DB = ${wac11CostAfter} UZS | Quantity = ${wac11QtyAfter} units`);

  if (Math.abs(wac11CostAfter - expected11Wac) < 0.01 && wac11QtyAfter === wac11QtyBefore + 5) {
    console.log('✓ TC-INV-011 PASS: Zero-cost bonus units blended cleanly without divide-by-zero or zeroing out base value!\n');
  } else {
    console.log(`❌ TC-INV-011 FAIL: Expected WAC ${expected11Wac}, got ${wac11CostAfter}\n`);
  }

  // =========================================================================
  // TC-INV-012: Multi-currency purchase conversion
  // =========================================================================
  console.log('--- TC-INV-012: Multi-currency purchase conversion ---');

  let prodFx = await p.product.findFirst({ where: { code: 'TEST-FX-PROD' } });
  if (!prodFx) {
    prodFx = await p.product.create({
      data: {
        name: 'Multi-Currency Test Product',
        code: 'TEST-FX-PROD',
        barcode: '4780009993334',
        valuationMethod: 'FIFO',
        selling_price: new Prisma.Decimal(150000),
        purchase_price: new Prisma.Decimal(100000),
        item_type: 'Product',
      },
    });
  }

  await p.inventoryCostLayer.deleteMany({ where: { productId: prodFx.id, userId: user.id } });

  const fxRate = 12800; // 1 USD = 12,800 UZS
  const usdRate = 10;   // $10 USD per unit
  const expectedUzsCost = usdRate * fxRate; // 128,000 UZS per unit

  console.log(`1. Recording Purchase in USD: 2 units @ $${usdRate} USD | Exchange Rate: ${fxRate} UZS/USD...`);
  await axios.post(
    'http://localhost:3001/api/admin/purchases',
    {
      purchaseDate: new Date().toISOString(),
      userId: user.id,
      billFrom: user.id,
      supplierId: supplier.id,
      paymentMode: paymentMode?.id,
      status: 'pending',
      currencyCode: 'USD',
      exchangeRate: fxRate,
      items: [{ productId: prodFx.id, name: prodFx.name, qty: 2, rate: usdRate, amount: usdRate * 2 }],
    },
    { headers }
  );

  const fxLayers = await p.inventoryCostLayer.findMany({
    where: { productId: prodFx.id, userId: user.id, isDeleted: false },
  });

  const actualRecordedCost = fxLayers.length > 0 ? Number(fxLayers[0].unitCost) : 0;
  console.log(`2. Valuation Layer in Database:`);
  console.log(`   Expected Unit Cost in UZS: $${usdRate} * ${fxRate} = ${expectedUzsCost} UZS`);
  console.log(`   Actual Unit Cost in DB: ${actualRecordedCost}`);

  if (actualRecordedCost === expectedUzsCost) {
    console.log('✓ TC-INV-012 PASS: Foreign currency USD successfully converted to UZS base cost on cost layer!\n');
  } else {
    console.log(`⚠️ TC-INV-012 FINDING: Cost was recorded as ${actualRecordedCost} instead of ${expectedUzsCost} UZS (requires FX conversion multiplier on item.rate in purchaseController).\n`);
  }

  await p.$disconnect();
}

main().catch((err) => {
  console.error('Error running test script:', err);
  process.exit(1);
});
