import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  BookOpen,
  KeyRound,
  FileCheck2,
  ShoppingCart,
  Warehouse,
  Receipt,
  Download,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Headphones,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@components/ui';

export const SaparGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'quickstart' | 'eimzo' | 'pos' | 'accounting'>('quickstart');

  return (
    <div className="max-w-6xl mx-auto font-sans text-slate-800 pb-20 space-y-6 animate-fade-in text-xs">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0B2B33] via-[#0D3842] to-[#028090] text-white p-6 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#02C39A] text-[#0B2B33] uppercase tracking-wider">
              Qoʻllanma & Yoʻriqnoma
            </span>
            <span className="text-slate-300 text-xs">Versiya 2.9 • Oʻzbekiston</span>
          </div>
          <h1 className="text-2xl font-black text-white">SAPAR ERP Foydalanuvchi Qoʻllanmasi</h1>
          <p className="text-slate-200 text-xs mt-1 max-w-2xl">
            Tizimdan toʻliq va samarali foydalanish: E-IMZO integratsiyasi, Soliq E-Faktura, POS kassa,
            ombor va 21-BHMS buxgalteriya hisobotlarini yuritish boʻyicha qadam-baqadam koʻrsatmalar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => window.open('https://t.me/sapar_support_bot', '_blank')}
            className="bg-[#02C39A] hover:bg-[#02A683] text-[#0B2B33] font-black text-xs shadow-xs"
          >
            <Headphones className="w-4 h-4 mr-1.5" /> Tezkor Yordam (Telegram)
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('quickstart')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'quickstart'
              ? 'border-[#028090] text-[#028090]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Boshlash va Asosiy Boʻlimlar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('eimzo')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'eimzo'
              ? 'border-[#028090] text-[#028090]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <KeyRound className="w-4 h-4" /> E-IMZO & E-Faktura (Didox)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pos')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'pos'
              ? 'border-[#028090] text-[#028090]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShoppingCart className="w-4 h-4" /> POS Kassa & Fiskal Cheklar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('accounting')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'accounting'
              ? 'border-[#028090] text-[#028090]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Receipt className="w-4 h-4" /> 21-BHMS Balans & Soliq Hisoboti
        </button>
      </div>

      {/* Content */}
      {activeTab === 'quickstart' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#028090]/15 text-[#028090] flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-sm text-[#0B2B33]">Tovarlarni Kirim Qilish</h3>
            <p className="text-slate-600 leading-relaxed text-xs">
              "Mahsulotlar" boʻlimiga kirib yangi tovar yarating yoki Excel orqali ommaviy yuklang. Har bir tovar uchun
              MXIK/IKPU kodi va shtrix-kod avtomatik biriktiriladi.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/products')}
              className="text-[#028090] border-[#028090]/30 hover:bg-[#F0FBF8] text-xs font-bold"
            >
              Mahsulotlarga oʻtish →
            </Button>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#02C39A]/20 text-[#028090] flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-sm text-[#0B2B33]">Kassir Smenasi & Savdo</h3>
            <p className="text-slate-600 leading-relaxed text-xs">
              Kassir har kuni "POS oyna" orqali smenani ochadi. Savdo amalga oshirilganda naqd, Uzcard/Humo, Click
              yoki nasiya toʻlovlari kiritilib, Soliq QR-kodli chek chiqariladi.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/pos')}
              className="text-[#028090] border-[#028090]/30 hover:bg-[#F0FBF8] text-xs font-bold"
            >
              POS Kassani ochish →
            </Button>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-sm text-[#0B2B33]">Mijozlar & Akt Sverki</h3>
            <p className="text-slate-600 leading-relaxed text-xs">
              Mijozlar boʻlimida har bir kontragent balansi, nasiya qarzdorligi va toʻlovlar tarixi yuritiladi.
              Rasmiy Akt Sverki 1 bosishda PDF qilinadi va E-IMZO bilan imzolanadi.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/contacts')}
              className="text-[#028090] border-[#028090]/30 hover:bg-[#F0FBF8] text-xs font-bold"
            >
              Mijozlar bazasiga oʻtish →
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'eimzo' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#0B2B33] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#028090]" />
            E-IMZO Davlat Kaliti va Didox Integratsiyasi
          </h2>
          <p className="text-slate-600 leading-relaxed">
            SAPAR ERP tizimi Oʻzbekiston Respublikasi Davlat Soliq Qoʻmitasining rasmiy E-IMZO moduli bilan toʻgʻridan-toʻgʻri
            ishlaydi. Tizimdan chiqmagan holda barcha hisob-fakturalar va aktlarni imzolashingiz mumkin.
          </p>
          <div className="p-4 rounded-lg bg-[#F0FBF8] border border-[#028090]/20 space-y-2">
            <p className="font-bold text-[#0B2B33]">E-IMZO oʻrnatish boʻyicha qisqa koʻrsatma:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li>Kompyuteringizda <a href="https://e-imzo.soliq.uz" target="_blank" rel="noreferrer" className="text-[#028090] underline font-bold">e-imzo.soliq.uz</a> dasturi oʻrnatilgan va ishga tushirilgan boʻlishi lozim (port: 127.0.0.1:64443).</li>
              <li>USB fleshka yoki kompyuterdagi `.pfx` kalit faylingiz tanlanganda parol kiritiladi.</li>
              <li>Faktura Didox yoki Factura.uz tizimiga PKCS#7 formatida avtomatik yuboriladi.</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'pos' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#0B2B33] flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#02C39A]" />
            POS Kassa va Fiskal Cheklar Qoʻllanmasi
          </h2>
          <div className="space-y-3 text-slate-700 leading-relaxed">
            <p>
              <strong>Fiskal chek:</strong> Har bir yakunlangan savdodan soʻng 58mm yoki 80mm formatdagi chek ekranga chiqadi.
              Unda Soliq qoʻmitasining rasmiy OFD QR-kodi mavjud boʻlib, xaridor 1% keshbek olishi mumkin.
            </p>
            <p>
              <strong>Tezkor tugmalar (Hotkeys):</strong>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-100 border">F8: Naqd toʻlov</div>
              <div className="p-2 rounded bg-slate-100 border">F9: Karta (Uzcard/Humo)</div>
              <div className="p-2 rounded bg-slate-100 border">F10: Click / Payme QR</div>
              <div className="p-2 rounded bg-slate-100 border">F7: Nasiya (Qarzga yozish)</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'accounting' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#0B2B33] flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#028090]" />
            21-son BHMS Buxgalteriya Hisobotlari
          </h2>
          <p className="text-slate-600 leading-relaxed">
            SAPAR ERP da barcha amallar (tovar kirimi, sotuv, hisobdan chiqarish, toʻlov) avtomatik ravishda
            Oʻzbekiston hisoblar rejasi boʻyicha ikki tomonlama provodka hosil qiladi:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <p className="font-bold text-slate-800">1-Shakl (Buxgalteriya Balansi)</p>
              <p className="text-slate-500 mt-1">Aktivlar, passivlar va oʻz sarmoyasi qoldigʻi boʻyicha rasmiy davlat formasi.</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <p className="font-bold text-slate-800">2-Shakl (Moliyaviy Natijalar - P&L)</p>
              <p className="text-slate-500 mt-1">Sof tushum, sotilgan tovarlar tannarxi (FIFO) va davr xarajatlari.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaparGuidePage;
