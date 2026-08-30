/**
 * seedRizobayStroyFullData.js
 *
 * Comprehensive seeder script for OOO "RIZOBAY STROY" (Construction materials & manufacturing).
 * Seeds real-world data across ALL modules in SAPAR ERP for client demonstration & parity.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getOrCreateBrand(brand_name) {
  const existing = await prisma.brand.findFirst({ where: { brand_name } });
  if (existing) return existing;
  return prisma.brand.create({ data: { brand_name, status: true } });
}

async function getOrCreateCategory(category_name, slug) {
  const existing = await prisma.category.findFirst({
    where: { OR: [{ category_name }, { slug }] }
  });
  if (existing) return existing;
  return prisma.category.create({ data: { category_name, slug, status: true } });
}

async function main() {
  console.log('🚀 Starting Rizobay Stroy Master Demo Data Seeding...');

  // 1. Locate all target user accounts (Doston, Admin, Buxgalter, etc.)
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

  if (users.length === 0) {
    console.log('No admin users found! Creating default Rizobay Stroy admin...');
    const newUser = await prisma.user.create({
      data: {
        id: '5b22e867-952d-4050-80f6-6dfcfd3923e7',
        firstName: 'Farhod',
        lastName: 'Rahimov',
        email: 'stroy@sapar.uz',
        phone: '+998901234567',
        password: '$2b$10$YourHashedPasswordHereOrPlainTextForDemo',
        user_type: 1
      }
    });
    users.push(newUser);
  }

  for (const user of users) {
    const userId = user.id;
    console.log(`\n📦 Seeding Rizobay Stroy data for user: ${user.email} (${userId})...`);

    // 2. Company Settings & Profile
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

    // 3. Tax Rates (QQS 12% standard)
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

    // 4. Units of Measure
    const unitTonna = await prisma.unit.upsert({
      where: { id: `unit-tn-${userId}` },
      update: {},
      create: { id: `unit-tn-${userId}`, unit_name: 'Tonna', short_name: 'tn', status: true }
    });
    const unitQop = await prisma.unit.upsert({
      where: { id: `unit-qop-${userId}` },
      update: {},
      create: { id: `unit-qop-${userId}`, unit_name: 'Qop (50kg)', short_name: 'qop', status: true }
    });
    const unitDona = await prisma.unit.upsert({
      where: { id: `unit-dona-${userId}` },
      update: {},
      create: { id: `unit-dona-${userId}`, unit_name: 'Dona', short_name: 'dona', status: true }
    });
    const unitM2 = await prisma.unit.upsert({
      where: { id: `unit-m2-${userId}` },
      update: {},
      create: { id: `unit-m2-${userId}`, unit_name: 'Kvadrat metr', short_name: 'm2', status: true }
    });

    // 5. Brands & Categories
    const brandOzmet = await getOrCreateBrand("O'zmetkombinat");
    const brandQizilqum = await getOrCreateBrand("Qizilqumsement");
    const brandKnauf = await getOrCreateBrand("Knauf");

    const catMetal = await getOrCreateCategory('Metall va Armatura', 'metall-va-armatura');
    const catSement = await getOrCreateCategory('Sement va Quruq qorishmalar', 'sement-va-quruq-qorishmalar');
    const catGips = await getOrCreateCategory('Gipsokarton va Profillar', 'gipsokarton-va-profillar');
    const catBlok = await getOrCreateCategory('Devor bloklari', 'devor-bloklari');

    // 7. Products Catalog (Construction Materials with 17-digit MXIK & Barcodes)
    const productList = [
      {
        code: `ARM-12-${userId}`,
        name: 'Armatura A500C d-12mm (Bekobod)',
        barcode: `4780012340012-${userId}`,
        selling_price: 9800000,
        purchase_price: 8500000,
        stock: 45,
        unitId: unitTonna.id,
        brandId: brandOzmet.id,
        categoryId: catMetal.id,
        description: 'Bekobod metallurgiya zavodi ishlab chiqargan A500C standartdagi armatura.'
      },
      {
        code: `ARM-14-${userId}`,
        name: 'Armatura A500C d-14mm (Bekobod)',
        barcode: `4780012340029-${userId}`,
        selling_price: 9950000,
        purchase_price: 8600000,
        stock: 32,
        unitId: unitTonna.id,
        brandId: brandOzmet.id,
        categoryId: catMetal.id,
        description: 'Bino poydevori va karkaslari uchun yuqori mustahkam armatura.'
      },
      {
        code: `SEM-M500-${userId}`,
        name: 'Sement M-500 D0 (Qizilqum 50kg)',
        barcode: `4780012340036-${userId}`,
        selling_price: 72000,
        purchase_price: 61000,
        stock: 1200,
        unitId: unitQop.id,
        brandId: brandQizilqum.id,
        categoryId: catSement.id,
        description: 'Qizilqumsement zavodi sifatli M-500 markali sement qopi.'
      },
      {
        code: `GK-125-${userId}`,
        name: 'Gipsokarton Knauf 12.5mm (Namlikka chidamli)',
        barcode: `4780012340043-${userId}`,
        selling_price: 84000,
        purchase_price: 71000,
        stock: 650,
        unitId: unitDona.id,
        brandId: brandKnauf.id,
        categoryId: catGips.id,
        description: 'Yashil rangli namlikka chidamli Knauf gipsokarton listi 1.2x2.5m.'
      },
      {
        code: `PROF-6027-${userId}`,
        name: 'Profil galvanizatsiyalangan 60x27mm (3m)',
        barcode: `4780012340050-${userId}`,
        selling_price: 24500,
        purchase_price: 19500,
        stock: 2400,
        unitId: unitDona.id,
        brandId: brandKnauf.id,
        categoryId: catGips.id,
        description: 'Shift va devor montaji uchun ruxlangan metall profil.'
      },
      {
        code: `BLK-PENO600-${userId}`,
        name: 'Penoblok D-600 (600x300x200mm)',
        barcode: `4780012340067-${userId}`,
        selling_price: 18500,
        purchase_price: 14800,
        stock: 3500,
        unitId: unitDona.id,
        categoryId: catBlok.id,
        description: 'Issiqlik saqlovchi yengil devor penobloki.'
      },
      {
        code: `BLK-SHLAK-${userId}`,
        name: 'Shlakoblok (20x20x40cm standart)',
        barcode: `4780012340074-${userId}`,
        selling_price: 7800,
        purchase_price: 6100,
        stock: 5000,
        unitId: unitDona.id,
        categoryId: catBlok.id,
        description: 'Mustahkam devor qurish uchun tebranish usulida zichlangan shlakoblok.'
      },
      {
        code: `ROTBAND-30-${userId}`,
        name: 'Shpatlyovka Rotband Knauf 30kg',
        barcode: `4780012340081-${userId}`,
        selling_price: 98000,
        purchase_price: 82000,
        stock: 420,
        unitId: unitQop.id,
        brandId: brandKnauf.id,
        categoryId: catSement.id,
        description: 'Gips asosidagi yuqori yopishqoq universal suvoq qorishmasi.'
      }
    ];

    for (const p of productList) {
      await prisma.product.upsert({
        where: { code: p.code },
        update: {
          name: p.name,
          selling_price: p.selling_price,
          purchase_price: p.purchase_price,
          stock: p.stock,
          taxRateId: taxRate12.id,
          unitId: p.unitId,
          categoryId: p.categoryId,
          brandId: p.brandId,
          description: p.description
        },
        create: {
          code: p.code,
          name: p.name,
          item_type: 'Product',
          barcode: p.barcode,
          selling_price: p.selling_price,
          purchase_price: p.purchase_price,
          stock: p.stock,
          enable_inventory: true,
          taxRateId: taxRate12.id,
          unitId: p.unitId,
          categoryId: p.categoryId,
          brandId: p.brandId,
          description: p.description
        }
      });
    }

    // 8. CRM Contacts (Customers / Debtors & Vendors / Creditors)
    const contactsData = [
      {
        name: 'OOO "TOSHKENT CITY BUILD"',
        type: 'CUSTOMER',
        taxId: '308129481',
        phone: '+998712001122',
        email: 'tashkentcity@build.uz',
        address: 'Toshkent sh., Shayxontohur tumani, Navoiy koʻchasi 1A',
        notes: 'Yirik developer korxona. Yangi turar-joy majmuasi uchun muntazam armatura xaridori.'
      },
      {
        name: 'MChJ "GOLDEN HOUSE LOGISTICS"',
        type: 'CUSTOMER',
        taxId: '307281944',
        phone: '+998712003344',
        email: 'logistics@goldenhouse.uz',
        address: 'Toshkent sh., Mirzo Ulugʻbek tumani, Mustaqillik shoh koʻchasi 59',
        notes: 'Gipsokarton va pardozlash materiallari xaridori.'
      },
      {
        name: 'OOO "SAMARQAND MODERN STROY"',
        type: 'CUSTOMER',
        taxId: '305918273',
        phone: '+998662304455',
        email: 'samarkand@modernstroy.uz',
        address: 'Samarqand sh., Registon koʻchasi 14',
        notes: 'Samarqand viloyati boʻyicha distribyutor hamkor.'
      },
      {
        name: 'YaTT Alimov Sardor',
        type: 'CUSTOMER',
        taxId: '31804921004918',
        phone: '+998901112233',
        email: 'alimov.sardor@mail.uz',
        address: 'Toshkent sh., Sergeli tumani, Yangi Choshtepa',
        notes: 'Chakana savdo doʻkoni egasi.'
      },
      {
        name: 'AJ "O\'ZMETHOLDING"',
        type: 'VENDOR',
        taxId: '200129481',
        phone: '+998712009988',
        email: 'sales@uzmetkombinat.uz',
        address: 'Toshkent viloyati, Bekobod shahri, Sanoat hududi',
        notes: 'Asosiy metall va armatura yetkazib beruvchi zavod.'
      },
      {
        name: 'AJ "QIZILQUMSEMENT"',
        type: 'VENDOR',
        taxId: '201847192',
        phone: '+998792201100',
        email: 'sbyt@qizilqumsement.uz',
        address: 'Navoiy viloyati, Navoiy shahri',
        notes: 'M-500 markali sement ishlab chiqaruvchi bosh korxona.'
      },
      {
        name: 'OOO "KNAUF GIPS BUXORO"',
        type: 'VENDOR',
        taxId: '301928471',
        phone: '+998652204488',
        email: 'bukhara@knauf.uz',
        address: 'Buxoro viloyati, Kogon tumani',
        notes: 'Gipsokarton va Rotband quruq qorishmalari ishlab chiqaruvchisi.'
      }
    ];

    for (const c of contactsData) {
      await prisma.contact.upsert({
        where: { id: `contact-${c.taxId}-${userId}` },
        update: {
          organisation: c.name,
          telephone: c.phone,
          billingEmail: c.email,
          addressLine1: c.address,
          vatNumber: c.taxId,
          notes: c.notes
        },
        create: {
          id: `contact-${c.taxId}-${userId}`,
          userId,
          organisation: c.name,
          telephone: c.phone,
          billingEmail: c.email,
          addressLine1: c.address,
          vatNumber: c.taxId,
          notes: c.notes
        }
      });

      // Also ensure customer directory has them
      await prisma.customer.upsert({
        where: { id: `cust-${c.taxId}-${userId}` },
        update: { name: c.name, email: c.email, phone: c.phone },
        create: {
          id: `cust-${c.taxId}-${userId}`,
          userId,
          name: c.name,
          email: c.email,
          phone: c.phone,
          notes: c.notes,
          status: 'Active'
        }
      });
    }

    // 9. Banking & Petty Cash Accounts
    const existingBank1 = await prisma.bankDetail.findFirst({ where: { userId, bankName: "Ipak Yo'li Banki (Sergeli filiali)" } });
    if (existingBank1) {
      await prisma.bankDetail.update({ where: { id: existingBank1.id }, data: { currentBalance: 385400000 } });
    } else {
      await prisma.bankDetail.create({
        data: {
          id: `bank-ipak-${userId}`,
          userId,
          bankName: "Ipak Yo'li Banki (Sergeli filiali)",
          accountHoldername: 'OOO "RIZOBAY STROY"',
          accountNumber: `20208000900123456001-${userId.slice(0, 4)}`,
          branchName: 'Sergeli filiali',
          IFSCCode: '00444',
          accountType: 'current',
          openingBalance: 385400000,
          currentBalance: 385400000,
          currencyCode: 'UZS',
          status: true
        }
      });
    }

    const existingBank2 = await prisma.bankDetail.findFirst({ where: { userId, bankName: 'Kapitalbank (Yunusobod filiali)' } });
    if (existingBank2) {
      await prisma.bankDetail.update({ where: { id: existingBank2.id }, data: { currentBalance: 124000000 } });
    } else {
      await prisma.bankDetail.create({
        data: {
          id: `bank-kapital-${userId}`,
          userId,
          bankName: 'Kapitalbank (Yunusobod filiali)',
          accountHoldername: 'OOO "RIZOBAY STROY"',
          accountNumber: `20208000400987654001-${userId.slice(0, 4)}`,
          branchName: 'Yunusobod filiali',
          IFSCCode: '00973',
          accountType: 'current',
          openingBalance: 124000000,
          currentBalance: 124000000,
          currencyCode: 'UZS',
          status: true
        }
      });
    }

    const existingPetty = await prisma.pettyCash.findFirst({ where: { userId } });
    if (existingPetty) {
      await prisma.pettyCash.update({ where: { id: existingPetty.id }, data: { currentBalance: 48500000 } });
    } else {
      await prisma.pettyCash.create({
        data: {
          id: `petty-cash-${userId}`,
          userId,
          openingBalance: 48500000,
          currentBalance: 48500000
        }
      });
    }

    // 10. CRM Deals Pipeline
    const dealsData = [
      {
        id: `deal-01-${userId}`,
        title: "Yangi O'zbekiston Massividagi 9-qavatli turar-joyga armatura yetkazish",
        customerName: 'OOO "TOSHKENT CITY BUILD"',
        value: 450000000,
        currency: 'UZS',
        stage: 'WON',
        probability: 100,
        assignedToName: 'Farhod Rahimov',
        phone: '+998712001122',
        notes: 'Shartnoma toʻliq imzolandi va birinchi 50% avans bank orqali qabul qilindi.'
      },
      {
        id: `deal-02-${userId}`,
        title: 'Toshkent City Mall 2-navbat qurilish mollariga shartnoma',
        customerName: 'MChJ "GOLDEN HOUSE LOGISTICS"',
        value: 180000000,
        currency: 'UZS',
        stage: 'PROPOSAL',
        probability: 60,
        assignedToName: 'Shokirjon Qodirov',
        phone: '+998712003344',
        notes: 'Tijorat taklifi yuborildi, narxlar va yetkazib berish jadvali kelishilmoqda.'
      },
      {
        id: `deal-03-${userId}`,
        title: "Samarqand Turizm Markazi ta'mir ishlari uchun gipsokarton",
        customerName: 'OOO "SAMARQAND MODERN STROY"',
        value: 95000000,
        currency: 'UZS',
        stage: 'NEGOTIATION',
        probability: 75,
        assignedToName: 'Farhod Rahimov',
        phone: '+998662304455',
        notes: 'Shartnoma loyihasi E-IMZO orqali tasdiqlash uchun yuborilgan.'
      }
    ];

    for (const d of dealsData) {
      await prisma.crmDeal.upsert({
        where: { id: d.id },
        update: {
          title: d.title,
          value: d.value,
          stage: d.stage,
          probability: d.probability,
          notes: d.notes
        },
        create: {
          id: d.id,
          userId,
          title: d.title,
          customerName: d.customerName,
          value: d.value,
          currency: d.currency,
          stage: d.stage,
          probability: d.probability,
          assignedToName: d.assignedToName,
          phone: d.phone,
          notes: d.notes
        }
      });
    }

    // 11. Support & Helpdesk Tickets
    const ticketData = [
      {
        id: `ticket-01-${userId}`,
        ticketNumber: 'TK-2026-001',
        subject: "Bekobod armaturasi bo'yicha muvofiqlik sertifikati nusxasi so'rovi",
        customerName: 'OOO "TOSHKENT CITY BUILD"',
        customerEmail: 'tashkentcity@build.uz',
        customerPhone: '+998712001122',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        slaHours: 4,
        assignedAgentName: 'Shokirjon Qodirov',
        messages: [
          {
            id: `msg-01-${userId}`,
            senderName: 'Aziz Rahimov (Toshkent City)',
            senderRole: 'CUSTOMER',
            message: 'Assalomu alaykum! Kecha yetkazib berilgan A500C d-12mm armaturaning GOST davlat sinov bayonnomasi va sifat sertifikatini yubora olasizmi?',
            createdAt: new Date(Date.now() - 3600000)
          },
          {
            id: `msg-02-${userId}`,
            senderName: 'Shokirjon Qodirov',
            senderRole: 'AGENT',
            message: 'Vaalaykum assalom! Albatta, sertifikat skaneri biriktirildi. E-Hujjatlar boʻlimida ham mavjud.',
            createdAt: new Date(Date.now() - 1800000)
          }
        ]
      }
    ];

    for (const t of ticketData) {
      await prisma.supportTicket.upsert({
        where: { id: t.id },
        update: { status: t.status, priority: t.priority },
        create: {
          id: t.id,
          userId,
          ticketNumber: t.ticketNumber,
          subject: t.subject,
          customerName: t.customerName,
          customerEmail: t.customerEmail,
          customerPhone: t.customerPhone,
          priority: t.priority,
          status: t.status,
          slaHours: t.slaHours,
          assignedAgentName: t.assignedAgentName,
          messages: {
            create: t.messages
          }
        }
      });
    }

    // 12. Project Management Tasks
    const projectTasks = [
      {
        id: `task-01-${userId}`,
        projectId: 'p-1001',
        title: 'Sergeli omborida 50 tonna armaturani qabul qilish va kran bilan taxlash',
        description: 'Bekoboddan kelgan 3 ta Fura yuk mashinasidan A500C d-12 va d-14 armaturalarini xavfsiz tushirish.',
        stage: 'DONE',
        priority: 'HIGH',
        assignedToName: 'Dilshod Karimov (Bosh Ombordor)',
        estimatedHours: 6,
        actualHours: 5,
        dueDate: new Date('2026-08-30T18:00:00.000Z')
      },
      {
        id: `task-02-${userId}`,
        projectId: 'p-1001',
        title: 'Sement M-500 uchun namlikdan himoyalangan yogʻoch poddonlar tayyorlash',
        description: '1000 qop sementni yomgʻirdan himoya qilish uchun yopiq angarga joylash.',
        stage: 'IN_PROGRESS',
        priority: 'MEDIUM',
        assignedToName: 'Dilshod Karimov',
        estimatedHours: 4,
        actualHours: 2,
        dueDate: new Date('2026-08-31T18:00:00.000Z')
      },
      {
        id: `task-03-${userId}`,
        projectId: 'p-1001',
        title: 'Didox.uz orqali avgust oyi hisob-fakturalarini E-IMZO bilan ommaviy imzolash',
        description: 'Davlat soliq qoʻmitasiga 10006_29 QQS hisobotini topshirishdan oldin barcha chiquvchi fakturalarni tasdiqlash.',
        stage: 'TODO',
        priority: 'URGENT',
        assignedToName: 'Shokirjon Qodirov (Bosh Buxgalter)',
        estimatedHours: 2,
        actualHours: 0,
        dueDate: new Date('2026-09-01T18:00:00.000Z')
      }
    ];

    for (const task of projectTasks) {
      await prisma.projectTask.upsert({
        where: { id: task.id },
        update: { stage: task.stage, priority: task.priority },
        create: {
          id: task.id,
          userId,
          projectId: task.projectId,
          title: task.title,
          description: task.description,
          stage: task.stage,
          priority: task.priority,
          assignedToName: task.assignedToName,
          estimatedHours: task.estimatedHours,
          actualHours: task.actualHours,
          dueDate: task.dueDate
        }
      });
    }

    // 13. Electronic Documents (E-Hujjatlar with E-IMZO Hashes)
    await prisma.eDocument.upsert({
      where: { id: `edoc-01-${userId}` },
      update: { status: 'FULLY_SIGNED' },
      create: {
        id: `edoc-01-${userId}`,
        userId,
        docType: 'CONTRACT',
        docNumber: 'RS-2026/08',
        docDate: new Date('2026-08-15T10:00:00.000Z'),
        title: 'Qurilish mollarini muntazam yetkazib berish boʻyicha Bosh shartnoma',
        status: 'FULLY_SIGNED',
        direction: 'OUTBOUND',
        sellerName: 'OOO "RIZOBAY STROY"',
        sellerTin: '309124856',
        sellerAddress: "Toshkent shahri, Sergeli tumani, Yangi Sergeli 45",
        sellerDirector: 'Farhod Rahimov',
        buyerName: 'OOO "TOSHKENT CITY BUILD"',
        buyerTin: '308129481',
        buyerAddress: "Toshkent sh., Shayxontohur tumani, Navoiy 1A",
        buyerDirector: 'Aziz Rahimov',
        totalSum: 450000000,
        vatTotal: 48214285,
        currency: 'UZS',
        canonicalHash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
        publicSignToken: `token-contract-01-${userId}`
      }
    });

    console.log(`✅ Finished seeding all modules for user: ${user.email}`);
  }

  console.log('\n🎉 ALL RIZOBAY STROY DEMO DATA SEEDED SUCCESSFULLY INTO POSTGRESQL!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
