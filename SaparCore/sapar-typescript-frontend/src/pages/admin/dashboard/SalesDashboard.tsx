import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  BarChart2,
  FileText,
  BadgeDollarSign,
  CreditCard,
  AlertCircle,
  ArrowRight,
  Users,
  AlertTriangle,
} from 'lucide-react';
import Constants from '@constants/api';
import useDateFormatter from '@hooks/useDateFormatter';
import type { RootState } from '@store/index';
import { CardItem } from '@components/admin/dashboard/CardItem';
import { DashboardCard } from '@components/admin/dashboard/DashboardCard';
import Table from '@components/admin/Table';
import TableRow from '@components/admin/TableRow';
import InvoiceStatusBadge from '@components/admin/InvoiceStatusBadge';
import PaymentModeBadge from '@components/admin/PaymentModeBadge';
import LoaderSpinner from '@components/admin/LoaderSpinner';
import ApexGradientPie from '@components/admin/dashboard/ApexGradientPie';
import MultiLineAreaChart from '@components/admin/MultiLineAreaChart';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import type {
  PirchartShape,
  RecentInvoices,
  RecentPayments,
  SaleStats,
} from '@models/dashboard';
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
  totalCustomerCount: number;
  lastFiveInvoices: RecentInvoices[];
  lastFivePayments: RecentPayments[];
  sales: SaleStats;
  graph1: PirchartShape[];
  graph2: GraphItem[];
  agingBuckets?: AgingBuckets;
  topDebtors?: TopDebtor[];
}

const SalesDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useSelector((state: RootState) => state.auth);
  const { formatDate } = useDateFormatter();
  const { data: systemSettings } = useSelector(
    (state: RootState) => state.systemSettings
  );
  const { format } = useCurrencyFormatter();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<DashboardData>({
    totalInvoiceCount: 0,
    totalCustomerCount: 0,
    lastFiveInvoices: [],
    lastFivePayments: [],
    sales: {
      totalSalesAmount: 0,
      totalDueAmount: 0,
      receivedAmount: 0,
      quotationCount: 0,
    },
    graph1: [],
    graph2: [],
  });
  const dateFmt = systemSettings?.dateFormat.format || 'd-m-Y';

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await axios.get<{ data: DashboardData }>(
          Constants.GET_DASHBOARD_DATA_URL,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data?.data) {
          setData(res.data.data);
        }
      } catch {
        /* ignore */
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  const pieChartData =
    data.graph1 && data.graph1.length > 0
      ? data.graph1.map((g, idx) => ({
          id: `item-${idx}`,
          label: g.name || 'Tovar',
          value: Number(g.totalSales || 0),
        }))
      : [];
  const areaData =
    data.graph2 && data.graph2.length > 0
      ? [data.graph2.map((g) => g.sales), data.graph2.map((g) => g.purchases)]
      : [];
  const months = data.graph2?.map((g) => g.month) || [];
  const aging = data.agingBuckets;

  if (isLoading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <LoaderSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeader title={t('dashboard.salesAndInvoices', 'Savdo & Fakturalar')}>
        <div className="flex items-center gap-2">
          <DashboardSwitcher />
          <button
            onClick={() => navigate('/admin/invoices')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 shadow-2xs transition cursor-pointer"
          >
            <span>{t('dashboard.viewAll', 'Barchasi')}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </PageHeader>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        <DashboardCard
          title={t('dashboard.salesAndInvoices', 'Savdo Statistikasi')}
          icon={<BarChart2 className="w-5 h-5 text-teal-700" />}
        >
          <CardItem
            icon={<BadgeDollarSign className="w-4 h-4 text-teal-700" />}
            label={t('dashboard.totalSales', 'Jami Savdo')}
            value={format(data.sales.totalSalesAmount || 0)}
            color="purple"
          />
          <CardItem
            icon={<CreditCard className="w-4 h-4 text-emerald-700" />}
            label={t('dashboard.collected', 'Undirilgan')}
            value={format(data.sales.receivedAmount || 0)}
            color="green"
          />
          <CardItem
            icon={<AlertCircle className="w-4 h-4 text-rose-700" />}
            label={t('dashboard.pendingDue', 'Qarz')}
            value={format(data.sales.totalDueAmount || 0)}
            color="red"
          />
          <CardItem
            icon={<FileText className="w-4 h-4 text-sky-700" />}
            label={t('nav.quotations', 'Tijorat takliflari')}
            value={data.sales.quotationCount || 0}
            color="blue"
          />
        </DashboardCard>

        <DashboardCard
          title={t('dashboard.overview', 'Umumiy Koʻrsatkichlar')}
          icon={<FileText className="w-5 h-5 text-teal-700" />}
        >
          <CardItem
            icon={<FileText className="w-4 h-4 text-teal-700" />}
            label={t('nav.invoices', 'Fakturalar')}
            value={data.totalInvoiceCount || 0}
            color="purple"
          />
          <CardItem
            icon={<Users className="w-4 h-4 text-emerald-700" />}
            label={t('nav.contacts', 'Mijozlar')}
            value={data.totalCustomerCount || 0}
            color="green"
          />
        </DashboardCard>

        <DashboardCard
          title={t('dashboard.receivables', 'Muddati Oʻtgan Qarzdorlik')}
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
        >
          <CardItem
            icon={<AlertCircle className="w-4 h-4 text-emerald-700" />}
            label="Joriy (0-30 kun)"
            value={format(aging?.current || 0)}
            color="green"
          />
          <CardItem
            icon={<AlertCircle className="w-4 h-4 text-amber-700" />}
            label="31-60 kun"
            value={format(aging?.days60 || 0)}
            color="yellow"
          />
          <CardItem
            icon={<AlertCircle className="w-4 h-4 text-amber-700" />}
            label="61-90 kun"
            value={format(aging?.days90 || 0)}
            color="yellow"
          />
          <CardItem
            icon={<AlertCircle className="w-4 h-4 text-rose-700" />}
            label="90+ kun"
            value={format(aging?.beyond90 || 0)}
            color="red"
          />
        </DashboardCard>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900">
            {t('dashboard.incomeExpenses', 'Savdo va Xaridlar Dinamikasi')}
          </h2>
          {areaData.length > 0 ? (
            <MultiLineAreaChart
              data={areaData}
              categories={months}
              color={['#028090', '#02C39A']}
              seriesNames={[
                t('dashboard.income', 'Savdo'),
                t('dashboard.expense', 'Xaridlar'),
              ]}
            />
          ) : (
            <p className="text-xs text-slate-400 py-12 text-center">
              {t('common.noRecords', 'Maʼlumotlar topilmadi')}
            </p>
          )}
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900">
            Top Tovarlar (Savdo Hajmi Boʻyicha)
          </h2>
          {pieChartData.length > 0 ? (
            <ApexGradientPie
              data={pieChartData}
              colors={['#028090', '#02C39A', '#06AED4', '#27AE60', '#E2B93B']}
              width={380}
              height={300}
            />
          ) : (
            <p className="text-xs text-slate-400 py-12 text-center">
              {t('common.noRecords', 'Maʼlumotlar topilmadi')}
            </p>
          )}
        </div>
      </div>

      {/* Recent Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900">
            {t('dashboard.recentInvoices', 'Soʻnggi Hisob-Fakturalar')}
          </h2>
          <Table
            headers={[
              '#',
              t('dashboard.invoiceNo', 'Faktura'),
              t('dashboard.customer', 'Mijoz'),
              t('dashboard.amount', 'Summa'),
              t('dashboard.status', 'Holati'),
              t('dashboard.date', 'Sana'),
            ]}
          >
            {data.lastFiveInvoices?.length > 0 ? (
              data.lastFiveInvoices.map((inv, i) => (
                <TableRow
                  key={inv.id}
                  index={i + 1}
                  row={inv}
                  columns={[
                    <span className="text-teal-700 font-bold font-mono">
                      {inv.invoiceNumber}
                    </span>,
                    inv.customer?.name || '-',
                    format(inv.totalAmount || 0),
                    <InvoiceStatusBadge status={inv.status} />,
                    formatDate(inv.createdAt, dateFmt),
                  ]}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                  {t('common.noRecords', 'Fakturalar topilmadi')}
                </td>
              </tr>
            )}
          </Table>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Soʻnggi Toʻlovlar</h2>
          <Table
            headers={[
              '#',
              t('dashboard.invoiceNo', 'Faktura'),
              t('dashboard.amount', 'Summa'),
              'Usul',
            ]}
          >
            {data.lastFivePayments?.length > 0 ? (
              data.lastFivePayments.map((p, i) => (
                <TableRow
                  key={p.id}
                  index={i + 1}
                  row={p}
                  columns={[
                    <span className="text-teal-700 font-bold font-mono">
                      {p.invoice?.invoiceNumber || '-'}
                    </span>,
                    format(p.amount || 0),
                    <PaymentModeBadge mode={p.payment_method?.name || '-'} />,
                  ]}
                />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-6 text-slate-400 text-xs">
                  {t('common.noRecords', 'Toʻlovlar topilmadi')}
                </td>
              </tr>
            )}
          </Table>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
