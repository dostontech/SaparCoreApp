import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Building2,
  Warehouse,
  Truck,
  Plus,
  Search,
  MapPin,
  Phone,
  UserCheck,
  CreditCard,
  CheckCircle2,
  Edit2,
  Trash2,
  ShoppingBag,
  X,
  AlertCircle
} from 'lucide-react';
import { Button } from '@components/ui';
import { toast } from 'sonner';

export interface Branch {
  id: string;
  name: string;
  code: string;
  type: 'retail' | 'warehouse' | 'office' | 'delivery';
  warehouseName: string;
  manager: string;
  phone: string;
  region: string;
  address: string;
  posTerminalCode: string;
  status: 'active' | 'inactive';
  dailyRevenue?: string;
  staffCount: number;
}

const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'br-1',
    name: 'Bosh Ofis & Markaziy Showroom',
    code: 'FIL-01',
    type: 'office',
    warehouseName: 'Bosh Omborxona (Asosiy Baza)',
    manager: 'Shokirjon Turgʻunboyev',
    phone: '+998 71 200-11-22',
    region: 'Toshkent shahri',
    address: 'Mirobod tumani, Nukus koʻchasi 29-uy',
    posTerminalCode: 'NKM-99201 (Virtual Kassa)',
    status: 'active',
    dailyRevenue: 'soʻm 42,800,000',
    staffCount: 18,
  },
  {
    id: 'br-2',
    name: 'Chilonzor Savdo Doʻkoni',
    code: 'FIL-02',
    type: 'retail',
    warehouseName: 'Chilonzor Filial Ombori',
    manager: 'Azizbek Toshmatov',
    phone: '+998 90 321-45-67',
    region: 'Toshkent shahri',
    address: 'Chilonzor tumani, 9-mavze, 12-uy',
    posTerminalCode: 'NKM-88410 (Humo/Uzcard)',
    status: 'active',
    dailyRevenue: 'soʻm 18,450,000',
    staffCount: 6,
  },
  {
    id: 'br-3',
    name: 'Samarqand Mintaqaviy Filiali',
    code: 'FIL-03',
    type: 'retail',
    warehouseName: 'Samarqand Mintaqaviy Ombori',
    manager: 'Sardor Mansurov',
    phone: '+998 66 233-44-55',
    region: 'Samarqand viloyati',
    address: 'Samarqand sh., Registon koʻchasi 45',
    posTerminalCode: 'NKM-77302 (Virtual Kassa)',
    status: 'active',
    dailyRevenue: 'soʻm 14,200,000',
    staffCount: 5,
  },
  {
    id: 'br-4',
    name: 'Qoʻyliq Ulgurji Logistika Markazi',
    code: 'FIL-04',
    type: 'warehouse',
    warehouseName: 'Qoʻyliq Ulgurji Omborxona',
    manager: 'Jamshid Karimov',
    phone: '+998 97 740-10-20',
    region: 'Toshkent viloyati',
    address: 'Oʻrta Chirchiq tumani, Bektemir trassasi',
    posTerminalCode: 'Terminal mavjud emas (Faqat B2B)',
    status: 'active',
    dailyRevenue: 'soʻm 85,600,000',
    staffCount: 12,
  },
  {
    id: 'br-5',
    name: 'Fargʻona Tezkor Yetkazib Berish Punkti',
    code: 'FIL-05',
    type: 'delivery',
    warehouseName: 'Fargʻona Tranzit Ombori',
    manager: 'Dilshod Ergashev',
    phone: '+998 93 450-88-99',
    region: 'Fargʻona viloyati',
    address: 'Fargʻona sh., Al-Fargʻoniy koʻchasi 18',
    posTerminalCode: 'Mobil Kassa (Smart POS)',
    status: 'inactive',
    dailyRevenue: 'soʻm 0',
    staffCount: 3,
  },
];

