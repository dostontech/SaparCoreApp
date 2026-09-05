import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  CreditCard,
  Banknote,
  QrCode,
  Calendar,
  CheckCircle2,
  Coins,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onCompletePayment: (paymentDetails: {
    paymentMethod: string;
    cashAmount: number;
    uzcardAmount: number;
    humoAmount: number;
    qrAmount: number;
    creditAmount: number;
  }) => void;
}

export const PosPaymentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  totalAmount,
  onCompletePayment,
}) => {
  const { format } = useCurrencyFormatter();

  const [activeTab, setActiveTab] = useState<'cash' | 'uzcard' | 'humo' | 'qr' | 'credit' | 'split'>('cash');
  const [cashTendered, setCashTendered] = useState<number>(totalAmount);

  // Split amounts
  const [splitCash, setSplitCash] = useState<number>(0);
  const [splitUzcard, setSplitUzcard] = useState<number>(0);
  const [splitHumo, setSplitHumo] = useState<number>(0);
  const [splitQr, setSplitQr] = useState<number>(0);
  const [splitCredit, setSplitCredit] = useState<number>(0);

  if (!isOpen) return null;

  const changeDue = Math.max(0, cashTendered - totalAmount);
  const splitTotal = splitCash + splitUzcard + splitHumo + splitQr + splitCredit;
  const splitRemaining = totalAmount - splitTotal;

  const handleAddCash = (amount: number) => {
    setCashTendered((prev) => prev + amount);
  };

  const handleSetExactCash = () => {
    setCashTendered(totalAmount);
  };

  const handleSubmit = () => {
    if (activeTab === 'cash') {
      onCompletePayment({
        paymentMethod: 'Naqd Pul',
        cashAmount: totalAmount,
        uzcardAmount: 0,
        humoAmount: 0,
        qrAmount: 0,
        creditAmount: 0,
      });
    } else if (activeTab === 'uzcard') {
      onCompletePayment({
        paymentMethod: 'Uzcard',
        cashAmount: 0,
        uzcardAmount: totalAmount,
        humoAmount: 0,
        qrAmount: 0,
        creditAmount: 0,
      });
    } else if (activeTab === 'humo') {
      onCompletePayment({
        paymentMethod: 'Humo',
        cashAmount: 0,
        uzcardAmount: 0,
        humoAmount: totalAmount,
        qrAmount: 0,
        creditAmount: 0,
      });
    } else if (activeTab === 'qr') {
      onCompletePayment({
        paymentMethod: 'UzQR (Yagona QR-kod)',
        cashAmount: 0,
        uzcardAmount: 0,
        humoAmount: 0,
        qrAmount: totalAmount,
        creditAmount: 0,
      });
    } else if (activeTab === 'credit') {
      onCompletePayment({
        paymentMethod: 'Nasiya (Muddatli Toʻlov)',
        cashAmount: 0,
        uzcardAmount: 0,
        humoAmount: 0,
        qrAmount: 0,
        creditAmount: totalAmount,
      });
    } else {
      // Split
      onCompletePayment({
        paymentMethod: 'Aralash Toʻlov (Split)',
        cashAmount: splitCash,
        uzcardAmount: splitUzcard,
        humoAmount: splitHumo,
        qrAmount: splitQr,
        creditAmount: splitCredit,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-xs text-teal-400 font-bold uppercase tracking-wider block">
              Toʻlovni Yakunlash
            </span>
            <h2 className="text-2xl font-black font-mono mt-0.5">
              {format(totalAmount)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Payment Methods Nav */}
        <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('cash')}
            className={`py-3 px-2 flex flex-col items-center gap-1 border-b-2 transition ${
              activeTab === 'cash'
                ? 'border-teal-600 text-teal-800 bg-white font-black'
                : 'border-transparent hover:bg-slate-100'
            }`}
          >
            <Banknote className="w-4 h-4 text-emerald-600" />
            Naqd
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('uzcard')}
            className={`py-3 px-2 flex flex-col items-center gap-1 border-b-2 transition ${
              activeTab === 'uzcard'
                ? 'border-teal-600 text-teal-800 bg-white font-black'
                : 'border-transparent hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4 text-blue-600" />
            Uzcard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('humo')}
            className={`py-3 px-2 flex flex-col items-center gap-1 border-b-2 transition ${
              activeTab === 'humo'
                ? 'border-teal-600 text-teal-800 bg-white font-black'
                : 'border-transparent hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4 text-amber-600" />
            Humo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-2 flex flex-col items-center gap-1 border-b-2 transition ${
              activeTab === 'qr'
                ? 'border-teal-600 text-teal-800 bg-white font-black'
                : 'border-transparent hover:bg-slate-100'
            }`}
          >
            <QrCode className="w-4 h-4 text-teal-600" />
            UzQR / QR
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('credit')}
            className={`py-3 px-2 flex flex-col items-center gap-1 border-b-2 transition ${
              activeTab === 'credit'
                ? 'border-teal-600 text-teal-800 bg-white font-black'
                : 'border-transparent hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4 text-purple-600" />
            Nasiya
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`py-3 px-2 flex flex-col items-center gap-1 border-b-2 transition ${
              activeTab === 'split'
                ? 'border-teal-600 text-teal-800 bg-white font-black'
                : 'border-transparent hover:bg-slate-100'
            }`}
          >
            <Coins className="w-4 h-4 text-indigo-600" />
            Aralash
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {activeTab === 'cash' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Mijozdan olingan naqd pul (soʻm):
                </label>
                <input
                  type="number"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(Number(e.target.value))}
                  className="w-full text-2xl font-black font-mono px-4 py-3 border-2 border-teal-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 bg-teal-50/20"
                />
              </div>

              {/* Quick Cash Add Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={handleSetExactCash}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-800 border border-slate-300"
                >
                  Aniq Summa
                </button>
                <button
                  type="button"
                  onClick={() => handleAddCash(10000)}
                  className="py-2 px-3 bg-teal-50 hover:bg-teal-100 rounded-xl text-xs font-bold text-teal-800 border border-teal-200 font-mono"
                >
                  +10 000
                </button>
                <button
                  type="button"
                  onClick={() => handleAddCash(50000)}
                  className="py-2 px-3 bg-teal-50 hover:bg-teal-100 rounded-xl text-xs font-bold text-teal-800 border border-teal-200 font-mono"
                >
                  +50 000
                </button>
                <button
                  type="button"
                  onClick={() => handleAddCash(100000)}
                  className="py-2 px-3 bg-teal-50 hover:bg-teal-100 rounded-xl text-xs font-bold text-teal-800 border border-teal-200 font-mono"
                >
                  +100 000
                </button>
                <button
                  type="button"
                  onClick={() => handleAddCash(200000)}
                  className="py-2 px-3 bg-teal-50 hover:bg-teal-100 rounded-xl text-xs font-bold text-teal-800 border border-teal-200 font-mono"
                >
                  +200 000
                </button>
              </div>

              {/* Change (Qaytim) Display */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase">
                  Qaytariladigan Qaytim (Change):
                </span>
                <span className="text-2xl font-black font-mono text-emerald-700">
                  {format(changeDue)}
                </span>
              </div>
            </div>
          )}

          {(activeTab === 'uzcard' || activeTab === 'humo') && (
            <div className="p-6 rounded-2xl bg-blue-50/60 border border-blue-200 text-center space-y-3">
              <CreditCard className="w-10 h-10 text-blue-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">
                {activeTab === 'uzcard' ? 'Uzcard' : 'Humo'} Bank Kartasi Orqali Toʻlov
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Bank POS terminaliga <span className="font-bold text-slate-900 font-mono">{format(totalAmount)}</span> summasi kiritildi. Kartani terminalga tekkizing.
              </p>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="p-6 rounded-3xl bg-gradient-to-b from-teal-50/70 to-white border border-teal-200 text-center space-y-4 shadow-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-[11px] font-black uppercase tracking-wider">
                <span>🇺🇿</span>
                <span>UzQR — Yagona Milliy Toʻlov Kodi</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Mijoz Ilovasi Bilan Skanerlang
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Mijoz oʻzining xohlagan bank ilovasi (Ipak Yoʻli, Anorbank, Kapitalbank, TBC, Payme, Click, Uzum) orqali toʻlaydi.
              </p>

              <div className="inline-block p-4 bg-white rounded-3xl border-2 border-teal-600 shadow-md">
                <QRCodeSVG
                  value={`uzqr://pay?m=UZQR-MERCHANT-7788&t=TERM-001&a=${totalAmount}&ref=POS-${Date.now()}&cur=860`}
                  size={144}
                  level="M"
                />
              </div>

              <div className="space-y-1">
                <div className="text-lg font-black font-mono text-teal-700">
                  {format(totalAmount)}
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs text-teal-800 font-semibold bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                  Mijoz toʻlashi kutilmoqda (Avtomatik tasdiqlash)...
                </div>
              </div>
            </div>
          )}

          {activeTab === 'credit' && (
            <div className="p-6 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                <Calendar className="w-5 h-5" /> Nasiya (Muddatli Toʻlov / Qarz)
              </div>
              <p className="text-xs text-slate-600">
                Savdo summasi mijozning hisobidagi debitorlik qarziga yoziladi.
              </p>
            </div>
          )}

          {activeTab === 'split' && (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between font-bold text-slate-700 pb-1 border-b">
                <span>Toʻlov Turi</span>
                <span>Summa (soʻm)</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-slate-700">Naqd Pul:</span>
                <input
                  type="number"
                  value={splitCash}
                  onChange={(e) => setSplitCash(Number(e.target.value))}
                  className="w-36 text-right font-mono font-bold px-2 py-1.5 border rounded-lg"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-slate-700">Uzcard:</span>
                <input
                  type="number"
                  value={splitUzcard}
                  onChange={(e) => setSplitUzcard(Number(e.target.value))}
                  className="w-36 text-right font-mono font-bold px-2 py-1.5 border rounded-lg"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-slate-700">Humo:</span>
                <input
                  type="number"
                  value={splitHumo}
                  onChange={(e) => setSplitHumo(Number(e.target.value))}
                  className="w-36 text-right font-mono font-bold px-2 py-1.5 border rounded-lg"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-slate-700">UzQR / QR:</span>
                <input
                  type="number"
                  value={splitQr}
                  onChange={(e) => setSplitQr(Number(e.target.value))}
                  className="w-36 text-right font-mono font-bold px-2 py-1.5 border rounded-lg"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-slate-700">Nasiya (Qarz):</span>
                <input
                  type="number"
                  value={splitCredit}
                  onChange={(e) => setSplitCredit(Number(e.target.value))}
                  className="w-36 text-right font-mono font-bold px-2 py-1.5 border rounded-lg"
                />
              </div>

              <div className="pt-2 border-t flex justify-between font-bold text-xs">
                <span>Kiritilgan: {format(splitTotal)}</span>
                <span className={splitRemaining === 0 ? 'text-emerald-700' : 'text-red-700'}>
                  Qoldiq: {format(splitRemaining)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            Bekor Qilish
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={activeTab === 'split' && splitRemaining !== 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Toʻlovni Yakunlash (Enter)
          </Button>
        </div>
      </div>
    </div>
  );
};
