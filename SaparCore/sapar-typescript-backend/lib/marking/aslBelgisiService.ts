/**
 * lib/marking/aslBelgisiService.ts
 *
 * 🇺🇿 Uzbekistan Digital Product Marking & Traceability Service
 * Compliant with Cabinet of Ministers Decree No. 296 & Asl Belgisi / CRPT Turon standards.
 *
 * Enforces:
 * 1. GS1 DataMatrix code parsing (GTIN + Serial + Expiration Date YYMMDD + Crypto).
 * 2. Mandatory hard-stop block at POS on expired products.
 * 3. Lifecycle tracking: ACTIVE -> SOLD | WRITTEN_OFF (Account 9430).
 * 4. Regulatory product categories (Tobacco, Alcohol, Pharma, Appliances, Water & Beverages).
 */

export type MarkingCategory =
  | 'TOBACCO'
  | 'ALCOHOL'
  | 'PHARMACEUTICALS'
  | 'APPLIANCES'
  | 'WATER_BEVERAGES'
  | 'OTHER'
  | 'NONE';

export interface MarkingCategoryConfig {
  code: MarkingCategory;
  nameUz: string;
  nameRu: string;
  mandatorySince: string; // ISO date
  requiresExpiration: boolean;
}

export const MARKING_CATEGORIES: Record<MarkingCategory, MarkingCategoryConfig> = {
  TOBACCO: {
    code: 'TOBACCO',
    nameUz: 'Tamaki mahsulotlari',
    nameRu: 'Табачная продукция',
    mandatorySince: '2021-01-01',
    requiresExpiration: false,
  },
  ALCOHOL: {
    code: 'ALCOHOL',
    nameUz: 'Alkogolli ichimliklar va pivo',
    nameRu: 'Алкогольная продукция и пиво',
    mandatorySince: '2021-04-01',
    requiresExpiration: false,
  },
  PHARMACEUTICALS: {
    code: 'PHARMACEUTICALS',
    nameUz: 'Dori vositalari va tibbiy buyumlar',
    nameRu: 'Лекарственные средства и медизделия',
    mandatorySince: '2022-09-01',
    requiresExpiration: true,
  },
  APPLIANCES: {
    code: 'APPLIANCES',
    nameUz: 'Maishiy texnika vositalari',
    nameRu: 'Бытовая техника',
    mandatorySince: '2022-12-01',
    requiresExpiration: false,
  },
  WATER_BEVERAGES: {
    code: 'WATER_BEVERAGES',
    nameUz: 'Suv va salqin ichimliklar',
    nameRu: 'Вода и прохладительные напитки',
    mandatorySince: '2023-07-01',
    requiresExpiration: true,
  },
  OTHER: {
    code: 'OTHER',
    nameUz: 'Boshqa markirovkalanadigan tovarlar',
    nameRu: 'Прочая маркированная продукция',
    mandatorySince: '2024-01-01',
    requiresExpiration: false,
  },
  NONE: {
    code: 'NONE',
    nameUz: 'Markirovka talab qilinmaydi',
    nameRu: 'Не подлежит маркировке',
    mandatorySince: '',
    requiresExpiration: false,
  },
};

export interface ParsedDataMatrix {
  rawCode: string;
  gtin: string; // 14 digits
  serialNumber: string; // Alphanumeric
  expirationDate: string | null; // ISO YYYY-MM-DD
  isExpired: boolean;
  cryptoKey?: string;
  cryptoSignature?: string;
}

export interface MarkingValidationResult {
  valid: boolean;
  blocked: boolean;
  reason?: 'EXPIRED' | 'INVALID_FORMAT' | 'ALREADY_SOLD' | 'WRITTEN_OFF' | 'PRODUCT_MISMATCH';
  message: string;
  parsed?: ParsedDataMatrix;
}

// In-memory tenant marking registry for fast offline POS lookup / local sync
interface StoredMarkingRecord {
  code: string;
  tenantId: string;
  productId?: string;
  gtin: string;
  serialNumber: string;
  expirationDate: string | null;
  status: 'ACTIVE' | 'SOLD' | 'WRITTEN_OFF';
  soldAt?: string;
  writtenOffAt?: string;
  writeOffReason?: string;
}

const tenantMarkingStore = new Map<string, Map<string, StoredMarkingRecord>>();

function getTenantStore(tenantId: string): Map<string, StoredMarkingRecord> {
  let store = tenantMarkingStore.get(tenantId);
  if (!store) {
    store = new Map<string, StoredMarkingRecord>();
    tenantMarkingStore.set(tenantId, store);
  }
  return store;
}

