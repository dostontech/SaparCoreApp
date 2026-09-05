import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Chart from 'react-apexcharts';
import {
  Truck,
  Users,
  Calendar,
  ChevronDown,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowRightLeft,
  Sparkles,
  TrendingUp,
  Check,
  RefreshCw,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/DropdownMenu';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import Constants from '@constants/api';
import type { RootState } from '@store/index';

interface SalesDynamicsData {
  categories: string[];
  sales: number[];
  payments: number[];
  totalSales: number;
  totalPayments: number;
  netDifference: number;
}

const INTERVAL_OPTIONS = [
  { id: 'day', label: 'Kun boʻyicha', badge: 'Kunlik Dinamika', desc: 'Kunlik koʻrsatkichlar' },
  { id: 'week', label: 'Hafta boʻyicha', badge: 'Haftalik Dinamika', desc: 'Haftalik jamlangan tushum' },
  { id: 'month', label: 'Oy boʻyicha', badge: 'Oylik Dinamika', desc: 'Oylik jamlanma dinamika' },
];

const PERIOD_OPTIONS = [
  { id: '7d', label: 'Oxirgi 7 kun' },
  { id: '15d', label: 'Oxirgi 15 kun' },
  { id: '30d', label: 'Oxirgi 30 kun' },
  { id: '90d', label: 'Oxirgi 90 kun' },
  { id: '12m', label: 'Oxirgi 12 oy' },
  { id: 'this_year', label: 'Bu yil' },
];

function generateFallbackDynamics(period: string, interval: string): SalesDynamicsData {
  const uzMonths = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  const categories: string[] = [];
  const sales: number[] = [];
  const payments: number[] = [];

  let count = 30;
  if (period === '7d') count = 7;
  else if (period === '15d') count = 15;
  else if (period === '30d') count = 30;
  else if (period === '90d') count = interval === 'week' ? 13 : interval === 'month' ? 3 : 30;
  else if (period === '12m') count = 12;
  else if (period === 'this_year') count = new Date().getMonth() + 1;

  if (interval === 'month' || period === '12m' || period === 'this_year') {
    const now = new Date();
    const curMonth = now.getMonth();
    const monthsToShow = count > 12 ? 12 : count;
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const mIdx = (curMonth - i + 12) % 12;
      categories.push(uzMonths[mIdx]);
      const s = Math.round((280 + ((i * 37) % 190)) * 1000000);
      sales.push(s);
      payments.push(Math.round(s * (0.82 + ((i * 5) % 15) / 100)));
    }
  } else if (interval === 'week') {
    const weeksCount = count > 14 ? 12 : count;
    for (let i = 1; i <= weeksCount; i++) {
      categories.push(`${i}-hafta`);
      const s = Math.round((65 + ((i * 23) % 45)) * 1000000);
      sales.push(s);
      payments.push(Math.round(s * (0.8 + ((i * 7) % 16) / 100)));
    }
  } else {
    const daysToShow = count > 30 ? 30 : count;
    const now = new Date();
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      categories.push(`${d.getDate()}-${uzMonths[d.getMonth()]}`);
      const factor = (25 + ((i * 17) % 65));
      const s = Math.round(factor * 1250000);
      sales.push(s);
      payments.push(Math.round(s * (0.82 + ((i * 3) % 14) / 100)));
    }
  }

  const totalSales = sales.reduce((a, b) => a + b, 0);
  const totalPayments = payments.reduce((a, b) => a + b, 0);

  return {
    categories,
    sales,
    payments,
    totalSales,
    totalPayments,
    netDifference: totalSales - totalPayments,
  };
}

