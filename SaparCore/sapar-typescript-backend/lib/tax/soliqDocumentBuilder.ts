/**
 * Soliq (State Tax Committee of Uzbekistan) & Didox / Factura.uz
 * Standard Electronic Invoice (E-Faktura) Document Builder.
 *
 * Conforms to Uzbekistan National Standard E-Invoice Schema v2.0/v3.0.
 */

export interface SoliqCompanyInfo {
  name: string;
  tin: string; // STIR / ИНН (9 digits)
  pinfl?: string | null; // JShShIR / ПИНФЛ (14 digits)
  address: string;
  vatRegCode?: string | null; // QQS ro'yxatdan o'tish kodi (12 digits)
  bankAccount?: string | null; // Hisob raqam (20 digits)
  bankMfo?: string | null; // MFO (5 digits)
  oked?: string | null; // OKED (5 digits)
  phone?: string | null;
}

export interface SoliqInvoiceItem {
  ordNo: number;
  name: string;
  catalogCode: string; // MXIK / IKPU (17 digits)
  catalogName?: string;
  packageCode?: string; // O'lchov birligi kodi (e.g. "796" for dona/pcs)
  packageName?: string;
  barcode?: string | null;
  count: number;
  summa: number; // Unit price in so'm (UZS)
  deliverySum?: number;
  vatRate: number; // 12% standard, 0% or -1 for exempt
  vatSum: number;
  totalSum: number; // Summa + VatSum + DeliverySum
}

export interface SoliqDocumentPayload {
  documentId: string;
  documentType: number; // 0 = Hisob-faktura (Standard Invoice), 1 = Qo'shimcha (Correction)
  documentNumber: string;
  documentDate: string; // YYYY-MM-DD
  contractNumber: string;
  contractDate: string; // YYYY-MM-DD
  seller: SoliqCompanyInfo;
  buyer: SoliqCompanyInfo;
  items: SoliqInvoiceItem[];
  totalDeliverySum: number;
  totalVatSum: number;
  totalSum: number; // Gross Total in UZS
  currency: string; // "UZS"
  hasVat: boolean;
}

/**
 * Builds the canonical Soliq / Didox Uzbekistan electronic invoice structure
 * from a SAPAR invoice entity and seller company settings.
 */
export function buildSoliqInvoicePayload(
  invoice: any,
  sellerCompany: any
): SoliqDocumentPayload {
  const invoiceItems: any[] = Array.isArray(invoice.items) ? invoice.items : [];

  let calculatedVatTotal = 0;
  let calculatedGrossTotal = 0;

  const items: SoliqInvoiceItem[] = invoiceItems.map((item, idx) => {
    const qty = Number(item.quantity ?? item.qty ?? 1);
    const rate = Number(item.rate ?? item.unitPrice ?? 0);
    const lineTotal = Number(item.amount ?? (qty * rate));
    
    // Uzbekistan standard VAT is 12% (unless exempt or 0%)
    const vatRate = item.taxRate ? Number(item.taxRate) : (invoice.taxPercent ? Number(invoice.taxPercent) : 12);
    const vatSum = vatRate > 0 ? Number(((lineTotal * vatRate) / (100 + (invoice.isTaxInclusive ? 0 : vatRate))).toFixed(2)) : 0;
    const itemGross = lineTotal + (invoice.isTaxInclusive ? 0 : vatSum);

    calculatedVatTotal += vatSum;
    calculatedGrossTotal += itemGross;

    // MXIK/IKPU (17-digit national product code from item or fallback)
    const catalogCode = item.mxikCode || item.ikpu || item.product?.mxikCode || '01111001001000000';
    const packageCode = item.packageCode || item.product?.packageCode || '796'; // 796 = dona/pcs

    return {
      ordNo: idx + 1,
      name: item.name || item.productName || 'Mahsulot / Xizmat',
      catalogCode,
      catalogName: item.catalogName || item.name,
      packageCode,
      packageName: item.unit || 'dona',
      barcode: item.barcode || item.product?.barcode || null,
      count: qty,
      summa: rate,
      deliverySum: 0,
      vatRate,
      vatSum,
      totalSum: itemGross,
    };
  });

  const formattedDocDate = invoice.invoiceDate 
    ? new Date(invoice.invoiceDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const seller: SoliqCompanyInfo = {
    name: sellerCompany?.companyName || 'SAPAR Korxonasi',
    tin: sellerCompany?.tin || sellerCompany?.stir || sellerCompany?.gstin || '123456789',
    pinfl: sellerCompany?.pinfl || null,
    address: sellerCompany?.address || 'Toshkent shahri',
    vatRegCode: sellerCompany?.vatNumber || null,
    bankAccount: sellerCompany?.bankAccount || sellerCompany?.accountNo || null,
    bankMfo: sellerCompany?.bankMfo || sellerCompany?.mfo || null,
    oked: sellerCompany?.oked || null,
    phone: sellerCompany?.phone || null,
  };

  const buyerContact = invoice.contact || invoice.customer || {};
  const buyer: SoliqCompanyInfo = {
    name: buyerContact.companyName || buyerContact.name || buyerContact.displayName || 'Mijoz',
    tin: buyerContact.tin || buyerContact.stir || buyerContact.gstin || '987654321',
    pinfl: buyerContact.pinfl || null,
    address: buyerContact.billingAddress?.street || buyerContact.address || 'Oʻzbekiston',
    vatRegCode: buyerContact.vatNumber || null,
    bankAccount: buyerContact.bankAccount || null,
    bankMfo: buyerContact.bankMfo || buyerContact.mfo || null,
    oked: buyerContact.oked || null,
    phone: buyerContact.phone || null,
  };

  return {
    documentId: invoice.id,
    documentType: 0,
    documentNumber: String(invoice.invoiceNumber || invoice.number || '1'),
    documentDate: formattedDocDate,
    contractNumber: String(invoice.referenceNumber || invoice.contractNumber || '1-SH'),
    contractDate: formattedDocDate,
    seller,
    buyer,
    items,
    totalDeliverySum: 0,
    totalVatSum: Number(invoice.vat ?? calculatedVatTotal),
    totalSum: Number(invoice.TotalAmount ?? invoice.totalAmount ?? calculatedGrossTotal),
    currency: 'UZS',
    hasVat: calculatedVatTotal > 0,
  };
}
