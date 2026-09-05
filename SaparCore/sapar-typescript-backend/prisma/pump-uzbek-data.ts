/**
 * SAPAR ERP — Uzbekistan Realistic Business Dataset Generator
 *
 * Populates authentic Uzbekistan business records:
 * - Real Tashkent/Samarkand B2B Customers with STIR (INN)
 * - Suppliers with national electronics & office goods
 * - Invoices in UZS (soʻm) with QQS 12%
 * - Bank Accounts (Ipak Yoʻli Bank, Kapitalbank, Milliy Kassa)
 * - E-Documents (Akt Sverki, Ishonchnoma M-2, Shartnoma)
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const D = (n: number | string): Prisma.Decimal => new Prisma.Decimal(n);

async function pumpForUser(userId: string, companyName: string): Promise<void> {
  console.log(`Pumping data for userId=${userId} (${companyName})...`);

  // 1. Company Settings
  await prisma.companySettings.upsert({
    where: { userId },
    update: {
      companyName,
      country: 'Uzbekistan',
      city: 'Toshkent',
      state: 'Toshkent shahri',
      taxRegime: 'VAT_GENERIC',
    },
    create: {
      companyName,
      email: 'info@sapar.uz',
      phone: '+998 71 200-00-00',
      address: 'Toshkent shahri, Amir Temur shox koʻchasi 107B',
      city: 'Toshkent',
      state: 'Toshkent shahri',
      country: 'Uzbekistan',
      pincode: '100000',
      userId,
      taxRegime: 'VAT_GENERIC',
    },
  });

  // 2. Bank Accounts (Uzbekistan Banks)
  const userSuffix = userId.slice(0, 4);
  const banksData = [
    {
      bankName: 'Ipak Yoʻli Bank (Asosiy Hisob-Raqam)',
      accountHoldername: companyName,
      accountNumber: `20208000400512345001-${userSuffix}`,
      branchName: 'Shayxontohur filiali',
      IFSCCode: '00444',
      accountType: 'current' as const,
      openingBalance: D(145000000),
      currentBalance: D(145000000),
      currencyCode: 'UZS',
      status: true,
    },
    {
      bankName: 'Kapitalbank ATB (Valyuta & Karta)',
      accountHoldername: companyName,
      accountNumber: `20208840200598765002-${userSuffix}`,
      branchName: 'Toshkent shahar filiali',
      IFSCCode: '01036',
      accountType: 'current' as const,
      openingBalance: D(85000000),
      currentBalance: D(85000000),
      currencyCode: 'UZS',
      status: true,
    },
    {
      bankName: 'Bosh Kassa (Naqd pul)',
      accountHoldername: companyName,
      accountNumber: `10101000000000000001-${userSuffix}`,
      branchName: 'Kassa №1',
      IFSCCode: '00001',
      accountType: 'savings' as const,
      openingBalance: D(18500000),
      currentBalance: D(18500000),
      currencyCode: 'UZS',
      status: true,
    },
  ];

  const createdBanks: any[] = [];
  for (const b of banksData) {
    const existing = await prisma.bankDetail.findFirst({
      where: { userId, accountNumber: b.accountNumber },
    });
    if (existing) {
      createdBanks.push(existing);
    } else {
      const created = await prisma.bankDetail.create({
        data: {
          ...b,
          userId,
        },
      });
      createdBanks.push(created);
    }
  }

  // 3. Customers
  const customerList = [
    {
      name: `OASIS TEXTILE TRADING MCHJ (${userSuffix})`,
      email: `oasis.textile.${userSuffix}@uzmail.uz`,
      phone: '+998 90 123-45-67',
      gstin: `307891${userSuffix.slice(0, 3)}`,
    },
    {
      name: `SAMARQAND LOGISTIKA SERVIS XK (${userSuffix})`,
      email: `sam.logistics.${userSuffix}@mail.uz`,
      phone: '+998 93 987-65-43',
      gstin: `306543${userSuffix.slice(0, 3)}`,
    },
    {
      name: `TOSHKENT MEGA PHARMA QK (${userSuffix})`,
      email: `megapharma.${userSuffix}@pharma.uz`,
      phone: '+998 71 234-56-78',
      gstin: `305112${userSuffix.slice(0, 3)}`,
    },
    {
      name: `BUXORO AGRO CLUSTER MCHJ (${userSuffix})`,
      email: `agro.buxoro.${userSuffix}@agro.uz`,
      phone: '+998 91 444-55-66',
      gstin: `304998${userSuffix.slice(0, 3)}`,
    },
    {
      name: `GLOBAL FINTECH SYSTEMS MCHJ (${userSuffix})`,
      email: `fintech.${userSuffix}@global.uz`,
      phone: '+998 97 777-88-99',
      gstin: `309334${userSuffix.slice(0, 3)}`,
    },
  ];

  const createdCustomers: any[] = [];
  for (const c of customerList) {
    const existing = await prisma.customer.findFirst({
      where: { userId, name: c.name },
    });
    if (existing) {
      createdCustomers.push(existing);
    } else {
      const created = await prisma.customer.create({
        data: {
          name: c.name,
          email: c.email,
          phone: c.phone,
          gstin: c.gstin,
          status: 'Active',
          userId,
        },
      });
      createdCustomers.push(created);
    }
  }

  // 4. Suppliers
  const supplierList = [
    {
      name: `ASUS CENTRAL ASIA DISTRIBUTION (${userSuffix})`,
      email: `sales.${userSuffix}@asus-ca.uz`,
      phone: '+998 71 202-00-11',
    },
    {
      name: `ORIENT CLOUD & SERVER INFRA MCHJ (${userSuffix})`,
      email: `support.${userSuffix}@orientcloud.uz`,
      phone: '+998 78 150-50-50',
    },
    {
      name: `TOSHKENT QOGʻOZ VA KANSTOVARR MCHJ (${userSuffix})`,
      email: `kanstovar.${userSuffix}@toshkent.uz`,
      phone: '+998 90 333-22-11',
    },
  ];

  const createdSuppliers: any[] = [];
  for (const s of supplierList) {
    const existing = await prisma.supplier.findFirst({
      where: { user_id: userId, supplier_name: s.name },
    });
    if (existing) {
      createdSuppliers.push(existing);
    } else {
      const created = await prisma.supplier.create({
        data: {
          supplier_name: s.name,
          supplier_email: s.email,
          supplier_phone: s.phone,
          user_id: userId,
          balance: 0,
          status: true,
        },
      });
      createdSuppliers.push(created);
    }
  }

  // 5. Invoices (UZS)
  const now = new Date();
  const invoicesData = [
    {
      invoiceNumber: `INV-2026-001-${userSuffix}`,
      customer: createdCustomers[0],
      totalAmount: 33600000,
      taxableAmount: 30000000,
      vat: 3600000,
      status: 'PAID',
      dueDate: new Date(now.getTime() - 15 * 86400000),
      createdAt: new Date(now.getTime() - 25 * 86400000),
    },
    {
      invoiceNumber: `INV-2026-002-${userSuffix}`,
      customer: createdCustomers[1],
      totalAmount: 53760000,
      taxableAmount: 48000000,
      vat: 5760000,
      status: 'PAID',
      dueDate: new Date(now.getTime() - 5 * 86400000),
      createdAt: new Date(now.getTime() - 18 * 86400000),
    },
    {
      invoiceNumber: `INV-2026-003-${userSuffix}`,
      customer: createdCustomers[2],
      totalAmount: 24640000,
      taxableAmount: 22000000,
      vat: 2640000,
      status: 'UNPAID',
      dueDate: new Date(now.getTime() + 10 * 86400000),
      createdAt: new Date(now.getTime() - 4 * 86400000),
    },
    {
      invoiceNumber: `INV-2026-004-${userSuffix}`,
      customer: createdCustomers[3],
      totalAmount: 42560000,
      taxableAmount: 38000000,
      vat: 4560000,
      status: 'OVERDUE',
      dueDate: new Date(now.getTime() - 20 * 86400000),
      createdAt: new Date(now.getTime() - 40 * 86400000),
    },
    {
      invoiceNumber: `INV-2026-005-${userSuffix}`,
      customer: createdCustomers[4],
      totalAmount: 16800000,
      taxableAmount: 15000000,
      vat: 1800000,
      status: 'PARTIALLY_PAID',
      dueDate: new Date(now.getTime() + 5 * 86400000),
      createdAt: new Date(now.getTime() - 7 * 86400000),
    },
  ];

  for (const inv of invoicesData) {
    const existing = await prisma.invoice.findFirst({
      where: { userId, invoiceNumber: inv.invoiceNumber },
    });
    if (!existing) {
      await prisma.invoice.create({
        data: {
          invoiceNumber: inv.invoiceNumber,
          customerId: inv.customer?.id,
          taxableAmount: D(inv.taxableAmount),
          TotalAmount: D(inv.totalAmount),
          vat: D(inv.vat),
          status: inv.status,
          dueDate: inv.dueDate,
          invoiceDate: inv.createdAt,
          createdAt: inv.createdAt,
          userId,
          currencyCode: 'UZS',
          bankId: createdBanks[0]?.id,
          billFrom: userId,
          billTo: inv.customer?.id,
          items: [
            {
              name: 'ERP Dasturiy Taʼminot Oylik Litsenziyasi',
              rate: inv.taxableAmount,
              qty: 1,
              taxableAmount: inv.taxableAmount,
              totalTax: inv.vat,
              lineTotal: inv.totalAmount,
            },
          ] as any,
        },
      });
    }
  }

  // 6. Purchases
  const purchasesData = [
    {
      purchaseId: `PUR-2026-101-${userSuffix}`,
      supplier: createdSuppliers[0],
      totalAmount: 38000000,
      taxAmount: 4071428,
      status: 'paid',
      createdAt: new Date(now.getTime() - 22 * 86400000),
    },
    {
      purchaseId: `PUR-2026-102-${userSuffix}`,
      supplier: createdSuppliers[1],
      totalAmount: 12000000,
      taxAmount: 1285714,
      status: 'pending',
      createdAt: new Date(now.getTime() - 8 * 86400000),
    },
  ];

  for (const pur of purchasesData) {
    const existing = await prisma.purchase.findFirst({
      where: { userId, purchaseId: pur.purchaseId },
    });
    if (!existing) {
      await prisma.purchase.create({
        data: {
          purchaseId: pur.purchaseId,
          supplierId: pur.supplier?.id,
          totalAmount: D(pur.totalAmount),
          taxableAmount: D(pur.totalAmount - pur.taxAmount),
          totalTax: D(pur.taxAmount),
          paidAmount: pur.status === 'paid' ? D(pur.totalAmount) : D(0),
          balanceAmount: pur.status === 'paid' ? D(0) : D(pur.totalAmount),
          status: pur.status,
          purchaseDate: pur.createdAt,
          dueDate: new Date(pur.createdAt.getTime() + 30 * 86400000),
          createdAt: pur.createdAt,
          userId,
          billFrom: userId,
          billTo: userId,
          currencyCode: 'UZS',
          items: [
            {
              name: 'Server Dell PowerEdge R750xs',
              rate: pur.totalAmount,
              qty: 1,
              lineTotal: pur.totalAmount,
            },
          ] as any,
        },
      });
    }
  }

  console.log(`✓ Uzbekistan dataset successfully populated for ${companyName}!`);
}

async function main(): Promise<void> {
  const users = await prisma.user.findMany({
    where: { user_type: 1, isDeleted: false },
    select: { id: true, email: true, firstName: true },
  });

  for (const u of users) {
    await pumpForUser(u.id, u.firstName || 'SAPAR TECHNOLOGIES MCHJ');
  }
}

main()
  .catch((err) => {
    console.error('Error pumping data:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
