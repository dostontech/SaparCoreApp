import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  RefreshCw,
  Building2,
  HelpCircle,
  ChevronDown,
  ChevronLeft,
  AlertTriangle,
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

interface IboxHeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const IboxHeader: React.FC<IboxHeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Shokirjon';
  const companyName = 'Rizobay*';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth/login');
  };

  return (
    <header className="bg-[#2563EB] text-white h-14 px-3 sm:px-4 flex items-center justify-between shadow-md z-40 select-none">
      {/* Left Section: Logo, Toggle, Favorites */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* iBox Brand Logo */}
        <div
          onClick={() => navigate('/admin')}
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition pr-2"
        >
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-xs">
            <span className="text-[#2563EB] font-black text-sm tracking-tighter">❖</span>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white font-sans">ibox</span>
        </div>

        {/* Sidebar Collapse Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="w-7 h-7 rounded-full bg-blue-700/60 hover:bg-blue-700 flex items-center justify-center text-white transition text-xs shadow-xs"
          title={isSidebarOpen ? "Menyuni yigʻish" : "Menyuni ochish"}
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${isSidebarOpen ? '' : 'rotate-180'}`} />
        </button>

        {/* Sevimli sahifalar (Yellow Star Button) */}
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-800 text-xs font-bold hover:bg-slate-100 transition shadow-xs"
        >
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>Sevimli sahifalar</span>
        </button>
      </div>

      {/* Center Section: License Notice */}
      <div className="hidden lg:flex items-center">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-semibold shadow-xs">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Sizning litsenziyangiz muddati 0 kun oldin tugadi</span>
        </div>
      </div>

      {/* Right Section: Currency rates, Company switcher, Help, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Currency Rates Widget */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-700/60 border border-blue-400/30 text-xs font-bold text-white">
          <RefreshCw className="w-3 h-3 text-cyan-300" />
          <span>1 USD = 11 850 UZS, 1 RUB = 140 UZS</span>
        </div>

        {/* Company / Branch Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-700/70 hover:bg-blue-700 text-xs font-bold transition text-white"
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-200" />
              <span>{companyName}</span>
              <ChevronDown className="w-3 h-3 text-blue-200" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Filiallar va Korxonalar</DropdownMenuLabel>
            <DropdownMenuItem className="font-bold text-blue-600">
              ✓ OOO "RIZOBAY STROY" (Asosiy)
            </DropdownMenuItem>
            <DropdownMenuItem>Chilonzor filiali</DropdownMenuItem>
            <DropdownMenuItem>Ulgurji baza (Qoʻyliq)</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/admin/settings/company')}>
              <Settings className="w-4 h-4 mr-2" /> Korxona sozlamalari
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help Circle */}
        <button
          type="button"
          onClick={() => navigate('/admin/guide')}
          className="w-8 h-8 rounded-full bg-blue-700/60 hover:bg-blue-700 flex items-center justify-center text-white text-xs font-bold transition"
          title="Yordam va qoʻllanma"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Profile Avatar Circle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 p-0.5 rounded-full hover:ring-2 hover:ring-white/40 transition"
            >
              <div className="w-8 h-8 rounded-full bg-blue-800 border-2 border-white flex items-center justify-center text-white font-bold text-xs shadow-xs">
                S
              </div>
              <ChevronDown className="w-3 h-3 text-white hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-bold">{userName}</DropdownMenuLabel>
            <div className="px-2 py-1 text-[11px] text-slate-500">Super Administrator</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
              <User className="w-4 h-4 mr-2" /> Mening profilim
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
              <Settings className="w-4 h-4 mr-2" /> Sozlamalar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 font-bold">
              <LogOut className="w-4 h-4 mr-2" /> Chiqish
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default IboxHeader;
