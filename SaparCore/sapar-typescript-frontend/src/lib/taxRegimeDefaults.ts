import type { TaxRegime, TaxKind } from '@models/taxRate';

export interface StarterRate {
    name: string;
    rate: number;
    taxKind: TaxKind | null;
}

export const STARTER_RATES: Record<TaxRegime, StarterRate[]> = {
    VAT_GENERIC: [
        { name: 'QQS 12% (Standart stavka)', rate: 12, taxKind: 'VAT' },
        { name: 'QQS 0% (Eksport va xalqaro tashuvlar)', rate: 0, taxKind: 'VAT' },
        { name: 'QQS Imtiyozli (Soliqdan ozod)', rate: 0, taxKind: 'VAT' },
    ],
    GST_INDIA: [
        { name: 'QQS 12%', rate: 12, taxKind: 'VAT' },
    ],
    US_SALES_TAX: [
        { name: 'Aylanmadan olinadigan soliq 4%', rate: 4, taxKind: 'SALES_TAX' },
    ],
    NONE: [
        { name: 'Soliqsiz (0%)', rate: 0, taxKind: null },
    ],
};
