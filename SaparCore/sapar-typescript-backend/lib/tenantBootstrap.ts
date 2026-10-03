import { prisma } from './prisma';
import { applyPack, type ApplyPackTx } from './ledger/applyPack';
import { seedTransactionCategoriesForUser } from '../prisma/seedTransactionCategories';
import { ensureDefaultTaxGroup } from './tax/ensureDefaultTaxGroup';

export interface TenantBootstrapOptions {
  companyName?: string;
  bankName?: string;
  bankAccount?: string;
  bankMfo?: string;
  stir?: string;
  city?: string;
  customModules?: Record<string, boolean>;
}

export const DEFAULT_UNITS = [
  { unit_name: 'Dona', short_name: 'dona' },
  { unit_name: 'Kilogramm', short_name: 'kg' },
  { unit_name: 'Metr', short_name: 'm' },
  { unit_name: 'Litr', short_name: 'l' },
  { unit_name: 'Komplekt', short_name: 'kompl' },
  { unit_name: 'Xizmat', short_name: 'xizmat' },
];

/**
 * Bootstraps all necessary foundational data for a brand-new production tenant in Uzbekistan.
 * Idempotent: safe to run multiple times without duplicating data.
 */
export async function bootstrapTenant(userId: string, opts?: TenantBootstrapOptions): Promise<{ success: boolean; details: Record<string, boolean> }> {
  const details = {
    ledgerInitialized: false,
    taxGroupEnsured: false,
    unitsEnsured: false,
    pettyCashCreated: false,
    bankDetailCreated: false,
    categoryCreated: false,
  };

  try {
    // 1. Ledger & 21-son BHMS Accounts Initialization
    const settings = await prisma.companySettings.findUnique({ where: { userId } });
    if (!settings?.ledgerInitialized) {
      try {
        await prisma.$transaction(async (tx) => {
          await applyPack(tx as unknown as ApplyPackTx, {
            userId,
            countryCode: 'UZ',
            functionalCurrency: 'UZS',
            fiscalYearStartMonth: 1,
            goLiveDate: new Date(),
          });

          await tx.companySettings.update({
            where: { userId },
            data: {
              ledgerInitialized: true,
              countryCode: 'UZ',
              functionalCurrency: 'UZS',
              ...(opts?.stir ? { stir: opts.stir } : {}),
              ...(opts?.bankName ? { bankName: opts.bankName } : {}),
              ...(opts?.bankAccount ? { bankAccount: opts.bankAccount } : {}),
              ...(opts?.bankMfo ? { bankMfo: opts.bankMfo } : {}),
              ...(opts?.customModules ? { customModules: opts.customModules } : {}),
            },
          });
        });
        details.ledgerInitialized = true;
      } catch (packErr) {
        console.warn('[bootstrapTenant] applyPack notice (might be already initialized):', packErr);
      }
    }

    // Seed transaction categories for Money In/Out
    try {
      await seedTransactionCategoriesForUser(userId);
    } catch (e) {
      console.warn('[bootstrapTenant] seedTransactionCategoriesForUser notice:', e);
    }

    // 2. Default Tax Group & Rate (QQS 12% + QQS 0%)
    try {
      await ensureDefaultTaxGroup(userId);
      details.taxGroupEnsured = true;
    } catch (taxErr) {
      console.warn('[bootstrapTenant] ensureDefaultTaxGroup notice:', taxErr);
    }

    // 3. Standard Units
    try {
      for (const u of DEFAULT_UNITS) {
        const existing = await prisma.unit.findFirst({
          where: { short_name: u.short_name },
        });
        if (!existing) {
          await prisma.unit.create({
            data: {
              unit_name: u.unit_name,
              short_name: u.short_name,
              status: true,
            },
          });
        }
      }
      details.unitsEnsured = true;
    } catch (unitErr) {
      console.warn('[bootstrapTenant] unit seed notice:', unitErr);
    }

    // 4. Default Cash Register (Kassa - Naqd pul)
    try {
      const existingCash = await prisma.pettyCash.findFirst({
        where: { userId, isDeleted: false },
      });
      if (!existingCash) {
        await prisma.pettyCash.create({
          data: {
            userId,
            openingBalance: 0,
            currentBalance: 0,
            asOnDate: new Date(),
          },
        });
        details.pettyCashCreated = true;
      }
    } catch (cashErr) {
      console.warn('[bootstrapTenant] pettyCash create notice:', cashErr);
    }

    // 5. Default Bank Account
    try {
      const existingBank = await prisma.bankDetail.findFirst({
        where: { userId, isDeleted: false },
      });
      if (!existingBank) {
        const bankName = opts?.bankName || 'Ipak Yoʻli Bank ATB';
        const accountNumber = opts?.bankAccount || '20208000900123456001';
        const ifsc = opts?.bankMfo || '00440';
        const holder = opts?.companyName || settings?.companyName || 'Asosiy hisob-raqam';

        await prisma.bankDetail.create({
          data: {
            userId,
            bankName,
            accountNumber,
            accountHoldername: holder,
            branchName: opts?.city || 'Toshkent',
            IFSCCode: ifsc,
            accountType: 'current',
            openingBalance: 0,
            currentBalance: 0,
            currencyCode: 'UZS',
            status: true,
          },
        });
        details.bankDetailCreated = true;
      }
    } catch (bankErr) {
      console.warn('[bootstrapTenant] bankDetail create notice:', bankErr);
    }

    // 6. Default Product Category
    try {
      const existingCat = await prisma.category.findFirst({
        where: { slug: 'umumiy-tovarlar' },
      });
      if (!existingCat) {
        await prisma.category.create({
          data: {
            category_name: 'Umumiy tovarlar',
            slug: 'umumiy-tovarlar',
            status: true,
          },
        });
        details.categoryCreated = true;
      }
    } catch (catErr) {
      console.warn('[bootstrapTenant] default category notice:', catErr);
    }

    return { success: true, details };
  } catch (err) {
    console.error('[bootstrapTenant] error:', err);
    return { success: false, details };
  }
}
