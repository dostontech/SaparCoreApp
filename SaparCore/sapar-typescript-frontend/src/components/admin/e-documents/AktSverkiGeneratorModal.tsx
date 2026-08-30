import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  Calendar,
  Building2,
  Plus,
  Trash2,
  Calculator,
  ShieldCheck,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button, FormField } from '@components/ui';
import Constants from '@constants/api';

interface AktSverkiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDoc: any) => void;
}

export const AktSverkiGeneratorModal: React.FC<AktSverkiGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const token = localStorage.getItem('token') || '';

  const [counterpartyName, setCounterpartyName] = useState('SAMARQAND LOGISTIKA SERVIS MCHJ');
  const [counterpartyTin, setCounterpartyTin] = useState('309876543');
  const [counterpartyPinfl, setCounterpartyPinfl] = useState('41209840190012');
  const [counterpartyAddress, setCounterpartyAddress] = useState('Samarqand shahri, Registon koʻchasi 45');
  const [counterpartyBankAccount, setCounterpartyBankAccount] = useState('20208000400900800700');
  const [counterpartyBankMfo, setCounterpartyBankMfo] = useState('00876');
  const [counterpartyDirector, setCounterpartyDirector] = useState('Toshev Bobur Ilhomovich');

  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().substring(0, 10));
  const [openingBalance, setOpeningBalance] = useState<number>(0);

  const [ledgerLines, setLedgerLines] = useState<any[]>([
    {
      date: '2025-01-15',
      docType: 'Hisob-faktura',
      docNumber: 'HF-2025/014',
      description: 'SAPAR ERP Bazaviy oʻrnatish',
      debit: 20000000,
      credit: 0,
    },
    {
      date: '2025-02-10',
      docType: 'Toʻlov topshirigʻi',
      docNumber: 'TT-409',
      description: '42-SH shartnoma boʻyicha toʻlov',
      debit: 0,
      credit: 15000000,
    },
  ]);

  const [newLine, setNewLine] = useState({
    date: new Date().toISOString().substring(0, 10),
    docType: 'Hisob-faktura',
    docNumber: '',
    description: '',
    debit: 0,
    credit: 0,
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddLine = () => {
    if (!newLine.docNumber || !newLine.description) {
      toast.error('Hujjat raqami va izohini kiriting');
      return;
    }
    setLedgerLines([...ledgerLines, { ...newLine }]);
    setNewLine({
      date: new Date().toISOString().substring(0, 10),
      docType: 'Hisob-faktura',
      docNumber: '',
      description: '',
      debit: 0,
      credit: 0,
    });
  };

  const handleRemoveLine = (index: number) => {
    setLedgerLines(ledgerLines.filter((_, idx) => idx !== index));
  };

  const totalDebit = ledgerLines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
  const totalCredit = ledgerLines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);
  const closingBalance = Number(openingBalance) + totalDebit - totalCredit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterpartyName || !counterpartyTin) {
      toast.error('Kontragent nomi va STIR raqamini toʻldiring');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${Constants.BASE_URL}/admin/e-documents/generate/akt-sverki`,
        {
          counterpartyName,
          counterpartyTin,
          counterpartyPinfl,
          counterpartyAddress,
          counterpartyBankAccount,
          counterpartyBankMfo,
          counterpartyDirector,
          startDate,
          endDate,
          openingBalance,
          customLedgerLines: ledgerLines,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(res.data.message || 'Akt sverki muvaffaqiyatli shakllantirildi');
        onSuccess(res.data.data.document);
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Akt sverki yaratishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-surface border border-border rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-heading">
                Solishtirma Dalolatnoma (Акт сверки) Yaratish
              </h2>
              <p className="text-xs text-body">
                Kontragent bilan oʻzaro hisob-kitoblarni solishtirish va E-IMZO bilan imzolash
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-body hover:text-heading hover:bg-muted/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Counterparty Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-heading uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-primary" /> 1. Kontragent (Mijoz / Taʼminotchi) Rekvizitlari
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <FormField
                label="Tashkilot nomi *"
                value={counterpartyName}
                onChange={(e) => setCounterpartyName(e.target.value)}
                placeholder="MChJ / XK nomi"
                required
              />
              <FormField
                label="STIR (ИНН) *"
                value={counterpartyTin}
                onChange={(e) => setCounterpartyTin(e.target.value)}
                placeholder="9 xonali STIR"
                required
              />
              <FormField
                label="JShShIR (ПИНФЛ)"
                value={counterpartyPinfl}
                onChange={(e) => setCounterpartyPinfl(e.target.value)}
                placeholder="14 xonali JShShIR"
              />
              <FormField
                label="Hisob raqami"
                value={counterpartyBankAccount}
                onChange={(e) => setCounterpartyBankAccount(e.target.value)}
                placeholder="20208000..."
              />
              <FormField
                label="Bank MFO"
                value={counterpartyBankMfo}
                onChange={(e) => setCounterpartyBankMfo(e.target.value)}
                placeholder="00444"
              />
              <FormField
                label="Rahbar F.I.Sh."
                value={counterpartyDirector}
                onChange={(e) => setCounterpartyDirector(e.target.value)}
                placeholder="Direktor ismi"
              />
              <div className="sm:col-span-3">
                <FormField
                  label="Yuridik manzili"
                  value={counterpartyAddress}
                  onChange={(e) => setCounterpartyAddress(e.target.value)}
                  placeholder="Shahar, tuman, koʻcha..."
                />
              </div>
            </div>
          </div>

          {/* Section 2: Period & Opening Balance */}
          <div className="space-y-3 pt-3 border-t border-border">
            <h3 className="text-xs font-bold text-heading uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" /> 2. Solishtirish Davri va Boshlangʻich Qoldiq
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField
                label="Boshlanish sanasi *"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <FormField
                label="Tugash sanasi *"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
              <FormField
                label="Davr boshiga qoldiq (soʻm)"
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          {/* Section 3: Ledger Transactions Table */}
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-heading uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-primary" /> 3. Davr Mobaynidagi Oʻzaro Tranzaksiyalar
              </h3>
            </div>

            <div className="border border-border rounded-2xl overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-heading font-semibold border-b border-border">
                  <tr>
                    <th className="py-2 px-3">Sana</th>
                    <th className="py-2 px-3">Hujjat turi</th>
                    <th className="py-2 px-3">Hujjat №</th>
                    <th className="py-2 px-3">Izoh</th>
                    <th className="py-2 px-3 text-right">Debit (Taqdim etildi)</th>
                    <th className="py-2 px-3 text-right">Kredit (Toʻlandi)</th>
                    <th className="py-2 px-3 text-center">Oʻchirish</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ledgerLines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="py-2 px-3">{line.date}</td>
                      <td className="py-2 px-3 font-medium">{line.docType}</td>
                      <td className="py-2 px-3 font-mono">{line.docNumber}</td>
                      <td className="py-2 px-3">{line.description}</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-700 font-semibold">
                        {Number(line.debit) > 0 ? Number(line.debit).toLocaleString('uz-UZ') : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-blue-700 font-semibold">
                        {Number(line.credit) > 0 ? Number(line.credit).toLocaleString('uz-UZ') : '-'}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* New Row Input */}
                  <tr className="bg-muted/10 border-t border-border">
                    <td className="p-2">
                      <input
                        type="date"
                        value={newLine.date}
                        onChange={(e) => setNewLine({ ...newLine, date: e.target.value })}
                        className="w-full text-xs p-1 border rounded"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={newLine.docType}
                        onChange={(e) => setNewLine({ ...newLine, docType: e.target.value })}
                        className="w-full text-xs p-1 border rounded"
                      >
                        <option value="Hisob-faktura">Hisob-faktura</option>
                        <option value="Toʻlov topshirigʻi">Toʻlov topshirigʻi</option>
                        <option value="Yukxati (TTN)">Yukxati (TTN)</option>
                        <option value="Kredit-nota">Kredit-nota</option>
                        <option value="Kassa cheki">Kassa cheki</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="№ HF-01"
                        value={newLine.docNumber}
                        onChange={(e) => setNewLine({ ...newLine, docNumber: e.target.value })}
                        className="w-full text-xs p-1 border rounded"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="Izoh"
                        value={newLine.description}
                        onChange={(e) => setNewLine({ ...newLine, description: e.target.value })}
                        className="w-full text-xs p-1 border rounded"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        placeholder="0"
                        value={newLine.debit}
                        onChange={(e) => setNewLine({ ...newLine, debit: Number(e.target.value) })}
                        className="w-full text-xs p-1 border rounded text-right"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        placeholder="0"
                        value={newLine.credit}
                        onChange={(e) => setNewLine({ ...newLine, credit: Number(e.target.value) })}
                        className="w-full text-xs p-1 border rounded text-right"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="white"
                        onClick={handleAddLine}
                        className="p-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Financial Summary Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-muted/30 rounded-2xl border border-border text-xs">
              <div>
                <span className="text-body block">Jami Debit (Sotuv):</span>
                <span className="text-base font-bold text-emerald-700 font-mono">
                  {totalDebit.toLocaleString('uz-UZ')} soʻm
                </span>
              </div>
              <div>
                <span className="text-body block">Jami Kredit (Toʻlovlar):</span>
                <span className="text-base font-bold text-blue-700 font-mono">
                  {totalCredit.toLocaleString('uz-UZ')} soʻm
                </span>
              </div>
              <div>
                <span className="text-body block">Yakuniy Qoldiq:</span>
                <span className={`text-base font-black font-mono ${closingBalance >= 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {closingBalance >= 0 ? `+${closingBalance.toLocaleString('uz-UZ')}` : closingBalance.toLocaleString('uz-UZ')} soʻm
                </span>
                <p className="text-[10px] text-body mt-0.5">
                  {closingBalance > 0
                    ? `Xaridor qarz: ${closingBalance.toLocaleString('uz-UZ')} soʻm`
                    : closingBalance < 0
                    ? `Ortiqcha toʻlov: ${Math.abs(closingBalance).toLocaleString('uz-UZ')} soʻm`
                    : 'Oʻzaro qoldiq 0 soʻm (Toʻliq hisob-kitob qilingan)'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="white" onClick={onClose}>
              Bekor qilish
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              {loading ? 'Shakllantirilmoqda...' : 'Akt Sverki Shakllantirish va E-IMZO'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
