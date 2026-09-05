/**
 * demoSeederController.js
 * On-demand demo data seeder for Rizobay Stroy & Uzbekistan B2B operations
 * Seeds 30+ products, inventory stock, and business contacts for the current user/tenant.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { seedRichProductsAndInventory } = require('../prisma/seedRichProductsAndInventory');

const seedCurrentUserData = async (req, res) => {
  try {
    const userId = typeof req.user === 'string'
      ? req.user
      : (req.user?.id || req.user?.userId || req.tenantId);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Foydalanuvchi aniqlanmadi' });
    }

    console.log(`🚀 On-demand Seeding Demo Data for User: ${userId}...`);

    // 1. Synchronize the master catalog of 31 Uzbekistan B2B products & inventory across all users
    await seedRichProductsAndInventory();

    // 2. Company Settings for this user
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
        functionalCurrency: 'UZS',
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
        functionalCurrency: 'UZS',
      },
    });

    // 3. Tax Rate 12%
    await prisma.taxRate.upsert({
      where: { id: `tax-qqs12-${userId}` },
      update: {
        name: 'QQS 12% (Standart stavka)',
        rate: 12.0,
        regime: 'NONE',
        isActive: true,
      },
      create: {
        id: `tax-qqs12-${userId}`,
        name: 'QQS 12% (Standart stavka)',
        rate: 12.0,
        regime: 'NONE',
        isActive: true,
        userId,
      },
    });

    // 4. Ensure all products in the database have an active Inventory record for this specific user
    const allProducts = await prisma.product.findMany({
      where: { status: true },
      select: { id: true, stock: true, purchase_price: true },
    });

    for (const p of allProducts) {
      const invKey = `inv-${p.id}-${userId}`;
      const qty = p.stock && p.stock > 0 ? p.stock : 500;
      await prisma.inventory.upsert({
        where: { id: invKey },
        update: {
          quantity: qty,
          quantityOnHand: qty,
          avgCost: p.purchase_price,
          isDeleted: false,
        },
        create: {
          id: invKey,
          productId: p.id,
          quantity: qty,
          quantityOnHand: qty,
          avgCost: p.purchase_price,
          userId,
          isDeleted: false,
        },
      });
    }

    // 5. Uzbekistan B2B Customers & Suppliers
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
        balance: 145000000,
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
        balance: 86400000,
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
        balance: -68000000,
      },
      {
        id: `supp-bekobod-${userId}`,
        name: 'AJ "OʻZMETKOMBINAT" (BEKOBOD)',
        taxId: '200112345',
        type: 'supplier',
        email: 'sotuv@uzbeksteel.uz',
        phone: '+998679192000',
        address: "Sirdaryo vil., Bekobod sh., Sanoat koʻchasi 1",
        currency: 'UZS',
        balance: -125000000,
      },
    ];

    for (const c of contacts) {
      await prisma.contact.upsert({
        where: { id: c.id },
        update: {
          organisation: c.name,
          vatNumber: c.taxId,
          vatRegNumber: c.taxId,
          email: c.email,
          telephone: c.phone,
          mobile: c.phone,
          addressLine1: c.address,
          currencyCode: c.currency,
          status: 'ACTIVE',
          isDeleted: false,
        },
        create: {
          id: c.id,
          organisation: c.name,
          vatNumber: c.taxId,
          vatRegNumber: c.taxId,
          email: c.email,
          telephone: c.phone,
          mobile: c.phone,
          addressLine1: c.address,
          currencyCode: c.currency,
          status: 'ACTIVE',
          userId,
          isDeleted: false,
        },
      });
    }

    console.log(`✅ Completed demo seeding for user: ${userId}`);
    return res.status(200).json({
      success: true,
      message: "Oʻzbekiston biznes test maʼlumotlari (Rizobay Stroy mahsulotlari va ombor zaxirasi) muvaffaqiyatli yuklandi!",
      data: {
        productsCount: allProducts.length,
        contactsCount: contacts.length,
      },
    });
  } catch (error) {
    console.error('Error seeding demo data:', error);
    return res.status(500).json({
      success: false,
      message: "Test ma'lumotlarini yuklashda xatolik: " + error.message,
    });
  }
};

module.exports = { seedCurrentUserData };
