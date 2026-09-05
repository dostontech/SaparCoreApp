import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  FileCheck2,
  Usb,
  Bluetooth,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import { EscposThermalService } from '@/services/escposThermalService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  receiptData: any | null;
}

export const ThermalReceiptModal: React.FC<Props> = ({
  isOpen,
  onClose,
  receiptData,
}) => {
  const { format } = useCurrencyFormatter();
  const printRef = useRef<HTMLDivElement>(null);
  const [paperWidth, setPaperWidth] = useState<58 | 80>(80);
  const [printingUsb, setPrintingUsb] = useState(false);
  const [printingBt, setPrintingBt] = useState(false);

  if (!isOpen || !receiptData) return null;

  const handlePrintBrowser = () => {
    window.print();
  };

  const handlePrintWebUsb = async () => {
    setPrintingUsb(true);
    try {
      const res = await EscposThermalService.printWebUSB(receiptData, paperWidth);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } finally {
      setPrintingUsb(false);
    }
  };

  const handlePrintBluetooth = async () => {
    setPrintingBt(true);
    try {
      const res = await EscposThermalService.printBluetooth(receiptData, paperWidth);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } finally {
      setPrintingBt(false);
    }
  };

  const soliqQrUrl = receiptData.qrUrl || `https://ofd.soliq.uz/check?t=${receiptData.receiptId}&s=${receiptData.total}&d=${encodeURIComponent(receiptData.createdAt)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-teal-400" />
            <h2 className="text-sm font-bold text-white">Savdo Yakunlandi — Fiskal Chek</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Paper Switcher */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Format:</span>
            <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setPaperWidth(58)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition ${paperWidth === 58 ? 'bg-teal-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                58 mm
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth(80)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition ${paperWidth === 80 ? 'bg-teal-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                80 mm
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintWebUsb}
              disabled={printingUsb}
              className="flex items-center gap-1 text-xs"
              title="WebUSB orqali toʻgʻridan-toʻgʻri dialogsiz chop etish"
            >
              <Usb className="w-3.5 h-3.5 text-teal-600" />
              {printingUsb ? 'Ulanmoqda...' : 'USB Print'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintBluetooth}
              disabled={printingBt}
              className="flex items-center gap-1 text-xs"
              title="Bluetooth printer orqali chop etish"
            >
              <Bluetooth className="w-3.5 h-3.5 text-blue-600" />
              {printingBt ? 'Ulanmoqda...' : 'BT Print'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrintBrowser}
              className="flex items-center gap-1 text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Chop Etish
            </Button>
          </div>
        </div>

        {/* Thermal Receipt Content */}
        <div className="p-6 overflow-y-auto bg-slate-50 flex justify-center flex-1">
          <div
            ref={printRef}
            className={`bg-white p-5 rounded-xl border border-slate-300 shadow-sm text-slate-900 font-mono text-[11px] space-y-3 print:border-none print:shadow-none print:w-full ${paperWidth === 58 ? 'w-64' : 'w-80'}`}
          >
            {/* Header */}
            <div className="text-center border-b border-dashed border-slate-400 pb-3 space-y-0.5">
              <h3 className="font-black text-sm uppercase tracking-tight">
                {receiptData.company?.name || 'SAPAR RETAIL'}
              </h3>
              <p className="text-[10px] text-slate-600">STIR (ИНН): {receiptData.company?.tin || '308123456'}</p>
              <p className="text-[10px] text-slate-500">{receiptData.company?.address || 'Toshkent sh., Chilonzor tumani'}</p>
              <div className="pt-1 text-[10px] font-bold text-slate-700">
                CHEK № {receiptData.receiptId}
              </div>
              <div className="text-[9px] text-slate-500">
                Sana: {new Date(receiptData.createdAt).toLocaleString('uz-UZ')}
              </div>
              {receiptData.cashierName && (
                <div className="text-[9px] text-slate-600 font-semibold">
                  Kassir: {receiptData.cashierName}
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="space-y-1.5 border-b border-dashed border-slate-400 pb-3">
              <div className="flex justify-between font-bold text-[10px] text-slate-500 uppercase">
                <span>NOMI / MIQDOR</span>
                <span>SUMMA</span>
              </div>
              {receiptData.items?.map((it: any, idx: number) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold text-slate-900">{it.name}</div>
                  {it.ikpu && (
                    <div className="text-[9px] text-slate-500">MXIK: {it.ikpu}</div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>
                      {it.quantity} x {format(it.price)}
                    </span>
                    <span className="font-bold text-slate-900">
                      {format(it.quantity * it.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 border-b border-dashed border-slate-400 pb-3">
              <div className="flex justify-between text-slate-600">
                <span>Oraliq jami:</span>
                <span>{format(receiptData.subtotal)}</span>
              </div>
              {receiptData.discountAmount > 0 && (
                <div className="flex justify-between text-teal-700 font-bold">
                  <span>Chegirma:</span>
                  <span>-{format(receiptData.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 text-[10px]">
                <span>QQS (12% ichida):</span>
                <span>{format(receiptData.vatAmount || (receiptData.total * 12) / 112)}</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-1 text-slate-900 border-t border-slate-200">
                <span>JAMI TOʻLOV:</span>
                <span>{format(receiptData.total)}</span>
              </div>
            </div>

            {/* Payment Method Details */}
            <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-400 pb-3">
              <div className="flex justify-between">
                <span>Toʻlov usuli:</span>
                <span className="font-bold">{receiptData.payments?.method || 'Naqd pul'}</span>
              </div>
              {receiptData.payments?.cash > 0 && (
                <div className="flex justify-between">
                  <span>Naqd pul:</span>
                  <span>{format(receiptData.payments.cash)}</span>
                </div>
              )}
              {receiptData.payments?.uzcard > 0 && (
                <div className="flex justify-between">
                  <span>Uzcard:</span>
                  <span>{format(receiptData.payments.uzcard)}</span>
                </div>
              )}
              {receiptData.payments?.humo > 0 && (
                <div className="flex justify-between">
                  <span>Humo:</span>
                  <span>{format(receiptData.payments.humo)}</span>
                </div>
              )}
              {receiptData.payments?.qr > 0 && (
                <div className="flex justify-between">
                  <span>Payme/Click:</span>
                  <span>{format(receiptData.payments.qr)}</span>
                </div>
              )}
            </div>

            {/* Soliq Fiscal QR Code & Sign */}
            <div className="text-center pt-2 space-y-1.5">
              <a
                href={soliqQrUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition"
                title="Soliq OFD bazasida chekni tekshirish"
              >
                <div className="w-24 h-24 bg-white border border-slate-300 flex flex-col items-center justify-center text-[8px] rounded mx-auto font-mono text-slate-600 p-1">
                  <span className="font-bold text-slate-900 text-[9px]">SOLIQ OFD QR</span>
                  <span className="truncate max-w-[80px] text-[7px]">{receiptData.receiptId}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1" />
                </div>
              </a>
              <div className="text-[9px] text-slate-500 font-mono">
                FPU / FM: {receiptData.fiscalSign || 'FP78912401'}
              </div>
              <div className="text-[9px] text-slate-400">
                Xaridingiz uchun rahmat!
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Yopish (ESC)
          </Button>
        </div>
      </div>
    </div>
  );
};
