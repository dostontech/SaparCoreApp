import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Building2,
  TrendingUp,
  Package,
  Search,
  Plus,
  LogIn,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Utensils,
  HardHat,
  ShoppingBag,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@components/ui';

import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import { Link } from 'react-router-dom';

interface SaasClient {
  id: string;
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  stir: string;
  city: string;
  state: string;
  country: string;
  plan: string;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED';
  staffCount: number;
  productsCount: number;
  invoicesCount: number;
  customersCount: number;
  shiftsCount: number;
  totalTurnover: number;
  createdAt: string;
}

interface PlatformKpi {
  totalTenants: number;
  activeTenants: number;
  mrrUzs: number;
  totalProducts: number;
  totalInvoices: number;
  totalTurnoverUzs: number;
}

const ALL_MODULES = [
  { key: 'pos', nameUz: 'POS Kassa Terminali', descUz: 'Sensorli kassa, chek chop etish va kassa smenalari' },
  { key: 'sales', nameUz: 'Savdo & Hisob-fakturalar', descUz: 'Hisob-fakturalar, TTN va shartnomalar' },
  { key: 'purchases', nameUz: 'Xaridlar & Xarajatlar', descUz: 'Yetkazib beruvchilar va xarid buyurtmalari' },
  { key: 'inventory', nameUz: 'Ombor & FIFO Tannarx', descUz: 'Koʻp omborli qoldiqlar va tannarx qatlamlari' },
  { key: 'banking', nameUz: 'Bank & Kassa (Naqd pul)', descUz: 'Bank hisoblari, kassa va 1C koʻchirmalar' },
  { key: 'accounting', nameUz: '21-son BHMS Buxgalteriya', descUz: 'Hisoblar rejasi, jurnallar va provodkalar' },
  { key: 'reports', nameUz: 'Moliyaviy & Soliq Hisobotlar', descUz: 'Balans (1-shakl), P&L (2-shakl) va Soliq deklaratsiyalari' },
  { key: 'crm', nameUz: 'CRM & Savdo Quvuri', descUz: 'Mijozlar bilan aloqalar va savdo bitimlari' },
  { key: 'projects', nameUz: 'Loyihalar Ish Maydoni', descUz: 'Loyiha vazifalari Kanban va rentabellik' },
  { key: 'payroll', nameUz: 'HRM & Oylik Maosh (Payroll)', descUz: 'Davomat tabeli va oylik hisob-kitob' },
  { key: 'helpdesk', nameUz: 'Yordam Markazi (Helpdesk)', descUz: 'Mijozlar murojaatlari va tiketlar' },
  { key: 'settings', nameUz: 'Tizim Sozlamalari', descUz: 'E-IMZO, rekvizitlar va toʻlov tizimlari' },
];


const SECTOR_DEFAULTS: Record<string, Record<string, boolean>> = {
  construction: { pos: true, sales: true, purchases: true, inventory: true, banking: true, accounting: true, reports: true, crm: true, projects: false, payroll: false, helpdesk: false, settings: true },
  restaurant: { pos: true, sales: false, purchases: true, inventory: true, banking: true, accounting: true, reports: true, crm: false, projects: false, payroll: true, helpdesk: false, settings: true },
  retail: { pos: true, sales: true, purchases: true, inventory: true, banking: true, accounting: true, reports: true, crm: false, projects: false, payroll: false, helpdesk: false, settings: true },
  pharmacy: { pos: true, sales: true, purchases: true, inventory: true, banking: true, accounting: true, reports: true, crm: false, projects: false, payroll: false, helpdesk: false, settings: true },
  services: { pos: false, sales: true, purchases: true, inventory: false, banking: true, accounting: true, reports: true, crm: true, projects: true, payroll: true, helpdesk: true, settings: true },
  all: { pos: true, sales: true, purchases: true, inventory: true, banking: true, accounting: true, reports: true, crm: true, projects: true, payroll: true, helpdesk: true, settings: true },
};

