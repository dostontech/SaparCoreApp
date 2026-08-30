const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedDemoData() {
  try {
    console.log('🚀 Seeding realistic Uzbekistan client demo data...');

    // 1. Ensure Main Accounting User (Aziza Rahimova)
    const email = 'buxgalter@sapar.uz';
    const hashedPassword = await bcrypt.hash('password123', 10);
    let role = await prisma.role.findFirst({ where: { roleName: 'Bosh Buxgalter' } });
    if (!role) {
      role = await prisma.role.create({ data: { roleName: 'Bosh Buxgalter', status: true } });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        firstName: 'Aziza',
        lastName: 'Rahimova (Bosh Buxgalter)',
        phone: '+998909876543',
        password: hashedPassword,
        roleId: role.id,
      },
      create: {
        email,
        firstName: 'Aziza',
        lastName: 'Rahimova (Bosh Buxgalter)',
        phone: '+998909876543',
        password: hashedPassword,
        roleId: role.id,
        user_type: 1,
      },
    });

    const tenantId = user.id;

    // 2. Seed 21-son BHMS Accounts
    const accountsData = [
      { code: '0120', name: 'Bino va inshootlar', accountType: 'ASSET', description: 'Asosiy vositalar' },
      { code: '0130', name: 'Mashina va uskunalar', accountType: 'ASSET', description: 'Ishlab chiqarish uskunalari' },
      { code: '1010', name: 'Xom-ashyo va materiallar', accountType: 'ASSET', description: 'Ombordagi materiallar' },
      { code: '2910', name: 'Ombordagi tovarlar', accountType: 'ASSET', description: 'Sotuvga tayyor tovarlar' },
      { code: '4010', name: 'Xaridorlar va buyurtmachilar qarzlari', accountType: 'ASSET', description: 'Debitorlik qarzdorligi' },
      { code: '5010', name: 'Milliy valyutadagi naqd pullar (Kassa)', accountType: 'ASSET', description: 'Asosiy kassa' },
      { code: '5110', name: 'Hisob-kitob raqami (Milliy valyuta UZS)', accountType: 'ASSET', description: 'Ipak Yoʻli Bank' },
      { code: '5210', name: 'Valyuta hisob-kitob raqami (USD)', accountType: 'ASSET', description: 'Kapitalbank USD' },
      { code: '6010', name: 'Yetkazib beruvchilarga toʻlanadigan qarzlar', accountType: 'LIABILITY', description: 'Kreditorlik qarzdorligi' },
      { code: '6410', name: 'Byudjetga toʻlovlar (QQS 12%)', accountType: 'LIABILITY', description: 'Qoʻshilgan qiymat soligʻi' },
      { code: '6510', name: 'Ijtimoiy sugʻurta va pensiya toʻlovlari', accountType: 'LIABILITY', description: 'INPS va Ijtimoiy soliq' },
      { code: '6710', name: 'Mehnat haqi boʻyicha xodimlar bilan hisob-kitoblar', accountType: 'LIABILITY', description: 'Ish haqi' },
      { code: '8330', name: 'Nizom kapitali', accountType: 'EQUITY', description: 'Ustav fondi' },
      { code: '8710', name: 'Hisobot davrining taqsimlanmagan foydasi', accountType: 'EQUITY', description: 'Sof foyda' },
      { code: '9010', name: 'Tayyor mahsulot (tovarlar) sotishdan daromad', accountType: 'INCOME', description: 'Asosiy faoliyat tushumi' },
      { code: '9110', name: 'Sotilgan mahsulot (tovarlar) tannarxi', accountType: 'EXPENSE', description: 'Tannarx' },
      { code: '9410', name: 'Sotish xarajatlari', accountType: 'EXPENSE', description: 'Marketing va logistika' },
      { code: '9420', name: 'Maʼmuriy xarajatlar', accountType: 'EXPENSE', description: 'Ofis, maosh va aloqa' },
    ];

    const accountMap = {};
    for (const acc of accountsData) {
      let existing = await prisma.account.findFirst({
        where: { code: acc.code, userId: tenantId },
      });
      if (!existing) {
        existing = await prisma.account.create({
          data: { ...acc, userId: tenantId },
        });
      }
      accountMap[acc.code] = existing.id;
    }

    console.log('✅ Seeded 21-son BHMS Accounts');

    // 3. Seed Counterparties (Contacts)
    const contactsData = [
      {
        organisation: 'OOO "TOSHKENT MEGA SAVDO"',
        firstName: 'Alisher',
        lastName: 'Usmonov',
        mobile: '+998712001122',
        email: 'info@megasavdo.uz',
        vatRegNumber: '308123456',
        addressLine1: 'Toshkent shahri, Chilonzor tumani, Bunyodkor shoh koʻchasi, 42-uy',
      },
      {
        organisation: 'OOO "SAMARQAND TEXTILE GROUP"',
        firstName: 'Rustam',
        lastName: 'Karimov',
        mobile: '+998662334455',
        email: 'sales@samtextile.uz',
        vatRegNumber: '307654321',
        addressLine1: 'Samarqand shahri, Registon koʻchasi, 15-uy',
      },
      {
        organisation: 'OOO "ORIENT DISTRIBUTION"',
        firstName: 'Farrux',
        lastName: 'Zokirov',
        mobile: '+998712338899',
        email: 'contact@orientdist.uz',
        vatRegNumber: '309445566',
        addressLine1: 'Toshkent shahri, Mirobod tumani, Nukus koʻchasi, 88-uy',
      },
      {
        organisation: 'OOO "UZAUTO MOTORS AJ"',
        firstName: 'Sardor',
        lastName: 'Tursunov',
        mobile: '+998781405500',
        email: 'procurement@uzautomotors.com',
        vatRegNumber: '301223344',
        addressLine1: 'Andijon viloyati, Asaka shahri, Humo koʻchasi, 1-uy',
      },
      {
        organisation: 'OOO "KORZINKA LOGISTICS"',
        firstName: 'Zafar',
        lastName: 'Hoshimov',
        mobile: '+998711401414',
        email: 'logistics@korzinka.uz',
        vatRegNumber: '305998877',
        addressLine1: 'Toshkent shahri, Yakkasaroy tumani, Shota Rustaveli koʻchasi, 5-uy',
      },
    ];

    for (const c of contactsData) {
      const existing = await prisma.contact.findFirst({
        where: { organisation: c.organisation, userId: tenantId },
      });
      if (!existing) {
        await prisma.contact.create({
          data: { ...c, userId: tenantId },
        });
      }
    }

    console.log('✅ Seeded Uzbekistan Counterparties');

    // 4. Seed Journal Entries (Provodkalar)
    const existingEntriesCount = await prisma.journalEntry.count({ where: { userId: tenantId } });
    if (existingEntriesCount === 0) {
      // Entry 1: Payment received from customer (5110 -> 4010)
      await prisma.journalEntry.create({
        data: {
          entryNumber: 'JR-2026/001',
          entryDate: new Date(),
          description: 'OOO "TOSHKENT MEGA SAVDO" xaridoridan hisob-faktura boʻyicha toʻlov qabul qilindi',
          reference: 'FAK-8849/2026',
          userId: tenantId,
          lines: {
            create: [
              {
                accountId: accountMap['5110'],
                debit: 125000000,
                credit: 0,
                description: 'Bank hisob raqamiga tushum (Ipak Yoʻli Bank)',
              },
              {
                accountId: accountMap['4010'],
                debit: 0,
                credit: 125000000,
                description: 'Xaridor qarzdorligini yopish',
              },
            ],
          },
        },
      });

      // Entry 2: Payment to supplier (6010 -> 5110)
      await prisma.journalEntry.create({
        data: {
          entryNumber: 'JR-2026/002',
          entryDate: new Date(),
          description: 'OOO "UZAUTO MOTORS AJ" yetkazib beruvchisiga toʻlov oʻtkazildi',
          reference: 'TOʻL-4491',
          userId: tenantId,
          lines: {
            create: [
              {
                accountId: accountMap['6010'],
                debit: 48500000,
                credit: 0,
                description: 'Yetkazib beruvchi oldidagi qarzni toʻlash',
              },
              {
                accountId: accountMap['5110'],
                debit: 0,
                credit: 48500000,
                description: 'Bank hisobidan chiqim',
              },
            ],
          },
        },
      });

      // Entry 3: Raw materials inventory receiving (1010 -> 6010)
      await prisma.journalEntry.create({
        data: {
          entryNumber: 'JR-2026/003',
          entryDate: new Date(),
          description: 'OOO "KORZINKA LOGISTICS" orqali xom-ashyo omborga qabul qilindi',
          reference: 'YUK-1092',
          userId: tenantId,
          lines: {
            create: [
              {
                accountId: accountMap['1010'],
                debit: 32000000,
                credit: 0,
                description: 'Xom-ashyo va materiallar kirimi',
              },
              {
                accountId: accountMap['6010'],
                debit: 0,
                credit: 32000000,
                description: 'Yetkazib beruvchiga kreditorlik qarzi',
              },
            ],
          },
        },
      });

      console.log('✅ Seeded Journal Entries (Provodkalar)');
    }

    console.log('✨ Demo Seeding Complete!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoData();
