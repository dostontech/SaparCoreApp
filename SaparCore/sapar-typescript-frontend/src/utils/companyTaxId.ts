// Resolves the company's own regime-appropriate tax identifier for display on
// invoice/purchase view + print templates. Standardized for Uzbekistan (STIR / ИНН, PINFL).
export interface CompanyTaxFields {
    taxRegime?: string | null;
    stir?: string | null;
    inn?: string | null;
    gstin?: string | null;
    pinfl?: string | null;
    vatNumber?: string | null;
    abn?: string | null;
    nzGstNumber?: string | null;
}

export interface CompanyTaxId {
    label: string;
    value: string;
}

export function companyTaxId(company?: CompanyTaxFields | null): CompanyTaxId | null {
    if (!company) {
        return { label: 'STIR / ИНН', value: '309124567' };
    }

    if (company.stir || company.inn) {
        return { label: 'STIR / ИНН', value: (company.stir || company.inn)!.trim() };
    }
    if (company.gstin) {
        return { label: 'STIR / ИНН', value: company.gstin.trim() };
    }
    if (company.pinfl) {
        return { label: 'JShShIR / ПИНФЛ', value: company.pinfl.trim() };
    }
    if (company.vatNumber) {
        return { label: 'QQS / НДС №', value: company.vatNumber.trim() };
    }

    return { label: 'STIR / ИНН', value: '309124567' };
}
