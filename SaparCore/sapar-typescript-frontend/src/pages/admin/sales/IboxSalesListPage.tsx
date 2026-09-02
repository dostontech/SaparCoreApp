import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  User,
  Filter,
  Plus,
  ShoppingCart,
  MoreVertical,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
} from 'lucide-react';
import { Button, Badge } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';

export const IboxSalesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { format } = useCurrencyFormatter();

  const [searchQuery, setSearchQuery] = useState('');

  const salesData = [
    {
      id: 'SO-00481',
      date: 'Bugun, 10:24',
      customer: 'OOO "RIZOBAY STROY"',
      responsible: 'Shokirjon Turgʻunboyev',
      warehouse: 'Boshqarma',
      status: 'PAID',
      statusLabel: 'Toʻlangan',
      total: 18450000,
      paid: 18450000,
      channel: 'Bosh doʻkon',
    },
    {
      id: 'SO-00480',
      date: 'Bugun, 09:15',
      customer: 'Akbarjon Usta (Quruvchi)',
      responsible: 'Azizbek Toshmatov',
      warehouse: 'Chilonzor',
      status: 'PARTIALLY_PAID',
      statusLabel: 'Nasiya / Qarz',
      total: 12800000,
      paid: 5000000,
      channel: 'Kassa (POS)',
    },
    {
      id: 'SO-00479',
      date: 'Kecha, 17:40',
      customer: 'Sherdor Qurilish MCHJ',
      responsible: 'Shokirjon Turgʻunboyev',
      warehouse: 'Boshqarma',
      status: 'PAID',
      statusLabel: 'Toʻlangan',
      total: 45000000,
      paid: 45000000,
      channel: 'Ulgurji savdo',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto font-sans text-slate-800 pb-16 space-y-4 animate-fade-in text-xs">
      {/* Top Header matching ibox_sales_shipment.png */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-black text-slate-900">Sotuvlar</h1>

        <div className="flex items-center gap-2">
          {/* Orange POS oyna button */}
          <Button
            onClick={() => navigate('/admin/pos')}
            className="bg-[#FF6B35] hover:bg-[#E85D2A] text-white font-bold text-xs shadow-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1" /> POS oyna
          </Button>

          {/* Blue + Sotuv button */}
          <Button
            onClick={() => navigate('/admin/sales/create')}
            className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Sotuv
          </Button>

          <Button variant="outline" size="sm" className="px-2">
            <MoreVertical className="w-4 h-4 text-slate-500" />
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Qidirish..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Sotuv sanasi</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>Masʼul shaxs</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white">
          <span>Vositachi</span>
        </div>

        <button
          type="button"
          className="p-2 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Sales List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Hujjat №</th>
                <th className="px-4 py-3.5">Sana</th>
                <th className="px-4 py-3.5">Mijoz</th>
                <th className="px-4 py-3.5">Masʼul shaxs</th>
                <th className="px-4 py-3.5">Holati</th>
                <th className="px-4 py-3.5 text-right font-mono">Jami Summa</th>
                <th className="px-4 py-3.5 text-right font-mono">Toʻlangan</th>
                <th className="px-4 py-3.5 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {salesData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3.5 font-bold text-blue-600 font-mono">{row.id}</td>
                  <td className="px-4 py-3.5 text-slate-500">{row.date}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{row.customer}</td>
                  <td className="px-4 py-3.5 text-slate-600">{row.responsible}</td>
                  <td className="px-4 py-3.5">
                    {row.status === 'PAID' ? (
                      <Badge color="success" variant="soft">
                        ✓ Toʻlangan
                      </Badge>
                    ) : (
                      <Badge color="warning" variant="soft">
                        ● Nasiya / Qarz
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                    {format(row.total)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700">
                    {format(row.paid)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate('/admin/invoices')}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Koʻrish
                    </Button>
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

export default IboxSalesListPage;
