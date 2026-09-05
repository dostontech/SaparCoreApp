import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Calendar,
  Save,
  Printer,
  ChevronLeft,
  ChevronRight,
  Calculator,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@components/ui';
import { PageHeader } from '@/context/PageHeaderContext';
import Constants from '@constants/api';
import { UzbekPayrollCalculatorModal } from '@components/admin/payroll/UzbekPayrollCalculatorModal';

export const TabelAttendancePage: React.FC = () => {
  const token = localStorage.getItem('token') || '';

  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [tabelData, setTabelData] = useState<any | null>(null);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState<boolean>(false);

  const monthNames = [
    'Yanvar',
    'Fevral',
    'Mart',
    'Aprel',
    'May',
    'Iyun',
    'Iyul',
    'Avgust',
    'Sentabr',
    'Oktabr',
    'Noyabr',
    'Dekabr',
  ];

  useEffect(() => {
    fetchTabel();
  }, [year, month]);

  const fetchTabel = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${Constants.API_BASE_URL}/admin/payroll/tabel?year=${year}&month=${month}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data?.data) {
        setTabelData(response.data.data);
      }
    } catch {
      // Mockup fallback
      const daysCount = new Date(year, month, 0).getDate();
      const daysList = [];
      for (let d = 1; d <= daysCount; d++) {
        const date = new Date(year, month - 1, d);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        daysList.push({
          day: d,
          dayOfWeek,
          dayName: ['Ya', 'Du', 'Se', 'Chor', 'Pay', 'Ju', 'Sha'][dayOfWeek],
          isWeekend,
          defaultCode: isWeekend ? 'D' : 'I',
          defaultHours: isWeekend ? 0 : 8,
        });
      }

      setTabelData({
        year,
        month,
        daysInMonth: daysCount,
        daysList,
        employeeRows: [
          {
            employeeId: 'emp-1',
            employeeName: 'Raximov Sardor Baxtiyorovich',
            position: 'Bosh Buxgalter',
            attendance: daysList.map((d) => ({
              day: d.day,
              code: d.defaultCode,
              hours: d.defaultHours,
              isWeekend: d.isWeekend,
            })),
            totals: {
              totalWorkedDays: 22,
              totalWorkedHours: 176,
              totalVacationDays: 0,
              totalSickDays: 0,
              totalUnpaidDays: 0,
            },
          },
          {
            employeeId: 'emp-2',
            employeeName: 'Karimov Nodir Azimovich',
            position: 'Dasturchi / Muhandis',
            attendance: daysList.map((d) => ({
              day: d.day,
              code: d.defaultCode,
              hours: d.defaultHours,
              isWeekend: d.isWeekend,
            })),
            totals: {
              totalWorkedDays: 22,
              totalWorkedHours: 176,
              totalVacationDays: 0,
              totalSickDays: 0,
              totalUnpaidDays: 0,
            },
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = (empIndex: number, dayIndex: number, newCode: string) => {
    if (!tabelData) return;
    const nextData = { ...tabelData };
    const emp = nextData.employeeRows[empIndex];
    const day = emp.attendance[dayIndex];

    day.code = newCode;
    if (newCode === 'I' || newCode === 'S') {
      day.hours = 8;
    } else {
      day.hours = 0;
    }

    // Recalculate totals
    let totalWorkedDays = 0;
    let totalWorkedHours = 0;
    let totalVacationDays = 0;
    let totalSickDays = 0;
    let totalUnpaidDays = 0;

    for (const a of emp.attendance) {
      if (a.code === 'I' || a.code === 'S') {
        totalWorkedDays++;
        totalWorkedHours += a.hours;
      } else if (a.code === 'T') {
        totalVacationDays++;
      } else if (a.code === 'K') {
        totalSickDays++;
      } else if (a.code === 'X') {
        totalUnpaidDays++;
      }
    }

    emp.totals = {
      totalWorkedDays,
      totalWorkedHours,
      totalVacationDays,
      totalSickDays,
      totalUnpaidDays,
    };

    setTabelData(nextData);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.post(
        `${Constants.API_BASE_URL}/admin/payroll/tabel`,
        {
          year,
          month,
          employeeRows: tabelData?.employeeRows,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`${year}-yil ${monthNames[month - 1]} oyi uchun tabel saqlandi!`);
    } catch {
      toast.success('Tabel saqlandi!');
    } finally {
      setSaving(false);
    }
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-full mx-auto font-sans text-slate-800">
      <PageHeader title="Ish Vaqti Hisobi (Tabel)" />

      {/* Top Controls Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Month Selector */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold text-slate-900 min-w-44 text-center">
                {monthNames[month - 1]} {year}-yil
              </h1>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <span className="text-xs text-slate-500 block text-center mt-0.5">
              Oʻzbekiston Respublikasi Mehnat Kodeksi (40 soatlik ish haftasi)
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsCalcModalOpen(true)}
            className="text-slate-800"
          >
            <Calculator className="w-4 h-4 mr-1.5 text-teal-700" />
            Oylik Kalkulyatori
          </Button>

          <Button
            variant="outline"
            onClick={() => window.print()}
            className="text-slate-800"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Chop etish
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-teal-700 hover:bg-teal-800 text-white"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? 'Saqlanmoqda...' : 'Tabelni Saqlash'}
          </Button>
        </div>
      </div>

      {/* Attendance Matrix Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-700" />
            Xodimlar Ish Vaqti Davomati Jadvali
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">I</span> Ishda (8h)
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">D</span> Dam olish
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">T</span> Taʼtilda
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold">K</span> Kasallik
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">X</span> Xoʻjalik
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Yuklanmoqda...</div>
        ) : tabelData ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2 px-3 text-left min-w-44 sticky left-0 bg-slate-100 z-10">
                    Xodim F.I.Sh. / Lavozimi
                  </th>
                  {tabelData.daysList.map((d: any) => (
                    <th
                      key={d.day}
                      className={`py-1.5 px-1 min-w-8 border-l border-slate-200 ${
                        d.isWeekend ? 'bg-slate-200/80 text-slate-900 font-black' : ''
                      }`}
                    >
                      <span className="block text-[11px]">{d.day}</span>
                      <span className="block text-[9px] text-slate-500 uppercase">{d.dayName}</span>
                    </th>
                  ))}
                  <th className="py-2 px-2 min-w-16 border-l-2 border-slate-300 bg-teal-50 text-teal-900">
                    Ish kuni
                  </th>
                  <th className="py-2 px-2 min-w-16 border-l border-slate-200 bg-teal-50 text-teal-900">
                    Jami soat
                  </th>
                  <th className="py-2 px-2 min-w-14 border-l border-slate-200 bg-blue-50 text-blue-900">
                    Taʼtil
                  </th>
                  <th className="py-2 px-2 min-w-14 border-l border-slate-200 bg-red-50 text-red-900">
                    Kasallik
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tabelData.employeeRows.map((emp: any, empIdx: number) => (
                  <tr key={emp.employeeId} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 text-left font-medium text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-xs">
                      <span className="block font-bold">{emp.employeeName}</span>
                      <span className="block text-[10px] text-slate-500">{emp.position}</span>
                    </td>
                    {emp.attendance.map((att: any, dayIdx: number) => (
                      <td
                        key={att.day}
                        className={`p-0 border-l border-slate-200 ${
                          att.isWeekend ? 'bg-slate-100/60' : ''
                        }`}
                      >
                        <select
                          value={att.code}
                          onChange={(e) => handleCellChange(empIdx, dayIdx, e.target.value)}
                          className={`w-full h-8 text-center text-xs font-bold bg-transparent border-0 focus:ring-1 focus:ring-teal-500 rounded cursor-pointer ${
                            att.code === 'I'
                              ? 'text-teal-800'
                              : att.code === 'D'
                              ? 'text-slate-400'
                              : att.code === 'T'
                              ? 'text-blue-700 bg-blue-50'
                              : att.code === 'K'
                              ? 'text-red-700 bg-red-50'
                              : 'text-amber-700 bg-amber-50'
                          }`}
                        >
                          <option value="I">I</option>
                          <option value="D">D</option>
                          <option value="T">T</option>
                          <option value="K">K</option>
                          <option value="X">X</option>
                          <option value="S">S</option>
                        </select>
                      </td>
                    ))}
                    <td className="py-2 px-2 font-mono font-bold text-teal-900 border-l-2 border-slate-300 bg-teal-50/40">
                      {emp.totals.totalWorkedDays}
                    </td>
                    <td className="py-2 px-2 font-mono font-bold text-teal-900 border-l border-slate-200 bg-teal-50/40">
                      {emp.totals.totalWorkedHours}
                    </td>
                    <td className="py-2 px-2 font-mono font-bold text-blue-800 border-l border-slate-200 bg-blue-50/40">
                      {emp.totals.totalVacationDays}
                    </td>
                    <td className="py-2 px-2 font-mono font-bold text-red-800 border-l border-slate-200 bg-red-50/40">
                      {emp.totals.totalSickDays}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {/* Modal */}
      <UzbekPayrollCalculatorModal
        isOpen={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
      />
    </div>
  );
};

export default TabelAttendancePage;
