import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  Sparkles,
  Landmark,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Calculator,
  Percent,
  Calendar,
  Building2,
  FileCheck,
  Zap,
  ChevronRight,
  ChevronDown,
  Info,
  DollarSign,
  Award,
  Activity,
  BarChart3,
  Download,
  Printer,
  Check,
  AlertCircle,
  Briefcase,
  HelpCircle,
  Settings,
  X,
  Lock,
  Search,
  ExternalLink
} from 'lucide-react';
import type { RootState } from '@store/index';
import { PageHeader } from '@/context/PageHeaderContext';
import { Card, Button, Badge } from '@components/ui';
import Modal from '@components/admin/Modal';

interface BankOffer {
  id: string;
  bankName: string;
  logoColor: string;
  logoText: string;
  loanType: string;
  minRate: number;
  maxAmount: number;
  tenure: string;
  processingTime: string;
  collateral: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

const BANK_OFFERS: BankOffer[] = [
  {
    id: 'ipak-yoli',
    bankName: 'Ipak Yoʻli Bank',
    logoColor: 'bg-emerald-600',
    logoText: 'IYB',
    loanType: 'Tezkor Aylanma Mablagʻ (Revolving Credit Line)',
    minRate: 18.5,
    maxAmount: 500000000,
    tenure: '24 oygacha (Up to 2 years)',
    processingTime: '2 soat ichida',
    collateral: '150M soʻmgacha garovsiz',
    description: 'SAPAR ERP aylanma maʼlumotlari va Soliq hisobotlari asosida tovar xaridi va aylanma mablagʻni toʻldirish uchun.',
    features: [
      'ERP moliyaviy oqimlari asosida avtomatik skoring',
      'Ortiqcha qogʻozbozlik va navbatlarsiz',
      'Faqat amalda ishlatilgan kunlar uchun foiz hisoblanadi',
    ],
    isPopular: true,
  },
  {
    id: 'kapitalbank',
    bankName: 'Kapitalbank ATB',
    logoColor: 'bg-amber-600',
    logoText: 'KB',
    loanType: 'Ekspress Savdo va Kassa Krediti',
    minRate: 21.0,
    maxAmount: 300000000,
    tenure: '18 oygacha (Up to 1.5 years)',
    processingTime: '30 daqiqada onlayn',
    collateral: 'Garovsiz (100% Onlayn)',
    description: 'Chakana savdo doʻkonlari va POS kassa tizimlari egalari uchun toʻliq onlayn rasmiylashtiriladigan kredit.',
    features: [
      'POS aylanmalari orqali 100% onlayn tasdiqlash',
      'Soliq QQS 12% deklaratsiyasi avtomatik integratsiyasi',
      'Erkin jadval asosida muddatidan oldin jarimasiz yopish',
    ],
    isPopular: false,
  },
  {
    id: 'brb-bank',
    bankName: 'Biznesni Rivojlantirish Banki (BRB)',
    logoColor: 'bg-teal-700',
    logoText: 'BRB',
    loanType: 'Kichik Biznes Davlat Imtiyozli Dasturi',
    minRate: 14.0,
    maxAmount: 1000000000,
    tenure: '36 oygacha (Up to 3 years)',
    processingTime: '24 soat ichida',
    collateral: 'Sugʻurta polisi yoki uchinchi shaxs kafilligi',
    description: 'Davlat dasturi doirasidagi eng arzon imtiyozli yillik 14% stavkadagi moliyalashtirish paketi.',
    features: [
      'Yillik 14% davlat subsidiyalangan stavkasi',
      '6 oygacha asosiy qarzga imtiyozli davr (Grace period)',
      'Ishlab chiqarish va savdo jihozlarini xarid qilish uchun',
    ],
  },
  {
    id: 'agrobank',
    bankName: 'Agrobank ATB',
    logoColor: 'bg-green-700',
    logoText: 'AGRO',
    loanType: 'Faktoring va Taʼminotchilar Moliyalashtirish',
    minRate: 17.5,
    maxAmount: 800000000,
    tenure: '24 oygacha',
    processingTime: '1 ish kunida',
    collateral: 'Chiqarilgan elektron hisob-fakturalar (Didox)',
    description: 'Tasdiqlangan e-fakturalar garovi asosida yetkazib beruvchilarga toʻlov mablagʻi.',
    features: [
      'Didox / Factura.uz orqali avtomatik tekshiruv',
      'Xaridor toʻlovini kutmasdan aylanmani uzluksiz davom ettirish',
      'B2B distribyutorlar va ulgurji savdo uchun qulay',
    ],
  },
];

interface LoanApplication {
  id: string;
  bankName: string;
  amount: number;
  termMonths: number;
  rate: number;
  monthlyPayment: number;
  status: 'SUBMITTED' | 'SCORING' | 'APPROVED';
  createdAt: string;
}

export default function BusinessLoansPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const systemSettings = useSelector((state: RootState) => state.systemSettings);
  const companyName = systemSettings?.company?.companyName || user?.firstName || 'OOO "RIZOBAY STROY"';

