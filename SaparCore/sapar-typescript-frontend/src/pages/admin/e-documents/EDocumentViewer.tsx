import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Printer,
  Share2,
  ShieldCheck,
  ArrowLeft,
  QrCode,
  Building2,
  FileCheck2,
  FileSignature,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@components/ui';
import Constants from '@constants/api';
import { EDigitalStamp } from '@components/admin/eimzo/EDigitalStamp';
import { EimzoSignModal } from '@components/admin/eimzo/EimzoSignModal';

export const EDocumentViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  const [document, setDocument] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingModalOpen, setSigningModalOpen] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${Constants.BASE_URL}/admin/e-documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setDocument(res.data.data.document);
      }
    } catch (err) {
      console.error('Error loading document:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyPublicLink = () => {
    const url = `${window.location.origin}/public/sign-document/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Hujjatni imzolash havolasi nusxalandi');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-body font-medium">
        Hujjat yuklanmoqda...
      </div>
    );
  }

  if (!document) {
    return (
      <div className="py-20 text-center">
        <p className="text-body font-medium">Elektron hujjat topilmadi</p>
        <Button className="mt-4" onClick={() => navigate('/admin/e-documents')}>
          Ortga qaytish
        </Button>
      </div>
    );
  }

  const meta = document.metaData || {};

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between no-print">
        <button
          type="button"
          onClick={() => navigate('/admin/e-documents')}
          className="flex items-center gap-1.5 text-xs font-semibold text-body hover:text-heading transition"
        >
          <ArrowLeft className="w-4 h-4" /> Barcha E-Hujjatlarga qaytish
        </button>

        <div className="flex items-center gap-2">
          <Button variant="white" size="sm" onClick={copyPublicLink} leftIcon={<Share2 className="w-3.5 h-3.5" />}>
            Havolani ulashish
          </Button>
          <Button variant="white" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-3.5 h-3.5" />}>
            Chop etish / PDF
          </Button>
          {!document.senderSignature && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setSigningModalOpen(true)}
              leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
            >
              E-IMZO bilan imzolash
            </Button>
          )}
        </div>
      </div>

      {/* Official Document Paper */}
      <div className="bg-surface border border-border shadow-md rounded-3xl p-8 sm:p-12 space-y-8 print:shadow-none print:border-none print:p-0">
        
        {/* =================================================================== */}
        {/* DOCUMENT TYPE 1: AKT SVERKI (ACT_RECONCILIATION)                    */}
        {/* =================================================================== */}
        {document.docType === 'ACT_RECONCILIATION' && (
          <div className="space-y-8">
            <div className="text-center border-b border-border pb-6 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                Oʻzbekiston Respublikasi Standarti: Solishtirma Dalolatnoma (Акт сверки)
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-heading uppercase tracking-tight">
                {document.title}
              </h1>
              <p className="text-xs text-body leading-relaxed max-w-2xl mx-auto">
                <span className="font-semibold text-heading">{meta.startDate || document.docDate}</span> dan{' '}
                <span className="font-semibold text-heading">{meta.endDate || document.docDate}</span> gacha boʻlgan davr uchun{' '}
                <span className="font-bold text-heading">{document.sellerName}</span> va{' '}
                <span className="font-bold text-heading">{document.buyerName}</span> oʻrtasidagi oʻzaro hisob-kitoblar holati
              </p>
            </div>

            {/* Preamble Statement */}
            <div className="p-4 rounded-2xl bg-muted/20 border border-border text-xs text-heading leading-relaxed">
              Biz, quyida imzo chekuvchilar — bir tomondan <strong>{document.sellerName}</strong> nomidan bosh direktor{' '}
              <strong>{document.sellerDirector || 'Rahbar'}</strong> va ikkinchi tomondan <strong>{document.buyerName}</strong> nomidan{' '}
              <strong>{document.buyerDirector || 'Direktor'}</strong>, ushbu dalolatnomani tuzdik, unga koʻra tomonlar oʻrtasida{' '}
              <strong>{meta.startDate}</strong> dan <strong>{meta.endDate}</strong> gacha boʻlgan davrda hisob-kitoblar quyidagicha amalga oshirilgan:
            </div>

            {/* 2-Column Comparative Ledger Table */}
            <div className="border border-border rounded-2xl overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-muted/60 text-heading font-bold border-b border-border text-center">
                    <th colSpan={4} className="py-2.5 px-3 border-r border-border bg-teal-50/50 text-teal-900">
                      {document.sellerName} hisobida (Bizning hisobimizda)
                    </th>
                    <th colSpan={3} className="py-2.5 px-3 bg-blue-50/50 text-blue-900">
                      {document.buyerName} hisobida (Kontragent hisobida)
                    </th>
                  </tr>
                  <tr className="bg-muted/40 text-body font-semibold border-b border-border">
                    <th className="py-2 px-3 border-r border-border">Sana</th>
                    <th className="py-2 px-3 border-r border-border">Hujjat nomi va №</th>
                    <th className="py-2 px-3 border-r border-border text-right">Debit (Taqdim etildi)</th>
                    <th className="py-2 px-3 border-r border-border text-right">Kredit (Toʻlandi)</th>
                    <th className="py-2 px-3 border-r border-border">Sana</th>
                    <th className="py-2 px-3 border-r border-border text-right">Debit (Toʻlandi)</th>
                    <th className="py-2 px-3 text-right">Kredit (Qabul qilindi)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="bg-muted/10 font-bold">
                    <td className="py-2 px-3 border-r border-border">{meta.startDate}</td>
                    <td className="py-2 px-3 border-r border-border">Davr boshiga qoldiq holati</td>
                    <td className="py-2 px-3 border-r border-border text-right font-mono text-emerald-700">
                      {Number(meta.openingBalance) > 0 ? Number(meta.openingBalance).toLocaleString('uz-UZ') : '-'}
                    </td>
                    <td className="py-2 px-3 border-r border-border text-right font-mono text-blue-700">
                      {Number(meta.openingBalance) < 0 ? Math.abs(Number(meta.openingBalance)).toLocaleString('uz-UZ') : '-'}
                    </td>
                    <td className="py-2 px-3 border-r border-border">{meta.startDate}</td>
                    <td className="py-2 px-3 border-r border-border text-right font-mono">
                      {Number(meta.openingBalance) < 0 ? Math.abs(Number(meta.openingBalance)).toLocaleString('uz-UZ') : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {Number(meta.openingBalance) > 0 ? Number(meta.openingBalance).toLocaleString('uz-UZ') : '-'}
                    </td>
                  </tr>

                  {(meta.ledgerLines || []).map((line: any, idx: number) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="py-2 px-3 border-r border-border font-mono">{line.date}</td>
                      <td className="py-2 px-3 border-r border-border">
                        <span className="font-semibold block">{line.docType} № {line.docNumber}</span>
                        <span className="text-[11px] text-body">{line.description}</span>
                      </td>
                      <td className="py-2 px-3 border-r border-border text-right font-mono font-semibold text-emerald-700">
                        {Number(line.debit) > 0 ? Number(line.debit).toLocaleString('uz-UZ') : '-'}
                      </td>
                      <td className="py-2 px-3 border-r border-border text-right font-mono font-semibold text-blue-700">
                        {Number(line.credit) > 0 ? Number(line.credit).toLocaleString('uz-UZ') : '-'}
                      </td>
                      <td className="py-2 px-3 border-r border-border font-mono">{line.date}</td>
                      <td className="py-2 px-3 border-r border-border text-right font-mono">
                        {Number(line.credit) > 0 ? Number(line.credit).toLocaleString('uz-UZ') : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {Number(line.debit) > 0 ? Number(line.debit).toLocaleString('uz-UZ') : '-'}
                      </td>
                    </tr>
                  ))}

                  {/* Turnover Totals */}
                  <tr className="bg-muted/50 font-bold border-t-2 border-border text-xs">
                    <td colSpan={2} className="py-2.5 px-3 border-r border-border text-right uppercase">
                      Davr boʻyicha aylanma:
                    </td>
                    <td className="py-2.5 px-3 border-r border-border text-right font-mono text-emerald-800">
                      {Number(meta.debitTotal || 0).toLocaleString('uz-UZ')} soʻm
                    </td>
                    <td className="py-2.5 px-3 border-r border-border text-right font-mono text-blue-800">
                      {Number(meta.creditTotal || 0).toLocaleString('uz-UZ')} soʻm
                    </td>
                    <td className="py-2.5 px-3 border-r border-border text-center">-</td>
                    <td className="py-2.5 px-3 border-r border-border text-right font-mono">
                      {Number(meta.creditTotal || 0).toLocaleString('uz-UZ')} soʻm
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {Number(meta.debitTotal || 0).toLocaleString('uz-UZ')} soʻm
                    </td>
                  </tr>

                  {/* Closing Balance */}
                  <tr className="bg-primary/10 font-black border-t border-border text-xs">
                    <td colSpan={2} className="py-3 px-3 border-r border-border text-right uppercase text-primary">
                      {meta.endDate} holatiga yakuniy qoldiq:
                    </td>
                    <td colSpan={2} className="py-3 px-3 border-r border-border text-right font-mono text-primary text-sm">
                      {Number(meta.closingBalance) >= 0 ? `+${Number(meta.closingBalance).toLocaleString('uz-UZ')}` : Number(meta.closingBalance).toLocaleString('uz-UZ')} soʻm
                    </td>
                    <td colSpan={3} className="py-3 px-3 text-right font-mono text-primary text-sm">
                      {Number(meta.closingBalance) >= 0 ? `-${Number(meta.closingBalance).toLocaleString('uz-UZ')}` : `+${Math.abs(Number(meta.closingBalance)).toLocaleString('uz-UZ')}`} soʻm
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Closing Reconciliation Conclusion */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Solishtirish Xulosasi:
              </p>
              <p>
                <strong>{meta.endDate}</strong> holatiga koʻra tomonlar oʻrtasidagi oʻzaro hisob-kitob solishtirildi.{' '}
                {Number(meta.closingBalance) > 0 ? (
                  <><strong>{document.buyerName}</strong> tashkilotining <strong>{document.sellerName}</strong> foydasiga <strong>{Number(meta.closingBalance).toLocaleString('uz-UZ')} soʻm</strong> qarzdorligi tasdiqlanadi.</>
                ) : Number(meta.closingBalance) < 0 ? (
                  <><strong>{document.sellerName}</strong> tashkilotining <strong>{document.buyerName}</strong> foydasiga <strong>{Math.abs(Number(meta.closingBalance)).toLocaleString('uz-UZ')} soʻm</strong> avans qoldigʻi mavjud.</>
                ) : (
                  <>Tomonlar oʻrtasida hech qanday qarzdorlik mavjud emas, oʻzaro hisob-kitob 0 soʻmni tashkil etadi.</>
                )}
              </p>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* DOCUMENT TYPE 2: ISHONCHNOMA (EMPOWERMENT FORM M-2)                 */}
        {/* =================================================================== */}
        {document.docType === 'EMPOWERMENT' && (
          <div className="space-y-8">
            <div className="text-center border-b border-border pb-6 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold uppercase tracking-wider mb-1">
                <FileSignature className="w-4 h-4 text-indigo-600" />
                Oʻzbekiston Respublikasi Standarti: Ishonchnoma (Shakl № M-2)
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-heading uppercase tracking-tight">
                {document.title}
              </h1>
              <p className="text-xs text-body">
                Berilgan sana: <span className="font-bold text-heading">{document.docDate}</span> • Amal qilish muddati:{' '}
                <span className="font-bold text-indigo-700">{meta.validUntil}</span> gacha
              </p>
            </div>

            {/* Organization & Attorney Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 rounded-2xl bg-muted/20 border border-border space-y-2">
                <span className="font-bold text-indigo-800 uppercase tracking-wider text-[11px] block border-b border-border pb-1.5">
                  Ishonchnoma Beruvchi Tashkilot:
                </span>
                <p className="text-sm font-bold text-heading">{document.sellerName}</p>
                <p className="font-mono text-body">STIR: <strong className="text-heading">{document.sellerTin}</strong></p>
                <p className="text-body">{document.sellerAddress}</p>
                <p className="font-mono text-body">H/r: <strong className="text-heading">{document.sellerBankAccount}</strong> • MFO: {document.sellerBankMfo}</p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-200 space-y-2">
                <span className="font-bold text-indigo-900 uppercase tracking-wider text-[11px] block border-b border-indigo-200 pb-1.5">
                  Ishonchli Shaxs (Vakil):
                </span>
                <p className="text-sm font-bold text-heading">{meta.attorneyName}</p>
                <p className="text-body">Lavozimi: <strong className="text-heading">{meta.attorneyPosition}</strong></p>
                <p className="font-mono text-body">Pasport: <strong className="text-heading">{meta.attorneyPassport}</strong></p>
                <p className="text-[11px] text-body">{meta.attorneyPassportIssuedBy}</p>
                {meta.attorneyPinfl && (
                  <p className="font-mono text-body">JShShIR (ПИНФЛ): <strong className="text-heading">{meta.attorneyPinfl}</strong></p>
                )}
              </div>
            </div>

            {/* Target Supplier Clause */}
            <div className="p-4 rounded-2xl bg-muted/20 border border-border text-xs leading-relaxed text-heading">
              Ushbu ishonchnoma <strong>{meta.targetSupplier || document.buyerName}</strong> tashkilotidan{' '}
              {document.contractNumber ? <strong>{document.contractNumber}</strong> : 'shartnoma'} boʻyicha quyida koʻrsatilgan tovar-moddiy boyliklarni qabul qilish huquqini beradi:
            </div>

            {/* Goods Table */}
            <div className="border border-border rounded-2xl overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/60 text-heading font-bold border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-border w-12 text-center">№</th>
                    <th className="py-2.5 px-3 border-r border-border">Moddiy boyliklar / Tovar nomi</th>
                    <th className="py-2.5 px-3 border-r border-border font-mono">MXIK (IKPU)</th>
                    <th className="py-2.5 px-3 border-r border-border text-center">Oʻlchov</th>
                    <th className="py-2.5 px-3 text-right">Miqdori</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {document.items.map((it: any, idx: number) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="py-2.5 px-3 border-r border-border text-center font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 border-r border-border font-medium text-heading">{it.name}</td>
                      <td className="py-2.5 px-3 border-r border-border font-mono text-body">{it.catalogCode}</td>
                      <td className="py-2.5 px-3 border-r border-border text-center">{it.packageName}</td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono text-heading">{it.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* DOCUMENT TYPE 3: CONTRACT (SHARTNOMA)                               */}
        {/* =================================================================== */}
        {document.docType === 'CONTRACT' && (
          <div className="space-y-8">
            <div className="text-center border-b border-border pb-6 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold uppercase tracking-wider mb-1">
                <Layers className="w-4 h-4 text-purple-600" />
                Elektron Tijorat Shartnomasi (Electronic Contract)
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-heading uppercase tracking-tight">
                {document.title}
              </h1>
              <div className="flex items-center justify-between text-xs text-body pt-2 max-w-xl mx-auto font-medium">
                <span>Toshkent shahri</span>
                <span>Sana: <strong className="text-heading">{document.docDate}</strong></span>
              </div>
            </div>

            {/* Preamble */}
            <div className="text-xs text-heading leading-relaxed text-justify space-y-3 border-b border-border pb-6">
              <p>
                Bir tomondan <strong>{document.sellerName}</strong> (keyingi oʻrinlarda &quot;Bajaruvchi/Sotuvchi&quot;) nomidan Nizom asosida ish yurituvchi bosh direktor{' '}
                <strong>{document.sellerDirector || 'Karimov N.A.'}</strong> va ikkinchi tomondan <strong>{document.buyerName}</strong> (keyingi oʻrinlarda &quot;Buyurtmachi/Xaridor&quot;) nomidan Nizom asosida ish yurituvchi rahbar{' '}
                <strong>{document.buyerDirector || 'Direktor'}</strong> quyidagilar toʻgʻrisida ushbu shartnomani tuzdilar:
              </p>
            </div>

            {/* Legal Articles */}
            <div className="space-y-6 text-xs text-heading leading-relaxed text-justify">
              {(document.legalArticles || []).map((art: any, idx: number) => (
                <div key={idx} className="space-y-1.5">
                  <h3 className="font-bold text-sm text-heading uppercase tracking-wide">
                    {art.number}. {art.title}
                  </h3>
                  <p className="text-body leading-relaxed">{art.text}</p>
                </div>
              ))}
            </div>

            {/* Contract Goods / Price Table */}
            {document.items && document.items.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="text-xs font-bold text-heading uppercase tracking-wider">
                  Shartnomaning 1-ilovasi: Tovar va Xizmatlar Roʻyxati
                </h4>
                <div className="border border-border rounded-2xl overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/60 text-heading font-bold border-b border-border">
                      <tr>
                        <th className="py-2 px-3 border-r border-border text-center w-10">№</th>
                        <th className="py-2 px-3 border-r border-border">Nomi</th>
                        <th className="py-2 px-3 border-r border-border font-mono">MXIK</th>
                        <th className="py-2 px-3 border-r border-border text-center">Birligi</th>
                        <th className="py-2 px-3 border-r border-border text-right">Miqdori</th>
                        <th className="py-2 px-3 border-r border-border text-right">Narxi (soʻm)</th>
                        <th className="py-2 px-3 text-right">Jami summa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {document.items.map((it: any, idx: number) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="py-2 px-3 border-r border-border text-center font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 border-r border-border font-medium">{it.name}</td>
                          <td className="py-2 px-3 border-r border-border font-mono text-body">{it.catalogCode}</td>
                          <td className="py-2 px-3 border-r border-border text-center">{it.packageName}</td>
                          <td className="py-2 px-3 border-r border-border text-right font-mono">{it.count}</td>
                          <td className="py-2 px-3 border-r border-border text-right font-mono">{Number(it.summa).toLocaleString('uz-UZ')}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{Number(it.totalSum).toLocaleString('uz-UZ')}</td>
                        </tr>
                      ))}
                      <tr className="bg-muted/50 font-bold border-t border-border">
                        <td colSpan={6} className="py-2.5 px-3 text-right uppercase">Jami shartnoma qiymati (QQS 12% bilan):</td>
                        <td className="py-2.5 px-3 text-right font-mono text-sm text-primary font-black">
                          {Number(document.totalSum).toLocaleString('uz-UZ')} soʻm
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* DOCUMENT TYPE 4: INVOICE / WAYBILL (HISOB-FAKTURA / TTN)            */}
        {/* =================================================================== */}
        {(document.docType === 'INVOICE' || document.docType === 'WAYBILL') && (
          <div className="space-y-8">
            <div className="text-center border-b border-border pb-6 space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Oʻzbekiston Respublikasi Davlat Soliq Standarti (E-Faktura)
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-heading uppercase tracking-tight">
                {document.title}
              </h1>
              <p className="text-xs text-body">
                Sana: <span className="font-semibold text-heading">{document.docDate}</span> • Shartnoma: <span className="font-semibold text-heading">{document.contractNumber}</span> ({document.contractDate} yil)
              </p>
            </div>

            {/* Parties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
                <div className="flex items-center justify-between border-b border-border/80 pb-2">
                  <span className="font-bold text-teal-800 uppercase tracking-wider text-[11px]">
                    Yetkazib beruvchi (Sotuvchi)
                  </span>
                  <Building2 className="w-4 h-4 text-teal-700" />
                </div>
                <div>
                  <span className="text-body font-medium block">Tashkilot:</span>
                  <span className="font-bold text-heading text-sm">{document.sellerName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                  <div>
                    <span className="text-body text-[11px] block font-sans">STIR (ИНН):</span>
                    <span className="font-bold text-heading">{document.sellerTin}</span>
                  </div>
                  {document.sellerPinfl && (
                    <div>
                      <span className="text-body text-[11px] block font-sans">JShShIR (ПИНФЛ):</span>
                      <span className="font-bold text-heading">{document.sellerPinfl}</span>
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-body block">Manzil:</span>
                  <span className="font-medium text-heading">{document.sellerAddress}</span>
                </div>
                {document.sellerBankAccount && (
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                    <div>
                      <span className="text-body text-[11px] block font-sans">Hisob raqami:</span>
                      <span className="font-bold text-heading">{document.sellerBankAccount}</span>
                    </div>
                    <div>
                      <span className="text-body text-[11px] block font-sans">MFO:</span>
                      <span className="font-bold text-heading">{document.sellerBankMfo}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
                <div className="flex items-center justify-between border-b border-border/80 pb-2">
                  <span className="font-bold text-teal-800 uppercase tracking-wider text-[11px]">
                    Qabul qiluvchi (Xaridor)
                  </span>
                  <Building2 className="w-4 h-4 text-teal-700" />
                </div>
                <div>
                  <span className="text-body font-medium block">Tashkilot:</span>
                  <span className="font-bold text-heading text-sm">{document.buyerName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                  <div>
                    <span className="text-body text-[11px] block font-sans">STIR (ИНН):</span>
                    <span className="font-bold text-heading">{document.buyerTin}</span>
                  </div>
                  {document.buyerPinfl && (
                    <div>
                      <span className="text-body text-[11px] block font-sans">JShShIR (ПИНФЛ):</span>
                      <span className="font-bold text-heading">{document.buyerPinfl}</span>
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-body block">Manzil:</span>
                  <span className="font-medium text-heading">{document.buyerAddress}</span>
                </div>
                {document.buyerBankAccount && (
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                    <div>
                      <span className="text-body text-[11px] block font-sans">Hisob raqami:</span>
                      <span className="font-bold text-heading">{document.buyerBankAccount}</span>
                    </div>
                    <div>
                      <span className="text-body text-[11px] block font-sans">MFO:</span>
                      <span className="font-bold text-heading">{document.buyerBankMfo}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-border">
                <thead>
                  <tr className="bg-muted/60 text-heading font-bold border-b border-border">
                    <th className="py-2.5 px-3 border-r border-border w-10 text-center">№</th>
                    <th className="py-2.5 px-3 border-r border-border">Mahsulot / Xizmat nomi</th>
                    <th className="py-2.5 px-3 border-r border-border font-mono">MXIK (IKPU)</th>
                    <th className="py-2.5 px-3 border-r border-border text-center">Oʻlchov</th>
                    <th className="py-2.5 px-3 border-r border-border text-right">Miqdori</th>
                    <th className="py-2.5 px-3 border-r border-border text-right">Narxi (soʻm)</th>
                    <th className="py-2.5 px-3 border-r border-border text-right">QQS stavkasi</th>
                    <th className="py-2.5 px-3 border-r border-border text-right">QQS summasi</th>
                    <th className="py-2.5 px-3 text-right">Jami summa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  {document.items.map((it: any, idx: number) => (
                    <tr key={idx} className="hover:bg-muted/20 font-sans">
                      <td className="py-2.5 px-3 border-r border-border text-center font-mono">{it.ordNo || idx + 1}</td>
                      <td className="py-2.5 px-3 border-r border-border font-medium text-heading">{it.name}</td>
                      <td className="py-2.5 px-3 border-r border-border font-mono text-body">{it.catalogCode}</td>
                      <td className="py-2.5 px-3 border-r border-border text-center">{it.packageName}</td>
                      <td className="py-2.5 px-3 border-r border-border text-right font-mono">{it.count}</td>
                      <td className="py-2.5 px-3 border-r border-border text-right font-mono">{Number(it.summa).toLocaleString('uz-UZ')}</td>
                      <td className="py-2.5 px-3 border-r border-border text-right font-mono">{it.vatRate}%</td>
                      <td className="py-2.5 px-3 border-r border-border text-right font-mono">{Number(it.vatSum).toLocaleString('uz-UZ')}</td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono text-heading">{Number(it.totalSum).toLocaleString('uz-UZ')}</td>
                    </tr>
                  ))}
                  <tr className="bg-muted/40 font-bold font-sans">
                    <td colSpan={7} className="py-2 px-3 text-right uppercase text-body">Jami QQS summasi:</td>
                    <td colSpan={2} className="py-2 px-3 text-right font-mono text-heading">{Number(document.vatTotal).toLocaleString('uz-UZ')} soʻm</td>
                  </tr>
                  <tr className="bg-muted/70 font-black text-sm font-sans border-t border-border">
                    <td colSpan={7} className="py-3 px-3 text-right uppercase text-heading">Toʻlov uchun jami summa:</td>
                    <td colSpan={2} className="py-3 px-3 text-right font-mono text-teal-800 font-bold text-base">
                      {Number(document.totalSum).toLocaleString('uz-UZ')} {document.currency}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* COMMON FOOTER: DUAL DIGITAL SIGNATURE STAMPS & QR SEAL              */}
        {/* =================================================================== */}
        <div className="pt-8 border-t-2 border-border/80 space-y-6">
          <div className="text-center font-bold text-xs uppercase tracking-wider text-body">
            Tomonlarning Masʼul Shaxslari va E-IMZO Elektron Raqamli Imzolari
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Sender Signature Stamp */}
            <div className="p-4 rounded-2xl bg-muted/20 border border-border text-center space-y-3">
              <div className="text-xs font-semibold text-heading">
                {document.sellerName}
              </div>
              <div className="flex justify-center">
                <EDigitalStamp
                  signature={document.senderSignature}
                  roleTitle={document.sellerDirector || document.senderSignature?.role || 'Yetkazib beruvchi / Sotuvchi'}
                  isSigned={!!document.senderSignature}
                />
              </div>
            </div>

            {/* Recipient Signature Stamp */}
            <div className="p-4 rounded-2xl bg-muted/20 border border-border text-center space-y-3">
              <div className="text-xs font-semibold text-heading">
                {document.buyerName}
              </div>
              <div className="flex justify-center">
                <EDigitalStamp
                  signature={document.recipientSignature}
                  roleTitle={document.buyerDirector || document.recipientSignature?.role || 'Qabul qiluvchi / Xaridor'}
                  isSigned={!!document.recipientSignature}
                />
              </div>
            </div>
          </div>

          {/* Document Verification Hash & QR Code */}
          <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-1.5 font-bold text-teal-900">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                <span>Qonuniy kuchga ega elektron hujjat (Oʻzbekiston Respublikasi &quot;Elektron raqamli imzo toʻgʻrisida&quot;gi Qonuni)</span>
              </div>
              <p className="text-body font-mono text-[11px]">
                Kanonik xesh: <span className="text-heading font-semibold">{document.canonicalHash}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-teal-200 shrink-0">
              <QrCode className="w-6 h-6 text-teal-800" />
              <div className="text-[10px] text-body text-left">
                <span className="font-bold text-heading block">QR Muhr</span>
                <span>Soliq / EDI tekshiruvi</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* E-IMZO Signing Modal */}
      {signingModalOpen && (
        <EimzoSignModal
          isOpen={signingModalOpen}
          onClose={() => setSigningModalOpen(false)}
          invoiceId={document.id}
          invoiceNumber={document.docNumber}
          customerName={document.buyerName}
          totalAmount={document.totalSum}
          onSuccess={() => {
            toast.success('Hujjat E-IMZO bilan imzolandi');
            fetchDocument();
          }}
        />
      )}
    </div>
  );
};

export default EDocumentViewer;
