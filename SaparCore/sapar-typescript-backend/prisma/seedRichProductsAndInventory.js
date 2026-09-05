/**
 * seedRichProductsAndInventory.js
 * 
 * Automatically seeds 30+ realistic Uzbekistan B2B products and live inventory stock
 * across warehouses (Devor materiallari, Metall & Armatura, Sement, Santexnika, Elektr)
 * so that both /admin/products and /admin/inventory show rich, authentic stock data.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedRichProductsAndInventory() {
  console.log('📦 [seed] Checking and seeding rich Uzbekistan B2B products and inventory...');

  try {
    // 1. Ensure Categories
    const categoriesList = [
      { name: 'Devor bloklari va Gʻisht', slug: 'devor-bloklari' },
      { name: 'Sement va Quruq qorishmalar', slug: 'sement-va-quruq-qorishmalar' },
      { name: 'Metall, Armatura va Trubalar', slug: 'metall-va-armatura' },
      { name: 'Gipsokarton va Profillar', slug: 'gipsokarton-va-profillar' },
      { name: 'Santexnika va Isitish tizimlari', slug: 'santexnika-va-isitish' },
      { name: 'Elektr, Kabel va Avtomatika', slug: 'elektr-va-kabel' },
      { name: 'Yogʻoch va Tom yopish mollari', slug: 'yogoch-va-tom-yopish' },
      { name: 'Boʻyoqlar va Pardozlash', slug: 'boyoqlar-va-pardozlash' },
    ];

    const categoryMap = {};
    for (const c of categoriesList) {
      let cat = await prisma.category.findFirst({
        where: { OR: [{ slug: c.slug }, { category_name: c.name }] },
      });
      if (!cat) {
        cat = await prisma.category.create({
          data: { category_name: c.name, slug: c.slug, status: true },
        });
      }
      categoryMap[c.slug] = cat.id;
    }

    // 2. Ensure Brands
    const brandsList = [
      'Bekobod Metallurgiya',
      'Knauf',
      'Qizilqumsement',
      "O'zmetkombinat",
      'Akfa',
      'Artel',
      'Chint Electric',
      'Ekoplastik',
      'Immergas',
      'Andijon Kabel',
    ];

    const brandMap = {};
    for (const b of brandsList) {
      let brand = await prisma.brand.findFirst({
        where: { brand_name: b },
      });
      if (!brand) {
        brand = await prisma.brand.create({
          data: { brand_name: b, status: true },
        });
      }
      brandMap[b] = brand.id;
    }

    // 3. Ensure Units
    const unitsList = [
      { name: 'Dona', short: 'dona' },
      { name: 'Metr', short: 'm' },
      { name: 'Tonna', short: 'tn' },
      { name: 'Kvadrat metr', short: 'm2' },
      { name: 'Kub metr', short: 'm3' },
      { name: 'Qop (50kg)', short: 'qop' },
      { name: 'Quti (Pachka)', short: 'quti' },
      { name: 'Kilogramm', short: 'kg' },
    ];

    const unitMap = {};
    for (const u of unitsList) {
      let unit = await prisma.unit.findFirst({
        where: { OR: [{ short_name: u.short }, { unit_name: u.name }] },
      });
      if (!unit) {
        unit = await prisma.unit.create({
          data: { unit_name: u.name, short_name: u.short, status: true },
        });
      }
      unitMap[u.short] = unit.id;
    }

    // 4. Products Catalog (Uzbekistan B2B standards, MXIK & barcodes)
    const productsCatalog = [
      // Devor bloklari
      {
        code: 'GB-D600-600',
        name: 'Gazoblok D600 600x300x200mm (Zavod)',
        barcode: '4780012340015',
        catSlug: 'devor-bloklari',
        brandName: 'Bekobod Metallurgiya',
        unitShort: 'dona',
        selling_price: 18500,
        purchase_price: 14200,
        stock: 4500,
        alert_qty: 300,
      },
      {
        code: 'SHLAK-M75',
        name: 'Shlakoblok M-75 (20x20x40cm standart)',
        barcode: '4780012340039',
        catSlug: 'devor-bloklari',
        brandName: 'Bekobod Metallurgiya',
        unitShort: 'dona',
        selling_price: 6800,
        purchase_price: 4800,
        stock: 8500,
        alert_qty: 800,
      },
      {
        code: 'GISHT-QIZIL-SAM',
        name: 'Gʻisht qizil pishiq (Samarqand 250x120x65mm)',
        barcode: '4780012340107',
        catSlug: 'devor-bloklari',
        brandName: 'Bekobod Metallurgiya',
        unitShort: 'dona',
        selling_price: 1450,
        purchase_price: 1050,
        stock: 35000,
        alert_qty: 3000,
      },
      {
        code: 'PENO-D500',
        name: 'Penoblok D-500 issiqlik izolyatsion',
        barcode: '4780012340022',
        catSlug: 'devor-bloklari',
        brandName: 'Bekobod Metallurgiya',
        unitShort: 'dona',
        selling_price: 19000,
        purchase_price: 14800,
        stock: 2800,
        alert_qty: 250,
      },

      // Sement va Qorishmalar
      {
        code: 'SEM-M500-QIZIL',
        name: 'Sement M-500 D0 (Qizilqum 50kg)',
        barcode: '4780012340046',
        catSlug: 'sement-va-quruq-qorishmalar',
        brandName: 'Qizilqumsement',
        unitShort: 'qop',
        selling_price: 72000,
        purchase_price: 58000,
        stock: 1400,
        alert_qty: 150,
      },
      {
        code: 'SEM-M400-OHANG',
        name: 'Sement M-400 D20 (Ohangaron 50kg)',
        barcode: '4780012340114',
        catSlug: 'sement-va-quruq-qorishmalar',
        brandName: 'Qizilqumsement',
        unitShort: 'qop',
        selling_price: 64000,
        purchase_price: 51000,
        stock: 1800,
        alert_qty: 200,
      },
      {
        code: 'ROTBAND-30KG',
        name: 'Gipsli shuvoq Knauf Rotband 30kg',
        barcode: '4780012340053',
        catSlug: 'sement-va-quruq-qorishmalar',
        brandName: 'Knauf',
        unitShort: 'qop',
        selling_price: 98000,
        purchase_price: 79000,
        stock: 650,
        alert_qty: 60,
      },
      {
        code: 'FLIESEN-KLEY',
        name: 'Plitka yelimi Knauf Fliesen 25kg',
        barcode: '4780012340121',
        catSlug: 'sement-va-quruq-qorishmalar',
        brandName: 'Knauf',
        unitShort: 'qop',
        selling_price: 58000,
        purchase_price: 45000,
        stock: 920,
        alert_qty: 100,
      },

      // Metall va Armatura
      {
        code: 'ARM-12-BEK',
        name: 'Armatura A500C d-12mm (Bekobod)',
        barcode: '4780012340077',
        catSlug: 'metall-va-armatura',
        brandName: "O'zmetkombinat",
        unitShort: 'tn',
        selling_price: 9800000,
        purchase_price: 8600000,
        stock: 65,
        alert_qty: 8,
      },
      {
        code: 'ARM-14-BEK',
        name: 'Armatura A500C d-14mm (Bekobod)',
        barcode: '4780012340138',
        catSlug: 'metall-va-armatura',
        brandName: "O'zmetkombinat",
        unitShort: 'tn',
        selling_price: 9950000,
        purchase_price: 8750000,
        stock: 52,
        alert_qty: 6,
      },
      {
        code: 'ARM-16-BEK',
        name: 'Armatura A500C d-16mm (Bekobod)',
        barcode: '4780012340145',
        catSlug: 'metall-va-armatura',
        brandName: "O'zmetkombinat",
        unitShort: 'tn',
        selling_price: 9950000,
        purchase_price: 8750000,
        stock: 44,
        alert_qty: 5,
      },
      {
        code: 'TRUBA-PROF-4040',
        name: 'Truba profil 40x40x2mm (6 metr)',
        barcode: '4780012340152',
        catSlug: 'metall-va-armatura',
        brandName: 'Bekobod Metallurgiya',
        unitShort: 'dona',
        selling_price: 88000,
        purchase_price: 71000,
        stock: 1250,
        alert_qty: 150,
      },
      {
        code: 'TRUBA-PROF-6060',
        name: 'Truba profil 60x60x2.5mm (6 metr)',
        barcode: '4780012340169',
        catSlug: 'metall-va-armatura',
        brandName: 'Bekobod Metallurgiya',
        unitShort: 'dona',
        selling_price: 165000,
        purchase_price: 135000,
        stock: 720,
        alert_qty: 80,
      },
      {
        code: 'UGOLOK-50-4',
        name: 'Poʻlat burchaklik (Ugolok) 50x50x4mm (6m)',
        barcode: '4780012340176',
        catSlug: 'metall-va-armatura',
        brandName: "O'zmetkombinat",
        unitShort: 'dona',
        selling_price: 145000,
        purchase_price: 118000,
        stock: 540,
        alert_qty: 50,
      },

      // Gipsokarton va Profillar
      {
        code: 'GK-125-NAM',
        name: 'Gipsokarton Knauf 12.5mm (Namlikka chidamli)',
        barcode: '4780012340060',
        catSlug: 'gipsokarton-va-profillar',
        brandName: 'Knauf',
        unitShort: 'dona',
        selling_price: 84000,
        purchase_price: 66000,
        stock: 850,
        alert_qty: 100,
      },
      {
        code: 'GK-95-ODDIY',
        name: 'Gipsokarton Knauf 9.5mm (Shift uchun)',
        barcode: '4780012340183',
        catSlug: 'gipsokarton-va-profillar',
        brandName: 'Knauf',
        unitShort: 'dona',
        selling_price: 72000,
        purchase_price: 57000,
        stock: 1100,
        alert_qty: 120,
      },
      {
        code: 'PROF-CD60-3M',
        name: 'Profil Knauf CD 60/27 0.6mm (3 metr)',
        barcode: '4780012340190',
        catSlug: 'gipsokarton-va-profillar',
        brandName: 'Knauf',
        unitShort: 'dona',
        selling_price: 26000,
        purchase_price: 19500,
        stock: 2400,
        alert_qty: 300,
      },
      {
        code: 'PROF-UD28-3M',
        name: 'Profil Knauf UD 28/27 0.6mm (3 metr)',
        barcode: '4780012340206',
        catSlug: 'gipsokarton-va-profillar',
        brandName: 'Knauf',
        unitShort: 'dona',
        selling_price: 18000,
        purchase_price: 13500,
        stock: 3100,
        alert_qty: 350,
      },

      // Santexnika va Isitish
      {
        code: 'PPR-25-PN20',
        name: 'PPR Quvuri d-25mm PN20 issiq suv (Ekoplastik, 4m)',
        barcode: '4780012340084',
        catSlug: 'santexnika-va-isitish',
        brandName: 'Ekoplastik',
        unitShort: 'dona',
        selling_price: 34000,
        purchase_price: 25000,
        stock: 1450,
        alert_qty: 180,
      },
      {
        code: 'PPR-32-PN20',
        name: 'PPR Quvuri d-32mm PN20 issiq suv (Ekoplastik, 4m)',
        barcode: '4780012340213',
        catSlug: 'santexnika-va-isitish',
        brandName: 'Ekoplastik',
        unitShort: 'dona',
        selling_price: 48000,
        purchase_price: 36000,
        stock: 890,
        alert_qty: 100,
      },
      {
        code: 'RAD-BIMET-10',
        name: 'Bimetall radiator 10 seksiyali (Immergas Royal)',
        barcode: '4780012340220',
        catSlug: 'santexnika-va-isitish',
        brandName: 'Immergas',
        unitShort: 'dona',
        selling_price: 950000,
        purchase_price: 760000,
        stock: 160,
        alert_qty: 25,
      },
      {
        code: 'PVX-KANAL-110',
        name: 'Kanalizatsiya quvuri PVX d-110mm (3m)',
        barcode: '4780012340237',
        catSlug: 'santexnika-va-isitish',
        brandName: 'Akfa',
        unitShort: 'dona',
        selling_price: 68000,
        purchase_price: 51000,
        stock: 520,
        alert_qty: 60,
      },

      // Elektr va Kabel
      {
        code: 'KAB-VVG-3X25',
        name: 'Kabel VVGng-LS 3x2.5mm mis (Andijon Kabel, 100m)',
        barcode: '4780012340244',
        catSlug: 'elektr-va-kabel',
        brandName: 'Andijon Kabel',
        unitShort: 'dona',
        selling_price: 890000,
        purchase_price: 720000,
        stock: 135,
        alert_qty: 20,
      },
      {
        code: 'KAB-VVG-3X15',
        name: 'Kabel VVGng-LS 3x1.5mm mis (Andijon Kabel, 100m)',
        barcode: '4780012340251',
        catSlug: 'elektr-va-kabel',
        brandName: 'Andijon Kabel',
        unitShort: 'dona',
        selling_price: 580000,
        purchase_price: 460000,
        stock: 175,
        alert_qty: 25,
      },
      {
        code: 'AVT-CHINT-3P63',
        name: 'Avtomat oʻchirgich Chint 3P 63A 4.5kA',
        barcode: '4780012340268',
        catSlug: 'elektr-va-kabel',
        brandName: 'Chint Electric',
        unitShort: 'dona',
        selling_price: 145000,
        purchase_price: 110000,
        stock: 380,
        alert_qty: 40,
      },
      {
        code: 'LED-PANEL-6060',
        name: 'LED panel 60x60cm 48W 6500K (Artel Lighting)',
        barcode: '4780012340275',
        catSlug: 'elektr-va-kabel',
        brandName: 'Artel',
        unitShort: 'dona',
        selling_price: 125000,
        purchase_price: 92000,
        stock: 640,
        alert_qty: 80,
      },

      // Yogʻoch va Tom yopish
      {
        code: 'TAXTA-QARAGAY-50',
        name: 'Taxta qora qaragʻay 50x150x6000mm (Rossiya)',
        barcode: '4780012340282',
        catSlug: 'yogoch-va-tom-yopish',
        brandName: 'Bekobod Metallurgiya',
        unitShort: 'dona',
        selling_price: 195000,
        purchase_price: 155000,
        stock: 420,
        alert_qty: 50,
      },
      {
        code: 'BRUS-100-6M',
        name: 'Brus yogʻoch 100x100x6000mm (Rossiya)',
        barcode: '4780012340299',
        catSlug: 'yogoch-va-tom-yopish',
        brandName: 'Bekobod Metallurgiya',
        unitShort: 'dona',
        selling_price: 260000,
        purchase_price: 210000,
        stock: 280,
        alert_qty: 30,
      },
      {
        code: 'PROFNASTIL-MP20',
        name: 'Profnastil MP-20 0.45mm RAL 8017 (6 metr)',
        barcode: '4780012340305',
        catSlug: 'yogoch-va-tom-yopish',
        brandName: 'Akfa',
        unitShort: 'dona',
        selling_price: 310000,
        purchase_price: 250000,
        stock: 450,
        alert_qty: 50,
      },

      // Boʻyoq va Pardozlash
      {
        code: 'BOYOQ-FASAD-20',
        name: 'Fasad akril boʻyogʻi Akfa Premium 20kg',
        barcode: '4780012340312',
        catSlug: 'boyoqlar-va-pardozlash',
        brandName: 'Akfa',
        unitShort: 'dona',
        selling_price: 340000,
        purchase_price: 265000,
        stock: 310,
        alert_qty: 35,
      },
      {
        code: 'TRAVERTIN-25KG',
        name: 'Travertin mineral qoplama 25kg (Klassik)',
        barcode: '4780012340329',
        catSlug: 'boyoqlar-va-pardozlash',
        brandName: 'Knauf',
        unitShort: 'qop',
        selling_price: 85000,
        purchase_price: 64000,
        stock: 580,
        alert_qty: 60,
      },
    ];

    // Find all users (tenants) to seed inventory for
    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      select: { id: true, email: true },
    });

    console.log(`Found ${users.length} active users for inventory mapping.`);

    let seededProductsCount = 0;
    let seededInventoryCount = 0;

    for (const p of productsCatalog) {
      const categoryId = categoryMap[p.catSlug] || null;
      const brandId = brandMap[p.brandName] || null;
      const unitId = unitMap[p.unitShort] || null;

      // Upsert Product
      const product = await prisma.product.upsert({
        where: { code: p.code },
        update: {
          name: p.name,
          barcode: p.barcode,
          selling_price: p.selling_price,
          purchase_price: p.purchase_price,
          stock: p.stock,
          alert_quantity: p.alert_qty,
          enable_inventory: true,
          status: true,
          valuationMethod: 'WAC',
          item_type: 'Product',
          categoryId,
          brandId,
          unitId,
        },
        create: {
          code: p.code,
          name: p.name,
          barcode: p.barcode,
          selling_price: p.selling_price,
          purchase_price: p.purchase_price,
          stock: p.stock,
          alert_quantity: p.alert_qty,
          enable_inventory: true,
          status: true,
          valuationMethod: 'WAC',
          item_type: 'Product',
          categoryId,
          brandId,
          unitId,
        },
      });

      seededProductsCount++;

      // Create or update Inventory record for each user/tenant so stock shows in Ombor
      for (const u of users) {
        const invKey = `inv-${product.id}-${u.id}`;
        await prisma.inventory.upsert({
          where: { id: invKey },
          update: {
            quantity: p.stock,
            quantityOnHand: p.stock,
            avgCost: p.purchase_price,
            isDeleted: false,
          },
          create: {
            id: invKey,
            productId: product.id,
            quantity: p.stock,
            quantityOnHand: p.stock,
            avgCost: p.purchase_price,
            userId: u.id,
            isDeleted: false,
          },
        });
        seededInventoryCount++;
      }
    }

    console.log(`✅ [seed] Successfully synchronized ${seededProductsCount} products and ${seededInventoryCount} warehouse inventory records.`);
  } catch (err) {
    console.warn('⚠️ [seed] seedRichProductsAndInventory warning (non-fatal):', err.message);
  }
}

module.exports = { seedRichProductsAndInventory };

if (require.main === module) {
  seedRichProductsAndInventory()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
}
