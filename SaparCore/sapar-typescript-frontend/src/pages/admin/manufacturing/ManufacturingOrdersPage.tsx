import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Factory,
  Plus,
  Search,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';

export const ManufacturingOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { format } = useCurrencyFormatter();

  const orders = [
    {
      id: 'PRD-00214',
      productName: 'Shpatlyovka Qorishmasi 30kg (Tayyor Mahsulot)',
      date: '2026-09-02',
      qtyPlanned: 500,
      qtyProduced: 500,
      bomName: 'BOM-SHPAT-30 (Standart Retseptura)',
      unitCost: 42000,
      totalCost: 21000000,
      status: 'COMPLETED',
      statusLabel: 'Tayyor / Qabul qilindi',
    },
    {
      id: 'PRD-00215',
      productName: 'Akfa Fasid Emulsiya Oq 20kg',
      date: '2026-09-03',
      qtyPlanned: 200,
      qtyProduced: 120,
      bomName: 'BOM-EMUL-20 (Fasid Formula)',
      unitCost: 165000,
      totalCost: 33000000,
      status: 'IN_PROGRESS',
      statusLabel: 'Ishlab chiqarilmoqda (60%)',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto font-sans text-slate-800 pb-16 space-y-4 animate-fade-in text-xs">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-[#0B2B33]">Ishlab Chiqarish Buyurtmalari (Fabrika)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Xomashyodan tayyor mahsulot ishlab chiqarish, texnologik xarajatlar va 2010 hisobvaraq tannarxi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/admin/manufacturing/bom')}
            variant="outline"
            className="text-[#028090] border-[#028090]/30 hover:bg-[#F0FBF8] font-bold text-xs"
          >
            <Layers className="w-3.5 h-3.5 mr-1" /> Retsepturalar (BOM)
          </Button>

          <Button
            onClick={() => navigate('/admin/products')}
            className="bg-[#028090] hover:bg-[#026875] text-white font-bold text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Yangi Ishlab Chiqarish Buyurtmasi
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#F0FBF8] text-[11px] font-bold text-[#0B2B33] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Buyurtma №</th>
                <th className="px-4 py-3.5">Tayyor Mahsulot</th>
                <th className="px-4 py-3.5">Sana</th>
                <th className="px-4 py-3.5">Retseptura (BOM)</th>
                <th className="px-4 py-3.5 text-center">Miqdor</th>
                <th className="px-4 py-3.5 text-right font-mono">Birlik Tannarxi</th>
                <th className="px-4 py-3.5 text-right font-mono">Jami Tannarx</th>
                <th className="px-4 py-3.5 text-right">Holati</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#F0FBF8]/60 transition">
                  <td className="px-4 py-3.5 font-bold text-[#028090] font-mono">{ord.id}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{ord.productName}</td>
                  <td className="px-4 py-3.5 text-slate-500">{ord.date}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-600 text-[11px]">{ord.bomName}</td>
                  <td className="px-4 py-3.5 text-center font-mono font-bold">
                    {ord.qtyProduced} / {ord.qtyPlanned} dona
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                    {format(ord.unitCost)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-[#028090]">
                    {format(ord.totalCost)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {ord.status === 'COMPLETED' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#02C39A]/20 text-[#028090]">
                        ✓ {ord.statusLabel}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        ● {ord.statusLabel}
                      </span>
                    )}
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

export default ManufacturingOrdersPage;
