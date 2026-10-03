import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Building2,
  HardHat,
  Utensils,
  ShoppingBag,
  Briefcase,
  Pill,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Calculator,
  ShieldCheck,
  Rocket,
  Check,
  Store,
  Search,
  RefreshCw,
  TrendingUp,
  CreditCard,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@components/ui';
import Constants from '@constants/api';
import { SaparLogo } from '@components/common/SaparLogo';

type Language = 'uz' | 'ru';

interface SectorOption {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  titleUz: string;
  titleRu: string;
  descUz: string;
  descRu: string;
  badgeUz: string;
  badgeRu: string;
  featuresUz: string[];
  featuresRu: string[];
}

const SECTORS: SectorOption[] = [
  {
    id: 'construction',
    icon: <HardHat size={26} className="text-amber-600" />,
    iconBg: 'bg-amber-50 border-amber-200',
    titleUz: 'Qurilish Mollari va Ulgurji Savdo',
    titleRu: 'Стройматериалы и Оптовая торговля',
    descUz: 'Sement, armatura, gipsokarton, boʻyoqlar va ulgurji ombor nazorati',
    descRu: 'Цемент, арматура, сухие смеси, краски и оптовый складской учет',
    badgeUz: 'Ulgurji & Chakana',
    badgeRu: 'Опт и Розница',
    featuresUz: ['FIFO Tannarx hisobi', 'TTN Yuk xatlari', 'MXIK / IKPU kodlar', 'QQS 12% hisob-fakturalar'],
    featuresRu: ['FIFO себестоимость', 'ТТН накладные', 'Коды ИКПУ / MXIK', 'Счета-фактуры с НДС 12%'],
  },
  {
    id: 'restaurant',
    icon: <Utensils size={26} className="text-rose-600" />,
    iconBg: 'bg-rose-50 border-rose-200',
    titleUz: 'Restoran, Qahvaxona & Fast-Food',
    titleRu: 'Ресторан, Кафе и Общепит',
    descUz: 'Oshxona kalkulyatsiyasi, taomlar menyusi, sensorli kassa va stol band qilish',
    descRu: 'Калькуляция блюд, меню, сенсорная касса POS и учет ингредиентов',
    badgeUz: 'Restoran & POS',
    badgeRu: 'Общепит и Касса',
    featuresUz: ['Sensorli Kassa (Touch POS)', 'Kassa smenalari (X/Z)', 'Naqd + Uzcard/Humo boʻlib toʻlash', 'Xizmat haqi % hisobi'],
    featuresRu: ['Сенсорная касса POS', 'Смены кассиров (X/Z)', 'Раздельная оплата (Нал+Uzcard/Humo)', 'Учет % за обслуживание'],
  },
  {
    id: 'retail',
    icon: <ShoppingBag size={26} className="text-purple-600" />,
    iconBg: 'bg-purple-50 border-purple-200',
    titleUz: 'Chakana Savdo, Supermarket & Butik',
    titleRu: 'Розничный магазин, Маркет и Бутик',
    descUz: 'Shtrix-kod skanerlash, tezkor chek chiqarish, chegirma va mijozlar kartalari',
    descRu: 'Сканирование штрихкодов, печать чеков, скидки и программа лояльности',
    badgeUz: 'Chakana Savdo',
    badgeRu: 'Ритейл & Маркет',
    featuresUz: ['Shtrix-kodli tezkor POS', 'Fiskal chek chop etish', 'Mijozlar sodiqlik tizimi', 'Ombor qoldiqlari nazorati'],
    featuresRu: ['Быстрая касса со сканером', 'Печать фискальных чеков', 'Карты лояльности клиентов', 'Контроль остатков склада'],
  },
  {
    id: 'pharmacy',
    icon: <Pill size={26} className="text-emerald-600" />,
    iconBg: 'bg-emerald-50 border-emerald-200',
    titleUz: 'Dorixona va Med-texnika',
    titleRu: 'Аптека и Медикаменты',
    descUz: 'Dori-darmonlar seriyasi, yaroqlilik muddatlari va MXIK kodlari nazorati',
    descRu: 'Учет серий лекарств, сроков годности и кодов маркировки MXIK',
    badgeUz: 'Dorixona',
    badgeRu: 'Фармацевтика',
    featuresUz: ['Seriya va muddat nazorati', 'MXIK farmatsevtika kodi', 'Retseptli savdo hisobi', 'Kassa integratsiyasi'],
    featuresRu: ['Контроль сроков годности', 'Коды маркировки медикаментов', 'Учет рецептурного отпуска', 'Интеграция с кассой'],
  },
  {
    id: 'services',
    icon: <Briefcase size={26} className="text-sky-600" />,
    iconBg: 'bg-sky-50 border-sky-200',
    titleUz: 'B2B Xizmatlar, Konsalting & IT',
    titleRu: 'B2B Услуги, Консалтинг и IT',
    descUz: 'Shartnomalar, elektron hisob-fakturalar, akt sverki va loyihalar rentabelligi',
    descRu: 'Договоры, электронные счета-фактуры, акты сверки и учет проектов',
    badgeUz: 'B2B & Xizmatlar',
    badgeRu: 'B2B & IT',
    featuresUz: ['E-Faktura (Didox/Factura)', 'Akt sverki avtomatik', 'Bank koʻchirmalari (1C)', 'Loyihalar P&L hisobi'],
    featuresRu: ['ЭСФ (Didox / Factura.uz)', 'Авто-акт сверки', 'Банковская выписка (1С)', 'P&L отчет по проектам'],
  },
];

