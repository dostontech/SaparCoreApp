import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Headphones,
  CheckCircle2,
  Clock,
  Star,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@components/ui';
import DashboardSwitcher from '@components/admin/DashboardSwitcher';
import { useNavigate } from 'react-router-dom';

export const SupportDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const stats = {
    openTickets: 12,
    resolvedToday: 28,
    avgResponseMinutes: 14,
    csatScore: 98,
  };


  const recentTickets = [
    { id: 'TICK-1082', client: 'QURILISH BAZA GRAND MCHJ', subject: 'E-IMZO orqali faktura imzolashda kalit aniqlanmadi', priority: 'HIGH', status: 'IN_PROGRESS', time: '12 daq oldin' },
    { id: 'TICK-1081', client: 'RAYHON RESTORAN MCHJ', subject: 'Kassa terminalida chek printeri ulanishi', priority: 'MEDIUM', status: 'RESOLVED', time: '45 daq oldin' },
    { id: 'TICK-1080', client: 'ORIENT INVEST DEVELOPMENT', subject: 'Soliq 10006_29 QQS hisobotini eksport qilish', priority: 'LOW', status: 'RESOLVED', time: '2 soat oldin' },
    { id: 'TICK-1079', client: 'SAMARQAND TEKSTIL XK', subject: 'Yangi xodimga rol va ruxsatlar biriktirish', priority: 'LOW', status: 'RESOLVED', time: '3 soat oldin' },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('dashboard.supportTitle', 'Mijozlar Yordami & Helpdesk Boshqaruv Paneli')}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
              <Headphones size={13} />
              <span>Texnik Yordam (SLA)</span>
            </span>

          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mijozlar murojaatlari, tiketlar yechimi, SLA javob berish tezligi va mijozlar qoniqish darajasi (CSAT)
          </p>
        </div>

        <DashboardSwitcher />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ochiq Murojaatlar</span>
            <div className="text-2xl font-black text-amber-600">{stats.openTickets} ta tiket</div>
            <div className="text-[11px] text-amber-700 font-medium">Navbatda koʻrilmoqda</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bugun Yechilgan</span>
            <div className="text-2xl font-black text-emerald-600">{stats.resolvedToday} ta tiket</div>
            <div className="text-[11px] font-semibold text-emerald-600">SLA 100% bajarildi</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Oʻrtacha Javob Vaqti</span>
            <div className="text-2xl font-black text-slate-900">{stats.avgResponseMinutes} daqiqa</div>
            <div className="text-[11px] font-semibold text-teal-600">Tezkor 24/7 yordam</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
            <Headphones size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mijozlar Qoniqishi (CSAT)</span>
            <div className="text-2xl font-black text-indigo-900">{stats.csatScore}%</div>
            <div className="text-[11px] font-semibold text-indigo-600">5 yulduzli baholar</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <Star size={22} />
          </div>
        </div>
      </div>

      {/* Recent Tickets Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Soʻnggi Texnik Yordam Murojaatlari</h3>
            <p className="text-xs text-slate-400">Mijozlardan kelib tushgan savollar va nosozliklar jurnali</p>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/admin/helpdesk')}
            variant="white"
            className="text-xs font-bold border-slate-200"
            rightIcon={<ArrowRight size={14} />}
          >
            Barcha Tiketlar
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Tiket №</th>
                <th className="py-3 px-4">Mijoz Tashkilot</th>
                <th className="py-3 px-4">Murojaat Mazmuni</th>
                <th className="py-3 px-4">Muhimlik</th>
                <th className="py-3 px-4">Holat</th>
                <th className="py-3 px-4 text-right">Kelgan Vaqti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {recentTickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{t.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{t.client}</td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate">{t.subject}</td>
                  <td className="py-3.5 px-4">
                    {t.priority === 'HIGH' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                        Yuqori
                      </span>
                    )}
                    {t.priority === 'MEDIUM' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                        Oʻrta
                      </span>
                    )}
                    {t.priority === 'LOW' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[10px]">
                        Oddiy
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {t.status === 'RESOLVED' ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                        Yechildi
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px]">
                        Jarayonda
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-right">{t.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;
