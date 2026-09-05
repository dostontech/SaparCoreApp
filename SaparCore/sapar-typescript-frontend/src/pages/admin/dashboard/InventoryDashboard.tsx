import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Package,
  AlertTriangle,
  Boxes,
  TrendingDown,
  Warehouse,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import DashboardSwitcher from '@components/admin/DashboardSwitcher';
import { useNavigate } from 'react-router-dom';

export const InventoryDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { format } = useCurrencyFormatter();
  const navigate = useNavigate();

  const stats = {
    totalProducts: 1420,
    totalValuationUzs: 845000000,
    lowStockCount: 14,
    outOfStockCount: 3,
  };


  const warehouses = [
    { name: 'Asosiy Markaziy Ombor (Toshkent)', capacity: 78, itemsCount: 950, valueUzs: 610000000 },
    { name: 'Sergeli Qurilish Boʻlimi Ombori', capacity: 62, itemsCount: 340, valueUzs: 185000000 },
    { name: 'Chilonzor Chakana Doʻkoni Ombori', capacity: 45, itemsCount: 130, valueUzs: 50000000 },
  ];

  const lowStockItems = [
    { id: 1, name: 'Sement M-500 (50 kg qop)', sku: 'CEM-500-UZ', qty: 4, minQty: 50, unit: 'qop', status: 'CRITICAL' },
    { id: 2, name: 'Gipsokarton Knauf 12.5mm', sku: 'KNAUF-125', qty: 8, minQty: 40, unit: 'dona', status: 'LOW' },
    { id: 3, name: 'Armatura 12mm A500C (Rossiya)', sku: 'ARM-12-RUS', qty: 0.5, minQty: 5, unit: 'tonna', status: 'CRITICAL' },
    { id: 4, name: 'Emulsiya boʻyoq Akfa Decor (20 kg)', sku: 'AKFA-DEC-20', qty: 6, minQty: 25, unit: 'chelak', status: 'LOW' },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('dashboard.inventoryTitle', 'Ombor & Tovar Boshqaruv Paneli')}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <Package size={13} />
              <span>FIFO Tannarx & Sklad</span>
            </span>

          </div>
          <p className="text-xs text-slate-500 mt-1">
            Haqiqiy vaqtdagi tovar qoldiqlari, FIFO tannarx baholash, kam qolgan tovarlar va omborlararo koʻchirish
          </p>
        </div>

        <DashboardSwitcher />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jami Tovar Turlari</span>
            <div className="text-2xl font-black text-slate-900">{stats.totalProducts} ta SKU</div>
            <div className="text-[11px] font-semibold text-teal-600">MXIK va Shtrix-kodli</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
            <Package size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ombordagi Jami Qiymat</span>
            <div className="text-lg font-black text-slate-900">{format(stats.totalValuationUzs)}</div>
            <div className="text-[11px] font-semibold text-emerald-600">FIFO tannarx boʻyicha</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <Boxes size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kam Qolgan Tovarlar</span>
            <div className="text-2xl font-black text-amber-600">{stats.lowStockCount} ta</div>
            <div className="text-[11px] text-amber-700 font-medium">Buyurtma berish tavsiya etiladi</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tugagan Tovarlar</span>
            <div className="text-2xl font-black text-rose-600">{stats.outOfStockCount} ta</div>
            <div className="text-[11px] text-rose-600 font-medium">Zudlik bilan toʻldirish kerak</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
            <TrendingDown size={22} />
          </div>
        </div>
      </div>

      {/* Warehouse Status & Low Stock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Items Alert Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Kam Qolgan Tovarlar Roʻyxati</h3>
              <p className="text-xs text-slate-400">Minimal qoldiq chegarasidan kam tovarlar</p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/admin/inventory')}
              variant="white"
              className="text-xs font-bold border-slate-200"
              rightIcon={<ArrowRight size={14} />}
            >
              Barcha Tovarlar
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Tovar Nomi & SKU</th>
                  <th className="py-3 px-4">Hozirgi Qoldiq</th>
                  <th className="py-3 px-4">Minimal Meʼyor</th>
                  <th className="py-3 px-4">Holat</th>
                  <th className="py-3 px-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {lowStockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{item.sku}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {item.qty} {item.unit}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {item.minQty} {item.unit}
                    </td>
                    <td className="py-3 px-4">
                      {item.status === 'CRITICAL' ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                          Kritik Kam
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                          Kam Qolgan
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => navigate('/admin/purchases/new')}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] py-1 px-3"
                      >
                        Xarid Qilish
                      </Button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warehouses Capacity */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Omborlar Sigʻimi & Qoldiqlari</h3>
            <div className="space-y-4">
              {warehouses.map((w, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{w.name}</span>
                    <span className="font-mono text-xs font-bold text-teal-700">{w.capacity}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${w.capacity}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>{w.itemsCount} xil tovar</span>
                    <span className="font-bold text-slate-700">{format(w.valueUzs)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <Warehouse className="text-teal-400" size={18} />
              <span className="font-bold text-sm">Omborlararo Koʻchirish</span>
            </div>
            <p className="text-xs text-slate-300">
              Tovarlarni filiallar va doʻkonlar oʻrtasida rasmiy TTN yuk xati bilan bir zumda koʻchiring.
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/admin/inventory')}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs w-full py-2.5"
            >
              Koʻchirish Hujjatini Yaratish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
