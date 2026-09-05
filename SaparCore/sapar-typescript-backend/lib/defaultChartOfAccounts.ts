import type { AccountType } from '@prisma/client';

export interface SeedAccount {
  code: string;
  name: string;
  accountType: AccountType;
  parentCode?: string;
}

export const DEFAULT_ACCOUNTS: SeedAccount[] = [
  // AKTIVLAR (ASSETS)
  { code: '1000', name: 'Aktivlar (Assets)', accountType: 'ASSET' },
  { code: '1001', name: 'Kassa (Naqd pul mablagʻlari)', accountType: 'ASSET', parentCode: '1000' },
  { code: '1002', name: 'Bank hisob-varaqlari (Hisob-kitob hisobi)', accountType: 'ASSET', parentCode: '1000' },
  { code: '1100', name: 'Xaridorlar bilan hisob-kitoblar (Debitorlik qarzi)', accountType: 'ASSET', parentCode: '1000' },
  { code: '1200', name: 'Tovar va moddiy zaxiralar (Ombor qoldiqlari)', accountType: 'ASSET', parentCode: '1000' },
  { code: '1500', name: 'Asosiy vositalar va uskunalar', accountType: 'ASSET', parentCode: '1000' },
  // MAJBURIYATLAR (LIABILITIES)
  { code: '2000', name: 'Majburiyatlar (Liabilities)', accountType: 'LIABILITY' },
  { code: '2001', name: 'Yetkazib beruvchilarga toʻlovlar (Kreditorlik qarzi)', accountType: 'LIABILITY', parentCode: '2000' },
  { code: '2100', name: 'QQS va soliq majburiyatlari (QQS 12%)', accountType: 'LIABILITY', parentCode: '2000' },
  { code: '2200', name: 'Bank kreditlari va qarz majburiyatlari', accountType: 'LIABILITY', parentCode: '2000' },
  // XUSUSIY KAPITAL (EQUITY)
  { code: '3000', name: 'Xususiy Kapital (Equity)', accountType: 'EQUITY' },
  { code: '3001', name: 'Ustav kapitali (Taʼsischilar ulushi)', accountType: 'EQUITY', parentCode: '3000' },
  { code: '3100', name: 'Taqsimlanmagan sof foyda', accountType: 'EQUITY', parentCode: '3000' },
  // DAROMADLAR (INCOME)
  { code: '4000', name: 'Daromadlar (Income)', accountType: 'INCOME' },
  { code: '4001', name: 'Mahsulot va tovarlarni sotishdan tushum', accountType: 'INCOME', parentCode: '4000' },
  { code: '4002', name: 'Xizmatlar koʻrsatishdan daromad', accountType: 'INCOME', parentCode: '4000' },
  { code: '4100', name: 'Boshqa operatsion daromadlar', accountType: 'INCOME', parentCode: '4000' },
  // XARAJATLAR (EXPENSES)
  { code: '5000', name: 'Xarajatlar (Expenses)', accountType: 'EXPENSE' },
  { code: '5001', name: 'Sotilgan tovarlar tannarxi (COGS)', accountType: 'EXPENSE', parentCode: '5000' },
  { code: '5100', name: 'Davr xarajatlari (Operatsion xarajatlar)', accountType: 'EXPENSE', parentCode: '5000' },
  { code: '5101', name: 'Ijara xarajatlari', accountType: 'EXPENSE', parentCode: '5100' },
  { code: '5102', name: 'Kommunal toʻlovlar (Elektr, Gaz, Suv)', accountType: 'EXPENSE', parentCode: '5100' },
  { code: '5103', name: 'Xodimlar ish haqi xarajatlari', accountType: 'EXPENSE', parentCode: '5100' },
  { code: '5200', name: 'Boshqa operatsion xarajatlar', accountType: 'EXPENSE', parentCode: '5000' },
];


export async function seedDefaultChart(prisma: import('@prisma/client').PrismaClient, userId: string): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;
  const codeToId = new Map<string, string>();

  // First pass: create top-level (no parent)
  for (const acc of DEFAULT_ACCOUNTS.filter((a) => !a.parentCode)) {
    const existing = await prisma.account.findUnique({ where: { userId_code: { userId, code: acc.code } } });
    if (existing) {
      codeToId.set(acc.code, existing.id);
      skipped++;
      continue;
    }
    const row = await prisma.account.create({
      data: { userId, code: acc.code, name: acc.name, accountType: acc.accountType },
    });
    codeToId.set(acc.code, row.id);
    created++;
  }

  // Second pass: children
  for (const acc of DEFAULT_ACCOUNTS.filter((a) => !!a.parentCode)) {
    const existing = await prisma.account.findUnique({ where: { userId_code: { userId, code: acc.code } } });
    if (existing) {
      codeToId.set(acc.code, existing.id);
      skipped++;
      continue;
    }
    const parentId = codeToId.get(acc.parentCode!);
    const row = await prisma.account.create({
      data: { userId, code: acc.code, name: acc.name, accountType: acc.accountType, parentId: parentId ?? null },
    });
    codeToId.set(acc.code, row.id);
    created++;
  }

  return { created, skipped };
}
