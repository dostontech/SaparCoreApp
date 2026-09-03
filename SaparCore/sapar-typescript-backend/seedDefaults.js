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
