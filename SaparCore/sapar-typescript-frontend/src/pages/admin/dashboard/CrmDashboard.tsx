import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Target,
  Users,
  Award,
  TrendingUp,
  ArrowRight,
  PhoneCall,
  Flame,
} from 'lucide-react';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import DashboardSwitcher from '@components/admin/DashboardSwitcher';
import { useNavigate } from 'react-router-dom';

export const CrmDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { format } = useCurrencyFormatter();
  const navigate = useNavigate();

  const stats = {
    totalLeads: 86,
    pipelineValueUzs: 1420000000,
    winRatePercent: 68,
    wonDealsThisMonth: 19,
  };


  const pipelineStages = [
    { name: '1. Yangi Lidlar', count: 24, valueUzs: 320000000, color: 'bg-blue-500' },
    { name: '2. Muzokaralar & Ehtiyoj', count: 18, valueUzs: 410000000, color: 'bg-indigo-500' },
    { name: '3. Tijorat Taklifi (KP)', count: 15, valueUzs: 390000000, color: 'bg-amber-500' },
    { name: '4. Shartnoma & E-IMZO', count: 10, valueUzs: 300000000, color: 'bg-teal-500' },
  ];

  const topOpportunities = [
    { id: 1, company: 'TOSHKENT CITY RESIDENCE MCHJ', amountUzs: 240000000, stage: 'Shartnoma & E-IMZO', prob: '90%', owner: 'Sardor A.' },
    { id: 2, company: 'ORIENT STROY DEVELOPMENT', amountUzs: 185000000, stage: 'Tijorat Taklifi (KP)', prob: '75%', owner: 'Azizbek T.' },
    { id: 3, company: 'SAMARQAND LOGISTIKA SERVIS', amountUzs: 120000000, stage: 'Muzokaralar', prob: '60%', owner: 'Dilshod Q.' },
    { id: 4, company: 'MEGA PLAZA INVEST', amountUzs: 95000000, stage: 'Yangi Lid', prob: '40%', owner: 'Jamshid A.' },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('dashboard.crmTitle', 'CRM & Savdo Quvuri Boshqaruv Paneli')}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Target size={13} />
              <span>Bitimlar Quvuri & Mijozlar</span>
            </span>

          </div>
          <p className="text-xs text-slate-500 mt-1">
            Lidlardan boshlab shartnomagacha boʻlgan savdo voronkasi va bitimlar tahlili
          </p>
        </div>

        <DashboardSwitcher />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jami Faol Lidlar</span>
            <div className="text-2xl font-black text-slate-900">{stats.totalLeads} ta mijoz</div>
            <div className="text-[11px] font-semibold text-teal-600 flex items-center gap-1">
              <TrendingUp size={12} /> +14 ta yangi lid bu hafta
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quvurdagi Jami Qiymat</span>
            <div className="text-lg font-black text-slate-900">{format(stats.pipelineValueUzs)}</div>
            <div className="text-[11px] font-semibold text-indigo-600">67 ta ochiq bitim</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <Target size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Muvaffaqiyat Darajasi</span>
            <div className="text-2xl font-black text-emerald-600">{stats.winRatePercent}% Win Rate</div>
            <div className="text-[11px] text-slate-500 font-medium">Bozor oʻrtachasidan yuqori</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <Award size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Yutilgan Bitimlar (Oy)</span>
            <div className="text-2xl font-black text-slate-900">{stats.wonDealsThisMonth} ta</div>
            <div className="text-[11px] font-semibold text-emerald-600">Shartnoma imzolangan</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
            <Flame size={22} />
          </div>
        </div>
      </div>

      {/* Pipeline Funnel & Top Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Deals Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Asosiy Katta Bitimlar (Top Opportunities)</h3>
              <p className="text-xs text-slate-400">Yaqin kunlarda yopilishi kutilayotgan shartnomalar</p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/admin/crm/pipeline')}
              variant="white"
              className="text-xs font-bold border-slate-200"
              rightIcon={<ArrowRight size={14} />}
            >
              Kanban Quvurni Ochish
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Mijoz Kompaniya</th>
                  <th className="py-3 px-4">Bitim Qiymati</th>
                  <th className="py-3 px-4">Bosqich</th>
                  <th className="py-3 px-4">Ehtimollik</th>
                  <th className="py-3 px-4">Masʼul</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {topOpportunities.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{op.company}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800">{format(op.amountUzs)}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[10px]">
                        {op.stage}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">{op.prob}</td>
                    <td className="py-3.5 px-4 text-slate-500">{op.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pipeline Stage Breakdown */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Savdo Voronkasi Bosqichlari</h3>
            <div className="space-y-3.5">
              {pipelineStages.map((stage, idx) => (
                <div key={idx} className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{stage.name}</span>
                    <span className="font-mono font-bold text-slate-700">{stage.count} ta bitim</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Hajmi:</span>
                    <span className="font-mono font-semibold text-teal-700">{format(stage.valueUzs)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-indigo-950 text-white shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <PhoneCall className="text-teal-400" size={18} />
              <span className="font-bold text-sm">Yangi Bitim / Lid Qoʻshish</span>
            </div>
            <p className="text-xs text-slate-300">
              Qoʻngʻiroq yoki tijorat taklifi natijasida yangi mijoz bilan bitim jarayonini boshlang.
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/admin/crm/pipeline')}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs w-full py-2.5"
            >
              + Yangi Bitim Ochish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrmDashboard;
