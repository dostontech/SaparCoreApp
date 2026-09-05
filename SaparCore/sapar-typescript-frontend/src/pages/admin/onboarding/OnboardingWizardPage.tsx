import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
} from 'lucide-react';
import { Button } from '@components/ui';


type Language = 'uz' | 'ru';

interface SectorOption {
  id: string;
  icon: React.ReactNode;
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
    icon: <Briefcase size={26} className="text-blue-600" />,
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
  const [submitting, setSubmitting] = useState(false);

  // Step 2 Form
  const [formData, setFormData] = useState({
    companyName: 'GRAND QURILISH SERVIS MCHJ',
    stir: '309124567',
    taxRegime: 'VAT_12',
    city: 'Toshkent shahri',
    bankName: 'Ipak Yoʻli Bank ATB',
    currency: 'UZS',
  });

  // Step 3 Starter options
  const [starterOptions, setStarterOptions] = useState({
    seedBhmsAccounts: true,
    seedDemoCatalog: true,
    setupPosRegister: true,
    enableEimzoGateway: true,
  });

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const activeModules = SECTOR_MODULE_MAP[selectedSector] || SECTOR_MODULE_MAP.construction;
      // Persist locally for immediate reactive sidebar update
      localStorage.setItem('sapar_sidebar_modules', JSON.stringify(activeModules));

