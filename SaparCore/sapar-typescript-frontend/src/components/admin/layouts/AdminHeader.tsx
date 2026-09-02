import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LogOut,
  User,
  Menu,
  Sparkles,
  Search,
  ChevronRight,
} from 'lucide-react';
import type { RootState } from '../../../store';
import { logout } from '../../../store/auth/authSlice';
import { assetUrl } from '@utils/assetUrl';
import { usePageHeader } from '../../../context/PageHeaderContext';
import { GettingStartedDrawer } from '../onboarding/GettingStartedDrawer';
import { QuickCreateDropdown } from '../header/QuickCreateDropdown';
import { GlobalSearchModal } from '../header/GlobalSearchModal';
import { NotificationDropdown } from '../header/NotificationDropdown';
import { SaparLogo } from '../../common/SaparLogo';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@components/ui';

interface HeaderProps {
  toggleSidebar: () => void;
}

const getPageInfoFromPath = (pathname: string, t: any): { title: string; section: string } => {
  if (pathname === '/admin' || pathname === '/admin/' || pathname === '/admin/dashboard') {
    return { title: t('nav.dashboard', 'Boshqaruv paneli'), section: t('common.main', 'Asosiy') };
  }
  if (pathname.startsWith('/admin/dashboard/sales')) {
    return { title: t('nav.salesDashboard', 'Savdo Boshqaruvi'), section: t('nav.sales', 'Savdo') };
  }
  if (pathname.startsWith('/admin/dashboard/pos')) {
    return { title: t('nav.posDashboard', 'POS Boshqaruvi'), section: t('workspace.pos', 'POS Kassa') };
  }
  if (pathname.startsWith('/admin/dashboard/inventory')) {
    return { title: t('nav.inventoryDashboard', 'Ombor Boshqaruvi'), section: t('nav.inventory', 'Ombor') };
  }
  if (pathname.startsWith('/admin/dashboard/procurement')) {
    return { title: t('nav.procurementDashboard', 'Xaridlar Boshqaruvi'), section: t('nav.purchases', 'Xaridlar') };
  }
  if (pathname.startsWith('/admin/dashboard/finance')) {
    return { title: t('nav.financeDashboard', 'Moliya Boshqaruvi'), section: t('nav.finance', 'Moliya') };
  }
  if (pathname.startsWith('/admin/dashboard/crm')) {
    return { title: t('nav.crmDashboard', 'CRM Boshqaruvi'), section: t('workspace.crm', 'CRM') };
  }
  if (pathname.startsWith('/admin/dashboard/hrm')) {
    return { title: t('nav.hrmDashboard', 'HRM Boshqaruvi'), section: t('workspace.hrm', 'HRM') };
  }
  if (pathname.startsWith('/admin/dashboard/projects')) {
    return { title: t('nav.projectsDashboard', 'Loyihalar Boshqaruvi'), section: t('workspace.projects', 'Loyihalar') };
  }
  if (pathname.startsWith('/admin/dashboard/support')) {
    return { title: t('nav.supportDashboard', 'Yordam Boshqaruvi'), section: t('workspace.support', 'Yordam') };
  }
  if (pathname.startsWith('/admin/pos')) {
    return { title: t('nav.pos', 'POS Kassa Terminali'), section: t('workspace.pos', 'POS Kassa') };
  }
  if (pathname.startsWith('/admin/e-documents')) {
    return { title: t('nav.eDocuments', 'E-Hujjatlar'), section: t('common.main', 'Asosiy') };
  }
  if (pathname.startsWith('/admin/contacts') || pathname.startsWith('/admin/crm')) {
    return { title: t('nav.contacts', 'Kontaktlar'), section: t('common.main', 'Asosiy') };
  }
  if (pathname.startsWith('/admin/invoices')) {
    return { title: t('nav.invoices', 'Hisob-fakturalar'), section: t('nav.sales', 'Savdo') };
  }
  if (pathname.startsWith('/admin/quotations')) {
    return { title: t('nav.quotations', 'Tijorat takliflari'), section: t('nav.sales', 'Savdo') };
  }
  if (pathname.startsWith('/admin/recurring-invoices')) {
    return { title: t('nav.recurringInvoices', 'Davriy fakturalar'), section: t('nav.sales', 'Savdo') };
  }
  if (pathname.startsWith('/admin/credit-notes')) {
    return { title: t('nav.creditNotes', 'Kredit-notalar'), section: t('nav.sales', 'Savdo') };
  }
  if (pathname.startsWith('/admin/delivery-challans')) {
    return { title: t('nav.deliveryChallans', 'Yuk xatlari (TTN)'), section: t('nav.sales', 'Savdo') };
  }
  if (pathname.startsWith('/admin/purchases')) {
    return { title: t('nav.purchases', 'Xaridlar'), section: t('nav.purchases', 'Xaridlar') };
  }
  if (pathname.startsWith('/admin/purchase-orders')) {
    return { title: t('nav.purchaseOrders', 'Xarid buyurtmalari'), section: t('nav.purchases', 'Xaridlar') };
  }
  if (pathname.startsWith('/admin/debit-notes')) {
    return { title: t('nav.debitNotes', 'Debet-notalar'), section: t('nav.purchases', 'Xaridlar') };
  }
  if (pathname.startsWith('/admin/supplier-balances')) {
    return { title: t('nav.supplierBalances', 'Yetkazib beruvchilar balansi'), section: t('nav.purchases', 'Xaridlar') };
  }
  if (pathname.startsWith('/admin/supplier-payments')) {
    return { title: t('nav.supplierPayments', 'Yetkazib beruvchilarga toʻlov'), section: t('nav.purchases', 'Xaridlar') };
  }
  if (pathname.startsWith('/admin/products')) {
    return { title: t('nav.products', 'Tovarlar va Xizmatlar'), section: t('nav.inventory', 'Ombor') };
  }
  if (pathname.startsWith('/admin/inventory')) {
    return { title: t('nav.stock', 'Ombor qoldiqlari'), section: t('nav.inventory', 'Ombor') };
  }
  if (pathname.startsWith('/admin/categories')) {
    return { title: t('nav.categories', 'Kategoriyalar'), section: t('nav.inventory', 'Ombor') };
  }
  if (pathname.startsWith('/admin/banking')) {
    return { title: t('nav.banking', 'Bank hisoblari'), section: t('nav.finance', 'Moliya') };
  }
  if (pathname.startsWith('/admin/expenses')) {
    return { title: t('nav.expenses', 'Xarajatlar'), section: t('nav.finance', 'Moliya') };
  }
  if (pathname.startsWith('/admin/petty-cash')) {
    return { title: t('nav.pettyCash', 'Kassa'), section: t('nav.finance', 'Moliya') };
  }
  if (pathname.startsWith('/admin/accounting/bhms-chart-of-accounts')) {
    return { title: t('nav.bhmsChartOfAccounts', '21-son BHMS Hisoblar Rejasi'), section: t('nav.accounting', 'Buxgalteriya') };
  }
  if (pathname.startsWith('/admin/accounting/chart-of-accounts')) {
    return { title: t('nav.chartOfAccounts', 'Hisoblar rejasi'), section: t('nav.accounting', 'Buxgalteriya') };
  }
  if (pathname.startsWith('/admin/accounting/journal-entries')) {
    return { title: t('nav.journalEntries', 'Jurnallar va Provodkalar'), section: t('nav.accounting', 'Buxgalteriya') };
  }
  if (pathname.startsWith('/admin/accounting/reports/uz-financial-statements')) {
    return { title: t('nav.uzFinancialReports', '1/2-Shakl Davlat Hisobotlari'), section: t('nav.financialReports', 'Hisobotlar') };
  }
  if (pathname.startsWith('/admin/accounting/reports')) {
    return { title: t('nav.financialReports', 'Moliyaviy Hisobotlar'), section: t('nav.financialReports', 'Hisobotlar') };
  }
  if (pathname.startsWith('/admin/payroll')) {
    return { title: t('nav.payroll', 'Ish haqi'), section: t('nav.hrm', 'Xodimlar') };
  }
  if (pathname.startsWith('/admin/time-tracking') || pathname.startsWith('/admin/leave')) {
    return { title: t('nav.attendance', 'Davomat va Taʼtillar'), section: t('nav.hrm', 'Xodimlar') };
  }
  if (pathname.startsWith('/admin/users') || pathname.startsWith('/admin/roles')) {
    return { title: t('nav.users', 'Foydalanuvchilar va Rollar'), section: t('nav.settings', 'Maʼmuriyat') };
  }
  if (pathname.startsWith('/admin/settings/profile') || pathname.startsWith('/admin/settings/account-settings')) {
    return { title: t('nav.accountSettings', 'Profil va Hisob Sozlamalari'), section: t('nav.settings', 'Sozlamalar') };
  }
  if (pathname.startsWith('/admin/settings/subscription-plans')) {
    return { title: t('nav.subscriptionPlans', 'Obuna va Tariflar'), section: t('nav.settings', 'Sozlamalar') };
  }
  if (pathname.startsWith('/admin/settings/edi-settings')) {
    return { title: t('nav.ediSettings', 'E-IMZO & E-Faktura Sozlamalari'), section: t('nav.settings', 'Sozlamalar') };
  }
  if (pathname.startsWith('/admin/settings')) {
    return { title: t('nav.settings', 'Tizim Sozlamalari'), section: t('nav.settings', 'Sozlamalar') };
  }
  if (pathname.startsWith('/admin/business-loans') || pathname.startsWith('/admin/financing')) {
    return { title: t('nav.businessFinancing', 'Biznesingizni moliyalashtiring'), section: t('common.main', 'Boshqaruv') };
  }
  return { title: 'SAPAR ERP', section: t('common.main', 'Asosiy') };
};

