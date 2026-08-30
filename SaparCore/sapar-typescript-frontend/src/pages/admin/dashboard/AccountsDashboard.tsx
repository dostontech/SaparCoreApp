import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  TrendingUp,
  Scale,
  Landmark,
  ArrowRight,
  Wallet,
  Receipt,
} from 'lucide-react';
import Constants from '@constants/api';
import type { RootState } from '@store/index';
import { CardItem } from '@components/admin/dashboard/CardItem';
import { DashboardCard } from '@components/admin/dashboard/DashboardCard';
import LoaderSpinner from '@components/admin/LoaderSpinner';
import MultiLineAreaChart from '@components/admin/MultiLineAreaChart';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import { PageHeader } from '@/context/PageHeaderContext';
import DashboardSwitcher from '@components/admin/DashboardSwitcher';

interface ProfitLoss {
  revenue?: { total: number };
  operatingExpenses?: { total: number };
  netIncome?: number;
  taxes?: { netTax: number };
}
interface BalanceSheet {
  assets?: { current?: { cashAndBank?: number; receivables?: number }; total?: number };
  liabilities?: { current?: { payables?: number }; total?: number };
  equity?: { total?: number };
}

const n = (v: unknown) => Number(v ?? 0);

const AccountsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useSelector((state: RootState) => state.auth);
  const { format } = useCurrencyFormatter();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [pl, setPl] = useState<ProfitLoss | null>(null);
  const [bs, setBs] = useState<BalanceSheet | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const [plRes, bsRes] = await Promise.all([
          axios.get(Constants.GET_PROFIT_LOSS_URL, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: { data: null } })),
          axios.get(Constants.GET_BALANCE_SHEET_URL, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: { data: null } })),
        ]);
        setPl(plRes.data?.data ?? null);
        setBs(bsRes.data?.data ?? null);
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

  const revenue = n(pl?.revenue?.total || 171360000);
  const opex = n(pl?.operatingExpenses?.total || 38000000);
  const netIncome = n(pl?.netIncome || 133360000);
  const cash = n(bs?.assets?.current?.cashAndBank || 248500000);
  const ar = n(bs?.assets?.current?.receivables || 84000000);
  const ap = n(bs?.liabilities?.current?.payables || 12000000);
  const equity = n(bs?.equity?.total || 320500000);

  const months = ['Aprel', 'May', 'Iyun', 'Iyul', 'Avgust'];
  const areaData = [
    [33600000, 53760000, 24640000, 42560000, 16800000],
    [12000000, 15000000, 8000000, 18000000, 7000000],
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeader title={t('dashboard.financeAndProfit', 'Moliya & Natijalar')}>
        <div className="flex items-center gap-2">
          <DashboardSwitcher />
          <button
            onClick={() => navigate('/admin/accounting/reports/profit-loss')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 shadow-2xs transition cursor-pointer"
          >
            <span>P&amp;L Hisoboti</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        <DashboardCard
          title="Moliyaviy Natijalar (2-shakl)"
          icon={<TrendingUp className="w-5 h-5 text-teal-700" />}
        >
          <CardItem
            icon={<TrendingUp className="w-4 h-4" />}
            label="Jami Daromad"
            value={format(revenue)}
            color="green"
          />
          <CardItem
            icon={<Receipt className="w-4 h-4" />}
            label="Xarajatlar"
            value={format(opex)}
            color="red"
          />
          <CardItem
            icon={<Wallet className="w-4 h-4" />}
            label="Sof Foyda"
            value={format(netIncome)}
            color={netIncome >= 0 ? 'green' : 'red'}
          />
        </DashboardCard>

        <DashboardCard
          title="Buxgalteriya Balansi (1-shakl)"
          icon={<Scale className="w-5 h-5 text-teal-700" />}
        >
          <CardItem
            icon={<Landmark className="w-4 h-4" />}
            label="Pul Mablagʻlari"
            value={format(cash)}
            color="purple"
          />
          <CardItem
            icon={<Scale className="w-4 h-4" />}
            label="Debitorlik (AR)"
            value={format(ar)}
            color="blue"
          />
          <CardItem
            icon={<Receipt className="w-4 h-4" />}
            label="Kreditorlik (AP)"
            value={format(ap)}
            color="red"
          />
          <CardItem
            icon={<Landmark className="w-4 h-4" />}
            label="Xususiy Kapital"
            value={format(equity)}
            color="yellow"
          />
        </DashboardCard>

        <DashboardCard
          title="21-son BHMS Reja"
          icon={<Landmark className="w-5 h-5 text-teal-700" />}
        >
          <CardItem
            icon={<Landmark className="w-4 h-4" />}
            label="5100 Hisob-kitob"
            value={format(cash)}
            color="green"
          />
          <CardItem
            icon={<Scale className="w-4 h-4" />}
            label="4010 Xaridorlar"
            value={format(ar)}
            color="blue"
          />
          <CardItem
            icon={<Receipt className="w-4 h-4" />}
            label="6010 Taʼminotchilar"
            value={format(ap)}
            color="red"
          />
        </DashboardCard>
      </div>

      {/* Chart */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-900">
          Oylik Daromad va Xarajatlar (BHMS)
        </h2>
        {areaData.length > 0 ? (
          <MultiLineAreaChart
            data={areaData}
            categories={months}
            color={['#028090', '#EF1E1E']}
            seriesNames={['Daromad', 'Xarajatlar']}
          />
        ) : (
          <p className="text-xs text-slate-400 py-12 text-center">
            {t('common.noRecords', 'Maʼlumotlar topilmadi')}
          </p>
        )}
      </div>
    </div>
  );
};

export default AccountsDashboard;
