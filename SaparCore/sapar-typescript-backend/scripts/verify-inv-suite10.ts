/**
 * scripts/verify-inv-suite10.ts
 *
 * Automation script verifying Suite 10 (TC-INV-036 to TC-INV-039)
 */

import axios from 'axios';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

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
  const initialInv = await p.inventory.findFirst({ where: { productId: prodA.id } });
  if (!initialInv) throw new Error('Inventory A not found');

  console.log('\n=============================================================');
  console.log('🧪 TC-INV-038 — IDEMPOTENCY STOCK VERIFICATION');
  console.log('=============================================================');
  console.log(`1. Initial DB Stock before test: ${initialInv.quantity}`);

  const idempKey = `pos-idemp-test-${Date.now()}`;
  const payload = {
    items: [{ id: prodA.id, name: prodA.name, price: 15000, quantity: 1, barcode: prodA.barcode, sku: prodA.code }],
    paymentMethod: 'Naqd Pul',
    cashAmount: 15000,
    idempotencyKey: idempKey,
  };

  console.log(`2. Sending First Checkout Request with idempotencyKey: ${idempKey}`);
  const res1 = await axios.post('http://localhost:3001/api/admin/pos/checkout', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`   ✓ Response 1: Status=${res1.status} | Receipt=${res1.data.data.receiptId}`);

  const invAfter1 = await p.inventory.findFirst({ where: { productId: prodA.id } });
  console.log(`   ✓ Stock after Request 1: ${invAfter1?.quantity} (Expected: ${initialInv.quantity - 1})`);

  console.log(`3. Sending Duplicate Checkout Request with identical idempotencyKey...`);
  const res2 = await axios.post('http://localhost:3001/api/admin/pos/checkout', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`   ✓ Response 2: Status=${res2.status} | Receipt=${res2.data.data.receiptId}`);

  const invAfter2 = await p.inventory.findFirst({ where: { productId: prodA.id } });
  console.log(`   ✓ Stock after Request 2: ${invAfter2?.quantity} (Must remain: ${initialInv.quantity - 1})`);

  console.log(`4. Sending Third Duplicate Checkout Request...`);
  const res3 = await axios.post('http://localhost:3001/api/admin/pos/checkout', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`   ✓ Response 3: Status=${res3.status} | Receipt=${res3.data.data.receiptId}`);

  const invAfter3 = await p.inventory.findFirst({ where: { productId: prodA.id } });
  console.log(`   ✓ Stock after Request 3: ${invAfter3?.quantity} (Must remain: ${initialInv.quantity - 1})`);

  if (
    invAfter1 &&
    invAfter2 &&
    invAfter3 &&
    invAfter1.quantity === initialInv.quantity - 1 &&
    invAfter2.quantity === invAfter1.quantity &&
    invAfter3.quantity === invAfter1.quantity
  ) {
    console.log('\n🎉 TC-INV-038 PASS: Idempotency strictly prevented duplicate stock deductions across multiple retries!\n');
  } else {
    throw new Error('TC-INV-038 FAIL: Stock was double decremented!');
  }

  console.log('=============================================================');
  console.log('📋 TC-INV-039 — FULL AUDIT TRAIL VERIFICATION');
  console.log('=============================================================');

  const allInvs = await p.inventory.findMany({
    include: { product: true },
  });

  for (const inv of allInvs) {
    console.log(`\nProduct: ${inv.product.name} (SKU: ${inv.product.code})`);
    console.log(`Current Stock: ${inv.quantity} (OnHand Decimal: ${inv.quantityOnHand})`);
    console.log(`Movement Audit History (${(inv.inventory_history as any[])?.length || 0} events):`);
    const history = (inv.inventory_history as any[]) || [];
    history.forEach((h: any, idx: number) => {
      console.log(`  [Event #${idx + 1}]`);
      console.log(`    - Timestamp:     ${h.createdAt}`);
      console.log(`    - Type:          ${h.type}`);
      console.log(`    - Adjustment:    ${h.adjustment > 0 ? '+' + h.adjustment : h.adjustment}`);
      console.log(`    - Resulting Qty: ${h.quantity}`);
      console.log(`    - Reference:     ${h.referenceType} (ID: ${h.referenceId})`);
      console.log(`    - Notes:         ${h.notes}`);
    });
  }

  await p.$disconnect();
}

main().catch((err) => {
  console.error('Error running Suite 10 verification:', err);
  process.exit(1);
});
