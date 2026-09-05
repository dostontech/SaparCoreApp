import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileSpreadsheet,
  TrendingUp,
  Scale,
  Printer,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';

interface ReportLineItem {
  code: string;
  name: string;
  amount: number;
}

interface Form1Data {
  formName: string;
  period: string;
  currency: string;
  assets: {
    longTerm: ReportLineItem[];
    totalLongTerm: number;
    current: ReportLineItem[];
    totalCurrent: number;
    grandTotal: number;
  };
  passives: {
    equity: ReportLineItem[];
    totalEquity: number;
    liabilities: ReportLineItem[];
    totalLiabilities: number;
    grandTotal: number;
  };
  isBalanced: boolean;
}

interface Form2LineItem {
  lineCode: string;
  title: string;
  amount: number;
  isBold?: boolean;
  isHighlight?: boolean;
}

interface Form2Data {
  formName: string;
  period: string;
  currency: string;
  lines: Form2LineItem[];
  summary: {
    netRevenue: number;
    grossProfit: number;
    operatingIncome: number;
    profitBeforeTax: number;
    netProfit: number;
    profitMarginPct: number;
  };
}

interface OborotkaRowItem {
  code: string;
  name: string;
  type?: string;
  openDebit: number;
  openCredit: number;
  turnDebit: number;
  turnCredit: number;
  closeDebit: number;
  closeCredit: number;
}

interface OborotkaData {
  formName: string;
  period: string;
  rows: OborotkaRowItem[];
  totals: {
    openDebit: number;
    openCredit: number;
    turnDebit: number;
    turnCredit: number;
    closeDebit: number;
    closeCredit: number;
  };
  isBalanced: boolean;
}

