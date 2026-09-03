import React, { useState, useMemo, useEffect } from 'react';
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
  FileSpreadsheet,
  Settings,
  ChevronDown,
  ChevronRight,
  Star,
  Search,
  X,
  FileCheck,
  UserCheck,
  PanelLeftClose,
  PanelLeftOpen,
  TrendingUp,
  BadgePercent,
  Landmark,
  Banknote,
} from 'lucide-react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { SimpleTooltip } from '@components/ui/Tooltip';
import { LanguageSwitcher } from '@components/admin/header/LanguageSwitcher';

export interface SaparSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

export interface SubMenuItem {
  id: string;
  title: string;
  to: string;
  badge?: string;
}

export interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  to?: string;
  badge?: string;
  children?: SubMenuItem[];
}

interface FlatItemLookup {
  id: string;
  title: string;
  to: string;
  icon: React.ReactNode;
  groupTitle: string;
  badge?: string;
}

const DEFAULT_FAVORITE_ROUTES: string[] = [
  '/admin',
  '/admin/pos',
  '/admin/sales',
  '/admin/inventory',
  '/admin/accounting/reports/uz-financial-statements',
];

export const SaparSidebar: React.FC<SaparSidebarProps> = ({ isOpen, onClose, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Favorites state persisted in localStorage
  const [favoriteRoutes, setFavoriteRoutes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sapar_favorite_routes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_FAVORITE_ROUTES;
  });

  // Expand/collapse state for favorites section
  const [isFavoritesExpanded, setIsFavoritesExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sapar_favorites_expanded');
      if (saved !== null) return saved === 'true';
    } catch {
      // ignore
    }
    return true;
  });

  const toggleFavoritesExpanded = () => {
    setIsFavoritesExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sapar_favorites_expanded', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Open menu items managed by Radix UI Accordion Primitive
  const [openMenuIds, setOpenMenuIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sapar_sidebar_open_menu_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return ['sotuvlar', 'pullar'];
  });

  const handleOpenMenuChange = (values: string[]) => {
    setOpenMenuIds(values);
    try {
      localStorage.setItem('sapar_sidebar_open_menu_ids', JSON.stringify(values));
    } catch {
      // ignore
    }
  };

  // Save favorites to localStorage
  const toggleFavorite = (to: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFavoriteRoutes((prev) => {
      const next = prev.includes(to) ? prev.filter((r) => r !== to) : [...prev, to];
      try {
        localStorage.setItem('sapar_favorite_routes', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const isFavorite = (to: string) => favoriteRoutes.includes(to);

  const currentFullUrl = location.pathname + (location.search || '');

  const isRouteActive = (targetTo: string, siblings?: { to: string }[]): boolean => {
    const [targetPath, targetQuery] = targetTo.split('?');

    // 1. If target has query params (e.g. /admin/contacts?view=clients)
    if (targetQuery) {
      if (currentFullUrl === targetTo) return true;
      // If user is at /admin/contacts without query params, default view is clients
      if (
        location.pathname === targetPath &&
        (!location.search || location.search === '?view=all-active' || location.search === '?view=all') &&
        targetQuery === 'view=clients'
      ) {
        return true;
      }
      return false;
    }

    // 2. If target does NOT have query params:
    // If the URL has a search query, a non-query item should NOT be active if its path matches
    if (location.search) {
      if (targetPath === location.pathname) {
        return false;
      }
    }

    // 3. Strict exact-only routes (never match deeper subpaths)
    const EXACT_ONLY_PATHS = ['/admin', '/admin/pos', '/admin/sales', '/admin/inventory'];
    if (EXACT_ONLY_PATHS.includes(targetPath)) {
      return location.pathname === targetPath;
    }

    // 4. If siblings exist, check if another sibling matches location.pathname exactly
    if (siblings) {
      const hasExactPathMatch = siblings.some((s) => s.to.split('?')[0] === location.pathname);
      if (hasExactPathMatch) {
        return targetPath === location.pathname;
      }
    }

    // 5. Fallback for deeper sub-routes (e.g. /admin/products/edit/123 -> /admin/products)
    if (targetPath !== '/admin') {
      return location.pathname === targetPath || location.pathname.startsWith(targetPath + '/');
    }

    return location.pathname === targetPath;
  };

  // Comprehensive Menu Structure verified against SAPAR Routes
  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        id: 'dashboard',
        title: 'Bosh panel',
        icon: <LayoutGrid className="w-4 h-4 shrink-0 text-[#02C39A]" />,
        to: '/admin',
      },
      {
        id: 'business-loans-scoring',
        title: 'Moliyalashtirish',
        icon: <Landmark className="w-4 h-4 shrink-0 text-amber-400" />,
        to: '/admin/business-loans',
        badge: '500M',
      },
      {
        id: 'mahsulotlar',
        title: 'Mahsulotlar',
        icon: <Package className="w-4 h-4 shrink-0 text-teal-400" />,
        children: [
          { id: 'prod-list', title: 'Mahsulotlar roʻyxati', to: '/admin/products' },
          { id: 'prod-new', title: 'Yangi mahsulot', to: '/admin/products/new' },
          { id: 'prod-cats', title: 'Kategoriyalar', to: '/admin/categories' },
          { id: 'prod-brands', title: 'Brendlar', to: '/admin/brands' },
          { id: 'prod-units', title: 'Oʻlchov birliklari', to: '/admin/units' },
        ],
      },
      {
        id: 'ombor',
        title: 'Ombor',
        icon: <Warehouse className="w-4 h-4 shrink-0 text-cyan-400" />,
        children: [
          { id: 'inv-stock', title: 'Ombor qoldiqlari', to: '/admin/inventory' },
          { id: 'inv-warehouses', title: 'Omborlar roʻyxati', to: '/admin/warehouses' },
          { id: 'inv-transfers', title: 'Omborlararo koʻchirish', to: '/admin/inventory/transfers' },
          { id: 'inv-audits', title: 'Inventarizatsiya', to: '/admin/inventory/audits' },
          { id: 'inv-writeoffs', title: 'Hisobdan chiqarish', to: '/admin/inventory/write-offs' },
        ],
      },
      {
        id: 'mijozlar',
        title: 'Mijozlar (CRM)',
        icon: <Users className="w-4 h-4 shrink-0 text-emerald-400" />,
        children: [
          { id: 'crm-contacts', title: 'Mijozlar roʻyxati', to: '/admin/contacts?view=clients' },
          { id: 'crm-new', title: 'Yangi mijoz', to: '/admin/contacts/new' },
          { id: 'crm-pipeline', title: 'CRM Bitimlar quvuri', to: '/admin/crm/pipeline' },
          { id: 'crm-reconcile', title: 'Akt Sverki (Oldi-berdi)', to: '/admin/contacts?view=clients-open-invoices' },
          { id: 'crm-helpdesk', title: 'Mijozlar yordam markazi', to: '/admin/helpdesk/tickets' },
        ],
      },
      {
        id: 'taminotchilar',
        title: 'Taʼminotchilar',
        icon: <Truck className="w-4 h-4 shrink-0 text-teal-300" />,
        children: [
          { id: 'ven-list', title: 'Taʼminotchilar roʻyxati', to: '/admin/contacts?view=suppliers' },
          { id: 'ven-ap', title: 'Qarzdorlik hisoboti (AP)', to: '/admin/accounting/reports/ap-aging' },
          { id: 'ven-pay', title: 'Yetkazib beruvchi toʻlovlari', to: '/admin/supplier-payments' },
        ],
      },
      {
        id: 'sotuvlar',
        title: 'Sotuvlar',
        icon: <ShoppingCart className="w-4 h-4 shrink-0 text-[#02C39A]" />,
        children: [
          { id: 'sale-invoices', title: 'Sotuvlar (Yuk xatlari)', to: '/admin/sales' },
          { id: 'sale-create', title: 'Yangi sotuv', to: '/admin/sales/create' },
          { id: 'sale-pos', title: 'POS oyna (Kassa)', to: '/admin/pos', badge: 'Kassa' },
          { id: 'sale-shifts', title: 'Kassirlar jurnali', to: '/admin/pos/cashiers' },
          { id: 'sale-quotes', title: 'Tijorat takliflari', to: '/admin/quotations' },
          { id: 'sale-credits', title: 'Mijozdan qaytishlar', to: '/admin/credit-notes' },
          { id: 'sale-delivery', title: 'Yetkazib berish (TTN)', to: '/admin/delivery-challans' },
        ],
      },
      {
        id: 'xaridlar',
        title: 'Xaridlar',
        icon: <ShoppingBag className="w-4 h-4 shrink-0 text-teal-400" />,
        children: [
          { id: 'pur-list', title: 'Xaridlar roʻyxati', to: '/admin/purchases' },
          { id: 'pur-new', title: 'Yangi xarid', to: '/admin/purchases/new' },
          { id: 'pur-orders', title: 'Xarid buyurtmalari', to: '/admin/purchase-orders' },
          { id: 'pur-debits', title: 'Taʼminotchiga qaytarish', to: '/admin/debit-notes' },
        ],
      },
      {
        id: 'pullar',
        title: 'Pullar & Kassa',
        icon: <Wallet className="w-4 h-4 shrink-0 text-[#02C39A]" />,
        children: [
          { id: 'cash-register', title: 'Kassadagi pullar', to: '/admin/pos/shifts' },
          { id: 'bank-accounts', title: 'Bank hisoblari', to: '/admin/banking' },
          { id: 'bank-transactions', title: 'Bank operatsiyalari', to: '/admin/banking/transactions' },
          { id: 'cash-expenses', title: 'Chiqim va Xarajatlar', to: '/admin/expenses' },
          { id: 'cash-petty', title: 'Mayda kassa', to: '/admin/petty-cash' },
        ],
      },
      {
        id: 'ehujjatlar',
        title: 'E-Hujjatlar',
        icon: <FileCheck className="w-4 h-4 shrink-0 text-cyan-300" />,
        children: [
          { id: 'edoc-center', title: 'E-Hujjatlar markazi', to: '/admin/e-documents' },
          { id: 'edoc-edi', title: 'E-Faktura & E-IMZO', to: '/admin/settings/edi-settings' },
          { id: 'edoc-gateways', title: 'Oʻzbekiston toʻlov shlyuzlari', to: '/admin/settings/uz-gateways' },
        ],
      },
      {
        id: 'fabrika',
        title: 'Fabrika',
        icon: <Factory className="w-4 h-4 shrink-0 text-cyan-300" />,
        children: [
          { id: 'mfg-orders', title: 'Ishlab chiqarish buyurtmalari', to: '/admin/manufacturing/orders' },
          { id: 'mfg-bom', title: 'Texnologik xaritalar (BOM)', to: '/admin/manufacturing/bom' },
        ],
      },
      {
        id: 'hrm',
        title: 'HRM & Xodimlar',
        icon: <UserCheck className="w-4 h-4 shrink-0 text-emerald-400" />,
        children: [
          { id: 'hrm-users', title: 'Xodimlar roʻyxati', to: '/admin/users' },
          { id: 'hrm-roles', title: 'Rollar va huquqlar', to: '/admin/roles' },
          { id: 'hrm-runs', title: 'Oylik hisoblash (Payroll)', to: '/admin/payroll/runs' },
          { id: 'hrm-tabel', title: 'Ish vaqti hisobi (Tabel)', to: '/admin/payroll/tabel' },
          { id: 'hrm-profiles', title: 'Xodim profillari', to: '/admin/payroll/profiles' },
        ],
      },
      {
        id: 'hisobotlar',
        title: 'Buxgalteriya & Hisobot',
        icon: <FileSpreadsheet className="w-4 h-4 shrink-0 text-[#02C39A]" />,
        children: [
          { id: 'rep-hub', title: 'Hisobotlar markazi', to: '/admin/accounting/reports' },
          { id: 'rep-sales', title: 'Sotuvlar hisoboti', to: '/admin/reports/sales' },
          { id: 'rep-uz-gov', title: '1/2-Shakl Davlat hisobotlari', to: '/admin/accounting/reports/uz-financial-statements' },
          { id: 'rep-pnl', title: 'Foyda va zararlar (P&L)', to: '/admin/accounting/reports/profit-loss' },
          { id: 'rep-balance', title: 'Buxgalteriya balansi', to: '/admin/accounting/reports/balance-sheet' },
          { id: 'rep-trial', title: 'Aylanma vedomost (Oborotka)', to: '/admin/accounting/reports/trial-balance' },
          { id: 'rep-tax', title: 'Soliq deklaratsiyalari', to: '/admin/accounting/reports/tax-summary' },
          { id: 'rep-qqs', title: 'Soliq QQS 12%', to: '/admin/accounting/reports/soliq-qqs' },
          { id: 'rep-bhms', title: '21-son BHMS hisoblar rejasi', to: '/admin/accounting/bhms-chart-of-accounts' },
          { id: 'rep-journal', title: 'Bosh jurnal provodkalari', to: '/admin/accounting/journal-entries' },
        ],
      },
      {
        id: 'sozlamalar',
        title: 'Sozlamalar',
        icon: <Settings className="w-4 h-4 shrink-0 text-slate-300" />,
        children: [
          { id: 'set-company', title: 'Korxona rekvizitlari', to: '/admin/settings/company-settings' },
          { id: 'set-branches', title: 'Filiallar (Savdo nuqtalari)', to: '/admin/settings/branches', badge: 'Sapar' },
          { id: 'set-currencies', title: 'Valyutalar & Kurslar', to: '/admin/settings/currencies' },
          { id: 'set-translations', title: 'Tarjimalar studiyasi', to: '/admin/settings/translations' },
          { id: 'set-guide', title: 'Qoʻllanma & Yordam', to: '/admin/guide' },
          { id: 'set-design', title: 'Design System', to: '/admin/design-system' },
        ],
      },
    ],
    []
  );

  // Flat lookup map for quick favorites title/icon resolution
  const flatItemsLookup = useMemo(() => {
    const map = new Map<string, FlatItemLookup>();
    menuItems.forEach((item) => {
      if (item.to) {
        map.set(item.to, {
          id: item.id,
          title: item.title,
          to: item.to,
          icon: item.icon,
          groupTitle: item.title,
          badge: item.badge,
        });
      }
      if (item.children) {
        item.children.forEach((child) => {
          map.set(child.to, {
            id: child.id,
            title: child.title,
            to: child.to,
            icon: item.icon,
            groupTitle: item.title,
            badge: child.badge,
          });
        });
      }
    });
    return map;
  }, [menuItems]);

  // Filtered menu items based on real-time search query
  const filteredMenuItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return menuItems;

    return menuItems
      .map((item) => {
        const itemMatches = item.title.toLowerCase().includes(query);
        const matchingChildren = item.children?.filter((child) =>
          child.title.toLowerCase().includes(query)
        );

        if (itemMatches || (matchingChildren && matchingChildren.length > 0)) {
          return {
            ...item,
            children: matchingChildren && matchingChildren.length > 0 ? matchingChildren : item.children,
          };
        }
        return null;
      })
      .filter(Boolean) as MenuItem[];
  }, [menuItems, searchQuery]);

  // Auto-expand groups when user is actively searching
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const matchingIds = filteredMenuItems
        .filter((item) => item.children && item.children.length > 0)
        .map((item) => item.id);
      setOpenMenuIds((prev) => Array.from(new Set([...prev, ...matchingIds])));
    }
  }, [searchQuery, filteredMenuItems]);

  // Automatically ensure active route's parent section is opened and stays open
  useEffect(() => {
    menuItems.forEach((item) => {
      if (
        item.children?.some(
          (c) => isRouteActive(c.to, item.children)
        )
      ) {
        setOpenMenuIds((prev) => {
          if (prev.includes(item.id)) return prev;
          const next = [...prev, item.id];
          try {
            localStorage.setItem('sapar_sidebar_open_menu_ids', JSON.stringify(next));
          } catch {
            // ignore
          }
          return next;
        });
      }
    });
  }, [location.pathname, location.search, menuItems]);

  // Favorite items mapped from persistent storage
  const favoriteItems = useMemo(() => {
    return favoriteRoutes
      .map((to) => flatItemsLookup.get(to))
      .filter((item): item is FlatItemLookup => item !== undefined);
  }, [favoriteRoutes, flatItemsLookup]);

  // Render COMPACT RAIL when isOpen is false on desktop
  const renderCompactRail = () => (
    <aside className="w-16 bg-[#082026] text-slate-100 h-full flex flex-col select-none border-r border-[#13444D] shrink-0 font-sans transition-all duration-300 z-30">
      {/* Top: Quick Favorites Icon */}
      <div className="p-3 border-b border-[#13444D] flex justify-center bg-[#06181D]">
        <SimpleTooltip
          side="right"
          align="center"
          content={
            <div className="text-xs">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Sevimli sahifalar ({favoriteItems.length})</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-300">
                Kengaytirish uchun bosing yoki menyuni oching
              </div>
            </div>
          }
        >
          <button
            type="button"
            onClick={onToggle}
            className="w-10 h-10 rounded-xl bg-[#0D3B46] hover:bg-[#114E5D] border border-[#028090]/40 flex items-center justify-center text-amber-400 transition relative group"
            title="Sevimli sahifalar"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400 group-hover:scale-110 transition" />
            {favoriteItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#02C39A] text-[#0B2B33] text-[9px] font-black flex items-center justify-center shadow-xs">
                {favoriteItems.length}
              </span>
            )}
          </button>
        </SimpleTooltip>
      </div>

      {/* Middle: Compact Rail Icons with Radix UI Tooltips */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-2 custom-scrollbar flex flex-col items-center">
        {menuItems.map((item) => {
          const isItemActive = item.to
            ? isRouteActive(item.to)
            : item.children?.some((c) => isRouteActive(c.to, item.children));

          return (
            <SimpleTooltip
              key={item.id}
              side="right"
              align="center"
              content={
                <div className="py-1 px-0.5 min-w-[140px]">
                  <div className="font-bold text-white text-xs border-b border-slate-700/60 pb-1 flex items-center justify-between">
                    <span>{item.title}</span>
                    {item.children && (
                      <span className="text-[10px] text-slate-400">{item.children.length} band</span>
                    )}
                  </div>
                  {item.children && (
                    <div className="mt-1.5 space-y-1">
                      {item.children.slice(0, 5).map((c) => (
                        <div
                          key={c.to}
                          onClick={() => navigate(c.to)}
                          className="cursor-pointer text-[11px] text-slate-300 hover:text-[#02C39A] flex items-center justify-between py-0.5 rounded px-1 hover:bg-slate-800/50"
                        >
                          <span className="truncate">{c.title}</span>
                          {c.badge && (
                            <span className="text-[9px] px-1 rounded bg-[#02C39A] text-[#0B2B33] font-bold">
                              {c.badge}
                            </span>
                          )}
                        </div>
                      ))}
                      {item.children.length > 5 && (
                        <div className="text-[10px] text-slate-400 pt-0.5 italic text-center">
                          +{item.children.length - 5} ta qoʻshimcha
                        </div>
                      )}
                    </div>
                  )}
                </div>
              }
            >
              <button
                type="button"
                onClick={() => {
                  if (item.to) {
                    navigate(item.to);
                  } else if (item.children && item.children.length > 0) {
                    navigate(item.children[0].to);
                  }
                }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 relative ${isItemActive
                  ? 'bg-[#028090] text-white shadow-sm shadow-[#028090]/50 ring-1 ring-[#02C39A]/60'
                  : 'text-slate-300 hover:bg-[#0D3B46] hover:text-[#02C39A]'
                  }`}
              >
                {item.icon}
                {isItemActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#02C39A] rounded-r-full" />
                )}
              </button>
            </SimpleTooltip>
          );
        })}
      </div>

      {/* Bottom: Rail Expand Action */}
      <div className="p-3 border-t border-[#13444D] bg-[#06181D] flex justify-center">
        <SimpleTooltip side="right" align="center" content="Menyuni kengaytirish">
          <button
            type="button"
            onClick={onToggle}
            className="w-10 h-10 rounded-xl bg-[#0D3B46]/70 hover:bg-[#028090] text-slate-300 hover:text-white flex items-center justify-center transition shadow-xs"
          >
            <PanelLeftOpen className="w-4 h-4 text-[#02C39A]" />
          </button>
        </SimpleTooltip>
      </div>
    </aside>
  );

  // If closed on desktop, show compact rail; if on mobile and closed, hidden
  if (!isOpen) {
    return (
      <div className="hidden md:block h-full">
        {renderCompactRail()}
      </div>
    );
  }

  // Full Expanded Sidebar Content
  const sidebarContent = (
    <aside className="w-64 bg-[#082026] text-slate-100 h-full flex flex-col select-none border-r border-[#13444D] transition-all duration-200 shrink-0 overflow-hidden font-sans shadow-lg">
      {/* 1. Quick Search Filter Bar */}
      <div className="p-2.5 border-b border-[#13444D] bg-[#06181D]/80">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Menyudan qidirish..."
            className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[#0D3B46]/60 hover:bg-[#0D3B46] focus:bg-[#0D3B46] border border-[#13444D] focus:border-[#02C39A]/60 text-xs text-white placeholder:text-slate-400 focus:outline-none transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-slate-400 hover:text-white p-0.5 rounded transition"
              title="Tozalash"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Pinned "Sevimli sahifalar" (Favorites) Accordion Panel */}
      <div className="border-b border-[#13444D] bg-[#06181D]/50">
        <button
          type="button"
          onClick={toggleFavoritesExpanded}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-[#0D3B46]/50 transition"
        >
          <div className="flex items-center gap-2">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-extrabold text-white tracking-wide">Sevimli sahifalar</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
              {favoriteItems.length}
            </span>
          </div>
          <div className="text-slate-400">
            {isFavoritesExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </div>
        </button>

        {isFavoritesExpanded && (
          <div className="px-2 pb-2.5 pt-0.5 space-y-1">
            {favoriteItems.length === 0 ? (
              <div className="px-3 py-2.5 rounded-lg border border-dashed border-[#13444D] text-center text-[11px] text-slate-400 bg-[#082026]/40">
                <Star className="w-4 h-4 mx-auto mb-1 text-slate-500 stroke-1" />
                Yulduzcha <span className="text-amber-400">★</span> bosib sevimli sahifalaringizni bu yerga qoʻshing
              </div>
            ) : (
              favoriteItems.map((fav) => {
                const isFavActive = isRouteActive(fav.to, favoriteItems.map((f) => ({ to: f.to })));

                return (
                  <div
                    key={fav.to}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${isFavActive
                      ? 'bg-gradient-to-r from-[#028090] to-[#0D4E5B] text-white shadow-xs font-bold'
                      : 'text-slate-200 hover:bg-[#0D3B46] hover:text-[#02C39A]'
                      }`}
                  >
                    <div
                      onClick={() => navigate(fav.to)}
                      className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="shrink-0">{fav.icon}</div>
                      <div className="truncate flex flex-col">
                        <span className="truncate">{fav.title}</span>
                        <span className="text-[9px] text-slate-400 font-normal leading-tight truncate">
                          {fav.groupTitle}
                        </span>
                      </div>
                    </div>

                    {/* Unstar / Remove Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(fav.to, e)}
                      className="p-1 rounded-md text-amber-400 hover:text-red-400 transition shrink-0 ml-1.5 opacity-80 hover:opacity-100"
                      title="Sevimlilardan oʻchirish"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 transition-transform group-hover:scale-105" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 3. Scrollable Navigation Menu List */}
      <div className="flex-1 overflow-y-auto py-2.5 px-2 space-y-0.5 custom-scrollbar text-xs">
        {filteredMenuItems.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-slate-400">
            «{searchQuery}» boʻyicha menyu topilmadi
          </div>
        ) : (
          <AccordionPrimitive.Root
            type="multiple"
            value={openMenuIds}
            onValueChange={handleOpenMenuChange}
            className="space-y-0.5"
          >
            {filteredMenuItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isCurrentActive = item.to
                ? isRouteActive(item.to)
                : item.children?.some((c) => isRouteActive(c.to, item.children));

              // Single link item (e.g. Bosh panel)
              if (!hasChildren && item.to) {
                const fav = isFavorite(item.to);
                return (
                  <div
                    key={item.id}
                    className="group relative flex items-center justify-between rounded-lg transition"
                  >
                    <NavLink
                      to={item.to}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold flex-1 min-w-0 transition ${isActive
                          ? 'bg-[#028090] text-white shadow-sm shadow-[#028090]/40'
                          : 'text-slate-200 hover:bg-[#0D3B46] hover:text-[#02C39A]'
                        }`
                      }
                    >
                      {item.icon}
                      <span className="truncate flex-1">{item.title}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0 mr-4">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>

                    {/* Inline Favorite Star Action */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(item.to!, e)}
                      className={`absolute right-2 p-1 rounded-md transition-all ${fav
                        ? 'text-amber-400 opacity-100'
                        : 'text-slate-400 hover:text-amber-400 opacity-0 group-hover:opacity-100'
                        }`}
                      title={fav ? 'Sevimlilardan oʻchirish' : 'Sevimlilarga qoʻshish'}
                    >
                      <Star
                        className={`w-3.5 h-3.5 transition-transform duration-150 active:scale-125 ${fav ? 'fill-amber-400 text-amber-400' : ''
                          }`}
                      />
                    </button>
                  </div>
                );
              }

              // Radix UI Accordion Item for Expandable Groups
              return (
                <AccordionPrimitive.Item key={item.id} value={item.id} className="border-none space-y-0.5">
                  <AccordionPrimitive.Header className="flex m-0 p-0">
                    <AccordionPrimitive.Trigger
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-bold transition group cursor-pointer ${isCurrentActive
                        ? 'text-[#02C39A] bg-[#0D3B46]/70'
                        : 'text-slate-200 hover:bg-[#0D3B46] hover:text-white'
                        } [&[data-state=open]_.chevron-icon]:rotate-180`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {item.icon}
                        <span className="truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        {item.children && (
                          <span className="text-[10px] opacity-60 font-medium group-hover:opacity-100">
                            {item.children.length}
                          </span>
                        )}
                        <ChevronDown className="w-3.5 h-3.5 text-[#02C39A] transition-transform duration-200 chevron-icon" />
                      </div>
                    </AccordionPrimitive.Trigger>
                  </AccordionPrimitive.Header>

                  <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div className="pl-4 pr-1 py-1 space-y-0.5 border-l border-[#028090]/30 ml-4.5 mt-0.5">
                      {item.children!.map((child) => {
                        const isChildActive = isRouteActive(child.to, item.children);
                        const childFav = isFavorite(child.to);

                        return (
                          <div
                            key={child.to}
                            className="group/child relative flex items-center justify-between rounded-md transition"
                          >
                            <NavLink
                              to={child.to}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-semibold flex-1 min-w-0 transition pr-7 ${isChildActive
                                ? 'bg-[#028090] text-white font-bold shadow-2xs'
                                : 'text-slate-300 hover:text-[#02C39A] hover:bg-[#0D3B46]/60'
                                }`}
                            >
                              <span className="truncate">{child.title}</span>
                              {child.badge && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#02C39A] text-[#0B2B33] ml-1.5 shrink-0">
                                  {child.badge}
                                </span>
                              )}
                            </NavLink>

                            {/* Child Star Toggle */}
                            <button
                              type="button"
                              onClick={(e) => toggleFavorite(child.to, e)}
                              className={`absolute right-1.5 p-1 rounded transition-all ${childFav
                                ? 'text-amber-400 opacity-100'
                                : 'text-slate-400 hover:text-amber-400 opacity-0 group-hover/child:opacity-100'
                                }`}
                              title={childFav ? 'Sevimlilardan oʻchirish' : 'Sevimlilarga qoʻshish'}
                            >
                              <Star
                                className={`w-3 h-3 transition-transform duration-150 active:scale-125 ${childFav ? 'fill-amber-400 text-amber-400' : ''
                                  }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionPrimitive.Content>
                </AccordionPrimitive.Item>
              );
            })}
          </AccordionPrimitive.Root>
        )}
      </div>

      {/* 4. Fixed Bottom Footer / SAPAR Brand Version & Language Switcher */}
      <div className="p-3 border-t border-[#13444D] bg-[#06181D] space-y-2.5 text-[11px] text-slate-300">
        {/* Language Switcher moved from Header */}
        <LanguageSwitcher variant="sidebar" isSidebarOpen={isOpen} />

        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white">SAPAR</span>
            <span className="text-[10px] text-slate-400">v2.9</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-[#0D3B46] text-[#02C39A] font-bold text-[10px] border border-[#028090]/30">
              Oʻzbekiston
            </span>
            {onToggle && (
              <button
                type="button"
                onClick={onToggle}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#0D3B46] transition cursor-pointer"
                title="Menyuni yigʻish"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile Backdrop Overlay (only rendered when drawer is open on mobile) */}
      <div
        className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Main Sidebar (relative on desktop, fixed slide-over on mobile) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed md:relative inset-y-0 left-0 z-50 md:z-auto h-full shrink-0 transition-transform duration-200"
      >
        {sidebarContent}
      </div>
    </>
  );
};

export const IboxSidebar = SaparSidebar;
export default SaparSidebar;
