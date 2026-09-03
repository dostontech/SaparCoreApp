import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Clock,
  User,
  DollarSign,
  Building2,
  Play,
  X,
  ShieldCheck,
  Coins,
  Info,
  Search,
  ChevronDown,
  Check,
  Briefcase,
  Users,
} from 'lucide-react';
import { Button } from '@components/ui';
import Constants from '@constants/api';

interface EmployeeOption {
  id: string;
  name: string;
  role: string;
  department: string;
  phone?: string;
  avatarBg: string;
  assignedRegister?: string;
}

const DEFAULT_STAFF: EmployeeOption[] = [
  {
    id: 'emp-1',
    name: 'Azizbek Toshmatov',
    role: 'Katta Kassir',
    department: 'Savdo zali',
    avatarBg: 'bg-teal-600',
    assignedRegister: 'Kassa №1 (Asosiy zal)',
  },
  {
    id: 'emp-2',
    name: 'Dilfuza Rahimova',
    role: 'Kassir-operator',
    department: 'Ekspress kassa',
    avatarBg: 'bg-emerald-600',
    assignedRegister: 'Kassa №2 (Ekspress)',
  },
  {
    id: 'emp-3',
    name: 'Sardorbek Aliyev',
    role: 'Omborchi-kassir',
    department: 'Ulgurji ombor',
    avatarBg: 'bg-cyan-700',
    assignedRegister: 'Kassa №3 (Ulgurji)',
  },
  {
    id: 'emp-4',
    name: 'Nodira Karimova',
    role: 'Kassir',
    department: 'Savdo zali',
    avatarBg: 'bg-amber-600',
  },
  {
    id: 'emp-5',
    name: 'Jasurbek Ergashev',
    role: 'Sotuvchi-maslahatchi',
    department: 'Elektronika',
    avatarBg: 'bg-indigo-600',
  },
  {
    id: 'emp-6',
    name: 'Kassir',
    role: 'Umumiy Kassa Hisobi',
    department: 'Boshqaruv',
    avatarBg: 'bg-slate-700',
  },
];

interface PosOpenShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShift: (shiftData: {
    cashierName: string;
    registerName: string;
    branchName: string;
    openingCash: number;
  }) => void;
  initialCashier?: string;
  initialCash?: number;
  initialRegister?: string;
  initialBranch?: string;
}

const QUICK_FLOAT_AMOUNTS = [
  { label: '0 soʻm', value: 0 },
  { label: '100 000', value: 100000 },
  { label: '200 000', value: 200000 },
  { label: '500 000', value: 500000 },
  { label: '1 000 000', value: 1000000 },
  { label: '2 000 000', value: 2000000 },
];