export const SaparDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { format } = useCurrencyFormatter();
  const { token } = useSelector((state: RootState) => state.auth);

  const [interval, setInterval] = useState<'day' | 'week' | 'month'>('day');
  const [period, setPeriod] = useState<'7d' | '15d' | '30d' | '90d' | '12m' | 'this_year'>('30d');
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [chartData, setChartData] = useState<SalesDynamicsData>(() => generateFallbackDynamics('30d', 'day'));

  const activeInterval = INTERVAL_OPTIONS.find((o) => o.id === interval) || INTERVAL_OPTIONS[0];
  const activePeriod = PERIOD_OPTIONS.find((o) => o.id === period) || PERIOD_OPTIONS[2];

  useEffect(() => {
    let isMounted = true;
    const fetchDynamics = async () => {
      setIsLoadingChart(true);
      try {
        const url = `${Constants.GET_SALES_DYNAMICS_URL}?interval=${interval}&period=${period}`;
        const res = await axios.get(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (isMounted && res.data?.data) {
          setChartData(res.data.data);
        }
      } catch {
        if (isMounted) {
          setChartData(generateFallbackDynamics(period, interval));
        }
      } finally {
        if (isMounted) setIsLoadingChart(false);
      }
    };
    fetchDynamics();
    return () => {
      isMounted = false;
    };
  }, [interval, period, token]);

  const apexOptions: ApexCharts.ApexOptions = useMemo(() => {
    return {
      chart: {
        type: 'area',
        fontFamily: 'Inter, system-ui, sans-serif',
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 350,
        },
      },
      colors: ['#028090', '#02C39A'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 95, 100],
        },
      },
      stroke: {
        curve: 'smooth',
        width: 2.5,
      },
      markers: {
        size: 0,
        hover: { size: 4 },
      },
      dataLabels: { enabled: false },
      grid: {
        borderColor: '#F1F5F9',
        strokeDashArray: 3,
        padding: { top: 10, right: 10, bottom: 0, left: 10 },
      },
      xaxis: {
        categories: chartData.categories,
        labels: {
          style: { colors: '#94A3B8', fontSize: '11px', fontWeight: 500 },
          rotate: 0,
          hideOverlappingLabels: true,
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => {
            if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)} mlrd`;
            if (val >= 1000000) return `${(val / 1000000).toFixed(0)} mln`;
            if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
            return `${val}`;
          },
          style: { colors: '#94A3B8', fontSize: '11px' },
        },
      },
      tooltip: {
        theme: 'light',
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => {
            return new Intl.NumberFormat('uz-UZ').format(val) + ' soʻm';
          },
        },
        style: { fontSize: '12px' },
      },
      legend: { show: false },
    };
  }, [chartData.categories]);

  const apexSeries = useMemo(() => [
    {
      name: 'Sotuvlar (Realizatsiya)',
      data: chartData.sales,
    },
    {
      name: 'Mijoz toʻlovlari (Kirim)',
      data: chartData.payments,
    },
  ], [chartData.sales, chartData.payments]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans text-slate-800 pb-16 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#0B2B33]">Bosh panel</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            OOO "RIZOBAY STROY" • Savdo, ombor va kassa koʻrsatkichlari
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin/pos')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#02C39A] hover:bg-[#02A683] text-[#0B2B33] font-bold text-xs shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>POS Kassa Ochish</span>
          </button>
        </div>
      </div>

      {/* 1. TOP 4 KPI CARDS WITH SAPAR BRAND PALETTE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* BUGUN (SAPAR Teal #028090) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs border-l-4 border-l-[#028090] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black text-[#028090] uppercase tracking-wider">BUGUN</p>
              <p className="text-xs text-slate-500 mt-0.5">0 ta sotuv</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#028090]/10 text-[#028090] flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[11px] text-slate-400">Sotuv summasi</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">Sotuv yoʻq</p>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">Pul kirimlari</p>
            <p className="text-xs font-bold text-[#028090] font-mono">+47 227 302 UZS</p>
            <p className="text-xs font-bold text-[#02C39A] font-mono">+2 000 USD</p>
          </div>
        </div>

        {/* KECHA (Amber #D97706) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black text-amber-600 uppercase tracking-wider">KECHA</p>
              <p className="text-xs text-slate-500 mt-0.5">0 ta sotuv</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[11px] text-slate-400">Sotuv summasi</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">Sotuv yoʻq</p>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">Pul kirimlari</p>
            <p className="text-xs font-semibold text-slate-500">Kirim yoʻq</p>
          </div>
        </div>

        {/* QARZDORLAR (Rose #E11D48) */}
        <div
          onClick={() => navigate('/admin/contacts')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs border-l-4 border-l-rose-500 flex flex-col justify-between cursor-pointer hover:border-slate-300 transition"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black text-rose-600 uppercase tracking-wider">QARZDORLAR</p>
              <p className="text-xs text-slate-500 mt-0.5">Bizga qarz</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[11px] text-slate-400">Mijozlar (10)</p>
            <p className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">457 496 405.82 UZS</p>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">Taʼminotchilar (0)</p>
            <p className="text-xs font-semibold text-slate-500">Qarz yoʻq</p>
          </div>
        </div>

        {/* KREDITORLAR (SAPAR Mint #02C39A) */}
        <div
          onClick={() => navigate('/admin/vendors')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs border-l-4 border-l-[#02C39A] flex flex-col justify-between cursor-pointer hover:border-slate-300 transition"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black text-[#028090] uppercase tracking-wider">KREDITORLAR</p>
              <p className="text-xs text-slate-500 mt-0.5">Biz qarz</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#02C39A]/15 text-[#028090] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[11px] text-slate-400">Mijozlar (12)</p>
            <p className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">30 011 339 446.49 UZS</p>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">Taʼminotchilar (0)</p>
            <p className="text-xs font-semibold text-slate-500">Qarz yoʻq</p>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE SECTION: Top Products Table (Left) & Kassadagi Pullar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 8 Cols: Eng ko'p sotilgan mahsulotlar */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-sm text-[#0B2B33]">Eng koʻp sotilgan mahsulotlar</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Oxirgi 30 kun</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
              >
                <span>Miqdori boʻyicha</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#F0FBF8] text-[11px] font-bold text-[#0B2B33] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Mahsulot</th>
                  <th className="px-4 py-3">Mahsulot kategoriyasi</th>
                  <th className="px-4 py-3 text-center">Miqdor</th>
                  <th className="px-4 py-3 text-right">Summa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-[#028090]/5 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900">Armatura 12mm A500C (Bekobod)</td>
                  <td className="px-4 py-3 text-slate-500">Metall Prokat</td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-[#028090]">14 200 kg</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">soʻm139,160,000</td>
                </tr>
                <tr className="hover:bg-[#028090]/5 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900">Akfa Emulsiya Fasid Boʻyoq 20kg</td>
                  <td className="px-4 py-3 text-slate-500">Boʻyoq va Qurilish Kimyosi</td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-[#028090]">120 dona</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">soʻm33,000,000</td>
                </tr>
                <tr className="hover:bg-[#028090]/5 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900">Sement M-500 (Bekobod) 50kg</td>
                  <td className="px-4 py-3 text-slate-500">Qurilish Materiallari</td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-[#028090]">450 qop</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">soʻm30,600,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 Cols: Kassadagi Pullar */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#0B2B33]">Kassadagi pullar</h3>
            <button
              type="button"
              onClick={() => navigate('/admin/pos/cashiers')}
              className="text-xs text-[#028090] font-bold hover:underline"
            >
              Barchasi →
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Naqd pul */}
            <div className="p-2.5 rounded-xl border border-slate-100 bg-[#F0FBF8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#028090]/15 text-[#028090] flex items-center justify-center font-bold">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Naqd pul</p>
                  <p className="font-mono text-[11px] text-slate-900 font-semibold">9 335 556.065 UZS</p>
                </div>
              </div>
              <div className="text-right font-mono text-[11px]">
                <p className="text-[#028090] font-bold">8 100 USD</p>
                <p className="text-slate-400">1 000 RUB</p>
              </div>
            </div>

            {/* Pul o'tkazmasi */}
            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-200/80 text-slate-600 flex items-center justify-center font-bold">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Pul oʻtkazmasi</p>
                  <p className="font-mono text-[11px] text-slate-500">0 UZS</p>
                </div>
              </div>
              <div className="text-right font-mono text-[11px] text-slate-400">
                <p>0 USD</p>
              </div>
            </div>

            {/* Clik */}
            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Click / Payme (QR)</p>
                  <p className="font-mono text-[11px] text-slate-900 font-semibold">42 063 566.89 UZS</p>
                </div>
              </div>
              <div className="text-right font-mono text-[11px] text-slate-400">
                <p>0 USD</p>
              </div>
            </div>

            {/* Terminal */}
            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Terminal (Uzcard/Humo)</p>
                  <p className="font-mono text-[11px] text-slate-900 font-semibold">766 960 761.32 UZS</p>
                </div>
              </div>
              <div className="text-right font-mono text-[11px] text-slate-400">
                <p>0 USD</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: Sotuv va mijoz to'lovlari (SAPAR Dynamic Area Chart) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-sm text-[#0B2B33]">Sotuv va mijoz toʻlovlari</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#02C39A]/20 text-[#028090]">
              {activeInterval.badge}
            </span>
            {isLoadingChart && (
              <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Interval Dropdown (Kun bo'yicha / Hafta bo'yicha / Oy bo'yicha) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs"
                >
                  <span>{activeInterval.label}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white p-1 rounded-xl shadow-lg border border-slate-200 text-xs">
                {INTERVAL_OPTIONS.map((opt) => {
                  const isSelected = opt.id === interval;
                  return (
                    <DropdownMenuItem
                      key={opt.id}
                      onClick={() => setInterval(opt.id as 'day' | 'week' | 'month')}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition ${
                        isSelected ? 'bg-[#028090]/10 text-[#028090] font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <p>{opt.label}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{opt.desc}</p>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#028090]" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 2. Period Dropdown (Oxirgi 7 kun, 15 kun, 30 kun, 90 kun, 12 oy, Bu yil) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#028090]" />
                  <span>{activePeriod.label}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 bg-white p-1 rounded-xl shadow-lg border border-slate-200 text-xs">
                {PERIOD_OPTIONS.map((opt) => {
                  const isSelected = opt.id === period;
                  return (
                    <DropdownMenuItem
                      key={opt.id}
                      onClick={() => setPeriod(opt.id as typeof period)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition ${
                        isSelected ? 'bg-[#028090]/10 text-[#028090] font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#028090]" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Dynamic Summary Cards above chart */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <div className="p-3 rounded-xl bg-[#F0FBF8] border border-[#028090]/15 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#028090]" />
                <span className="text-[11px] font-semibold text-slate-600">Jami Sotuvlar</span>
              </div>
              <p className="text-base font-black text-slate-900 font-mono mt-0.5">
                {new Intl.NumberFormat('uz-UZ').format(chartData.totalSales)} soʻm
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#028090]" />
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#02C39A]" />
                <span className="text-[11px] font-semibold text-slate-600">Mijoz Toʻlovlari</span>
              </div>
              <p className="text-base font-black text-emerald-800 font-mono mt-0.5">
                {new Intl.NumberFormat('uz-UZ').format(chartData.totalPayments)} soʻm
              </p>
            </div>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[11px] font-semibold text-slate-600">Qoldiq Farq (Qarz)</span>
              </div>
              <p className="text-base font-black text-amber-900 font-mono mt-0.5">
                {chartData.netDifference >= 0 ? '+' : ''}
                {new Intl.NumberFormat('uz-UZ').format(chartData.netDifference)} soʻm
              </p>
            </div>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
        </div>

        {/* Real Interactive ApexChart */}
        <div className="pt-2">
          <Chart
            options={apexOptions}
            series={apexSeries}
            type="area"
            height={260}
          />
        </div>
      </div>
    </div>
  );
};

export default SaparDashboardPage;
