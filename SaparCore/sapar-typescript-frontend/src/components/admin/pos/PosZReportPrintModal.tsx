import React from 'react';
import { Printer, X, Receipt, CheckCircle2, Building2 } from 'lucide-react';
import { Button } from '@components/ui';

interface PosZReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftData?: {
    id: string;
    cashierName: string;
    registerName: string;
    branchName: string;
    openedAt: string;
    closedAt?: string;
    startingCash: number;
    cashSales: number;
    cardSales: number;
    creditSales: number;
    expenses: number;
    ordersCount: number;
  };
}

export const PosZReportPrintModal: React.FC<PosZReportPrintModalProps> = ({
  isOpen,
  onClose,
  shiftData = {
    id: 'Z-1049',
    cashierName: 'Azizbek Toshmatov',
    registerName: 'Kassa №1 (Asosiy zal)',
    branchName: 'Bosh Ofis & Showroom',
    openedAt: new Date(Date.now() - 8 * 3600000).toLocaleString('uz-UZ'),
    closedAt: new Date().toLocaleString('uz-UZ'),
    startingCash: 500000,
    cashSales: 3450000,
    cardSales: 5120000,
    creditSales: 850000,
    expenses: 400000,
    ordersCount: 48,
  },
}) => {
  if (!isOpen) return null;

  const totalSales = shiftData.cashSales + shiftData.cardSales + shiftData.creditSales;
  const expectedCashInDrawer = shiftData.startingCash + shiftData.cashSales - shiftData.expenses;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0B2B33] to-[#0D3B46] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#02C39A] text-[#0B2B33] flex items-center justify-center font-black shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Smena Z-Hisoboti</h3>
              <p className="text-[11px] text-[#02C39A]">58mm / 80mm Kassa printeri uchun fiskal chek</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal Receipt Visual Preview */}
        <div className="p-6 overflow-y-auto bg-slate-100 flex justify-center">
          <div className="bg-white w-[300px] p-4 rounded-xl shadow border border-slate-300 font-mono text-[11px] text-slate-900 space-y-2 leading-tight">
            {/* Store details */}
            <div className="text-center space-y-0.5 border-b border-dashed border-slate-400 pb-2">
              <div className="font-bold text-xs uppercase">OOO "RIZOBAY STROY"</div>
              <div className="text-[10px] text-slate-600">STIR / ИНН: 309124567</div>
              <div className="text-[10px] text-slate-600">{shiftData.branchName}</div>
              <div className="font-black text-xs pt-1 uppercase tracking-wider">
                *** Z-HISOBOT №{shiftData.id} ***
              </div>
            </div>

            {/* Shift info */}
            <div className="space-y-1 py-1 border-b border-dashed border-slate-400 text-[10px]">
              <div className="flex justify-between">
                <span>Kassir:</span>
                <span className="font-bold">{shiftData.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Kassa apparati:</span>
                <span>{shiftData.registerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Ochilgan:</span>
                <span>{shiftData.openedAt}</span>
              </div>
              <div className="flex justify-between">
                <span>Yopilgan:</span>
                <span>{shiftData.closedAt}</span>
              </div>
              <div className="flex justify-between">
                <span>Cheklar soni:</span>
                <span className="font-bold">{shiftData.ordersCount} ta</span>
              </div>
            </div>

            {/* Financial Totals */}
            <div className="space-y-1 py-1 text-[11px]">
              <div className="flex justify-between">
                <span>Boshlangʻich naqd pul:</span>
                <span>{shiftData.startingCash.toLocaleString()} soʻm</span>
              </div>
              <div className="flex justify-between">
                <span>Naqd pul tushumi:</span>
                <span className="font-bold">+{shiftData.cashSales.toLocaleString()} soʻm</span>
              </div>
              <div className="flex justify-between">
                <span>Uzcard / Humo (Terminal):</span>
                <span className="font-bold">+{shiftData.cardSales.toLocaleString()} soʻm</span>
              </div>
              <div className="flex justify-between">
                <span>Nasiya (Qarzga):</span>
                <span>+{shiftData.creditSales.toLocaleString()} soʻm</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Xarajat / Inkassatsiya:</span>
                <span>-{shiftData.expenses.toLocaleString()} soʻm</span>
              </div>
            </div>

            {/* Final Balance */}
            <div className="border-t-2 border-dashed border-slate-900 pt-2 space-y-1">
              <div className="flex justify-between font-bold text-xs">
                <span>JAMI TUSHUM:</span>
                <span>{totalSales.toLocaleString()} soʻm</span>
              </div>
              <div className="flex justify-between font-black text-xs text-[#028090] bg-slate-50 p-1 rounded">
                <span>KASSADA KUTILAYOTGAN NAQD:</span>
                <span>{expectedCashInDrawer.toLocaleString()} soʻm</span>
              </div>
            </div>

            {/* Fiscal Footer */}
            <div className="text-center pt-3 space-y-1 text-[9px] text-slate-500 border-t border-dashed border-slate-400">
              <div>ONLINE-KASSA FISKAL XOTIRA</div>
              <div>DSQ SOLIQ.UZ BILAN SINXRONLASHGAN</div>
              <div className="tracking-widest font-bold text-[8px]">══════════════════════</div>
              <div className="text-slate-400">Rahmat! Smena muvaffaqiyatli yopildi.</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <Button variant="outline" onClick={onClose} className="text-xs font-bold border-slate-300 cursor-pointer">
            Yopish
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-[#028090] hover:bg-[#026c7a] text-white font-bold text-xs px-5 py-2.5 shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Chekni Chop Etish</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PosZReportPrintModal;
