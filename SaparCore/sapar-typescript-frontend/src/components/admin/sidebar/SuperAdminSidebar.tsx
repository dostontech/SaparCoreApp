import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../../store';
import { logout } from '@store/auth/authSlice';
import {
  BarChart3,
  Building2,
  CreditCard,
  Radio,
  ShieldAlert,
  Sliders,
  LogOut,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  Server,
  Zap,
  Globe,
  Headphones,
  BookOpen,
} from 'lucide-react';

interface SuperAdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  activeTab?: string;
  onSelectTab?: (tabId: string) => void;
}

const SaparLogoMark: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 41 45" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.571411 14.4812V25.6239L7.62723 21.7237V14.8521L18.3063 8.90914L11.4419 4.82776L3.89365 8.95446C1.84171 10.0763 0.571411 12.1895 0.571411 14.4812Z" fill="#FFFFFF" />
    <path d="M41 30.0855V18.9429L33.9442 22.843V29.7146L23.2651 35.6576L30.1295 39.739L37.6778 35.6123C39.7298 34.4904 41 32.3772 41 30.0855Z" fill="#0B2B33" />
    <path d="M40.6892 14.0206L40.8093 15.6004L33.7535 19.3148V14.8575L13.7302 4.08136L20.5946 0L37.3268 8.93073C39.2607 9.96294 40.5263 11.8787 40.6892 14.0206Z" fill="#02C39A" />
    <path d="M0.12016 30.925L0 29.3451L7.05584 25.6307V30.088L27.0791 40.8642L20.2147 44.9456L3.48254 36.0148C1.54864 34.9826 0.283068 33.0668 0.12016 30.925Z" fill="#028090" />
  </svg>
);

