import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedDefaultChart } from '../lib/defaultChartOfAccounts';
import { seedRoles } from '../prisma/seedRoles';

const prisma = new PrismaClient();
const D = (n: number | string): Prisma.Decimal => new Prisma.Decimal(n);

async function main() {
  console.log('\n=============================================================');
  console.log('🔄 PROVISIONING ENTERPRISE PRODUCTION DEMO DATASETS');
  console.log('   (1. Construction Store  |  2. Restaurant & Cafe)');
  console.log('=============================================================\n');

  // -------------------------------------------------------------------------
  // STEP 1: CLEAN TRANSACTIONAL AND TEST DATA
  // -------------------------------------------------------------------------
  console.log('--- Step 1: Cleaning previous test data ---');

  const truncateTables = [
    'PosReceiptItem',
    'PosReceipt',
    'PosShift',
    'InventoryCostLayer',
    'Inventory',
    'InvoiceItem',
    'InvoicePayment',
    'Invoice',
    'PurchaseItem',
    'PurchaseOrder',
    'Purchase',
    'QuotationItem',
    'Quotation',
    'CreditNote',
    'DebitNote',
    'DeliveryChallan',
    'JournalLine',
    'JournalEntry',
    'BankTransaction',
    'BankDetail',
    'PettyCash',
    'Expense',
    'Contact',
    'Customer',
    'Supplier',
    'Product',
    'Category',
    'Unit',
    'Account',
    'AccountingPeriod',
    'PayrollProfile',
    'PayRunLine',
    'PayRun',
    'TaxRate',
    'LoginActivity',

    'AccountCreditEntry',
    'ExchangeRate',
    'Budget',
    'FixedAsset',
    'AuditLog',
    'CompanySettings',
    'EmailSettings',
    'GeneralSettings',
    'Localization',
    'CustomField',
    'CustomFieldValue',
    'Vehicle',
    'Reminder',
    'AiChatSession',
    'AiChatMessage',
    'Timesheet',
    'TimeEntry',
    'LeaveRequest',
    'LeaveAllocation',
  ];

  for (const tbl of truncateTables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tbl}" CASCADE;`);
    } catch (e) {
      // ignore if table does not exist
    }
  }

  // Delete non-system users
  await prisma.$executeRawUnsafe(`DELETE FROM "User" WHERE email NOT IN ('system@sapar.internal');`);

  console.log('✓ Old test data cleaned successfully via TRUNCATE CASCADE.\n');

  const passwordHash = await bcrypt.hash('Sapar123!', 10);


  // =========================================================================
  // STEP 2: PROVISION COMPANY 1 — CONSTRUCTION STORE
  // =========================================================================
  console.log('--- Step 2: Provisioning Construction Materials Store ---');

  const stroyOwner = await prisma.user.create({
    data: {
      email: 'stroy@sapar.uz',
      password: passwordHash,
      firstName: 'Farhod',
      lastName: 'Qodirov',
      user_type: 1, // Admin / Owner
      phone: '+998901234567',
    },
  });

  // Seed Default Chart of Accounts for Construction Company
  await seedDefaultChart(prisma, stroyOwner.id);

  // Company Settings
  await prisma.companySettings.create({
    data: {
      userId: stroyOwner.id,
      companyName: 'QURILISH BAZA GRAND MCHJ',
      email: 'stroy@sapar.uz',
      phone: '+998 71 210-44-55',
      address: 'Toshkent sh., Yangiyoʻl yoʻli 15-ombor',
      city: 'Toshkent',
      state: 'Toshkent shahri',
      country: 'Uzbekistan',
      countryCode: 'UZ',
      pincode: '100000',
      functionalCurrency: 'UZS',
      taxRegime: 'VAT_GENERIC', // 12% QQS
      ledgerInitialized: true,
    },
  });

  // Units
  const unitQop = await prisma.unit.create({ data: { unit_name: 'Qop (50kg)', short_name: 'qop', status: true } });
  const unitMetr = await prisma.unit.create({ data: { unit_name: 'Metr', short_name: 'm', status: true } });
  const unitDona = await prisma.unit.create({ data: { unit_name: 'Dona', short_name: 'dona', status: true } });
  const unitPaqir = await prisma.unit.create({ data: { unit_name: 'Paqir (20kg)', short_name: 'paqir', status: true } });
  const unitQuti = await prisma.unit.create({ data: { unit_name: 'Quti (1000 dona)', short_name: 'quti', status: true } });

  // Categories
  const catSement = await prisma.category.create({ data: { category_name: 'Sement va Quruq Aralashmalar', slug: 'sement-quruq-aralashmalar', status: true } });
  const catMetall = await prisma.category.create({ data: { category_name: 'Metall Prokat va Armatura', slug: 'metall-prokat-armatura', status: true } });
  const catGipskarton = await prisma.category.create({ data: { category_name: 'Gipsokarton va Profillar', slug: 'gipsokarton-profillar', status: true } });
  const catBoyoq = await prisma.category.create({ data: { category_name: 'Boʻyoq va Qurilish Kimyosi', slug: 'boyoq-qurilish-kimyosi', status: true } });
  const catGisht = await prisma.category.create({ data: { category_name: 'Gʻisht va Bloklar', slug: 'gisht-bloklar', status: true } });
  const catSantexnika = await prisma.category.create({ data: { category_name: 'Santexnika va Quvurlar', slug: 'santexnika-quvurlar', status: true } });
  const catElektr = await prisma.category.create({ data: { category_name: 'Elektr Montaj va Kabellar', slug: 'elektr-montaj-kabellar', status: true } });
  const catAsboblar = await prisma.category.create({ data: { category_name: 'Asbob-Uskunalar va Mahkamlagichlar', slug: 'asbob-uskunalar', status: true } });

  // Construction Products
  const stroyProducts = [
    { name: 'Sement M500 (Bekobod) 50kg', sku: 'SEM-M500', barcode: '4780012340011', catId: catSement.id, unitId: unitQop.id, cost: 68000, price: 85000, qty: 500 },
    { name: 'Armatura 12mm A500C (Oʻzmetkombinat)', sku: 'ARM-12MM', barcode: '4780012340028', catId: catMetall.id, unitId: unitMetr.id, cost: 10500, price: 13500, qty: 2500 },
    { name: 'Knauf Gipsokarton 12.5mm Namga Chidamli', sku: 'KN-GK-125', barcode: '4780012340035', catId: catGipskarton.id, unitId: unitDona.id, cost: 48000, price: 62000, qty: 350 },
    { name: 'Akfa Emulsiya Fasid Boʻyoq 20kg', sku: 'AKF-FAS-20', barcode: '4780012340042', catId: catBoyoq.id, unitId: unitPaqir.id, cost: 210000, price: 275000, qty: 80 },
    { name: 'Pishgan Gʻisht (1-nav Oʻrtasaroy)', sku: 'GISHT-PISH', barcode: '4780012340059', catId: catGisht.id, unitId: unitDona.id, cost: 1200, price: 1700, qty: 15000 },
    { name: 'Plastik Quvur D50 3m (Santexnika)', sku: 'QVR-D50', barcode: '4780012340066', catId: catSantexnika.id, unitId: unitDona.id, cost: 28000, price: 38000, qty: 200 },
    { name: 'Kabel VVG-P 3x2.5 (Mis Sim)', sku: 'KBL-VVG-325', barcode: '4780012340073', catId: catElektr.id, unitId: unitMetr.id, cost: 9000, price: 12500, qty: 1000 },
    { name: 'Samorez 3.5x35mm (Qora Gipsokarton) 1000 dona', sku: 'SMR-3535', barcode: '4780012340080', catId: catAsboblar.id, unitId: unitQuti.id, cost: 45000, price: 65000, qty: 120 },
    { name: 'Shpaklevka Rotband Knauf 30kg', sku: 'ROT-KNF-30', barcode: '4780012340097', catId: catSement.id, unitId: unitQop.id, cost: 58000, price: 74000, qty: 180 },
    { name: 'Perforator Bosch GBH 2-26 DRE Professional', sku: 'BSH-GBH-226', barcode: '4780012340103', catId: catAsboblar.id, unitId: unitDona.id, cost: 950000, price: 1350000, qty: 15 },
  ];

  for (const item of stroyProducts) {
    const prod = await prisma.product.create({
      data: {
        item_type: 'Product',
        name: item.name,
        code: item.sku,
        barcode: item.barcode,
        categoryId: item.catId,
        unitId: item.unitId,
        purchase_price: D(item.cost),
        selling_price: D(item.price),
        enable_inventory: true,
        stock: Math.floor(item.qty),
        status: true,
        valuationMethod: 'FIFO',
      },
    });

    // Create Inventory & FIFO Cost layer
    await prisma.inventory.create({
      data: {
        userId: stroyOwner.id,
        productId: prod.id,
        quantityOnHand: D(item.qty),
        avgCost: D(item.cost),
        quantity: Math.floor(item.qty),
      },
    });

    await prisma.inventoryCostLayer.create({
      data: {
        userId: stroyOwner.id,
        productId: prod.id,
        qtyRemaining: D(item.qty),
        unitCost: D(item.cost),
        receivedAt: new Date(),
      },
    });
  }

  // Bank Accounts
  await prisma.bankDetail.create({
    data: {
      userId: stroyOwner.id,
      bankName: 'Ipak Yoʻli Bank ATB (Asosiy Hisob-Raqam)',
      accountHoldername: 'QURILISH BAZA GRAND MCHJ',
      branchName: 'Toshkent Bosh Filiali',
      accountNumber: '20208000900123456001',
      IFSCCode: '00444',
      accountType: 'current',
      openingBalance: D(350000000),
      currentBalance: D(350000000),
      currencyCode: 'UZS',
      status: true,
    },
  });

  // Construction Contacts (Suppliers and Clients)
  await prisma.contact.createMany({
    data: [
      {
        userId: stroyOwner.id,
        organisation: 'BEKOBOD SEMENT ZAVODI AJ',
        firstName: 'Anvar',
        lastName: 'Sultonov',
        email: 'sales@bekobodcement.uz',
        mobile: '+998901112233',
        vatNumber: '201998877',
        town: 'Bekobod',
        country: 'UZ',
      },
      {
        userId: stroyOwner.id,
        organisation: 'OʻZMETKOMBINAT AJ',
        firstName: 'Bobur',
        lastName: 'Rustamov',
        email: 'trade@uzmetkombinat.uz',
        mobile: '+998902223344',
        vatNumber: '201445566',
        town: 'Bekobod',
        country: 'UZ',
      },
      {
        userId: stroyOwner.id,
        organisation: 'TOSHKENT CITY QURILISH MCHJ',
        firstName: 'Nodir',
        lastName: 'Zokirov',
        email: 'nodir@tashkentcity.uz',
        mobile: '+998903334455',
        vatNumber: '307123987',
        town: 'Toshkent',
        country: 'UZ',
      },
      {
        userId: stroyOwner.id,
        organisation: 'MURAD BUILDINGS SUBPUDRAT XK',
        firstName: 'Jamshid',
        lastName: 'Karimov',
        email: 'jamshid@muradbuildings.uz',
        mobile: '+998904445566',
        vatNumber: '305889911',
        town: 'Toshkent',
        country: 'UZ',
      },
    ],
  });

  console.log('✓ Construction Store ("QURILISH BAZA GRAND MCHJ") provisioned successfully.');
  console.log('  • Login: stroy@sapar.uz / Sapar123!');
  console.log('  • 10 Construction materials with barcodes, 12% QQS & FIFO stock layers.\n');

  // =========================================================================
  // STEP 3: PROVISION COMPANY 2 — RESTAURANT & CAFE
  // =========================================================================
  console.log('--- Step 3: Provisioning Restaurant & Cafe ---');

  const restOwner = await prisma.user.create({
    data: {
      email: 'restaurant@sapar.uz',
      password: passwordHash,
      firstName: 'Dilshod',
      lastName: 'Usmonov',
      user_type: 1, // Admin / Owner
      phone: '+998977778899',
    },
  });

  // Seed Default Chart of Accounts for Restaurant
  await seedDefaultChart(prisma, restOwner.id);

  // Company Settings
  await prisma.companySettings.create({
    data: {
      userId: restOwner.id,
      companyName: 'RAYHON MILLIY TAOMLAR RESTORANI MCHJ',
      email: 'restaurant@sapar.uz',
      phone: '+998 71 277-33-00',
      address: 'Toshkent sh., Chilonzor 9-mavze, 21-bino',
      city: 'Toshkent',
      state: 'Toshkent shahri',
      country: 'Uzbekistan',
      countryCode: 'UZ',
      pincode: '100000',
      functionalCurrency: 'UZS',
      taxRegime: 'VAT_GENERIC',
      ledgerInitialized: true,
    },
  });


  // Restaurant Menu & Products
  const unitPors = await prisma.unit.create({ data: { unit_name: 'Porsiya', short_name: 'pors', status: true } });
  const unitSix = await prisma.unit.create({ data: { unit_name: 'Six', short_name: 'six', status: true } });
  const unitChoynak = await prisma.unit.create({ data: { unit_name: 'Choynak', short_name: 'choynak', status: true } });
  const unitButilka = await prisma.unit.create({ data: { unit_name: 'Butilka', short_name: 'but', status: true } });

  const catTaomlar = await prisma.category.create({ data: { category_name: 'Milliy Taomlar va Osh', slug: 'milliy-taomlar-osh', status: true } });
  const catShashlik = await prisma.category.create({ data: { category_name: 'Kaboblar va Shashliklar', slug: 'kaboblar-shashliklar', status: true } });
  const catSomsa = await prisma.category.create({ data: { category_name: 'Tandir Somsa va Pishiriqlar', slug: 'tandir-somsa-pishiriqlar', status: true } });
  const catSalat = await prisma.category.create({ data: { category_name: 'Salatlar va Gazaklar', slug: 'salatlar-gazaklar', status: true } });
  const catIchimlik = await prisma.category.create({ data: { category_name: 'Issiq va Salqin Ichimliklar', slug: 'issiq-salqin-ichimliklar', status: true } });
  const catDesert = await prisma.category.create({ data: { category_name: 'Desertlar va Shirinliklar', slug: 'desertlar-shirinliklar', status: true } });

  const restaurantMenu = [
    { name: 'Toshkent Toʻy Oshi (Choyxona Palov 1 pors)', sku: 'OSH-TOY-01', barcode: '4781012340018', catId: catTaomlar.id, unitId: unitPors.id, cost: 18000, price: 38000, qty: 150 },
    { name: 'Qoʻy Goʻshti Qiyma Shashlik (1 six)', sku: 'KAB-QIYMA', barcode: '4781012340025', catId: catShashlik.id, unitId: unitSix.id, cost: 9000, price: 18000, qty: 200 },
    { name: 'Mol Goʻshti Lula Kabob (1 six)', sku: 'KAB-LULA', barcode: '4781012340032', catId: catShashlik.id, unitId: unitSix.id, cost: 10500, price: 20000, qty: 180 },
    { name: 'Qozon Kabob (Qoʻy Qovurgʻasi Kartoshka Bilan)', sku: 'QOZON-KAB', barcode: '4781012340049', catId: catTaomlar.id, unitId: unitPors.id, cost: 32000, price: 65000, qty: 80 },
    { name: 'Tandir Goʻshtli Somsa (1 dona)', sku: 'SOMSA-TND', barcode: '4781012340056', catId: catSomsa.id, unitId: unitDona.id, cost: 4500, price: 10000, qty: 300 },
    { name: 'Uygʻur Choʻzma Lagʻmon (Issiq Taom)', sku: 'LAGMON-UYG', barcode: '4781012340063', catId: catTaomlar.id, unitId: unitPors.id, cost: 16000, price: 34000, qty: 90 },
    { name: 'Achchiq-Chuchuk Salati (Pomidor, Piyoz, Koʻkat)', sku: 'SAL-ACHQ', barcode: '4781012340070', catId: catSalat.id, unitId: unitPors.id, cost: 4000, price: 12000, qty: 120 },
    { name: 'Samarqand Patir Noni (Yangi)', sku: 'NON-PATIR', barcode: '4781012340087', catId: catSomsa.id, unitId: unitDona.id, cost: 3000, price: 7000, qty: 150 },
    { name: 'Limonli Koʻk Choy (Choynakda 1L)', sku: 'CHOY-KOK-LMN', barcode: '4781012340094', catId: catIchimlik.id, unitId: unitChoynak.id, cost: 2500, price: 8000, qty: 250 },
    { name: 'Coca-Cola 1.5L (Muzdek)', sku: 'COLA-15L', barcode: '4781012340100', catId: catIchimlik.id, unitId: unitButilka.id, cost: 10000, price: 16000, qty: 120 },
    { name: 'Dena Tabiiy Sharbat 1L (Olma / Shaftoli)', sku: 'DENA-1L', barcode: '4781012340117', catId: catIchimlik.id, unitId: unitButilka.id, cost: 9500, price: 15000, qty: 80 },
    { name: 'Chizkeyk Deserti (Mevali)', sku: 'DES-CHZ', barcode: '4781012340124', catId: catDesert.id, unitId: unitPors.id, cost: 12000, price: 26000, qty: 40 },
  ];

  for (const item of restaurantMenu) {
    const prod = await prisma.product.create({
      data: {
        item_type: 'Product',
        name: item.name,
        code: item.sku,
        barcode: item.barcode,
        categoryId: item.catId,
        unitId: item.unitId,
        purchase_price: D(item.cost),
        selling_price: D(item.price),
        enable_inventory: true,
        stock: Math.floor(item.qty),
        status: true,
        valuationMethod: 'FIFO',
      },
    });

    await prisma.inventory.create({
      data: {
        userId: restOwner.id,
        productId: prod.id,
        quantityOnHand: D(item.qty),
        avgCost: D(item.cost),
        quantity: Math.floor(item.qty),
      },
    });

    await prisma.inventoryCostLayer.create({
      data: {
        userId: restOwner.id,
        productId: prod.id,
        qtyRemaining: D(item.qty),
        unitCost: D(item.cost),
        receivedAt: new Date(),
      },
    });
  }

  // Restaurant Bank Account
  await prisma.bankDetail.create({
    data: {
      userId: restOwner.id,
      bankName: 'Kapitalbank ATB (Restoran Hisobi)',
      accountHoldername: 'RAYHON MILLIY TAOMLAR RESTORANI MCHJ',
      branchName: 'Sayram Filiali',
      accountNumber: '20208000500987654001',
      IFSCCode: '01036',
      accountType: 'current',
      openingBalance: D(95000000),
      currentBalance: D(95000000),
      currencyCode: 'UZS',
      status: true,
    },
  });

  // Restaurant Contacts (Suppliers & Corporate Banquets)
  await prisma.contact.createMany({
    data: [
      {
        userId: restOwner.id,
        organisation: 'QOʻYLIQ GOʻSHT VA GOʻSHT MAHSULOTLARI BAZASI',
        firstName: 'Olim',
        lastName: 'Qosimov',
        email: 'meat@qoyliq.uz',
        mobile: '+998905556677',
        vatNumber: '304112233',
        town: 'Toshkent',
        country: 'UZ',
      },
      {
        userId: restOwner.id,
        organisation: 'COCA-COLA BOTTLERS UZBEKISTAN',
        firstName: 'Sardor',
        lastName: 'Azimov',
        email: 'orders@coca-cola.uz',
        mobile: '+998906667788',
        vatNumber: '200112233',
        town: 'Toshkent',
        country: 'UZ',
      },
      {
        userId: restOwner.id,
        organisation: 'ANORBANK ATB (KORPORATIV TADBIRLAR)',
        firstName: 'Lola',
        lastName: 'Karimova',
        email: 'events@anorbank.uz',
        mobile: '+998907778899',
        vatNumber: '305112233',
        town: 'Toshkent',
        country: 'UZ',
      },
    ],
  });

  console.log('✓ Restaurant ("RAYHON MILLIY TAOMLAR MCHJ") provisioned successfully.');
  console.log('  • Login: restaurant@sapar.uz / Sapar123!');
  console.log('  • 12 Menu items, POS kitchen inventory & fresh stock.\n');

  // Seed and bind Admin Roles & Permissions
  console.log('--- Step 4: Seeding Roles and Granular Module Permissions ---');
  await seedRoles();
  console.log('✓ Roles and permissions provisioned and assigned to company owners.\n');


  console.log('=============================================================');
  console.log('🎉 ALL ENTERPRISE DATASETS PROVISIONED & READY FOR CLIENTS');
  console.log('=============================================================\n');

  await prisma.$disconnect();

}

main().catch((err) => {
  console.error('Error provisioning enterprise datasets:', err);
  process.exit(1);
});
