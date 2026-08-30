import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Landmark,
  Wallet,
  TrendingUp,
  Scale,
  ShieldCheck,
  ArrowRight,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import DashboardSwitcher from '@components/admin/DashboardSwitcher';
import { useNavigate } from 'react-router-dom';

export const FinanceDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { format } = useCurrencyFormatter();
  const navigate = useNavigate();

  const stats = {
    grossRevenueUzs: 540000000,
    netProfitUzs: 168000000,
    bankBalanceUzs: 245000000,
    cashOnHandUzs: 42000000,
    taxVatPayableUzs: 38400000,
  };


  const bankAccounts = [
    { bank: 'Ipak Yoʻli Bank ATB (Asosiy)', accNo: '20208000900123456001', balanceUzs: 185000000, currency: 'UZS' },
    { bank: 'Kapitalbank ATB (Valyuta)', accNo: '20208840400123456002', balanceUzs: 60000000, currency: 'USD ($4,700)' },
    { bank: 'Asosiy Kassa (Naqd pul)', accNo: '1001-Kassa', balanceUzs: 42000000, currency: 'UZS' },
  ];

  const recentEntries = [
    { id: 1, docNo: 'JE-2026-0042', desc: 'Mijozdan toʻlov kelib tushdi (Ipak Yoʻli)', dt: '5110 (Hisob-kitob)', ct: '4010 (Debitorlik)', amountUzs: 45000000 },
    { id: 2, docNo: 'JE-2026-0041', desc: 'Tovar sotish boʻyicha hisob-faktura rasmiylashtirildi', dt: '4010 (Debitorlik)', ct: '9020 (Savdo tushumi)', amountUzs: 72000000 },
    { id: 3, docNo: 'JE-2026-0040', desc: 'QQS 12% hisoblandi (Soliq majburiyati)', dt: '9020 (Tushum)', ct: '6410 (QQS byudjet)', amountUzs: 8640000 },
    { id: 4, docNo: 'JE-2026-0039', desc: 'Taʼminotchiga tovar uchun toʻlov oʻtkazildi', dt: '6010 (Kreditorlik)', ct: '5110 (Bank)', amountUzs: 34000000 },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('dashboard.financeTitle', 'Moliya & Buxgalteriya Boshqaruv Paneli')}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Landmark size={13} />
              <span>21-son BHMS & Soliq</span>
            </span>


          </div>
          <p className="text-xs text-slate-500 mt-1">
            Milliy buxgalteriya hisobi, bank va kassa qoldiqlari, 1/2-shakl moliyaviy hisobotlar va QQS nazorati
          </p>
        </div>

        <DashboardSwitcher />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jami Sof Foyda</span>
            <div className="text-2xl font-black text-emerald-600">{format(stats.netProfitUzs)}</div>
            <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <TrendingUp size={12} /> 31.1% rentabellik marjasi
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <Scale size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Banklardagi Qoldiq</span>
            <div className="text-lg font-black text-slate-900">{format(stats.bankBalanceUzs)}</div>
            <div className="text-[11px] text-slate-500 font-medium">Ipak Yoʻli & Kapitalbank</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
            <Landmark size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kassadagi Naqd Pul</span>
            <div className="text-2xl font-black text-slate-900">{format(stats.cashOnHandUzs)}</div>
            <div className="text-[11px] font-semibold text-teal-600">1001-Hisobda mavjud</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <Wallet size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hisoblangan QQS 12%</span>
            <div className="text-2xl font-black text-amber-600">{format(stats.taxVatPayableUzs)}</div>
            <div className="text-[11px] text-slate-500 font-medium">Soliq 10006_29 deklaratsiyasi</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* Main Finance Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Journal Entries (Provodkalar) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Soʻnggi Buxgalteriya Provodkalari (BHMS 21)</h3>
              <p className="text-xs text-slate-400">Ikkiyoqlama yozuv va bosh kitob operatsiyalari</p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/admin/accounting/journal-entries')}
              variant="white"
              className="text-xs font-bold border-slate-200"
              rightIcon={<ArrowRight size={14} />}
            >
              Bosh Kitobni Ochish
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Hujjat №</th>
                  <th className="py-3 px-4">Mazmuni</th>
                  <th className="py-3 px-4">Debet (Dt)</th>
                  <th className="py-3 px-4">Kredit (Kt)</th>
                  <th className="py-3 px-4 text-right">Summa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recentEntries.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{row.docNo}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{row.desc}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold">{row.dt}</td>
                    <td className="py-3.5 px-4 font-mono text-indigo-700 font-bold">{row.ct}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-right">{format(row.amountUzs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bank & Cash Balances */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Bank & Kassa Qoldiqlari</h3>
            <div className="space-y-3">
              {bankAccounts.map((acc, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{acc.bank}</span>
                    <span className="font-mono font-bold text-teal-800">{format(acc.balanceUzs)}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">{acc.accNo}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-emerald-950 text-white shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="text-emerald-400" size={18} />
              <span className="font-bold text-sm">Moliyaviy Hisobotlar (1/2-Shakl)</span>
            </div>
            <p className="text-xs text-slate-300">
              Buxgalteriya balansi (1-shakl) va Moliyaviy natijalar toʻgʻrisida hisobot (2-shakl)ni bir bosishda yuklab oling.
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/admin/accounting/reports/uz-financial-statements')}
              className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs w-full py-2.5"
            >
              1/2-Shakl Hisobotlarini Koʻrish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
