import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Building2,
  HelpCircle,
  ChevronDown,
  ChevronLeft,
  Zap,
  User,
  LogOut,
  Settings,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@components/ui';
import { LanguageSwitcher } from '@components/admin/header/LanguageSwitcher';

interface IboxHeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const IboxHeader: React.FC<IboxHeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Shokirjon Turgʻunboyev';
  const companyName = 'Rizobay*';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth/login');
  };

  return (
    <header className="bg-[#0B2B33] border-b border-[#028090]/40 text-white h-14 px-3 sm:px-5 flex items-center justify-between shadow-md z-40 select-none">
      {/* Left Section: SAPAR Brand Logo & Sidebar Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* SAPAR Brand Logo with SVG Mark */}
        <div
          onClick={() => navigate('/admin')}
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
            <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-[#02C39A] text-[#0B2B33] uppercase tracking-wider">
              ERP
            </span>
          </div>
        </div>

        {/* Sidebar Collapse Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="w-7 h-7 rounded-lg bg-[#0D3B46] hover:bg-[#028090] border border-[#028090]/30 flex items-center justify-center text-white transition text-xs shadow-xs"
          title={isSidebarOpen ? 'Menyuni yigʻish' : 'Menyuni ochish'}
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform duration-200 ${isSidebarOpen ? '' : 'rotate-180'}`}
          />
        </button>
      </div>

      {/* Center Section: Enterprise Edition Status */}
      <div className="hidden lg:flex items-center">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D3B46] border border-[#02C39A]/30 text-xs font-semibold text-[#02C39A] shadow-xs">
          <Zap className="w-3.5 h-3.5 fill-[#02C39A]" />
          <span>Enterprise Edition • Oʻzbekiston & Markaziy Osiyo</span>
        </div>
      </div>

      {/* Right Section: Language Switcher, Currency rates, Company switcher, Help, User */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Language Switcher Dropdown (Uzbek, Russian, English) */}
        <div className="flex items-center">
          <LanguageSwitcher variant="header" />
        </div>

        {/* Currency Rates Widget */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0D3B46] border border-[#028090]/40 text-xs font-bold text-slate-100">
          <RefreshCw className="w-3 h-3 text-[#02C39A]" />
          <span>1 USD = 12 750 UZS, 1 RUB = 140 UZS</span>
        </div>

        {/* Company / Branch Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0D3B46] hover:bg-[#028090] border border-[#028090]/30 text-xs font-bold transition text-white"
            >
              <Building2 className="w-3.5 h-3.5 text-[#02C39A]" />
              <span>{companyName}</span>
              <ChevronDown className="w-3 h-3 text-slate-300" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#0B2B33] text-slate-100 border-[#028090]/40">
            <DropdownMenuLabel className="text-slate-300 font-bold">Filiallar va Korxonalar</DropdownMenuLabel>
            <DropdownMenuItem className="font-bold text-[#02C39A] focus:bg-[#0D3B46] focus:text-[#02C39A]">
              ✓ OOO "RIZOBAY STROY" (Asosiy)
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-[#0D3B46]">Chilonzor filiali</DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-[#0D3B46]">Ulgurji baza (Qoʻyliq)</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#028090]/30" />
            <DropdownMenuItem
              onClick={() => navigate('/admin/settings/company-settings')}
              className="focus:bg-[#0D3B46]"
            >
              <Settings className="w-4 h-4 mr-2 text-[#02C39A]" /> Korxona sozlamalari
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help Circle - links to Guide */}
        <button
          type="button"
          onClick={() => navigate('/admin/guide')}
          className="w-8 h-8 rounded-lg bg-[#0D3B46] hover:bg-[#028090] border border-[#028090]/30 flex items-center justify-center text-white text-xs font-bold transition"
          title="Yordam va qoʻllanma"
        >
          <HelpCircle className="w-4 h-4 text-[#02C39A]" />
        </button>

        {/* User Profile Avatar Circle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 p-0.5 rounded-lg hover:ring-2 hover:ring-[#02C39A]/50 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#028090] to-[#02C39A] border border-[#02C39A]/60 flex items-center justify-center text-[#0B2B33] font-black text-xs shadow-xs">
                S
              </div>
              <ChevronDown className="w-3 h-3 text-slate-300 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-[#0B2B33] text-slate-100 border-[#028090]/40">
            <DropdownMenuLabel className="font-bold text-white">{userName}</DropdownMenuLabel>
            <div className="px-2 py-0.5 text-[11px] text-[#02C39A] font-medium">Boshqaruvchi / Admin</div>
            <DropdownMenuSeparator className="bg-[#028090]/30" />
            <DropdownMenuItem onClick={() => navigate('/admin/settings/profile')} className="focus:bg-[#0D3B46]">
              <User className="w-4 h-4 mr-2 text-[#02C39A]" /> Mening profilim
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/admin/settings/company-settings')} className="focus:bg-[#0D3B46]">
              <Settings className="w-4 h-4 mr-2 text-[#02C39A]" /> Sozlamalar
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#028090]/30" />
            <DropdownMenuItem onClick={handleLogout} className="text-rose-400 font-bold focus:bg-rose-950">
              <LogOut className="w-4 h-4 mr-2" /> Chiqish
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default IboxHeader;
