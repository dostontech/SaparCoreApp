/**
 * SAPAR ERP — Seeder Script for Uzbekistan & Central Asian Standards:
 * - Currencies: UZS (default), USD, EUR, RUB, KZT, KGS, TJS, TMT, CNY, TRY, AED
 * - Timezones: Asia/Tashkent (default), Asia/Samarkand, Asia/Almaty, Asia/Bishkek, Asia/Dushanbe, Asia/Ashgabat, UTC
 * - Date & Time Formats: Standard ISO and Central Asian formats (YYYY-MM-DD, DD.MM.YYYY, HH:mm:ss)
 * - Tax Defaults: QQS 12% (Standard), QQS 0% (Export), Imtiyozli (Exempt), JShODS 12%, Ijtimoiy soliq 12%, Aylanma soliq 4%
 *
 * Run: node seedDefaults.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sapar';

await mongoose.connect(MONGO_URI);
console.log('Connected to MongoDB for SAPAR Registry Seed');

// === Models ===
const Currency = mongoose.model('Currency', new mongoose.Schema({
  name: String,
  code: String,
  symbol: String,
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}));

const DateFormat = mongoose.model('DateFormat', new mongoose.Schema({
  title: String,
  format: String,
  isActive: Boolean,
  isDeleted: Boolean
}));

const TimeFormat = mongoose.model('TimeFormat', new mongoose.Schema({
  name: String,
  format: String,
  isActive: Boolean,
  isDeleted: Boolean
}));

const Timezone = mongoose.model('Timezone', new mongoose.Schema({
  name: String,
  utc_offset: String
}));

const TaxRate = mongoose.model('TaxRate', new mongoose.Schema({
  name: String,
  rate: Number,
  type: String,
  isDefault: Boolean,
  isActive: Boolean
}));

// === 1. Currencies (Uzbekistan, Central Asia & Trade Partners) ===
const currencies = [
  { name: 'Oʻzbekiston soʻmi', code: 'UZS', symbol: 'soʻm', isDefault: true, isActive: true },
  { name: 'AQSh dollari', code: 'USD', symbol: '$', isDefault: false, isActive: true },
  { name: 'Yevro', code: 'EUR', symbol: '€', isDefault: false, isActive: true },
  { name: 'Rossiya rubli', code: 'RUB', symbol: '₽', isDefault: false, isActive: true },
  { name: 'Qozogʻiston tengesi', code: 'KZT', symbol: '₸', isDefault: false, isActive: true },
  { name: 'Qirgʻiziston somi', code: 'KGS', symbol: 'с', isDefault: false, isActive: true },
  { name: 'Tojikiston somoniysi', code: 'TJS', symbol: 'SM', isDefault: false, isActive: true },
  { name: 'Turkmaniston manati', code: 'TMT', symbol: 'm', isDefault: false, isActive: true },
];

// === 2. Timezones (Uzbekistan & Central Asian Standard) ===
const timezones = [
  { name: 'Asia/Tashkent', utc_offset: '+05:00' }, // Primary default
  { name: 'Asia/Samarkand', utc_offset: '+05:00' },
  { name: 'Asia/Almaty', utc_offset: '+05:00' },
  { name: 'Asia/Bishkek', utc_offset: '+06:00' },
  { name: 'Asia/Dushanbe', utc_offset: '+05:00' },
  { name: 'Asia/Ashgabat', utc_offset: '+05:00' },
  { name: 'UTC', utc_offset: '+00:00' },
];

// === 3. Date & Time Formats ===
const dateFormats = [
  { title: 'YYYY-MM-DD (Standart ISO)', format: 'YYYY-MM-DD', isActive: true, isDeleted: false },
  { title: 'DD.MM.YYYY (Oʻzbekiston)', format: 'DD.MM.YYYY', isActive: true, isDeleted: false },
  { title: 'DD-MM-YYYY', format: 'DD-MM-YYYY', isActive: true, isDeleted: false },
  { title: 'DD/MM/YYYY', format: 'DD/MM/YYYY', isActive: true, isDeleted: false },
  { title: 'DD MMMM YYYY (Toʻliq)', format: 'DD MMMM YYYY', isActive: true, isDeleted: false },
];

const timeFormats = [
  { name: 'HH:mm:ss (24 soat)', format: 'HH:mm:ss', isActive: true, isDeleted: false },
  { name: 'HH:mm', format: 'HH:mm', isActive: true, isDeleted: false },
  { name: 'hh:mm:ss A (12 soat)', format: 'hh:mm:ss A', isActive: true, isDeleted: false },
  { name: 'hh:mm A', format: 'hh:mm A', isActive: true, isDeleted: false },
];

// === 4. Uzbekistan Standard Tax Rates ===
const taxRates = [
  { name: 'QQS 12% (Standart stavka)', rate: 12, type: 'VAT', isDefault: true, isActive: true },
  { name: 'QQS 0% (Eksport)', rate: 0, type: 'VAT', isDefault: false, isActive: true },
  { name: 'QQS Imtiyozli (Ozod qilingan)', rate: 0, type: 'EXEMPT', isDefault: false, isActive: true },
  { name: 'JShODS 12% (Daromad soligʻi)', rate: 12, type: 'INCOME_TAX', isDefault: false, isActive: true },
  { name: 'Ijtimoiy soliq 12%', rate: 12, type: 'SOCIAL_TAX', isDefault: false, isActive: true },
  { name: 'Aylanmadan olinadigan soliq 4%', rate: 4, type: 'TURNOVER_TAX', isDefault: false, isActive: true },
];

// === Seeding Function ===
const seedCollection = async (Model, data, label) => {
  await Model.deleteMany({});
  await Model.insertMany(data);
  console.log(`✓ Seeded ${data.length} clean ${label}`);
};

// === Execute Seeder ===
try {
  await seedCollection(Currency, currencies, 'currencies');
  await seedCollection(Timezone, timezones, 'timezones (Uzbekistan & Central Asia)');
  await seedCollection(DateFormat, dateFormats, 'date formats');
  await seedCollection(TimeFormat, timeFormats, 'time formats');
  await seedCollection(TaxRate, taxRates, 'Uzbekistan tax rates (QQS 12%, JShODS 12%, Aylanma 4%)');

  console.log(' All Uzbekistan & Central Asian registries successfully initialized!');
  await mongoose.connection.close();
  process.exit(0);
} catch (err) {
  console.error(' Seeding failed:', err);
  await mongoose.connection.close();
  process.exit(1);
}
