/**
 * Baseline seed — runs by default for fresh installs (CodeCanyon customers).
 *
 * Seeds ONLY the lookup data that the onboarding flow needs:
 *   - System bootstrap user (user_type=999, doesn't count as admin so
 *     /api/admin/app-version still reports `new_register: true`)
 *   - Countries / States / Cities (a handful — enough to demo)
 *   - Timezones / DateFormats / TimeFormats
 *   - Currencies (linked to the bootstrap user as createdBy)
 *
 * Does NOT create an admin user. The frontend will render /register on
 * first run so the customer goes through the onboarding flow.
 *
 * For the CodeCanyon public demo (with admin@demo.sapar.local /
 * Demo123$ already provisioned), run `npm run prisma:seed:demo` AFTER
 * `npm run prisma:seed`.
 *
 * Idempotent — re-running is safe.
 *
 * Exports:
 *   runBaselineSeed() — callable in-process (server.js boot bootstrap).
 *                       Creates its own PrismaClient and disconnects it when
 *                       done, so the app's shared client is untouched.
 *                       Sub-seed helpers (seedModules, seedRoles, etc.) each
 *                       manage their own connections independently.
 */

import { PrismaClient } from '@prisma/client';
import { seedModules } from './seedModules';
import { seedFieldTypes } from './seedFieldTypes';
import { seedNotifications } from './seedNotifications';
import { seedEmailTemplates } from './seedEmailTemplates';
import { seedRoles } from './seedRoles';
import { seedUserOwner } from './seedUserOwner';
import { seedTransactionCategories } from './seedTransactionCategories';
import { encryptLegacyEmailSecrets } from './encryptLegacyEmailSecrets';
import { importGeoDataset } from './importGeoDataset';

/**
 * Run all idempotent baseline seeds. A dedicated PrismaClient is created for
 * the direct DB operations in this function and disconnected before returning.
 * Sub-seed helpers manage their own clients. Safe to call from the boot
 * bootstrap in server.js — it does NOT interfere with the app's shared
 * PrismaClient from lib/prisma.
 */
