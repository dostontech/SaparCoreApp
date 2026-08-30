/**
 * scripts/test-suite-invoicing.ts
 *
 * Automated verification of Invoicing & Sales Module
 * from docs/fsd/invoicing-test-cases.md against live API and PostgreSQL.
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
  console.log('🧾 INVOICING & SALES MODULE (HISOB-FAKTURA) QA VERIFICATION');
  console.log('=============================================================\n');

  // Find or create a valid customer contact
  let contact = await p.contact.findFirst({
    where: { userId: user.id },
  });
  if (!contact) {
    contact = await p.contact.create({
      data: {
        userId: user.id,
        firstName: 'Toshkent Mega Savdo',
        telephone: '+998901234567',
      },
    });
  }


  // Find an in-stock product
  const product = await p.product.findFirst({
    where: { status: true, enable_inventory: true },
  });
  if (!product) throw new Error('No product found');

  const cashMode = await p.paymentMode.findFirst({ where: { slug: 'cash' } }) || await p.paymentMode.findFirst();
  if (!cashMode) throw new Error('No cash payment mode found');

  // =========================================================================
  // 1. TC-INV-001: Standard Invoice Creation with 12% QQS
  // =========================================================================
  console.log('--- TC-INV-001: Standard Invoice Creation with 12% QQS ---');
  const invRes = await axios.post(
    'http://localhost:3001/api/admin/invoices',
    {
      billFrom: user.id,
      contactId: contact.id,
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      taxTreatment: 'STANDARD',
      currencyCode: 'UZS',
      exchangeRate: 1,
      items: [
        {
          productId: product.id,
          name: product.name,
          qty: 10,
          rate: 100000, // 1,000,000 UZS subtotal
          taxes: [{ name: 'QQS 12%', percent: 12 }],
          amount: 1120000,
        },
      ],
    },
    { headers }
  );

  const createdInv = invRes.data.data?.invoice || invRes.data.data;
  console.log(`1. Created Invoice: ID=${createdInv.id} | Number=${createdInv.invoiceNumber} | Total=${Number(createdInv.TotalAmount).toLocaleString()} UZS`);

  // Query Database
  const dbInv = await p.invoice.findUnique({ where: { id: createdInv.id } });
  console.log(`2. DB Invoice: Status=${dbInv?.status} | Taxable=${Number(dbInv?.taxableAmount).toLocaleString()} UZS | VAT=${Number(dbInv?.vat).toLocaleString()} UZS | Total=${Number(dbInv?.TotalAmount).toLocaleString()} UZS`);

  // Query GL Entries
  const invJes = await p.journalEntry.findMany({
    where: { sourceId: createdInv.id, userId: user.id, event: 'issued' },
    include: { lines: { include: { account: true } } },
  });

  console.log(`3. GL Issued Entry for Invoice:`);
  for (const je of invJes) {
    for (const ln of je.lines) {
      console.log(`   • ${ln.account.code} (${ln.account.name}): Debit = ${Number(ln.baseDebit).toFixed(2)} | Credit = ${Number(ln.baseCredit).toFixed(2)}`);
    }
  }

  if (dbInv && Number(dbInv.TotalAmount) === 1120000 && Number(dbInv.vat) === 120000 && invJes.length > 0) {
    console.log('✓ TC-INV-001 PASS: Invoice created with exact 12% QQS split and auto-posted to General Ledger.\n');
  } else {
    console.log('❌ TC-INV-001 FAIL: Invoice or GL posting mismatch.\n');
  }


  // =========================================================================
  // 2. TC-INV-003: Empty Cart Rejection Guard
  // =========================================================================
  console.log('--- TC-INV-003: Empty Items Rejection Guard ---');
  let emptyBlocked = false;
  try {
    await axios.post(
      'http://localhost:3001/api/admin/invoices',
      {
        billFrom: user.id,
        contactId: contact.id,
        invoiceDate: new Date().toISOString().slice(0, 10),
        items: [],
      },
      { headers }
    );
    console.log('❌ TC-INV-003 FAIL: Empty invoice items accepted by API!\n');
  } catch (err: any) {
    emptyBlocked = true;
    console.log(`1. Empty Items Attempt: Rejected with HTTP ${err.response?.status} - '${err.response?.data?.message || err.response?.data?.error || err.response?.data?.errors?.[0]?.msg}'`);
    console.log('✓ TC-INV-003 PASS: Empty invoice payload strictly rejected.\n');
  }

  // =========================================================================
  // 3. TC-INV-006: Foreign Currency Invoice ($100 USD @ 12,800 UZS)
  // =========================================================================
  console.log('--- TC-INV-006: Multi-Currency Invoice ($100 USD @ 12,800 UZS/USD) ---');
  const fxInvRes = await axios.post(
    'http://localhost:3001/api/admin/invoices',
    {
      billFrom: user.id,
      contactId: contact.id,
      invoiceDate: new Date().toISOString().slice(0, 10),
      taxTreatment: 'EXEMPT',
      currencyCode: 'USD',
      exchangeRate: 12800,
      items: [
        {
          productId: product.id,
          name: product.name,
          qty: 1,
          rate: 100,
          tax: 0,
          amount: 100,
        },
      ],
    },
    { headers }
  );


  const fxInv = fxInvRes.data.data?.invoice || fxInvRes.data.data;
  console.log(`1. Created USD Invoice: ID=${fxInv.id} | Amount=$${Number(fxInv.TotalAmount)} | Rate=${fxInv.exchangeRate}`);

  const fxInvJes = await p.journalEntry.findMany({
    where: { sourceId: fxInv.id, userId: user.id, event: 'issued' },
    include: { lines: { include: { account: true } } },
  });

  console.log(`2. GL Base Currency Postings for USD Invoice:`);
  for (const je of fxInvJes) {
    for (const ln of je.lines) {
      console.log(`   • ${ln.account.code} (${ln.account.name}): Debit = ${ln.debit} USD (Base: ${Number(ln.baseDebit).toLocaleString()} UZS) | Credit = ${ln.credit} USD (Base: ${Number(ln.baseCredit).toLocaleString()} UZS)`);
    }
  }

  const arBaseDebit = fxInvJes.flatMap((j) => j.lines).find((l) => l.account.code === '1100')?.baseDebit;
  if (Number(arBaseDebit) === 1280000) {
    console.log('✓ TC-INV-006 PASS: Foreign currency invoice ($100) debited to GL AR at exact base rate (1,280,000 UZS).\n');
  } else {
    console.log(`❌ TC-INV-006 FAIL: AR base debit ${arBaseDebit} != 1,280,000 UZS\n`);
  }

  // =========================================================================
  // 4. TC-INV-008 & 009: Partial & Full Payment Collection Lifecycle
  // =========================================================================
  console.log('--- TC-INV-008 & TC-INV-009: Payment Collection Lifecycle ---');
  // Partial Payment: 500,000 UZS
  console.log('1. Recording Partial Payment of 500,000 UZS...');
  const pmt1Res = await axios.post(
    'http://localhost:3001/api/admin/invoice/payment',
    {
      invoiceId: createdInv.id,
      amount: 500000,
      payment_method: cashMode.id,
      received_on: new Date().toISOString().slice(0, 10),
      notes: 'Partial payment QA test',
    },
    { headers }
  );

  const dbInvPart = await p.invoice.findUnique({ where: { id: createdInv.id } });
  console.log(`   ✓ Payment 1 Recorded: Status is now '${dbInvPart?.status}' (Expected: PARTIALLY_PAID)`);

  // Final Settlement Payment: 620,000 UZS
  console.log('2. Recording Final Settlement Payment of 620,000 UZS...');
  try {
    const pmt2Res = await axios.post(
      'http://localhost:3001/api/admin/invoice/payment',
      {
        invoiceId: createdInv.id,
        amount: 620000,
        payment_method: cashMode.id,
        received_on: new Date().toISOString().slice(0, 10),
        notes: 'Final settlement QA test',
      },
      { headers }
    );
  } catch (err: any) {
    console.error('Payment 2 Error response:', JSON.stringify(err.response?.data, null, 2));
    process.exit(1);
  }



  const dbInvFull = await p.invoice.findUnique({ where: { id: createdInv.id } });
  console.log(`   ✓ Payment 2 Recorded: Status is now '${dbInvFull?.status}' (Expected: PAID)`);

  if (dbInvPart?.status === 'PARTIALLY_PAID' && dbInvFull?.status === 'PAID') {
    console.log('✓ TC-INV-008 & TC-INV-009 PASS: Invoice lifecycle correctly transitioned from UNPAID -> PARTIALLY_PAID -> PAID.\n');
  } else {
    console.log('❌ TC-INV-008/009 FAIL: Status transition mismatch.\n');
  }

  // =========================================================================
  // 5. TC-INV-010: Overpayment Hard Guard
  // =========================================================================
  console.log('--- TC-INV-010: Overpayment Hard Guard ---');
  let overpayBlocked = false;
  try {
    await axios.post(
      'http://localhost:3001/api/admin/invoice/payment',
      {
        invoiceId: createdInv.id,
        amount: 50000, // Invoice already fully paid
        payment_method: cashMode.id,
        received_on: new Date().toISOString().slice(0, 10),
      },
      { headers }
    );
    console.log('❌ TC-INV-010 FAIL: Overpayment was accepted by API!\n');
  } catch (err: any) {
    overpayBlocked = true;
    console.log(`1. Overpayment Attempt: Rejected with HTTP ${err.response?.status} - '${err.response?.data?.message || err.response?.data?.error || err.response?.data?.errors?.amount || err.response?.data?.errors?.invoiceId}'`);
    console.log('✓ TC-INV-010 PASS: Overpayment against paid invoice strictly blocked.\n');
  }

  // =========================================================================
  // 6. TC-INV-011: Void Payment & Status Reversion
  // =========================================================================
  console.log('--- TC-INV-011: Void Payment & Status Reversion ---');
  const payments = await p.invoicePayment.findMany({
    where: { invoiceId: createdInv.id, isVoided: false },
    orderBy: { received_on: 'desc' },
  });

  const lastPayment = payments[0];
  console.log(`1. Voiding last payment of ${Number(lastPayment.amount).toLocaleString()} UZS (ID: ${lastPayment.id})...`);

  const voidRes = await axios.post(
    `http://localhost:3001/api/admin/invoices/payments/${lastPayment.id}/void`,
    { reason: 'Customer disputed charge' },
    { headers }
  );

  console.log(`   ✓ Void API Response: HTTP ${voidRes.status}`);

  const dbInvAfterVoid = await p.invoice.findUnique({ where: { id: createdInv.id } });
  console.log(`2. DB Invoice Status After Void: '${dbInvAfterVoid?.status}' (Expected: PARTIALLY_PAID)`);

  const dbVoidedPay = await p.invoicePayment.findUnique({ where: { id: lastPayment.id } });
  console.log(`3. DB Payment isVoided: ${dbVoidedPay?.isVoided} | Void Reason: '${dbVoidedPay?.voidReason}'`);

  if (dbVoidedPay?.isVoided && dbInvAfterVoid?.status === 'PARTIALLY_PAID') {
    console.log('✓ TC-INV-011 PASS: Voided payment and successfully restored invoice status back to PARTIALLY_PAID.\n');
  } else {
    console.log('❌ TC-INV-011 FAIL: Void handling mismatch.\n');
  }

  // =========================================================================
  // 7. TC-INV-014 & 015: Quotation Creation & Conversion to Invoice
  // =========================================================================
  console.log('--- TC-INV-014 & TC-INV-015: Quotation Lifecycle & Conversion ---');
  const qtRes = await axios.post(
    'http://localhost:3001/api/admin/quotations',
    {
      billFrom: user.id,
      contactId: contact.id,
      quotationDate: new Date().toISOString().slice(0, 10),
      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      taxTreatment: 'STANDARD',
      currencyCode: 'UZS',
      exchangeRate: 1,
      items: [
        {
          id: product.id,
          name: product.name,
          qty: 5,
          rate: 50000,
          discount: 0,
          discount_type: 'Fixed',
          tax: 0,
          amount: 250000,
        },
      ],
    },
    { headers }
  );


  const quotation = qtRes.data.data?.quotation || qtRes.data.data;
  console.log(`1. Created Quotation: ID=${quotation.id} | Number=${quotation.quotationNumber} | Total=${Number(quotation.TotalAmount).toLocaleString()} UZS`);

  // Convert Quotation to Invoice
  console.log(`2. Converting Quotation #${quotation.quotationNumber} to Official Invoice...`);
  const convRes = await axios.post(
    `http://localhost:3001/api/admin/quotation-convert-to-invoice/${quotation.id}`,
    {},
    { headers }
  );

  const convInvoice = convRes.data.data?.invoice || convRes.data.data;
  console.log(`   ✓ Converted to Invoice: ID=${convInvoice.id} | InvoiceNumber=${convInvoice.invoiceNumber} | Status=${convInvoice.status}`);

  const dbQtAfter = await p.quotation.findUnique({ where: { id: quotation.id } });
  console.log(`3. Quotation Status After Conversion: '${dbQtAfter?.status}'`);

  if (convInvoice && convInvoice.id) {
    console.log('✓ TC-INV-014 & TC-INV-015 PASS: Commercial quotation converted cleanly to Invoice.\n');
  } else {
    console.log('❌ TC-INV-014/015 FAIL: Quotation conversion failed.\n');
  }

  // =========================================================================
  // 8. TC-INV-018: Public Invoice Link Sharing (Unauthenticated View)
  // =========================================================================
  console.log('--- TC-INV-018: Public Invoice Link Sharing ---');
  // Enable public link on invoice
  const linkRes = await axios.post(
    `http://localhost:3001/api/admin/invoices/${createdInv.id}/enable-public-link`,
    {},
    { headers }
  );

  const publicToken = linkRes.data.data?.publicViewToken;
  console.log(`1. Generated Public View Token: ${publicToken}`);

  // Fetch publicly without Authorization header
  const pubViewRes = await axios.get(`http://localhost:3001/api/public/invoices/${publicToken}`);
  const pubInv = pubViewRes.data.data?.invoice || pubViewRes.data.data;

  console.log(`2. Public Access Result: HTTP ${pubViewRes.status} | Invoice #${pubInv?.invoiceNumber} | Total=${Number(pubInv?.TotalAmount).toLocaleString()} UZS`);
  if (pubViewRes.status === 200 && pubInv?.invoiceNumber) {
    console.log('✓ TC-INV-018 PASS: Public invoice link resolves unauthenticated customer view cleanly.\n');
  } else {
    console.log('❌ TC-INV-018 FAIL: Public view resolution failed.\n');
  }


  await p.$disconnect();
}

main().catch((err) => {
  console.error('Error running Invoicing test suite:', err);
  process.exit(1);
});