export const SaasClientsPage: React.FC = () => {
  const { format } = useCurrencyFormatter();

  const [clients, setClients] = useState<SaasClient[]>([]);
  const [kpi, setKpi] = useState<PlatformKpi | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Module assignment modal state
  const [selectedClientForModules, setSelectedClientForModules] = useState<SaasClient | null>(null);
  const [clientModules, setClientModules] = useState<Record<string, boolean>>(SECTOR_DEFAULTS.all);
  const [isSavingModules, setIsSavingModules] = useState(false);
  const [moduleSaveSuccess, setModuleSaveSuccess] = useState(false);

  // Form for new tenant
  const [newTenant, setNewTenant] = useState({
    companyName: '',
    ownerFirstName: '',
    ownerLastName: '',
    email: '',
    phone: '',
    password: '',
    city: 'Toshkent',
    sector: 'retail',
    stir: '',
    plan: 'Korporativ Enterprise',
  });


  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/saas/clients');
      if (res.data?.success) {
        setClients(res.data.data.clients || []);
        setKpi(res.data.data.kpi || null);
      }
    } catch (err) {
      console.error('Failed to load SaaS clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleImpersonate = async (clientId: string) => {
    setImpersonatingId(clientId);
    try {
      const res = await axios.post(`/api/admin/saas/clients/${clientId}/impersonate`);
      if (res.data?.success && res.data?.data?.token) {
        // Save new auth token & user info
        localStorage.setItem('sapar_token', res.data.data.token);
        if (res.data.data.user) {
          localStorage.setItem('sapar_user', JSON.stringify(res.data.data.user));
        }
        window.location.href = '/admin';
      }
    } catch (err) {
      console.error('Impersonation failed:', err);
      alert('Mijoz hisobiga ulanishda xatolik yuz berdi.');
    } finally {
      setImpersonatingId(null);
    }
  };

  const openModuleModal = (client: SaasClient) => {
    setSelectedClientForModules(client);
    const n = client.companyName.toLowerCase();
    let initialPreset = SECTOR_DEFAULTS.construction;
    if (n.includes('restoran') || n.includes('rayhon') || n.includes('kafe')) {
      initialPreset = SECTOR_DEFAULTS.restaurant;
    } else if (n.includes('butik') || n.includes('market') || n.includes('doʻkon')) {
      initialPreset = SECTOR_DEFAULTS.retail;
    }
    setClientModules(initialPreset);
  };

  const applySectorPreset = (sectorKey: string) => {
    if (SECTOR_DEFAULTS[sectorKey]) {
      setClientModules({ ...SECTOR_DEFAULTS[sectorKey] });
    }
  };

  const toggleClientModule = (moduleKey: string) => {
    setClientModules((prev) => ({
      ...prev,
      [moduleKey]: !prev[moduleKey],
    }));
  };

  const handleSaveClientModules = async () => {
    if (!selectedClientForModules) return;
    setIsSavingModules(true);
    try {
      await axios.put(`/api/admin/saas/clients/${selectedClientForModules.id}/modules`, {
        modules: clientModules,
      });
      setModuleSaveSuccess(true);
      setTimeout(() => {
        setModuleSaveSuccess(false);
        setSelectedClientForModules(null);
      }, 1500);
    } catch (err) {
      console.error('Save modules error:', err);
      alert('Modullarni saqlashda xatolik yuz berdi.');
    } finally {
      setIsSavingModules(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await axios.post('/api/admin/saas/clients', newTenant);
      if (res.data?.success) {
        setShowAddModal(false);
        setNewTenant({
          companyName: '',
          ownerFirstName: '',
          ownerLastName: '',
          email: '',
          phone: '',
          password: '',
          city: 'Toshkent',
          sector: 'retail',
          stir: '',
          plan: 'Korporativ Enterprise',
        });
        fetchClients();
      }
    } catch (err: any) {
      console.error('Create client error:', err);
      alert(err.response?.data?.message || 'Mijozni yaratishda xatolik');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSectorIcon = (name: string) => {

    const n = name.toLowerCase();
    if (n.includes('qurilish') || n.includes('stroy') || n.includes('baza')) {
      return <HardHat size={18} className="text-amber-600" />;
    }
    if (n.includes('restoran') || n.includes('kafe') || n.includes('rayhon') || n.includes('osh')) {
      return <Utensils size={18} className="text-rose-600" />;
    }
    if (n.includes('butik') || n.includes('kiyim') || n.includes('doʻkon') || n.includes('market')) {
      return <ShoppingBag size={18} className="text-purple-600" />;
    }
    return <Building2 size={18} className="text-teal-600" />;
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);

    if (selectedStatus === 'ALL') return matchesSearch;
    return matchesSearch && c.status === selectedStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-teal-800/30">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
              <ShieldCheck size={14} /> SAPAR Super-Admin SaaS Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              SaaS Mijozlar & Tenantlar Boshqaruvi
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Platformadagi barcha korxonalarni kuzatish, yangi mijozlarni roʻyxatdan oʻtkazish va 1-bosqichda mijoz ish maydoniga kirish (Impersonation).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/30 text-xs font-bold transition-all"
            >
              <Sparkles size={16} /> Onboarding Wizard
            </Link>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-lg shadow-teal-500/20"
              leftIcon={<Plus size={16} />}
            >
              Yangi SaaS Mijoz Qoʻshish
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Jami Korxonalar (Tenants)</span>
            <div className="text-2xl font-black text-slate-900">{kpi?.totalTenants || clients.length}</div>
            <div className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
              <CheckCircle2 size={12} /> 100% Faol korxonalar
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
            <Building2 size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Oylik Daromad (MRR)</span>
            <div className="text-2xl font-black text-slate-900">{format(kpi?.mrrUzs || 2980000)}</div>
            <div className="text-[11px] font-medium text-teal-600 flex items-center gap-1">
              <TrendingUp size={12} /> Barqaror SaaS abonent toʻlovi
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Jami Tovar Pozitsiyalari</span>
            <div className="text-2xl font-black text-slate-900">{kpi?.totalProducts || 22} ta</div>
            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Package size={12} /> Barcha omborlarda
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Package size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Soliq & BHMS Muvofiqligi</span>
            <div className="text-2xl font-black text-slate-900">100% 🇺🇿</div>
            <div className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
              <ShieldCheck size={12} /> 21-son BHMS & Soliq QQS
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['ALL', 'ACTIVE', 'TRIAL', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' && 'Barchasi'}
              {st === 'ACTIVE' && 'Faol (Active)'}
              {st === 'TRIAL' && 'Sinov (Trial)'}
              {st === 'SUSPENDED' && 'Toʻxtatilgan'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Mijoz nomi, egasi yoki email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="animate-spin text-teal-600" size={28} />
            <span className="text-sm font-medium">SaaS mijozlar yuklanmoqda...</span>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="col-span-full py-16 bg-white rounded-3xl border border-slate-200 text-center text-slate-500">
            Mijozlar topilmadi.
          </div>
        ) : (
          filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between gap-5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50/50 rounded-full blur-2xl pointer-events-none group-hover:bg-teal-100/40 transition-colors" />

              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shadow-xs">
                      {getSectorIcon(client.companyName)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                        {client.companyName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-medium">{client.city}, {client.country}</span>
                        <span>•</span>
                        <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                          STIR: {client.stir}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={12} /> {client.status}
                  </span>
                </div>

                {/* Owner & Contact details */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Kompaniya Rahbari:</span>
                    <span className="font-bold text-slate-800">{client.ownerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-mono text-slate-800 font-medium">{client.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Telefon:</span>
                    <span className="font-mono text-slate-800 font-semibold">{client.phone}</span>
                  </div>
                </div>

                {/* Operational Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-2.5">
                    <div className="text-base font-black text-teal-800">{client.productsCount}</div>
                    <div className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider">Tovarlar</div>
                  </div>
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-2.5">
                    <div className="text-base font-black text-indigo-800">{client.staffCount}</div>
                    <div className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">Xodimlar</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                    <div className="text-base font-black text-slate-800">{client.invoicesCount}</div>
                    <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Fakturalar</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <div className="text-xs">
                  <span className="text-slate-400 block text-[10px]">Tarif rejasi:</span>
                  <span className="font-bold text-slate-700">{client.plan}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="white"
                    onClick={() => openModuleModal(client)}
                    className="border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-xs py-1.5"
                    leftIcon={<SlidersHorizontal size={13} />}
                  >
                    Modullarni Sozlash
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleImpersonate(client.id)}
                    disabled={impersonatingId === client.id}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm py-1.5"
                    leftIcon={impersonatingId === client.id ? <RefreshCw size={13} className="animate-spin" /> : <LogIn size={13} />}
                  >
                    {impersonatingId === client.id ? 'Ulanilmoqda…' : 'Mijoz Tizimiga Kirish'}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add SaaS Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Yangi SaaS Mijoz Yaratish</h3>
                  <p className="text-xs text-slate-500">Korxona egasi hisobini va sozlamalarini faollashtirish</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kompaniya Nomi (MCHJ / XK / YaTT) *</label>
                <input
                  type="text"
                  required
                  value={newTenant.companyName}
                  onChange={(e) => setNewTenant({ ...newTenant, companyName: e.target.value })}
                  placeholder="Masalan: MEGA STROY INVEST MCHJ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Egasi Ismi *</label>
                  <input
                    type="text"
                    required
                    value={newTenant.ownerFirstName}
                    onChange={(e) => setNewTenant({ ...newTenant, ownerFirstName: e.target.value })}
                    placeholder="Masalan: Sardor"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Familiyasi</label>
                  <input
                    type="text"
                    value={newTenant.ownerLastName}
                    onChange={(e) => setNewTenant({ ...newTenant, ownerLastName: e.target.value })}
                    placeholder="Masalan: Aliyev"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email manzili (Login) *</label>
                  <input
                    type="email"
                    required
                    value={newTenant.email}
                    onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                    placeholder="admin@megastroy.uz"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefon raqam *</label>
                  <input
                    type="text"
                    required
                    value={newTenant.phone}
                    onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
                    placeholder="+998901234567"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Boshlangʻich Parol</label>
                  <input
                    type="password"
                    value={newTenant.password}
                    onChange={(e) => setNewTenant({ ...newTenant, password: e.target.value })}
                    placeholder="Sapar123! (Standart)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Shahar / Viloyat</label>
                  <select
                    value={newTenant.city}
                    onChange={(e) => setNewTenant({ ...newTenant, city: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Toshkent">Toshkent shahri</option>
                    <option value="Samarqand">Samarqand</option>
                    <option value="Fargʻona">Fargʻona</option>
                    <option value="Andijon">Andijon</option>
                    <option value="Buxoro">Buxoro</option>
                    <option value="Namangan">Namangan</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-200/60 text-teal-800 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
                <span>21-son BHMS milliy hisoblar rejasi avtomatik tarzda yaratiladi.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="white"
                  onClick={() => setShowAddModal(false)}
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  {isSubmitting ? 'Yaratilmoqda…' : 'Mijozni Yaratish'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Module Access Assignment Modal */}
      {selectedClientForModules && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col justify-between">
            <div className="space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                    <SlidersHorizontal size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                      {selectedClientForModules.companyName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Ushbu korxona uchun menyu modullarini yoqish yoki yashirish
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClientForModules(null)}
                  className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
                >
                  ×
                </button>
              </div>

              {/* Quick Sector Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Tezkor Sohaviy Shablonlar:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applySectorPreset('construction')}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition-colors"
                  >
                    Qurilish & Ulgurji
                  </button>
                  <button
                    type="button"
                    onClick={() => applySectorPreset('restaurant')}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition-colors"
                  >
                    Restoran & Kafe
                  </button>
                  <button
                    type="button"
                    onClick={() => applySectorPreset('retail')}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-xs font-semibold hover:bg-purple-100 transition-colors"
                  >
                    Chakana & Butik
                  </button>
                  <button
                    type="button"
                    onClick={() => applySectorPreset('pharmacy')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                  >
                    Dorixona
                  </button>
                  <button
                    type="button"
                    onClick={() => applySectorPreset('services')}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition-colors"
                  >
                    B2B & Xizmatlar
                  </button>
                  <button
                    type="button"
                    onClick={() => applySectorPreset('all')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Barcha Modullar
                  </button>

                </div>
              </div>

              {/* Module Toggles List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[42vh] overflow-y-auto pr-1 pt-1">
                {ALL_MODULES.map((m) => {
                  const isEnabled = !!clientModules[m.key];
                  return (
                    <div
                      key={m.key}
                      onClick={() => toggleClientModule(m.key)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isEnabled
                          ? 'bg-teal-50/60 border-teal-300/80 shadow-xs'
                          : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 text-xs">{m.nameUz}</div>
                        <div className="text-[10px] text-slate-500 leading-snug">{m.descUz}</div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                          isEnabled ? 'bg-teal-600 text-white' : 'border border-slate-300 text-transparent'
                        }`}
                      >
                        ✓
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
              {moduleSaveSuccess ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
                  <CheckCircle2 size={16} /> Modullar muvaffaqiyatli saqlandi!
                </div>
              ) : (
                <span className="text-xs text-slate-400">
                  Faol: {Object.values(clientModules).filter(Boolean).length} / 12 modul
                </span>
              )}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="white"
                  onClick={() => setSelectedClientForModules(null)}
                >
                  Bekor qilish
                </Button>
                <Button
                  onClick={handleSaveClientModules}
                  disabled={isSavingModules}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  {isSavingModules ? 'Saqlanmoqda…' : 'Modullarni Saqlash'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaasClientsPage;

