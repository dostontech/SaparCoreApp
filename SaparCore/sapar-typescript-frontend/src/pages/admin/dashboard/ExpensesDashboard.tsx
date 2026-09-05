import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  TrendingDown,
  Receipt,
  ShoppingCart,
  Wallet,
  ArrowRight,
  FileText,
} from 'lucide-react';
import Constants from '@constants/api';
import useDateFormatter from '@hooks/useDateFormatter';
import type { RootState } from '@store/index';
import { CardItem } from '@components/admin/dashboard/CardItem';
import { DashboardCard } from '@components/admin/dashboard/DashboardCard';
import Table from '@components/admin/Table';
import TableRow from '@components/admin/TableRow';
import LoaderSpinner from '@components/admin/LoaderSpinner';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import { PageHeader } from '@/context/PageHeaderContext';
import DashboardSwitcher from '@components/admin/DashboardSwitcher';

interface ByCategory {
  name: string;
  total: number;
}
interface ProfitLoss {
  costOfGoodsSold: { total: number };
  operatingExpenses: { total: number; byCategory: ByCategory[] };
  taxes: { inputTax: number };
}
interface ExpenseRow {
  id: string;
  expenseId?: string;
  amount: number | string;
  currencyCode?: string | null;
  expenseDate: string | null;
  expenseCategory?: { id: string; name: string } | null;
  paymentMode?: { id: string; name: string } | null;
  paymentStatus?: string | null;
  description?: string | null;
}

const n = (v: unknown) => Number(v ?? 0);

const ExpensesDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useSelector((state: RootState) => state.auth);
  const { format } = useCurrencyFormatter();
  const { formatDate } = useDateFormatter();
  const { data: systemSettings } = useSelector(
    (state: RootState) => state.systemSettings
  );
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [pl, setPl] = useState<ProfitLoss | null>(null);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const dateFmt = systemSettings?.dateFormat.format || 'd-m-Y';

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const [plRes, exRes] = await Promise.all([
          axios.get(Constants.GET_PROFIT_LOSS_URL, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(Constants.FETCH_EXPENSES_FOR_LIST_URL, {
            params: { page: 1, limit: 8 },
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setPl(plRes.data?.data ?? null);
        setExpenses(exRes.data?.data?.expenses ?? []);
        setTotalCount(exRes.data?.data?.pagination?.total ?? 0);
      } catch {
        /* ignore */
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  if (isLoading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <LoaderSpinner />
      </div>
    );
  }

  const opex = n(pl?.operatingExpenses?.total);
  const cogs = n(pl?.costOfGoodsSold?.total);
  const totalExpenses = opex + cogs;
  const cats = (pl?.operatingExpenses?.byCategory || []).slice(0, 8);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeader title={t('dashboard.expenses', 'Xarajatlar')}>
        <div className="flex items-center gap-2">
          <DashboardSwitcher />
          <button
            onClick={() => navigate('/admin/expenses')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 shadow-2xs transition cursor-pointer"
          >
            <span>{t('dashboard.viewAll', 'Barchasi')}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        <DashboardCard
          title="Xarajatlar Xulosasi"
          icon={<TrendingDown className="w-5 h-5 text-rose-600" />}
        >
          <CardItem
            icon={<TrendingDown className="w-4 h-4" />}
            label="Jami Xarajatlar"
            value={format(totalExpenses)}
            color="red"
          />
          <CardItem
            icon={<Wallet className="w-4 h-4" />}
            label="Operatsion Xarajatlar"
            value={format(opex)}
            color="yellow"
          />
          <CardItem
            icon={<ShoppingCart className="w-4 h-4" />}
            label="Tannarx (COGS)"
            value={format(cogs)}
            color="purple"
          />
          <CardItem
            icon={<FileText className="w-4 h-4" />}
            label="Yozuvlar Soni"
            value={totalCount}
            color="blue"
          />
        </DashboardCard>

        <DashboardCard
          title="Asosiy Kategoriyalar"
          icon={<Receipt className="w-5 h-5 text-teal-700" />}
        >
          {cats.length > 0 ? (
            cats.slice(0, 4).map((c, i) => (
              <CardItem
                key={c.name || i}
                icon={<Receipt className="w-4 h-4" />}
                label={c.name}
                value={format(c.total)}
                color={i % 2 === 0 ? 'purple' : 'green'}
              />
            ))
          ) : (
            <div className="col-span-2 py-4 text-center text-xs text-slate-400">
              Kategoriyalar mavjud emas
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          title="Hisoblar Rejasi (BHMS)"
          icon={<Receipt className="w-5 h-5 text-teal-700" />}
        >
          <CardItem
            icon={<Receipt className="w-4 h-4" />}
            label="2000 Ishlab chiqarish"
            value={format(cogs)}
            color="purple"
          />
          <CardItem
            icon={<Receipt className="w-4 h-4" />}
            label="9400 Davr Xarajatlari"
            value={format(opex)}
            color="yellow"
          />
        </DashboardCard>
      </div>

      {/* Recent Expenses Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-900">
          Soʻnggi Xarajat Yozuvlari
        </h2>
        <Table
          headers={[
            '#',
            'Sana',
            'Kategoriya',
            'Tavsif',
            'Summa',
            'Toʻlov Usuli',
          ]}
        >
          {expenses.length > 0 ? (
            expenses.map((ex, i) => (
              <TableRow
                key={ex.id}
                index={i + 1}
                row={ex}
                columns={[
                  formatDate(ex.expenseDate, dateFmt),
                  ex.expenseCategory?.name || 'Umumiy',
                  ex.description || '-',
                  <span className="font-mono font-bold text-rose-700">
                    {format(Number(ex.amount || 0))}
                  </span>,
                  ex.paymentMode?.name || 'Kassa',
                ]}
              />
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                {t('common.noRecords', 'Xarajatlar topilmadi')}
              </td>
            </tr>
          )}
        </Table>
      </div>
    </div>
  );
};

export default ExpensesDashboard;
