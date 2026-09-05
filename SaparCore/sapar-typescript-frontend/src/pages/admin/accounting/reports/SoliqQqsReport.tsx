import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Download,
  Printer,
  ShieldCheck,
  Percent,
  CheckCircle2,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button, FormField } from '@components/ui';
import Constants from '@constants/api';

import { EimzoClient } from '../../../../services/EimzoClient';

export const SoliqQqsReport: React.FC = () => {
  const getToken = () => {
    if (typeof document !== 'undefined' && document.cookie) {
      const m = document.cookie.match(/(?:^|;\s*)authToken=([^;]*)/);
      if (m && m[1]) return decodeURIComponent(m[1]);
    }
    return localStorage.getItem('authToken') || localStorage.getItem('token') || '';
  };

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().substring(0, 10);
  const today = now.toISOString().substring(0, 10);

  const [from, setFrom] = useState(firstDay);
  const [to, setTo] = useState(today);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [isSubmittingSoliq, setIsSubmittingSoliq] = useState(false);
  const [soliqProtocol, setSoliqProtocol] = useState<any | null>(null);

  useEffect(() => {
    fetchReport();
  }, [from, to]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const curToken = getToken();
      const res = await axios.get(`${Constants.API_BASE_URL}/admin/reports/soliq-qqs`, {
        params: { from, to },
        headers: { Authorization: `Bearer ${curToken}` },
      });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(msg || 'QQS hisobotini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleSignAndSubmitSoliq = async () => {
    try {
      setIsSubmittingSoliq(true);
      toast.info('E-IMZO kaliti orqali soliq deklaratsiyasi imzolanmoqda...');
      
      const certs = await EimzoClient.listCertificates();
      const cert = certs[0];
      const payloadString = JSON.stringify(data);
      const signature = await EimzoClient.signPayload(cert, '123456', payloadString);

      const curToken = getToken();
      const res = await axios.post(
        `${Constants.API_BASE_URL}/admin/reports/soliq/submit`,
        {
          formCode: '10006_29',
          period: `${from} - ${to}`,
          payload: data,
          pkcs7Signature: signature,
          certInfo: {
            commonName: cert.CN,
            tin: cert.TIN,
            pinfl: cert.PINFL,
          },
        },
        { headers: { Authorization: `Bearer ${curToken}` } }
      );

      if (res.data.success) {
        setSoliqProtocol(res.data.data.protocol);
        toast.success(res.data.message || 'Soliq deklaratsiyasi muvaffaqiyatli topshirildi!');
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(msg || 'Soliq.uz ga yuborishda xatolik yuz berdi');
    } finally {
      setIsSubmittingSoliq(false);
    }
  };

  const handleExportJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Soliq_QQS_Deklaratsiya_${from}_${to}.json`;
    a.click();
    toast.success('Soliq QQS JSON fayli yuklab olindi');
  };

  const handlePrint = () => {
    window.print();
  };

  const summary = data?.summary || {};

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 no-print">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-teal-50 text-teal-700">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-heading">
              QQS (Qoʻshilgan Qiymat Soligʻi 12%) Oylik Hisob-Kitobi
            </h1>
            <p className="text-xs text-body">
              Davlat Soliq Qoʻmitasi (Soliq.uz) standarti boʻyicha shakllantirilgan rasmiy soliq deklaratsiyasi (Shakl kodi: 10006_29)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSignAndSubmitSoliq}
            disabled={isSubmittingSoliq || loading}
            leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-300" />}
          >
            {isSubmittingSoliq ? 'E-IMZO bilan yuborilmoqda...' : 'E-IMZO bilan Soliq.uz ga Yuborish'}
          </Button>
          <Button variant="white" size="sm" onClick={handleExportJson} leftIcon={<Download className="w-4 h-4" />}>
            Soliq JSON Eksport
          </Button>
          <Button variant="white" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
            Chop etish / PDF
          </Button>
        </div>
      </div>

      {/* Official Soliq Acceptance Protocol Banner */}
      {soliqProtocol && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-emerald-900">
                  Davlat Soliq Qoʻmitasi tomonidan qabul qilindi
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                  Protokol: {soliqProtocol.regNumber}
                </span>
              </div>
              <p className="text-xs text-emerald-700">
                Imzolovchi: {soliqProtocol.signer} (STIR: {soliqProtocol.tin}) • Vaqt: {new Date(soliqProtocol.submittedAt).toLocaleString('uz-UZ')}
              </p>
            </div>
          </div>
          <a
            href={soliqProtocol.soliqQrCodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 hover:bg-emerald-100 transition"
          >
            Soliq.uz da Tekshirish ↗
          </a>
        </div>
      )}

      {/* Filter Range */}
      <div className="bg-surface p-4 rounded-2xl border border-border flex flex-wrap items-center justify-between gap-4 no-print shadow-xs">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-heading uppercase tracking-wider">Hisobot Davri:</span>
        </div>
        <div className="flex items-center gap-3">
          <FormField
            type="date"
            label="Boshlanish"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="text-xs"
          />
          <FormField
            type="date"
            label="Tugash"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="text-xs"
          />
          <div className="pt-5">
            <Button size="sm" onClick={fetchReport} disabled={loading}>
              {loading ? 'Yuklanmoqda...' : 'Hisoblash'}
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs">
          <p className="text-xs font-medium text-body">Jami Realizatsiya Aylanmasi</p>
          <p className="text-xl font-bold text-heading mt-1 font-mono">
            {Number(summary.totalOutwardTurnover || 0).toLocaleString('uz-UZ')} soʻm
          </p>
          <span className="text-[10px] text-body mt-0.5 block">Sotuv hisob-fakturalari boʻyicha</span>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs">
          <p className="text-xs font-medium text-body">Hisoblangan QQS (12%)</p>
          <p className="text-xl font-bold text-teal-700 mt-1 font-mono">
            {Number(summary.calculatedOutputVat || 0).toLocaleString('uz-UZ')} soʻm
          </p>
          <span className="text-[10px] text-teal-600 mt-0.5 block">Chiquvchi QQS summasi</span>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs">
          <p className="text-xs font-medium text-body">Hisobga Olinadigan QQS (Kredit)</p>
          <p className="text-xl font-bold text-blue-700 mt-1 font-mono">
            {Number(summary.deductibleInputVat || 0).toLocaleString('uz-UZ')} soʻm
          </p>
          <span className="text-[10px] text-blue-600 mt-0.5 block">Xarid fakturalaridan chegiriladigan</span>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs bg-emerald-50/40 border-emerald-200">
          <p className="text-xs font-bold text-emerald-900">Byudjetga Toʻlanadigan QQS</p>
          <p className="text-xl font-black text-emerald-800 mt-1 font-mono">
            {Number(summary.netVatPayableToBudget || 0).toLocaleString('uz-UZ')} soʻm
          </p>
          <span className="text-[10px] text-emerald-700 mt-0.5 block">Sof toʻlov summasi</span>
        </div>
      </div>

      {/* Official Soliq Declaration Form Paper */}
      <div className="bg-surface border border-border shadow-md rounded-3xl p-8 sm:p-12 space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Soliq Official Form Header */}
        <div className="text-center border-b border-border pb-6 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            Oʻzbekiston Respublikasi Davlat Soliq Qoʻmitasi — Shakl kodi: 10006_29
          </div>
          <h2 className="text-xl font-black text-heading uppercase tracking-tight">
            Qoʻshilgan Qiymat Soligʻi Hisob-Kitobi
          </h2>
          <p className="text-xs text-body">
            Hisobot davri: <strong className="text-heading">{data?.period || `${from} — ${to}`}</strong> • Valyuta:{' '}
            <strong className="text-heading">UZS (soʻm)</strong>
          </p>
        </div>

        {/* Declaration Breakdown Table */}
        <div className="border border-border rounded-2xl overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/60 text-heading font-bold border-b border-border">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Satr</th>
                <th className="py-3 px-4">Koʻrsatkichlar nomi (Soliq moddalari)</th>
                <th className="py-3 px-4 text-right">Soliq solinadigan baza (soʻm)</th>
                <th className="py-3 px-4 text-right">Hisoblangan QQS summasi (soʻm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {(data?.soliqBoxes || []).map((box: { row: string; name: string; baseSum?: number; vatSum?: number }, idx: number) => (
                <tr key={idx} className="hover:bg-muted/20">
                  <td className="py-3 px-4 text-center font-bold text-heading">{box.row}</td>
                  <td className="py-3 px-4 font-sans font-medium text-heading">{box.name}</td>
                  <td className="py-3 px-4 text-right text-body">
                    {Number(box.baseSum || 0) > 0 ? Number(box.baseSum).toLocaleString('uz-UZ') : '-'}
                  </td>
                  <td className={`py-3 px-4 text-right font-bold ${Number(box.vatSum || 0) > 0 ? 'text-teal-800' : 'text-body'}`}>
                    {Number(box.vatSum || 0) > 0 ? Number(box.vatSum).toLocaleString('uz-UZ') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legal Disclaimer & Verification */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border text-xs text-body leading-relaxed flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Hisob-kitob SAPAR Bosh Kitobi (General Ledger) va EDO (Didox/Factura) orqali yuborilgan hisob-fakturalar asosida avtomatik shakllantirildi.
            </span>
          </div>
          <span className="font-mono font-bold text-heading shrink-0">
            Soliq.uz API Mos
          </span>
        </div>
      </div>
    </div>
  );
};

export default SoliqQqsReport;