export const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({
  isOpen,
  onClose,
  onToggle,
  activeTab = 'clients',
  onSelectTab,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const navItems = [
    { id: 'overview', title: 'Asosiy Koʻrsatkichlar', desc: 'Platforma statistikasi & KPI', icon: BarChart3, to: '/admin?tab=overview', tabKey: 'overview', badge: null as string | null },
    { id: 'clients', title: 'Mijozlar & Kompaniyalar', desc: 'Kompaniyalar va modullar', icon: Building2, to: '/admin?tab=clients', tabKey: 'clients', badge: null as string | null },
    { id: 'plans', title: 'Tariflar & Obunalar', desc: 'Rejalar, narxlar va MRR', icon: CreditCard, to: '/admin?tab=plans', tabKey: 'plans', badge: null as string | null },
    { id: 'integrations', title: 'Integratsiyalar', desc: 'Soliq, E-IMZO, Didox, Toʻlov', icon: Radio, to: '/admin?tab=integrations', tabKey: 'integrations', badge: 'JONLI' as string | null },
    { id: 'support', title: 'Mijozlar Yordami', desc: 'Helpdesk chiptalari & SLA', icon: Headphones, to: '/admin?tab=support', tabKey: 'support', badge: 'DB' as string | null },
    { id: 'audit', title: 'Xavfsizlik & Audit', desc: 'Tizim loglari va jurnallar', icon: ShieldAlert, to: '/admin?tab=audit', tabKey: 'audit', badge: null as string | null },
    { id: 'settings', title: 'Platforma Sozlamalari', desc: 'Global eʼlonlar va xizmatlar', icon: Sliders, to: '/admin?tab=settings', tabKey: 'settings', badge: null as string | null },
    { id: 'guide', title: 'Qoʻllanma & Diagnostika', desc: 'E-IMZO & 21-BHMS diagnostika', icon: BookOpen, to: '/admin?tab=guide', tabKey: 'guide', badge: null as string | null },
  ];

  const currentTabFromUrl = new URLSearchParams(location.search).get('tab') || 'clients';
  const effectiveTab = onSelectTab ? activeTab : currentTabFromUrl;

  const handleNavClick = (tabKey: string, to: string, e: React.MouseEvent) => {
    if (onSelectTab) {
      e.preventDefault();
      onSelectTab(tabKey);
      navigate(to);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    try { localStorage.clear(); sessionStorage.clear(); } catch { /* ignore */ }
    navigate('/login');
  };

  // When collapsed on desktop, render a compact icon rail
  if (!isOpen) {
    return (
      <aside className="hidden md:flex w-16 bg-[#0B2B33] text-white h-full flex-col select-none border-r border-[#154652]/80 shrink-0 font-sans transition-all duration-300 z-30">
        {/* Top Mini Brand Logo */}
        <div className="h-14 border-b border-[#154652]/80 flex items-center justify-center bg-[#0B2B33] shrink-0">
          <button
            type="button"
            onClick={onToggle}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#028090] to-[#02C39A] p-1 shadow-sm flex items-center justify-center cursor-pointer hover:scale-105 transition"
            title="Menyuni ochish"
          >
            <SaparLogoMark className="w-full h-full" />
          </button>
        </div>

        {/* User Initial Avatar */}
        <div className="p-3 border-b border-[#154652]/60 flex justify-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#028090] to-[#02C39A] flex items-center justify-center text-[#0B2B33] font-black text-xs shadow-md" title="Super Admin">
            👑
          </div>
        </div>

        {/* Rail Nav Items */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-2 flex flex-col items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith('/admin') && effectiveTab === item.tabKey;
            return (
              <NavLink
                key={item.id}
                to={item.to}
                onClick={(e) => handleNavClick(item.tabKey, item.to, e)}
                title={item.title}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 relative ${isActive
                  ? 'bg-gradient-to-r from-[#028090] to-[#016875] text-white shadow-md ring-1 ring-[#02C39A]/60'
                  : 'text-slate-400 hover:bg-[#113843] hover:text-[#02C39A]'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#02C39A] rounded-r-full" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Rail Action: Expand button */}
        <div className="p-3 border-t border-[#154652]/80 bg-[#082027]/60 flex justify-center">
          <button
            type="button"
            onClick={onToggle}
            className="w-10 h-10 rounded-xl bg-[#0E353F] hover:bg-[#028090] text-slate-300 hover:text-white flex items-center justify-center transition shadow-xs cursor-pointer"
            title="Menyuni kengaytirish"
          >
            <ChevronRight className="w-4 h-4 text-[#02C39A]" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed md:static inset-y-0 left-0 z-40 flex flex-col w-64 bg-[#0B2B33] text-white border-r border-[#154652]/80 transition-transform duration-300 ease-in-out shadow-2xl h-screen md:h-full">

      {/* 1. Brand Header (56px / h-14) — Aligns seamlessly with SaparHeader */}
      <div className="h-14 px-4 border-b border-[#154652]/80 flex items-center justify-between shrink-0 bg-[#0B2B33]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#028090] to-[#02C39A] flex items-center justify-center shadow-sm shrink-0 p-1">
            <SaparLogoMark className="w-full h-full" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-base tracking-tight text-white font-sans">SAPAR</span>
            <span className="text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded-md bg-[#02C39A]/15 text-[#02C39A] border border-[#02C39A]/30">SUPER ADMIN</span>
          </div>
        </div>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="w-7 h-7 rounded-lg bg-[#0E353F] hover:bg-[#028090] border border-[#02C39A]/20 flex items-center justify-center text-slate-300 hover:text-white transition text-xs shadow-xs cursor-pointer"
            title="Menyuni yigʻish"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Admin User Card */}
      <div className="p-3 border-b border-[#154652]/60">
        <div className="rounded-xl bg-gradient-to-r from-[#0E353F] to-[#0a2a32] border border-[#1e5a6a]/60 p-2.5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#028090] to-[#02C39A] flex items-center justify-center text-[#0B2B33] font-black text-xs shrink-0 shadow-md">
            👑
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-white truncate">
              {user?.user_type === 1 ? 'Super Admin' : (user?.firstName || 'Super Admin')}
            </div>
            <div className="text-[10px] text-[#02C39A] font-semibold truncate leading-tight">SaaS Root Boshqaruvchi</div>
            <div className="text-[9px] text-slate-400 truncate">{user?.email || 'admin@sapar.uz'}</div>
          </div>
          <div className="flex flex-col items-center gap-0.5 shrink-0">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <span className="text-[8px] text-emerald-400 font-bold uppercase leading-none">jonli</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        <div className="px-2 pb-1.5 pt-0.5 text-[10px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1.5">
          <Globe className="w-3 h-3" />
          Platforma Modullari
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith('/admin') && effectiveTab === item.tabKey;
          return (
            <NavLink
              key={item.id}
              to={item.to}
              onClick={(e) => handleNavClick(item.tabKey, item.to, e)}
              className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-[#028090]/90 to-[#016875]/80 text-white shadow-lg shadow-teal-950/50 border border-[#02C39A]/30' : 'text-slate-400 hover:bg-[#113843] hover:text-slate-100'}`}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#02C39A]" />}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 ${isActive ? 'bg-white/20 text-white shadow-sm' : 'bg-[#154652]/80 text-slate-400 group-hover:bg-[#1e5866] group-hover:text-[#02C39A]'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-left min-w-0">
                  <div className="truncate text-[11px] font-semibold leading-snug">{item.title}</div>
                  <div className="truncate text-[9px] text-slate-500 font-normal leading-tight group-hover:text-slate-400 transition-colors">{item.desc}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                {item.badge && (
                  <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400 border border-emerald-400/20 tracking-wide">{item.badge}</span>
                )}
                <ChevronRight className={`w-3 h-3 transition-all duration-200 ${isActive ? 'text-[#02C39A] opacity-100 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`} />
              </div>
            </NavLink>
          );
        })}

        {/* Quick actions */}
        <div className="pt-3 pb-1.5 px-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1.5">
          <Zap className="w-3 h-3" />
          Tezkor Harakatlar
        </div>
        <button
          onClick={() => navigate('/sales')}
          className="w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] font-semibold text-slate-300 bg-[#0E353F]/60 hover:bg-[#028090]/20 border border-[#1e5a6a]/40 hover:border-[#028090]/50 transition-all duration-200"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#028090]/20 border border-[#028090]/30 flex items-center justify-center shrink-0 group-hover:bg-[#028090]/40 transition-colors">
              <UserCheck className="w-3.5 h-3.5 text-[#02C39A]" />
            </div>
            <span className="truncate">Test Korxonaga Kirish</span>
          </div>
          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-[#02C39A] transition-colors shrink-0" />
        </button>
      </div>

      {/* Footer */}
      <div className="border-t border-[#154652]/80 bg-[#082027]/60 p-3 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <Server className="w-3 h-3 text-[#028090]" />
            <span>v2.4.0 · Oʻzbekiston</span>
          </span>
          <span className="text-[10px] font-bold text-[#02C39A] bg-[#02C39A]/10 px-1.5 py-0.5 rounded-md border border-[#02C39A]/20">UZ Cloud</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[11px] font-semibold text-rose-400 hover:text-white hover:bg-rose-500/15 border border-transparent hover:border-rose-500/20 transition-all duration-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Tizimdan Chiqish</span>
        </button>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
