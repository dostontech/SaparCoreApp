import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Send,
  Receipt,
  Warehouse,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Building2,
  ChevronRight,
  Lock,
  X,
} from 'lucide-react';
import { Button, FormField, fieldControlClasses } from '@components/ui';

export const SaparLandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Pricing Interval Toggle
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // Fast 1-Step Onboarding Modal State
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [contactValue, setContactValue] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [trialSuccess, setTrialSuccess] = useState(false);

  const controlClass = typeof fieldControlClasses === 'function' ? fieldControlClasses() : fieldControlClasses;

  const handleTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactValue.trim()) {
      toast.error('Iltimos, korxona nomi va Telegram/telefoningizni kiriting');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post('/api/public/onboarding/request-trial', {
        companyName: companyName.trim(),
        contactValue: contactValue.trim(),
        ownerName: ownerName.trim(),
      });

      if (res.data?.success) {
        setTrialSuccess(true);
        toast.success(res.data.message || 'Hisobingiz muvaffaqiyatli ochildi!');
      } else {
        toast.error(res.data?.message || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Serverga ulanishda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setIsTrialModalOpen(false);
    setTrialSuccess(false);
    setCompanyName('');
    setContactValue('');
    setOwnerName('');
  };

  return (
    <div className="min-h-screen bg-[#F0FBF8] text-slate-900 font-sans selection:bg-teal-500 selection:text-white flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-teal-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#028090] to-[#02C39A] flex items-center justify-center text-white shadow-md shadow-teal-900/15">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-[#0B2B33]">SAPAR</span>
              <span className="text-xs font-bold text-teal-600 block -mt-1 tracking-wider uppercase">Cloud ERP</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-teal-700 transition">Imkoniyatlar</a>
            <a href="#modules" className="hover:text-teal-700 transition">Modullar</a>
            <a href="#telegram" className="hover:text-teal-700 transition">Telegram Bot</a>
            <a href="#pos" className="hover:text-teal-700 transition">POS Kassa</a>
            <a href="#pricing" className="hover:text-teal-700 transition">Tariflar</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold"
            >
              Kirish
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsTrialModalOpen(true)}
              className="bg-gradient-to-r from-[#028090] to-[#02C39A] hover:opacity-95 text-white font-bold shadow-md shadow-teal-700/20"
            >
              14 Kun Bepul Boshlash
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden bg-gradient-to-b from-white via-[#F0FBF8] to-[#E6F7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 shadow-xs">
            <Sparkles className="w-4 h-4 text-teal-600" />
            Oʻzbekiston va Markaziy Osiyo Uchun Yagona Biznes Platformasi
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0B2B33] tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Barcha Biznes Jarayonlaringiz — <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#028090] to-[#02C39A]">Bitta Mukammal Tizimda</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Savdo, Ombor (FIFO), CRM, 1/2-shakl Buxgalteriya, HRM (12% QQS & Oylik), E-Faktura hamda Telegram orqali doʻkon boshqaruvi.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsTrialModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-[#028090] hover:bg-[#026c7a] text-white font-bold text-base rounded-xl shadow-lg shadow-teal-900/20 flex items-center justify-center gap-2"
            >
              <span>14 Kun Bepul Sinash</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-base rounded-xl shadow-xs flex items-center justify-center gap-2"
            >
              <span>Jonli Demo Koʻrish</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Button>
          </div>

          {/* Quick Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 bg-white/90 rounded-2xl border border-teal-100 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase">Soliq & QQS</div>
              <div className="text-xl font-black text-teal-800 mt-1">12% Tayyor</div>
              <div className="text-[11px] text-slate-500 mt-0.5">1-shakl & 2-shakl avtomat</div>
            </div>
            <div className="p-4 bg-white/90 rounded-2xl border border-teal-100 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase">E-Faktura & Soliq</div>
              <div className="text-xl font-black text-teal-800 mt-1">E-IMZO Hub</div>
              <div className="text-[11px] text-slate-500 mt-0.5">PKCS#7 va MXIK kodlari</div>
            </div>
            <div className="p-4 bg-white/90 rounded-2xl border border-teal-100 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase">Boshqaruv Boti</div>
              <div className="text-xl font-black text-teal-800 mt-1">Telegram Real</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Kunlik tushum & Z-hisobot</div>
            </div>
            <div className="p-4 bg-white/90 rounded-2xl border border-teal-100 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase">Kassa Terminali</div>
              <div className="text-xl font-black text-teal-800 mt-1">58/80mm ESC/POS</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Dialogsiz toʻgʻridan chop</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Module Pillars */}
      <section id="modules" className="py-20 bg-white border-t border-b border-teal-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest">Toʻliq Ekosistema</h2>
            <p className="text-3xl sm:text-4xl font-black text-[#0B2B33] tracking-tight">
              Barcha 28 ta Biznes Moduli Bitta Joyda
            </p>
            <p className="text-slate-600 text-sm">
              Turli xil dasturlarni alohida sotib olishga hojat yoʻq. SAPAR korxonangizning barcha boʻlimlarini birlashtiradi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Pillar 1: POS & Sales */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-teal-400 hover:shadow-lg transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">POS Kassa & Chakana Savdo</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kassir uchun tezkor klaviatura boshqaruvi (F1-F9), toʻxtatilgan savdolar (Hold Cart F4), kalkulyator (Alt+C) hamda 58mm/80mm termal chek chiqarish.
              </p>
              <ul className="text-xs space-y-2 text-slate-700 pt-2 border-t border-slate-200">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Soliq QR-kodi va MXIK kodlari</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Uzcard, Humo, Naqd, Nasiya split toʻlovlar</li>
              </ul>
            </div>

            {/* Pillar 2: Multi-Warehouse & FIFO */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-teal-400 hover:shadow-lg transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
                <Warehouse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Koʻp Omborlar & FIFO Valyutatsiyasi</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bir nechta omborlar oʻrtasida tovar koʻchirish, partiyalar boʻyicha tannarxni avtomatik hisoblash va minimal qoldiq ogohlantirishlari.
              </p>
              <ul className="text-xs space-y-2 text-slate-700 pt-2 border-t border-slate-200">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Shtrix-kod va SKU generatsiya</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Inventarizatsiya va hisobdan chiqarish</li>
              </ul>
            </div>

            {/* Pillar 3: Accounting 1/2 Shakl */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-teal-400 hover:shadow-lg transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Buxgalteriya & Moliya (1/2-Shakl)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Oʻzbekiston milliy hisoblar rejasi, Bosh kitob (General Ledger), 1-shakl Balans va 2-shakl Moliyaviy natijalar hisoboti.
              </p>
              <ul className="text-xs space-y-2 text-slate-700 pt-2 border-t border-slate-200">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Akt sverka avtomatik shakllantirish</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Koʻp valyutali kassa va bank hisoblari</li>
              </ul>
            </div>

            {/* Pillar 4: HRM & Payroll 12% */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-teal-400 hover:shadow-lg transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">HRM & Avtomat Oylik Maosh</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Xodimlar tabeli, davomat, taʼtil va kasallik varaqalari. Oʻzbekiston soliq qonunchiligi boʻyicha oylikni avtomatik hisoblash.
              </p>
              <ul className="text-xs space-y-2 text-slate-700 pt-2 border-t border-slate-200">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> JShODS 12%, Ijtimoiy soliq 12%, INPS 0.1%</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Avtomatik toʻlov vedomosti</li>
              </ul>
            </div>

            {/* Pillar 5: Telegram Management Bot */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-teal-400 hover:shadow-lg transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Telegram Boshqaruv Boti</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rahbar va taʼsischilar uchun kunlik moliyaviy tushum xulosasi, kassir smena Z-hisobotlari va tovar tugaganda tezkor signallar.
              </p>
              <ul className="text-xs space-y-2 text-slate-700 pt-2 border-t border-slate-200">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> 1 Bosishda ulanish (BotFather siz)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Har kechki 21:00 da sof foyda hisoboti</li>
              </ul>
            </div>

            {/* Pillar 6: E-IMZO & E-Faktura */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-teal-400 hover:shadow-lg transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">E-IMZO & Soliq E-Faktura</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Brauzerdan chiqmasdan E-IMZO (USB kalit) orqali shartnomalar, hisob-fakturalar va dalolatnomalarni raqamli imzolash.
              </p>
              <ul className="text-xs space-y-2 text-slate-700 pt-2 border-t border-slate-200">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Didox / Factura.uz bilan toʻliq moslik</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Ommaviy verifikatsiya QR-havolasi</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Plans */}
      <section id="pricing" className="py-20 bg-[#F0FBF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest">Oddiy va Shafof Tariflar</h2>
            <p className="text-3xl sm:text-4xl font-black text-[#0B2B33] tracking-tight">
              Biznesingiz Hajmiga Mos Reja Tanlang
            </p>
            <p className="text-slate-600 text-sm">
              Barcha tariflarda 14 kunlik bepul sinov muddati mavjud. Hech qanday yashirin toʻlovlar yoʻq.
            </p>

            {/* Billing cycle toggle */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>Oylik</span>
              <button
                type="button"
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="w-12 h-6 rounded-full bg-teal-700 p-1 flex items-center transition cursor-pointer"
              >
                <div className={`w-4 h-4 rounded-full bg-white transition transform ${billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <span className={`text-xs font-bold flex items-center gap-1 ${billingCycle === 'annual' ? 'text-slate-900' : 'text-slate-500'}`}>
                Yillik Toʻlov <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">2 Oy Bepul</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Starter Plan */}
            <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Boshlangʻich (Starter)</h3>
                <p className="text-xs text-slate-500">Kichik doʻkonlar va yangi boshlayotgan savdo nuqtalari uchun</p>
                <div className="pt-2">
                  <span className="text-3xl font-black text-slate-900">
                    {billingCycle === 'annual' ? '240,000' : '290,000'}
                  </span>
                  <span className="text-xs text-slate-500 font-bold ml-1">UZS / oy</span>
                </div>
                <ul className="text-xs space-y-2.5 text-slate-700 pt-4 border-t border-slate-100">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> 1 ta Savdo Nuqtasi & Ombor</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> POS Kassa & Termal Chek</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Telegram Boshqaruv Boti</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> 3 tagacha xodim hisobi</li>
                </ul>
              </div>
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsTrialModalOpen(true)}
                className="w-full font-bold border-slate-300 hover:bg-slate-50"
              >
                14 Kun Bepul Sinash
              </Button>
            </div>

            {/* Business Plan (Highlighted) */}
            <div className="p-8 bg-gradient-to-b from-white to-[#F0FBF8] rounded-3xl border-2 border-teal-600 shadow-xl flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white text-[11px] font-black uppercase px-3.5 py-1 rounded-full tracking-wider shadow-sm">
                Eng Ommabop
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Biznes (Business)</h3>
                <p className="text-xs text-slate-500">Ulgurji savdo, tarmoq doʻkonlar va oʻrta korxonalar uchun</p>
                <div className="pt-2">
                  <span className="text-3xl font-black text-teal-800">
                    {billingCycle === 'annual' ? '590,000' : '690,000'}
                  </span>
                  <span className="text-xs text-slate-500 font-bold ml-1">UZS / oy</span>
                </div>
                <ul className="text-xs space-y-2.5 text-slate-700 pt-4 border-t border-slate-100">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Cheksiz Omborlar & FIFO</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Buxgalteriya 1/2-shakl & Oborotka</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> E-IMZO va E-Faktura Hub</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> HRM Oylik & Tabel tizimi</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> 10 tagacha xodim hisobi</li>
                </ul>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsTrialModalOpen(true)}
                className="w-full font-bold bg-teal-700 hover:bg-teal-800 text-white shadow-md shadow-teal-700/20"
              >
                14 Kun Bepul Boshlash
              </Button>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Korporativ (Enterprise)</h3>
                <p className="text-xs text-slate-500">Yirik savdo tarmoqlari va ishlab chiqarish kompaniyalari uchun</p>
                <div className="pt-2">
                  <span className="text-3xl font-black text-slate-900">
                    {billingCycle === 'annual' ? '1,290,000' : '1,490,000'}
                  </span>
                  <span className="text-xs text-slate-500 font-bold ml-1">UZS / oy</span>
                </div>
                <ul className="text-xs space-y-2.5 text-slate-700 pt-4 border-t border-slate-100">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Barcha 28 ta modul cheksiz</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Bank API & 1C:ClientBank integratsiya</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Alohida Shaxsiy Menejer & 24/7 Support</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Cheksiz xodimlar va filiallar</li>
                </ul>
              </div>
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsTrialModalOpen(true)}
                className="w-full font-bold border-slate-300 hover:bg-slate-50"
              >
                Biz Bilan Bogʻlanish
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#0B2B33] text-white py-12 border-t border-teal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-teal-100/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-black">
              S
            </div>
            <span className="font-bold text-sm text-white">SAPAR Cloud ERP</span>
            <span>• Oʻzbekiston va Markaziy Osiyo Standartlari</span>
          </div>

          <div>
            © {new Date().getFullYear()} SAPAR. Barcha huquqlar himoyalangan.
          </div>
        </div>
      </footer>

      {/* Fast 1-Step Telegram Onboarding Modal */}
      {isTrialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#028090] to-[#02C39A] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-100" />
                <h3 className="text-sm font-bold">14 Kunlik Bepul Sinov — Tezkor Ulanish</h3>
              </div>
              <button
                type="button"
                onClick={resetAndClose}
                className="p-1 rounded-lg text-teal-100 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {trialSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Muvaffaqiyatli Roʻyxatdan Oʻtdingiz!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Korxonangiz uchun 14 kunlik bepul sinov hisobi faollashtirildi. Mutaxassislarimiz tez orada siz bilan Telegram orqali bogʻlanishadi yoki darhol demo hisobga kirishingiz mumkin.
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate('/login')}
                    className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold"
                  >
                    Tizimga Kirish (Demo Login)
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleTrialSubmit} className="p-6 space-y-4 bg-slate-50">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hech qanday bank kartasi talab qilinmaydi. Shunchaki korxona nomi va Telegramingizni kiriting:
                </p>

                <FormField label="Korxona yoki Doʻkoningiz Nomi *">
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Masalan: Samarqand Stroy Market"
                    className={controlClass}
                  />
                </FormField>

                <FormField label="Telegram Raqam yoki Username *">
                  <input
                    type="text"
                    required
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder="Masalan: +998901234567 yoki @hi_doston"
                    className={controlClass}
                  />
                </FormField>

                <FormField label="Ismingiz (Ixtiyoriy)">
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Masalan: Doston Aliyev"
                    className={controlClass}
                  />
                </FormField>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={submitting}
                    className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-teal-900/10"
                  >
                    <Zap className="w-4 h-4" />
                    {submitting ? 'Faollashtirilmoqda...' : '14 Kun Bepul Boshlash'}
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center pt-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Maʼlumotlaringiz xavfsiz va shifrlangan holda saqlanadi</span>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SaparLandingPage;
