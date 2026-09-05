import React, { useEffect, useState } from 'react';
import {
  Coins,
  Calendar,
  Download,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button, FormField } from '@components/ui';
import Constants from '@constants/api';

export const SoliqAylanmaReport: React.FC = () => {
  const token = localStorage.getItem('token') || '';

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().substring(0, 10);
  const today = now.toISOString().substring(0, 10);

  const [from, setFrom] = useState(firstDay);
  const [to, setTo] = useState(today);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    fetchReport();
  }, [from, to]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${Constants.BASE_URL}/admin/reports/soliq-aylanma`, {
        params: { from, to },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Aylanma soliq hisobotini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleExportJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Soliq_Aylanma_Soliq_${from}_${to}.json`;
    a.click();
    toast.success('Soliq Aylanma Solig‘i JSON fayli yuklab olindi');
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
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-700">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-heading">
              Aylanmadan Olinadigan Soliq (4% Turnover Tax)
            </h1>
            <p className="text-xs text-body">
              Kichik biznes va soddalashtirilgan soliq rejimi uchun Soliq.uz oylik/choraklik deklaratsiyasi (Shakl kodi: 10104_18)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="white" size="sm" onClick={handleExportJson} leftIcon={<Download className="w-4 h-4" />}>
            Soliq JSON Eksport
          </Button>
          <Button variant="white" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
            Chop etish / PDF
          </Button>
        </div>
      </div>

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs">
          <p className="text-xs font-medium text-body">Jami Tushum (Realizatsiya)</p>
          <p className="text-xl font-bold text-heading mt-1 font-mono">
            {Number(summary.grossRevenue || 0).toLocaleString('uz-UZ')} soʻm
          </p>
          <span className="text-[10px] text-body mt-0.5 block">Kassa va bank tushumlari</span>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs">
          <p className="text-xs font-medium text-body">Soliq Stavkasi</p>
          <p className="text-xl font-bold text-amber-700 mt-1 font-mono">
            4.0%
          </p>
          <span className="text-[10px] text-amber-600 mt-0.5 block">Standart aylanma soliq stavkasi</span>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-border shadow-xs bg-amber-50/40 border-amber-200">
          <p className="text-xs font-bold text-amber-900">Byudjetga Toʻlanadigan Soliq</p>
          <p className="text-xl font-black text-amber-800 mt-1 font-mono">
            {Number(summary.netTaxPayableToBudget || 0).toLocaleString('uz-UZ')} soʻm
          </p>
          <span className="text-[10px] text-amber-700 mt-0.5 block">Hisoblangan soliq summasi</span>
        </div>
      </div>

      {/* Official Form Paper */}
      <div className="bg-surface border border-border shadow-md rounded-3xl p-8 sm:p-12 space-y-8 print:shadow-none print:border-none print:p-0">
        <div className="text-center border-b border-border pb-6 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            Oʻzbekiston Respublikasi Davlat Soliq Qoʻmitasi — Shakl kodi: 10104_18
          </div>
          <h2 className="text-xl font-black text-heading uppercase tracking-tight">
            Aylanmadan Olinadigan Soliq Hisob-Kitobi
          </h2>
          <p className="text-xs text-body">
            Hisobot davri: <strong className="text-heading">{data?.period || `${from} — ${to}`}</strong> • Valyuta:{' '}
            <strong className="text-heading">UZS (soʻm)</strong>
          </p>
        </div>

        <div className="border border-border rounded-2xl overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/60 text-heading font-bold border-b border-border">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Satr</th>
                <th className="py-3 px-4">Koʻrsatkichlar nomi</th>
                <th className="py-3 px-4 text-right">Summa (soʻm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {(data?.soliqBoxes || []).map((box: any, idx: number) => (
                <tr key={idx} className="hover:bg-muted/20">
                  <td className="py-3 px-4 text-center font-bold text-heading">{box.row}</td>
                  <td className="py-3 px-4 font-sans font-medium text-heading">{box.name}</td>
                  <td className="py-3 px-4 text-right font-bold text-heading">
                    {typeof box.sum === 'number' ? box.sum.toLocaleString('uz-UZ') : box.sum}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SoliqAylanmaReport;