/**
 * Parses GS1 DataMatrix string per Uzbekistan Asl Belgisi specifications.
 * Supports both raw strings (01...21...17...91...) and bracketed AI format (01)...(21)...
 */
export function parseAslBelgisiDataMatrix(rawInput: string): ParsedDataMatrix {
  const raw = (rawInput || '').trim();
  let gtin = '';
  let serialNumber = '';
  let expirationDate: string | null = null;
  let cryptoKey: string | undefined;
  let cryptoSignature: string | undefined;

  // 1. Bracketed AI syntax: (01)04780000000000(21)SER12345(17)260301(91)KEY1
  if (raw.includes('(01)')) {
    const gtinMatch = raw.match(/\(01\)(\d{14})/);
    if (gtinMatch) gtin = gtinMatch[1];

    const serialMatch = raw.match(/\(21\)([^()]+)/);
    if (serialMatch) serialNumber = serialMatch[1];

    const expMatch = raw.match(/\(17\)(\d{6})/);
    if (expMatch) {
      expirationDate = parseYYMMDD(expMatch[1]);
    }

    const keyMatch = raw.match(/\(91\)([^()]+)/);
    if (keyMatch) cryptoKey = keyMatch[1];

    const sigMatch = raw.match(/\(92\)([^()]+)/);
    if (sigMatch) cryptoSignature = sigMatch[1];
  } else {
    // 2. Standard raw GS1 string starting with 01 + 14 chars
    if (raw.startsWith('01') && raw.length >= 16) {
      gtin = raw.substring(2, 16);
      let rest = raw.substring(16);

      // Check for AI 21
      if (rest.startsWith('21')) {
        rest = rest.substring(2);
        // Find next delimiter (FNC1 / \x1d or AI 17 or AI 91 or AI 92)
        const nextAiIdx = rest.search(/(\x1d|17\d{6}|91|92)/);
        if (nextAiIdx !== -1) {
          serialNumber = rest.substring(0, nextAiIdx);
          rest = rest.substring(nextAiIdx).replace(/^\x1d/, '');
        } else {
          serialNumber = rest.substring(0, Math.min(rest.length, 13));
          rest = rest.substring(serialNumber.length);
        }
      }

      // Check for AI 17 (Expiry YYMMDD)
      const expMatch = rest.match(/17(\d{6})/);
      if (expMatch) {
        expirationDate = parseYYMMDD(expMatch[1]);
      }

      // Check for AI 91 / 92
      const keyMatch = rest.match(/91([^\x1d]{4})/);
      if (keyMatch) cryptoKey = keyMatch[1];

      const sigMatch = rest.match(/92([^\x1d]+)/);
      if (sigMatch) cryptoSignature = sigMatch[1];
    } else {
      // Fallback: simplified barcode or serial
      gtin = raw.substring(0, Math.min(raw.length, 14));
      serialNumber = raw.substring(14) || raw;
    }
  }

  // Check if expired against current date in Uzbekistan (UTC+5)
  let isExpired = false;
  if (expirationDate) {
    const todayStr = getTashkentDateString();
    isExpired = expirationDate < todayStr;
  }

  return {
    rawCode: raw,
    gtin,
    serialNumber,
    expirationDate,
    isExpired,
    cryptoKey,
    cryptoSignature,
  };
}

/**
 * Converts YYMMDD to YYYY-MM-DD
 */
function parseYYMMDD(yymmdd: string): string | null {
  if (!/^\d{6}$/.test(yymmdd)) return null;
  const yy = parseInt(yymmdd.substring(0, 2), 10);
  const mm = yymmdd.substring(2, 4);
  const dd = yymmdd.substring(4, 6);
  // GS1 rule: 51-99 -> 1951-1999, 00-50 -> 2000-2050
  const century = yy <= 50 ? '20' : '19';
  const year = `${century}${yy.toString().padStart(2, '0')}`;
  return `${year}-${mm}-${dd}`;
}

/**
 * Current date in Tashkent timezone (UTC+5) as YYYY-MM-DD
 */
export function getTashkentDateString(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const tashkentTime = new Date(utc + 5 * 3600000);
  return tashkentTime.toISOString().split('T')[0];
}

/**
 * Validates a scanned marking code for POS checkout.
 * Enforces Cabinet of Ministers Decree No. 296 (Hard-stop on expired goods).
 */
