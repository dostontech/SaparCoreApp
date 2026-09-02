import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Package,
  Warehouse,
  Users,
  Truck,
  ShoppingCart,
  ShoppingBag,
  Wallet,
  Factory,
  Building2,
  FileSpreadsheet,
  Settings,
  ChevronDown,
  ChevronRight,
  Star,
  Sparkles,
} from 'lucide-react';

interface IboxSidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  to?: string;
  children?: { title: string; to: string; badge?: string }[];
}

export const IboxSidebar: React.FC<IboxSidebarProps> = ({ isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Expanded menu sections state
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    sotuvlar: true,
    pullar: true,
  });

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: 'Bosh panel',
      icon: <LayoutGrid className="w-4 h-4 shrink-0 text-[#02C39A]" />,
      to: '/admin',
    },
    {
      id: 'mahsulotlar',
      title: 'Mahsulotlar',
      icon: <Package className="w-4 h-4 shrink-0 text-teal-400" />,
      children: [
        { title: 'Mahsulotlar roʻyxati', to: '/admin/products' },
        { title: 'Kategoriyalar', to: '/admin/categories' },
        { title: 'Brendlar', to: '/admin/brands' },
        { title: 'Oʻlchov birliklari', to: '/admin/units' },
      ],
    },
    {
      id: 'ombor',
      title: 'Ombor',
      icon: <Warehouse className="w-4 h-4 shrink-0 text-cyan-400" />,
      children: [
        { title: 'Ombor qoldiqlari', to: '/admin/inventory' },
        { title: 'Omborlar roʻyxati', to: '/admin/warehouses' },
        { title: 'Omborlararo koʻchirish', to: '/admin/inventory/transfers' },
        { title: 'Inventarizatsiya', to: '/admin/inventory/audits' },
        { title: 'Hisobdan chiqarish', to: '/admin/inventory/write-offs' },
      ],
    },
    {
      id: 'mijozlar',
      title: 'Mijozlar',
      icon: <Users className="w-4 h-4 shrink-0 text-emerald-400" />,
      children: [
        { title: 'Mijozlar roʻyxati', to: '/admin/contacts' },
        { title: 'Akt Sverki (Oldi-berdi)', to: '/admin/contacts' },
      ],
    },
    {
      id: 'taminotchilar',
      title: 'Ta\'minotchilar',
      icon: <Truck className="w-4 h-4 shrink-0 text-teal-300" />,
      children: [
        { title: 'Taʼminotchilar', to: '/admin/vendors' },
        { title: 'Qarzdorlik hisoboti', to: '/admin/reports/accounts-payable' },
      ],
    },
    {
      id: 'sotuvlar',
      title: 'Sotuvlar',
      icon: <ShoppingCart className="w-4 h-4 shrink-0 text-[#02C39A]" />,
      children: [
        { title: 'Sotuvlar (Yuk xatlari)', to: '/admin/sales' },
        { title: 'POS oyna (Kassa)', to: '/admin/pos', badge: 'Kassa' },
        { title: 'Kassirlar jurnali', to: '/admin/pos/cashiers' },
        { title: 'Tijorat takliflari', to: '/admin/quotations' },
        { title: 'Mijozdan qaytishlar', to: '/admin/credit-notes' },
      ],
    },
    {
      id: 'xaridlar',
      title: 'Xaridlar',
      icon: <ShoppingBag className="w-4 h-4 shrink-0 text-teal-400" />,
      children: [
        { title: 'Xaridlar roʻyxati', to: '/admin/purchases' },
        { title: 'Xarid buyurtmalari', to: '/admin/purchase-orders' },
        { title: 'Taʼminotchiga qaytarish', to: '/admin/debit-notes' },
      ],
    },
    {
      id: 'pullar',
      title: 'Pullar',
      icon: <Wallet className="w-4 h-4 shrink-0 text-[#02C39A]" />,
      children: [
        { title: 'Kassadagi pullar', to: '/admin/pos/cashiers' },
        { title: 'Bank hisoblari', to: '/admin/banking' },
        { title: 'Chiqim va Xarajatlar', to: '/admin/expenses' },
      ],
    },
    {
      id: 'fabrika',
      title: 'Fabrika',
      icon: <Factory className="w-4 h-4 shrink-0 text-cyan-300" />,
      children: [
        { title: 'Ishlab chiqarish buyurtmalari', to: '/admin/manufacturing/orders' },
        { title: 'Texnologik xaritalar (BOM)', to: '/admin/manufacturing/bom' },
      ],
    },
    {
      id: 'korxonalar',
      title: 'Korxonalar',
      icon: <Building2 className="w-4 h-4 shrink-0 text-teal-400" />,
      children: [
        { title: 'Filiallar', to: '/admin/settings/branches' },
        { title: 'Yuridik shaxslar', to: '/admin/settings/company' },
      ],
    },
    {
      id: 'hisobotlar',
      title: 'Hisobotlar',
      icon: <FileSpreadsheet className="w-4 h-4 shrink-0 text-[#02C39A]" />,
      children: [
        { title: 'Sotuvlar hisoboti', to: '/admin/reports/sales' },
        { title: 'Foyda va zararlar (2-Shakl)', to: '/admin/accounting/reports/profit-and-loss' },
        { title: 'Buxgalteriya balansi (1-Shakl)', to: '/admin/accounting/reports/balance-sheet' },
        { title: 'Soliq deklaratsiyalari', to: '/admin/tax-reports' },
      ],
    },
    {
      id: 'sozlamalar',
      title: 'Sozlamalar',
      icon: <Settings className="w-4 h-4 shrink-0 text-slate-400" />,
      children: [
        { title: 'Korxona sozlamalari', to: '/admin/settings/company' },
        { title: 'Xodimlar & Rollar', to: '/admin/users' },
        { title: 'Kassalar', to: '/admin/pos/cashiers' },
        { title: 'Omborlar', to: '/admin/warehouses' },
        { title: 'Qoʻllanma & Yordam', to: '/admin/guide' },
        { title: 'Design System', to: '/admin/design-system' },
      ],
    },
  ];

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="w-60 bg-[#082026] text-slate-100 h-full flex flex-col select-none border-r border-[#13444D] transition-all duration-200 shrink-0 overflow-hidden font-sans">
      {/* Pinned Sevimli Sahifalar (Moved from Header to Sidebar as requested) */}
      <div className="p-2 border-b border-[#13444D] bg-[#06181D]">
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0D3B46] hover:bg-[#114E5D] border border-[#028090]/40 text-slate-100 text-xs font-bold transition shadow-2xs group"
        >
          <Star className="w-4 h-4 fill-[#02C39A] text-[#02C39A] group-hover:scale-110 transition" />
          <span className="font-extrabold text-white">Sevimli sahifalar</span>
        </button>
      </div>

      {/* Scrollable Navigation Items */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 custom-scrollbar text-xs">
        {menuItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = !!openMenus[item.id];
          const isCurrentActive = item.to
            ? location.pathname === item.to || (item.to !== '/admin' && location.pathname.startsWith(item.to))
            : item.children?.some((c) => location.pathname === c.to || location.pathname.startsWith(c.to));

          if (!hasChildren && item.to) {
            return (
              <NavLink
                key={item.id}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold transition ${
                    isActive
                      ? 'bg-[#028090] text-white shadow-sm shadow-[#028090]/40'
                      : 'text-slate-200 hover:bg-[#0D3B46] hover:text-[#02C39A]'
                  }`
                }
              >
                {item.icon}
                <span className="truncate">{item.title}</span>
              </NavLink>
            );
          }

          return (
            <div key={item.id} className="space-y-0.5">
              <button
                type="button"
                onClick={() => toggleMenu(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-bold transition ${
                  isCurrentActive
                    ? 'text-[#02C39A] bg-[#0D3B46]/70'
                    : 'text-slate-200 hover:bg-[#0D3B46] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {item.icon}
                  <span className="truncate">{item.title}</span>
                </div>
                <div className="text-slate-400">
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#02C39A]" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              {/* Submenu Children */}
              {isExpanded && hasChildren && (
                <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-[#028090]/30 ml-4">
                  {item.children!.map((child) => {
                    const isChildActive =
                      location.pathname === child.to ||
                      (child.to !== '/admin' && location.pathname.startsWith(child.to));

                    return (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition ${
                          isChildActive
                            ? 'bg-[#028090] text-white font-bold shadow-2xs'
                            : 'text-slate-300 hover:text-[#02C39A] hover:bg-[#0D3B46]/60'
                        }`}
                      >
                        <span className="truncate">{child.title}</span>
                        {child.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#02C39A] text-[#0B2B33]">
                            {child.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer / SAPAR Brand Version info */}
      <div className="p-3 border-t border-[#13444D] bg-[#06181D] flex items-center justify-between text-[11px] text-slate-300">
        <span className="font-bold text-white">SAPAR ERP v2.9</span>
        <span className="px-2 py-0.5 rounded bg-[#0D3B46] text-[#02C39A] font-bold text-[10px] border border-[#028090]/30">
          Oʻzbekiston
        </span>
      </div>
    </aside>
  );
};

export default IboxSidebar;