export async function runBaselineSeed(): Promise<void> {
  // A fresh PrismaClient scoped to this call so we can cleanly disconnect
  // the direct writes here without affecting the application's shared instance.
  const prisma = new PrismaClient();

  try {
    // -------------------------------------------------------------------------
    // System bootstrap user (needed as a FK target for Currency.createdBy).
    // user_type=999 so app-version doesn't count it as an admin.
    // -------------------------------------------------------------------------
    await prisma.user.upsert({
      where: { id: 'sys-bootstrap' },
      update: {},
      create: {
        id: 'sys-bootstrap',
        firstName: 'System',
        lastName: 'Bootstrap',
        email: 'system@sapar.internal',
        password: '$2b$10$disabled',
        user_type: 999,
        balance: 0,
        isDeleted: false,
      },
    });

    // -------------------------------------------------------------------------
    // Countries (Uzbekistan, Central Asia & key international trade partners)
    // -------------------------------------------------------------------------
    const countries = [
      { id: 'c-uzbekistan', name: 'Uzbekistan', iso3: 'UZB', iso2: 'UZ', phonecode: '998', capital: 'Tashkent', currency: 'UZS' },
      { id: 'c-kazakhstan', name: 'Kazakhstan', iso3: 'KAZ', iso2: 'KZ', phonecode: '7', capital: 'Astana', currency: 'KZT' },
      { id: 'c-kyrgyzstan', name: 'Kyrgyzstan', iso3: 'KGZ', iso2: 'KG', phonecode: '996', capital: 'Bishkek', currency: 'KGS' },
      { id: 'c-tajikistan', name: 'Tajikistan', iso3: 'TJK', iso2: 'TJ', phonecode: '992', capital: 'Dushanbe', currency: 'TJS' },
      { id: 'c-turkmenistan', name: 'Turkmenistan', iso3: 'TKM', iso2: 'TM', phonecode: '993', capital: 'Ashgabat', currency: 'TMT' },
      { id: 'c-united-states', name: 'United States', iso3: 'USA', iso2: 'US', phonecode: '1', capital: 'Washington', currency: 'USD' },
      { id: 'c-germany', name: 'Germany', iso3: 'DEU', iso2: 'DE', phonecode: '49', capital: 'Berlin', currency: 'EUR' },
      { id: 'c-china', name: 'China', iso3: 'CHN', iso2: 'CN', phonecode: '86', capital: 'Beijing', currency: 'CNY' },
      { id: 'c-turkey', name: 'Turkey', iso3: 'TUR', iso2: 'TR', phonecode: '90', capital: 'Ankara', currency: 'TRY' },
      { id: 'c-uae', name: 'United Arab Emirates', iso3: 'ARE', iso2: 'AE', phonecode: '971', capital: 'Abu Dhabi', currency: 'AED' },
      { id: 'c-russia', name: 'Russia', iso3: 'RUS', iso2: 'RU', phonecode: '7', capital: 'Moscow', currency: 'RUB' },
    ];
    for (const c of countries) {
      await prisma.country.upsert({ where: { id: c.id }, update: c, create: c });
    }

    // -------------------------------------------------------------------------
    // States / Regions (Uzbekistan Administrative Divisions)
    // -------------------------------------------------------------------------
    const states = [
      { id: 's-uz-tas-city', name: 'Toshkent shahri', country_id: 'c-uzbekistan', state_code: 'TK' },
      { id: 's-uz-tas-vil', name: 'Toshkent viloyati', country_id: 'c-uzbekistan', state_code: 'TV' },
      { id: 's-uz-sam', name: 'Samarqand viloyati', country_id: 'c-uzbekistan', state_code: 'SA' },
      { id: 's-uz-bux', name: 'Buxoro viloyati', country_id: 'c-uzbekistan', state_code: 'BU' },
      { id: 's-uz-fer', name: 'Fargʻona viloyati', country_id: 'c-uzbekistan', state_code: 'FA' },
      { id: 's-uz-and', name: 'Andijon viloyati', country_id: 'c-uzbekistan', state_code: 'AN' },
      { id: 's-uz-nam', name: 'Namangan viloyati', country_id: 'c-uzbekistan', state_code: 'NG' },
      { id: 's-uz-qash', name: 'Qashqadaryo viloyati', country_id: 'c-uzbekistan', state_code: 'QA' },
      { id: 's-uz-sur', name: 'Surxondaryo viloyati', country_id: 'c-uzbekistan', state_code: 'SU' },
      { id: 's-uz-jiz', name: 'Jizzax viloyati', country_id: 'c-uzbekistan', state_code: 'JI' },
      { id: 's-uz-sir', name: 'Sirdaryo viloyati', country_id: 'c-uzbekistan', state_code: 'SI' },
      { id: 's-uz-nav', name: 'Navoiy viloyati', country_id: 'c-uzbekistan', state_code: 'NW' },
      { id: 's-uz-xor', name: 'Xorazm viloyati', country_id: 'c-uzbekistan', state_code: 'XO' },
      { id: 's-uz-qar', name: 'Qoraqalpogʻiston Respublikasi', country_id: 'c-uzbekistan', state_code: 'QR' },
    ];
    for (const s of states) {
      await prisma.state.upsert({ where: { id: s.id }, update: s, create: s });
    }

    // -------------------------------------------------------------------------
    // Cities (Key Regional Centers of Uzbekistan)
    // -------------------------------------------------------------------------
    const cities = [
      { id: 'ci-toshkent', name: 'Toshkent', state_id: 's-uz-tas-city', country_id: 'c-uzbekistan' },
      { id: 'ci-chirchiq', name: 'Chirchiq', state_id: 's-uz-tas-vil', country_id: 'c-uzbekistan' },
      { id: 'ci-samarqand', name: 'Samarqand', state_id: 's-uz-sam', country_id: 'c-uzbekistan' },
      { id: 'ci-buxoro', name: 'Buxoro', state_id: 's-uz-bux', country_id: 'c-uzbekistan' },
      { id: 'ci-fargona', name: 'Fargʻona', state_id: 's-uz-fer', country_id: 'c-uzbekistan' },
      { id: 'ci-qoqon', name: 'Qoʻqon', state_id: 's-uz-fer', country_id: 'c-uzbekistan' },
      { id: 'ci-andijon', name: 'Andijon', state_id: 's-uz-and', country_id: 'c-uzbekistan' },
      { id: 'ci-namangan', name: 'Namangan', state_id: 's-uz-nam', country_id: 'c-uzbekistan' },
      { id: 'ci-qarshi', name: 'Qarshi', state_id: 's-uz-qash', country_id: 'c-uzbekistan' },
      { id: 'ci-termiz', name: 'Termiz', state_id: 's-uz-sur', country_id: 'c-uzbekistan' },
      { id: 'ci-jizzax', name: 'Jizzax', state_id: 's-uz-jiz', country_id: 'c-uzbekistan' },
      { id: 'ci-guliston', name: 'Guliston', state_id: 's-uz-sir', country_id: 'c-uzbekistan' },
      { id: 'ci-navoiy', name: 'Navoiy', state_id: 's-uz-nav', country_id: 'c-uzbekistan' },
      { id: 'ci-urganch', name: 'Urganch', state_id: 's-uz-xor', country_id: 'c-uzbekistan' },
      { id: 'ci-nukus', name: 'Nukus', state_id: 's-uz-qar', country_id: 'c-uzbekistan' },
    ];
    for (const c of cities) {
      await prisma.city.upsert({ where: { id: c.id }, update: c, create: c });
    }

    // -------------------------------------------------------------------------
    // Full country/state dataset
    // -------------------------------------------------------------------------
    try {
      const stateCount = await prisma.state.count();
      if (stateCount < 50) {
        await importGeoDataset();
      }
    } catch (geoErr) {
      console.warn('[seed] full geo import skipped (non-fatal):', geoErr);
    }

    // -------------------------------------------------------------------------
    // Units (Dona, Kilogram, Litr, Metr, Quti, Soat, etc.)
    // -------------------------------------------------------------------------
    const units = [
      { id: 'u-dona', unit_name: 'Dona (Pieces)', short_name: 'dona', status: true },
      { id: 'u-kg', unit_name: 'Kilogram (Kg)', short_name: 'kg', status: true },
      { id: 'u-metr', unit_name: 'Metr (M)', short_name: 'm', status: true },
      { id: 'u-litr', unit_name: 'Litr (L)', short_name: 'l', status: true },
      { id: 'u-quti', unit_name: 'Quti (Box)', short_name: 'quti', status: true },
      { id: 'u-soat', unit_name: 'Soat (Hours)', short_name: 'soat', status: true },
      { id: 'u-kun', unit_name: 'Kun (Days)', short_name: 'kun', status: true },
      { id: 'u-oy', unit_name: 'Oy (Months)', short_name: 'oy', status: true },
      { id: 'u-komplekt', unit_name: 'Komplekt (Set)', short_name: 'kompl', status: true },
    ];
    for (const u of units) {
      await prisma.unit.upsert({ where: { id: u.id }, update: u, create: u });
    }

    // -------------------------------------------------------------------------
    // Timezones (Uzbekistan & Central Asia Primary)
    // -------------------------------------------------------------------------
    const timezones = [
      { id: 'tz-uzb-tas', name: 'Asia/Tashkent', utc_offset: '+05:00' },
      { id: 'tz-uzb-sam', name: 'Asia/Samarkand', utc_offset: '+05:00' },
      { id: 'tz-kaz-ala', name: 'Asia/Almaty', utc_offset: '+05:00' },
      { id: 'tz-kgz-fru', name: 'Asia/Bishkek', utc_offset: '+06:00' },
      { id: 'tz-tjk-dyu', name: 'Asia/Dushanbe', utc_offset: '+05:00' },
      { id: 'tz-tkm-asb', name: 'Asia/Ashgabat', utc_offset: '+05:00' },
      { id: 'tz-utc', name: 'UTC', utc_offset: '+00:00' },
      { id: 'tz-eur-mos', name: 'Europe/Moscow', utc_offset: '+03:00' },
      { id: 'tz-asia-dxb', name: 'Asia/Dubai', utc_offset: '+04:00' },
      { id: 'tz-asia-ist', name: 'Asia/Istanbul', utc_offset: '+03:00' },
    ];
    for (const tz of timezones) {
      const existing = await prisma.timezone.findFirst({ where: { name: tz.name } });
      if (existing) {
        await prisma.timezone.update({ where: { id: existing.id }, data: { utc_offset: tz.utc_offset } });
      } else {
        await prisma.timezone.create({ data: tz });
      }
    }

    // -------------------------------------------------------------------------
    // Date formats
    // -------------------------------------------------------------------------
    const dateFormats = [
      { id: 'df-dmy-dot', title: 'DD.MM.YYYY (Oʻzbekiston standarti)', format: 'DD.MM.YYYY', isActive: true, isDeleted: false },
      { id: 'df-dmy-slash', title: 'DD/MM/YYYY', format: 'DD/MM/YYYY', isActive: true, isDeleted: false },
      { id: 'df-ymd-dash', title: 'YYYY-MM-DD (ISO)', format: 'YYYY-MM-DD', isActive: true, isDeleted: false },
      { id: 'df-dmy-dash', title: 'DD-MM-YYYY', format: 'DD-MM-YYYY', isActive: true, isDeleted: false },
    ];
    for (const df of dateFormats) {
      const existing = await prisma.dateFormat.findFirst({ where: { format: df.format } });
      if (existing) {
        await prisma.dateFormat.update({ where: { id: existing.id }, data: { title: df.title, isActive: true } });
      } else {
        await prisma.dateFormat.create({ data: df });
      }
    }

    // -------------------------------------------------------------------------
    // Time formats
    // -------------------------------------------------------------------------
    const timeFormats = [
      { id: 'tf-24h', name: '24 Soat (24 Hour)', format: 'H:i', isActive: true, isDeleted: false },
      { id: 'tf-12h', name: '12 Soat (12 Hour)', format: 'h:i A', isActive: true, isDeleted: false },
    ];
    for (const tf of timeFormats) {
      const existing = await prisma.timeFormat.findFirst({ where: { format: tf.format } });
      if (existing) {
        await prisma.timeFormat.update({ where: { id: existing.id }, data: { name: tf.name, isActive: true } });
      } else {
        await prisma.timeFormat.create({ data: tf });
      }
    }

    // -------------------------------------------------------------------------
    // Currencies (Default: UZS - Oʻzbekiston soʻmi)
    // -------------------------------------------------------------------------
    const currencies = [
      { id: 'cur-uzs', name: 'Oʻzbekiston soʻmi', code: 'UZS', symbol: 'soʻm', isDefault: true },
      { id: 'cur-usd', name: 'AQSH dollari (US Dollar)', code: 'USD', symbol: '$', isDefault: false },
      { id: 'cur-eur', name: 'Yevro (Euro)', code: 'EUR', symbol: '€', isDefault: false },
      { id: 'cur-rub', name: 'Rossiya rubli (Ruble)', code: 'RUB', symbol: '₽', isDefault: false },
      { id: 'cur-kzt', name: 'Qozogʻiston tengesi', code: 'KZT', symbol: '₸', isDefault: false },
      { id: 'cur-kgs', name: 'Qirgʻiziston somi', code: 'KGS', symbol: 'с', isDefault: false },
      { id: 'cur-tjs', name: 'Tojikiston somoniysi', code: 'TJS', symbol: 'SM', isDefault: false },
      { id: 'cur-tmt', name: 'Turkmaniston manati', code: 'TMT', symbol: 'm', isDefault: false },
    ];
    // Clean up any non-compliant currencies
    const allowedCodes = currencies.map((c) => c.code);
    await prisma.currency.updateMany({
      where: { code: { notIn: allowedCodes } },
      data: { isDeleted: true, status: false },
    });
    for (const cur of currencies) {
      const existing = await prisma.currency.findFirst({ where: { code: cur.code } });
      if (existing) {
        await prisma.currency.update({
          where: { id: existing.id },
          data: { name: cur.name, symbol: cur.symbol, isDefault: cur.isDefault, isDeleted: false, status: true },
        });
      } else {
        await prisma.currency.create({
          data: { ...cur, status: true, isDeleted: false, createdBy: 'sys-bootstrap' },
        });
      }
    }

    // -------------------------------------------------------------------------
    // Payment modes (Uzbekistan Standards)
    // -------------------------------------------------------------------------
    const paymentModes = [
      { name: 'Naqd pul (Cash)', slug: 'cash' },
      { name: 'Bank oʻtkazmasi (Bank Transfer)', slug: 'bank-transfer' },
      { name: 'Uzcard / Humo (Plastik karta)', slug: 'card' },
      { name: 'Payme / Click / Uzum (Online toʻlov)', slug: 'online-payment' },
      { name: 'Hisob krediti (Account Credit)', slug: 'account-credit' },
      { name: 'Chek / Veksellar (Cheque)', slug: 'cheque' },
    ];
    for (const pm of paymentModes) {
      await prisma.paymentMode.upsert({
        where: { slug: pm.slug },
        update: { name: pm.name },
        create: { name: pm.name, slug: pm.slug, status: true },
      });
    }
  } finally {
    await prisma.$disconnect();
  }

  // Sub-seed helpers each manage their own PrismaClient connections.
  // -------------------------------------------------------------------------
  // Module hierarchy + custom-field type catalog. These drive the
  // roles/permissions tree and the Settings > Module Settings (custom fields)
  // screens. Both are idempotent. Without them, fresh installs show an empty
  // module tree and "Module … could not be found" on the module-settings pages.
  // -------------------------------------------------------------------------
  const mods = await seedModules();
  console.log(`Modules seeded (created ${mods.created} new).`);
  const fts = await seedFieldTypes();
  console.log(`Field types seeded (created ${fts.created} new).`);

  // Notification types + tags drive the Email Templates / notification settings
  // screens. Idempotent. (EmailTemplate rows are user-created.)
  const notifs = await seedNotifications();
  console.log(`Notifications seeded (created ${notifs.types} types, ${notifs.tags} tags, ${notifs.links} links).`);

  // Baseline email templates (global content library, ready to use by any company).
  const tmpls = await seedEmailTemplates();
  console.log(`Email templates seeded (created ${tmpls.created}, skipped ${tmpls.skipped}).`);

  // Default roles (Admin, Vendor, Staff, Maintainer, Supplier) + backfill
  // existing users that have no roleId.
  const roles = await seedRoles();
  console.log(
    `Roles seeded (created ${roles.created} new, backfilled ${roles.backfilled} users, granted Admin role ${roles.adminPermsGranted} module permissions, assigned Owner to ${roles.ownerAssigned} owner(s)).`,
  );

  // Shared-workspace tenancy backfill: link every staff/admin user to the sole
  // company owner so all of them resolve to one dataset (ownerId ?? id) and see
  // each other's invoices/expenses. Idempotent — safe on every boot.
  const owners = await seedUserOwner();
  console.log(
    owners.ownerId
      ? `User owner backfill (linked ${owners.backfilled} user(s) to owner ${owners.ownerId}).`
      : 'User owner backfill skipped (no owner registered yet).',
  );

  // Money In/Out category catalog (per ledger-initialized company) + legacy
  // ExpenseCategory migration. Idempotent — owners without a ledger mapping are
  // skipped; existing categories are left untouched.
  const txc = await seedTransactionCategories();
  console.log(`Transaction categories seeded (created ${txc.created}, migrated ${txc.migrated}).`);

  // Encrypt any legacy plaintext email-provider secrets in place. Idempotent —
  // already-encrypted values are skipped.
  const enc = await encryptLegacyEmailSecrets();
  if (enc.encrypted > 0) console.log(`Encrypted ${enc.encrypted} legacy email secret(s).`);

  console.log('Baseline seed complete: lookup data ready.');
  console.log('Fresh installs: visit / and use the onboarding flow (register → setup).');
  console.log('For CodeCanyon demo, also run:  npx ts-node prisma/seed-demo.ts');
}

// ---------------------------------------------------------------------------
// Standalone runner — invoked by `prisma db seed` or `npx ts-node prisma/seed.ts`
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  await runBaselineSeed();
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}

// CommonJS interop so server.js (plain JS) can: require('./prisma/seed').runBaselineSeed()
module.exports = { runBaselineSeed };
module.exports.runBaselineSeed = runBaselineSeed;
