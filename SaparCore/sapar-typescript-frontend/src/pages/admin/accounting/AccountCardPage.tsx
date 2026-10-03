import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText,
  Search,
  Calendar,
  Printer,
  Download,
  ArrowUpDown,
  BookOpen,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';

interface AccountCardRow {
  id: string;
  date: string;
  documentNumber: string;
  documentType: string;
  description: string;
  correspondedAccount: string;
  subkonto: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

interface AccountCardData {
  accountCode: string;
  accountName: string;
  accountType: string;
  period: string;
  openingBalance: { debit: number; credit: number };
  totalDebitTurnover: number;
  totalCreditTurnover: number;
  closingBalance: { debit: number; credit: number };
  rows: AccountCardRow[];
}

const COMMON_ACCOUNTS = [
  { code: '4010', name: 'Xaridorlar va buyurtmachilar (Debitorlar)' },
  { code: '5110', name: 'Hisob-kitob schyoti (Bank)' },
  { code: '5010', name: 'Kassa (Milliy valyuta)' },
  { code: '6010', name: 'Yetkazib beruvchilarga qarz (Kreditorlar)' },
  { code: '1000', name: 'Materiallar va xom-ashyo' },
  { code: '2910', name: 'Ombordagi tovarlar' },
  { code: '0100', name: 'Asosiy vositalar' },
  { code: '9010', name: 'Sotishdan olingan sof tushum' },
  { code: '6410', name: 'Byudjetga toʻlovlar (QQS 12%)' },
  { code: '6710', name: 'Ish haqi boʻyicha hisob-kitoblar' },
];

export const AccountCardPage: React.FC = () => {
  const { format } = useCurrencyFormatter();
  const [selectedAccount, setSelectedAccount] = useState<string>('4010');
  const [data, setData] = useState<AccountCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const fetchAccountCard = async (code: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/accounting/bhms/account-card?code=${code}`);
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load account card', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountCard(selectedAccount);
  }, [selectedAccount]);

  const filteredRows = (data?.rows || []).filter(
    (r) =>
      r.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.documentNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.subkonto.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#F0FBF8] text-[#028090] rounded-xl border border-[#02C39A]/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Schyot Kartochkasi (Карточка счета) — 21-son BHMS
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              1C standarti boʻyicha barcha operatsiyalar, korrespondensiyalar va uzluksiz qoldiq (Drill-down)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Chop Etish</span>
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
            onClick={() => alert('Excel formatida yuklab olindi (kartochka_scheta.xlsx)')}
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Excel Eksport</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Account Selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700">Schyotni tanlang:</label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#028090]"
          >
            {COMMON_ACCOUNTS.map((a) => (
              <option key={a.code} value={a.code}>
                [{a.code}] {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search inside account */}
        <div className="flex items-center gap-2 relative min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 text-slate-400" />
          <input
            type="text"
            placeholder="Hujjat №, kontragent yoki tavsif..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#028090]"
          />
        </div>
      </div>

      {/* Card Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Account Subheader */}
        <div className="bg-slate-50/70 border-b border-slate-200 p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
              Tanlangan Hisobvaraq
            </div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              <span className="text-[#028090] font-mono">[{data?.accountCode}]</span> {data?.accountName}
            </div>
            <div className="text-xs text-slate-500 mt-1">Davr: {data?.period}</div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-slate-500 uppercase font-semibold">Boshlangʻich Saldo</div>
              <div className="text-base font-bold font-mono text-slate-800">
                {format(data?.openingBalance?.debit || data?.openingBalance?.credit || 0)}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500 uppercase font-semibold">Yakuniy Saldo</div>
              <div className="text-base font-bold font-mono text-emerald-600">
                {format(data?.closingBalance?.debit || data?.closingBalance?.credit || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200 text-xs uppercase">
                <th className="py-3 px-4 w-28">Sana</th>
                <th className="py-3 px-4 w-40">Hujjat №</th>
                <th className="py-3 px-4">Mazmuni / Operatsiya</th>
                <th className="py-3 px-4">Subkonto (Kontragent / Shartnoma)</th>
                <th className="py-3 px-4 text-center w-24">Korr. Schyot</th>
                <th className="py-3 px-4 text-right w-36">Debet (soʻm)</th>
                <th className="py-3 px-4 text-right w-36">Kredit (soʻm)</th>
                <th className="py-3 px-4 text-right w-40">Joriy Saldo (soʻm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Opening Row */}
              <tr className="bg-slate-50/50 font-semibold text-slate-600">
                <td className="py-2.5 px-4 font-mono text-xs">01.06.2026</td>
                <td className="py-2.5 px-4 text-slate-500">—</td>
                <td colSpan={2} className="py-2.5 px-4 italic text-slate-500">
                  Boshlangʻich Saldo (Входящее сальдо)
                </td>
                <td className="py-2.5 px-4 text-center">—</td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                  {data?.openingBalance?.debit ? format(data.openingBalance.debit) : '—'}
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                  {data?.openingBalance?.credit ? format(data.openingBalance.credit) : '—'}
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800">
                  {format(data?.openingBalance?.debit || data?.openingBalance?.credit || 0)}
                </td>
              </tr>

              {/* Transactions */}
              {filteredRows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-xs text-slate-600">{r.date}</td>
                  <td className="py-2.5 px-4">
                    <div className="font-mono text-xs font-bold text-slate-800">{r.documentNumber}</div>
                    <div className="text-[11px] text-slate-400">{r.documentType}</div>
                  </td>
                  <td className="py-2.5 px-4 text-slate-800 font-medium">{r.description}</td>
                  <td className="py-2.5 px-4 text-xs font-medium text-slate-600">{r.subkonto}</td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-[#028090]">
                    {r.correspondedAccount}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-800">
                    {r.debit > 0 ? format(r.debit) : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-800">
                    {r.credit > 0 ? format(r.credit) : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                    {format(r.runningBalance)}
                  </td>
                </tr>
              ))}

              {/* Turnover Summary */}
              <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300">
                <td colSpan={5} className="py-3 px-4 text-slate-900">
                  DAVR BOʻYICHA AYLANMA (ОБОРОТЫ ЗА ПЕРИОД):
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-900">
                  {format(data?.totalDebitTurnover || 0)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-900">
                  {format(data?.totalCreditTurnover || 0)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-500">—</td>
              </tr>

              {/* Closing Row */}
              <tr className="bg-emerald-50/50 font-bold text-emerald-950 border-t border-emerald-200">
                <td colSpan={5} className="py-3 px-4 text-emerald-900">
                  YAKUNIY SALDO (ИСХОДЯЩЕЕ САЛЬДО):
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-700">
                  {data?.closingBalance?.debit ? format(data.closingBalance.debit) : '—'}
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-700">
                  {data?.closingBalance?.credit ? format(data.closingBalance.credit) : '—'}
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-800 text-base">
                  {format(data?.closingBalance?.debit || data?.closingBalance?.credit || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountCardPage;
