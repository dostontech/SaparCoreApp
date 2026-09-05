import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  X,
  FileText,
  Users,
  Box,
  Receipt,
  ShoppingBag,
  Landmark,
  BookOpen,
  Settings,
  ShieldCheck,
  ArrowRight,
  Command,
} from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  categoryKey: string;
  category: string;
  description: string;
  path: string;
  icon: React.ReactNode;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const searchableItems: SearchItem[] = useMemo(() => [
    // Asosiy & Hujjatlar
    {
      id: '1',
      title: t('nav.dashboard', 'Boshqaruv paneli'),
      categoryKey: 'main',
      category: t('common.main', 'Asosiy'),
      description: t('search.descDashboard', 'Boshqaruv paneli va tahlil'),
      path: '/admin',
      icon: <Landmark className="w-4 h-4 text-teal-600" />,
    },
    {
      id: '2',
      title: t('nav.eDocuments', 'E-Hujjatlar'),
      categoryKey: 'documents',
      category: t('nav.eDocuments', 'Hujjatlar'),
      description: t('search.descEDocuments', 'Didox & Factura.uz E-Fakturalar'),
      path: '/admin/e-documents',
      icon: <ShieldCheck className="w-4 h-4 text-teal-600" />,
    },
    {
      id: '3',
      title: t('nav.contacts', 'Kontaktlar'),
      categoryKey: 'main',
      category: t('common.main', 'Asosiy'),
      description: t('search.descContacts', 'Mijozlar va hamkorlar'),
      path: '/admin/contacts',
      icon: <Users className="w-4 h-4 text-blue-600" />,
    },

    // Savdo
    {
      id: '4',
      title: t('nav.invoices', 'Hisob-fakturalar'),
      categoryKey: 'sales',
      category: t('nav.sales', 'Savdo'),
      description: t('search.descInvoices', 'Hisob-fakturalar va hisob-kitoblar'),
      path: '/admin/invoices',
      icon: <Receipt className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: '5',
      title: t('nav.quotations', 'Tijorat takliflari'),
      categoryKey: 'sales',
      category: t('nav.sales', 'Savdo'),
      description: t('search.descQuotations', 'Tijorat takliflari va smetalar'),
      path: '/admin/quotations',
      icon: <FileText className="w-4 h-4 text-sky-600" />,
    },
    {
      id: '6',
      title: t('nav.deliveryChallans', 'Yuk xatlari (TTN)'),
      categoryKey: 'sales',
      category: t('nav.sales', 'Savdo'),
      description: t('search.descWaybills', 'Tovarni yetkazib berish yuk xatlari'),
      path: '/admin/delivery-challans',
      icon: <FileText className="w-4 h-4 text-amber-600" />,
    },
    {
      id: '7',
      title: t('nav.creditNotes', 'Kredit-notalar'),
      categoryKey: 'sales',
      category: t('nav.sales', 'Savdo'),
      description: t('search.descCreditNotes', 'Kredit-notalar va qaytarishlar'),
      path: '/admin/credit-notes',
      icon: <Receipt className="w-4 h-4 text-rose-600" />,
    },

    // Xaridlar
    {
      id: '8',
      title: t('nav.purchases', 'Xaridlar'),
      categoryKey: 'purchases',
      category: t('nav.purchases', 'Xaridlar'),
      description: t('search.descPurchases', 'Xarid hisob-fakturalari'),
      path: '/admin/purchases',
      icon: <ShoppingBag className="w-4 h-4 text-indigo-600" />,
    },
    {
      id: '9',
      title: t('nav.purchaseOrders', 'Xarid buyurtmalari'),
      categoryKey: 'purchases',
      category: t('nav.purchases', 'Xaridlar'),
      description: t('search.descPurchaseOrders', 'Xarid buyurtmalari'),
      path: '/admin/purchase-orders',
      icon: <ShoppingBag className="w-4 h-4 text-indigo-600" />,
    },
    {
      id: '10',
      title: t('nav.supplierBalances', 'Yetkazib beruvchilar balansi'),
      categoryKey: 'purchases',
      category: t('nav.purchases', 'Xaridlar'),
      description: t('search.descSupplierBalances', 'Yetkazib beruvchilar hisob-kitobi'),
      path: '/admin/supplier-balances',
      icon: <Users className="w-4 h-4 text-indigo-600" />,
    },

    // Ombor
    {
      id: '11',
      title: t('nav.products', 'Tovarlar va Xizmatlar'),
      categoryKey: 'inventory',
      category: t('nav.inventory', 'Ombor'),
      description: t('search.descProducts', 'Tovarlar, xizmatlar va narxlar'),
      path: '/admin/products',
      icon: <Box className="w-4 h-4 text-amber-600" />,
    },
    {
      id: '12',
      title: t('nav.stock', 'Ombor qoldiqlari'),
      categoryKey: 'inventory',
      category: t('nav.inventory', 'Ombor'),
      description: t('search.descStock', 'Ombor qoldiqlari va nazorat'),
      path: '/admin/inventory',
      icon: <Box className="w-4 h-4 text-amber-600" />,
    },
    {
      id: '13',
      title: 'FIFO',
      categoryKey: 'inventory',
      category: t('nav.inventory', 'Ombor'),
      description: t('search.descFifo', 'FIFO tannarx qatlamlari hisobi'),
      path: '/admin/inventory/cost-layers',
      icon: <Box className="w-4 h-4 text-amber-600" />,
    },

    // Moliya & Buxgalteriya
    {
      id: '14',
      title: t('nav.banking', 'Bank hisoblari'),
      categoryKey: 'finance',
      category: t('nav.finance', 'Moliya'),
      description: t('search.descBanking', 'Bank hisoblari va koʻchirmalar'),
      path: '/admin/banking',
      icon: <Landmark className="w-4 h-4 text-teal-600" />,
    },
    {
      id: '15',
      title: t('nav.expenses', 'Xarajatlar'),
      categoryKey: 'finance',
      category: t('nav.finance', 'Moliya'),
      description: t('search.descExpenses', 'Operatsion xarajatlar'),
      path: '/admin/expenses',
      icon: <Receipt className="w-4 h-4 text-rose-600" />,
    },
    {
      id: '16',
      title: t('nav.pettyCash', 'Kassa'),
      categoryKey: 'finance',
      category: t('nav.finance', 'Moliya'),
      description: t('search.descPettyCash', 'Kassa va naqd pul daftari'),
      path: '/admin/petty-cash',
      icon: <Landmark className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: '17',
      title: t('nav.bhmsChartOfAccounts', '21-son BHMS Hisoblar Rejasi'),
      categoryKey: 'accounting',
      category: t('nav.accounting', 'Buxgalteriya'),
      description: t('search.descBhms', 'Milliy 4 xonali hisoblar rejasi'),
      path: '/admin/accounting/bhms-chart-of-accounts',
      icon: <BookOpen className="w-4 h-4 text-blue-600" />,
    },
    {
      id: '18',
      title: t('nav.journalEntries', 'Jurnallar va Provodkalar'),
      categoryKey: 'accounting',
      category: t('nav.accounting', 'Buxgalteriya'),
      description: t('search.descJournalEntries', 'Bosh kitob jurnallari va provodkalar'),
      path: '/admin/accounting/journal-entries',
      icon: <BookOpen className="w-4 h-4 text-blue-600" />,
    },
    {
      id: '19',
      title: t('nav.profitLoss', 'Moliyaviy natijalar (2-shakl)'),
      categoryKey: 'reports',
      category: t('nav.financialReports', 'Hisobotlar'),
      description: t('search.descProfitLoss', 'Moliyaviy natijalar toʻgʻrisida hisobot (2-shakl)'),
      path: '/admin/accounting/reports/profit-loss',
      icon: <FileText className="w-4 h-4 text-teal-600" />,
    },
    {
      id: '20',
      title: t('nav.balanceSheet', 'Buxgalteriya balansi (1-shakl)'),
      categoryKey: 'reports',
      category: t('nav.financialReports', 'Hisobotlar'),
      description: t('search.descBalanceSheet', 'Buxgalteriya balansi (1-shakl)'),
      path: '/admin/accounting/reports/balance-sheet',
      icon: <FileText className="w-4 h-4 text-teal-600" />,
    },
    {
      id: '21',
      title: t('nav.trialBalance', 'Aylanma vedomost (Oborotka)'),
      categoryKey: 'reports',
      category: t('nav.financialReports', 'Hisobotlar'),
      description: t('search.descTrialBalance', 'Aylanma vedomost (Oborotka)'),
      path: '/admin/accounting/reports/trial-balance',
      icon: <FileText className="w-4 h-4 text-teal-600" />,
    },
    {
      id: '22',
      title: t('nav.taxReports', 'Soliq hisobotlari'),
      categoryKey: 'reports',
      category: t('nav.financialReports', 'Hisobotlar'),
      description: t('search.descTaxReports', 'QQS 12% va soliq deklaratsiyalari'),
      path: '/admin/accounting/reports/tax-summary',
      icon: <FileText className="w-4 h-4 text-teal-600" />,
    },

    // Sozlamalar
    {
      id: '23',
      title: t('nav.ediSettings', 'E-IMZO & E-Faktura sozlamalari'),
      categoryKey: 'settings',
      category: t('nav.settings', 'Sozlamalar'),
      description: t('search.descEdiSettings', 'E-IMZO agenti va operator kalitlari'),
      path: '/admin/settings/edi-settings',
      icon: <ShieldCheck className="w-4 h-4 text-teal-600" />,
    },
    {
      id: '24',
      title: t('nav.companySettings', 'Korxona rekvizitlari'),
      categoryKey: 'settings',
      category: t('nav.settings', 'Sozlamalar'),
      description: t('search.descCompanySettings', 'STIR, PINFL va korxona rekvizitlari'),
      path: '/admin/settings/company-settings',
      icon: <Settings className="w-4 h-4 text-slate-600" />,
    },
    {
      id: '25',
      title: t('nav.localization', 'Valyuta va Lokalizatsiya'),
      categoryKey: 'settings',
      category: t('nav.settings', 'Sozlamalar'),
      description: t('search.descLocalization', 'UZS, koʻp valyutalik va vaqt mintaqalari'),
      path: '/admin/settings/localization',
      icon: <Settings className="w-4 h-4 text-slate-600" />,
    },
  ], [t]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const categories = useMemo(() => [
    { key: 'all', label: t('search.allCategory', 'Barchasi') },
    { key: 'main', label: t('common.main', 'Asosiy') },
    { key: 'sales', label: t('nav.sales', 'Savdo') },
    { key: 'purchases', label: t('nav.purchases', 'Xaridlar') },
    { key: 'inventory', label: t('nav.inventory', 'Ombor') },
    { key: 'finance', label: t('nav.finance', 'Moliya') },
    { key: 'accounting', label: t('nav.accounting', 'Buxgalteriya') },
    { key: 'reports', label: t('nav.financialReports', 'Hisobotlar') },
    { key: 'settings', label: t('nav.settings', 'Sozlamalar') },
  ], [t]);

  const filteredItems = searchableItems.filter((item) => {
    const matchesCategory =
      selectedCategoryKey === 'all' || item.categoryKey === selectedCategoryKey;
    const matchesQuery =
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filteredItems.length ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex].path);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('search.placeholder', 'Qidiruv: Hisob-fakturalar, Tovarlar, E-Hujjatlar, Bank, Hisobotlar... (Ctrl+K)')}
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 mr-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-200/60 rounded border border-slate-300">
            <Command className="w-3 h-3" /> ESC
          </kbd>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 overflow-x-auto bg-white text-xs scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => {
                setSelectedCategoryKey(cat.key);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategoryKey === cat.key
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="overflow-y-auto flex-1 p-2 divide-y divide-slate-50">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">{t('search.noResults', 'Hech qanday natija topilmadi')}</p>
              <p className="text-xs text-slate-400 mt-1">{t('search.tryDifferent', 'Boshqa kalit soʻz bilan urinib koʻring')}</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.path)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                  idx === selectedIndex ? 'bg-teal-50/80 text-teal-950' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 truncate">{item.title}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200/60">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-teal-700 text-xs font-semibold pl-3 shrink-0">
                  <span className="hidden sm:inline">{t('search.navigate', 'Oʻtish')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>{t('search.shortcutNavigate', '↑↓ Harakatlanish')}</span>
            <span>{t('search.shortcutSelect', '↵ Tanlash')}</span>
            <span>{t('search.shortcutClose', 'ESC Yopish')}</span>
          </div>
          <span>{t('search.footerBrand', 'SAPAR ERP Tezkor qidiruv')}</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
