import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Search,
  Calendar,
  Warehouse,
  AlertOctagon,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';

export const InventoryWriteOffsPage: React.FC = () => {
  const navigate = useNavigate();
  const { format } = useCurrencyFormatter();

  const writeOffs = [
    {
      id: 'WO-00042',
      date: '2026-09-02 16:00',
      warehouse: 'Bosh Omborxona (Asosiy Baza)',
      reason: 'Yaroqsiz / Siniq (Brak)',
      account: '9430 (Boshqa operatsion xarajatlar)',
      itemsCount: 3,
      totalAmount: 4800000,
      responsible: 'Shokirjon Turgʻunboyev',
      status: 'Hisobdan chiqarildi',
    },
    {
      id: 'WO-00041',
      date: '2026-08-28 10:20',
      warehouse: 'Chilonzor Filial Ombori',
      reason: 'Muddati oʻtgan boʻyoq kimyosi',
      account: '9430 (Boshqa operatsion xarajatlar)',
      itemsCount: 2,
      totalAmount: 1650000,
      responsible: 'Azizbek Toshmatov',
      status: 'Hisobdan chiqarildi',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto font-sans text-slate-800 pb-16 space-y-4 animate-fade-in text-xs">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-[#0B2B33]">Hisobdan Chiqarish (Spisanie)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Buzuq, yaroqsiz yoki kamomad boʻlgan tovarlarni rasmiy dalolatnoma bilan hisobdan chiqarish
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
            onClick={() => navigate('/admin/expenses')}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Yangi Dalolatnoma (Chiqim)
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#F0FBF8] text-[11px] font-bold text-[#0B2B33] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Akt №</th>
                <th className="px-4 py-3.5">Sana</th>
                <th className="px-4 py-3.5">Ombor</th>
                <th className="px-4 py-3.5">Hisobdan Chiqarish Sababi</th>
                <th className="px-4 py-3.5">Buxgalteriya Hisobi</th>
                <th className="px-4 py-3.5 text-right font-mono">Tannarx Summasi</th>
                <th className="px-4 py-3.5">Masʼul Komissiya</th>
                <th className="px-4 py-3.5 text-right">Holati</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {writeOffs.map((wo) => (
                <tr key={wo.id} className="hover:bg-[#F0FBF8]/60 transition">
                  <td className="px-4 py-3.5 font-bold text-rose-600 font-mono">{wo.id}</td>
                  <td className="px-4 py-3.5 text-slate-500">{wo.date}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-800">{wo.warehouse}</td>
                  <td className="px-4 py-3.5 text-slate-700">{wo.reason}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-600 text-[11px]">{wo.account}</td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-600">
                    {format(wo.totalAmount)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{wo.responsible}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      ✓ {wo.status}
                    </span>
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

export default InventoryWriteOffsPage;
