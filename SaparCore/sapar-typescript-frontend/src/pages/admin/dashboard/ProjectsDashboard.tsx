import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Briefcase,
  CheckSquare,
  Clock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import DashboardSwitcher from '@components/admin/DashboardSwitcher';
import { useNavigate } from 'react-router-dom';

export const ProjectsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { format } = useCurrencyFormatter();
  const navigate = useNavigate();

  const stats = {
    activeProjects: 8,
    completedTasksCount: 142,
    totalTrackedHours: 840,
    projectRevenueUzs: 210000000,
  };


  const activeProjectsList = [
    { id: 1, title: 'Toshkent Turar-Joy Majmuasi (Qurilish Nazorati)', client: 'ORIENT DEVELOPMENT', progress: 75, budgetUzs: 95000000, deadline: '15-Sentabr' },
    { id: 2, title: 'Chirchiq Sanoat Parki Ombor Qurilishi', client: 'CHIRCHIQ LOGIX', progress: 50, budgetUzs: 65000000, deadline: '30-Oktabr' },
    { id: 3, title: 'Samarqand Mehmonxona ERP Oʻrnatish', client: 'REGISTAN PLAZA', progress: 90, budgetUzs: 35000000, deadline: '01-Sentabr' },
    { id: 4, title: 'Buxoro Savdo Markazi Taʼmiri', client: 'ARK INVEST', progress: 30, budgetUzs: 40000000, deadline: '20-Noyabr' },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('dashboard.projectsTitle', 'Loyihalar Boshqaruv Paneli')}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Briefcase size={13} />
              <span>Loyihalar & Vazifalar</span>
            </span>

          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mijoz loyihalari jarayoni, topshiriqlar bajarilishi (Kanban), sarflangan vaqt va byudjet nazorati
          </p>
        </div>

        <DashboardSwitcher />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faol Loyihalar</span>
            <div className="text-2xl font-black text-slate-900">{stats.activeProjects} ta loyiha</div>
            <div className="text-[11px] font-semibold text-blue-600">Reja boʻyicha ketmoqda</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <Briefcase size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bajarilgan Vazifalar</span>
            <div className="text-2xl font-black text-emerald-600">{stats.completedTasksCount} ta</div>
            <div className="text-[11px] font-semibold text-emerald-600">89.2% oʻz vaqtida bajarilgan</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <CheckSquare size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hisoblangan Ish Soatlari</span>
            <div className="text-2xl font-black text-slate-900">{stats.totalTrackedHours} soat</div>
            <div className="text-[11px] text-slate-500 font-medium">Timesheet hisobi boʻyicha</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loyihalar Byudjeti</span>
            <div className="text-lg font-black text-teal-800">{format(stats.projectRevenueUzs)}</div>
            <div className="text-[11px] font-semibold text-teal-600">Shartnoma qiymati</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* Main Projects Layout */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Asosiy Faol Loyihalar Holati</h3>
            <p className="text-xs text-slate-400">Jarayon foizi va topshirish muddatlari</p>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/admin/projects')}
            variant="white"
            className="text-xs font-bold border-slate-200"
            rightIcon={<ArrowRight size={14} />}
          >
            Loyiha Doskasini Ochish
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {activeProjectsList.map((proj) => (
            <div key={proj.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{proj.title}</h4>
                  <p className="text-xs text-slate-500 font-medium">{proj.client}</p>
                </div>
                <span className="font-mono text-xs font-bold text-teal-700">{proj.progress}%</span>
              </div>

              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${proj.progress}%` }} />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                <span>Muddat: <strong className="text-slate-800">{proj.deadline}</strong></span>
                <span className="font-bold text-slate-900">{format(proj.budgetUzs)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsDashboard;
