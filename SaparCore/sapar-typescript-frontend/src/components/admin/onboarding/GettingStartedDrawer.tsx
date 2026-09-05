import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  X,
  Building2,
  Users,
  Package,
  BookOpen,
  Scale,
  Settings,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface GettingStartedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StepItem {
  id: string;
  titleKey: string;
  defaultTitle: string;
  descriptionKey: string;
  defaultDescription: string;
  path: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
}

export const GettingStartedDrawer: React.FC<GettingStartedDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const steps: StepItem[] = [
    {
      id: 'company-profile',
      titleKey: 'onboarding.companyProfileTitle',
      defaultTitle: 'Tashkilot Profili',
      descriptionKey: 'onboarding.companyProfileDesc',
      defaultDescription: 'Fakturalar, kvitansiyalar va hujjatlarda aks etadigan maʼlumotlarni toʻldiring.',
      path: '/admin/settings/company-settings',
      iconBg: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
    },
    {
      id: 'add-contacts',
      titleKey: 'onboarding.addContactsTitle',
      defaultTitle: 'Kontaktlarni Qoʻshish',
      descriptionKey: 'onboarding.addContactsDesc',
      defaultDescription: 'Mijozlar, taʼminotchilar va xodimlar roʻyxatini tizimga kiriting.',
      path: '/admin/contacts/new',
      iconBg: 'bg-rose-50 border-rose-200',
      iconColor: 'text-rose-600',
      icon: <Users className="w-8 h-8 text-rose-600" />,
    },
    {
      id: 'add-products',
      titleKey: 'onboarding.addProductsTitle',
      defaultTitle: 'Tovarlarni Qoʻshish',
      descriptionKey: 'onboarding.addProductsDesc',
      defaultDescription: 'Sotiladigan va xarid qilinadigan tovar hamda xizmatlar katalogini yarating.',
      path: '/admin/products/new',
      iconBg: 'bg-amber-50 border-amber-200',
      iconColor: 'text-amber-600',
      icon: <Package className="w-8 h-8 text-amber-600" />,
    },
    {
      id: 'chart-of-accounts',
      titleKey: 'onboarding.chartOfAccountsTitle',
      defaultTitle: 'Hisoblar Rejasi',
      descriptionKey: 'onboarding.chartOfAccountsDesc',
      defaultDescription: 'Oʻzbekiston 21-son BHMS hisoblar rejasini korxonangizga moslashtiring.',
      path: '/admin/accounting/chart-of-accounts',
      iconBg: 'bg-yellow-50 border-yellow-200',
      iconColor: 'text-yellow-600',
      icon: <BookOpen className="w-8 h-8 text-yellow-600" />,
    },
    {
      id: 'opening-balance',
      titleKey: 'onboarding.openingBalanceTitle',
      defaultTitle: 'Boshlangʻich Qoldiqlar',
      descriptionKey: 'onboarding.openingBalanceDesc',
      defaultDescription: 'Boshlangʻich schyot qoldiqlari va oldingi dasturlardagi maʼlumotlarni kiriting.',
      path: '/admin/accounting/journal-entries/new',
      iconBg: 'bg-emerald-50 border-emerald-200',
      iconColor: 'text-emerald-600',
      icon: <Scale className="w-8 h-8 text-emerald-600" />,
    },
    {
      id: 'e-imzo',
      titleKey: 'onboarding.eimzoTitle',
      defaultTitle: 'E-IMZO & E-Faktura',
      descriptionKey: 'onboarding.eimzoDesc',
      defaultDescription: 'Hujjatlarni imzolash uchun Oʻzbekiston E-IMZO kalitini (.pfx yoki token) ulang.',
      path: '/admin/settings/edi-settings',
      iconBg: 'bg-teal-50 border-teal-200',
      iconColor: 'text-teal-600',
      icon: <ShieldCheck className="w-8 h-8 text-teal-600" />,
    },
    {
      id: 'company-settings',
      titleKey: 'onboarding.companySettingsTitle',
      defaultTitle: 'Tizim Sozlamalari',
      descriptionKey: 'onboarding.companySettingsDesc',
      defaultDescription: 'Valyutalar, soliq stavkalari va umumiy korxona sozlamalarini yangilang.',
      path: '/admin/settings/company-settings',
      iconBg: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
      icon: <Settings className="w-8 h-8 text-purple-600" />,
    },
  ];

  const handleStepClick = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {t('onboarding.gettingStarted', 'Boshlash Qoʻllanmasi')}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {t('onboarding.subtitle', 'SAPAR ERP tizimini tezkor sozlash')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Cards List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {steps.map((step) => (
              <div
                key={step.id}
                onClick={() => handleStepClick(step.path)}
                className="group relative bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-teal-500 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center text-center space-y-3"
              >
                {/* Visual Icon Illustration Box */}
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${step.iconBg} group-hover:scale-105 transition-transform duration-200 shadow-2xs`}
                >
                  {step.icon}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition">
                    {t(step.titleKey, step.defaultTitle)}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {t(step.descriptionKey, step.defaultDescription)}
                  </p>
                </div>

                <div className="pt-1 flex items-center gap-1 text-xs font-semibold text-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span>{t('onboarding.open', 'Ochish')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 text-center">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              {t('onboarding.close', 'Yopish')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GettingStartedDrawer;
