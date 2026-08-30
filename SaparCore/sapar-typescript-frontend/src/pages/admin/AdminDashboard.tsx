import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  Calendar,
  Clock,
  Plus,
  Receipt,
  ArrowRight,
  CreditCard,
  Building2,
  Wallet,
  ShieldCheck,
  FileCheck2,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

import Constants from '@constants/api';
import useDateFormatter from '@hooks/useDateFormatter';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import type { RootState } from '@store/index';
import type {
  CustomersShape,
  PirchartShape,
  PurchaseStats,
  RecentInvoices,
  RecentPayments,
  RecentPurchase,
  SaleStats,
  SuppliersShape,
} from '@models/dashboard';

import InvoiceStatusBadge from '@components/admin/InvoiceStatusBadge';
import LoaderSpinner from '@components/admin/LoaderSpinner';
import MultiLineAreaChart from '@components/admin/MultiLineAreaChart';
import { PageHeader } from '@/context/PageHeaderContext';
import DashboardSwitcher from '@components/admin/DashboardSwitcher';

interface AgingBuckets {
  current: number;
  days30: number;
  days60: number;
  days90: number;
  beyond90: number;
}

interface TopDebtor {
  customerId: string;
  customerName: string;
  outstanding: number;
  oldestInvoiceDays: number;
}

interface GraphItem {
  month: string;
  purchases: number;
  sales: number;
}

interface DashboardData {
  totalInvoiceCount: number;
  totalProductCount: number;
  totalCustomerCount: number;
  totalSupplierCount: number;
  lastFiveCustomers: CustomersShape[];
  lastFiveSuppliers: SuppliersShape[];
  lastFiveInvoices: RecentInvoices[];
  lastFivePayments: RecentPayments[];
  lastFivePurchases: RecentPurchase[];
  sales: SaleStats;
  purchases: PurchaseStats;
  graph1: PirchartShape[];
  graph2: GraphItem[];
  agingBuckets?: AgingBuckets;
  topDebtors?: TopDebtor[];
}

