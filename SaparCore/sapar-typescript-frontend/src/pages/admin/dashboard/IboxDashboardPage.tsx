import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Truck,
  Users,
  Calendar,
  ChevronDown,
  Inbox,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
} from 'lucide-react';
import Constants from '@constants/api';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';

export const IboxDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const { format } = useCurrencyFormatter();

  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans text-slate-800 pb-16 animate-fade-in">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900">Bosh panel</h1>
      </div>

      {/* 1. TOP 4 METRIC CARDS (Exact match to ibox_01_dashboard.png) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* BUGUN */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs border-l-4 border-l-blue-600 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black text-blue-600 uppercase tracking-wider">BUGUN</p>
              <p className="text-xs text-slate-500 mt-0.5">0 ta sotuv</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[11px] text-slate-400">Sotuv summasi</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">Sotuv yoʻq</p>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">Pul kirimlari</p>
            <p className="text-xs font-bold text-emerald-600 font-mono">+47 227 302 UZS</p>
            <p className="text-xs font-bold text-emerald-600 font-mono">+2 000 USD</p>
          </div>
        </div>

        {/* KECHA */}
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

        {/* QARZDORLAR (Debitorlar) */}
        <div
          onClick={() => navigate('/admin/contacts')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs border-l-4 border-l-red-500 flex flex-col justify-between cursor-pointer hover:border-slate-300 transition"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black text-red-600 uppercase tracking-wider">QARZDORLAR</p>
              <p className="text-xs text-slate-500 mt-0.5">Bizga qarz</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
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

        {/* KREDITORLAR */}
        <div
          onClick={() => navigate('/admin/vendors')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs border-l-4 border-l-emerald-500 flex flex-col justify-between cursor-pointer hover:border-slate-300 transition"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black text-emerald-600 uppercase tracking-wider">KREDITORLAR</p>
              <p className="text-xs text-slate-500 mt-0.5">Biz qarz</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
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
            <h3 className="font-bold text-sm text-slate-900">Eng koʻp sotilgan mahsulotlar</h3>
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
              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Mahsulot</th>
                  <th className="px-4 py-3">Mahsulot kategoriyasi</th>
                  <th className="px-4 py-3 text-center">Miqdor</th>
                  <th className="px-4 py-3 text-right">Summa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-900">Armatura 12mm A500C (Bekobod)</td>
                  <td className="px-4 py-3 text-slate-500">Metall Prokat</td>
                  <td className="px-4 py-3 text-center font-mono font-bold">14 200 kg</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">soʻm139,160,000</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-900">Akfa Emulsiya Fasid Boʻyoq 20kg</td>
                  <td className="px-4 py-3 text-slate-500">Boʻyoq va Qurilish Kimyosi</td>
                  <td className="px-4 py-3 text-center font-mono font-bold">120 dona</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">soʻm33,000,000</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-900">Sement M-500 (Bekobod) 50kg</td>
                  <td className="px-4 py-3 text-slate-500">Qurilish Materiallari</td>
                  <td className="px-4 py-3 text-center font-mono font-bold">450 qop</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">soʻm30,600,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 Cols: Kassadagi Pullar (Matches ibox_01_dashboard.png exactly) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Kassadagi pullar</h3>
            <button
              type="button"
              onClick={() => navigate('/admin/pos/cashiers')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Barchasi →
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Naqd pul */}
            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-200/80 text-slate-600 flex items-center justify-center font-bold">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Naqd pul</p>
                  <p className="font-mono text-[11px] text-slate-900 font-semibold">9 335 556.065 UZS</p>
                </div>
              </div>
              <div className="text-right font-mono text-[11px]">
                <p className="text-emerald-700 font-bold">8 100 USD</p>
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
                <div className="w-8 h-8 rounded-lg bg-slate-200/80 text-slate-600 flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Clik (QR toʻlov)</p>
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
                <div className="w-8 h-8 rounded-lg bg-slate-200/80 text-slate-600 flex items-center justify-center font-bold">
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

      {/* 3. BOTTOM SECTION: Sotuv va mijoz to'lovlari Chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="font-bold text-sm text-slate-900">Sotuv va mijoz toʻlovlari</h3>
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

        {/* Dynamic Wave Graph Simulation */}
        <div className="h-44 flex items-end justify-between gap-1 pt-6 px-2">
          {[20, 35, 10, 5, 80, 15, 30, 45, 95, 60, 20, 10, 40, 70, 85, 30, 50, 65, 40, 90, 30, 45, 60, 25, 35, 75, 50, 40, 60, 80].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div
                style={{ height: `${h}%` }}
                className="w-full bg-red-400/80 hover:bg-red-500 rounded-t transition-all cursor-pointer"
                title={`Kun ${i + 1}: ${h * 5}M soʻm savdo`}
              />
              <span className="text-[8px] text-slate-400 font-mono">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IboxDashboardPage;
