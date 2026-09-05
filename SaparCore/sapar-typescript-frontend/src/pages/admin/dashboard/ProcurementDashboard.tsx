import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  Truck,
  Building2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import DashboardSwitcher from '@components/admin/DashboardSwitcher';
import { useNavigate } from 'react-router-dom';

export const ProcurementDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { format } = useCurrencyFormatter();
  const navigate = useNavigate();

  const stats = {
    totalSpendUzs: 385000000,
    totalOrdersCount: 42,
    pendingDeliveriesCount: 6,
    accountsPayableUzs: 95000000,
  };


  const topVendors = [
    { name: 'KNAUF GIPS BUXORO XK', category: 'Gipsokarton & Quruq qorishmalar', spendUzs: 145000000, orders: 12 },
    { name: 'TOSHKENT METALLURGIYA ZAVODI MCHJ', category: 'Armatura & Tunuka', spendUzs: 120000000, orders: 8 },
    { name: 'BEKOBOD SEMENT AJ', category: 'Sement M-500', spendUzs: 85000000, orders: 14 },
    { name: 'AKFA BUILDING MATERIALS', category: 'Profil & Boʻyoqlar', spendUzs: 35000000, orders: 8 },
  ];

  const pendingPurchases = [
    { id: 1, poNo: 'PO-2026-0018', vendor: 'KNAUF GIPS BUXORO', items: 'Gipsokarton 12.5mm (800 dona)', expected: 'Bugun, 15:00', amountUzs: 48000000 },
    { id: 2, poNo: 'PO-2026-0017', vendor: 'BEKOBOD SEMENT', items: 'Sement M-500 (20 tonna)', expected: 'Ertaga, 10:00', amountUzs: 24000000 },
    { id: 3, poNo: 'PO-2026-0016', vendor: 'TOSHKENT METALL BAZA', items: 'Armatura 14mm A500 (5 tonna)', expected: '26-Avgust', amountUzs: 42500000 },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('dashboard.procurementTitle', 'Xaridlar & Taʼminot Boshqaruv Paneli')}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <ShoppingBag size={13} />
              <span>Xaridlar & Taʼminotchilar</span>
            </span>

          </div>
          <p className="text-xs text-slate-500 mt-1">
            Xarid buyurtmalari, yetkazib beruvchilar bilan hisob-kitob (Kreditorlik), kutilayotgan yuklar va xarajatlar
          </p>
        </div>

        <DashboardSwitcher />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Oylik Xaridlar Hajmi</span>
            <div className="text-lg font-black text-slate-900">{format(stats.totalSpendUzs)}</div>
            <div className="text-[11px] font-semibold text-purple-600">42 ta xarid hujjati</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
            <ShoppingBag size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Yetkazilishi Kutilayotgan</span>
            <div className="text-2xl font-black text-amber-600">{stats.pendingDeliveriesCount} ta yuk</div>
            <div className="text-[11px] text-slate-500 font-medium">Yoʻldagi tovarlar</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <Truck size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kreditorlik Qarzi</span>
            <div className="text-lg font-black text-rose-600">{format(stats.accountsPayableUzs)}</div>
            <div className="text-[11px] text-slate-500 font-medium">Yetkazib beruvchilarga qarz</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taʼminotchilar Soni</span>
            <div className="text-2xl font-black text-slate-900">24 ta zavod</div>
            <div className="text-[11px] font-semibold text-emerald-600">Rasmiy shartnoma bilan</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
            <Building2 size={22} />
          </div>
        </div>
      </div>

      {/* Main Procurement Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Purchases Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Yoʻldagi Yuklar & Xarid Buyurtmalari</h3>
              <p className="text-xs text-slate-400">Omborga qabul qilinishi kutilayotgan partiyalar</p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/admin/purchases')}
              variant="white"
              className="text-xs font-bold border-slate-200"
              rightIcon={<ArrowRight size={14} />}
            >
              Xaridlar Jurnali
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Buyurtma №</th>
                  <th className="py-3 px-4">Yetkazib Beruvchi</th>
                  <th className="py-3 px-4">Tovar Tarkibi</th>
                  <th className="py-3 px-4">Kutilayotgan Vaqt</th>
                  <th className="py-3 px-4 text-right">Summa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {pendingPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.poNo}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{p.vendor}</td>
                    <td className="py-3.5 px-4 text-slate-600">{p.items}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-700">{p.expected}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-right">{format(p.amountUzs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Vendors */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Asosiy Taʼminotchi Zavodlar</h3>
            <div className="space-y-3">
              {topVendors.map((v, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{v.name}</span>
                    <span className="font-mono font-bold text-purple-800">{format(v.spendUzs)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{v.category}</span>
                    <span className="font-bold text-slate-700">{v.orders} ta xarid</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-purple-950 text-white shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-purple-400" size={18} />
              <span className="font-bold text-sm">Yangi Xarid Buyurtmasi</span>
            </div>
            <p className="text-xs text-slate-300">
              Taʼminotchiga rasmiy xarid buyurtmasini (Purchase Order) shakllantirish va omborga yuklash.
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/admin/purchases/new')}
              className="bg-purple-400 hover:bg-purple-300 text-slate-950 font-black text-xs w-full py-2.5"
            >
              + Xarid Buyurtmasi Ochish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcurementDashboard;