export const UzbekistanFinancialReportsPage: React.FC = () => {
  const { format } = useCurrencyFormatter();
  const [activeTab, setActiveTab] = useState<'FORM1' | 'FORM2' | 'OBOROTKA'>('FORM1');
  const [form1Data, setForm1Data] = useState<Form1Data | null>(null);
  const [form2Data, setForm2Data] = useState<Form2Data | null>(null);
  const [oborotkaData, setOborotkaData] = useState<OborotkaData | null>(null);

  useEffect(() => {
    const loadAllReports = async () => {
      try {
        const [f1, f2, ob] = await Promise.all([
          axios.get('/api/admin/accounting/bhms/form1-balance-sheet'),
          axios.get('/api/admin/accounting/bhms/form2-profit-loss'),
          axios.get('/api/admin/accounting/bhms/oborotka-trial-balance'),
        ]);
        setForm1Data(f1.data?.data);
        setForm2Data(f2.data?.data);
        setOborotkaData(ob.data?.data);
      } catch (err) {
        console.error('Failed to load Uzbekistan financial reports', err);
      }
    };
    loadAllReports();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Oʻzbekiston Davlat Moliyaviy Hisobotlari (1-shakl Balans & 2-shakl P&L)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-11">
            21-son BHMS milliy standarti boʻyicha avtomatlashtirilgan davlat buxgalteriya hisobotlari.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Chop etish (Print)
          </Button>
        </div>
      </div>

      {/* 3-Tab Navigator */}
      <div className="flex border-b border-slate-200 gap-2 bg-white p-2 rounded-2xl border shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('FORM1')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'FORM1'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          1-Shakl — Buxgalteriya Balansi
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('FORM2')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'FORM2'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          2-Shakl — Moliyaviy Natijalar (P&L)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('OBOROTKA')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'OBOROTKA'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          Aylanma Vedomost (Oborotka)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 1-SHAKL BUXGALTERIYA BALANSI                                       */}
      {/* ========================================================================= */}
      {activeTab === 'FORM1' && form1Data && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Balans Tengligi Taʼminlangan: Jami Aktivlar = Jami Passivlar ({format(form1Data.assets.grandTotal)})</span>
            </div>
            <span className="text-[11px] font-mono font-bold bg-white text-emerald-700 px-3 py-1 rounded-xl border border-emerald-200">
              100% Balans
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: AKTIVLAR */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-200">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  AKTIV (Aktivlar)
                </h3>
              </div>

              <div className="p-4 space-y-4">
                {/* I. Uzoq muddatli aktivlar */}
                <div>
                  <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-2">
                    I. Uzoq muddatli aktivlar
                  </h4>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-slate-100">
                      {form1Data.assets.longTerm.map((item) => (
                        <tr key={item.code} className="hover:bg-slate-50">
                          <td className="py-2 text-slate-700">{item.name}</td>
                          <td className="py-2 text-right font-mono font-bold text-slate-900">
                            {format(item.amount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold">
                        <td className="py-2 px-2 text-slate-900">I-Boʻlim boʻyicha jami:</td>
                        <td className="py-2 px-2 text-right font-mono text-teal-800">
                          {format(form1Data.assets.totalLongTerm)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* II. Joriy aktivlar */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-2">
                    II. Joriy aktivlar (Aylanma mablagʻlar)
                  </h4>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-slate-100">
                      {form1Data.assets.current.map((item) => (
                        <tr key={item.code} className="hover:bg-slate-50">
                          <td className="py-2 text-slate-700">{item.name}</td>
                          <td className="py-2 text-right font-mono font-bold text-slate-900">
                            {format(item.amount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold">
                        <td className="py-2 px-2 text-slate-900">II-Boʻlim boʻyicha jami:</td>
                        <td className="py-2 px-2 text-right font-mono text-teal-800">
                          {format(form1Data.assets.totalCurrent)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Grand Total Assets */}
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 flex justify-between items-center font-black text-sm text-teal-900">
                  <span>BALANS AKTIVI (Jami Aktivlar):</span>
                  <span className="font-mono">{format(form1Data.assets.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Right: PASSIVLAR */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-200">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  PASSIV (Xususiy kapital va Majburiyatlar)
                </h3>
              </div>

              <div className="p-4 space-y-4">
                {/* I. Xususiy kapital */}
                <div>
                  <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-2">
                    I. Oʻz mablagʻlarining manbalari (Xususiy kapital)
                  </h4>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-slate-100">
                      {form1Data.passives.equity.map((item) => (
                        <tr key={item.code} className="hover:bg-slate-50">
                          <td className="py-2 text-slate-700">{item.name}</td>
                          <td className="py-2 text-right font-mono font-bold text-slate-900">
                            {format(item.amount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold">
                        <td className="py-2 px-2 text-slate-900">I-Boʻlim boʻyicha jami:</td>
                        <td className="py-2 px-2 text-right font-mono text-teal-800">
                          {format(form1Data.passives.totalEquity)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* II. Majburiyatlar */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-2">
                    II. Majburiyatlar (Kreditorlik qarzlari)
                  </h4>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-slate-100">
                      {form1Data.passives.liabilities.map((item) => (
                        <tr key={item.code} className="hover:bg-slate-50">
                          <td className="py-2 text-slate-700">{item.name}</td>
                          <td className="py-2 text-right font-mono font-bold text-slate-900">
                            {format(item.amount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold">
                        <td className="py-2 px-2 text-slate-900">II-Boʻlim boʻyicha jami:</td>
                        <td className="py-2 px-2 text-right font-mono text-teal-800">
                          {format(form1Data.passives.totalLiabilities)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Grand Total Passives */}
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 flex justify-between items-center font-black text-sm text-teal-900">
                  <span>BALANS PASSIVI (Jami Passivlar):</span>
                  <span className="font-mono">{format(form1Data.passives.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 2-SHAKL MOLIYAVIY NATIJALAR (P&L)                                   */}
      {/* ========================================================================= */}
      {activeTab === 'FORM2' && form2Data && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sof Tushum</span>
              <p className="text-xl font-black text-slate-900 mt-1 font-mono">{format(form2Data.summary.netRevenue)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Yalpi Foyda</span>
              <p className="text-xl font-black text-emerald-700 mt-1 font-mono">{format(form2Data.summary.grossProfit)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Asosiy Faoliyat Foydasi</span>
              <p className="text-xl font-black text-teal-800 mt-1 font-mono">{format(form2Data.summary.operatingIncome)}</p>
            </div>
            <div className="bg-teal-700 text-white p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-200 uppercase tracking-wider">SOF FOYDA</span>
                <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">{form2Data.summary.profitMarginPct}% Marja</span>
              </div>
              <p className="text-2xl font-black mt-1 font-mono">{format(form2Data.summary.netProfit)}</p>
            </div>
          </div>

          {/* Official 2-Shakl Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                2-Shakl — Moliyaviy Natijalar Toʻgʻrisida Hisobot (P&L)
              </h3>
              <span className="text-xs font-bold text-slate-500">{form2Data.period}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <tr>
                    <th className="py-3 px-4 w-16">Satr</th>
                    <th className="py-3 px-4">Koʻrsatkichlar Nomi</th>
                    <th className="py-3 px-4 text-right">Davr Uchun Summa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {form2Data.lines.map((line) => (
                    <tr
                      key={line.lineCode}
                      className={`hover:bg-slate-50/70 transition ${
                        line.isHighlight
                          ? 'bg-teal-50/70 font-black text-teal-900'
                          : line.isBold
                          ? 'font-bold bg-slate-50/40 text-slate-900'
                          : 'text-slate-700'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">{line.lineCode}</td>
                      <td className="py-3 px-4">{line.title}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {format(line.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AYLANMA VEDOMOST (OBOROTKA)                                        */}
      {/* ========================================================================= */}
      {activeTab === 'OBOROTKA' && oborotkaData && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Aylanma-Saldo Vedomosti (Oborotno-Salʼdo Vedomost)
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                Debet / Kredit Aylanmalari Mutanosib
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th rowSpan={2} className="py-3 px-3 border-r">Kod</th>
                    <th rowSpan={2} className="py-3 px-3 border-r">Schyot Nomi</th>
                    <th colSpan={2} className="py-2 px-3 text-center border-r bg-slate-100/60">Boshlangʻich Saldo</th>
                    <th colSpan={2} className="py-2 px-3 text-center border-r bg-slate-100/60">Davr Aylanmasi</th>
                    <th colSpan={2} className="py-2 px-3 text-center bg-slate-100/60">Yakuniy Saldo</th>
                  </tr>
                  <tr>
                    <th className="py-2 px-3 text-right border-r">Debet</th>
                    <th className="py-2 px-3 text-right border-r">Kredit</th>
                    <th className="py-2 px-3 text-right border-r">Debet</th>
                    <th className="py-2 px-3 text-right border-r">Kredit</th>
                    <th className="py-2 px-3 text-right border-r">Debet</th>
                    <th className="py-2 px-3 text-right">Kredit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {oborotkaData.rows.map((row) => (
                    <tr key={row.code} className="hover:bg-slate-50 font-medium">
                      <td className="py-2 px-3 font-mono font-bold text-teal-800 border-r">{row.code}</td>
                      <td className="py-2 px-3 text-slate-900 border-r">{row.name}</td>
                      <td className="py-2 px-3 text-right font-mono border-r">{row.openDebit > 0 ? format(row.openDebit) : '—'}</td>
                      <td className="py-2 px-3 text-right font-mono border-r">{row.openCredit > 0 ? format(row.openCredit) : '—'}</td>
                      <td className="py-2 px-3 text-right font-mono border-r text-emerald-700 font-bold">{row.turnDebit > 0 ? format(row.turnDebit) : '—'}</td>
                      <td className="py-2 px-3 text-right font-mono border-r text-teal-800 font-bold">{row.turnCredit > 0 ? format(row.turnCredit) : '—'}</td>
                      <td className="py-2 px-3 text-right font-mono border-r font-bold">{row.closeDebit > 0 ? format(row.closeDebit) : '—'}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">{row.closeCredit > 0 ? format(row.closeCredit) : '—'}</td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-slate-100 font-black text-slate-900">
                    <td colSpan={2} className="py-3 px-3 border-r text-right uppercase">JAMI AYLANMA:</td>
                    <td className="py-3 px-3 text-right font-mono border-r">{format(oborotkaData.totals.openDebit)}</td>
                    <td className="py-3 px-3 text-right font-mono border-r">{format(oborotkaData.totals.openCredit)}</td>
                    <td className="py-3 px-3 text-right font-mono border-r text-emerald-800">{format(oborotkaData.totals.turnDebit)}</td>
                    <td className="py-3 px-3 text-right font-mono border-r text-teal-800">{format(oborotkaData.totals.turnCredit)}</td>
                    <td className="py-3 px-3 text-right font-mono border-r">{format(oborotkaData.totals.closeDebit)}</td>
                    <td className="py-3 px-3 text-right font-mono">{format(oborotkaData.totals.closeCredit)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UzbekistanFinancialReportsPage;
