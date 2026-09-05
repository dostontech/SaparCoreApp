import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  FileText,
  Receipt,
  CreditCard,
  ShoppingBag,
  FileSpreadsheet,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  BookOpen,
  ShieldCheck,
  Truck,
} from 'lucide-react';

interface QuickActionItem {
  title: string;
  subtitle?: string;
  path: string;
  icon: React.ReactNode;
  category: string;
}

export const QuickCreateDropdown: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const catSales = t('nav.sales', 'Savdo');
  const catPurchases = t('nav.purchases', 'Xaridlar');
  const catFinance = t('nav.finance', 'Moliya & Kassa');

  const actions: QuickActionItem[] = [
    // Savdo
    {
      title: t('nav.quotations', 'Tijorat taklifi'),
      path: '/admin/quotations/new',
      icon: <FileText className="w-4 h-4 text-sky-600" />,
      category: catSales,
    },
    {
      title: t('nav.invoices', 'Hisob-faktura'),
      path: '/admin/invoices/create-invoice',
      icon: <Receipt className="w-4 h-4 text-emerald-600" />,
      category: catSales,
    },
    {
      title: t('nav.paymentTransactions', 'Mijoz toʻlovi'),
      path: '/admin/payments/transactions',
      icon: <CreditCard className="w-4 h-4 text-teal-600" />,
      category: catSales,
    },
    {
      title: t('nav.deliveryChallans', 'Yuk xati (TTN)'),
      path: '/admin/delivery-challans/new',
      icon: <Truck className="w-4 h-4 text-amber-600" />,
      category: catSales,
    },

    // Xaridlar
    {
      title: t('nav.purchaseOrders', 'Xarid buyurtmasi'),
      path: '/admin/purchase-orders/new',
      icon: <ShoppingBag className="w-4 h-4 text-indigo-600" />,
      category: catPurchases,
    },
    {
      title: t('nav.purchases', 'Xarid fakturasi'),
      path: '/admin/purchases/new',
      icon: <FileSpreadsheet className="w-4 h-4 text-violet-600" />,
      category: catPurchases,
    },
    {
      title: t('nav.supplierPayments', 'Yetkazib beruvchiga toʻlov'),
      path: '/admin/supplier-payments',
      icon: <CreditCard className="w-4 h-4 text-rose-600" />,
      category: catPurchases,
    },

    // Moliya & Kassa
    {
      title: t('nav.banking', 'Kirim (Naqd pul)'),
      path: '/admin/banking',
      icon: <ArrowDownLeft className="w-4 h-4 text-emerald-600" />,
      category: catFinance,
    },
    {
      title: t('nav.expenses', 'Chiqim (Xarajat)'),
      path: '/admin/expenses',
      icon: <ArrowUpRight className="w-4 h-4 text-rose-600" />,
      category: catFinance,
    },
    {
      title: t('nav.journalEntries', 'Buxgalteriya provodkasi'),
      path: '/admin/accounting/journal-entries/new',
      icon: <BookOpen className="w-4 h-4 text-amber-600" />,
      category: catFinance,
    },
    {
      title: t('nav.contras', 'Oʻzaro hisob-kitob (Contra)'),
      path: '/admin/accounting/contras/new',
      icon: <ArrowLeftRight className="w-4 h-4 text-teal-600" />,
      category: catFinance,
    },
    {
      title: t('nav.eDocuments', 'E-Hujjat / E-Faktura'),
      path: '/admin/e-documents',
      icon: <ShieldCheck className="w-4 h-4 text-teal-600" />,
      category: catFinance,
    },
  ];

  const handleSelect = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const categories = [catSales, catPurchases, catFinance];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 transition border border-slate-200/80 shadow-2xs cursor-pointer"
        title="+"
        aria-expanded={isOpen}
      >
        <Plus className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-45 text-teal-600' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150 z-50">
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('common.add', 'Yangi yaratish')}
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto py-1">
            {categories.map((cat) => (
              <div key={cat} className="py-1">
                <div className="px-3.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {cat}
                </div>
                {actions
                  .filter((a) => a.category === cat)
                  .map((action, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(action.path)}
                      className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-teal-50/70 text-slate-700 hover:text-teal-900 transition-colors text-xs font-medium cursor-pointer"
                    >
                      <div className="p-1 rounded-lg bg-slate-50 border border-slate-200/60 shrink-0">
                        {action.icon}
                      </div>
                      <span className="truncate">{action.title}</span>
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickCreateDropdown;
