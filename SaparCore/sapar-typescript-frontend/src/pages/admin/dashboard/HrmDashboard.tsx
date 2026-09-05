import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  UserCheck,
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import DashboardSwitcher from '@components/admin/DashboardSwitcher';
import { useNavigate } from 'react-router-dom';

export const HrmDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { format } = useCurrencyFormatter();
  const navigate = useNavigate();

  const stats = {
    totalEmployees: 28,
    presentToday: 24,
    onLeave: 3,
    lateToday: 1,
    payrollBudgetUzs: 148500000,
    payrollPaidUzs: 148500000,
    taxJshodsUzs: 17820000,
    taxSocialUzs: 17820000,
  };


  const departmentBreakdown = [
    { name: 'Sotuv & Savdo', count: 10, percent: 36, color: 'bg-teal-500' },
    { name: 'Ombor & Logistika', count: 8, percent: 28, color: 'bg-indigo-500' },
    { name: 'Buxgalteriya & Moliya', count: 4, percent: 14, color: 'bg-amber-500' },
    { name: 'Oshxona & Xizmat', count: 4, percent: 14, color: 'bg-rose-500' },
    { name: 'Maʼmuriyat', count: 2, percent: 8, color: 'bg-purple-500' },
  ];

  const recentAttendance = [
    { id: 1, name: 'Sardor Rahimberdiyev', role: 'Bosh Buxgalter', time: '08:45', status: 'PRESENT', dept: 'Buxgalteriya' },
    { id: 2, name: 'Azizbek Toshmatov', role: 'Katta Katta Kassa Nazoratchisi', time: '08:52', status: 'PRESENT', dept: 'Sotuv' },
    { id: 3, name: 'Dilshod Qodirov', role: 'Ombor Mudiri', time: '08:58', status: 'PRESENT', dept: 'Ombor' },
    { id: 4, name: 'Gulnora Karimova', role: 'Hisobchi (1C / E-Faktura)', time: '09:15', status: 'LATE', dept: 'Buxgalteriya' },
    { id: 5, name: 'Jamshid Aliyev', role: 'Savdo Menejeri', time: '—', status: 'LEAVE', dept: 'Sotuv' },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('dashboard.hrmTitle', 'HRM & Xodimlar Boshqaruv Paneli')}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
              <Users size={13} />
              <span>Oʻzbekiston HRM</span>
            </span>

          </div>
          <p className="text-xs text-slate-500 mt-1">
            Xodimlar davomati, tabel hisobi, mehnat unumdorligi va oylik maoshlar nazorati
          </p>
        </div>

        {/* Dashboard Switcher Dropdown */}
        <DashboardSwitcher />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jami Xodimlar</span>
            <div className="text-2xl font-black text-slate-900">{stats.totalEmployees} nafar</div>
            <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <TrendingUp size={12} /> 100% Rasmiy bandlik
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bugun Ishda (Tabel)</span>
            <div className="text-2xl font-black text-emerald-600">{stats.presentToday} nafar</div>
            <div className="text-[11px] text-slate-500 font-medium">85.7% davomat koʻrsatkichi</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <UserCheck size={22} />
          </div>
        </div>

        {/* On Leave / Sick */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mehnat Taʼtili / Kasal</span>
            <div className="text-2xl font-black text-amber-600">{stats.onLeave} nafar</div>
            <div className="text-[11px] text-slate-500 font-medium">Buyruq rasmiylashtirilgan</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <Calendar size={22} />
          </div>
        </div>

        {/* Monthly Payroll Fund */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Oylik Maosh Fondi</span>
            <div className="text-lg font-black text-indigo-900">{format(stats.payrollBudgetUzs)}</div>
            <div className="text-[11px] text-slate-500 font-medium">JShODS 12% + Ijtimoiy 12%</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <DollarSign size={22} />
          </div>
        </div>
      </div>

      {/* Main HRM Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Log Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Bugungi Davomat Jurnali (Tabel)</h3>
              <p className="text-xs text-slate-400">Elektron kirish-chiqish va ish vaqti hisobi</p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/admin/payroll/tabel')}
              variant="white"
              className="text-xs font-bold border-slate-200"
              rightIcon={<ArrowRight size={14} />}
            >
              Tabelni Ochish
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Xodim</th>
                  <th className="py-3 px-4">Boʻlim</th>
                  <th className="py-3 px-4">Kelgan Vaqti</th>
                  <th className="py-3 px-4">Holati</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recentAttendance.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{row.name}</div>
                      <div className="text-[11px] text-slate-400">{row.role}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{row.dept}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold">{row.time}</td>
                    <td className="py-3.5 px-4">
                      {row.status === 'PRESENT' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                          Vaqtida Kelgan
                        </span>
                      )}
                      {row.status === 'LATE' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                          Kechikkan (15 daq)
                        </span>
                      )}
                      {row.status === 'LEAVE' && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-bold text-[10px]">
                          Taʼtilda
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Breakdown & Fast Actions */}
        <div className="space-y-6">
          {/* Department breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Boʻlimlar Boʻyicha Taqsimot</h3>
            <div className="space-y-3">
              {departmentBreakdown.map((dept, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{dept.name}</span>
                    <span className="font-bold text-slate-900">{dept.count} xodim ({dept.percent}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${dept.color} rounded-full`} style={{ width: `${dept.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Soliq & Payroll Compliance Notice */}
          <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-lg space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-teal-400" size={20} />
              <span className="font-extrabold text-sm">Soliq & INPS Kafolati</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              JShODS 12%, Ijtimoiy soliq 12% va ShJBPH (INPS) 0.1% avtomatik hisoblanib, 11101_14 Soliq hisobotiga yuborishga tayyorlanadi.
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/admin/payroll')}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs w-full py-2.5"
            >
              Ish Haqini Hisoblash
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrmDashboard;
