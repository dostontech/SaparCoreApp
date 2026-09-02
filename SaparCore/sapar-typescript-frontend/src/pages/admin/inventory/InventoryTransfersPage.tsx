import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightLeft,
  Plus,
  Search,
  Calendar,
  Warehouse,
  Truck,
  FileText,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Button, Badge } from '@components/ui';

export const InventoryTransfersPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const transfers = [
    {
      id: 'TR-00104',
      date: '2026-09-02 14:30',
      fromWarehouse: 'Bosh Omborxona (Asosiy Baza)',
      toWarehouse: 'Chilonzor Filial Ombori',
      itemsCount: 14,
      totalQty: 250,
      responsible: 'Shokirjon Turgʻunboyev',
      driver: 'Ravshan Xalilov (Isuzu 01 777 AAA)',
      status: 'COMPLETED',
      statusLabel: 'Qabul qilindi',
    },
    {
      id: 'TR-00103',
      date: '2026-09-01 11:15',
      fromWarehouse: 'Bosh Omborxona (Asosiy Baza)',
      toWarehouse: 'Qoʻyliq Ulgurji Omborxona',
      itemsCount: 8,
      totalQty: 600,
      responsible: 'Azizbek Toshmatov',
      driver: 'Otabek Mirzayev (Kamaz 01 555 BBB)',
      status: 'IN_TRANSIT',
      statusLabel: 'Yoʻlda (Yetkazilmoqda)',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto font-sans text-slate-800 pb-16 space-y-4 animate-fade-in text-xs">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-[#0B2B33]">Omborlararo Koʻchirishlar</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Filiallar va omborlar oʻrtasida tovarlarni koʻchirish va TTN yuk xatlarini yuritish
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/admin/inventory')}
            variant="outline"
            className="text-slate-600 text-xs font-bold"
          >
            Ombor qoldiqlari
          </Button>

          <Button
            onClick={() => navigate('/admin/delivery-challans/new')}
            className="bg-[#028090] hover:bg-[#026875] text-white font-bold text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Yangi Koʻchirish (TTN)
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#F0FBF8] text-[11px] font-bold text-[#0B2B33] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Hujjat №</th>
                <th className="px-4 py-3.5">Sana</th>
                <th className="px-4 py-3.5">Qayerdan (Chiqim)</th>
                <th className="px-4 py-3.5">Qayerga (Kirim)</th>
                <th className="px-4 py-3.5 text-center">Miqdor</th>
                <th className="px-4 py-3.5">Haydovchi / Transport</th>
                <th className="px-4 py-3.5">Holati</th>
                <th className="px-4 py-3.5 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {transfers.map((tr) => (
                <tr key={tr.id} className="hover:bg-[#F0FBF8]/60 transition">
                  <td className="px-4 py-3.5 font-bold text-[#028090] font-mono">{tr.id}</td>
                  <td className="px-4 py-3.5 text-slate-500">{tr.date}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-800">{tr.fromWarehouse}</td>
                  <td className="px-4 py-3.5 font-bold text-[#028090]">{tr.toWarehouse}</td>
                  <td className="px-4 py-3.5 text-center font-mono font-bold">
                    {tr.totalQty} dona <span className="text-slate-400 font-normal">({tr.itemsCount} xil)</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{tr.driver}</td>
                  <td className="px-4 py-3.5">
                    {tr.status === 'COMPLETED' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#02C39A]/20 text-[#028090]">
                        ✓ {tr.statusLabel}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        ● {tr.statusLabel}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate('/admin/delivery-challans')}
                      className="text-xs text-[#028090] hover:bg-[#028090]/10 font-bold"
                    >
                      Yuk xati (TTN) →
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

export default InventoryTransfersPage;
