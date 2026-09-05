import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  Plus,
  Search,
  Calendar,
  Warehouse,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@components/ui';

export const InventoryAuditsPage: React.FC = () => {
  const navigate = useNavigate();

  const audits = [
    {
      id: 'AUD-2026-08',
      title: 'Avgust oyi yakuniy toʻliq inventarizatsiyasi',
      date: '2026-08-31',
      warehouse: 'Bosh Omborxona (Asosiy Baza)',
      totalCounted: 420,
      matched: 418,
      discrepancy: 2,
      differenceSum: 'soʻm -270,000 (Kamomad)',
      inspector: 'Audit guruhi (Shokirjon, Azizbek)',
      status: 'Tasdiqlangan & Provodka qilingan',
    },
    {
      id: 'AUD-2026-07',
      title: 'Chilonzor filiali choraklik inventarizatsiyasi',
      date: '2026-07-31',
      warehouse: 'Chilonzor Filial Ombori',
      totalCounted: 180,
      matched: 180,
      discrepancy: 0,
      differenceSum: 'soʻm 0 (100% Teng)',
      inspector: 'Azizbek Toshmatov',
      status: 'Tasdiqlangan & Provodka qilingan',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto font-sans text-slate-800 pb-16 space-y-4 animate-fade-in text-xs">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-[#0B2B33]">Inventarizatsiya & Qoldiq Audit</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Shtrix-kodli haqiqiy tovar sanogʻi, dasturdagi qoldiq bilan solishtirish va ortiqcha/kamomadni aniqlash
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
            onClick={() => navigate('/admin/inventory/cost-layers')}
            className="bg-[#028090] hover:bg-[#026875] text-white font-bold text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Yangi Inventarizatsiya Boshlash
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
                <th className="px-4 py-3.5">Inventarizatsiya Nomi</th>
                <th className="px-4 py-3.5">Sana</th>
                <th className="px-4 py-3.5">Ombor</th>
                <th className="px-4 py-3.5 text-center">Sanalgan Tovar</th>
                <th className="px-4 py-3.5 text-center">Tenglik</th>
                <th className="px-4 py-3.5 text-right font-mono">Farq (Kamomad/Ortiqcha)</th>
                <th className="px-4 py-3.5">Holati</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {audits.map((aud) => (
                <tr key={aud.id} className="hover:bg-[#F0FBF8]/60 transition">
                  <td className="px-4 py-3.5 font-bold text-[#028090] font-mono">{aud.id}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{aud.title}</td>
                  <td className="px-4 py-3.5 text-slate-500">{aud.date}</td>
                  <td className="px-4 py-3.5 text-slate-800">{aud.warehouse}</td>
                  <td className="px-4 py-3.5 text-center font-mono font-bold">{aud.totalCounted} xil</td>
                  <td className="px-4 py-3.5 text-center font-mono text-emerald-700 font-bold">
                    {aud.matched} ta mos
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-800">
                    {aud.differenceSum}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#02C39A]/20 text-[#028090]">
                      ✓ {aud.status}
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

export default InventoryAuditsPage;
