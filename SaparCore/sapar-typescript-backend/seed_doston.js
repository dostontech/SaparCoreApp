const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const pw = await bcrypt.hash('password123', 10);
  let adminRole = await prisma.role.findFirst({ where: { roleName: 'Admin' } });
  if (!adminRole) {
    adminRole = await prisma.role.create({ data: { roleName: 'Admin', status: true } });
  }

  const userId = '5b22e867-952d-4050-80f6-6dfcfd3923e7';
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {
      email: 'buildforward33@gmail.com',
      firstName: 'Doston',
      lastName: 'Doston',
      password: pw,
      user_type: 1,
      roleId: adminRole.id,
    },
    create: {
      id: userId,
      email: 'buildforward33@gmail.com',
      firstName: 'Doston',
      lastName: 'Doston',
      password: pw,
      user_type: 1,
      roleId: adminRole.id,
    },
  });

  console.log('✅ User Doston ensured:', user.id, user.email);

  // Ensure default currency (UZS)
  const existingCurrency = await prisma.currency.findFirst({
    where: { userId: userId, currencyCode: 'UZS' },
  });
  if (!existingCurrency) {
    await prisma.currency.create({
      data: {
        userId: userId,
        currencyName: 'Oʻzbekiston soʻmi',
        currencyCode: 'UZS',
        currencySymbol: 'soʻm',
        exchangeRate: 1,
        isDefault: true,
        status: true,
      },
    });
    console.log('✅ Default currency UZS created');
  }

  // Ensure default warehouse (Asosiy Ombor)
  const existingWarehouse = await prisma.warehouse.findFirst({
    where: { userId: userId },
  });
  if (!existingWarehouse) {
    await prisma.warehouse.create({
      data: {
        userId: userId,
        name: 'Asosiy Bosh Ombor',
        code: 'OMB-01',
        address: 'Toshkent sh., Chilonzor tumani',
        isDefault: true,
        status: true,
      },
    });
    console.log('✅ Default Warehouse created');
  }

  // Ensure tax rate 12% QQS
  const existingTax = await prisma.taxRate.findFirst({
    where: { userId: userId, name: 'QQS 12%' },
  });
  if (!existingTax) {
    await prisma.taxRate.create({
      data: {
        userId: userId,
        name: 'QQS 12%',
        taxRate: 12,
        type: 'percentage',
        isDefault: true,
        isActive: true,
      },
    });
    console.log('✅ Tax rate QQS 12% created');
  }

  // Ensure system settings
  const existingSettings = await prisma.systemSetting.findFirst({
    where: { userId: userId },
  });
  if (!existingSettings) {
    await prisma.systemSetting.create({
      data: {
        userId: userId,
        companyName: 'SAPAR Construction & Trade',
        companyPhone: '+998 71 200 00 00',
        companyEmail: 'info@sapar.uz',
        companyAddress: 'Toshkent shahri, Amir Temur shoh koʻchasi, 107B',
        taxNumber: '309123456',
        currency: 'UZS',
        defaultCurrency: 'UZS',
      },
    });
    console.log('✅ System settings created');
  }

  console.log('🎉 Setup for Doston complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
