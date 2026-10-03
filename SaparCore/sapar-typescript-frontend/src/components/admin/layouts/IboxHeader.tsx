import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { logout } from '@store/auth/authSlice';
import {
  Building2,
  HelpCircle,
  ChevronDown,
  ChevronLeft,
  Search,
  User,
  LogOut,
  Settings,
  Store,
  MapPin,
  CheckCircle2,
  Activity,
  CreditCard,
  Radio,
  ShieldAlert,
  Sliders,
  Headphones,
  BookOpen,
} from 'lucide-react';
import { GlobalSearchModal } from '../header/GlobalSearchModal';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@components/ui';
import { toast } from 'sonner';

interface SaparHeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  hideLogo?: boolean;
  isSuperAdminMode?: boolean;
}

interface CompanyItem {
  id: string;
  name: string;
  tin: string;
}

interface HeaderBranchItem {
  id: string;
  name: string;
  code: string;
  region: string;
}

const DEFAULT_COMPANIES: CompanyItem[] = [
  { id: 'comp-1', name: 'SAPAR Korxonasi', tin: '301234567' },
];


const DEFAULT_HEADER_BRANCHES: HeaderBranchItem[] = [
  { id: 'br-1', name: 'Bosh Ofis & Showroom', code: 'FIL-01', region: 'Toshkent shahri' },
  { id: 'br-2', name: 'Chilonzor Savdo Doʻkoni', code: 'FIL-02', region: 'Toshkent shahri' },
  { id: 'br-3', name: 'Samarqand Mintaqaviy Filiali', code: 'FIL-03', region: 'Samarqand viloyati' },
  { id: 'br-4', name: 'Qoʻyliq Logistika Bazasi', code: 'FIL-04', region: 'Toshkent viloyati' },
  { id: 'br-5', name: 'Fargʻona Yetkazib Berish Punkti', code: 'FIL-05', region: 'Fargʻona viloyati' },
];