export const BranchesPage: React.FC = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[]>(() => {
    try {
      const saved = localStorage.getItem('sapar_branches_data');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_BRANCHES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Branch, 'id'>>({
    name: '',
    code: '',
    type: 'retail',
    warehouseName: '',
    manager: '',
    phone: '+998 ',
    region: 'Toshkent shahri',
    address: '',
    posTerminalCode: '',
    status: 'active',
    staffCount: 1,
    dailyRevenue: 'soʻm 0',
  });

  // Persist branches on update
  useEffect(() => {
    try {
      localStorage.setItem('sapar_branches_data', JSON.stringify(branches));
    } catch {
      // ignore
    }
  }, [branches]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingBranch(null);
    setFormData({
      name: '',
      code: `FIL-0${branches.length + 1}`,
      type: 'retail',
      warehouseName: 'Bosh Omborxona (Asosiy Baza)',
      manager: '',
      phone: '+998 ',
      region: 'Toshkent shahri',
      address: '',
      posTerminalCode: 'NKM-Virtual Kassa',
      status: 'active',
      staffCount: 2,
      dailyRevenue: 'soʻm 0',
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (b: Branch) => {
    setEditingBranch(b);
    setFormData({
      name: b.name,
      code: b.code,
      type: b.type,
      warehouseName: b.warehouseName,
      manager: b.manager,
      phone: b.phone,
      region: b.region,
      address: b.address,
      posTerminalCode: b.posTerminalCode,
      status: b.status,
      staffCount: b.staffCount,
      dailyRevenue: b.dailyRevenue || 'soʻm 0',
    });
    setIsModalOpen(true);
  };

  // Save Modal
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error('Filial nomi va kodi kiritilishi shart!');
      return;
    }

    if (editingBranch) {
      setBranches((prev) =>
        prev.map((item) =>
          item.id === editingBranch.id
            ? { ...item, ...formData }
            : item
        )
      );
      toast.success('Filial maʼlumotlari yangilandi!');
    } else {
      const newBranch: Branch = {
        id: `br-${Date.now()}`,
        ...formData,
      };
      setBranches((prev) => [newBranch, ...prev]);
      toast.success('Yangi filial muvaffaqiyatli qoʻshildi!');
    }
    setIsModalOpen(false);
  };

  // Delete Branch
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Haqiqatan ham «${name}» filialini oʻchirmoqchimisiz?`)) {
      setBranches((prev) => prev.filter((b) => b.id !== id));
      toast.success('Filial oʻchirildi');
    }
  };

  // Toggle Status
  const handleToggleStatus = (id: string) => {
    setBranches((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: b.status === 'active' ? 'inactive' : 'active' }
          : b
      )
    );
    toast.success('Filial holati oʻzgartirildi');
  };

  // Filtered Branches
  const filteredBranches = branches.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || b.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || b.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Type details
  const getTypeBadge = (type: Branch['type']) => {
    switch (type) {
      case 'retail':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 text-[#028090] border border-[#028090]/20">
            <Store className="w-3 h-3" /> Savdo doʻkoni
          </span>
        );
      case 'office':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Building2 className="w-3 h-3" /> Bosh ofis
          </span>
        );
      case 'warehouse':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Warehouse className="w-3 h-3" /> Ulgurji ombor
          </span>
        );
      case 'delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3 h-3" /> Yetkazib berish
          </span>
        );
    }
  };

  // Stats
  const totalCount = branches.length;
  const activeCount = branches.filter((b) => b.status === 'active').length;
  const retailCount = branches.filter((b) => b.type === 'retail').length;
  const totalStaff = branches.reduce((acc, b) => acc + (b.staffCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto font-sans text-slate-800 pb-16 space-y-5 animate-fade-in text-xs">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#0B2B33]">
              Filiallar va Savdo Nuqtalari
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#028090]/15 text-[#028090] border border-[#028090]/30">
              Sapar Cloud Multi-Branch
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Barcha savdo doʻkonlari, filiallar, biriktirilgan omborlar va NKM/Virtual kassa apparatlari
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/admin/warehouses')}
            variant="outline"
            className="text-[#028090] border-[#028090]/30 hover:bg-[#F0FBF8] font-bold text-xs"
          >
            <Warehouse className="w-3.5 h-3.5 mr-1" /> Omborlar
          </Button>

          <Button
            onClick={() => navigate('/admin/pos')}
            className="bg-[#02C39A] hover:bg-[#029d7c] text-[#0B2B33] font-black text-xs shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1" /> POS Kassa Ochish
          </Button>

          <Button
            onClick={handleOpenAddModal}
            className="bg-[#028090] hover:bg-[#026875] text-white font-bold text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Yangi Filial Qoʻshish
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#028090]/10 text-[#028090] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold">Jami Filiallar</div>
            <div className="text-lg font-black text-[#0B2B33]">{totalCount} ta</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold">Faol Nuqtalar</div>
            <div className="text-lg font-black text-emerald-700">{activeCount} ta</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold">Savdo Doʻkonlari</div>
            <div className="text-lg font-black text-[#028090]">{retailCount} ta</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold">Biriktirilgan Xodimlar</div>
            <div className="text-lg font-black text-purple-900">{totalStaff} nafar</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filial nomi, kodi, shahar yoki masʼul shaxs boʻyicha qidirish..."
            className="w-full pl-8.5 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#028090] focus:ring-1 focus:ring-[#028090]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white font-medium focus:outline-none focus:border-[#028090]"
          >
            <option value="all">Barcha turlar</option>
            <option value="retail">Savdo doʻkoni (Retail)</option>
            <option value="office">Bosh ofis (Office)</option>
            <option value="warehouse">Ulgurji ombor (Warehouse)</option>
            <option value="delivery">Yetkazib berish (Delivery)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white font-medium focus:outline-none focus:border-[#028090]"
          >
            <option value="all">Barcha holatlar</option>
            <option value="active">Faqat faol</option>
            <option value="inactive">Nofaol</option>
          </select>
        </div>
      </div>

      {/* Branches Grid */}
      {filteredBranches.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="font-bold text-slate-700">Hech qanday filial topilmadi</div>
          <p className="text-slate-500">Qidiruv parametrlarini oʻzgartirib koʻring yoki yangi filial qoʻshing</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBranches.map((branch) => {
            const isActive = branch.status === 'active';

            return (
              <div
                key={branch.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm hover:border-[#028090]/40 transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Branch Card Header */}
                <div className="p-4 border-b border-slate-100 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {branch.code}
                        </span>
                        {getTypeBadge(branch.type)}
                      </div>
                      <h3 className="font-extrabold text-sm text-[#0B2B33] mt-1">
                        {branch.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(branch.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition ${isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                      title="Holatni oʻzgartirish"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {isActive ? 'Faol' : 'Nofaol'}
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-[#028090] mt-0.5" />
                    <span className="line-clamp-2">
                      <strong className="text-slate-700">{branch.region}:</strong> {branch.address}
                    </span>
                  </div>
                </div>

                {/* Branch Specs */}
                <div className="p-4 bg-slate-50/60 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Warehouse className="w-3.5 h-3.5 text-slate-500" /> Bogʻlangan ombor:
                    </span>
                    <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                      {branch.warehouseName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" /> Masʼul menejer:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {branch.manager || 'Tayinlanmagan'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-500" /> Telefon:
                    </span>
                    <span className="font-mono text-slate-700">
                      {branch.phone || '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500" /> Kassa / NKM:
                    </span>
                    <span className="font-mono text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200 truncate max-w-[160px]">
                      {branch.posTerminalCode}
                    </span>
                  </div>

                  {branch.dailyRevenue && (
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Kunlik savdo:</span>
                      <span className="font-bold text-[#028090]">
                        {branch.dailyRevenue}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="p-2.5 border-t border-slate-100 flex items-center justify-between bg-white">
                  <Button
                    onClick={() => navigate(`/admin/pos?branchId=${branch.id}`)}
                    className="bg-[#0D3B46] hover:bg-[#028090] text-white font-bold text-[11px] py-1 px-3 shadow-2xs h-7"
                  >
                    <ShoppingBag className="w-3 h-3 mr-1 text-[#02C39A]" /> POS Ochish
                  </Button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(branch)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#028090] hover:bg-slate-100 transition"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(branch.id, branch.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                      title="Oʻchirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Branch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="bg-[#0B2B33] text-white p-4 flex items-center justify-between border-b border-[#028090]/40">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-[#02C39A]" />
                <h3 className="font-extrabold text-sm">
                  {editingBranch ? 'Filialni tahrirlash' : 'Yangi filial / savdo nuqtasi qoʻshish'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Branch Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">
                    Filial nomi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masalan: Chilonzor Savdo Doʻkoni"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#028090] focus:ring-1 focus:ring-[#028090]"
                  />
                </div>

                {/* Code */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Filial kodi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="FIL-01"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#028090]"
                  />
                </div>

                {/* Type */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Filial turi</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Branch['type'] })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#028090]"
                  >
                    <option value="retail">Savdo doʻkoni (Retail POS)</option>
                    <option value="office">Bosh ofis (Headquarters)</option>
                    <option value="warehouse">Ulgurji baza / Omborxona</option>
                    <option value="delivery">Yetkazib berish punkti (Hub)</option>
                  </select>
                </div>

                {/* Warehouse */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Bogʻlangan asosiy ombor</label>
                  <input
                    type="text"
                    value={formData.warehouseName}
                    onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })}
                    placeholder="Chilonzor Filial Ombori"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#028090]"
                  />
                </div>

                {/* Manager */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Masʼul boshqaruvchi (Menejer)</label>
                  <input
                    type="text"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    placeholder="F.I.O."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#028090]"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Aloqa telefoni</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+998 90 123-45-67"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#028090]"
                  />
                </div>

                {/* Region */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Viloyat / Shahar</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#028090]"
                  >
                    <option value="Toshkent shahri">Toshkent shahri</option>
                    <option value="Toshkent viloyati">Toshkent viloyati</option>
                    <option value="Samarqand viloyati">Samarqand viloyati</option>
                    <option value="Fargʻona viloyati">Fargʻona viloyati</option>
                    <option value="Andijon viloyati">Andijon viloyati</option>
                    <option value="Namangan viloyati">Namangan viloyati</option>
                    <option value="Buxoro viloyati">Buxoro viloyati</option>
                    <option value="Xorazm viloyati">Xorazm viloyati</option>
                    <option value="Qashqadaryo viloyati">Qashqadaryo viloyati</option>
                    <option value="Surxondaryo viloyati">Surxondaryo viloyati</option>
                    <option value="Navoiy viloyati">Navoiy viloyati</option>
                    <option value="Jizzax viloyati">Jizzax viloyati</option>
                    <option value="Sirdaryo viloyati">Sirdaryo viloyati</option>
                    <option value="Qoraqalpogʻiston Respublikasi">Qoraqalpogʻiston Respublikasi</option>
                  </select>
                </div>

                {/* Full Address */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">Aniq manzil (Tuman, koʻcha, bino)</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Chilonzor 9-mavze, 12-uy"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#028090]"
                  />
                </div>

                {/* POS Terminal / NKM Code */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Virtual Kassa / NKM Seriyasi</label>
                  <input
                    type="text"
                    value={formData.posTerminalCode}
                    onChange={(e) => setFormData({ ...formData, posTerminalCode: e.target.value })}
                    placeholder="NKM-88410"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#028090]"
                  />
                </div>

                {/* Staff Count */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Xodimlar soni</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.staffCount}
                    onChange={(e) => setFormData({ ...formData, staffCount: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#028090]"
                  />
                </div>

                {/* Status Toggle */}
                <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="branch-status"
                    checked={formData.status === 'active'}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })
                    }
                    className="w-4 h-4 rounded text-[#028090] focus:ring-[#028090]"
                  />
                  <label htmlFor="branch-status" className="font-bold text-slate-700 cursor-pointer">
                    Filial hozirda faol ishlamoqda
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-semibold"
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  className="bg-[#028090] hover:bg-[#026875] text-white font-bold text-xs"
                >
                  {editingBranch ? 'Saqlash' : 'Filialni yaratish'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchesPage;
