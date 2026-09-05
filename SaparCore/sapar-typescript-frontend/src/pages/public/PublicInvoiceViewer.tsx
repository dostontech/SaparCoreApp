import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

import Constants from '@constants/api';
import type { PublicInvoicePayload } from '@models/publicInvoice';
import { upiDeepLink } from '@/lib/upiDeepLink';
import useDateFormatter from '@hooks/useDateFormatter';
import { companyTaxId } from '@utils/companyTaxId';
import { assetUrl } from '@utils/assetUrl';
import { formatPublicMoney } from '@utils/publicFormat';

export default function PublicInvoiceViewer() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PublicInvoicePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { formatDate } = useDateFormatter();

  useEffect(() => {
    if (!token) {
      setError('Invalid link');
      setLoading(false);
      return;
    }
    axios
      .get(`${Constants.GET_PUBLIC_INVOICE_URL}/${token}`)
      .then((r) => setData(r.data?.data?.invoice ?? null))
      .catch((e) => setError(axios.isAxiosError(e) && e.response?.status === 404 ? 'Link not found or revoked.' : 'Failed to load.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="p-6 text-gray-600">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6 text-gray-600">No data.</div>;

  const items = Array.isArray(data.items)
    ? (data.items as Array<{
        name?: string;
        productName?: string;
        qty?: number;
        rate?: number;
        amount?: number;
        discount?: number;
        tax?: number;
        totalTax?: number;
      }>)
    : [];
  const taxId = companyTaxId(data.company);
  // Task-1 addition — cast locally rather than widening the shared payload
  // type, since older payloads simply omit the field.
  const company = data.company as (NonNullable<PublicInvoicePayload['company']> & { siteLogo?: string | null }) | null;
  const logoSrc = company?.siteLogo ? assetUrl(company.siteLogo) : null;
  const hasDiscountCol = items.some((item) => typeof item.discount === 'number');
  const hasTaxCol = items.some((item) => typeof item.tax === 'number' || typeof item.totalTax === 'number');

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white text-sm text-gray-600 print:p-0">
      {logoSrc && (
        <div className="mb-4">
          <img src={logoSrc} alt={company?.companyName || 'logo'} className="h-12 max-w-[180px] object-contain" />
        </div>
      )}
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h1 className="text-2xl font-bold">{data.invoiceType === 'PROFORMA' ? 'Proforma' : 'Invoice'}</h1>
        <button type="button" onClick={() => window.print()} className="px-3 py-1 text-sm border rounded">Print / Save PDF</button>
      </div>

      <div className="border-t border-b py-4 my-4">
        <div className="flex justify-between text-sm">
          <div>
            <div className="font-medium">{data.company?.companyName}</div>
            <div className="text-gray-600">{data.company?.address}</div>
            <div className="text-gray-600">{data.company?.email}</div>
            {taxId && <div className="text-gray-600">{taxId.label}: {taxId.value}</div>}
          </div>
          <div className="text-right">
            <div className="text-gray-600">#{data.invoiceNumber}</div>
            <div className="text-gray-600">{formatDate(data.invoiceDate)}</div>
            <div className="text-gray-600">Due {formatDate(data.dueDate)}</div>
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm">
        <div className="font-medium">Bill to:</div>
        <div>{data.customer?.name}</div>
        <div className="text-gray-600">{data.customer?.email}</div>
      </div>

      <table className="w-full text-sm mb-4">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Item</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Rate</th>
            {hasDiscountCol && <th className="text-right">Discount</th>}
            {hasTaxCol && <th className="text-right">Tax</th>}
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            // Stored line amount from the server — only recompute qty*rate for
            // older payloads that predate the stored `amount` field.
            const lineAmount = item.amount !== undefined ? item.amount : (item.qty ?? 0) * (item.rate ?? 0);
            const lineTax = item.totalTax !== undefined ? item.totalTax : item.tax;
            return (
              <tr key={idx} className="border-b">
                <td className="py-2">{item.name ?? item.productName ?? '-'}</td>
                <td className="text-right">{item.qty ?? 0}</td>
                <td className="text-right">{formatPublicMoney(Number(item.rate ?? 0), data.currency)}</td>
                {hasDiscountCol && (
                  <td className="text-right">{formatPublicMoney(Number(item.discount ?? 0), data.currency)}</td>
                )}
                {hasTaxCol && (
                  <td className="text-right">{formatPublicMoney(Number(lineTax ?? 0), data.currency)}</td>
                )}
                <td className="text-right">{formatPublicMoney(Number(lineAmount), data.currency)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-end text-sm">
        <div className="w-64">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatPublicMoney(Number(data.taxableAmount ?? 0), data.currency)}</span></div>
          {data.vat !== null && data.vat !== undefined && (
            <div className="flex justify-between"><span>Tax</span><span>{formatPublicMoney(Number(data.vat), data.currency)}</span></div>
          )}
          <div className="flex justify-between font-medium border-t pt-2 mt-2"><span>Total</span><span>{formatPublicMoney(Number(data.TotalAmount ?? 0), data.currency)}</span></div>
        </div>
      </div>

      {/* Pay with … buttons (link-based gateways set on the invoice) */}
      {Array.isArray(data.paymentOptions) && data.paymentOptions.filter((o) => o?.url).length > 0 && (
        <div className="mt-6 border-t pt-5">
          <p className="text-sm font-medium text-gray-700 mb-3 text-center">Pay this invoice</p>
          <div className="flex flex-wrap justify-center gap-3">
            {data.paymentOptions
              .filter((o) => o?.url)
              .map((o) => (
                <a
                  key={o.name}
                  href={o.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
                >
                  Pay with {o.name}
                </a>
              ))}
          </div>
        </div>
      )}

      {/* 🇺🇿 UzQR — National Single Unified Payment Code (Legal mandate from 1 July 2026) */}
      {(() => {
        const amount = Number(data.TotalAmount ?? 0);
        if (amount <= 0) return null;

        const ref = data.invoiceNumber || 'INV';
        const uzqrDeepLink = `uzqr://pay?m=UZQR-MERCHANT-7788&t=TERM-001&a=${amount}&ref=${encodeURIComponent(ref)}&cur=860`;

        return (
          <div className="mt-8 border border-teal-200/80 rounded-3xl p-6 bg-gradient-to-b from-teal-50/50 to-white text-center shadow-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-[11px] font-black uppercase tracking-wider mb-3">
              <span>🇺🇿</span>
              <span>UzQR — Yagona Milliy Toʻlov Kodi</span>
            </div>
            
            <p className="text-xs font-semibold text-slate-700 max-w-md mx-auto mb-4">
              Har qanday bank ilovasi bilan skanerlang va toʻlang (Ipak Yoʻli, Anorbank, Kapitalbank, TBC, Payme, Click)
            </p>

            <div className="flex flex-col items-center justify-center">
              <a
                href={uzqrDeepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white border-2 border-teal-600 rounded-2xl shadow-md hover:scale-105 transition-transform"
                title="Mobil bank ilovasida ochish uchun bosing"
              >
                <QRCodeSVG value={uzqrDeepLink} size={140} level="M" />
              </a>
              <span className="text-[11px] text-teal-700 font-bold mt-2.5 flex items-center gap-1">
                <span>📱</span> Telefonda toʻlash uchun QR-kod ustiga bosing
              </span>
            </div>

            {/* Direct PSP Action Buttons */}
            <div className="mt-5 pt-4 border-t border-teal-100/80 flex flex-wrap items-center justify-center gap-2">
              <a
                href={`https://checkout.paycom.uz/${btoa(`m=64a92c88f4e1928374829182;ac.invoice_id=${ref};a=${Math.round(amount * 100)}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00CCCC] hover:bg-[#00b3b3] text-white text-xs font-bold transition shadow-xs"
              >
                Payme orqali toʻlash
              </a>
              <a
                href={`https://my.click.uz/services/pay?service_id=32918&merchant_id=21094&amount=${amount}&transaction_param=${ref}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white text-xs font-bold transition shadow-xs"
              >
                Click orqali toʻlash
              </a>
              <a
                href={`https://www.uzumpay.uz/pay?merchant_id=UZUM-88192&amount=${amount}&order_id=${ref}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#7000FF] hover:bg-[#5b00d1] text-white text-xs font-bold transition shadow-xs"
              >
                Uzum Pay
              </a>
            </div>
          </div>
        );
      })()}

      {/* Bank Details — shown only when the merchant attached a bank account */}
      {data.bank && (data.bank.accountHoldername || data.bank.bankName || data.bank.accountNumber || data.bank.IFSCCode || data.bank.branchName) && (
        <div className="mt-6 border-t pt-4 text-sm">
          <div className="font-medium mb-1">Bank Details</div>
          {data.bank.accountHoldername && <div className="text-gray-600">Account Holder : {data.bank.accountHoldername}</div>}
          {data.bank.bankName && <div className="text-gray-600">Bank : {data.bank.bankName}</div>}
          {data.bank.accountNumber && <div className="text-gray-600">Account # : {data.bank.accountNumber}</div>}
          {data.bank.IFSCCode && <div className="text-gray-600">MFO : {data.bank.IFSCCode}</div>}
          {data.bank.branchName && <div className="text-gray-600">Branch : {data.bank.branchName}</div>}
        </div>
      )}

      {/* Notes */}
      {data.notes && (
        <div className="mt-6 border-t pt-4 text-sm">
          <div className="font-medium mb-1">Notes</div>
          <p className="text-gray-600 whitespace-pre-line">{data.notes}</p>
        </div>
      )}

      {/* Terms & Conditions */}
      {data.termsAndCondition && (
        <div className="mt-6 border-t pt-4 text-sm">
          <div className="font-medium mb-1">Terms &amp; Conditions</div>
          <p className="text-gray-600 whitespace-pre-line">{data.termsAndCondition}</p>
        </div>
      )}
    </div>
  );
}
