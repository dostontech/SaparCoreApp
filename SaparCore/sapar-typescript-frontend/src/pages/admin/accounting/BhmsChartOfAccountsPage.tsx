import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BookOpen,
  Search,
  ArrowUpDown,
  CheckCircle2,
  Building2,
  Download,
} from 'lucide-react';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';

interface BhmsAccount {
  code: string;
  name: string;
  nameRu: string;
  type: 'AKTIV' | 'PASSIV' | 'KAPITAL' | 'DAROMAD' | 'XARAJAT';
  category: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export const BhmsChartOfAccountsPage: React.FC = () => {
  const { format } = useCurrencyFormatter();
  const [accounts, setAccounts] = useState<BhmsAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get('/api/admin/accounting/bhms/chart-of-accounts');
        if (res.data?.data) {
          setAccounts(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load BHMS chart of accounts', err);
      }
    };
    fetchAccounts();
  }, []);

  const filteredAccounts = accounts.filter((a) => {
    const matchesSearch =
      a.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.nameRu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'ALL' || a.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalDebit = filteredAccounts.reduce((sum, a) => sum + a.debit, 0);
  const totalCredit = filteredAccounts.reduce((sum, a) => sum + a.credit, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Oʻzbekiston BHMS Hisoblar Rejasi (21-son BHMS Standarti)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-11">
            Oʻzbekiston Respublikasi Moliya Vazirligi tomonidan tasdiqlangan milliy 4 xonali hisoblar rejasi (Chart of Accounts).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            onClick={() => window.print()}
          >
            <Download className="w-3.5 h-3.5" />
            Chop etish / Eksport
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jami Schyotlar</span>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{accounts.length} ta</p>
          </div>
          <span className="p-3 bg-teal-50 text-teal-700 rounded-xl border border-teal-200">
            <Building2 className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jami Debet Aylanmasi</span>
            <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">{format(totalDebit)}</p>
          </div>
          <span className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            <ArrowUpDown className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jami Kredit Aylanmasi</span>
            <p className="text-2xl font-black text-teal-900 mt-1 font-mono">{format(totalCredit)}</p>
          </div>
          <span className="p-3 bg-teal-50 text-teal-700 rounded-xl border border-teal-200">
            <CheckCircle2 className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Schyot kodi yoki nomi boʻyicha qidirish (0100, 5110, kassa, xaridor)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'Barchasi' },
            { id: 'AKTIV', label: 'Aktivlar' },
            { id: 'PASSIV', label: 'Passivlar' },
            { id: 'KAPITAL', label: 'Kapital' },
            { id: 'DAROMAD', label: 'Daromadlar (9000)' },
            { id: 'XARAJAT', label: 'Xarajatlar (9100/9400)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedType === tab.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-3 px-4">Kod</th>
                <th className="py-3 px-4">Schyot Nomi (Oʻzbekcha / Ruscha)</th>
                <th className="py-3 px-4">Turi & Boʻlim</th>
                <th className="py-3 px-4 text-right">Debet Saldo</th>
                <th className="py-3 px-4 text-right">Kredit Saldo</th>
                <th className="py-3 px-4">Tavsif & Amaliy Qoʻllanilishi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredAccounts.map((a) => (
                <tr key={a.code} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4">
                    <span className="font-mono font-black text-sm text-teal-800 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200">
                      {a.code}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{a.name}</div>
                    <div className="text-[11px] text-slate-400 font-normal">{a.nameRu}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          a.type === 'AKTIV'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : a.type === 'PASSIV'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : a.type === 'DAROMAD'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : a.type === 'XARAJAT'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {a.type}
                      </span>
                      <span className="text-[11px] text-slate-500">{a.category}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {a.debit > 0 ? format(a.debit) : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {a.credit > 0 ? format(a.credit) : '—'}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-500 max-w-xs">
                    {a.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BhmsChartOfAccountsPage;
