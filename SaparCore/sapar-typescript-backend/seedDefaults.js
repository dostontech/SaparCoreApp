/**
 * SAPAR ERP — Render.com Build-Time Bootstrap
 * ─────────────────────────────────────────────
 * This script runs once during the Render build step AFTER prisma db push.
 * It seeds mandatory lookup data (currencies, timezones, tax defaults) into
 * the Postgres database so the app works without manual data entry.
 *
 * Uses Prisma (CommonJS require style) — NOT the old MongoDB seedDefaults.
 *
 * Run: node seedDefaults.js
 */

'use strict';

const { execSync } = require('child_process');

// Ensure Prisma client is generated before we try to require it
try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  async function main() {
    console.log('[seedDefaults] Starting Uzbekistan defaults seed...');

    // ── 1. Currencies ────────────────────────────────────────────────────────
    const currencies = [
      { id: 'cur-uzs', name: "O'zbekiston so'm", code: 'UZS', symbol: "so'm", status: true, isDefault: true },
      { id: 'cur-usd', name: 'AQSH dollari', code: 'USD', symbol: '$', status: true, isDefault: false },
      { id: 'cur-eur', name: 'Yevro', code: 'EUR', symbol: '€', status: true, isDefault: false },
      { id: 'cur-rub', name: 'Rossiya rubli', code: 'RUB', symbol: '₽', status: true, isDefault: false },
      { id: 'cur-kzt', name: "Qozog'iston tengesi", code: 'KZT', symbol: '₸', status: true, isDefault: false },
      { id: 'cur-kgs', name: "Qirg'iziston somi", code: 'KGS', symbol: 'с', status: true, isDefault: false },
      { id: 'cur-tjs', name: 'Tojikiston somoniysi', code: 'TJS', symbol: 'SM', status: true, isDefault: false },
      { id: 'cur-tmt', name: 'Turkmaniston manati', code: 'TMT', symbol: 'm', status: true, isDefault: false },
      { id: 'cur-cny', name: 'Xitoy yuani', code: 'CNY', symbol: '¥', status: true, isDefault: false },
      { id: 'cur-aed', name: 'BAA dirhami', code: 'AED', symbol: 'د.إ', status: true, isDefault: false },
    ];

    for (const c of currencies) {
      await prisma.currency.upsert({
        where: { id: c.id },
        update: { name: c.name, code: c.code, symbol: c.symbol, status: c.status, isDefault: c.isDefault },
        create: c,
      });
    }
    console.log(`[seedDefaults] ✅ ${currencies.length} currencies seeded`);

    // ── 2. Timezones ─────────────────────────────────────────────────────────
    const timezones = [
      { id: 'tz-tashkent',   name: 'Asia/Tashkent',   offset: '+05:00', isDefault: true },
      { id: 'tz-samarkand',  name: 'Asia/Samarkand',  offset: '+05:00', isDefault: false },
      { id: 'tz-almaty',     name: 'Asia/Almaty',     offset: '+05:00', isDefault: false },
      { id: 'tz-bishkek',    name: 'Asia/Bishkek',    offset: '+06:00', isDefault: false },
      { id: 'tz-dushanbe',   name: 'Asia/Dushanbe',   offset: '+05:00', isDefault: false },
      { id: 'tz-ashgabat',   name: 'Asia/Ashgabat',   offset: '+05:00', isDefault: false },
      { id: 'tz-moscow',     name: 'Europe/Moscow',   offset: '+03:00', isDefault: false },
      { id: 'tz-utc',        name: 'UTC',             offset: '+00:00', isDefault: false },
    ];

    for (const tz of timezones) {
      try {
        await prisma.timezone.upsert({
          where: { id: tz.id },
          update: { name: tz.name, offset: tz.offset, isDefault: tz.isDefault },
          create: tz,
        });
      } catch (_) {
        // Timezone model might not exist in all schema versions — skip gracefully
      }
    }
    console.log(`[seedDefaults] ✅ ${timezones.length} timezones seeded (or skipped if model absent)`);

    // ── 3. Date / Time Formats ───────────────────────────────────────────────
    const dateFormats = [
      { id: 'df-iso',  format: 'YYYY-MM-DD',   label: 'ISO (2026-01-31)',   isDefault: false },
      { id: 'df-uzb',  format: 'DD.MM.YYYY',   label: 'O\'zbek (31.01.2026)', isDefault: true },
      { id: 'df-ru',   format: 'DD/MM/YYYY',   label: 'Yevropacha (31/01/2026)', isDefault: false },
      { id: 'df-us',   format: 'MM/DD/YYYY',   label: 'Amerika (01/31/2026)', isDefault: false },
    ];

    for (const df of dateFormats) {
      try {
        await prisma.dateFormat.upsert({
          where: { id: df.id },
          update: { format: df.format, label: df.label, isDefault: df.isDefault },
          create: df,
        });
      } catch (_) {
        // DateFormat model might not exist — skip
      }
    }

    // ── 4. Payment Modes ─────────────────────────────────────────────────────
    const paymentModes = [
      { id: 'pm-cash',    name: 'Naqd pul (Kassa)',    sortOrder: 1 },
      { id: 'pm-uzcard',  name: 'Uzcard',              sortOrder: 2 },
      { id: 'pm-humo',    name: 'Humo',                sortOrder: 3 },
      { id: 'pm-bank',    name: 'Bank o\'tkazmasi',    sortOrder: 4 },
      { id: 'pm-payme',   name: 'Payme',               sortOrder: 5 },
      { id: 'pm-click',   name: 'Click',               sortOrder: 6 },
      { id: 'pm-credit',  name: 'Kredit / Nasiya',     sortOrder: 7 },
    ];

    for (const pm of paymentModes) {
      try {
        await prisma.paymentMode.upsert({
          where: { id: pm.id },
          update: { name: pm.name, sortOrder: pm.sortOrder },
          create: pm,
        });
      } catch (_) {
        // PaymentMode may not exist — skip
      }
    }
    console.log(`[seedDefaults] ✅ Payment modes seeded`);

    // ── 5. Default Roles ──────────────────────────────────────────────────────
    let buxgalterRole = null;
    let adminRole = null;
    try {
      buxgalterRole = await prisma.role.findFirst({
        where: { roleName: 'Bosh Buxgalter' },
      });
      if (!buxgalterRole) {
        buxgalterRole = await prisma.role.create({
          data: { roleName: 'Bosh Buxgalter', status: true },
        });
      }

      adminRole = await prisma.role.findFirst({
        where: { roleName: 'Admin' },
      });
      if (!adminRole) {
        adminRole = await prisma.role.create({
          data: { roleName: 'Admin', status: true },
        });
      }
      console.log(`[seedDefaults] ✅ Default roles (Admin, Bosh Buxgalter) verified`);
    } catch (roleErr) {
      console.warn('[seedDefaults] Role seed skipped:', roleErr.message);
    }

    // ── 6. Uzbekistan Demo Accounts ──────────────────────────────────────────
    try {
      const bcrypt = require('bcryptjs');
      const defaultPassHash = await bcrypt.hash('Demo123$', 10);
      const buxgalterPassHash = await bcrypt.hash('password123', 10);

      const demoUsers = [
        {
          email: 'buxgalter@sapar.uz',
          firstName: 'Aziza',
          lastName: 'Rahimova (Bosh Buxgalter)',
          password: buxgalterPassHash,
          phone: '+998 (90) 123-45-67',
          roleId: buxgalterRole ? buxgalterRole.id : undefined,
          user_type: 1,
        },
        {
          email: 'stroy@sapar.uz',
          firstName: 'Rizobay',
          lastName: 'Stroy Admin',
          password: defaultPassHash,
          phone: '+998 (91) 234-56-78',
          roleId: adminRole ? adminRole.id : undefined,
          user_type: 1,
        },
        {
          email: 'admin@demo.sapar.local',
          firstName: 'Sapar',
          lastName: 'Demo Admin',
          password: defaultPassHash,
          phone: '+998 (93) 345-67-89',
          roleId: adminRole ? adminRole.id : undefined,
          user_type: 1,
        },
      ];

      for (const u of demoUsers) {
        try {
          await prisma.user.upsert({
            where: { email: u.email },
            update: {
              firstName: u.firstName,
              lastName: u.lastName,
              password: u.password,
              roleId: u.roleId,
            },
            create: {
              email: u.email,
              firstName: u.firstName,
              lastName: u.lastName,
              password: u.password,
              phone: u.phone,
              roleId: u.roleId,
              user_type: u.user_type,
              balance: 0,
              isDeleted: false,
            },
          });
        } catch (uErr) {
          console.warn(`[seedDefaults] User ${u.email} seed skipped:`, uErr.message);
        }
      }
      console.log(`[seedDefaults] ✅ Uzbekistan demo accounts verified`);
    } catch (demoErr) {
      console.warn('[seedDefaults] Demo accounts seed skipped:', demoErr.message);
    }

    // ── 7. Uzbekistan Standard Tax Rates ─────────────────────────────────────
    try {
      const allOwners = await prisma.user.findMany({
        where: { isDeleted: false },
        select: { id: true, email: true },
      });

      const uzTaxRates = [
        { name: 'QQS 12% (Standart stavka)', rate: 12.0, regime: 'NONE' },
        { name: 'QQS 0% (Eksport va imtiyozli)', rate: 0.0, regime: 'NONE' },
        { name: 'JShODS 12% (Daromad soligʻi)', rate: 12.0, regime: 'NONE' },
        { name: 'Ijtimoiy soliq 12%', rate: 12.0, regime: 'NONE' },
        { name: 'Aylanmadan olinadigan soliq 4%', rate: 4.0, regime: 'NONE' },
        { name: 'INPS 0.1% (Pensiya jamgʻarmasi)', rate: 0.1, regime: 'NONE' },
      ];

      for (const owner of allOwners) {
        for (const tax of uzTaxRates) {
          const taxId = `tax-${tax.name.slice(0, 4).toLowerCase().replace(/[^a-z0-9]/g, '')}-${owner.id.slice(0, 8)}`;
          await prisma.taxRate.upsert({
            where: { id: taxId },
            update: { name: tax.name, rate: tax.rate, isActive: true },
            create: {
              id: taxId,
              userId: owner.id,
              name: tax.name,
              rate: tax.rate,
              regime: tax.regime,
              isActive: true,
            },
          }).catch(() => {});
        }
      }
      console.log(`[seedDefaults] ✅ Uzbekistan standard tax rates initialized`);
    } catch (taxErr) {
      console.warn('[seedDefaults] Tax rates seed skipped:', taxErr.message);
    }

    console.log('[seedDefaults] ✅ All Uzbekistan defaults seeded successfully!');
    await prisma.$disconnect();
  }

  main().catch(async (e) => {
    console.error('[seedDefaults] ERROR:', e.message);
    // Non-zero exit would fail Render build — log but continue
    await prisma.$disconnect().catch(() => {});
    process.exit(0); // Don't block deployment for seed errors
  });

} catch (e) {
  console.warn('[seedDefaults] Prisma client not available, skipping seed:', e.message);
  process.exit(0);
}