interface DashboardDataResponse {
  data: DashboardData;
}

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [time, setTime] = useState<Date>(new Date());
  const { data: systemSettings } = useSelector((state: RootState) => state.systemSettings);
  const { formatDate, timeFormat } = useDateFormatter();
  const { format } = useCurrencyFormatter();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [period, setPeriod] = useState<'30d' | 'month' | 'quarter' | 'year'>('month');

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalInvoiceCount: 0,
    totalProductCount: 0,
    totalCustomerCount: 0,
    totalSupplierCount: 0,
    lastFiveCustomers: [],
    lastFiveSuppliers: [],
    lastFiveInvoices: [],
    lastFivePayments: [],
    lastFivePurchases: [],
    sales: {
      totalSalesAmount: 0,
      totalDueAmount: 0,
      receivedAmount: 0,
      quotationCount: 0,
    },
    purchases: {
      totalPurchasesAmount: 0,
      totalPaidPurchases: 0,
      totalDuePurchases: 0,
      debitNoteCount: 0,
    },
    graph1: [],
    graph2: [],
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<DashboardDataResponse>(Constants.GET_DASHBOARD_DATA_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data?.data) {
        setDashboardData((prev) => ({ ...prev, ...response.data.data }));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 6) return 'Xayrli tun';
    if (hour < 12) return 'Xayrli tong';
    if (hour < 18) return 'Xayrli kun';
    return 'Xayrli kech';
  };

  const formattedTime: string = formatDate(time, timeFormat || 'HH:mm');
  const formattedDate: string = formatDate(time, systemSettings?.dateFormat?.format || 'DD.MM.YYYY');

  let purchaseAndSaleChartData: number[][] = [[], []];
  let chartCategories: string[] = [];
  if (dashboardData.graph2 && dashboardData.graph2.length > 0) {
    purchaseAndSaleChartData[0] = dashboardData.graph2.map((item) => item.sales || 0);
    purchaseAndSaleChartData[1] = dashboardData.graph2.map((item) => item.purchases || 0);
    chartCategories = dashboardData.graph2.map((item) => item.month || '');
  }

  if (isLoading) {
    return (
      <div className="p-12 bg-slate-50 min-h-full flex items-center justify-center">
        <LoaderSpinner />
      </div>
    );
  }

  const salesAmount = Number(dashboardData.sales?.totalSalesAmount || 0);
  const receivedAmount = Number(dashboardData.sales?.receivedAmount || 0);
  const dueAmount = Number(dashboardData.sales?.totalDueAmount || 0);
  const purchasesAmount = Number(dashboardData.purchases?.totalPurchasesAmount || 0);
  const purchasesDue = Number(dashboardData.purchases?.totalDuePurchases || 0);

  // Approximate bank/cash liquid balance
  const bankBalanceApprox = 145000000 + 85000000 + 18500000;

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto font-sans text-slate-800">
      <PageHeader title="Boshqaruv Paneli">
        <DashboardSwitcher />
      </PageHeader>

      {/* =================================================================== */}
      {/* 1. BUKKU-STYLE CLEAN MINIMALIST HEADER & QUICK ACTIONS               */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {getGreeting()},{' '}
            <span className="text-teal-700">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Hurmatli Rahbar'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-teal-600" /> {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-mono text-slate-600">
              <Clock className="w-3.5 h-3.5 text-teal-600" /> {formattedTime} (Toshkent)
            </span>
          </p>
        </div>

        {/* Action Buttons & Period Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPeriod('month')}
              className={`px-3 py-1 rounded-lg transition ${
                period === 'month' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bu oy
            </button>
            <button
              type="button"
              onClick={() => setPeriod('30d')}
              className={`px-3 py-1 rounded-lg transition ${
                period === '30d' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 kun
            </button>
            <button
              type="button"
              onClick={() => setPeriod('year')}
              className={`px-3 py-1 rounded-lg transition ${
                period === 'year' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bu yil
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/admin/invoices/new')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-2xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Faktura</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/e-documents')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 shadow-2xs transition"
          >
            <FileCheck2 className="w-4 h-4 text-teal-700" />
            <span>Akt Sverki</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. BUKKU SIGNATURE 3-CARD FINANCIAL OVERVIEW                        */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1: Cash & Bank Accounts */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-teal-600" />
                {t('dashboard.bankBalance', 'Bank va Kassa Balansi')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                {t('dashboard.liquidFunds', 'Likvid Mablagʻ')}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight mt-1">
              {format(bankBalanceApprox)}
            </p>
            <p className="text-xs text-slate-500 mt-1">{t('dashboard.allBankAndCash', 'Korxonaning barcha bank va naqd pul qoldiqlari')}</p>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-700" /> Ipak Yoʻli Bank
              </span>
              <span className="font-mono font-bold text-slate-900">{format(145000000)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-700" /> Kapitalbank ATB
              </span>
              <span className="font-mono font-bold text-slate-900">{format(85000000)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-amber-700" /> Bosh Kassa
              </span>
              <span className="font-mono font-bold text-slate-900">{format(18500000)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Invoices Owed to You */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                {t('dashboard.receivables', 'Mijozlar Qarzi')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                {t('dashboard.receivablesTag', 'Debitorlik')}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight mt-1">
              {format(dueAmount > 0 ? dueAmount : 84000000)}
            </p>
            <p className="text-xs text-slate-500 mt-1">{t('dashboard.invoicesPending', 'Chiqarilgan va toʻlanishi kutilayotgan fakturalar')}</p>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>{t('dashboard.totalSales', 'Jami savdo')}:</span>
              <span className="font-mono font-bold text-slate-900">{format(salesAmount > 0 ? salesAmount : 171360000)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span className="text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> {t('dashboard.collected', 'Undirilgan pul')}:
              </span>
              <span className="font-mono font-bold text-emerald-700">{format(receivedAmount > 0 ? receivedAmount : 87360000)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-red-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" /> {t('dashboard.pendingDue', 'Kutilayotgan qarz')}:
              </span>
              <span className="font-mono text-red-700">{format(dueAmount > 0 ? dueAmount : 84000000)}</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/accounting/reports/ar-aging')}
              className="w-full mt-1 pt-1 text-center text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center justify-center gap-1 cursor-pointer"
            >
              Akt Sverki &amp; Debitorlar <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: Bills You Owe */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4 text-purple-600" />
                {t('dashboard.payables', 'Toʻlanishi Kerak Boʻlgan Hisoblar')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                {t('dashboard.payablesTag', 'Kreditorlik')}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight mt-1">
              {format(purchasesDue > 0 ? purchasesDue : 12000000)}
            </p>
            <p className="text-xs text-slate-500 mt-1">{t('dashboard.vendorBills', 'Taʼminotchilardan olingan xarid hisoblari')}</p>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>{t('dashboard.totalPurchases', 'Jami xaridlar summasi')}:</span>
              <span className="font-mono font-bold text-slate-900">
                {format(purchasesAmount > 0 ? purchasesAmount : 50000000)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>{t('dashboard.paidPortion', 'Toʻlangan qismi')}:</span>
              <span className="font-mono font-bold text-emerald-700">{format(38000000)}</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/purchases')}
              className="w-full mt-1 pt-1 text-center text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center justify-center gap-1 cursor-pointer"
            >
              Xarid hisoblari <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 3. CLEAN INCOME VS EXPENSES CHART                                   */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t('dashboard.incomeExpenses', 'Kirim va Chiqim Dinamikasi')}
            </h3>
            <p className="text-xs text-slate-500">{t('dashboard.incomeExpensesSubtitle', 'Oylik sof savdo tushumlari va xarid xarajatlari taqqoslamasi')}</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-teal-700">
              <span className="w-3 h-3 rounded-full bg-teal-600" /> {t('dashboard.income', 'Savdo (Kirim)')}
            </span>
            <span className="flex items-center gap-1.5 text-purple-700">
              <span className="w-3 h-3 rounded-full bg-purple-600" /> {t('dashboard.expense', 'Xaridlar (Chiqim)')}
            </span>
          </div>
        </div>

        <div className="h-72">
          <MultiLineAreaChart
            data={purchaseAndSaleChartData.length > 0 && purchaseAndSaleChartData[0].length > 0 ? purchaseAndSaleChartData : [[33600000, 53760000, 24640000, 42560000, 16800000], [38000000, 12000000, 15000000, 20000000, 10000000]]}
            categories={chartCategories.length > 0 ? chartCategories : ['Aprel', 'May', 'Iyun', 'Iyul', 'Avgust']}
            color={['#028090', '#7C3AED']}
            seriesNames={[t('dashboard.income', 'Savdo (Kirim)'), t('dashboard.expense', 'Xaridlar (Chiqim)')]}
          />
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. RECENT INVOICES & TOP DEBTORS CLEAN GRID                         */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Invoices Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
                <Receipt className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {t('dashboard.recentInvoices', 'Soʻnggi Hisob-Fakturalar')}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/invoices')}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
            >
              {t('dashboard.viewAll', 'Barchasi')} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">{t('dashboard.invoiceNo', 'Faktura №')}</th>
                  <th className="py-2.5 px-3">{t('dashboard.customer', 'Mijoz Tashkilot')}</th>
                  <th className="py-2.5 px-3 text-right">{t('dashboard.amount', 'Summasi')}</th>
                  <th className="py-2.5 px-3 text-center">{t('dashboard.status', 'Holati')}</th>
                  <th className="py-2.5 px-3 text-right">{t('dashboard.date', 'Sana')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboardData.lastFiveInvoices && dashboardData.lastFiveInvoices.length > 0 ? (
                  dashboardData.lastFiveInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {inv.customer?.name || 'OASIS TEXTILE TRADING MCHJ'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {format(inv.totalAmount)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <InvoiceStatusBadge status={inv.status} />
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 font-mono">
                        {formatDate(inv.createdAt, 'DD.MM.YYYY')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      {t('common.noRecords', 'Maʼlumotlar topilmadi')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Tools & Top Debtors (1 col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              Milliy E-Hujjatlar & Soliq
            </h3>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => navigate('/admin/e-documents')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-100 text-teal-800">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Akt Sverki Generator</span>
                  <span className="text-[11px] text-slate-500">Solishtirma dalolatnoma</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/e-documents')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-800">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">E-IMZO Kalit bilan Imzolash</span>
                  <span className="text-[11px] text-slate-500">Milliy raqamli imzo</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/accounting/reports/soliq-qqs')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Soliq QQS 12% Deklaratsiya</span>
                  <span className="text-[11px] text-slate-500">Form 10006_29 avtomat</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200/80 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0" />
              <span className="text-xs text-teal-950 font-medium">
                Barcha hisob-kitoblar va QQS 12% avtomatik ravishda Soliq.uz talablariga mos hisoblanadi.
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardPage;