const AdminHeader = ({ toggleSidebar }: HeaderProps) => {
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isGettingStartedOpen, setIsGettingStartedOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const { title: pageTitle, actions: pageActions } = usePageHeader();
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  // Global keyboard shortcut: Ctrl+K or Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const routeInfo = getPageInfoFromPath(pathname, t);
  const activeTitle = pageTitle || routeInfo.title;

  return (
    <div className="flex flex-col w-full z-30 font-sans shadow-2xs">
      {/* ========================================================================= */}
      {/* LAYER 1: STATIC TOP GLOBAL HEADER (Fixed / Always consistent across app) */}
      {/* ========================================================================= */}
      <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200/80 z-20">
        {/* Left: Sidebar Toggle + Workspace Name */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition focus:outline-none cursor-pointer"
            title="Menyuni ochish/yopish"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <SaparLogo variant="dark" className="h-5 w-auto" />
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1 py-0.2 rounded border border-teal-200">
              UZ
            </span>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition border border-slate-200/80 text-xs font-medium cursor-pointer shadow-2xs"
            title="Ctrl+K"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{t('common.search', 'Qidirish...')}</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white rounded border border-slate-200 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Controls: Quick Add, Notifications, Getting Started, Profile */}
        <div className="flex items-center gap-2">
          {/* Quick Create (+) Dropdown */}
          <QuickCreateDropdown />

          {/* Notification Bell Dropdown */}
          <NotificationDropdown />

          {/* Getting Started Guide Trigger */}
          <button
            type="button"
            onClick={() => setIsGettingStartedOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 hover:bg-teal-100 hover:text-teal-900 transition border border-teal-200 shadow-2xs cursor-pointer"
            title={t('common.help', 'Qoʻllanma')}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span className="hidden md:inline">{t('common.help', 'Qoʻllanma')}</span>
          </button>

          {/* Design System Showcase Link */}
          <Link
            to="/admin/design-system"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 transition border border-purple-200 shadow-2xs"
            title="Radix UI Design System"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Design System</span>
          </Link>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Radix Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition focus:outline-none cursor-pointer"
              >
                <div
                  className={
                    user?.profileImageUrl
                      ? 'w-8 h-8 rounded-full ring-2 ring-teal-600 ring-offset-1 flex items-center justify-center text-xs font-semibold'
                      : 'w-8 h-8 bg-gradient-to-br from-teal-700 to-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-2xs'
                  }
                >
                  {user?.profileImageUrl ? (
                    <img
                      src={assetUrl(user.profileImageUrl)}
                      alt="User"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span>
                      {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline-block text-xs font-bold text-slate-700 max-w-[100px] truncate">
                  {user?.firstName || 'Foydalanuvchi'}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1">
              <DropdownMenuLabel className="px-3 py-2">
                <p className="text-xs font-bold text-gray-900 truncate">
                  {user?.firstName ? `${user.firstName} ${user?.lastName || ''}` : 'Foydalanuvchi'}
                </p>
                <p className="text-[11px] text-gray-500 truncate mt-0.5 lowercase">
                  {user?.email || 'user@example.com'}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  to="/admin/settings/profile"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:text-gray-900"
                >
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  {t('nav.companySettings', 'Profil sozlamalari')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/admin/design-system"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-purple-700 hover:text-purple-900"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Radix UI Components
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="danger"
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                {t('common.logout', 'Chiqish')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* LAYER 2: PAGE SUB-HEADER (Current Page Title, Breadcrumb & Action Bar)    */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 bg-slate-50/90 border-b border-slate-200/70 z-10">
        {/* Left: Breadcrumbs & Page Heading */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <span>{routeInfo.section}</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-teal-700">{activeTitle}</span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate mt-0.5">
            {activeTitle}
          </h2>
        </div>

        {/* Right: Page-Specific Actions (e.g. DashboardSwitcher or page buttons) */}
        {pageActions && (
          <div className="flex items-center gap-2 shrink-0">
            {pageActions}
          </div>
        )}
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Slide-out Getting Started Drawer */}
      <GettingStartedDrawer
        isOpen={isGettingStartedOpen}
        onClose={() => setIsGettingStartedOpen(false)}
      />
    </div>
  );
};

export default AdminHeader;