interface ModuleItem {
  key: string;
  nameUz: string;
  nameRu: string;
  descUz: string;
  descRu: string;
  icon: string;
}

const MODULE_ITEMS: ModuleItem[] = [
  { key: 'pos', nameUz: 'POS Sensorli Kassa', nameRu: 'Сенсорная Касса POS', descUz: 'Tezkor shtrix-kodli cheklar, X/Z hisobotlar', descRu: 'Быстрые чеки со сканером, X/Z отчеты', icon: '🛒' },
  { key: 'sales', nameUz: 'Savdo & Hisob-fakturalar', nameRu: 'Продажи и Счета-фактуры', descUz: 'QQS 12% hisob-fakturalar, TTN yuk xatlari', descRu: 'ЭСФ с НДС 12%, ТТН накладные', icon: '📊' },
  { key: 'purchases', nameUz: 'Xaridlar & Yetkazib beruvchilar', nameRu: 'Закупки и Поставщики', descUz: 'Xarid buyurtmalari, kirim fakturalari', descRu: 'Заказы поставщикам, приходные накладные', icon: '🛍️' },
  { key: 'inventory', nameUz: 'Ombor & FIFO Tannarx', nameRu: 'Склад и FIFO Себестоимость', descUz: 'Omborlararo koʻchirish, partiyalar hisobi', descRu: 'Перемещение между складами, учет партий', icon: '📦' },
  { key: 'banking', nameUz: 'Bank & Kassa (1C Klient-Bank)', nameRu: 'Банк и Касса (1С Выписка)', descUz: '1C koʻchirmalar importi, kassa orderlari', descRu: 'Импорт выписок 1С, кассовые ордера', icon: '🏦' },
  { key: 'accounting', nameUz: 'Buxgalteriya (21-son BHMS)', nameRu: 'Бухгалтерия (НСБУ №21)', descUz: 'Bosh kitob, 1-shakl Balans, 2-shakl P&L', descRu: 'Главная книга, Баланс Форма 1, P&L Форма 2', icon: '📑' },
  { key: 'reports', nameUz: 'Tahliliy Hisobotlar', nameRu: 'Аналитические Отчеты', descUz: 'Savdo, xarid, qoldiq va foyda tahlili', descRu: 'Анализ продаж, закупок, остатков и маржи', icon: '📈' },
  { key: 'crm', nameUz: 'CRM & Savdo Quvuri', nameRu: 'CRM и Воронка Сделок', descUz: 'Mijozlar bazasi, liddan bitimgacha', descRu: 'База клиентов, от лида до сделки', icon: '🤝' },
  { key: 'projects', nameUz: 'Loyihalar & Vazifalar', nameRu: 'Проекты и Задачи', descUz: 'Kanban doskasi, rentabellik tahlili', descRu: 'Канбан доски, учет рентабельности', icon: '📁' },
  { key: 'payroll', nameUz: 'HRM, Tabel & Oylik Maosh', nameRu: 'HRM, Табель и Зарплата', descUz: 'JShODS 12%, Ijtimoiy soliq, INPS hisobi', descRu: 'НДФЛ 12%, Соцналог, ИНПС расчет', icon: '👥' },
  { key: 'helpdesk', nameUz: 'Mijozlar Qoʻllab-quvvatlash', nameRu: 'Поддержка Клиентов', descUz: 'Mijozlar murojaatlari va tiketlar', descRu: 'Обращения клиентов и тикеты', icon: '🎧' },
];

