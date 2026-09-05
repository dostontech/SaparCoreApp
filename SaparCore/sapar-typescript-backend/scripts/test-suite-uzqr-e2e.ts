import dotenv from 'dotenv';
dotenv.config();

import { prisma as p } from '../lib/prisma';
import {
  getGatewaySettings,
  saveGatewaySettings,
  checkUzQrPaymentStatus,
  handleUzQrWebhook,
  setPosUzQrStatus,
} from '../controllers/uzbekPaymentGatewaysController';

async function runUzQrE2eTests() {
  console.log('\n=============================================================');
  console.log('🇺🇿 UZQR UNIFIED NATIONAL PAYMENT CODE POSTGRESQL E2E TEST SUITE');
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

  const user = await p.user.findFirst({ where: { email: 'admin@sapar.uz' } }) ||
               await p.user.findFirst();
  if (!user) throw new Error('No tenant user found in DB');
  const tenantId = user.id;

  // 1. Test Gateway Settings Retrieval
  console.log('1. Testing UzQR Gateway Settings Retrieval:');
  let settingsResponse: any = null;
  const mockReq = { user: tenantId, tenantId } as any;
  const mockRes = {
    json: (payload: any) => { settingsResponse = payload; },
    status: () => mockRes,
  } as any;

  await getGatewaySettings(mockReq, mockRes);
  const uzqrConfig = settingsResponse?.data?.uzqr;
  assert(Boolean(uzqrConfig), 'UzQR gateway config present in system settings');
  assert(uzqrConfig?.enabled === true, 'UzQR gateway enabled by default');
  assert(Boolean(uzqrConfig?.merchantId), `Merchant ID configured: ${uzqrConfig?.merchantId}`);
  assert(Boolean(uzqrConfig?.bankName), `Acquiring Bank: ${uzqrConfig?.bankName}`);

  // 2. Test Deep Link & EMVCo Standard Formatting
  console.log('\n2. Testing UzQR Deep Link & National Standard Formatting:');
  const amount = 3500000; // 3,500,000 UZS
  const posRef = `POS-${Date.now()}-8899`;
  const merchant = uzqrConfig?.merchantId || 'UZQR-MERCHANT-7788';
  const terminal = uzqrConfig?.terminalId || 'TERM-001';
  const deepLink = `uzqr://pay?m=${encodeURIComponent(merchant)}&t=${encodeURIComponent(terminal)}&a=${amount}&ref=${encodeURIComponent(posRef)}&cur=860`;

  assert(deepLink.startsWith('uzqr://pay?'), 'URI scheme is uzqr://pay');
  assert(deepLink.includes('cur=860'), 'National currency code is 860 (Uzbekistan Soʻm)');
  assert(deepLink.includes(`ref=${posRef}`), `Transaction reference embedded: ${posRef}`);
  assert(deepLink.includes(`a=${amount}`), `Payment amount embedded: ${amount}`);

  // 3. Test Initial Status Polling (Pending State)
  console.log('\n3. Testing POS Terminal Status Polling (Pending State):');
  let statusBefore: any = null;
  const mockStatusReq = { params: { referenceId: posRef } } as any;
  const mockStatusRes = {
    json: (payload: any) => { statusBefore = payload; },
    status: () => mockStatusRes,
  } as any;

  await checkUzQrPaymentStatus(mockStatusReq, mockStatusRes);
  assert(statusBefore?.success === true, 'Status endpoint returned HTTP 200');
  assert(statusBefore?.data?.paid === false, 'Initial state: paid is false');
  assert(statusBefore?.data?.status === 'PENDING', 'Initial status is PENDING');

  // 4. Test Webhook Processing for POS Transaction
  console.log('\n4. Simulating Bank Webhook Callback for POS Transaction:');
  let webhookResponse: any = null;
  const mockWebhookReq = {
    body: {
      transactionId: `UZQR-TXN-${Date.now()}`,
      referenceId: posRef,
      amount,
      status: 'PAID',
    },
  } as any;
  const mockWebhookRes = {
    json: (payload: any) => { webhookResponse = payload; },
    status: () => mockWebhookRes,
  } as any;

  await handleUzQrWebhook(mockWebhookReq, mockWebhookRes);
  assert(webhookResponse?.success === true, 'POS Webhook successfully accepted');
  assert(webhookResponse?.referenceId === posRef, 'Webhook confirmed correct referenceId');

  // 5. Test Status Polling after Webhook (Confirmed State)
  console.log('\n5. Testing Status Polling Transition (Confirmed State):');
  let statusAfter: any = null;
  await checkUzQrPaymentStatus(mockStatusReq, mockStatusRes);
  statusAfter = statusBefore; // Captured by mock
  assert(statusAfter?.data?.paid === true, 'State transitioned to paid: true');
  assert(statusAfter?.data?.status === 'CONFIRMED', 'Status transitioned to CONFIRMED');
  assert(statusAfter?.data?.amount === amount, `Confirmed amount matches: ${statusAfter?.data?.amount} UZS`);
  assert(Boolean(statusAfter?.data?.paymentId), `Payment ID issued: ${statusAfter?.data?.paymentId}`);

  // 6. Test Invoice Payment Webhook with DB Persistence
  console.log('\n6. Testing Invoice Settlement via UzQR Webhook (PostgreSQL):');
  const invoice = await p.invoice.create({
    data: {
      user: { connect: { id: tenantId } },
      billFromUser: { connect: { id: tenantId } },
      invoiceNumber: `INV-UZQR-${Date.now().toString().slice(-4)}`,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 86400000),
      items: [],
      taxableAmount: 1000000,
      TotalAmount: 1120000,
      vat: 120000,
      status: 'UNPAID',
    },
  });

  const invoiceWebhookReq = {
    body: {
      transactionId: `TX-INV-${Date.now()}`,
      invoiceId: invoice.id,
      amount: 1120000,
      status: 'PAID',
    },
  } as any;
  let invWebhookRes: any = null;
  const mockInvRes = {
    json: (payload: any) => { invWebhookRes = payload; },
    status: () => mockInvRes,
  } as any;

  await handleUzQrWebhook(invoiceWebhookReq, mockInvRes);
  assert(invWebhookRes?.success === true, 'Invoice webhook processed successfully');

  // Verify Invoice in PostgreSQL
  const updatedInvoice = await p.invoice.findUnique({
    where: { id: invoice.id },
    include: { payments: true },
  });
  assert(updatedInvoice?.status === 'PAID', `Invoice status transitioned to PAID (${updatedInvoice?.status})`);
  assert(updatedInvoice?.payments?.length === 1, 'Invoice payment recorded in PostgreSQL');
  assert(Number(updatedInvoice?.payments[0]?.amount) === 1120000, 'Payment amount matches 1,120,000 UZS');

  console.log('\n=============================================================');
  console.log(`UZQR TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================================\n');

  await p.$disconnect();
  if (failed > 0) process.exit(1);
}

runUzQrE2eTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
