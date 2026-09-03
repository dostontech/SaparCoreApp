import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Warehouse,
  Plus,
  Search,
  Building2,
  Package,
  MapPin,
  CheckCircle2,
  ArrowRightLeft,
  MoreVertical,
} from 'lucide-react';
import { Button, Badge } from '@components/ui';

export const WarehousesPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const warehouses = [
    {
      id: 'wh-1',
      name: 'Bosh Omborxona (Asosiy Baza)',
      code: 'OMBOR-01',
      location: 'Toshkent sh., Sergeli tumani, Yangi Sergeli 45',
      manager: 'Shokirjon Turgʻunboyev',
      totalItems: 420,
      totalValue: 'soʻm 845,200,000',
      isDefault: true,
      status: 'Faol',
    },
    {
      id: 'wh-2',
      name: 'Chilonzor Filial Ombori',
      code: 'OMBOR-02',
      location: 'Toshkent sh., Chilonzor tumani, 9-mavze',
      manager: 'Azizbek Toshmatov',
      totalItems: 180,
      totalValue: 'soʻm 215,800,000',
      isDefault: false,
      status: 'Faol',
    },
    {
      id: 'wh-3',
      name: 'Qoʻyliq Ulgurji Omborxona',
      code: 'OMBOR-03',
      location: 'Toshkent viloyati, Oʻrta Chirchiq tumani',
      manager: 'Jamshid Karimov',
      totalItems: 310,
      totalValue: 'soʻm 620,000,000',
      isDefault: false,
      status: 'Faol',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto font-sans text-slate-800 pb-16 space-y-4 animate-fade-in text-xs">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-[#0B2B33]">Omborlar Boshqaruvi</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Barcha filial va markaziy omborlar, masʼul shaxslar hamda tovar qoldiqlari
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/admin/inventory/transfers')}
            variant="outline"
            className="text-[#028090] border-[#028090]/30 hover:bg-[#F0FBF8] font-bold text-xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 mr-1" /> Omborlararo Koʻchirish
          </Button>

          <Button
            onClick={() => navigate('/admin/inventory')}
            className="bg-[#028090] hover:bg-[#026875] text-white font-bold text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Yangi Ombor Qoʻshish
          </Button>
        </div>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {warehouses.map((wh) => (
          <div
            key={wh.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#028090]/40 transition"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#028090]/15 text-[#028090] flex items-center justify-center">
                    <Warehouse className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0B2B33]">{wh.name}</h3>
                    <p className="text-slate-400 font-mono text-[10px]">{wh.code}</p>
                  </div>
                </div>
                {wh.isDefault && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#02C39A]/20 text-[#028090]">
                    Asosiy
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] pt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{wh.location}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <p className="text-slate-400">Masʼul shaxs</p>
                <p className="font-bold text-slate-800">{wh.manager}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400">Tovar xillari</p>
                <p className="font-mono font-bold text-[#028090]">{wh.totalItems} ta</p>
              </div>
              <div className="col-span-2 pt-1 flex justify-between items-center bg-[#F0FBF8] p-2 rounded-lg">
                <span className="text-slate-600 font-semibold">Ombordagi tovar qiymati:</span>
                <span className="font-mono font-bold text-[#0B2B33]">{wh.totalValue}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/inventory')}
                className="w-full text-xs font-bold text-[#028090] hover:bg-[#F0FBF8]"
              >
                Qoldiqlarni koʻrish →
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WarehousesPage;