export const SaparHeader: React.FC<SaparHeaderProps> = ({
  toggleSidebar,
  isSidebarOpen,
  hideLogo = false,
  isSuperAdminMode = false,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const displayUserName = useMemo(() => {
    if (user) {
      const full = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      if (full) return full;
      if (user.email) return user.email;
    }
    return localStorage.getItem('userName') || 'Foydalanuvchi';
  }, [user]);

  const userRoleBadge = useMemo(() => {
    const email = (user?.email || localStorage.getItem('userEmail') || '').toLowerCase();
    if (email.includes('buxgalter')) {
      return { title: 'Bosh Buxgalter', desc: 'Buxgalteriya & Moliya', icon: '👩‍💼', color: 'text-teal-300' };
    }
    if (email.includes('stroy')) {
      return { title: displayUserName || 'Omborxona', desc: 'Omborxona & Savdo', icon: '🏗️', color: 'text-cyan-300' };
    }
    return { title: 'Boshqaruvchi / Admin', desc: 'Barcha Huquqlar', icon: '🏢', color: 'text-[#02C39A]' };
  }, [user]);

  const userInitial = useMemo(() => {
    if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
    return displayUserName.charAt(0).toUpperCase() || 'S';
  }, [user, displayUserName]);

  // Companies
  const [companies] = useState<CompanyItem[]>(DEFAULT_COMPANIES);
  const [activeCompanyId, setActiveCompanyId] = useState<string>(() => {
    return localStorage.getItem('sapar_active_company_id') || 'comp-1';
  });
  const activeCompany = companies.find((c) => c.id === activeCompanyId) || companies[0] || { id: 'comp-1', name: 'SAPAR Korxonasi', tin: '301234567' };

  // Branches
  const [branches, setBranches] = useState<HeaderBranchItem[]>(() => {
    try {
      const saved = localStorage.getItem('sapar_branches_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_HEADER_BRANCHES;
  });

  const [activeBranchId, setActiveBranchId] = useState<string>(() => {
    return localStorage.getItem('sapar_active_branch_id') || 'br-1';
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keep branch list fresh if storage updates
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('sapar_branches_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setBranches(parsed);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  const handleSelectCompany = (comp: CompanyItem) => {
    setActiveCompanyId(comp.id);
    try {
      localStorage.setItem('sapar_active_company_id', comp.id);
    } catch {
      // ignore
    }
    toast.success(`«${comp.name}» korxonasiga oʻtildi`);
  };

  const handleSelectBranch = (b: HeaderBranchItem) => {
    setActiveBranchId(b.id);
    try {
      localStorage.setItem('sapar_active_branch_id', b.id);
    } catch {
      // ignore
    }
    toast.success(`«${b.name}» filialiga oʻtildi`);
  };

  const handleLogout = () => {
    dispatch(logout());
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    navigate('/login');
  };

  const isSuperAdmin = user?.user_type === 1 || user?.email?.toLowerCase().includes('admin');
  const handleLogoClick = () => {
    if (isSuperAdmin) {
      navigate('/admin');
    } else {
      const saved = localStorage.getItem('sapar_sidebar_modules');
      let target = '/sales';
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.pos) target = '/pos';
          else if (parsed.sales) target = '/sales';
          else if (parsed.inventory) target = '/inventory';
        } catch {}
      }
      navigate(target);
    }
  };

  return (
    <header className="bg-[#0B2B33] border-b border-[#028090]/40 text-white h-14 px-3 sm:px-5 flex items-center justify-between shadow-md z-40 select-none">
      {/* Left Section: Sidebar Toggle / Brand Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Only show logo in header if not explicitly hidden (hideLogo !== true) */}
        {!hideLogo && (
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 cursor-pointer group pr-1 sm:pr-2"
          >
            {/* SAPAR SVG Geometric Logo Mark */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#028090] to-[#02C39A] p-0.5 shadow-sm flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 41 45"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.571411 14.4812V25.6239L7.62723 21.7237V14.8521L18.3063 8.90914L11.4419 4.82776L3.89365 8.95446C1.84171 10.0763 0.571411 12.1895 0.571411 14.4812Z"
                  fill="#FFFFFF"
                />
                <path
                  d="M41 30.0855V18.9429L33.9442 22.843V29.7146L23.2651 35.6576L30.1295 39.739L37.6778 35.6123C39.7298 34.4904 41 32.3772 41 30.0855Z"
                  fill="#0B2B33"
                />
                <path
                  d="M40.6892 14.0206L40.8093 15.6004L33.7535 19.3148V14.8575L13.7302 4.08136L20.5946 0L37.3268 8.93073C39.2607 9.96294 40.5263 11.8787 40.6892 14.0206Z"
                  fill="#02C39A"
                />
                <path
                  d="M0.12016 30.925L0 29.3451L7.05584 25.6307V30.088L27.0791 40.8642L20.2147 44.9456L3.48254 36.0148C1.54864 34.9826 0.283068 33.0668 0.12016 30.925Z"
                  fill="#028090"
                />
              </svg>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-white font-sans">SAPAR</span>
            </div>
          </div>
        )}

        {/* Sidebar Expand Button — only shown when sidebar is closed/collapsed */}
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="w-7 h-7 rounded-lg bg-[#0D3B46] hover:bg-[#028090] border border-[#028090]/30 flex items-center justify-center text-white transition text-xs shadow-xs cursor-pointer"
            title="Menyuni ochish"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </button>
        )}
      </div>

      {/* Center Section: Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden sm:flex items-center">
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-[#082026] hover:bg-[#06181D] text-slate-300 hover:text-white transition border border-[#028090]/40 text-xs font-medium cursor-pointer shadow-2xs group"
          title="Tizim boʻyicha qidirish (Ctrl+K)"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#02C39A] group-hover:scale-110 transition-transform" />
            <span className="truncate">Tizim boʻyicha qidirish (Mijozlar, Fakturalar, Tovarlar)...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-[#02C39A] bg-[#0D3B46] rounded border border-[#028090]/40 shadow-xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Section: Filiallar/Status, Help, User */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {isSuperAdminMode ? (
          /* Super Admin Platform Indicator */
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#082026] border border-[#028090]/40 text-xs shadow-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
              <span className="font-extrabold text-[#02C39A] text-[11px] tracking-wide">Tashkent DC</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] text-slate-300 font-medium">UzCloud 99.98%</span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] font-bold text-teal-300">7 Korxona</span>
          </div>
        ) : (
          /* Normal Tenant Filiallar va Korxonalar Switcher Dropdown */
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#0D3B46] hover:bg-[#028090] border border-[#028090]/40 text-xs font-bold transition text-white shadow-xs group cursor-pointer"
                title="Filial va korxonani almashtirish"
              >
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#028090] to-[#02C39A] text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-2xs">
                  <Building2 className="w-3 h-3 text-[#0B2B33]" />
                </div>
                <div className="text-left flex flex-col min-w-0 max-w-[120px] sm:max-w-[160px]">
                  <span className="truncate text-xs font-bold text-white leading-tight">
                    {activeBranch?.name || activeCompany?.name || 'Asosiy Korxona'}
                  </span>
                  <span className="truncate text-[10px] text-[#02C39A] font-medium leading-tight">
                    {activeCompany?.name || 'SAPAR ERP'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-300 group-hover:text-white shrink-0 ml-0.5" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-72 bg-[#0B2B33] text-slate-100 border border-[#028090]/40 shadow-xl p-1.5 rounded-xl">
              {/* 1. Korxonalar */}
              <div className="px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-[#02C39A]" /> Korxonalar ({companies.length})
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/admin/settings/company-settings')}
                  className="text-[10px] font-bold text-[#02C39A] hover:underline cursor-pointer"
                >
                  Rekvizitlar
                </button>
              </div>

              <div className="space-y-0.5 mb-1.5">
                {companies.map((comp) => (
                  <DropdownMenuItem
                    key={comp.id}
                    onClick={() => handleSelectCompany(comp)}
                    className={`px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center justify-between text-xs font-bold transition ${comp.id === activeCompany?.id
                        ? 'bg-[#0D3B46] text-[#02C39A] ring-1 ring-[#02C39A]/40'
                        : 'text-slate-200 hover:bg-[#0D3B46]/70 hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded-md bg-[#028090]/20 flex items-center justify-center text-[#02C39A] font-bold text-[10px] shrink-0">
                        {comp.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="truncate">{comp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono font-normal">STIR: {comp.tin}</div>
                      </div>
                    </div>
                    {comp.id === activeCompany?.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#02C39A] shrink-0 ml-2" />
                    )}
                  </DropdownMenuItem>
                ))}
              </div>

              <DropdownMenuSeparator className="bg-[#028090]/30 my-1.5" />

              {/* 2. Filiallar */}
              <div className="px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Store className="w-3.5 h-3.5 text-[#02C39A]" /> Filiallar ({branches.length})
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/admin/settings/branches')}
                  className="text-[10px] font-bold text-[#02C39A] hover:underline cursor-pointer"
                >
                  Barchasi
                </button>
              </div>

              <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-0.5">
                {branches.map((b) => (
                  <DropdownMenuItem
                    key={b.id}
                    onClick={() => handleSelectBranch(b)}
                    className={`px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center justify-between text-xs transition ${b.id === activeBranch?.id
                        ? 'bg-[#028090] text-white font-black shadow-2xs'
                        : 'text-slate-200 hover:bg-[#0D3B46] hover:text-[#02C39A]'
                      }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="px-1.5 py-0.2 rounded font-mono text-[9px] font-bold bg-black/20 text-slate-200 shrink-0">
                        {b.code}
                      </span>
                      <div className="truncate">
                        <div className="truncate font-bold">{b.name}</div>
                        <div className="text-[10px] text-slate-300 font-normal truncate flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 shrink-0" /> {b.region}
                        </div>
                      </div>
                    </div>

                    {b.id === activeBranch?.id && (
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0 ml-2" />
                    )}
                  </DropdownMenuItem>
                ))}
              </div>

              <DropdownMenuSeparator className="bg-[#028090]/30 my-1.5" />

              {/* 3. Bottom Links */}
              <DropdownMenuItem
                onClick={() => navigate('/admin/settings/branches')}
                className="px-2.5 py-1.5 text-xs font-bold text-[#02C39A] hover:bg-[#0D3B46] rounded-lg cursor-pointer flex items-center gap-2"
              >
                <Store className="w-3.5 h-3.5" /> Filiallarni boshqarish
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => navigate('/admin/settings/company-settings')}
                className="px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-[#0D3B46] hover:text-white rounded-lg cursor-pointer flex items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5 text-[#02C39A]" /> Korxona rekvizitlari
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Help Circle - links to Guide */}
        <button
          type="button"
          onClick={() => navigate(isSuperAdminMode ? '/admin?tab=guide' : '/admin/guide')}
          className="w-8 h-8 rounded-lg bg-[#0D3B46] hover:bg-[#028090] border border-[#028090]/30 flex items-center justify-center text-white text-xs font-bold transition cursor-pointer"
          title="Yordam va qoʻllanma"
        >
          <HelpCircle className="w-4 h-4 text-[#02C39A]" />
        </button>

        {/* User Profile Avatar Circle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 p-0.5 rounded-lg hover:ring-2 hover:ring-[#02C39A]/50 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#028090] to-[#02C39A] border border-[#02C39A]/60 flex items-center justify-center text-[#0B2B33] font-black text-xs shadow-xs">
                {isSuperAdminMode ? '👑' : userInitial}
              </div>
              <ChevronDown className="w-3 h-3 text-slate-300 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={isSuperAdminMode ? "w-64 bg-[#0B2B33] text-white border-[#028090]/40 p-1.5 rounded-xl shadow-2xl" : "w-56 bg-[#0B2B33] text-white border-[#028090]/40"}>
            {isSuperAdminMode ? (
              <>
                <div className="px-2.5 py-2 flex items-center gap-2.5 border-b border-[#028090]/30">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#028090] to-[#02C39A] flex items-center justify-center text-[#0B2B33] font-black text-xs shrink-0">
                    👑
                  </div>
                  <div className="min-w-0">
                    <DropdownMenuLabel className="font-bold text-white truncate p-0 text-xs">Super Admin</DropdownMenuLabel>
                    <div className="text-[11px] text-[#02C39A] font-medium leading-tight">SaaS Platforma Boshqaruvi</div>
                    <div className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@sapar.uz'}</div>
                  </div>
                </div>
                <div className="py-1 space-y-0.5">
                  <DropdownMenuItem onClick={() => navigate('/admin?tab=overview')} className="!text-slate-200 hover:!text-white focus:!text-white focus:bg-[#0D3B46] rounded-lg cursor-pointer text-xs font-semibold py-1.5">
                    <Activity className="w-4 h-4 mr-2 text-[#02C39A]" /> Asosiy Koʻrsatkichlar & KPI
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin?tab=clients')} className="!text-slate-200 hover:!text-white focus:!text-white focus:bg-[#0D3B46] rounded-lg cursor-pointer text-xs font-semibold py-1.5">
                    <Building2 className="w-4 h-4 mr-2 text-[#02C39A]" /> Mijoz Korxonalar Boshqaruvi
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin?tab=plans')} className="!text-slate-200 hover:!text-white focus:!text-white focus:bg-[#0D3B46] rounded-lg cursor-pointer text-xs font-semibold py-1.5">
                    <CreditCard className="w-4 h-4 mr-2 text-[#02C39A]" /> Tariflar & Obunalar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin?tab=integrations')} className="!text-slate-200 hover:!text-white focus:!text-white focus:bg-[#0D3B46] rounded-lg cursor-pointer text-xs font-semibold py-1.5">
                    <Radio className="w-4 h-4 mr-2 text-[#02C39A]" /> Integratsiyalar Salomatligi
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin?tab=support')} className="!text-slate-200 hover:!text-white focus:!text-white focus:bg-[#0D3B46] rounded-lg cursor-pointer text-xs font-semibold py-1.5">
                    <Headphones className="w-4 h-4 mr-2 text-[#02C39A]" /> Mijozlar Yordami & Chiptalar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin?tab=audit')} className="!text-slate-200 hover:!text-white focus:!text-white focus:bg-[#0D3B46] rounded-lg cursor-pointer text-xs font-semibold py-1.5">
                    <ShieldAlert className="w-4 h-4 mr-2 text-[#02C39A]" /> Xavfsizlik & Audit Loglari
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin?tab=settings')} className="!text-slate-200 hover:!text-white focus:!text-white focus:bg-[#0D3B46] rounded-lg cursor-pointer text-xs font-semibold py-1.5">
                    <Sliders className="w-4 h-4 mr-2 text-[#02C39A]" /> Platforma Sozlamalari
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin?tab=guide')} className="!text-slate-200 hover:!text-white focus:!text-white focus:bg-[#0D3B46] rounded-lg cursor-pointer text-xs font-semibold py-1.5">
                    <BookOpen className="w-4 h-4 mr-2 text-[#02C39A]" /> Yoʻriqnoma & Diagnostika
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-[#028090]/30 my-1" />
                <DropdownMenuItem onClick={handleLogout} className="text-rose-400 font-bold hover:!text-white focus:!text-white focus:bg-rose-950 hover:bg-rose-950 rounded-lg cursor-pointer text-xs py-1.5">
                  <LogOut className="w-4 h-4 mr-2" /> Tizimdan Chiqish
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <div className="px-2 py-1.5 flex items-center gap-2">
                  <div className="min-w-0">
                    <DropdownMenuLabel className="font-bold text-white truncate p-0">{displayUserName}</DropdownMenuLabel>
                    <div className={`text-[11px] ${userRoleBadge.color} font-medium`}>{userRoleBadge.title}</div>
                    <div className="text-[9px] text-slate-400">{user?.email || userRoleBadge.desc}</div>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-[#028090]/30" />
                <DropdownMenuItem onClick={() => navigate('/admin/settings/profile')} className="!text-white hover:!text-white focus:!text-white focus:bg-[#0D3B46] cursor-pointer">
                  <User className="w-4 h-4 mr-2 text-[#02C39A]" /> <span className="text-white font-medium">Mening profilim</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/admin/settings/company-settings')} className="!text-white hover:!text-white focus:!text-white focus:bg-[#0D3B46] cursor-pointer">
                  <Settings className="w-4 h-4 mr-2 text-[#02C39A]" /> <span className="text-white font-medium">Sozlamalar</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#028090]/30" />
                <DropdownMenuItem onClick={handleLogout} className="text-rose-400 font-bold hover:!text-white focus:!text-white focus:bg-rose-950 hover:bg-rose-950 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" /> Chiqish
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
};

export default SaparHeader;
