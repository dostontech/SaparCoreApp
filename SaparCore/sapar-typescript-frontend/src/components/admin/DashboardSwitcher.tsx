import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Package,
  Target,
  Calculator,
  BookOpen,
  TrendingUp,
  ShoppingBag,
  Briefcase,
  Headphones,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const DashboardSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const dashboards = [
    {
      to: '/admin',
      mode: 'all',
      label: t('dashboard.overview', 'Asosiy Boshqaruv (ERP)'),
      icon: <LayoutDashboard size={15} className="text-teal-600" />,
      badge: 'Asosiy',
      end: true,
    },
    {
      to: '/admin/dashboard/pos',
      mode: 'pos',
      label: t('dashboard.pos', 'POS & Kassa'),
      icon: <Calculator size={15} className="text-emerald-600" />,
      badge: 'Cheklar & Smena',
    },
    {
      to: '/admin/dashboard/inventory',
      mode: 'inventory',
      label: t('dashboard.inventory', 'Ombor & Tovar'),
      icon: <Package size={15} className="text-amber-600" />,
      badge: 'FIFO Sklad',
    },
    {
      to: '/admin/dashboard/hrm',
      mode: 'hrm',
      label: t('dashboard.hrm', 'HRM & Xodimlar'),
      icon: <Users size={15} className="text-teal-600" />,
      badge: 'Tabel & Oylik',
    },
    {
      to: '/admin/dashboard/crm',
      mode: 'crm',
      label: t('dashboard.crm', 'CRM & Savdo Quvuri'),
      icon: <Target size={15} className="text-indigo-600" />,
      badge: 'Lidlar & Voronka',
    },
    {
      to: '/admin/dashboard/finance',
      mode: 'finance',
      label: t('dashboard.finance', 'Moliya & Buxgalteriya'),
      icon: <BookOpen size={15} className="text-emerald-600" />,
      badge: 'BHMS 21 & Soliq',
    },
    {
      to: '/admin/dashboard/sales',
      mode: 'sales',
      label: t('dashboard.sales', 'Savdo & Tushum'),
      icon: <TrendingUp size={15} className="text-teal-600" />,
      badge: 'Fakturalar',
    },
    {
      to: '/admin/dashboard/procurement',
      mode: 'purchases',
      label: t('dashboard.procurement', 'Xaridlar & Taʼminot'),
      icon: <ShoppingBag size={15} className="text-purple-600" />,
      badge: 'Taʼminotchilar',
    },
    {
      to: '/admin/dashboard/projects',
      mode: 'projects',
      label: t('dashboard.projects', 'Loyihalar & Vazifalar'),
      icon: <Briefcase size={15} className="text-blue-600" />,
      badge: 'Kanban',
    },
    {
      to: '/admin/dashboard/support',
      mode: 'support',
      label: t('dashboard.support', 'Qoʻllab-quvvatlash'),
      icon: <Headphones size={15} className="text-teal-600" />,
      badge: 'Helpdesk SLA',
    },
  ];

  const currentDashboard = dashboards.find((d) => (d.end ? pathname === d.to : pathname.startsWith(d.to))) || dashboards[0];

  const handleSelect = (item: (typeof dashboards)[0]) => {
    setIsOpen(false);
    localStorage.setItem('sapar_workspace_mode', item.mode);
    window.dispatchEvent(new CustomEvent('sapar-workspace-change', { detail: item.mode }));
    navigate(item.to);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 text-slate-800 text-xs font-bold shadow-2xs hover:shadow-xs transition-all"
      >
        <div className="flex items-center gap-2">
          {currentDashboard.icon}
          <span>{currentDashboard.label}</span>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-600 font-semibold border border-slate-200/60 hidden sm:inline-block">
          {currentDashboard.badge}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-3xl border border-slate-200/90 shadow-2xl z-50 p-2 animate-in zoom-in-95 duration-150 space-y-1">
            <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
              <span>Ish Maydoni & Panellar</span>
              <Sparkles size={13} className="text-teal-500" />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-1 py-1 pr-1">
              {dashboards.map((d) => {
                const isActive = d.end ? pathname === d.to : pathname.startsWith(d.to);
                return (
                  <button
                    key={d.to}
                    onClick={() => handleSelect(d)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                      isActive
                        ? 'bg-teal-50 text-teal-900 border border-teal-200/80 shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center shrink-0">
                        {d.icon}
                      </div>
                      <span className="truncate">{d.label}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                        isActive ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {d.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardSwitcher;