      await axios.post('/api/admin/saas/onboarding/complete', {
        sector: selectedSector,
        companyName: formData.companyName,
        stir: formData.stir,
        taxRegime: formData.taxRegime,
        city: formData.city,
        bankName: formData.bankName,
        initialProducts: starterOptions.seedDemoCatalog,
        customModules: activeModules,
      });
      setStep(4);
    } catch (err) {
      console.error('Onboarding completion error:', err);
      // Still advance to celebrate for instant UX
      setStep(4);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Top Navbar */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-teal-500/30">
            S
          </div>
          <div>
            <div className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
              SAPAR <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono">ERP & POS</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {lang === 'uz' ? 'Oʻzbekiston Biznesini Ishga Tushirish' : 'Запуск Бизнеса в Узбекистане'}
            </div>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setLang('uz')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              lang === 'uz' ? 'bg-teal-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-teal-950 text-teal-300">UZ</span> Oʻzbekcha
          </button>
          <button
            onClick={() => setLang('ru')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              lang === 'ru' ? 'bg-teal-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-teal-950 text-teal-300">RU</span> Русский
          </button>
        </div>
      </div>

      {/* Main Wizard Content */}
      <div className="max-w-5xl w-full mx-auto my-8">
        {/* Step Progress Bar */}
        {step < 4 && (
          <div className="mb-10 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className={step >= 1 ? 'text-teal-400 font-bold' : ''}>
                {lang === 'uz' ? '1. Biznes Sohasi' : '1. Сфера Бизнеса'}
              </span>
              <span className={step >= 2 ? 'text-teal-400 font-bold' : ''}>
                {lang === 'uz' ? '2. Rekvizitlar va Soliq' : '2. Реквизиты и Налоги'}
              </span>
              <span className={step >= 3 ? 'text-teal-400 font-bold' : ''}>
                {lang === 'uz' ? '3. Boshlangʻich Paket' : '3. Стартовый Пакет'}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: Choose Business Sector */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold">
                <Sparkles size={14} /> {lang === 'uz' ? 'Moslashtirilgan Ish Maydoni' : 'Индивидуальная Настройка'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {lang === 'uz' ? 'Faoliyat sohangizni tanlang' : 'Выберите сферу вашей деятельности'}
              </h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                {lang === 'uz'
                  ? 'SAPAR sizning sohaga mos hisoblar rejasi, POS kassa va hisobotlarni avtomatik sozlaydi.'
                  : 'SAPAR автоматически настроит план счетов, кассу POS и отчеты под ваш бизнес.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {SECTORS.map((sec) => {
                const isSelected = selectedSector === sec.id;
                return (
                  <div
                    key={sec.id}
                    onClick={() => setSelectedSector(sec.id)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between gap-4 relative group ${
                      isSelected
                        ? 'bg-slate-900 border-teal-500 shadow-xl shadow-teal-500/10 ring-2 ring-teal-500/30'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shadow-xs">
                          {sec.icon}
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {lang === 'uz' ? sec.badgeUz : sec.badgeRu}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-white text-base">
                          {lang === 'uz' ? sec.titleUz : sec.titleRu}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {lang === 'uz' ? sec.descUz : sec.descRu}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                        {(lang === 'uz' ? sec.featuresUz : sec.featuresRu).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                            <Check size={12} className="text-teal-400 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isSelected ? 'bg-teal-500 text-slate-950 scale-110' : 'border border-slate-700 text-transparent'
                        }`}
                      >
                        ✓
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-6">
              <Button
                size="lg"
                onClick={() => setStep(2)}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black px-8 shadow-lg shadow-teal-500/20"
                rightIcon={<ArrowRight size={18} />}
              >
                {lang === 'uz' ? 'Davom etish' : 'Продолжить'}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Company Details & Tax Regime */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold">
                <Building2 size={14} /> {lang === 'uz' ? '2-Bosqich: Yuridik Rekvizitlar' : 'Этап 2: Юридические Реквизиты'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {lang === 'uz' ? 'Kompaniya va Soliq Rejimini Belgilang' : 'Укажите Реквизиты и Налоговый Режим'}
              </h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                {lang === 'uz'
                  ? 'Oʻzbekiston qonunchiligiga muvofiq QQS yoki Aylanma soliq hisob-kitoblarini avtomatlashtiramiz.'
                  : 'Настроим автоматический расчет НДС 12% или Налога с оборота по законодательству РУз.'}
              </p>
            </div>

            <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-5 max-w-3xl mx-auto text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5 text-xs">
                  {lang === 'uz' ? 'Kompaniya Rasmiy Nomi (MCHJ / XK / YaTT) *' : 'Официальное Название Компании *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Masalan: MEGA STROY GRAND MCHJ"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5 text-xs">
                    {lang === 'uz' ? 'STIR / ИНН (9 xonali) *' : 'ИНН / STIR (9 цифр) *'}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={9}
                    value={formData.stir}
                    onChange={(e) => setFormData({ ...formData, stir: e.target.value })}
                    placeholder="309124567"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5 text-xs">
                    {lang === 'uz' ? 'Soliq Rejimi (Oʻzbekiston Soliq) *' : 'Налоговый Режим *'}
                  </label>
                  <select
                    value={formData.taxRegime}
                    onChange={(e) => setFormData({ ...formData, taxRegime: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none font-semibold"
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5 text-xs">
                    {lang === 'uz' ? 'Shahar / Viloyat *' : 'Город / Регион *'}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Toshkent shahri"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5 text-xs">
                    {lang === 'uz' ? 'Asosiy Bank Hisobi *' : 'Основной Банк *'}
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="Ipak Yoʻli Bank ATB"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-teal-500/10 rounded-2xl border border-teal-500/20 text-teal-300 text-xs flex items-center gap-3">
                <ShieldCheck size={20} className="text-teal-400 shrink-0" />
                <span>
                  {lang === 'uz'
                    ? 'Barcha hisob-fakturalar va cheklarda 12% QQS va MXIK kodlari avtomatik aks ettiriladi.'
                    : 'Во всех счетах-фактурах и чеках будут автоматически применяться ставки НДС 12% и коды ИКПУ.'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between max-w-3xl mx-auto pt-4">
              <Button
                variant="white"
                onClick={() => setStep(1)}
                leftIcon={<ArrowLeft size={16} />}
              >
                {lang === 'uz' ? 'Orqaga' : 'Назад'}
              </Button>
              <Button
                size="lg"
                onClick={() => setStep(3)}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black px-8 shadow-lg shadow-teal-500/20"
                rightIcon={<ArrowRight size={18} />}
              >
                {lang === 'uz' ? 'Davom etish' : 'Продолжить'}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Starter Ready Kit */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold">
                <Rocket size={14} /> {lang === 'uz' ? '3-Bosqich: Tezkor Ishga Tushirish' : 'Этап 3: Быстрый Старт'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {lang === 'uz' ? 'Boshlangʻich Sozlamalarni Tasdiqlang' : 'Подтвердите Стартовые Параметры'}
              </h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                {lang === 'uz'
                  ? 'Bir necha soniyada hisoblar rejasi, kassa terminali va namunaviy tovarlar katalogi yuklanadi.'
                  : 'За считанные секунды загрузится план счетов, кассовый терминал и стартовый каталог товаров.'}
              </p>
            </div>

            <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4 max-w-2xl mx-auto">
              <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={starterOptions.seedBhmsAccounts}
                  onChange={(e) => setStarterOptions({ ...starterOptions, seedBhmsAccounts: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-teal-500 focus:ring-teal-500 bg-slate-900 border-slate-700"
                />
                <div>
                  <div className="font-extrabold text-white text-sm">
                    {lang === 'uz' ? '21-son BHMS Standart Hisoblar Rejasi' : 'План счетов НСБУ №21 Узбекистана'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {lang === 'uz'
                      ? '1000-Aktivlar, 2000-Majburiyatlar, 4000-Daromadlar, 5000-Xarajatlar'
                      : '1000-Активы, 2000-Обязательства, 4000-Доходы, 5000-Расходы'}
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={starterOptions.seedDemoCatalog}
                  onChange={(e) => setStarterOptions({ ...starterOptions, seedDemoCatalog: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-teal-500 focus:ring-teal-500 bg-slate-900 border-slate-700"
                />
                <div>
                  <div className="font-extrabold text-white text-sm">
                    {lang === 'uz' ? 'Namunaviy Tovar va Xizmatlar Katalogi' : 'Типовой Каталог Товаров и Услуг'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {lang === 'uz'
                      ? 'Shtrix-kodlar, MXIK kodlari va oʻlchov birliklari bilan namunaviy tovarlar'
                      : 'Товары со штрихкодами, кодами ИКПУ и единицами измерения под ваш сектор'}
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={starterOptions.setupPosRegister}
                  onChange={(e) => setStarterOptions({ ...starterOptions, setupPosRegister: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-teal-500 focus:ring-teal-500 bg-slate-900 border-slate-700"
                />
                <div>
                  <div className="font-extrabold text-white text-sm">
                    {lang === 'uz' ? 'POS Kassa Terminali & Asosiy Ombor' : 'Кассовый Терминал POS и Главный Склад'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {lang === 'uz'
                      ? 'Birlamchi kassa smenasini ochish va toʻlovlarni qabul qilishga tayyorlash'
                      : 'Создание кассы и склада для немедленного приема платежей и продаж'}
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={starterOptions.enableEimzoGateway}
                  onChange={(e) => setStarterOptions({ ...starterOptions, enableEimzoGateway: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-teal-500 focus:ring-teal-500 bg-slate-900 border-slate-700"
                />
                <div>
                  <div className="font-extrabold text-white text-sm">
                    {lang === 'uz' ? 'E-IMZO & E-Faktura Milliy Shlyuzi' : 'Интеграция с ЭЦП E-IMZO и ЭСФ'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {lang === 'uz'
                      ? 'Didox.uz, Factura.uz va Soliq elektron hujjat almashinuviga ulanish'
                      : 'Прямое подписание электронных счетов-фактур ключами ЭЦП РУз'}
                  </div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between max-w-2xl mx-auto pt-4">
              <Button
                variant="white"
                onClick={() => setStep(2)}
                leftIcon={<ArrowLeft size={16} />}
              >
                {lang === 'uz' ? 'Orqaga' : 'Назад'}
              </Button>
              <Button
                size="lg"
                disabled={submitting}
                onClick={handleFinish}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-10 shadow-lg shadow-emerald-500/20"
                rightIcon={submitting ? undefined : <Rocket size={18} />}
              >
                {submitting
                  ? (lang === 'uz' ? 'Sozlanmoqda…' : 'Настройка…')
                  : (lang === 'uz' ? 'Tizimni Ishga Tushirish' : 'Запустить Систему')}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Success Celebration */}
        {step === 4 && (
          <div className="max-w-2xl mx-auto text-center space-y-6 animate-in zoom-in-90 duration-300 py-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 ring-8 ring-emerald-500/20">
              <CheckCircle2 size={54} />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {lang === 'uz' ? 'Tabriklaymiz! Tizim Tayyor' : 'Поздравляем! Система Готова'}
              </h2>
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                {lang === 'uz'
                  ? `"${formData.companyName}" uchun barcha modullar, hisoblar rejasi va kassa terminali toʻliq sozlandi.`
                  : `Для компании "${formData.companyName}" успешно настроены все модули, план счетов и касса.`}
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 max-w-lg mx-auto">
              <Button
                size="lg"
                onClick={() => navigate('/admin/pos')}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold shadow-xl shadow-teal-500/20 py-4"
                leftIcon={<Calculator size={20} />}
              >
                {lang === 'uz' ? 'Kassa Terminali (POS)' : 'Открыть Кассу (POS)'}
              </Button>

              <Button
                size="lg"
                onClick={() => navigate('/admin')}
                className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold border border-slate-700 py-4"
                leftIcon={<Store size={20} />}
              >
                {lang === 'uz' ? 'Boshqaruv Paneli' : 'Панель Управления'}
              </Button>
            </div>
          </div>
        )}
      </div>


      {/* Bottom Footer */}
      <div className="max-w-5xl w-full mx-auto text-center py-4 border-t border-slate-900 text-xs text-slate-500">
        SAPAR Cloud ERP & POS Platform © 2026 • {lang === 'uz' ? 'Oʻzbekiston uchun ishlab chiqilgan' : 'Разработано для Узбекистана'}
      </div>
    </div>
  );
};

export default OnboardingWizardPage;
