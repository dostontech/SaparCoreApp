import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  Package,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';

export const ManufacturingBomPage: React.FC = () => {
  const navigate = useNavigate();
  const { format } = useCurrencyFormatter();

  const boms = [
    {
      id: 'BOM-001',
      code: 'BOM-SHPAT-30',
      name: 'Shpatlyovka Rotband Knauf 30kg Retsepti',
      outputProduct: 'Shpatlyovka Rotband Knauf 30kg',
      componentsCount: 4,
      rawMaterialCost: 35000,
      overheadCost: 7000,
      totalCalculatedCost: 42000,
      version: 'v2.1',
      status: 'Faol Standart',
    },
    {
      id: 'BOM-002',
      code: 'BOM-EMUL-20',
      name: 'Akfa Fasid Emulsiya Oq 20kg Formula',
      outputProduct: 'Akfa Emulsiya Fasid Boʻyoq 20kg',
      componentsCount: 6,
      rawMaterialCost: 140000,
      overheadCost: 25000,
      totalCalculatedCost: 165000,
      version: 'v1.4',
      status: 'Faol Standart',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto font-sans text-slate-800 pb-16 space-y-4 animate-fade-in text-xs">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-[#0B2B33]">Texnologik Xaritalar (Retseptura / BOM)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tayyor mahsulot ishlab chiqarish uchun zarur boʻlgan xomashyo tarkibi va normativ tannarx hisob-kitobi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/admin/manufacturing/orders')}
            variant="outline"
            className="text-[#028090] border-[#028090]/30 hover:bg-[#F0FBF8] font-bold text-xs"
          >
            Buyurtmalar roʻyxati
          </Button>

          <Button
            onClick={() => navigate('/admin/products')}
            className="bg-[#028090] hover:bg-[#026875] text-white font-bold text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Yangi Retseptura (BOM)
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {boms.map((bom) => (
          <div
            key={bom.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#028090]/40 transition"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#028090]/10 text-[#028090] font-mono">
                    {bom.code} ({bom.version})
                  </span>
                  <h3 className="font-bold text-sm text-[#0B2B33] mt-1">{bom.name}</h3>
                  <p className="text-slate-500 text-[11px]">Chiqish mahsuloti: <strong>{bom.outputProduct}</strong></p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#02C39A]/20 text-[#028090]">
                  ✓ {bom.status}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-[11px] bg-slate-50 p-3 rounded-lg">
              <div>
                <p className="text-slate-400">Xomashyo xillari</p>
                <p className="font-bold text-slate-800">{bom.componentsCount} ta tarkibiy qism</p>
              </div>
              <div>
                <p className="text-slate-400">Xomashyo sarfi</p>
                <p className="font-mono font-bold text-slate-700">{format(bom.rawMaterialCost)}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400">Normativ Tannarx</p>
                <p className="font-mono font-bold text-[#028090]">{format(bom.totalCalculatedCost)}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/manufacturing/orders')}
              className="w-full text-xs font-bold text-[#028090] hover:bg-[#F0FBF8]"
            >
              Ushbu retsept boʻyicha ishlab chiqarishni boshlash →
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManufacturingBomPage;