export const PosOpenShiftModal: React.FC<PosOpenShiftModalProps> = ({
  isOpen,
  onClose,
  onOpenShift,
  initialCashier = 'Kassir',
  initialCash = 500000,
  initialRegister = 'Kassa №1 (Asosiy zal)',
  initialBranch = 'Bosh Ofis & Showroom',
}) => {
  const [cashierName, setCashierName] = useState(initialCashier);
  const [registerName, setRegisterName] = useState(initialRegister);
  const [branchName, setBranchName] = useState(initialBranch);
  const [openingCash, setOpeningCash] = useState<number>(initialCash);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Employee Dropdown & Search state
  const [staffList, setStaffList] = useState<EmployeeOption[]>(DEFAULT_STAFF);
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch employees from HRM API if available
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (!token) return;
        const res = await axios.get(`${Constants.API_BASE_URL}/admin/hrm/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = res.data?.data?.employees || res.data?.employees || res.data?.data;
        if (Array.isArray(list) && list.length > 0) {
          const mapped: EmployeeOption[] = list.map((e: any, idx: number) => ({
            id: String(e.id || idx),
            name: `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.name || 'Xodim',
            role: e.designation || e.role || 'Kassir',
            department: e.department || 'Savdo',
            avatarBg: 'bg-teal-600',
          }));
          setStaffList([
            ...DEFAULT_STAFF,
            ...mapped.filter((m) => !DEFAULT_STAFF.some((d) => d.name === m.name)),
          ]);
        }
      } catch {
        /* fallback to DEFAULT_STAFF */
      }
    };
    fetchEmployees();
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsEmployeeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Filter staff by typed cashier name
  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(cashierName.toLowerCase()) ||
      s.role.toLowerCase().includes(cashierName.toLowerCase()) ||
      s.department.toLowerCase().includes(cashierName.toLowerCase())
  );

  const handleSelectEmployee = (emp: EmployeeOption) => {
    setCashierName(emp.name);
    if (emp.assignedRegister) {
      setRegisterName(emp.assignedRegister);
    }
    setIsEmployeeDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      onOpenShift({
        cashierName: cashierName.trim() || 'Kassir',
        registerName,
        branchName,
        openingCash: Number(openingCash) || 0,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('uz-UZ').format(num);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0B2B33] to-[#0D3B46] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#02C39A] text-[#0B2B33] flex items-center justify-center font-black shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Yangi Kassa Smenasini Ochish</h3>
              <p className="text-[11px] text-[#02C39A]">Kassir roʻyxatdan oʻtishi va kassa qoldigʻi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700">
          {/* Kassir F.I.Sh. — Searchable Dropdown / Combobox */}
          <div className="space-y-1 relative" ref={dropdownRef}>
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#028090]" />
                <span>Kassir F.I.Sh.</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Xodimlar roʻyxatidan qidirish yoki yozish</span>
            </label>

            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                required
                value={cashierName}
                onChange={(e) => {
                  setCashierName(e.target.value);
                  setIsEmployeeDropdownOpen(true);
                }}
                onFocus={() => setIsEmployeeDropdownOpen(true)}
                placeholder="Kassir ismini yozing yoki tanlang..."
                className="w-full pl-9 pr-16 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#028090] focus:border-transparent bg-slate-50"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />

              <div className="absolute right-2 top-2 flex items-center gap-1">
                {cashierName && (
                  <button
                    type="button"
                    onClick={() => {
                      setCashierName('');
                      inputRef.current?.focus();
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsEmployeeDropdownOpen((prev) => !prev)}
                  className="p-1 text-slate-400 hover:text-[#028090] rounded transition"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isEmployeeDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Dropdown Employee List */}
            {isEmployeeDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 z-30 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between sticky top-0 backdrop-blur-xs">
                  <span>Xodimlar roʻyxati ({filteredStaff.length})</span>
                  <span className="text-teal-700">Tanlash uchun bosing</span>
                </div>

                {filteredStaff.length > 0 ? (
                  filteredStaff.map((emp) => {
                    const isSelected = cashierName.toLowerCase() === emp.name.toLowerCase();
                    return (
                      <div
                        key={emp.id}
                        onClick={() => handleSelectEmployee(emp)}
                        className={`p-2.5 flex items-center justify-between gap-3 hover:bg-teal-50/60 cursor-pointer transition ${
                          isSelected ? 'bg-teal-50/90' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg ${emp.avatarBg} text-white flex items-center justify-center font-bold text-[11px] shrink-0`}
                          >
                            {emp.name.charAt(0)}
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-slate-900 text-xs truncate flex items-center gap-1.5">
                              <span>{emp.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#028090] shrink-0" />}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-2">
                              <span>{emp.role}</span>
                              <span>•</span>
                              <span className="text-slate-400">{emp.department}</span>
                            </div>
                          </div>
                        </div>

                        {emp.assignedRegister && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                            {emp.assignedRegister.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-slate-500 space-y-1">
                    <p className="text-xs font-semibold">«{cashierName}» topilmadi</p>
                    <p className="text-[10px] text-slate-400">
                      Ushbu yangi ism bilan kassa smenasini davom ettirishingiz mumkin.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Kassa & Filial */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Kassa apparati:</label>
              <select
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-[#028090]"
              >
                <option value="Kassa №1 (Asosiy zal)">Kassa №1 (Asosiy)</option>
                <option value="Kassa №2 (Ekspress)">Kassa №2 (Ekspress)</option>
                <option value="Kassa №3 (Ulgurji)">Kassa №3 (Ulgurji)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Filial:</label>
              <select
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-[#028090]"
              >
                <option value="Bosh Ofis & Showroom">Bosh Ofis & Showroom</option>
                <option value="Chilonzor Savdo Markazi">Chilonzor Savdo</option>
                <option value="Sergeli Ombori">Sergeli Ombori</option>
              </select>
            </div>
          </div>

          {/* Boshlangʻich naqd pul qoldigʻi (Kassa float, soʻm) */}
          <div className="space-y-1.5 pt-1">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span>Boshlangʻich naqd pul qoldigʻi (Kassa float, soʻm)</span>
              <span className="font-mono font-bold text-[#028090] text-xs">
                {formatNumber(openingCash)} soʻm
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1000"
                value={openingCash}
                onChange={(e) => setOpeningCash(Number(e.target.value))}
                placeholder="500000"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#028090] focus:border-transparent bg-slate-50"
              />
              <Coins className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            {/* Quick Float Amount Buttons */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {QUICK_FLOAT_AMOUNTS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setOpeningCash(item.value)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition cursor-pointer text-center ${
                    openingCash === item.value
                      ? 'bg-[#028090] text-white border-[#028090] shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info Note */}
          <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200/80 flex items-start gap-2.5 text-[11px] text-slate-600">
            <Info className="w-4 h-4 text-[#028090] shrink-0 mt-0.5" />
            <span>
              <strong>Kassa float</strong> — smena boshida xaridorlarga qaytim berish uchun kassada mavjud boshlangʻich naqd puldir.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-bold border-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              Bekor Qilish
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#02C39A] hover:bg-[#02A683] text-[#0B2B33] font-black text-xs px-6 py-2.5 shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Smenani Boshlash</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PosOpenShiftModal;
