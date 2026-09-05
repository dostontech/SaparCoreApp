import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calculator,
  Receipt,
  CreditCard,
  Banknote,
  ArrowRight,
  TrendingUp,
  Store,
  UserCheck,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import DashboardSwitcher from '@components/admin/DashboardSwitcher';
import { useNavigate } from 'react-router-dom';

export const PosDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { format } = useCurrencyFormatter();
  const navigate = useNavigate();

  const stats = {
    todaySalesUzs: 38450000,
    todayOrdersCount: 142,
    activeCashiers: 3,
    avgReceiptUzs: 270774,
  };


  const paymentBreakdown = [
    { method: 'Uzcard / Humo (Karta)', amountUzs: 23070000, percent: 60, icon: <CreditCard size={16} className="text-blue-600" /> },
    { method: 'Naqd Pul (Kassa)', amountUzs: 11535000, percent: 30, icon: <Banknote size={16} className="text-emerald-600" /> },
    { method: 'Nasiya / Qarz (Kredit)', amountUzs: 3845000, percent: 10, icon: <Receipt size={16} className="text-amber-600" /> },
  ];

  const activeShifts = [
    { id: 1, cashier: 'Azizbek Toshmatov', register: 'Kassa №1 (Asosiy)', openedAt: '08:00', totalSalesUzs: 18200000, checks: 68 },
    { id: 2, cashier: 'Dilfuza Rahimova', register: 'Kassa №2 (Tezkor)', openedAt: '08:30', totalSalesUzs: 14150000, checks: 52 },
    { id: 3, cashier: 'Sardorbek Aliyev', register: 'Kassa №3 (Ombor)', openedAt: '09:00', totalSalesUzs: 6100000, checks: 22 },
  ];

  const topPosItems = [
    { id: 1, name: 'Sement M-500 (50 kg)', soldQty: 85, totalUzs: 5950000 },
    { id: 2, name: 'Gipsokarton Knauf 12.5mm', soldQty: 64, totalUzs: 5120000 },
    { id: 3, name: 'Shpatlevka Rotband Knauf 30kg', soldQty: 42, totalUzs: 3780000 },
    { id: 4, name: 'Akfa alyumin profil 6m', soldQty: 30, totalUzs: 4500000 },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('dashboard.posTitle', 'POS & Kassa Boshqaruv Paneli')}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
              <ShoppingCart size={13} />
              <span>Chakana & POS Kassa</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bugungi kassa tushumlari, cheklar soni, toʻlov usullari (Uzcard/Humo/Naqd) va faol smenalar nazorati
          </p>
        </div>

        <DashboardSwitcher />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bugungi Kassa Tushumi</span>
            <div className="text-2xl font-black text-slate-900">{format(stats.todaySalesUzs)}</div>
            <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <TrendingUp size={12} /> +18.4% kechagiga nisbatan
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
            <Calculator size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kunlik Cheklar</span>
            <div className="text-2xl font-black text-slate-900">{stats.todayOrdersCount} ta</div>
            <div className="text-[11px] text-slate-500 font-medium">Oʻrtacha chek: <strong className="text-slate-800">{format(stats.avgReceiptUzs)}</strong></div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <Receipt size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Karta Orqali Toʻlov</span>
            <div className="text-2xl font-black text-blue-700">60%</div>
            <div className="text-[11px] font-semibold text-blue-600">Uzcard & Humo terminallari</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <CreditCard size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faol Kassirlar</span>
            <div className="text-2xl font-black text-slate-900">{stats.activeCashiers} ta kassa</div>
            <div className="text-[11px] font-semibold text-teal-600">Smena ochiq holatda</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <UserCheck size={22} />
          </div>
        </div>
      </div>

      {/* Active Cashier Shifts & Payment Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Shifts Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Faol Kassa Smenalari (Shifts)</h3>
              <p className="text-xs text-slate-400">Bugungi navbatdagi kassirlar va tushumlar</p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/admin/pos/shifts')}
              variant="white"
              className="text-xs font-bold border-slate-200"
              rightIcon={<ArrowRight size={14} />}
            >
              Smenalar Jurnali
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Kassa / Kassir</th>
                  <th className="py-3 px-4">Ochilgan Vaqt</th>
                  <th className="py-3 px-4">Cheklar</th>
                  <th className="py-3 px-4">Tushum</th>
                  <th className="py-3 px-4 text-right">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {activeShifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{shift.cashier}</div>
                      <div className="text-[11px] text-slate-400">{shift.register}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{shift.openedAt}</td>
                    <td className="py-3.5 px-4 font-bold">{shift.checks} ta</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800">{format(shift.totalSalesUzs)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                        OCHIQ (Online)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods Breakdown & Quick POS launch */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Toʻlov Usullari Taqsimoti</h3>
            <div className="space-y-3">
              {paymentBreakdown.map((pm, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      {pm.icon}
                      <span>{pm.method}</span>
                    </div>
                    <span className="font-bold text-teal-700">{pm.percent}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Hajmi:</span>
                    <span className="font-mono font-bold text-slate-800">{format(pm.amountUzs)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top POS items */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-base">Eng Koʻp Sotilgan Tovarlar</h3>
            <div className="space-y-2">
              {topPosItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">{item.soldQty} dona sotildi</div>
                  </div>
                  <div className="font-mono font-bold text-teal-800">{format(item.totalUzs)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-teal-950 text-white shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <Store className="text-teal-400" size={18} />
              <span className="font-bold text-sm">Kassa Terminalini Ochish</span>
            </div>
            <p className="text-xs text-slate-300">
              Sensorli POS kassa orqali tezkor shtrix-kod skaneri va chek chop etish oynasiga oʻtish.
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/admin/pos')}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs w-full py-2.5 flex items-center justify-center gap-1.5"
            >
              <Store size={14} />
              <span>POS Terminaliga Kirish</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosDashboard;
