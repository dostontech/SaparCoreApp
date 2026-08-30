import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Download,
  Percent,
  Users,
  Coins,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { PageHeader } from '@/context/PageHeaderContext';
import { Button, FormField } from '@components/ui';
import Constants from '@constants/api';

export const TaxReturns: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().substring(0, 10);
  const today = now.toISOString().substring(0, 10);

  const [from, setFrom] = useState(firstDay);
  const [to, setTo] = useState(today);
  const [loading, setLoading] = useState(false);
  const [qqsData, setQqsData] = useState<any | null>(null);
  const [jshodsData, setJshodsData] = useState<any | null>(null);
  const [aylanmaData, setAylanmaData] = useState<any | null>(null);

  useEffect(() => {
    fetchTaxReturns();
  }, [from, to]);

  const fetchTaxReturns = async () => {
    setLoading(true);
    try {
      const [qqsRes, jshodsRes, aylanmaRes] = await Promise.all([
        axios.get(`${Constants.BASE_URL}/admin/reports/soliq-qqs`, {
          params: { from, to },
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { success: false } })),
        axios.get(`${Constants.BASE_URL}/admin/reports/soliq-jshods`, {
          params: { from, to },
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { success: false } })),
        axios.get(`${Constants.BASE_URL}/admin/reports/soliq-aylanma`, {
          params: { from, to },
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { success: false } })),
      ]);

      if (qqsRes.data?.success) setQqsData(qqsRes.data.data);
      if (jshodsRes.data?.success) setJshodsData(jshodsRes.data.data);
      if (aylanmaRes.data?.success) setAylanmaData(aylanmaRes.data.data);
    } catch (err) {
      console.error('Error fetching tax returns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJson = (data: any, title: string) => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}_${from}_${to}.json`;
    a.click();
    toast.success(`${title} Soliq JSON fayli yuklab olindi`);
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      <PageHeader
        title="Oʻzbekiston Soliq Deklaratsiyalari va Hisobotlari"
      />

      {/* Date Range Selector */}
      <div className="bg-surface p-4 rounded-2xl border border-border flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <span className="text-xs font-bold text-heading uppercase tracking-wider block">Hisobot Davri</span>
            <span className="text-[11px] text-body">Barcha soliq deklaratsiyalari uchun oraliqni tanlang</span>
          </div>
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
            <Button size="sm" onClick={fetchTaxReturns} disabled={loading}>
              {loading ? 'Yuklanmoqda...' : 'Yangilash'}
            </Button>
          </div>
        </div>
      </div>

      {/* 3 Main Soliq Declaration Hub Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: QQS (VAT 12%) */}
        <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:shadow-md transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-teal-50 text-teal-700">
                <Percent className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-100/70 text-teal-900">
                Shakl 10006_29
              </span>
            </div>
            <h3 className="text-base font-bold text-heading">
              QQS (Qoʻshilgan Qiymat Soligʻi 12%)
            </h3>
            <p className="text-xs text-body leading-relaxed">
              Sotuv aylanmasi, xarid fakturalari boʻyicha QQS chegirilmasi (kredit) va byudjetga toʻlanadigan sof summa.
            </p>

            {qqsData && (
              <div className="bg-muted/30 p-3 rounded-xl space-y-1 font-mono text-xs">
                <div className="flex justify-between text-body">
                  <span>Chiquvchi QQS:</span>
                  <span className="font-bold text-heading">
                    {Number(qqsData.summary?.calculatedOutputVat || 0).toLocaleString('uz-UZ')} soʻm
                  </span>
                </div>
                <div className="flex justify-between text-body">
                  <span>Hisobga olingan QQS:</span>
                  <span className="font-bold text-blue-700">
                    {Number(qqsData.summary?.deductibleInputVat || 0).toLocaleString('uz-UZ')} soʻm
                  </span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold border-t border-border/60 pt-1">
                  <span>Byudjetga toʻlov:</span>
                  <span>{Number(qqsData.summary?.netVatPayableToBudget || 0).toLocaleString('uz-UZ')} soʻm</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => navigate('/accounting/reports/soliq-qqs')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              QQS Hisobotini Ochish
            </Button>
            <Button
              variant="white"
              size="sm"
              className="w-full"
              onClick={() => handleExportJson(qqsData, 'Soliq_QQS')}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Soliq JSON Yuklash
            </Button>
          </div>
        </div>

        {/* Card 2: JShODS & Ijtimoiy Soliq */}
        <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:shadow-md transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-700">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-100/70 text-indigo-900">
                Shakl 11101_14
              </span>
            </div>
            <h3 className="text-base font-bold text-heading">
              JShODS va Ijtimoiy Soliq
            </h3>
            <p className="text-xs text-body leading-relaxed">
              Ish haqi fondi (MHTF), jismoniy shaxslar daromad soligʻi (12%), korxona ijtimoiy soligʻi (12%) va INPS (0.1%).
            </p>

            {jshodsData && (
              <div className="bg-muted/30 p-3 rounded-xl space-y-1 font-mono text-xs">
                <div className="flex justify-between text-body">
                  <span>MHTF (Ish haqi):</span>
                  <span className="font-bold text-heading">
                    {Number(jshodsData.summary?.grossPayrollFund || 0).toLocaleString('uz-UZ')} soʻm
                  </span>
                </div>
                <div className="flex justify-between text-body">
                  <span>JShODS (12%):</span>
                  <span className="font-bold text-indigo-700">
                    {Number(jshodsData.summary?.incomeTaxSum || 0).toLocaleString('uz-UZ')} soʻm
                  </span>
                </div>
                <div className="flex justify-between text-indigo-900 font-bold border-t border-border/60 pt-1">
                  <span>Byudjetga jami:</span>
                  <span>{Number(jshodsData.summary?.totalTaxesPayableToBudget || 0).toLocaleString('uz-UZ')} soʻm</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => navigate('/accounting/reports/soliq-jshods')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              JShODS Hisobotini Ochish
            </Button>
            <Button
              variant="white"
              size="sm"
              className="w-full"
              onClick={() => handleExportJson(jshodsData, 'Soliq_JShODS')}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Soliq JSON Yuklash
            </Button>
          </div>
        </div>

        {/* Card 3: Aylanma Soliq (4%) */}
        <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:shadow-md transition">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-700">
                <Coins className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100/70 text-amber-900">
                Shakl 10104_18
              </span>
            </div>
            <h3 className="text-base font-bold text-heading">
              Aylanmadan Olinadigan Soliq (4%)
            </h3>
            <p className="text-xs text-body leading-relaxed">
              Kichik korxonalar va soddalashtirilgan tartibdagi tadbirkorlik subyektlari uchun 4% li yagona soliq hisob-kitobi.
            </p>

            {aylanmaData && (
              <div className="bg-muted/30 p-3 rounded-xl space-y-1 font-mono text-xs">
                <div className="flex justify-between text-body">
                  <span>Jami Tushum:</span>
                  <span className="font-bold text-heading">
                    {Number(aylanmaData.summary?.grossRevenue || 0).toLocaleString('uz-UZ')} soʻm
                  </span>
                </div>
                <div className="flex justify-between text-body">
                  <span>Stavka:</span>
                  <span className="font-bold text-amber-700">4.0%</span>
                </div>
                <div className="flex justify-between text-amber-900 font-bold border-t border-border/60 pt-1">
                  <span>Toʻlanadigan soliq:</span>
                  <span>{Number(aylanmaData.summary?.netTaxPayableToBudget || 0).toLocaleString('uz-UZ')} soʻm</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => navigate('/accounting/reports/soliq-aylanma')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Aylanma Soliqni Ochish
            </Button>
            <Button
              variant="white"
              size="sm"
              className="w-full"
              onClick={() => handleExportJson(aylanmaData, 'Soliq_Aylanma_Soliq')}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Soliq JSON Yuklash
            </Button>
          </div>
        </div>

      </div>

      {/* Information Banner */}
      <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 text-xs text-teal-950 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0" />
          <span>
            Barcha hisobotlar Oʻzbekiston Respublikasi Soliq Kodeksi va Davlat Soliq Qoʻmitasi (Soliq.uz) elektron deklaratsiya formatlariga 100% muvofiq shakllantiriladi.
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaxReturns;
