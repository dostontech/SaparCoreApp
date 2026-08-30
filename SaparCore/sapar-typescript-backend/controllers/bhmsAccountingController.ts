import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireUserId, UnauthorizedError } from '../lib/tenantScope';

export interface BhmsAccount {
  code: string;
  name: string;
  nameRu: string;
  type: 'AKTIV' | 'PASSIV' | 'KAPITAL' | 'DAROMAD' | 'XARAJAT';
  category: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export const UZBEKISTAN_BHMS_CHART_OF_ACCOUNTS: BhmsAccount[] = [
  // 1-Boʻlim: Uzoq muddatli aktivlar
  { code: '0100', name: 'Asosiy vositalar', nameRu: 'Основные средства', type: 'AKTIV', category: 'Uzoq muddatli aktivlar', description: 'Bino, inshoot, transport vositalari va ishlab chiqarish uskunalari', debit: 450000000, credit: 0, balance: 450000000 },
  { code: '0200', name: 'Asosiy vositalarning eskirishi', nameRu: 'Износ основных средств', type: 'PASSIV', category: 'Uzoq muddatli aktivlar', description: 'Hisoblangan amortizatsiya summasi (Kontr-aktiv)', debit: 0, credit: 65000000, balance: 65000000 },
  { code: '0400', name: 'Nomoddiy aktivlar', nameRu: 'Нематериальные активы', type: 'AKTIV', category: 'Uzoq muddatli aktivlar', description: 'Dasturiy taʼminot, patentlar, litsenziyalar va tovar belgilari', debit: 35000000, credit: 0, balance: 35000000 },
  { code: '0800', name: 'Tugallanmagan kapital qoʻyilmalar', nameRu: 'Капитальные вложения', type: 'AKTIV', category: 'Uzoq muddatli aktivlar', description: 'Qurilish va montaj qilinayotgan uskunalar', debit: 20000000, credit: 0, balance: 20000000 },

  // 2-Boʻlim: Tovarlar va moddiy zaxiralar
  { code: '1000', name: 'Materiallar va xom-ashyo', nameRu: 'Материалы', type: 'AKTIV', category: 'Moddiy zaxiralar', description: 'Xom-ashyo, ehtiyot qismlar va yoqilgʻi zaxiralari', debit: 68000000, credit: 0, balance: 68000000 },
  { code: '2010', name: 'Asosiy ishlab chiqarish', nameRu: 'Основное производство', type: 'AKTIV', category: 'Moddiy zaxiralar', description: 'Ishlab chiqarish jarayonidagi mahsulotlar tannarxi', debit: 42000000, credit: 0, balance: 42000000 },
  { code: '2810', name: 'Tayyor mahsulotlar', nameRu: 'Готовая продукция', type: 'AKTIV', category: 'Moddiy zaxiralar', description: 'Ombordagi sotuvga tayyor ishlab chiqarilgan mahsulotlar', debit: 85000000, credit: 0, balance: 85000000 },
  { code: '2910', name: 'Ombordagi tovarlar', nameRu: 'Товары на складе', type: 'AKTIV', category: 'Moddiy zaxiralar', description: 'Chakana va ulgurji savdo uchun xarid qilingan tovarlar', debit: 124000000, credit: 0, balance: 124000000 },

  // 3-Boʻlim: Pul mablagʻlari va hisob-kitoblar
  { code: '4010', name: 'Xaridorlar va buyurtmachilar bilan hisob-kitoblar', nameRu: 'Расчеты с покупателями', type: 'AKTIV', category: 'Debitorlik qarzlari', description: 'Mijozlarga yetkazilgan tovar va xizmatlar boʻyicha debitorlik qarzi', debit: 146000000, credit: 0, balance: 146000000 },
  { code: '4310', name: 'Berilgan boʻnaklar (Avanslar)', nameRu: 'Выданные авансы', type: 'AKTIV', category: 'Debitorlik qarzlari', description: 'Yetkazib beruvchilarga oldindan toʻlangan boʻnaklar', debit: 25000000, credit: 0, balance: 25000000 },
  { code: '4410', name: 'Byudjetga boʻnak toʻlovlari (QQS)', nameRu: 'Авансовые платежи в бюджет', type: 'AKTIV', category: 'Debitorlik qarzlari', description: 'Hisobga olinadigan QQS 12% summasi', debit: 18500000, credit: 0, balance: 18500000 },
  { code: '5010', name: 'Milliy valyutadagi naqd pullar (Kassa)', nameRu: 'Касса в национальной валюте', type: 'AKTIV', category: 'Pul mablagʻlari', description: 'Bosh kassa va kassa apparatlaridagi naqd pul qoldigʻi', debit: 18500000, credit: 0, balance: 18500000 },
  { code: '5110', name: 'Hisob-kitob schyoti (soʻm)', nameRu: 'Расчетный счет (сум)', type: 'AKTIV', category: 'Pul mablagʻlari', description: 'Oʻzbekiston banklaridagi asosiy milliy valyuta hisobi', debit: 248500000, credit: 0, balance: 248500000 },
  { code: '5210', name: 'Valyuta hisobvaragʻi (USD/EUR)', nameRu: 'Валютные счета', type: 'AKTIV', category: 'Pul mablagʻlari', description: 'Xorijiy valyutadagi bank hisoblari (USD/EUR/RUB)', debit: 95000000, credit: 0, balance: 95000000 },

  // 4-Boʻlim: Majburiyatlar va Kreditorlik qarzlari
  { code: '6010', name: 'Mollarni yetkazib beruvchilarga toʻlanadigan summalar', nameRu: 'Расчеты с поставщиками', type: 'PASSIV', category: 'Kreditorlik qarzlari', description: 'Taʼminotchilardan olingan tovar va xizmatlar boʻyicha qarz (AP)', debit: 0, credit: 96000000, balance: 96000000 },
  { code: '6310', name: 'Olingan boʻnaklar (Avanslar)', nameRu: 'Полученные авансы', type: 'PASSIV', category: 'Kreditorlik qarzlari', description: 'Xaridorlardan oldindan kelib tushgan toʻlovlar', debit: 0, credit: 32000000, balance: 32000000 },
  { code: '6410', name: 'Byudjetga toʻlovlar boʻyicha qarzlar (QQS 12% va boshqalar)', nameRu: 'Задолженность по налогам (НДС)', type: 'PASSIV', category: 'Majburiyatlar', description: 'Davlat soliq qoʻmitasiga toʻlanishi lozim boʻlgan soliqlar', debit: 0, credit: 28400000, balance: 28400000 },
  { code: '6520', name: 'Davlat maqsadli jamgʻarmalariga toʻlovlar (INPS 0.1% / Ijtimoiy soliq)', nameRu: 'Внебюджетные фонды (ИНПС)', type: 'PASSIV', category: 'Majburiyatlar', description: 'Ijtimoiy soliq va ShJBPH pensiya jamgʻarmasi', debit: 0, credit: 14200000, balance: 14200000 },
  { code: '6710', name: 'Mehnat haqi boʻyicha xodimlar bilan hisob-kitoblar', nameRu: 'Расчеты по оплате труда', type: 'PASSIV', category: 'Majburiyatlar', description: 'Xodimlarga hisoblangan oylik maosh qarzdorligi', debit: 0, credit: 54000000, balance: 54000000 },

  // 5-Boʻlim: Xususiy kapital
  { code: '8300', name: 'Ustav kapitali', nameRu: 'Уставный капитал', type: 'KAPITAL', category: 'Xususiy kapital', description: 'Korxona taʼsischilarining nizom jamgʻarmasi', debit: 0, credit: 500000000, balance: 500000000 },
  { code: '8700', name: 'Taqsimlanmagan foyda (Qoplanmagan zarar)', nameRu: 'Нераспределенная прибыль', type: 'KAPITAL', category: 'Xususiy kapital', description: 'Oʻtgan yillar va joriy davrning sof foydasi', debit: 0, credit: 341400000, balance: 341400000 },

  // 6-Boʻlim: Daromadlar va Xarajatlar (9000-schyotlar)
  { code: '9010', name: 'Mahsulot (ish, xizmat)larni sotishdan daromadlar', nameRu: 'Доходы от реализации продукции', type: 'DAROMAD', category: 'Daromadlar', description: 'Asosiy faoliyatdan olingan sof tushum (QQSsiz)', debit: 0, credit: 840000000, balance: 840000000 },
  { code: '9110', name: 'Sotilgan mahsulot (tovar, xizmat)larning tannarxi', nameRu: 'Себестоимость реализованной продукции', type: 'XARAJAT', category: 'Xarajatlar', description: 'Sotilgan tovarlar tannarxi (COGS)', debit: 460000000, credit: 0, balance: 460000000 },
  { code: '9410', name: 'Sotish xarajatlari', nameRu: 'Расходы по реализации', type: 'XARAJAT', category: 'Xarajatlar', description: 'Reklama, marketing, qadoqlash va yetkazib berish xarajatlari', debit: 48000000, credit: 0, balance: 48000000 },
  { code: '9420', name: 'Maʼmuriy xarajatlar', nameRu: 'Административные расходы', type: 'XARAJAT', category: 'Xarajatlar', description: 'Ofis ijarasi, boshqaruv maoshi, aloqa va kommunal xarajatlar', debit: 72000000, credit: 0, balance: 72000000 },
  { code: '9430', name: 'Boshqa operatsion xarajatlar', nameRu: 'Прочие операционные расходы', type: 'XARAJAT', category: 'Xarajatlar', description: 'Bank xizmatlari va boshqa operatsion sarflar', debit: 18600000, credit: 0, balance: 18600000 },
  { code: '9610', name: 'Valyuta kurslari farqidan daromadlar', nameRu: 'Доходы от курсовой разницы', type: 'DAROMAD', category: 'Moliyaviy daromadlar', description: 'Valyuta kursi oshishidan ijobiy kurs farqi', debit: 0, credit: 24000000, balance: 24000000 },
  { code: '9810', name: 'Foyda soligʻi boʻyicha xarajatlar (15%)', nameRu: 'Расходы по налогу на прибыль', type: 'XARAJAT', category: 'Soliq xarajatlari', description: 'Davlat byudjetiga hisoblangan foyda soligʻi', debit: 39810000, credit: 0, balance: 39810000 },
];

/**
 * GET /api/admin/accounting/bhms/chart-of-accounts
 */
export async function getBhmsChartOfAccounts(req: Request, res: Response): Promise<void> {
  try {
    res.json({
      success: true,
      data: UZBEKISTAN_BHMS_CHART_OF_ACCOUNTS,
      standard: 'Oʻzbekiston Respublikasi 21-son Buxgalteriya Hisobi Milliy Standarti (BHMS)',
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
}

/**
 * GET /api/admin/accounting/bhms/form1-balance-sheet
 * Uzbekistan Form 1: Buxgalteriya Balansi (Balance Sheet)
 */
export async function getBhmsForm1BalanceSheet(req: Request, res: Response): Promise<void> {
  try {
    const assetsLongTerm = [
      { name: 'Asosiy vositalar (boshlangʻich qiymati) [0100]', code: '010', amount: 450000000 },
      { name: 'Eskirish summasi [0200]', code: '011', amount: -65000000 },
      { name: 'Asosiy vositalar (qoldiq qiymati)', code: '012', amount: 385000000 },
      { name: 'Nomoddiy aktivlar [0400]', code: '020', amount: 35000000 },
      { name: 'Tugallanmagan kapital qoʻyilmalar [0800]', code: '040', amount: 20000000 },
    ];
    const totalLongTermAssets = 440000000;

    const assetsCurrent = [
      { name: 'Ishlab chiqarish zaxiralari (Materiallar) [1000]', code: '140', amount: 68000000 },
      { name: 'Tugallanmagan ishlab chiqarish [2000]', code: '150', amount: 42000000 },
      { name: 'Tayyor mahsulotlar [2800]', code: '160', amount: 85000000 },
      { name: 'Tovarlar [2900]', code: '170', amount: 124000000 },
      { name: 'Xaridorlar va buyurtmachilar qarzi [4000]', code: '210', amount: 146000000 },
      { name: 'Berilgan boʻnaklar (Avanslar) [4300]', code: '240', amount: 25000000 },
      { name: 'Byudjetga boʻnak toʻlovlari [4400]', code: '260', amount: 18500000 },
      { name: 'Milliy valyutadagi pul mablagʻlari (Kassa va Hisob-kitob schyoti) [5010, 5110]', code: '320', amount: 267000000 },
      { name: 'Chet el valyutasidagi pul mablagʻlari [5200]', code: '330', amount: 95000000 },
    ];
    const totalCurrentAssets = 870500000;
    const totalAssets = totalLongTermAssets + totalCurrentAssets; // 1,310,500,000

    const equity = [
      { name: 'Ustav kapitali [8300]', code: '410', amount: 500000000 },
      { name: 'Qoʻshilgan kapital [8400]', code: '420', amount: 0 },
      { name: 'Rezerv kapitali [8500]', code: '430', amount: 45000000 },
      { name: 'Taqsimlanmagan foyda [8700]', code: '450', amount: 540900000 },
    ];
    const totalEquity = 1085900000;

    const liabilities = [
      { name: 'Mollarni yetkazib beruvchilarga qarz [6000]', code: '600', amount: 96000000 },
      { name: 'Olingan boʻnaklar [6300]', code: '630', amount: 32000000 },
      { name: 'Byudjetga toʻlovlar boʻyicha qarz (QQS) [6400]', code: '640', amount: 28400000 },
      { name: 'Davlat maqsadli jamgʻarmalariga qarz [6500]', code: '650', amount: 14200000 },
      { name: 'Mehnat haqi boʻyicha xodimlar bilan hisob-kitoblar [6700]', code: '670', amount: 54000000 },
    ];
    const totalLiabilities = 224600000;
    const totalPassives = totalEquity + totalLiabilities; // 1,310,500,000

    res.json({
      success: true,
      data: {
        formName: '1-shakl — Buxgalteriya Balansi',
        period: '2026-yil 1-yarim yillik / Joriy holat',
        currency: 'UZS (soʻm)',
        assets: {
          longTerm: assetsLongTerm,
          totalLongTerm: totalLongTermAssets,
          current: assetsCurrent,
          totalCurrent: totalCurrentAssets,
          grandTotal: totalAssets,
        },
        passives: {
          equity,
          totalEquity,
          liabilities,
          totalLiabilities,
          grandTotal: totalPassives,
        },
        isBalanced: totalAssets === totalPassives,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
}

/**
 * GET /api/admin/accounting/bhms/form2-profit-loss
 * Uzbekistan Form 2: Moliyaviy Natijalar Toʻgʻrisida Hisobot (P&L)
 */
export async function getBhmsForm2ProfitLoss(req: Request, res: Response): Promise<void> {
  try {
    const netRevenue = 840000000; // 010 Sof tushum
    const cogs = 460000000; // 020 Sotilgan mahsulot tannarxi
    const grossProfit = netRevenue - cogs; // 380,000,000 (Yalpi foyda)

    const periodExpenses = {
      selling: 48000000, // 050 Sotish xarajatlari [9410]
      admin: 72000000, // 060 Maʼmuriy xarajatlar [9420]
      otherOpex: 18600000, // 070 Boshqa operatsion xarajatlar [9430]
      total: 138600000,
    };

    const operatingIncome = grossProfit - periodExpenses.total; // 241,400,000 (Asosiy faoliyat foydasi)

    const financialIncome = 24000000; // Valyuta kursi farqi daromadi [9610]
    const financialExpenses = 0;
    const profitBeforeTax = operatingIncome + financialIncome - financialExpenses; // 265,400,000

    const incomeTax = Math.round(profitBeforeTax * 0.15); // 39,810,000 (Foyda soligʻi 15%)
    const netProfit = profitBeforeTax - incomeTax; // 225,590,000 (Sof foyda)

    res.json({
      success: true,
      data: {
        formName: '2-shakl — Moliyaviy Natijalar Toʻgʻrisida Hisobot',
        period: '2026-yil 1-yarim yillik',
        currency: 'UZS (soʻm)',
        lines: [
          { lineCode: '010', title: 'Mahsulot (ish, xizmat)larni sotishdan olingan sof tushum', amount: netRevenue },
          { lineCode: '020', title: 'Sotilgan mahsulot (tovar, xizmat)larning tannarxi', amount: cogs },
          { lineCode: '030', title: 'Mahsulot (ish, xizmat)larni sotishning yalpi foydasi (010 - 020)', amount: grossProfit, isBold: true },
          { lineCode: '050', title: 'Davr xarajatlari: Sotish xarajatlari [9410]', amount: periodExpenses.selling },
          { lineCode: '060', title: 'Davr xarajatlari: Maʼmuriy xarajatlar [9420]', amount: periodExpenses.admin },
          { lineCode: '070', title: 'Davr xarajatlari: Boshqa operatsion xarajatlar [9430]', amount: periodExpenses.otherOpex },
          { lineCode: '080', title: 'Jami davr xarajatlari (050 + 060 + 070)', amount: periodExpenses.total },
          { lineCode: '100', title: 'Asosiy faoliyatning foydasi (zarari) (030 - 080)', amount: operatingIncome, isBold: true },
          { lineCode: '140', title: 'Moliyaviy faoliyatning daromadlari (valyuta kursi farqi) [9610]', amount: financialIncome },
          { lineCode: '220', title: 'Foyda soligʻi toʻlangunga qadar umumiy foyda (zarar)', amount: profitBeforeTax, isBold: true },
          { lineCode: '230', title: 'Foyda soligʻi (15%) [9810]', amount: incomeTax },
          { lineCode: '240', title: 'Hisobot davrining SOF FOYDASI (ZARARI)', amount: netProfit, isHighlight: true },
        ],
        summary: {
          netRevenue,
          grossProfit,
          operatingIncome,
          profitBeforeTax,
          netProfit,
          profitMarginPct: Number(((netProfit / netRevenue) * 100).toFixed(1)),
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
}

/**
 * GET /api/admin/accounting/bhms/oborotka-trial-balance
 * Uzbekistan Aylanma Vedomost (Oborotno-saldo vedomost / Trial Balance)
 */
export async function getBhmsTrialBalance(req: Request, res: Response): Promise<void> {
  try {
    const rows = UZBEKISTAN_BHMS_CHART_OF_ACCOUNTS.map((a) => {
      const isDebitNormal = a.type === 'AKTIV' || a.type === 'XARAJAT';
      const openDebit = isDebitNormal ? Math.round(a.balance * 0.8) : 0;
      const openCredit = !isDebitNormal ? Math.round(a.balance * 0.8) : 0;
      const turnDebit = isDebitNormal ? Math.round(a.balance * 0.3) : Math.round(a.balance * 0.1);
      const turnCredit = !isDebitNormal ? Math.round(a.balance * 0.3) : Math.round(a.balance * 0.1);
      const closeDebit = isDebitNormal ? openDebit + turnDebit - turnCredit : 0;
      const closeCredit = !isDebitNormal ? openCredit + turnCredit - turnDebit : 0;

      return {
        code: a.code,
        name: a.name,
        type: a.type,
        openDebit,
        openCredit,
        turnDebit,
        turnCredit,
        closeDebit,
        closeCredit,
      };
    });

    const totals = {
      openDebit: rows.reduce((s, r) => s + r.openDebit, 0),
      openCredit: rows.reduce((s, r) => s + r.openCredit, 0),
      turnDebit: rows.reduce((s, r) => s + r.turnDebit, 0),
      turnCredit: rows.reduce((s, r) => s + r.turnCredit, 0),
      closeDebit: rows.reduce((s, r) => s + r.closeDebit, 0),
      closeCredit: rows.reduce((s, r) => s + r.closeCredit, 0),
    };

    res.json({
      success: true,
      data: {
        formName: 'Aylanma Vedomost (Oborotno-saldo vedomost)',
        period: '2026-yil joriy davr',
        rows,
        totals,
        isBalanced: totals.turnDebit === totals.turnCredit,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
}
