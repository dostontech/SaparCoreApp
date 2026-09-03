/**
 * demoSeederController.js
 * On-demand demo data seeder for Rizobay Stroy (construction materials) 
 * Seeds products, inventory, customers for the current logged-in user/tenant.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const seedCurrentUserData = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Foydalanuvchi aniqlanmadi' });
    }

    console.log(`🚀 On-demand Seeding Demo Data for User: ${userId}...`);

    // 1. Company Settings
    await prisma.companySettings.upsert({
      where: { userId },
      update: {
        companyName: 'OOO "RIZOBAY STROY"',
        email: 'info@rizobaystroy.uz',
        phone: '+998712008899',
        address: "Yangi Sergeli ko'chasi 45-uy",
        city: 'Toshkent shahri',
        state: 'Sergeli tumani',
        country: "O'zbekiston",
        pincode: '100154',
        functionalCurrency: 'UZS'
      },
      create: {
        userId,
        companyName: 'OOO "RIZOBAY STROY"',
        email: 'info@rizobaystroy.uz',
        phone: '+998712008899',
        address: "Yangi Sergeli ko'chasi 45-uy",
        city: 'Toshkent shahri',
        state: 'Sergeli tumani',
        country: "O'zbekiston",
        pincode: '100154',
        functionalCurrency: 'UZS'
      }
    });

    // 2. Tax Rate 12%
    const taxRate12 = await prisma.taxRate.upsert({
      where: { id: `tax-qqs12-${userId}` },
      update: {},
      create: {
        id: `tax-qqs12-${userId}`,
        name: 'QQS 12% (Standart stavka)',
        rate: 12.0,
        regime: 'NONE',
        isActive: true,
        userId
      }
    });

    // 3. Units
    const unitsData = [
      { id: `unit-tn-${userId}`, name: 'Tonna', short: 'tn' },
      { id: `unit-qop-${userId}`, name: 'Qop (50kg)', short: 'qop' },
      { id: `unit-dona-${userId}`, name: 'Dona', short: 'dona' },
      { id: `unit-m2-${userId}`, name: 'Kvadrat metr', short: 'm2' },
      { id: `unit-m3-${userId}`, name: 'Kub metr', short: 'm3' },
      { id: `unit-metr-${userId}`, name: 'Metr', short: 'm' },
    ];

    const createdUnits = {};
    for (const u of unitsData) {
      createdUnits[u.short] = await prisma.unit.upsert({
        where: { id: u.id },
        update: {},
        create: { id: u.id, unit_name: u.name, short_name: u.short, status: true }
      });
    }

    // 4. Brands
    const brandsData = ['Knauf', 'Bekobod Metall', 'Ohangaron Sement', 'Qizilqumsement', "O'zmetkombinat", 'Akfa'];
    const createdBrands = {};
    for (const b of brandsData) {
      let existing = await prisma.brand.findFirst({ where: { brand_name: b } });
      if (!existing) {
        existing = await prisma.brand.create({ data: { brand_name: b, status: true } });
      }
      createdBrands[b] = existing;
    }

    // 5. Categories
    const categoriesData = [
      { name: 'Devor bloklari', slug: `devor-bloklari-${userId}` },
      { name: 'Sement va Quruq qorishmalar', slug: `sement-qorishmalar-${userId}` },
      { name: 'Gipsokarton va Profillar', slug: `gipsokarton-${userId}` },
      { name: 'Metall va Armatura', slug: `metall-armatura-${userId}` },
      { name: 'Santexnika va Quvurlar', slug: `santexnika-${userId}` },
    ];

    const createdCategories = {};
    for (const c of categoriesData) {
      let existing = await prisma.category.findFirst({
        where: { OR: [{ category_name: c.name }, { slug: c.slug }] }
      });
      if (!existing) {
        existing = await prisma.category.create({ data: { category_name: c.name, slug: c.slug, status: true } });
      }
      createdCategories[c.name] = existing;
    }

    // 6. Warehouses
    const whSergeli = await prisma.warehouse.upsert({
      where: { id: `wh-sergeli-${userId}` },
      update: {},
      create: {
        id: `wh-sergeli-${userId}`,
        name: 'Bosh Ombor (Sergeli)',
        code: 'WH-SERGELI-01',
        address: "Toshkent sh., Sergeli tumani, Sanoat zonasi 12",
        isDefault: true,
        userId
      }
    });

    await prisma.warehouse.upsert({
      where: { id: `wh-chilonzor-${userId}` },
      update: {},
      create: {
        id: `wh-chilonzor-${userId}`,
        name: 'Chilonzor Showroom & Ombor',
        code: 'WH-CHIL-02',
        address: "Toshkent sh., Chilonzor 19-mavze, 4A",
        isDefault: false,
        userId
      }
    });

    // 7. Products with Inventory
    const demoProducts = [
      {
        id: `prod-gazoblok-${userId}`,
        name: 'Gazoblok D-500 (600x300x200mm)',
        sku: 'BLK-GAZO500',
        barcode: '4780012340015',
        brandKey: 'Bekobod Metall',
        categoryKey: 'Devor bloklari',
        unitKey: 'dona',
        sellingPrice: 18500,
        purchasePrice: 14200,
        initialQty: 4500,
        minQty: 500,
      },
      {
        id: `prod-shlakoblok-${userId}`,
        name: 'Shlakoblok (20x20x40cm standart)',
        sku: 'BLK-SHLAK',
        barcode: '4780012340039',
        brandKey: 'Bekobod Metall',
        categoryKey: 'Devor bloklari',
        unitKey: 'dona',
        sellingPrice: 7800,
        purchasePrice: 5200,
        initialQty: 5000,
        minQty: 1000,
      },
      {
        id: `prod-penoblok-${userId}`,
        name: 'Penoblok D-600 (600x300x200mm)',
        sku: 'BLK-PENO600',
        barcode: '4780012340022',
        brandKey: 'Bekobod Metall',
        categoryKey: 'Devor bloklari',
        unitKey: 'dona',
        sellingPrice: 18500,
        purchasePrice: 13900,
        initialQty: 3500,
        minQty: 300,
      },
      {
        id: `prod-sement-m500-${userId}`,
        name: 'Sement M-500 D0 (Qizilqum 50kg)',
        sku: 'SEM-M500',
        barcode: '4780012340046',
        brandKey: 'Qizilqumsement',
        categoryKey: 'Sement va Quruq qorishmalar',
        unitKey: 'qop',
        sellingPrice: 68000,
        purchasePrice: 54000,
        initialQty: 1200,
        minQty: 200,
      },
      {
        id: `prod-rotband-${userId}`,
        name: 'Shpatlyovka Rotband Knauf 30kg',
        sku: 'ROTBAND-30',
        barcode: '4780012340053',
        brandKey: 'Knauf',
        categoryKey: 'Sement va Quruq qorishmalar',
        unitKey: 'qop',
        sellingPrice: 98000,
        purchasePrice: 78000,
        initialQty: 420,
        minQty: 50,
      },
      {
        id: `prod-gipsokarton-${userId}`,
        name: 'Gipsokarton Knauf 12.5mm (Namlikka chidamli)',
        sku: 'GK-125',
        barcode: '4780012340060',
        brandKey: 'Knauf',
        categoryKey: 'Gipsokarton va Profillar',
        unitKey: 'dona',
        sellingPrice: 84000,
        purchasePrice: 65000,
        initialQty: 650,
        minQty: 100,
      },
      {
        id: `prod-armatura12-${userId}`,
        name: "Armatura 12mm A500C (O'zmetkombinat)",
        sku: 'ARM-12MM',
        barcode: '4780012340077',
        brandKey: "O'zmetkombinat",
        categoryKey: 'Metall va Armatura',
        unitKey: 'tn',
        sellingPrice: 9800000,
        purchasePrice: 8500000,
        initialQty: 42,
        minQty: 5,
      },
      {
        id: `prod-quvur50-${userId}`,
        name: 'Santexnika Quvuri PPR d-50mm (4m)',
        sku: 'PPR-50-4M',
        barcode: '4780012340084',
        brandKey: 'Akfa',
        categoryKey: 'Santexnika va Quvurlar',
        unitKey: 'dona',
        sellingPrice: 52000,
        purchasePrice: 38000,
        initialQty: 850,
        minQty: 150,
      }
    ];

    for (const p of demoProducts) {
      const brandId = createdBrands[p.brandKey]?.id;
      const categoryId = createdCategories[p.categoryKey]?.id;
      const unitId = createdUnits[p.unitKey]?.id;

      const product = await prisma.product.upsert({
        where: { id: p.id },
        update: {
          product_name: p.name,
          selling_price: p.sellingPrice,
          purchase_price: p.purchasePrice,
          brand_id: brandId,
          category_id: categoryId,
          units_id: unitId,
          taxRateId: taxRate12.id,
          tax_rate: 12.0,
          track_inventory: true,
          status: true,
          initial_stock_quantity: p.initialQty,
          minimum_stock_level: p.minQty,
        },
        create: {
          id: p.id,
          product_name: p.name,
          product_code: p.sku,
          barcode_symbology: p.barcode,
          selling_price: p.sellingPrice,
          purchase_price: p.purchasePrice,
          brand_id: brandId,
          category_id: categoryId,
          units_id: unitId,
          taxRateId: taxRate12.id,
          tax_rate: 12.0,
          track_inventory: true,
          status: true,
          initial_stock_quantity: p.initialQty,
          minimum_stock_level: p.minQty,
          user_id: userId,
        }
      });

      // Upsert inventory record
      await prisma.inventory.upsert({
        where: { id: `inv-${p.id}` },
        update: {
          quantity: p.initialQty,
          selling_price: p.sellingPrice,
          purchase_price: p.purchasePrice,
        },
        create: {
          id: `inv-${p.id}`,
          productId: product.id,
          warehouseId: whSergeli.id,
          quantity: p.initialQty,
          selling_price: p.sellingPrice,
          purchase_price: p.purchasePrice,
          user_id: userId,
        }
      });
    }

    // 8. Customers & Suppliers
    const contacts = [
      {
        id: `cust-enter-${userId}`,
        name: 'OOO "ENTER ENGINEERING"',
        taxId: '305987654',
        type: 'client',
        email: 'procurement@enter-eng.uz',
        phone: '+998712030000',
        address: "Toshkent sh., Mirobod tumani, Nukus ko'chasi 29",
        currency: 'UZS',
        balance: 145000000
      },
      {
        id: `cust-discover-${userId}`,
        name: 'OOO "DISCOVER INVEST"',
        taxId: '304876543',
        type: 'client',
        email: 'sales@discoverinvest.uz',
        phone: '+998712880000',
        address: "Toshkent sh., Yakkasaroy tumani, Shota Rustaveli 120",
        currency: 'UZS',
        balance: 86400000
      },
      {
        id: `supp-knauf-${userId}`,
        name: 'IP OOO "KNAUF GIPS BUKHARA"',
        taxId: '202112233',
        type: 'supplier',
        email: 'order@knauf.uz',
        phone: '+998652250000',
        address: "Buxoro viloyati, Kogon tumani",
        currency: 'UZS',
        balance: -68000000
      }
    ];

    for (const c of contacts) {
      await prisma.contact.upsert({
        where: { id: c.id },
        update: {
          name: c.name,
          company_name: c.name,
          tax_number: c.taxId,
          type: c.type,
          email: c.email,
          phone: c.phone,
          address_line1: c.address,
          currency: c.currency,
          balance: c.balance,
        },
        create: {
          id: c.id,
          name: c.name,
          company_name: c.name,
          tax_number: c.taxId,
          type: c.type,
          email: c.email,
          phone: c.phone,
          address_line1: c.address,
          currency: c.currency,
          balance: c.balance,
          userId,
        }
      });
    }

    console.log(`✅ Completed demo seeding for user: ${userId}`);
    return res.json({
      success: true,
      message: "Test ma'lumotlari (Rizobay Stroy) muvaffaqiyatli yuklandi!",
      data: {
        productsCount: demoProducts.length,
        unitsCount: unitsData.length,
        brandsCount: brandsData.length,
        categoriesCount: categoriesData.length,
        contactsCount: contacts.length
      }
    });
  } catch (error) {
    console.error('Error seeding demo data:', error);
    return res.status(500).json({ success: false, message: "Test ma'lumotlarini yuklashda xatolik: " + error.message });
  }
};

module.exports = { seedCurrentUserData };
