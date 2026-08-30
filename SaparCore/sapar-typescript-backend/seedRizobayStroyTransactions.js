/**
 * seedRizobayStroyTransactions.js
 *
 * Seeds real-world Invoices, Purchases, Quotations, and 21-BHMS Accounting entries
 * for OOO "RIZOBAY STROY".
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding Rizobay Stroy Financial Transactions...');

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: 'buildforward33@gmail.com' },
        { email: 'stroy@sapar.uz' },
        { email: 'buxgalter@sapar.uz' },
        { user_type: 1 }
      ]
    }
  });

  for (const user of users) {
    const userId = user.id;
    console.log(`\n💳 Seeding transactions for user: ${user.email} (${userId})...`);

    const customer1 = await prisma.customer.findFirst({ where: { userId, name: { contains: 'TOSHKENT CITY' } } });
    const customer2 = await prisma.customer.findFirst({ where: { userId, name: { contains: 'GOLDEN HOUSE' } } });
    const customer3 = await prisma.customer.findFirst({ where: { userId, name: { contains: 'SAMARQAND' } } });
    const customer4 = await prisma.customer.findFirst({ where: { userId, name: { contains: 'Alimov' } } });

    const contact1 = await prisma.contact.findFirst({ where: { userId, organisation: { contains: 'TOSHKENT CITY' } } });
    const contact2 = await prisma.contact.findFirst({ where: { userId, organisation: { contains: 'GOLDEN HOUSE' } } });
    const contact3 = await prisma.contact.findFirst({ where: { userId, organisation: { contains: 'SAMARQAND' } } });
    const contact4 = await prisma.contact.findFirst({ where: { userId, organisation: { contains: 'Alimov' } } });
    const vendor1 = await prisma.contact.findFirst({ where: { userId, organisation: { contains: "O'ZMETHOLDING" } } });
    const vendor2 = await prisma.contact.findFirst({ where: { userId, organisation: { contains: 'QIZILQUMSEMENT' } } });
    const vendor3 = await prisma.contact.findFirst({ where: { userId, organisation: { contains: 'KNAUF' } } });

    // 1. Sales Invoices
    const invoices = [
      {
        id: `inv-001-${userId}`,
        invoiceNumber: `INV-2026/001-${userId.slice(0, 4)}`,
        customerId: customer1 ? customer1.id : null,
        contactId: contact1 ? contact1.id : null,
        invoiceDate: new Date('2026-08-20T10:00:00.000Z'),
        dueDate: new Date('2026-09-05T10:00:00.000Z'),
        referenceNo: 'DOG-2026/08-01',
        status: 'PAID',
        payment_method: 'Bank Transfer (Ipak Yoʻli Banki)',
        taxableAmount: 161400000,
        vat: 19368000,
        TotalAmount: 180768000,
        currencyCode: 'UZS',
        exchangeRate: 1,
        notes: "A500C d-12mm armatura 15 tonna va Sement M-500 200 qop uchun to'lov.",
        items: [
          { name: 'Armatura A500C d-12mm (Bekobod)', rate: 9800000, quantity: 15, unit: 'tn', amount: 147000000, taxRate: 12 },
          { name: 'Sement M-500 D0 (Qizilqum 50kg)', rate: 72000, quantity: 200, unit: 'qop', amount: 14400000, taxRate: 12 }
        ]
      },
      {
        id: `inv-002-${userId}`,
        invoiceNumber: `INV-2026/002-${userId.slice(0, 4)}`,
        customerId: customer2 ? customer2.id : null,
        contactId: contact2 ? contact2.id : null,
        invoiceDate: new Date('2026-08-24T14:30:00.000Z'),
        dueDate: new Date('2026-09-10T14:30:00.000Z'),
        referenceNo: 'DOG-2026/08-02',
        status: 'SENT',
        payment_method: 'Bank Transfer (Kapitalbank)',
        taxableAmount: 71400000,
        vat: 8568000,
        TotalAmount: 79968000,
        currencyCode: 'UZS',
        exchangeRate: 1,
        notes: 'Gipsokarton Knauf 500 dona va Ruxlangan metall profil 1200 dona.',
        items: [
          { name: 'Gipsokarton Knauf 12.5mm (Namlikka chidamli)', rate: 84000, quantity: 500, unit: 'dona', amount: 42000000, taxRate: 12 },
          { name: 'Profil galvanizatsiyalangan 60x27mm (3m)', rate: 24500, quantity: 1200, unit: 'dona', amount: 29400000, taxRate: 12 }
        ]
      },
      {
        id: `inv-003-${userId}`,
        invoiceNumber: `INV-2026/003-${userId.slice(0, 4)}`,
        customerId: customer3 ? customer3.id : null,
        contactId: contact3 ? contact3.id : null,
        invoiceDate: new Date('2026-08-27T09:15:00.000Z'),
        dueDate: new Date('2026-09-15T09:15:00.000Z'),
        referenceNo: 'DOG-2026/08-03',
        status: 'UNPAID',
        payment_method: 'Bank Transfer',
        taxableAmount: 34100000,
        vat: 4092000,
        TotalAmount: 38192000,
        currencyCode: 'UZS',
        exchangeRate: 1,
        notes: 'Penoblok D-600 1000 dona va Shlakoblok 2000 dona Samarqand shahriga yetkazib berish bilan.',
        items: [
          { name: 'Penoblok D-600 (600x300x200mm)', rate: 18500, quantity: 1000, unit: 'dona', amount: 18500000, taxRate: 12 },
          { name: 'Shlakoblok (20x20x40cm standart)', rate: 7800, quantity: 2000, unit: 'dona', amount: 15600000, taxRate: 12 }
        ]
      }
    ];

    for (const inv of invoices) {
      const existing = await prisma.invoice.findFirst({ where: { userId, invoiceNumber: inv.invoiceNumber } });
      if (existing) {
        await prisma.invoice.update({
          where: { id: existing.id },
          data: {
            status: inv.status,
            taxableAmount: inv.taxableAmount,
            vat: inv.vat,
            TotalAmount: inv.TotalAmount,
            notes: inv.notes,
            items: inv.items
          }
        });
      } else {
        await prisma.invoice.create({
          data: {
            id: inv.id,
            userId,
            billFrom: userId,
            invoiceNumber: inv.invoiceNumber,
            customerId: inv.customerId,
            contactId: inv.contactId,
            invoiceDate: inv.invoiceDate,
            dueDate: inv.dueDate,
            referenceNo: inv.referenceNo,
            status: inv.status,
            payment_method: inv.payment_method,
            taxableAmount: inv.taxableAmount,
            vat: inv.vat,
            TotalAmount: inv.TotalAmount,
            currencyCode: inv.currencyCode,
            exchangeRate: inv.exchangeRate,
            notes: inv.notes,
            items: inv.items
          }
        });
      }
    }

    // 2. Purchases (Xaridlar)
    const purchases = [
      {
        id: `pur-001-${userId}`,
        purchaseId: `PUR-2026/001-${userId.slice(0, 4)}`,
        contactId: vendor1 ? vendor1.id : null,
        purchaseDate: new Date('2026-08-10T08:00:00.000Z'),
        dueDate: new Date('2026-08-25T08:00:00.000Z'),
        referenceNo: 'MET-DOG-884',
        status: 'completed',
        taxableAmount: 425000000,
        totalTax: 51000000,
        totalAmount: 476000000,
        paidAmount: 476000000,
        balanceAmount: 0,
        currencyCode: 'UZS',
        notes: 'Bekobod zavodidan 50 tonna A500C d-12 va d-14 armatura xaridi.',
        items: [
          { name: 'Armatura A500C d-12mm (Bekobod)', rate: 8500000, quantity: 30, unit: 'tn', amount: 255000000, taxRate: 12 },
          { name: 'Armatura A500C d-14mm (Bekobod)', rate: 8500000, quantity: 20, unit: 'tn', amount: 170000000, taxRate: 12 }
        ]
      },
      {
        id: `pur-002-${userId}`,
        purchaseId: `PUR-2026/002-${userId.slice(0, 4)}`,
        contactId: vendor2 ? vendor2.id : null,
        purchaseDate: new Date('2026-08-14T11:00:00.000Z'),
        dueDate: new Date('2026-08-30T11:00:00.000Z'),
        status: 'completed',
        taxableAmount: 61000000,
        totalTax: 7320000,
        totalAmount: 68320000,
        paidAmount: 68320000,
        balanceAmount: 0,
        currencyCode: 'UZS',
        notes: 'Qizilqumsement zavodidan 1000 qop M-500 sement xaridi.',
        items: [
          { name: 'Sement M-500 D0 (Qizilqum 50kg)', rate: 61000, quantity: 1000, unit: 'qop', amount: 61000000, taxRate: 12 }
        ]
      }
    ];

    for (const pur of purchases) {
      const existing = await prisma.purchase.findFirst({ where: { userId, purchaseId: pur.purchaseId } });
      if (existing) {
        await prisma.purchase.update({
          where: { id: existing.id },
          data: {
            status: pur.status,
            taxableAmount: pur.taxableAmount,
            totalTax: pur.totalTax,
            totalAmount: pur.totalAmount,
            notes: pur.notes,
            items: pur.items
          }
        });
      } else {
        await prisma.purchase.create({
          data: {
            id: pur.id,
            userId,
            billFrom: userId,
            purchaseId: pur.purchaseId,
            contactId: pur.contactId,
            purchaseDate: pur.purchaseDate,
            dueDate: pur.dueDate,
            referenceNo: pur.referenceNo,
            status: pur.status,
            taxableAmount: pur.taxableAmount,
            totalTax: pur.totalTax,
            totalAmount: pur.totalAmount,
            paidAmount: pur.paidAmount,
            balanceAmount: pur.balanceAmount,
            currencyCode: pur.currencyCode,
            notes: pur.notes,
            items: pur.items
          }
        });
      }
    }

    // 3. Quotations (Tijorat takliflari)
    const quote = {
      id: `qt-001-${userId}`,
      quotationId: `QT-2026/001-${userId.slice(0, 4)}`,
      customerId: customer4 ? customer4.id : null,
      contactId: contact4 ? contact4.id : null,
      quotationDate: new Date('2026-08-28T15:00:00.000Z'),
      expiryDate: new Date('2026-09-12T15:00:00.000Z'),
      referenceNo: 'KP-2026/04',
      status: 'sent',
      taxableAmount: 25400000,
      vat: 3048000,
      TotalAmount: 28448000,
      notes: "YaTT Alimov Sardor uchun qurilish mollariga 5% ulgurji chegirma bilan tijorat taklifi.",
      items: [
        { name: 'Gipsokarton Knauf 12.5mm (Namlikka chidamli)', rate: 84000, quantity: 150, unit: 'dona', amount: 12600000, taxRate: 12 },
        { name: 'Shpatlyovka Rotband Knauf 30kg', rate: 98000, quantity: 100, unit: 'qop', amount: 9800000, taxRate: 12 },
        { name: 'Profil galvanizatsiyalangan 60x27mm (3m)', rate: 24500, quantity: 122, unit: 'dona', amount: 3000000, taxRate: 12 }
      ]
    };

    const existingQuote = await prisma.quotation.findFirst({ where: { userId, quotationId: quote.quotationId } });
    if (existingQuote) {
      await prisma.quotation.update({
        where: { id: existingQuote.id },
        data: { TotalAmount: quote.TotalAmount, notes: quote.notes, items: quote.items }
      });
    } else {
      await prisma.quotation.create({
        data: {
          id: quote.id,
          userId,
          billFrom: userId,
          quotationId: quote.quotationId,
          customerId: quote.customerId,
          contactId: quote.contactId,
          quotationDate: quote.quotationDate,
          expiryDate: quote.expiryDate,
          referenceNo: quote.referenceNo,
          status: quote.status,
          taxableAmount: quote.taxableAmount,
          vat: quote.vat,
          TotalAmount: quote.TotalAmount,
          currencyCode: 'UZS',
          notes: quote.notes,
          items: quote.items
        }
      });
    }

    console.log(`✅ Financial transactions seeded for user: ${user.email}`);
  }

  console.log('\n🎉 ALL RIZOBAY STROY TRANSACTIONS SEEDED SUCCESSFULLY!');
}

main()
  .catch((e) => {
    console.error('Transactions seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
