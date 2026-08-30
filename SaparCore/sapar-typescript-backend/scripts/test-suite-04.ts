/**
 * scripts/test-suite-04.ts
 *
 * Automated verification of Suite 04: Zero & Negative Stock Boundary Controls
 *   - TC-INV-017: Exact-to-zero depletion
 *   - TC-INV-018: POS out-of-stock guard (0 stock checkout)
 *   - TC-INV-019: Concurrent race on last unit (Promise.all simultaneous checkouts)
 *   - TC-INV-020: Backorder / negative stock policy verification
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

  const prodA = await p.product.findFirst({ where: { code: 'TEST-SKU-A' } });
  if (!prodA) throw new Error('Product A not found');

  const headers = { Authorization: `Bearer ${token}` };

  console.log('\n=============================================================');
  console.log('🧪 SUITE 04 — ZERO & NEGATIVE STOCK BOUNDARY CONTROLS');
  console.log('=============================================================\n');

  // =========================================================================
  // TC-INV-017: Exact-to-zero depletion
  // =========================================================================
  console.log('--- TC-INV-017: Exact-to-zero depletion ---');
  // 1. Set stock to exactly 1
  await p.inventory.updateMany({
    where: { productId: prodA.id, userId: user.id },
    data: { quantity: 1, quantityOnHand: new Prisma.Decimal(1) },
  });
  const inv17Before = await p.inventory.findFirst({ where: { productId: prodA.id, userId: user.id } });
  console.log(`1. Set initial DB stock to: ${inv17Before?.quantity} (quantityOnHand: ${inv17Before?.quantityOnHand})`);

  // 2. Sell that exact last 1 unit via POS API
  const sale17Res = await axios.post(
    'http://localhost:3001/api/admin/pos/checkout',
    {
      items: [{ id: prodA.id, name: prodA.name, price: 15000, quantity: 1, barcode: prodA.barcode, sku: prodA.code }],
      paymentMethod: 'Naqd Pul',
      cashAmount: 15000,
      idempotencyKey: `tc-inv-017-${Date.now()}`,
    },
    { headers }
  );
  console.log(`2. POS Checkout Response: Status=${sale17Res.status} | Receipt=${sale17Res.data.data.receiptId}`);

  // 3. Confirm stock in DB hits exactly 0
  const inv17After = await p.inventory.findFirst({ where: { productId: prodA.id, userId: user.id } });
  console.log(`3. DB Stock After Sale: quantity=${inv17After?.quantity}, quantityOnHand=${inv17After?.quantityOnHand}`);

  if (inv17After?.quantity === 0 && Number(inv17After?.quantityOnHand) === 0) {
    console.log('✓ TC-INV-017 PASS: Stock hit exactly 0 (not negative) upon selling the last unit.\n');
  } else {
    console.log(`❌ TC-INV-017 FAIL: Expected stock 0, got ${inv17After?.quantity}\n`);
  }

  // =========================================================================
  // TC-INV-018: POS out-of-stock guard (selling when stock is 0)
  // =========================================================================
  console.log('--- TC-INV-018: POS out-of-stock hard guard ---');
  console.log(`1. Current DB Stock is: ${inv17After?.quantity}`);

  let tc18Error: any = null;
  let tc18Res: any = null;
  try {
    tc18Res = await axios.post(
      'http://localhost:3001/api/admin/pos/checkout',
      {
        items: [{ id: prodA.id, name: prodA.name, price: 15000, quantity: 1, barcode: prodA.barcode, sku: prodA.code }],
        paymentMethod: 'Naqd Pul',
        cashAmount: 15000,
        idempotencyKey: `tc-inv-018-${Date.now()}`,
      },
      { headers }
    );
  } catch (err: any) {
    tc18Error = err;
  }

  const inv18After = await p.inventory.findFirst({ where: { productId: prodA.id, userId: user.id } });
  console.log(`2. Attempted to checkout 1 unit when stock was 0:`);
  if (tc18Error) {
    console.log(`   - System rejected request: Status=${tc18Error.response?.status} | Message="${tc18Error.response?.data?.message}"`);
  } else {
    console.log(`   - System allowed request: Status=${tc18Res?.status} | Receipt=${tc18Res?.data?.data?.receiptId}`);
  }
  console.log(`3. DB Stock after attempt: quantity=${inv18After?.quantity}, quantityOnHand=${inv18After?.quantityOnHand}`);

  // =========================================================================
  // TC-INV-019: Concurrent race on last unit
  // =========================================================================
  console.log('\n--- TC-INV-019: Concurrent race on last unit (Simultaneous Promise.all) ---');
  // Reset stock to exactly 1
  await p.inventory.updateMany({
    where: { productId: prodA.id, userId: user.id },
    data: { quantity: 1, quantityOnHand: new Prisma.Decimal(1) },
  });
  const inv19Before = await p.inventory.findFirst({ where: { productId: prodA.id, userId: user.id } });
  console.log(`1. Set initial DB stock to: ${inv19Before?.quantity} (quantityOnHand: ${inv19Before?.quantityOnHand})`);

  console.log('2. Firing 2 simultaneous checkout requests for the same last 1 unit...');
  const req1 = axios
    .post(
      'http://localhost:3001/api/admin/pos/checkout',
      {
        items: [{ id: prodA.id, name: prodA.name, price: 15000, quantity: 1, barcode: prodA.barcode, sku: prodA.code }],
        paymentMethod: 'Naqd Pul',
        cashAmount: 15000,
        idempotencyKey: `tc-inv-019-terminalA-${Date.now()}`,
      },
      { headers }
    )
    .then((r) => ({ success: true, status: r.status, data: r.data }))
    .catch((e) => ({ success: false, status: e.response?.status, error: e.response?.data }));

  const req2 = axios
    .post(
      'http://localhost:3001/api/admin/pos/checkout',
      {
        items: [{ id: prodA.id, name: prodA.name, price: 15000, quantity: 1, barcode: prodA.barcode, sku: prodA.code }],
        paymentMethod: 'Naqd Pul',
        cashAmount: 15000,
        idempotencyKey: `tc-inv-019-terminalB-${Date.now()}`,
      },
      { headers }
    )
    .then((r) => ({ success: true, status: r.status, data: r.data }))
    .catch((e) => ({ success: false, status: e.response?.status, error: e.response?.data }));

  const [resA, resB] = await Promise.all([req1, req2]);
  console.log(`   - Terminal A Result:`, resA.success ? `200 OK (Receipt: ${resA.data.data.receiptId})` : `Failed (${resA.status}): ${JSON.stringify(resA.error)}`);
  console.log(`   - Terminal B Result:`, resB.success ? `200 OK (Receipt: ${resB.data.data.receiptId})` : `Failed (${resB.status}): ${JSON.stringify(resB.error)}`);

  const inv19After = await p.inventory.findFirst({ where: { productId: prodA.id, userId: user.id } });
  console.log(`3. Final DB Stock after concurrent checkouts: quantity=${inv19After?.quantity}, quantityOnHand=${inv19After?.quantityOnHand}`);

  // =========================================================================
  // TC-INV-020: Policy Evaluation
  // =========================================================================
  console.log('\n--- TC-INV-020: Backorder / Negative stock policy evaluation ---');
  console.log(`Current Code Behavior:`);
  console.log(`- If stock allows decrement below 0: Stock became negative (${inv18After?.quantity})`);
  console.log(`- If stock blocks decrement below 0: Stock stayed at 0`);

  await p.$disconnect();
}

main().catch((err) => {
  console.error('Error running test script:', err);
  process.exit(1);
});
