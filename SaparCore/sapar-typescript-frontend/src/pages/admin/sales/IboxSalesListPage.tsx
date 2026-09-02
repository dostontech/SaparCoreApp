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
  ArrowUpRight,
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
      {/* Top Header matching iBox structure with SAPAR brand colors */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-[#0B2B33]">Sotuvlar</h1>
          <p className="text-xs text-slate-500 mt-0.5">Barcha sotuv yuk xatlari, kassa cheklari va hisob-fakturalar</p>
        </div>

        <div className="flex items-center gap-2">
          {/* SAPAR Mint POS oyna button */}
          <Button
            onClick={() => navigate('/admin/pos')}
            className="bg-[#02C39A] hover:bg-[#02A683] text-[#0B2B33] font-black text-xs shadow-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1" /> POS oyna
          </Button>

          {/* SAPAR Teal + Sotuv button */}
          <Button
            onClick={() => navigate('/admin/sales/create')}
            className="bg-[#028090] hover:bg-[#026875] text-white font-bold text-xs shadow-xs"
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
            placeholder="Mijoz, raqam yoki tovar boʻyicha qidirish..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090]"
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
          className="p-2 rounded-lg border border-slate-200 text-[#028090] hover:bg-[#F0FBF8] transition"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Sales List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#F0FBF8] text-[11px] font-bold text-[#0B2B33] uppercase tracking-wider border-b border-slate-200">
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
                <tr key={row.id} className="hover:bg-[#F0FBF8]/60 transition">
                  <td className="px-4 py-3.5 font-bold text-[#028090] font-mono">{row.id}</td>
                  <td className="px-4 py-3.5 text-slate-500">{row.date}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{row.customer}</td>
                  <td className="px-4 py-3.5 text-slate-600">{row.responsible}</td>
                  <td className="px-4 py-3.5">
                    {row.status === 'PAID' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#02C39A]/20 text-[#028090]">
                        ✓ Toʻlangan
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        ● Nasiya / Qarz
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                    {format(row.total)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-[#028090]">
                    {format(row.paid)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate('/admin/sales/create')}
                      className="text-xs text-[#028090] hover:text-[#026875] hover:bg-[#028090]/10"
                    >
                      Koʻrish <ArrowUpRight className="w-3 h-3 ml-0.5" />
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