const SECTOR_MODULE_MAP: Record<string, Record<string, boolean>> = {
  construction: { pos: true, sales: true, purchases: true, inventory: true, banking: true, accounting: true, reports: true, crm: true, projects: false, payroll: false, helpdesk: false, settings: true },
  restaurant: { pos: true, sales: false, purchases: true, inventory: true, banking: true, accounting: true, reports: true, crm: false, projects: false, payroll: true, helpdesk: false, settings: true },
  retail: { pos: true, sales: true, purchases: true, inventory: true, banking: true, accounting: true, reports: true, crm: false, projects: false, payroll: false, helpdesk: false, settings: true },
  pharmacy: { pos: true, sales: true, purchases: true, inventory: true, banking: true, accounting: true, reports: true, crm: false, projects: false, payroll: false, helpdesk: false, settings: true },
  services: { pos: false, sales: true, purchases: true, inventory: false, banking: true, accounting: true, reports: true, crm: true, projects: true, payroll: true, helpdesk: true, settings: true },
};

export const OnboardingWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Language>('uz');
  const [step, setStep] = useState<number>(1);
  const [selectedSector, setSelectedSector] = useState<string>('construction');
  const [customModules, setCustomModules] = useState<Record<string, boolean>>(
    () => ({ ...SECTOR_MODULE_MAP['construction'] })
  );
  const [submitting, setSubmitting] = useState(false);

  // Step 2 Form
  const [formData, setFormData] = useState({
    companyName: 'GRAND QURILISH SERVIS MCHJ',
    stir: '309124567',
    taxRegime: 'VAT_12',
    city: 'Toshkent shahri',
    bankName: 'Ipak Yoʻli Bank ATB',
    bankAccount: '20208000500123456001',
    bankMfo: '00401',
    currency: 'UZS',
  });

  // Uzbekistan Open Registry & CBU Rates State
  const [isSearchingTin, setIsSearchingTin] = useState(false);
  const [tinVerifiedData, setTinVerifiedData] = useState<any>(null);
  const [cbuRates, setCbuRates] = useState<any>(null);
  const [bankVerified, setBankVerified] = useState<string | null>("Ipak Yo'li Bank");

  useEffect(() => {
    // Fetch live CBU exchange rates on mount
    axios
      .get(Constants.REGISTRY_RATES_URL)
      .then((res) => {
        if (res.data?.success && res.data.data?.rates) {
          setCbuRates(res.data.data.rates);
        }
      })
      .catch(() => {});
  }, []);

  // Instant STIR Company Auto-Lookup
  const lookupCompanyByTin = async (tinValue: string) => {
    const clean = (tinValue || '').trim().replace(/\D/g, '');
    if (clean.length !== 9) return;
    try {
      setIsSearchingTin(true);
      const res = await axios.get(`${Constants.REGISTRY_COMPANY_LOOKUP_URL}/${clean}`);
      if (res.data?.success && res.data.data) {
        const co = res.data.data;
        setTinVerifiedData(co);
        setFormData((prev) => ({
          ...prev,
          stir: clean,
          companyName: co.name || prev.companyName,
          city: co.city || prev.city,
          taxRegime: co.taxRegime || prev.taxRegime,
        }));
        toast.success(`Davlat soliq reyestridan topildi: ${co.name}`);
      }
    } catch {
      toast.error("STIR bo'yicha ma'lumot topilmadi");
    } finally {
      setIsSearchingTin(false);
    }
  };

  // Instant Bank MFO Detection
  const lookupBankByMfo = async (mfoValue: string) => {
    const clean = (mfoValue || '').trim().replace(/\D/g, '');
    if (clean.length === 5) {
      try {
        const res = await axios.get(`${Constants.REGISTRY_BANK_MFO_URL}/${clean}`);
        if (res.data?.success && res.data.data) {
          const bank = res.data.data;
          setFormData((prev) => ({
            ...prev,
            bankMfo: clean,
            bankName: bank.name,
          }));
          setBankVerified(bank.shortName || bank.name);
          toast.success(`Bank aniqlandi: ${bank.shortName}`);
        }
      } catch {
        setBankVerified(null);
      }
    }
  };

  // Step 3 Starter options
  const [starterOptions, setStarterOptions] = useState({
    seedBhmsAccounts: true,
    seedDemoCatalog: true,
    setupPosRegister: true,
    enableEimzoGateway: true,
  });

  const handleSelectSector = (sectorId: string) => {
    setSelectedSector(sectorId);
    if (SECTOR_MODULE_MAP[sectorId]) {
      setCustomModules({ ...SECTOR_MODULE_MAP[sectorId] });
    }
  };

  const toggleModule = (modKey: string) => {
    setCustomModules((prev) => ({
      ...prev,
      [modKey]: !prev[modKey],
    }));
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const allNormalizedModules: Record<string, boolean> = {
        pos: false,
        sales: false,
        purchases: false,
        inventory: false,
        banking: false,
        accounting: false,
        reports: false,
        crm: false,
        projects: false,
        payroll: false,
        helpdesk: false,
        settings: true,
        ...customModules,
      };

      localStorage.setItem('sapar_sidebar_modules', JSON.stringify(allNormalizedModules));
      window.dispatchEvent(new Event('sapar_modules_updated'));

      await axios.post(Constants.SAAS_ONBOARDING_COMPLETE_URL, {
        sector: selectedSector,
        companyName: formData.companyName,
        stir: formData.stir,
        taxRegime: formData.taxRegime,
        city: formData.city,
        bankName: formData.bankName,
        bankAccount: formData.bankAccount,
        bankMfo: formData.bankMfo,
        initialProducts: starterOptions.seedDemoCatalog,
        customModules: allNormalizedModules,
      });
      setStep(4);
    } catch (err) {
      console.error('Onboarding completion error:', err);
      setStep(4);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBFA] text-slate-900 flex flex-col justify-between font-sans selection:bg-teal-500 selection:text-white relative overflow-hidden">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between px-4 sm:px-8 py-3.5">
          <div className="flex items-center gap-3">
            <SaparLogo variant="dark" className="h-8 w-auto" />
            <div className="hidden sm:block h-5 w-px bg-slate-200" />
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>{lang === 'uz' ? 'Oʻzbekiston Biznesini Ishga Tushirish' : 'Запуск Бизнеса в Узбекистане'}</span>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs font-bold">
            <button
              onClick={() => setLang('uz')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                lang === 'uz'
                  ? 'bg-white text-teal-800 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>UZ</span> Oʻzbekcha
            </button>
            <button
              onClick={() => setLang('ru')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                lang === 'ru'
                  ? 'bg-white text-teal-800 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>RU</span> Русский
            </button>
          </div>
        </div>
      </header>

      {/* Main Wizard Content */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-8 my-8 flex-1">
        {/* Step Progress Bar */}
        {step < 4 && (
          <div className="mb-8 space-y-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="grid grid-cols-3 text-center text-xs font-bold">
              <div className={`flex items-center justify-center gap-2 ${step >= 1 ? 'text-teal-700' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step > 1 ? 'bg-teal-600 text-white' : step === 1 ? 'bg-teal-100 text-teal-800 ring-2 ring-teal-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  {step > 1 ? '✓' : '1'}
                </span>
                <span className="hidden sm:inline">{lang === 'uz' ? 'Biznes Sohasi' : 'Сфера Бизнеса'}</span>
              </div>

              <div className={`flex items-center justify-center gap-2 ${step >= 2 ? 'text-teal-700' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step > 2 ? 'bg-teal-600 text-white' : step === 2 ? 'bg-teal-100 text-teal-800 ring-2 ring-teal-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  {step > 2 ? '✓' : '2'}
                </span>
                <span className="hidden sm:inline">{lang === 'uz' ? 'Rekvizitlar va Soliq' : 'Реквизиты и Налог'}</span>
              </div>

              <div className={`flex items-center justify-center gap-2 ${step >= 3 ? 'text-teal-700' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step === 3 ? 'bg-teal-100 text-teal-800 ring-2 ring-teal-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  3
                </span>
                <span className="hidden sm:inline">{lang === 'uz' ? 'Modullar & Start' : 'Модули и Старт'}</span>
              </div>
            </div>

            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-600 to-teal-400 transition-all duration-300 rounded-full"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: Choose Business Sector                                            */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
                <Sparkles size={14} className="text-teal-600" />
                <span>{lang === 'uz' ? '1-Qadam: Moslashtirilgan Ish Maydoni' : '1-Шаг: Настройка Пространства'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {lang === 'uz' ? 'Faoliyat sohangizni tanlang' : 'Выберите сферу вашей деятельности'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
                {lang === 'uz'
                  ? 'SAPAR sizning sohaga mos hisoblar rejasi, POS kassa va hisobotlarni avtomatik sozlaydi.'
                  : 'SAPAR автоматически настроит план счетов, кассу POS и отчеты под ваш бизнес.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {SECTORS.map((sec) => {
                const isSelected = selectedSector === sec.id;
                return (
                  <div
                    key={sec.id}
                    onClick={() => handleSelectSector(sec.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 relative group ${
                      isSelected
                        ? 'bg-teal-50/40 border-teal-600 shadow-md ring-2 ring-teal-600/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-2xs ${sec.iconBg}`}>
                          {sec.icon}
                        </div>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          isSelected
                            ? 'bg-teal-100 text-teal-800 border-teal-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {lang === 'uz' ? sec.badgeUz : sec.badgeRu}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">
                          {lang === 'uz' ? sec.titleUz : sec.titleRu}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {lang === 'uz' ? sec.descUz : sec.descRu}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        {(lang === 'uz' ? sec.featuresUz : sec.featuresRu).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700">
                            <Check size={13} className="text-teal-600 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isSelected ? 'bg-teal-600 text-white scale-110 shadow-xs' : 'border border-slate-300 text-transparent'
                        }`}
                      >
                        ✓
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                size="lg"
                onClick={() => setStep(2)}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-8 shadow-md shadow-teal-900/10 cursor-pointer"
                rightIcon={<ArrowRight size={18} />}
              >
                {lang === 'uz' ? 'Davom etish' : 'Продолжить'}
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: Company Details & Tax Regime                                      */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
                <Building2 size={14} className="text-teal-600" />
                <span>{lang === 'uz' ? '2-Qadam: Yuridik Rekvizitlar va Bank' : '2-Шаг: Юридические Реквизиты и Банк'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {lang === 'uz' ? 'Kompaniya va Soliq Rejimini Belgilang' : 'Укажите Реквизиты и Налоговый Режим'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
                {lang === 'uz'
                  ? 'Oʻzbekiston qonunchiligiga muvofiq QQS yoki Aylanma soliq hisob-kitoblarini avtomatlashtiramiz.'
                  : 'Настроим автоматический расчет НДС 12% или Налога с оборота по законодательству РУз.'}
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5 max-w-3xl mx-auto text-xs">
              {/* Central Bank of Uzbekistan (CBU) Live Rates Ticker */}
              {cbuRates && (
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-teal-50/70 border border-teal-100 text-[11px] text-teal-900">
                  <div className="flex items-center gap-1.5 font-bold">
                    <TrendingUp size={14} className="text-teal-700" />
                    <span>Oʻzbekiston MB Rasmiy Kursi:</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono font-semibold">
                    {cbuRates.USD && <span>USD: <strong className="text-teal-950">{cbuRates.USD.rate?.toLocaleString()}</strong></span>}
                    {cbuRates.EUR && <span>EUR: <strong className="text-teal-950">{cbuRates.EUR.rate?.toLocaleString()}</strong></span>}
                    {cbuRates.RUB && <span>RUB: <strong className="text-teal-950">{cbuRates.RUB.rate}</strong></span>}
                  </div>
                </div>
              )}

              {/* STIR Input with Instant Open Registry Auto-Lookup */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 text-xs">
                    {lang === 'uz' ? '⚡ STIR / ИНН (9 xonali) — Soliq Reyestridan Avto-Yuklash' : '⚡ ИНН / STIR (9 цифр) — Автопоиск в Госреестре'}
                  </label>
                  <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                    dgov.uz / soliq.uz
                  </span>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      required
                      maxLength={9}
                      value={formData.stir}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, stir: val });
                        if (val.length === 9) {
                          lookupCompanyByTin(val);
                        }
                      }}
                      placeholder="Masalan: 309124567"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-mono text-slate-900 tracking-wider focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                    {isSearchingTin && (
                      <div className="absolute right-3 top-2.5 text-teal-600">
                        <RefreshCw size={18} className="animate-spin" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => lookupCompanyByTin(formData.stir)}
                    disabled={isSearchingTin || formData.stir.length !== 9}
                    className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <Search size={14} />
                    {lang === 'uz' ? 'Qidirish' : 'Найти'}
                  </button>
                </div>

                {/* Verified Registry Badge & Details Card */}
                {tinVerifiedData && (
                  <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-teal-900">
                        <ShieldCheck size={16} className="text-teal-700" />
                        Oʻzbekiston Davlat Soliq Reyestridan tasdiqlandi
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-teal-200/60 text-teal-900 text-[10px] font-mono font-bold">
                        SOATO: {tinVerifiedData.soatoCode}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-700">
                      <div><span className="text-slate-500">Rahbar:</span> <strong>{tinVerifiedData.directorName}</strong></div>
                      <div><span className="text-slate-500">Soliq rejimi:</span> <strong className="text-teal-800">{tinVerifiedData.taxRegimeLabel}</strong></div>
                      <div><span className="text-slate-500">OKED:</span> <strong>{tinVerifiedData.okedCode}</strong> — {tinVerifiedData.okedName}</div>
                      {tinVerifiedData.vatRegistrationCode && (
                        <div><span className="text-slate-500">QQS Raqami:</span> <strong className="font-mono text-slate-900">{tinVerifiedData.vatRegistrationCode}</strong></div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-xs">
                  {lang === 'uz' ? 'Kompaniya Rasmiy Nomi (MCHJ / XK / YaTT) *' : 'Официальное Название Компании *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Masalan: MEGA STROY GRAND MCHJ"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">
                    {lang === 'uz' ? 'Soliq Rejimi (Oʻzbekiston Soliq) *' : 'Налоговый Режим *'}
                  </label>
                  <select
                    value={formData.taxRegime}
                    onChange={(e) => setFormData({ ...formData, taxRegime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none font-medium"
                  >
                    <option value="VAT_12">
                      {lang === 'uz' ? 'QQS 12% toʻlovchisi (Umumbelgilangan)' : 'Плательщик НДС 12% (Общеустановленный)'}
                    </option>
                    <option value="TURNOVER_4">
                      {lang === 'uz' ? 'Aylanmadan olinadigan soliq 4%' : 'Налог с оборота 4% (Упрощенный)'}
                    </option>
                    <option value="IT_PARK">
                      {lang === 'uz' ? 'IT Park Rezidenti (0% Imtiyozli)' : 'Резидент IT Park (0% Льготный)'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">
                    {lang === 'uz' ? 'Shahar / Viloyat *' : 'Город / Регион *'}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Toshkent shahri"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 text-xs">
                      {lang === 'uz' ? 'Bank MFO (5 xonali) *' : 'МФО Банка (5 цифр) *'}
                    </label>
                    {bankVerified && (
                      <span className="text-[10px] text-teal-700 font-semibold truncate max-w-[100px]">
                        ✓ {bankVerified}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={5}
                    value={formData.bankMfo}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, bankMfo: val });
                      if (val.length === 5) {
                        lookupBankByMfo(val);
                      }
                    }}
                    placeholder="00401"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1 text-xs">
                    {lang === 'uz' ? 'Asosiy Bank Nomi *' : 'Название Банка *'}
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="AITB 'Ipak Yoʻli'"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-xs">
                  {lang === 'uz' ? 'Hisob-raqam (20 xonali) *' : 'Расчетный счет (20 цифр) *'}
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  placeholder="20208000500123456001"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="p-3.5 bg-teal-50 rounded-2xl border border-teal-200 text-teal-900 text-xs flex items-center gap-3">
                <ShieldCheck size={20} className="text-teal-700 shrink-0" />
                <span>
                  {lang === 'uz'
                    ? 'Barcha hisob-fakturalar va cheklarda 12% QQS va MXIK kodlari avtomatik aks ettiriladi.'
                    : 'Во всех счетах-фактурах и чеках будут автоматически применяться ставки НДС 12% и коды ИКПУ.'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between max-w-3xl mx-auto pt-2">
              <Button
                variant="white"
                onClick={() => setStep(1)}
                leftIcon={<ArrowLeft size={16} />}
                className="border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {lang === 'uz' ? 'Orqaga' : 'Назад'}
              </Button>
              <Button
                size="lg"
                onClick={() => setStep(3)}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-8 shadow-md shadow-teal-900/10 cursor-pointer"
                rightIcon={<ArrowRight size={18} />}
              >
                {lang === 'uz' ? 'Davom etish' : 'Продолжить'}
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: Starter Ready Kit & Modules                                       */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
                <Rocket size={14} className="text-teal-600" />
                <span>{lang === 'uz' ? '3-Qadam: Tezkor Ishga Tushirish' : '3-Шаг: Быстрый Старт'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {lang === 'uz' ? 'Boshlangʻich Sozlamalarni Tasdiqlang' : 'Подтвердите Стартовые Параметры'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
                {lang === 'uz'
                  ? 'Bir necha soniyada hisoblar rejasi, kassa terminali va namunaviy tovarlar katalogi yuklanadi.'
                  : 'За считанные секунды загрузится план счетов, кассовый терминал и стартовый каталог товаров.'}
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5 max-w-2xl mx-auto">
              <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-teal-500/50 hover:bg-teal-50/20 transition-all">
                <input
                  type="checkbox"
                  checked={starterOptions.seedBhmsAccounts}
                  onChange={(e) => setStarterOptions({ ...starterOptions, seedBhmsAccounts: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-teal-600 focus:ring-teal-600 accent-teal-600"
                />
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {lang === 'uz' ? '21-son BHMS Standart Hisoblar Rejasi' : 'План счетов НСБУ №21 Узбекистана'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {lang === 'uz'
                      ? '1000-Aktivlar, 2000-Majburiyatlar, 4000-Daromadlar, 5000-Xarajatlar'
                      : '1000-Активы, 2000-Обязательства, 4000-Доходы, 5000-Расходы'}
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-teal-500/50 hover:bg-teal-50/20 transition-all">
                <input
                  type="checkbox"
                  checked={starterOptions.seedDemoCatalog}
                  onChange={(e) => setStarterOptions({ ...starterOptions, seedDemoCatalog: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-teal-600 focus:ring-teal-600 accent-teal-600"
                />
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {lang === 'uz' ? 'Namunaviy Tovar va Xizmatlar Katalogi' : 'Типовой Каталог Товаров и Услуг'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {lang === 'uz'
                      ? 'Shtrix-kodlar, MXIK kodlari va oʻlchov birliklari bilan namunaviy tovarlar'
                      : 'Товары со штрихкодами, кодами ИКПУ и единицами измерения под ваш сектор'}
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-teal-500/50 hover:bg-teal-50/20 transition-all">
                <input
                  type="checkbox"
                  checked={starterOptions.setupPosRegister}
                  onChange={(e) => setStarterOptions({ ...starterOptions, setupPosRegister: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-teal-600 focus:ring-teal-600 accent-teal-600"
                />
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {lang === 'uz' ? 'POS Kassa Terminali & Asosiy Ombor' : 'Кассовый Терминал POS и Главный Склад'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {lang === 'uz'
                      ? 'Birlamchi kassa smenasini ochish va toʻlovlarni qabul qilishga tayyorlash'
                      : 'Создание кассы и склада для немедленного приема платежей и продаж'}
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-teal-500/50 hover:bg-teal-50/20 transition-all">
                <input
                  type="checkbox"
                  checked={starterOptions.enableEimzoGateway}
                  onChange={(e) => setStarterOptions({ ...starterOptions, enableEimzoGateway: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-teal-600 focus:ring-teal-600 accent-teal-600"
                />
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {lang === 'uz' ? 'E-IMZO & E-Faktura Milliy Shlyuzi' : 'Интеграция с ЭЦП E-IMZO и ЭСФ'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {lang === 'uz'
                      ? 'Didox.uz, Factura.uz va Soliq elektron hujjat almashinuviga ulanish'
                      : 'Прямое подписание электронных счетов-фактур ключами ЭЦП РУз'}
                  </div>
                </div>
              </label>
            </div>

            {/* Granular Module Feature Selector */}
            <div className="max-w-2xl mx-auto space-y-3 pt-2">
              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                  {lang === 'uz' ? 'Kerakli Modullarni Moslashtirish' : 'Настройка Необходимых Модулей'}
                </span>
                <span className="text-[11px] font-mono text-teal-800 font-bold px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200">
                  {Object.values(customModules).filter(Boolean).length} / {MODULE_ITEMS.length} {lang === 'uz' ? 'tanlangan' : 'выбрано'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MODULE_ITEMS.map((mod) => {
                  const isChecked = !!customModules[mod.key];
                  return (
                    <div
                      key={mod.key}
                      onClick={() => toggleModule(mod.key)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-teal-50/50 border-teal-600 shadow-2xs ring-1 ring-teal-600/20'
                          : 'bg-white border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg">{mod.icon}</span>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 truncate">
                            {lang === 'uz' ? mod.nameUz : mod.nameRu}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {lang === 'uz' ? mod.descUz : mod.descRu}
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-600 accent-teal-600"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between max-w-2xl mx-auto pt-4">
              <Button
                variant="white"
                onClick={() => setStep(2)}
                leftIcon={<ArrowLeft size={16} />}
                className="border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {lang === 'uz' ? 'Orqaga' : 'Назад'}
              </Button>
              <Button
                size="lg"
                disabled={submitting}
                onClick={handleFinish}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-10 shadow-lg shadow-emerald-900/10 cursor-pointer"
                rightIcon={submitting ? undefined : <Rocket size={18} />}
              >
                {submitting
                  ? (lang === 'uz' ? 'Sozlanmoqda…' : 'Настройка…')
                  : (lang === 'uz' ? 'Tizimni Ishga Tushirish' : 'Запустить Систему')}
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: Success Celebration                                               */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="max-w-xl mx-auto text-center space-y-6 animate-in zoom-in-95 duration-300 py-10 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-md ring-8 ring-emerald-500/10">
              <CheckCircle2 size={44} className="text-emerald-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {lang === 'uz' ? 'Tabriklaymiz! Tizim Tayyor' : 'Поздравляем! Система Готова'}
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                {lang === 'uz'
                  ? `"${formData.companyName}" uchun barcha modullar, hisoblar rejasi va kassa terminali toʻliq sozlandi.`
                  : `Для компании "${formData.companyName}" успешно настроены все модули, план счетов и касса.`}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <Button
                size="lg"
                onClick={() => navigate('/pos')}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-md shadow-teal-900/10 py-3.5 cursor-pointer flex items-center justify-center gap-2"
                leftIcon={<Calculator size={18} />}
              >
                {lang === 'uz' ? 'Kassa Terminali (POS)' : 'Открыть Кассу (POS)'}
              </Button>

              <Button
                size="lg"
                onClick={() => {
                  const target = customModules.sales ? '/sales' : customModules.inventory ? '/inventory' : customModules.pos ? '/pos' : '/invoices';
                  navigate(target);
                }}
                className="bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-200 py-3.5 cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                leftIcon={<Store size={18} />}
              >
                {lang === 'uz' ? 'Asosiy Ish Maydoni' : 'Основное Рабочее Место'}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Footer */}
      <footer className="border-t border-slate-200/80 bg-white/60 py-4 text-center text-xs text-slate-500">
        SAPAR Cloud ERP & POS Platform © 2026 • {lang === 'uz' ? 'Oʻzbekiston va Markaziy Osiyo uchun ishlab chiqilgan' : 'Разработано для Узбекистана и Центральной Азии'}
      </footer>
    </div>
  );
};

export default OnboardingWizardPage;