export function validateMarkingCodeForPos(
  tenantId: string,
  rawCode: string,
  productContext?: { id?: string; name?: string; requiresExpiration?: boolean }
): MarkingValidationResult {
  if (!rawCode || rawCode.trim().length < 8) {
    return {
      valid: false,
      blocked: true,
      reason: 'INVALID_FORMAT',
      message: 'Markirovka kodi notoʻgʻri yoki oʻqib boʻlmadi.',
    };
  }

  const parsed = parseAslBelgisiDataMatrix(rawCode);

  // 1. HARD-STOP: Expired goods cannot be sold per Decree No. 296
  if (parsed.isExpired) {
    return {
      valid: false,
      blocked: true,
      reason: 'EXPIRED',
      message: `DIQQAT! Mahsulotning yaroqlilik muddati (${parsed.expirationDate}) oʻtgan (Vazirlar Mahkamasi 296-son qarori). Ushbu tovar sotuvga chiqarilishi qatʼiyan taqiqlanadi!`,
      parsed,
    };
  }

  // 2. Check local store state (if code was already registered)
  const store = getTenantStore(tenantId);
  const existing = store.get(rawCode.trim());

  if (existing) {
    if (existing.status === 'SOLD') {
      return {
        valid: false,
        blocked: true,
        reason: 'ALREADY_SOLD',
        message: `Ushbu markirovka kodi avval sotilgan (${existing.soldAt || 'Oldingi chekda'}). Takroriy sotish taqiqlanadi!`,
        parsed,
      };
    }
    if (existing.status === 'WRITTEN_OFF') {
      return {
        valid: false,
        blocked: true,
        reason: 'WRITTEN_OFF',
        message: `Ushbu tovar avval hisobdan chiqarilgan (${existing.writeOffReason || '9430-hisob'}). Sotish mumkin emas!`,
        parsed,
      };
    }
  }

  return {
    valid: true,
    blocked: false,
    message: 'Markirovka kodi haqiqiy va sotuvga ruxsat etilgan.',
    parsed,
  };
}

/**
 * Records a marking code as SOLD upon POS checkout completion.
 */
export function recordMarkingCodeSold(
  tenantId: string,
  rawCode: string,
  invoiceId?: string,
  productId?: string
): void {
  const store = getTenantStore(tenantId);
  const parsed = parseAslBelgisiDataMatrix(rawCode);

  const existing = store.get(rawCode.trim()) || {
    code: rawCode.trim(),
    tenantId,
    productId,
    gtin: parsed.gtin,
    serialNumber: parsed.serialNumber,
    expirationDate: parsed.expirationDate,
    status: 'ACTIVE',
  };

  existing.status = 'SOLD';
  existing.soldAt = new Date().toISOString();
  store.set(rawCode.trim(), existing);
}

/**
 * Registers an inbound marking code upon purchase receipt.
 */
export function registerInboundMarkingCode(
  tenantId: string,
  rawCode: string,
  productId?: string,
  customExpiration?: string
): StoredMarkingRecord {
  const store = getTenantStore(tenantId);
  const parsed = parseAslBelgisiDataMatrix(rawCode);

  const record: StoredMarkingRecord = {
    code: rawCode.trim(),
    tenantId,
    productId,
    gtin: parsed.gtin,
    serialNumber: parsed.serialNumber,
    expirationDate: customExpiration || parsed.expirationDate,
    status: 'ACTIVE',
  };

  store.set(rawCode.trim(), record);
  return record;
}

/**
 * Writes off an expired marked code to GL Account 9430.
 */
export function writeOffExpiredMarkingCode(
  tenantId: string,
  rawCode: string,
  reason: string = 'Muddati oʻtgan tovar (VM 296-son qaror)'
): { success: boolean; record?: StoredMarkingRecord; glAccount: string } {
  const store = getTenantStore(tenantId);
  const parsed = parseAslBelgisiDataMatrix(rawCode);

  const record = store.get(rawCode.trim()) || {
    code: rawCode.trim(),
    tenantId,
    gtin: parsed.gtin,
    serialNumber: parsed.serialNumber,
    expirationDate: parsed.expirationDate,
    status: 'ACTIVE',
  };

  record.status = 'WRITTEN_OFF';
  record.writtenOffAt = new Date().toISOString();
  record.writeOffReason = reason;
  store.set(rawCode.trim(), record);

  return {
    success: true,
    record,
    glAccount: '9430', // Boshqa operatsion xarajatlar (NAS 21)
  };
}
