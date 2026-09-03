import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  ShoppingCart,
  Clock,
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  FileText,
  Printer,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Banknote,
  Smartphone,
  Layers,
  ArrowRightLeft,
  AlertTriangle,
  Building2,
  Coins,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import {
  Badge,
  Tabs,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@components/ui';
import { PageHeader } from '@/context/PageHeaderContext';
import Constants from '@constants/api';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import { toast } from 'sonner';

interface CashierRecord {
  id: string | number;
  cashierName: string;
  email?: string;
  registerName: string;
  status: 'OPEN' | 'CLOSED' | 'AUDITED';
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  totalSales: number;
  totalChecks: number;
  cashAmount: number;
  cardAmount: number;
  humoAmount: number;
  onlineAmount: number;
  expectedCash?: number;
  actualCash?: number;
  difference?: number;
  auditedBy?: string;
  auditedAt?: string;
}

interface CashRegister {
  id: string | number;
  name: string;
  location: string;
  assignedCashier: string;
  status: 'ACTIVE' | 'INACTIVE';
  paymentMethods: string[];
  currencies: string[];
  balanceUzs: number;
  balanceUsd: number;
}

export const PosCashiersPage: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const { format } = useCurrencyFormatter();

  const [activeTab, setActiveTab] = useState('cashiers');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentShift, setCurrentShift] = useState<any | null>(null);

  // Audit Modal State
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedShiftForAudit, setSelectedShiftForAudit] = useState<CashierRecord | null>(null);
  const [countedAuditCash, setCountedAuditCash] = useState<number>(0);
  const [inkassatsiyaTarget, setInkassatsiyaTarget] = useState<'SAFE' | 'BANK'>('SAFE');

  // New Register Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newRegisterName, setNewRegisterName] = useState('');
  const [newRegisterLocation, setNewRegisterLocation] = useState('Asosiy doʻkon');
  const [newRegisterCashier, setNewRegisterCashier] = useState('Azizbek Toshmatov');

  // Registers Directory
  const [registers, setRegisters] = useState<CashRegister[]>([
    {
      id: 1,
      name: 'Kassa №1 (Asosiy zal)',
      location: 'Chilonzor doʻkoni (Asosiy zal)',
      assignedCashier: 'Azizbek Toshmatov',
      status: 'ACTIVE',
      paymentMethods: ['Naqd pul', 'Uzcard', 'Humo', 'Click'],
      currencies: ['UZS', 'USD'],
      balanceUzs: 18450000,
      balanceUsd: 1250,
    },
    {
      id: 2,
      name: 'Kassa №2 (Ekspress)',
      location: 'Kichik kassa (Tezkor xizmat)',
      assignedCashier: 'Dilfuza Rahimova',
      status: 'ACTIVE',
      paymentMethods: ['Naqd pul', 'Uzcard', 'Humo'],
      currencies: ['UZS'],
      balanceUzs: 12800000,
      balanceUsd: 0,
    },
    {
      id: 3,
      name: 'Kassa №3 (Ombor / Ulgurji)',
      location: 'Markaziy Ombor (Optom savdo)',
      assignedCashier: 'Sardorbek Aliyev',
      status: 'ACTIVE',
      paymentMethods: ['Naqd pul', 'Bank oʻtkazmasi'],
      currencies: ['UZS', 'USD'],
      balanceUzs: 34200000,
      balanceUsd: 3400,
    },
    {
      id: 4,
      name: 'Bosh Seyf (Kassa Boshqarmasi)',
      location: 'Direksiya binosi',
      assignedCashier: 'Bosh Kassir (Menejer)',
      status: 'ACTIVE',
      paymentMethods: ['Inkassatsiya', 'Naqd pul', 'Bank oʻtkazmasi'],
      currencies: ['UZS', 'USD', 'EUR'],
      balanceUzs: 766960000,
      balanceUsd: 48500,
    },
  ]);

  // Cashiers & Shift Logs
  const [cashiers, setCashiers] = useState<CashierRecord[]>([
    {
      id: 1,
      cashierName: 'Azizbek Toshmatov',
      email: 'azizbek@sapar.uz',
      registerName: 'Kassa №1 (Asosiy zal)',
      status: 'OPEN',
      openedAt: 'Bugun, 08:30',
      openingCash: 500000,
      totalSales: 18450000,
      totalChecks: 74,
      cashAmount: 6200000,
      cardAmount: 8400000,
      humoAmount: 2600000,
      onlineAmount: 1250000,
      expectedCash: 6700000,
    },
    {
      id: 2,
      cashierName: 'Dilfuza Rahimova',
      email: 'dilfuza@sapar.uz',
      registerName: 'Kassa №2 (Ekspress)',
      status: 'OPEN',
      openedAt: 'Bugun, 09:00',
      openingCash: 400000,
      totalSales: 12800000,
      totalChecks: 52,
      cashAmount: 4100000,
      cardAmount: 5900000,
      humoAmount: 1800000,
      onlineAmount: 1000000,
      expectedCash: 4500000,
    },
    {
      id: 3,
      cashierName: 'Sardorbek Aliyev',
      email: 'sardor@sapar.uz',
      registerName: 'Kassa №3 (Ombor / Ulgurji)',
      status: 'AUDITED',
      openedAt: 'Kecha, 09:00',
      closedAt: 'Kecha, 20:00',
      openingCash: 500000,
      totalSales: 34200000,
      totalChecks: 38,
      cashAmount: 12000000,
      cardAmount: 15000000,
      humoAmount: 4500000,
      onlineAmount: 2700000,
      expectedCash: 12500000,
      actualCash: 12500000,
      difference: 0,
      auditedBy: 'Bosh buxgalter',
      auditedAt: 'Kecha, 20:15',
    },
  ]);

  useEffect(() => {
    fetchCurrentShift();
  }, []);

  const fetchCurrentShift = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${Constants.API_BASE_URL}/admin/pos/shift/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.data?.hasOpenShift && res.data?.data?.shift) {
        const live = res.data.data.shift;
        setCurrentShift(live);

        setCashiers((prev) => {
          const exists = prev.some((c) => c.cashierName === live.cashierName);
          if (exists) {
            return prev.map((c) =>
              c.cashierName === live.cashierName
                ? {
                  ...c,
                  totalSales: live.totalSales || c.totalSales,
                  totalChecks: live.totalTransactions || c.totalChecks,
                  cashAmount: live.cashSales || c.cashAmount,
                  cardAmount: live.uzcardSales || c.cardAmount,
                  status: 'OPEN',
                }
                : c
            );
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('fetchCurrentShift error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAuditModal = (cashier: CashierRecord) => {
    setSelectedShiftForAudit(cashier);
    setCountedAuditCash(cashier.actualCash || cashier.expectedCash || cashier.cashAmount + cashier.openingCash);
    setIsAuditModalOpen(true);
  };

  const handleAuditAndInkassatsiya = () => {
    if (!selectedShiftForAudit) return;

    const expected = selectedShiftForAudit.expectedCash || selectedShiftForAudit.openingCash + selectedShiftForAudit.cashAmount;
    const diff = countedAuditCash - expected;

    setCashiers((prev) =>
      prev.map((c) =>
        c.id === selectedShiftForAudit.id
          ? {
            ...c,
            status: 'AUDITED',
            actualCash: countedAuditCash,
            difference: diff,
            auditedBy: 'Boshqaruvchi (Menejer)',
            auditedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
          : c
      )
    );

    setIsAuditModalOpen(false);
    toast.success(
      `Smena tekshirildi va ${format(countedAuditCash)} mablagʻ ${inkassatsiyaTarget === 'SAFE' ? 'Bosh Seyfga' : 'Bank hisobiga'
      } inkassatsiya qilindi!`
    );
  };

  const handleCreateRegister = () => {
    if (!newRegisterName.trim()) {
      toast.error('Kassa nomini kiriting!');
      return;
    }
    const newReg: CashRegister = {
      id: Date.now(),
      name: newRegisterName,
      location: newRegisterLocation,
      assignedCashier: newRegisterCashier,
      status: 'ACTIVE',
      paymentMethods: ['Naqd pul', 'Uzcard', 'Humo'],
      currencies: ['UZS'],
      balanceUzs: 0,
      balanceUsd: 0,
    };
    setRegisters([...registers, newReg]);
    setIsRegisterModalOpen(false);
    setNewRegisterName('');
    toast.success('Yangi Kassa Registri ochildi!');
  };

  const filteredCashiers = cashiers.filter(
    (c) =>
      c.cashierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.registerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = cashiers.reduce((acc, c) => acc + (c.status === 'OPEN' ? c.totalSales : 0), 0);
  const activeCount = cashiers.filter((c) => c.status === 'OPEN').length;
  const totalChecks = cashiers.reduce((acc, c) => acc + (c.status === 'OPEN' ? c.totalChecks : 0), 0);

  // Multi-currency cashbox calculations (Sapar match)
  const totalCashUzs = registers.reduce((acc, r) => acc + r.balanceUzs, 0);
  const totalCashUsd = registers.reduce((acc, r) => acc + r.balanceUsd, 0);

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto font-sans text-slate-800 animate-fade-in-up">
      <PageHeader title="Kassirlar Jurnali va Kassa Registrlari">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/pos/shifts')}
            className="text-xs font-bold"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
            Smenalar & X/Z
          </Button>
          <Button
            onClick={() => navigate('/admin/pos')}
            className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm"
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
            Kassa Terminali
          </Button>
        </div>
      </PageHeader>

      {/* Top Level Navigation Tabs */}
      <Tabs
        variant="segmented"
        value={activeTab}
        onChange={setActiveTab}
        tabs={[
          { key: 'cashiers', label: 'Faol Kassirlar & Smenalar', icon: <Users className="w-4 h-4" /> },
          { key: 'cashbox', label: 'Kassadagi Pullar (Multi-valyuta)', icon: <Coins className="w-4 h-4" /> },
          { key: 'registers', label: 'Kassa Registrlari & Biriktirish', icon: <Building2 className="w-4 h-4" /> },
        ]}
      />

      {/* TAB 1: CASHIERS & SHIFTS */}
      {activeTab === 'cashiers' && (
        <div className="space-y-6">
          {/* Overview Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faol Kassalar</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{activeCount} ta kassa</h3>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ish rejimidagi terminallar
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bugungi Tushum</p>
                <h3 className="text-2xl font-black text-teal-700 mt-1">{format(totalRevenue)}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Faol smenalar boʻyicha</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jami Cheklar</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{totalChecks} ta chek</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Fiskal cheklar soni</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Oʻrtacha Chek</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {format(totalChecks > 0 ? Math.round(totalRevenue / totalChecks) : 0)}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Mijoz boshiga oʻrtacha</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Cashiers Table Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Kassir yoki kassa nomi boʻyicha qidirish..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 transition"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigate('/admin/pos/shifts')}
                  className="text-xs bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Yangi Smena Ochish
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/70">
                  <tr>
                    <th className="px-5 py-3.5">Kassir & Foydalanuvchi</th>
                    <th className="px-4 py-3.5">Kassa Registri</th>
                    <th className="px-4 py-3.5">Holati</th>
                    <th className="px-4 py-3.5">Smena Vaqti</th>
                    <th className="px-4 py-3.5 text-right">Boshlangʻich Qoldiq</th>
                    <th className="px-4 py-3.5 text-right">Savdo Tushumi</th>
                    <th className="px-4 py-3.5 text-center">Cheklar</th>
                    <th className="px-5 py-3.5 text-right">Menejer Auditi & Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredCashiers.map((cashier) => {
                    const isOpen = cashier.status === 'OPEN';
                    const isAudited = cashier.status === 'AUDITED';

                    return (
                      <tr key={cashier.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                              {cashier.cashierName[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{cashier.cashierName}</p>
                              <p className="text-[11px] text-slate-400 truncate">{cashier.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-semibold text-slate-800">{cashier.registerName}</span>
                        </td>

                        <td className="px-4 py-4">
                          {isOpen && (
                            <Badge color="success" variant="soft">
                              ● Faol Smena
                            </Badge>
                          )}
                          {isAudited && (
                            <Badge color="primary" variant="soft">
                              ✓ Qabul Qilindi
                            </Badge>
                          )}
                          {cashier.status === 'CLOSED' && (
                            <Badge color="warning" variant="soft">
                              Yopilgan (Audit kutilmoqda)
                            </Badge>
                          )}
                        </td>

                        <td className="px-4 py-4 text-slate-500">
                          <div className="flex flex-col text-[11px]">
                            <span>Ochilgan: {cashier.openedAt}</span>
                            {cashier.closedAt && <span className="text-slate-400">Yopilgan: {cashier.closedAt}</span>}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-right font-mono text-slate-600">
                          {format(cashier.openingCash)}
                        </td>

                        <td className="px-4 py-4 text-right">
                          <p className="font-bold font-mono text-slate-900">{format(cashier.totalSales)}</p>
                          <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400 mt-0.5 font-mono">
                            <span>{format(cashier.cashAmount)} Naqd</span>
                            <span>•</span>
                            <span>{format(cashier.cardAmount)} Karta</span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                            {cashier.totalChecks} ta
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isOpen ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate('/admin/pos/shifts')}
                                className="text-xs text-amber-700 hover:bg-amber-50 border-amber-200"
                              >
                                Smenani Yopish
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => openAuditModal(cashier)}
                                className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                {isAudited ? 'Qayta tekshirish' : 'Tekshirish & Inkassatsiya'}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate('/admin/pos')}
                              className="text-xs"
                            >
                              Terminal
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-CURRENCY CASHBOX BREAKDOWN (Matches Sapar "Kassadagi pullar") */}
      {activeTab === 'cashbox' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Kassadagi Pullar (Multi-valyuta & Toʻlov Kanallari)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Barcha kassa registrlari, terminallar va seyfdagi qoldiqlar (Sapar standarti boʻyicha)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
                  1 USD = 12 750 UZS
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold">
                  1 RUB = 142 UZS
                </div>
              </div>
            </div>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5">Kassa / Toʻlov Turi</th>
                    <th className="px-4 py-3.5 text-right font-mono">UZS (Soʻm)</th>
                    <th className="px-4 py-3.5 text-right font-mono">USD ($)</th>
                    <th className="px-4 py-3.5 text-right font-mono">RUB (₽)</th>
                    <th className="px-4 py-3.5 text-right">Holati</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="px-4 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-emerald-600" /> Naqd pul (Barcha kassalarda)
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-slate-900">
                      {format(totalCashUzs)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-emerald-700">
                      ${totalCashUsd.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-slate-400">12 000 ₽</td>
                    <td className="px-4 py-4 text-right">
                      <Badge color="success" variant="soft">Mavjud</Badge>
                    </td>
                  </tr>

                  <tr>
                    <td className="px-4 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-600" /> Terminal (Uzcard & Humo)
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-slate-900">
                      {format(143000000)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-slate-400">$0</td>
                    <td className="px-4 py-4 text-right font-mono text-slate-400">0 ₽</td>
                    <td className="px-4 py-4 text-right">
                      <Badge color="primary" variant="soft">Bankda</Badge>
                    </td>
                  </tr>

                  <tr>
                    <td className="px-4 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-cyan-600" /> Click & Payme (QR toʻlovlar)
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-slate-900">
                      {format(42060000)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-slate-400">$0</td>
                    <td className="px-4 py-4 text-right font-mono text-slate-400">0 ₽</td>
                    <td className="px-4 py-4 text-right">
                      <Badge color="info" variant="soft">Tranzaktsiyada</Badge>
                    </td>
                  </tr>

                  <tr>
                    <td className="px-4 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-purple-600" /> Pul oʻtkazmasi (Hisob-kitob hisobvaragʻi)
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-slate-900">
                      {format(248500000)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-emerald-700">$24,500</td>
                    <td className="px-4 py-4 text-right font-mono text-slate-400">0 ₽</td>
                    <td className="px-4 py-4 text-right">
                      <Badge color="teal" variant="soft">Hisobda</Badge>
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50/90 font-black border-t-2 border-slate-300">
                  <tr>
                    <td className="px-4 py-4 uppercase text-slate-900">Jami Mablagʻlar:</td>
                    <td className="px-4 py-4 text-right font-mono text-teal-800 text-sm">
                      {format(totalCashUzs + 143000000 + 42060000 + 248500000)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-emerald-700 text-sm">
                      ${(totalCashUsd + 24500).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-slate-600 text-sm">12 000 ₽</td>
                    <td className="px-4 py-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REGISTERS MANAGEMENT & CASHIER ASSIGNMENT */}
      {activeTab === 'registers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Kassa Registrlari & Biriktirish</h3>
              <p className="text-xs text-slate-500">
                Har bir savdo nuqtasi uchun jismoniy yoki virtual terminallarni boshqarish
              </p>
            </div>
            <Button
              onClick={() => setIsRegisterModalOpen(true)}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Yangi Kassa Qoʻshish
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registers.map((reg) => (
              <div
                key={reg.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-teal-300 transition space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{reg.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{reg.location}</p>
                  </div>
                  <Badge color="success" variant="soft">
                    Faol
                  </Badge>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Biriktirilgan Kassir:</span>
                    <span className="font-bold text-slate-900">{reg.assignedCashier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Qoʻllab-quvvatlanuvchi valyuta:</span>
                    <span className="font-bold text-slate-900">{reg.currencies.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Toʻlov turlari:</span>
                    <span className="text-slate-700">{reg.paymentMethods.join(' • ')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Joriy Kassa Qoldigʻi</p>
                    <p className="font-mono font-bold text-slate-900 text-sm">{format(reg.balanceUzs)}</p>
                    {reg.balanceUsd > 0 && (
                      <p className="font-mono text-xs text-emerald-600 font-bold">${reg.balanceUsd.toLocaleString()}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/admin/pos/shifts')}
                      className="text-xs"
                    >
                      Smenani Ochish
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => navigate('/admin/pos')}
                      className="bg-teal-700 text-white text-xs"
                    >
                      Terminal
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: MANAGER AUDIT & INKASSATSIYA */}
      <Dialog open={isAuditModalOpen} onOpenChange={setIsAuditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              Menejer Auditi & Inkassatsiya
            </DialogTitle>
            <DialogDescription>
              Kassir smenasi Z-hisobotini tekshiring, kamomad/ortiqchani tasdiqlang va mablagʻni Seyfga oʻtkazing.
            </DialogDescription>
          </DialogHeader>

          {selectedShiftForAudit && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Kassir:</span>
                  <span className="font-bold text-slate-900">{selectedShiftForAudit.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kassa Registri:</span>
                  <span className="font-bold text-slate-900">{selectedShiftForAudit.registerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tizim boʻyicha kutilgan naqd pul:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {format(selectedShiftForAudit.expectedCash || selectedShiftForAudit.cashAmount + selectedShiftForAudit.openingCash)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Haqiqiy sanalgan naqd pul (soʻm):
                </label>
                <input
                  type="number"
                  value={countedAuditCash}
                  onChange={(e) => setCountedAuditCash(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Difference Status Box */}
              {(() => {
                const exp = selectedShiftForAudit.expectedCash || selectedShiftForAudit.cashAmount + selectedShiftForAudit.openingCash;
                const diff = countedAuditCash - exp;
                if (diff === 0) {
                  return (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Teng:</strong> Kamomad yoki ortiqcha aniqlanmadi (Kassa toʻgʻri).</span>
                    </div>
                  );
                }
                if (diff < 0) {
                  return (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span><strong>Kamomad:</strong> {format(Math.abs(diff))} kam chiqdi (Kassir hisobiga).</span>
                    </div>
                  );
                }
                return (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>Ortiqcha:</strong> +{format(diff)} ortiqcha pul aniqlandi.</span>
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Inkassatsiya yoʻnalishi:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInkassatsiyaTarget('SAFE')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${inkassatsiyaTarget === 'SAFE'
                        ? 'border-teal-600 bg-teal-50 text-teal-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <Building2 className="w-3.5 h-3.5" /> Bosh Seyf
                  </button>
                  <button
                    type="button"
                    onClick={() => setInkassatsiyaTarget('BANK')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${inkassatsiyaTarget === 'BANK'
                        ? 'border-teal-600 bg-teal-50 text-teal-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" /> Bank Hisobvaragʻi
                  </button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAuditModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleAuditAndInkassatsiya} className="bg-teal-700 hover:bg-teal-800 text-white font-bold">
              Tasdiqlash & Inkassatsiya Qilish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: ADD NEW CASH REGISTER */}
      <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yangi Kassa Registri Ochish</DialogTitle>
            <DialogDescription>
              Yangi savdo terminali yarating va unga masʼul kassirni biriktiring.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kassa Nomi:</label>
              <input
                type="text"
                placeholder="masalan: Kassa №4 (Yangi filial)"
                value={newRegisterName}
                onChange={(e) => setNewRegisterName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Joylashuvi / Filial:</label>
              <input
                type="text"
                value={newRegisterLocation}
                onChange={(e) => setNewRegisterLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Masʼul Kassirni Biriktirish:</label>
              <select
                value={newRegisterCashier}
                onChange={(e) => setNewRegisterCashier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-teal-500"
              >
                <option value="Azizbek Toshmatov">Azizbek Toshmatov (Kassir 1)</option>
                <option value="Dilfuza Rahimova">Dilfuza Rahimova (Kassir 2)</option>
                <option value="Sardorbek Aliyev">Sardorbek Aliyev (Ombor kassiri)</option>
                <option value="Shokirjon Rizoyev">Shokirjon Rizoyev (Admin / Menejer)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsRegisterModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleCreateRegister} className="bg-teal-700 hover:bg-teal-800 text-white font-bold">
              Kassani Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PosCashiersPage;