  // Active Tab
  const [activeTab, setActiveTab] = useState<'portal' | 'scoring' | 'calculator' | 'history'>('portal');

  // Expanded Bank Details
  const [expandedBankId, setExpandedBankId] = useState<string | null>(null);

  // Modals
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);
  const [isUpdateDataOpen, setIsUpdateDataOpen] = useState(false);
  const [updateStep, setUpdateStep] = useState<1 | 2>(1);

  // Update Data Form State
  const [selectedOkedCode, setSelectedOkedCode] = useState('47190 - Boshqa tovarlar chakana savdosi');
  const [okedSector, setOkedSector] = useState('G - Ulgurji va chakana savdo');
  const [okedGroup, setOkedGroup] = useState('47 - Chakana savdo (avtotransportdan tashqari)');
  const [okedClass, setOkedClass] = useState('47.19 - Ixtisoslashmagan doʻkonlarda boshqa tovarlar chakana savdosi');
  const [hasConsent, setHasConsent] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Calculator State
  const [loanAmount, setLoanAmount] = useState<number>(150000000);
  const [termMonths, setTermMonths] = useState<number>(12);
  const [selectedRate, setSelectedRate] = useState<number>(18.5);

  // Application Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankOffer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local Application History
  const [applications, setApplications] = useState<LoanApplication[]>([
    {
      id: 'APP-2026-081',
      bankName: 'Ipak Yoʻli Bank',
      amount: 150000000,
      termMonths: 12,
      rate: 18.5,
      monthlyPayment: 13780000,
      status: 'APPROVED',
      createdAt: '2026-08-28',
    },
  ]);

  // Formatted Helper
  const fmt = (n: number) => {
    return new Intl.NumberFormat('uz-UZ').format(Math.round(n)) + ' soʻm';
  };

  // Calculations
  const monthlyRate = selectedRate / 100 / 12;
  const monthlyPayment = useMemo(() => {
    if (monthlyRate === 0) return loanAmount / termMonths;
    return (
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1)
    );
  }, [loanAmount, termMonths, monthlyRate]);

  const totalPayment = monthlyPayment * termMonths;
  const totalInterest = totalPayment - loanAmount;

  const handleOpenApply = (bank: BankOffer) => {
    setSelectedBank(bank);
    setSelectedRate(bank.minRate);
    setIsApplyModalOpen(true);
  };

  const handleConfirmApplication = async () => {
    if (!selectedBank) return;
    setIsSubmitting(true);

    try {
      await new Promise((res) => setTimeout(res, 1200));

      const newApp: LoanApplication = {
        id: `APP-2026-${Math.floor(100 + Math.random() * 900)}`,
        bankName: selectedBank.bankName,
        amount: loanAmount,
        termMonths,
        rate: selectedRate,
        monthlyPayment: Math.round(monthlyPayment),
        status: 'SUBMITTED',
        createdAt: new Date().toISOString().split('T')[0],
      };

      setApplications((prev) => [newApp, ...prev]);
      setIsApplyModalOpen(false);
      toast.success(
        `${selectedBank.bankName} ga ${fmt(loanAmount)} miqdoridagi kredit arizasi muvaffaqiyatli yuborildi!`
      );
    } catch (err) {
      toast.error('Arizani yuborishda xatolik yuz berdi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveUpdateData = () => {
    setIsUpdateDataOpen(false);
    toast.success('Korxona faoliyat maʼlumotlari va skoring sozlamalari muvaffaqiyatli yangilandi!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 font-sans text-xs text-slate-800 animate-fade-in">
      {/* Top Header */}
      <PageHeader
        title="Moliyalashtirish Markazi"
        breadcrumbs={[
          { label: 'Boshqaruv', to: '/admin' },
          { label: 'Moliya & Buxgalteriya', to: '/admin/finance' },
          { label: 'Moliyalashtirish Portali' },
        ]}
      >
        <div className="flex items-center gap-2">
          {/* Learn More / How it works Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsLearnMoreOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold border-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#028090]" />
            <span>Qanday ishlaydi?</span>
          </Button>

          {/* Update Data Button */}
          <Button
            type="button"
            onClick={() => {
              setUpdateStep(1);
              setIsUpdateDataOpen(true);
            }}
            className="flex items-center gap-1.5 bg-[#028090] hover:bg-[#026875] text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-[#02C39A]" />
            <span>Maʼlumotlarni yangilash</span>
          </Button>
        </div>
      </PageHeader>

      {/* Subtitle Banner with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-[#0B2B33]">Financing Portal (Moliyalashtirish Markazi)</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
              Faol Kredit Liniyasi: 500,000,000 UZS
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            SAPAR ERP maʼlumotlaringiz asosida hamkor banklardan past foizli biznes kreditlari va aylanma mablagʻlarni 1 kunda oling.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Learn More / How it works Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsLearnMoreOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold border-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#028090]" />
            <span>Qanday ishlaydi?</span>
          </Button>

          {/* Update Data Button */}
          <Button
            type="button"
            onClick={() => {
              setUpdateStep(1);
              setIsUpdateDataOpen(true);
            }}
            className="flex items-center gap-1.5 bg-[#028090] hover:bg-[#026875] text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-[#02C39A]" />
            <span>Maʼlumotlarni yangilash</span>
          </Button>

          <div className="hidden sm:block text-right pl-3 border-l border-slate-200">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Skoring reytingi</div>
            <div className="text-sm font-black text-[#028090] font-mono">785 / 850 (A+)</div>
          </div>
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-[#028090] to-[#02C39A] text-white items-center justify-center font-black shadow-xs">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('portal')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition cursor-pointer text-xs ${
            activeTab === 'portal'
              ? 'bg-[#028090] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Landmark className="w-4 h-4" /> Bank Kredit Takliflari ({BANK_OFFERS.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scoring')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition cursor-pointer text-xs ${
            activeTab === 'scoring'
              ? 'bg-[#028090] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>ERP Kredit Skoringi</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
            785 / 850
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition cursor-pointer text-xs ${
            activeTab === 'calculator'
              ? 'bg-[#028090] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-4 h-4" /> Kredit Kalkulyatori
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition cursor-pointer text-xs ${
            activeTab === 'history'
              ? 'bg-[#028090] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-4 h-4" /> Mening Arizalarim ({applications.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. BANK CARDS GRID (INSPIRED BY BUKKU SCREENSHOTS)                         */}
      {/* ========================================================================= */}
      {activeTab === 'portal' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {BANK_OFFERS.map((bank) => {
              const isExpanded = expandedBankId === bank.id;
              return (
                <div
                  key={bank.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition p-5 space-y-4 relative overflow-hidden"
                >
                  {bank.isPopular && (
                    <div className="absolute top-0 right-0 bg-[#028090] text-white text-[9px] font-black px-3 py-1 rounded-bl-xl tracking-wider uppercase">
                      Eng Ommabop
                    </div>
                  )}

                  {/* Main Row: Logo, Metrics, Action Button */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Bank Brand */}
                    <div className="lg:col-span-3 flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-xl ${bank.logoColor} text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0`}
                      >
                        {bank.logoText}
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-[#0B2B33]">{bank.bankName}</h3>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{bank.loanType}</p>
                      </div>
                    </div>

                    {/* Key Metrics: Tenure, Amount, Rate, Processing Time */}
                    <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                          <Calendar className="w-3 h-3" /> Muddat
                        </div>
                        <div className="text-xs font-bold text-slate-800 mt-0.5">{bank.tenure}</div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                          <DollarSign className="w-3 h-3" /> Maks. Summa
                        </div>
                        <div className="text-xs font-bold text-slate-800 mt-0.5">
                          {bank.maxAmount / 1000000}M UZS
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                          <Percent className="w-3 h-3" /> Foiz stavkasi
                        </div>
                        <div className="text-xs font-black text-[#028090] mt-0.5">{bank.minRate}% yillik</div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" /> Tezlik
                        </div>
                        <div className="text-xs font-bold text-emerald-700 mt-0.5">{bank.processingTime}</div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="lg:col-span-3 flex items-center justify-end gap-2">
                      <Button
                        onClick={() => handleOpenApply(bank)}
                        className="w-full sm:w-auto bg-[#028090] hover:bg-[#026875] text-white font-bold text-xs px-5 py-2.5 shadow-xs cursor-pointer"
                      >
                        Apply (Ariza topshirish)
                      </Button>
                    </div>
                  </div>

                  {/* Collapsible Details Toggle */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => setExpandedBankId(isExpanded ? null : bank.id)}
                      className="text-slate-500 hover:text-[#028090] font-bold flex items-center gap-1 cursor-pointer transition"
                    >
                      <span>{isExpanded ? '▾ Yopish' : '▸ Details (Batafsil shartlar)'}</span>
                    </button>

                    <span className="text-slate-400">{bank.collateral}</span>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-3 animate-in fade-in">
                      <p className="leading-relaxed">{bank.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                        {bank.features.map((feat, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#028090] shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ERP CREDIT SCORING TAB                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'scoring' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0B2B33]">
                    ERP Kredit Skoringi va Moliyaviy Salomatlik Indeksi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Oʻzbekiston Markaziy Banki va hamkor banklar metodologiyasi asosida real vaqtda hisoblangan
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Reyting: A+ (Aʼlo)
                </span>
              </div>
            </div>

            {/* 4 Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-xs">Oylik Tushum Barqarorligi</span>
                  <span className="font-mono font-bold text-emerald-600 text-xs">94 / 100</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '94%' }} />
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Oxirgi 6 oylik oʻrtacha tushum 185 mln soʻm/oy. Uzluksiz oʻsish dinamikasi mavjud.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-xs">Soliq & QQS Intizomi</span>
                  <span className="font-mono font-bold text-emerald-600 text-xs">98 / 100</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '98%' }} />
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Soliq.uz orqali oʻz vaqtida topshirilgan hisobotlar. Muddati oʻtgan qarz mavjud emas.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-xs">Qarz Yuki Nisbati (DTI)</span>
                  <span className="font-mono font-bold text-teal-600 text-xs">88 / 100</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-teal-500 h-2 rounded-full" style={{ width: '88%' }} />
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Mavjud kreditlar boʻyicha oylik toʻlovlar sof tushumning atigi 14.2% ini tashkil qiladi.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-xs">Rentabellik (2-shakl)</span>
                  <span className="font-mono font-bold text-teal-600 text-xs">86 / 100</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-teal-500 h-2 rounded-full" style={{ width: '86%' }} />
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Sof foyda marjasi 18.5%. Xarajatlar optimallashtirilgan va rentabellik yuqori.
                </p>
              </div>
            </div>

            {/* Recommendations Box */}
            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#0B2B33] text-xs">
                    Kredit limitini 1,000,000,000 soʻmga oshirish tavsiyasi:
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    1C:ClientBank va elektron fakturalar orqali barcha tushumlarni toʻliq aks ettirish hamda debitorlik qarzlarini 30 kun ichida undirish skoring ballini 820 gacha koʻtaradi.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => handleOpenApply(BANK_OFFERS[0])}
                className="bg-[#028090] hover:bg-[#026875] text-white font-bold text-xs shrink-0 cursor-pointer"
              >
                Kredit Olish <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CALCULATOR TAB                                                         */}
      {/* ========================================================================= */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-50 text-[#028090]">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Interaktiv Kredit Kalkulyatori</h3>
                  <p className="text-xs text-slate-500">Oylik toʻlov va muddatni oʻzingizga moslang</p>
                </div>
              </div>
              <Badge color="success" variant="soft">
                Stavka: {selectedRate}% yillik
              </Badge>
            </div>

            {/* Amount Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Kredit Miqdori:</span>
                <span className="text-base font-bold text-[#028090] font-mono">{fmt(loanAmount)}</span>
              </div>
              <input
                type="range"
                min="10000000"
                max="1000000000"
                step="5000000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#028090]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>10,000,000 soʻm</span>
                <span>500,000,000 soʻm</span>
                <span>1,000,000,000 soʻm</span>
              </div>
            </div>

            {/* Term Months Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Kredit Muddati:</span>
                <span className="text-base font-bold text-[#028090] font-mono">{termMonths} oy</span>
              </div>
              <input
                type="range"
                min="6"
                max="36"
                step="3"
                value={termMonths}
                onChange={(e) => setTermMonths(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#028090]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>6 oy</span>
                <span>12 oy</span>
                <span>24 oy</span>
                <span>36 oy</span>
              </div>
            </div>

            {/* Rate Selector Pills */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Dastur va Bank Stavkalari:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRate(14.0)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition text-left cursor-pointer ${
                    selectedRate === 14.0
                      ? 'border-[#028090] bg-teal-50 text-[#0B2B33] ring-1 ring-[#028090]/40'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="text-[#028090] font-bold">14.0% Imtiyozli</div>
                  <div className="text-[10px] text-slate-500">BRB Davlat dasturi</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRate(18.5)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition text-left cursor-pointer ${
                    selectedRate === 18.5
                      ? 'border-[#028090] bg-teal-50 text-[#0B2B33] ring-1 ring-[#028090]/40'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="text-[#028090] font-bold">18.5% Standart</div>
                  <div className="text-[10px] text-slate-500">Ipak Yoʻli / Agrobank</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRate(21.0)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition text-left cursor-pointer ${
                    selectedRate === 21.0
                      ? 'border-[#028090] bg-teal-50 text-[#0B2B33] ring-1 ring-[#028090]/40'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="text-[#028090] font-bold">21.0% Ekspress</div>
                  <div className="text-[10px] text-slate-500">Kapitalbank Garovsiz</div>
                </button>
              </div>
            </div>
          </div>

          {/* Calculation Result Summary */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0B2B33] to-[#06181D] rounded-2xl p-6 text-white border border-[#13444D] shadow-md flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  Toʻlov Grafigi Hisobi
                </span>
                <span className="text-xs text-[#02C39A] font-mono font-bold">{termMonths} oy / {selectedRate}%</span>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] text-slate-400">Taxminiy Oylik Toʻlov (Annuity):</div>
                <div className="text-2xl sm:text-3xl font-black text-[#02C39A] font-mono">
                  {fmt(monthlyPayment)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-400">Asosiy Qarz:</div>
                  <div className="text-xs font-bold text-white font-mono">{fmt(loanAmount)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Jami Hisoblangan Foiz:</div>
                  <div className="text-xs font-bold text-amber-400 font-mono">{fmt(totalInterest)}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="text-[10px] text-slate-400">Jami Qaytariladigan Summa:</div>
                <div className="text-base font-bold text-white font-mono">{fmt(totalPayment)}</div>
              </div>
            </div>

            <div className="pt-5">
              <Button
                className="w-full bg-[#02C39A] hover:bg-[#02a884] text-[#0B2B33] font-black py-2.5 text-xs shadow-md cursor-pointer"
                onClick={() => handleOpenApply(BANK_OFFERS[0])}
              >
                Tanlangan Shartlarda Ariza Topshirish <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. APPLICATIONS HISTORY TAB                                               */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#028090]" />
              <h3 className="text-sm font-extrabold text-slate-900">Yuborilgan Kredit Arizalari Tarixi</h3>
            </div>
            <span className="text-xs text-slate-500">Jami {applications.length} ta ariza</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Ariza ID</th>
                  <th className="py-2.5 px-3">Bank</th>
                  <th className="py-2.5 px-3">Summa</th>
                  <th className="py-2.5 px-3">Muddat</th>
                  <th className="py-2.5 px-3">Stavka</th>
                  <th className="py-2.5 px-3">Oylik Toʻlov</th>
                  <th className="py-2.5 px-3">Holati</th>
                  <th className="py-2.5 px-3">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#028090]">{app.id}</td>
                    <td className="py-2.5 px-3 font-bold">{app.bankName}</td>
                    <td className="py-2.5 px-3 font-mono">{fmt(app.amount)}</td>
                    <td className="py-2.5 px-3">{app.termMonths} oy</td>
                    <td className="py-2.5 px-3 font-mono">{app.rate}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-900 font-bold">{fmt(app.monthlyPayment)}</td>
                    <td className="py-2.5 px-3">
                      {app.status === 'APPROVED' && <Badge color="success" variant="solid">Maʼqullandi</Badge>}
                      {app.status === 'SCORING' && <Badge color="warning" variant="soft">Skoring Jarayonida</Badge>}
                      {app.status === 'SUBMITTED' && <Badge color="teal" variant="soft">Bankka Yuborildi</Badge>}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{app.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: UPDATE DATA (STEP 1 & 2 - MATCHING SCREENSHOT 1 & 2)              */}
      {/* ========================================================================= */}
      {isUpdateDataOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#0B2B33]">Update Data</h3>
                <p className="text-xs text-slate-500">
                  {updateStep === 1 ? 'Step 1 of 2: Nature of business' : 'Step 2 of 2: Consent'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUpdateDataOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Bar */}
            <div className="w-full bg-slate-100 h-1">
              <div
                className="bg-blue-600 h-1 transition-all duration-300"
                style={{ width: updateStep === 1 ? '50%' : '100%' }}
              />
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {updateStep === 1 ? (
                <>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tell us about your nature of business and stand a bigger chance of getting pre-approved financing options. Select the most relevant one if you're in multiple lines of business.
                  </p>

                  {/* Selected OKED Input with Quick Flash Pick */}
                  <div className="relative">
                    <input
                      type="text"
                      value={selectedOkedCode}
                      onChange={(e) => setSelectedOkedCode(e.target.value)}
                      placeholder="01111 - Growing of maize / 47190 - Savdo"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-blue-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2 p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Avtomatik toʻldirish"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Selected MSIC / OKED Category Tree */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-600">
                      <span className="text-red-500">*</span> Selected OKED / MSIC Code
                    </label>

                    <div className="space-y-1.5">
                      <select
                        value={okedSector}
                        onChange={(e) => setOkedSector(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500"
                      >
                        <option>G - Ulgurji va chakana savdo</option>
                        <option>A - Qishloq xoʻjaligi, oʻrmon va baliqchilik</option>
                        <option>C - Ishlab chiqarish sanoati</option>
                        <option>J - Axborot va aloqa (IT Park)</option>
                        <option>I - Joylashtirish va umumiy ovqatlanish</option>
                      </select>

                      <select
                        value={okedGroup}
                        onChange={(e) => setOkedGroup(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500"
                      >
                        <option>47 - Chakana savdo (avtotransportdan tashqari)</option>
                        <option>46 - Ulgurji savdo (avtotransportdan tashqari)</option>
                        <option>01 - Oʻsimlikchilik va chorvachilik</option>
                        <option>56 - Oziq-ovqat va ichimliklar xizmati</option>
                      </select>

                      <select
                        value={okedClass}
                        onChange={(e) => setOkedClass(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500"
                      >
                        <option>47.19 - Ixtisoslashmagan doʻkonlarda boshqa tovarlar chakana savdosi</option>
                        <option>47.11 - Oziq-ovqat tovarlari chakana savdosi</option>
                        <option>46.90 - Nomeditsina tovarlar ulgurji savdosi</option>
                        <option>62.01 - Kompyuter dasturlashtirish faoliyati</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    By giving consent, your <strong>non-identifiable</strong> data might be shared with our lending partners. This can increase your chance of getting loan approval and speed up your loan applications.
                  </p>

                  {/* Toggle: No Consent vs Consent */}
                  <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-100">
                    <button
                      type="button"
                      onClick={() => setHasConsent(false)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                        !hasConsent
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      No Consent
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasConsent(true)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                        hasConsent
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Consent on Non-Identifiable Data
                    </button>
                  </div>

                  {/* Status Banner */}
                  <div
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                      !hasConsent
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>
                      {!hasConsent
                        ? 'Your data will not be shared with our lending partners.'
                        : 'Your non-identifiable financial metrics will be securely used for pre-approved loan limits.'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    You may update your info and consent any time in the portal.
                  </p>

                  {/* Terms Checkbox */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="terms-check"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="terms-check" className="text-xs text-slate-700 cursor-pointer">
                      I agree to SAPAR's{' '}
                      <span className="text-blue-600 font-bold hover:underline">Terms of Service</span> &{' '}
                      <span className="text-blue-600 font-bold hover:underline">Privacy Policy</span>.
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              {updateStep === 1 ? (
                <Button
                  type="button"
                  onClick={() => setUpdateStep(2)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 cursor-pointer"
                >
                  Next
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUpdateStep(1)}
                    className="text-xs font-bold cursor-pointer"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    disabled={!agreeTerms}
                    onClick={handleSaveUpdateData}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 cursor-pointer"
                  >
                    Update
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LEARN MORE / ONBOARDING INTRO (MATCHING SCREENSHOT 3)            */}
      {/* ========================================================================= */}
      {isLearnMoreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#E0F7FA] via-white to-white rounded-3xl max-w-xl w-full shadow-2xl border border-teal-200 overflow-hidden relative">
            <button
              type="button"
              onClick={() => setIsLearnMoreOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full bg-white/80 shadow-xs transition z-20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-7 text-center space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Your Shortcut to Business Financing
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0B2B33]">
                  SAPAR <span className="text-[#028090]">Financing Portal</span>
                </h2>
              </div>

              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 max-w-md mx-auto">
                <h3 className="text-base font-extrabold text-[#028090]">
                  Get up to 500,000,000 UZS loan
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  from trusted financing institutions, without paperwork headaches or long waiting times.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  How does SAPAR Financing Portal work?
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                  {/* Step 1 */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative">
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-[#0B2B33] font-black text-xs flex items-center justify-center">
                      1
                    </div>
                    <div className="font-extrabold text-xs text-[#0B2B33]">Step 1</div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      With 1 click, grant permission to share your financial data with SAPAR's financing partners.
                    </p>
                    <div className="text-[10px] text-teal-700 font-bold">No paperwork, no queues at banks</div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative">
                    <div className="w-6 h-6 rounded-full bg-[#028090] text-white font-black text-xs flex items-center justify-center">
                      2
                    </div>
                    <div className="font-extrabold text-xs text-[#0B2B33]">Step 2</div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Receive instant pre-approval notifications in SAPAR.
                    </p>
                    <div className="text-[10px] text-emerald-600 font-bold">E.g. Pre-approved for 500M!</div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center">
                      3
                    </div>
                    <div className="font-extrabold text-xs text-[#0B2B33]">Step 3</div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      That's all! Proceed to complete your official application.
                    </p>
                    <div className="text-[10px] text-slate-600 font-bold">Cleared time-consuming steps!</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsLearnMoreOpen(false)}
                  className="rounded-full px-6 py-2 text-xs font-bold border-[#028090] text-[#028090] hover:bg-teal-50 cursor-pointer"
                >
                  Learn more
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setIsLearnMoreOpen(false);
                    setUpdateStep(1);
                    setIsUpdateDataOpen(true);
                  }}
                  className="rounded-full px-7 py-2 text-xs font-black bg-[#0B2B33] hover:bg-[#028090] text-white shadow-md cursor-pointer"
                >
                  Show me (Boshlash)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: APPLICATION FORM MODAL (E-IMZO)                                   */}
      {/* ========================================================================= */}
      {selectedBank && (
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          title={`Onlayn Kredit Arizasi: ${selectedBank.bankName}`}
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 space-y-1">
              <div className="font-bold text-xs">{selectedBank.loanType}</div>
              <p className="text-[11px] text-teal-700">
                ERP maʼlumotlaringiz (2-shakl moliyaviy natijalar & Soliq QQS 12%) avtomatik biriktiriladi.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Korxona:</span>
                <div className="font-bold text-slate-900">{companyName}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Soʻralayotgan Summa:</span>
                <div className="font-bold text-[#028090] font-mono">{fmt(loanAmount)}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Muddat:</span>
                <div className="font-bold text-slate-900">{termMonths} oy</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Yillik Stavka:</span>
                <div className="font-bold text-[#028090] font-mono">{selectedRate}% yillik</div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Mablagʻ tushishi uchun Bank Hisob-raqami:</label>
              <select className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#028090]">
                <option>20208000900123456001 — Ipak Yoʻli Bank (Asosiy hisob)</option>
                <option>20208000700987654001 — Kapitalbank ATB</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Kredit Maqsadi:</label>
              <input
                type="text"
                defaultValue="Aylanma mablagʻlarni toʻldirish va tovar xarid qilish"
                className="w-full p-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#028090]"
              />
            </div>

            <div className="p-3 bg-slate-100 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-600">
              <ShieldCheck className="w-4 h-4 text-[#028090] shrink-0 mt-0.5" />
              <span>
                Ariza topshirish orqali korxonaning kredit tarixi va Soliq hisobotlarini 
                <strong> {selectedBank.bankName}</strong> tomonidan avtomatik skoring qilishga rozilik bildirasiz.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setIsApplyModalOpen(false)}
                disabled={isSubmitting}
                className="text-xs cursor-pointer"
              >
                Bekor Qilish
              </Button>
              <Button
                className="bg-[#028090] hover:bg-[#026875] text-white font-bold text-xs cursor-pointer"
                onClick={handleConfirmApplication}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Yuborilmoqda...' : 'E-IMZO Bilan Tasdiqlash & Yuborish'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
