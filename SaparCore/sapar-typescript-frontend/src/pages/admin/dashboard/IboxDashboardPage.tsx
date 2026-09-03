import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';

export const SaparDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { format } = useCurrencyFormatter();

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

      {/* 3. BOTTOM SECTION: Sotuv va mijoz to'lovlari (SAPAR Teal-Mint Gradient Wave) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-[#0B2B33]">Sotuv va mijoz toʻlovlari</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#02C39A]/20 text-[#028090]">
              Kunlik Dinamika
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border border-slate-200 text-slate-600 bg-white"
            >
              <span>Kun boʻyicha</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border border-slate-200 text-slate-600 bg-white"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Oxirgi 30 kun</span>
            </button>
          </div>
        </div>

        {/* Dynamic Wave Graph Styled in SAPAR Teal/Mint */}
        <div className="h-44 flex items-end justify-between gap-1 pt-6 px-2">
          {[20, 35, 10, 5, 80, 15, 30, 45, 95, 60, 20, 10, 40, 70, 85, 30, 50, 65, 40, 90, 30, 45, 60, 25, 35, 75, 50, 40, 60, 80].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div
                style={{ height: `${h}%` }}
                className="w-full bg-gradient-to-t from-[#028090] to-[#02C39A] group-hover:from-[#026875] group-hover:to-[#028090] rounded-t transition-all cursor-pointer shadow-2xs"
                title={`Kun ${i + 1}: ${(h * 4.8).toFixed(1)}M soʻm savdo`}
              />
              <span className="text-[8px] text-slate-400 font-mono">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SaparDashboardPage;
