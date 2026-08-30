import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
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
  Info,
  DollarSign,
} from 'lucide-react';
import type { RootState } from '@store/index';
import { PageHeader } from '@/context/PageHeaderContext';
import { Card, Button, Badge } from '@components/ui';
import Modal from '@components/admin/Modal';

interface BankOffer {
  id: string;
  bankName: string;
  logoColor: string;
  loanType: string;
  minRate: number;
  maxAmount: number;
  maxTermMonths: number;
  speed: string;
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
    loanType: 'Tezkor Aylanma Mablagʻ (Overdraft)',
    minRate: 18.5,
    maxAmount: 500000000,
    maxTermMonths: 24,
    speed: '2 soatda hisobga',
    collateral: '150M gacha garovsiz',
    description: 'SAPAR ERP aylanma maʼlumotlari asosida tovar sotib olish va kassa boʻshligʻini toʻldirish uchun.',
    features: [
      'ERP maʼlumotlari asosida avtomatik skoring',
      'Ortiqcha qogʻozbozlik va hujjatsiz',
      'Faqat ishlatilgan kunlar uchun foiz toʻlash',
    ],
    isPopular: true,
  },
  {
    id: 'brb-bank',
    bankName: 'Biznesni Rivojlantirish Banki (BRB)',
    logoColor: 'bg-teal-700',
    loanType: 'Davlat Dasturi Imtiyozli Mikrokrediti',
    minRate: 14.0,
    maxAmount: 1000000000,
    maxTermMonths: 36,
    speed: '24 soatda',
    collateral: 'Sugʻurta polisi yoki kafillik',
    description: 'Kichik va oʻrta biznesni qoʻllab-quvvatlash davlat dasturi doirasidagi eng arzon imtiyozli stavka.',
    features: [
      'Yillik 14% imtiyozli stavka',
      '6 oygacha imtiyozli davr (Grace period)',
      'Asbob-uskunalar va ishlab chiqarish uchun',
    ],
  },
  {
    id: 'kapitalbank',
    bankName: 'Kapitalbank',
    logoColor: 'bg-amber-600',
    loanType: 'Ekspress Savdo Krediti',
    minRate: 21.0,
    maxAmount: 300000000,
    maxTermMonths: 18,
    speed: '30 daqiqada onlayn',
    collateral: 'Garovsiz (100% Onlayn)',
    description: 'Savdo doʻkonlari va xizmat koʻrsatish korxonalari uchun toʻliq onlayn rasmiylashtiriladigan ekspress kredit.',
    features: [
      '100% onlayn karta/hisobga tushirish',
      'Soliq QQS 12% hisobotlari orqali tasdiqlash',
      'Erkin muddatidan oldin yopish imkoniyati',
    ],
  },
  {
    id: 'agrobank',
    bankName: 'Agrobank',
    logoColor: 'bg-green-700',
    loanType: 'Taʼminot va Faktoring Moliyalashtirish',
    minRate: 17.5,
    maxAmount: 800000000,
    maxTermMonths: 24,
    speed: '1 kunda',
    collateral: 'Debitorlik qarzlari / Faktura',
    description: 'Chiqarilgan va tasdiqlangan hisob-fakturalar garovi asosida yetkazib beruvchilarga toʻlov mablagʻi.',
    features: [
      'Akt sverki va fakturalar asosida moliyalash',
      'Xaridor pul toʻlaguncha aylanmani toʻxtatmaslik',
      'B2B ulgurji savdo korxonalari uchun maxsus',
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
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const systemSettings = useSelector((state: RootState) => state.systemSettings);
  const companyName = systemSettings?.company?.companyName || user?.firstName || 'Korxona';

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

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Biznes Krediti & Bank Finanslash"
        breadcrumbs={[
          { label: 'Boshqaruv', to: '/admin' },
          { label: 'Moliya & Buxgalteriya', to: '/admin/dashboard/finance' },
          { label: 'Biznes Krediti' },
        ]}
      />

      {/* ========================================================================= */}
      {/* 1. HERO PRE-APPROVAL BANNER (BUKKU / FINTECH STYLE)                        */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 p-6 sm:p-8 text-white shadow-xl border border-teal-800/40">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ERP Buxgalteriya & Soliq Tahlili Asosida</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {companyName} uchun 500,000,000 soʻmgacha dastlabki maʼqullangan kredit liniyasi
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              SAPAR ERP tizimidagi haqiqiy aylanma mablagʻingiz, 21-son BHMS moliyaviy natijalari va Soliq hisobotlari asosida hamkor banklardan 
              <span className="font-semibold text-teal-300"> 14% dan boshlanuvchi imtiyozli stavkalarda</span> garovsiz va 1 bosqichli onlayn arizada kredit oling.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Qogʻozbozliksiz
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2 soatda hisobga tushirish
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> E-IMZO bilan tasdiqlash
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/15 space-y-4">
            <div className="text-xs uppercase tracking-wider text-teal-300 font-semibold">
              Dastlabki Skoring Natijasi
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                500,000,000 soʻm
              </div>
              <div className="text-xs text-slate-300 mt-1">
                Kreditga layoqatlilik reytingi: <span className="font-bold text-white">A+ (Aʼlo)</span>
              </div>
            </div>
            <Button
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-lg text-sm"
              onClick={() => handleOpenApply(BANK_OFFERS[0])}
            >
              <Zap className="w-4 h-4 mr-2" /> 1 Bosqichda Ariza Topshirish
            </Button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE LOAN CALCULATOR                                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Interaktiv Kredit Kalkulyatori</h3>
                <p className="text-xs text-slate-500">Oylik toʻlov va muddatni oʻzingizga moslang</p>
              </div>
            </div>
            <Badge color="success" variant="soft">
              Stavka: {selectedRate}% yillik
            </Badge>
          </div>

          {/* Amount Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-700">Kredit Miqdori:</span>
              <span className="text-base font-bold text-teal-700 font-mono">{fmt(loanAmount)}</span>
            </div>
            <input
              type="range"
              min="10000000"
              max="1000000000"
              step="5000000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>10,000,000 soʻm</span>
              <span>500,000,000 soʻm</span>
              <span>1,000,000,000 soʻm</span>
            </div>
          </div>

          {/* Term Months Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-700">Kredit Muddati:</span>
              <span className="text-base font-bold text-teal-700 font-mono">{termMonths} oy</span>
            </div>
            <input
              type="range"
              min="6"
              max="36"
              step="3"
              value={termMonths}
              onChange={(e) => setTermMonths(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>6 oy</span>
              <span>12 oy</span>
              <span>24 oy</span>
              <span>36 oy</span>
            </div>
          </div>

          {/* Rate Selector Pills */}
          <div className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Dastur va Bank Stavkalari:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRate(14.0)}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition text-left ${
                  selectedRate === 14.0
                    ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="text-teal-700 font-bold">14.0% Imtiyozli</div>
                <div className="text-[10px] text-slate-500">BRB Davlat dasturi</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRate(18.5)}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition text-left ${
                  selectedRate === 18.5
                    ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="text-teal-700 font-bold">18.5% Standart</div>
                <div className="text-[10px] text-slate-500">Ipak Yoʻli / Agrobank</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRate(21.0)}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition text-left ${
                  selectedRate === 21.0
                    ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="text-teal-700 font-bold">21.0% Ekspress</div>
                <div className="text-[10px] text-slate-500">Kapitalbank Garovsiz</div>
              </button>
            </div>
          </div>
        </div>

        {/* Calculation Result Summary */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-6 text-white border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Toʻlov Grafigi Hisobi
              </span>
              <span className="text-xs text-teal-400 font-mono font-bold">{termMonths} oy / {selectedRate}%</span>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-400">Taxminiy Oylik Toʻlov (Annuity):</div>
              <div className="text-3xl font-extrabold text-teal-300 font-mono">
                {fmt(monthlyPayment)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
              <div>
                <div className="text-[11px] text-slate-400">Asosiy Qarz:</div>
                <div className="text-sm font-bold text-white font-mono">{fmt(loanAmount)}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Jami Hisoblangan Foiz:</div>
                <div className="text-sm font-bold text-amber-400 font-mono">{fmt(totalInterest)}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[11px] text-slate-400">Jami Qaytariladigan Summa:</div>
              <div className="text-lg font-bold text-white font-mono">{fmt(totalPayment)}</div>
            </div>
          </div>

          <div className="pt-6">
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 text-sm shadow-lg"
              onClick={() => handleOpenApply(BANK_OFFERS[0])}
            >
              Tanlangan Shartlarda Ariza Topshirish <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              Kredit skoringi va shartlari bank tomonidan qatʼiy tasdiqlanadi.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PARTNER BANK OFFERS LIST (4 UZBEKISTAN BANKS)                           */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Oʻzbekiston Hamkor Banklarining Maxsus Takliflari</h2>
            <p className="text-xs text-slate-500">SAPAR ERP mijozlari uchun pasaytirilgan stavkalar va tezlashtirilgan koʻrib chiqish</p>
          </div>
          <Badge color="teal" variant="soft">4 ta faol bank</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {BANK_OFFERS.map((bank) => (
            <div
              key={bank.id}
              className={`bg-white rounded-2xl p-6 border transition shadow-xs hover:shadow-md flex flex-col justify-between relative overflow-hidden ${
                bank.isPopular ? 'border-teal-500 ring-1 ring-teal-500/20' : 'border-slate-200'
              }`}
            >
              {bank.isPopular && (
                <div className="absolute top-0 right-0 bg-teal-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase">
                  Eng Ommabop
                </div>
              )}

              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${bank.logoColor} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs`}>
                    {bank.bankName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{bank.bankName}</h3>
                    <p className="text-xs text-teal-700 font-semibold">{bank.loanType}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{bank.description}</p>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Stavka</div>
                    <div className="text-sm font-bold text-teal-800">{bank.minRate}% dan</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Maks. Summa</div>
                    <div className="text-sm font-bold text-slate-800">{bank.maxAmount / 1000000}M gacha</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Tezlik</div>
                    <div className="text-sm font-bold text-emerald-700">{bank.speed}</div>
                  </div>
                </div>

                {/* Bullets */}
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {bank.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-500">{bank.collateral}</span>
                <Button
                  onClick={() => handleOpenApply(bank)}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2"
                >
                  Ariza Topshirish <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. RECENT SUBMITTED APPLICATIONS HISTORY                                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">Yuborilgan Kredit Arizalari Tarixi</h3>
          </div>
          <span className="text-xs text-slate-500">Jami {applications.length} ta ariza</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ariza ID</th>
                <th className="py-3 px-4">Bank</th>
                <th className="py-3 px-4">Summa</th>
                <th className="py-3 px-4">Muddat</th>
                <th className="py-3 px-4">Stavka</th>
                <th className="py-3 px-4">Oylik Toʻlov</th>
                <th className="py-3 px-4">Holati</th>
                <th className="py-3 px-4">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-teal-800">{app.id}</td>
                  <td className="py-3 px-4 font-bold">{app.bankName}</td>
                  <td className="py-3 px-4 font-mono">{fmt(app.amount)}</td>
                  <td className="py-3 px-4">{app.termMonths} oy</td>
                  <td className="py-3 px-4 font-mono">{app.rate}%</td>
                  <td className="py-3 px-4 font-mono text-slate-900 font-bold">{fmt(app.monthlyPayment)}</td>
                  <td className="py-3 px-4">
                    {app.status === 'APPROVED' && <Badge color="success" variant="solid">Maʼqullandi</Badge>}
                    {app.status === 'SCORING' && <Badge color="warning" variant="soft">Skoring Jarayonida</Badge>}
                    {app.status === 'SUBMITTED' && <Badge color="teal" variant="soft">Bankka Yuborildi</Badge>}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{app.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. ONE-CLICK APPLICATION MODAL                                             */}
      {/* ========================================================================= */}
      {selectedBank && (
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          title={`Onlayn Kredit Arizasi: ${selectedBank.bankName}`}
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 space-y-1">
              <div className="font-bold text-sm">{selectedBank.loanType}</div>
              <p className="text-xs text-teal-700">
                ERP maʼlumotlaringiz (21-son BHMS & Soliq QQS 12%) avtomatik biriktiriladi.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Korxona:</span>
                <div className="font-bold text-slate-900">{companyName}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Soʻralayotgan Summa:</span>
                <div className="font-bold text-teal-700 font-mono">{fmt(loanAmount)}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Muddat:</span>
                <div className="font-bold text-slate-900">{termMonths} oy</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Yillik Stavka:</span>
                <div className="font-bold text-teal-800 font-mono">{selectedRate}% yillik</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-slate-700">Mablagʻ tushishi uchun Bank Hisob-raqami:</label>
              <select className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500">
                <option>20208000900123456001 — Ipak Yoʻli Bank (Asosiy hisob)</option>
                <option>20208000700987654001 — Kapitalbank ATB</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-slate-700">Kredit Maqsadi:</label>
              <input
                type="text"
                defaultValue="Aylanma mablagʻlarni toʻldirish va tovar xarid qilish"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="p-3 bg-slate-100 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-600">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
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
              >
                Bekor Qilish
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
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
