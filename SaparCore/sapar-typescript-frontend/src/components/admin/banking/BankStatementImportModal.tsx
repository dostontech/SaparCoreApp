import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownLeft, Landmark, X, ShieldCheck } from 'lucide-react';
import { Button } from '@components/ui';
import { toast } from 'sonner';

interface BankStatementImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

interface ParsedTransaction {
  id: string;
  date: string;
  docNum: string;
  counterparty: string;
  counterpartyStir: string;
  amount: number;
  type: 'incoming' | 'outgoing';
  purpose: string;
  matchedStatus: 'Avtomat bogʻlandi' | 'Yangi toʻlov';
}

export const BankStatementImportModal: React.FC<BankStatementImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<{
    bankName: string;
    account: string;
    mfo: string;
    period: string;
    openingBalance: number;
    closingBalance: number;
    transactions: ParsedTransaction[];
  } | null>(null);

  if (!isOpen) return null;

  const handleSimulateUpload = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setParsedData({
        bankName: 'Ipak Yoʻli Bank AITB (MFO: 00440)',
        account: '20208000900123456001',
        mfo: '00440',
        period: '01.09.2026 — 03.09.2026',
        openingBalance: 42500000,
        closingBalance: 68750000,
        transactions: [
          {
            id: 'TX-901',
            date: '03.09.2026',
            docNum: '149',
            counterparty: 'OOO "TOSHKENT METALL SERVICE"',
            counterpartyStir: '307882109',
            amount: 18500000,
            type: 'incoming',
            purpose: 'Hisob-faktura №SF-1049 uchun toʻlov (Armatura 14mm)',
            matchedStatus: 'Avtomat bogʻlandi',
          },
          {
            id: 'TX-902',
            date: '02.09.2026',
            docNum: '88',
            counterparty: 'YaTT Karimov Sherzod Rustamovich',
            counterpartyStir: '51204958310029',
            amount: 12250000,
            type: 'incoming',
            purpose: 'Shartnoma №42 boʻyicha boʻyoq mahsulotlari uchun toʻlov',
            matchedStatus: 'Avtomat bogʻlandi',
          },
          {
            id: 'TX-903',
            date: '02.09.2026',
            docNum: '304',
            counterparty: 'Toshkent shahar DSQ (Soliq boshqarmasi)',
            counterpartyStir: '201122919',
            amount: 4500000,
            type: 'outgoing',
            purpose: 'QQS 12% boʻyicha oylik soliq toʻlovi',
            matchedStatus: 'Yangi toʻlov',
          },
        ],
      });
      setIsProcessing(false);
      toast.success('1C:ClientBank koʻchirmasi tahlil qilindi (3 ta toʻlov topshiriqnomasi topildi)');
    }, 600);
  };

  const handleConfirmImport = () => {
    toast.success('Bank koʻchirmasi import qilindi va buxgalteriya provodkalari shakllantirildi!');
    if (onImportSuccess) onImportSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0B2B33] to-[#0D3B46] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#02C39A] text-[#0B2B33] flex items-center justify-center font-black shadow-xs">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">1C:ClientBank Koʻchirma Importi</h3>
              <p className="text-[11px] text-[#02C39A]">Oʻzbekiston banklari (.txt / .xml) toʻlov topshiriqnomalarini avtomat yuklash</p>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!parsedData ? (
            /* Upload Zone */
            <div className="space-y-4">
              <div
                onClick={handleSimulateUpload}
                className="border-2 border-dashed border-teal-300 hover:border-[#028090] bg-teal-50/40 hover:bg-teal-50/80 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-100 group-hover:bg-[#028090] group-hover:text-white text-[#028090] flex items-center justify-center transition">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Bank koʻchirmasi faylini tanlang yoki shu yerga tashlang
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Format: <strong>kl_to_1c.txt</strong> yoki <strong>1C:ClientBank .xml</strong> (Ipak Yoʻli, Kapitalbank, Agrobank, Hamkorbank)
                  </p>
                </div>
                <span className="px-3 py-1 bg-white border border-teal-200 text-teal-800 rounded-full text-xs font-bold shadow-xs">
                  Namuna faylni ochish (Demo)
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#028090]" />
                  <span>Qanday ishlaydi?</span>
                </div>
                <p>
                  1. Internet-banking (Ipak Yoʻli, Kapitalbank, Agrobank va b.) tizimingizdan kunlik yoki oylik koʻchirmani <strong>«1C uchun eksport»</strong> formatida yuklab olasiz.
                </p>
                <p>
                  2. SAPAR barcha kiruvchi toʻlovlarni STIR va hisob-raqam boʻyicha mijozlaringiz bilan solishtiradi va hisob-fakturalarga avtomatik bogʻlaydi.
                </p>
              </div>
            </div>
          ) : (
            /* Parsed Summary & Table */
            <div className="space-y-4">
              {/* Bank & Account Info Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap justify-between items-center gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{parsedData.bankName}</div>
                  <div className="font-mono text-slate-600 mt-0.5">H/R: {parsedData.account}</div>
                  <div className="text-[11px] text-teal-700 font-semibold">Davr: {parsedData.period}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-500">Yakuniy hisob qoldigʻi:</div>
                  <div className="text-base font-black text-emerald-600 font-mono">
                    {parsedData.closingBalance.toLocaleString()} soʻm
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Tahlil Qilingan Toʻlov Topshiriqnomalari ({parsedData.transactions.length})
                </h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                  {parsedData.transactions.map((tx) => (
                    <div key={tx.id} className="p-3 hover:bg-slate-50 transition flex items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            tx.type === 'incoming' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {tx.type === 'incoming' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 truncate">{tx.counterparty}</span>
                            <span className="font-mono text-[10px] bg-slate-100 px-1 rounded text-slate-500">
                              STIR: {tx.counterpartyStir}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">{tx.purpose}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            №{tx.docNum} • {tx.date}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div
                          className={`font-mono font-bold ${
                            tx.type === 'incoming' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {tx.type === 'incoming' ? '+' : '-'}{tx.amount.toLocaleString()} soʻm
                        </div>
                        <span className="text-[10px] font-semibold text-[#028090] bg-teal-50 px-1.5 py-0.5 rounded-md mt-0.5 inline-block">
                          {tx.matchedStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <Button variant="outline" onClick={onClose} className="text-xs font-bold border-slate-300 cursor-pointer">
            Bekor qilish
          </Button>
          {parsedData && (
            <Button
              onClick={handleConfirmImport}
              className="bg-[#02C39A] hover:bg-[#02a683] text-[#0B2B33] font-black text-xs px-5 py-2.5 shadow-md flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Provodkalarni Tasdiqlash va Import</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankStatementImportModal;
