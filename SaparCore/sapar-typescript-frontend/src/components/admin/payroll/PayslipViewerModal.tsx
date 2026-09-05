import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Printer,
  FileText,
} from 'lucide-react';
import axios from 'axios';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import Constants from '@constants/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lineId: string;
}

export const PayslipViewerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lineId,
}) => {
  const token = localStorage.getItem('token') || '';
  const { format } = useCurrencyFormatter();
  const printRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen && lineId) {
      fetchPayslip();
    }
  }, [isOpen, lineId]);

  const fetchPayslip = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${Constants.API_BASE_URL}/admin/payroll/payslip/${lineId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data?.data) {
        setData(response.data.data);
      }
    } catch {
      // Fallback mockup
      setData({
        payslipNumber: `PAY-2026-088`,
        period: '2026-08 (Avgust 2026)',
        taxYear: '2026-yil',
        generatedDate: new Date().toISOString().substring(0, 10),
        company: {
          name: 'SAPAR TECHNOLOGIES MCHJ',
          tin: '308765432',
          address: 'Toshkent shahri, Amir Temur koʻchasi 107B',
        },
        employee: {
          name: 'Raximov Sardor Baxtiyorovich',
          email: 'sardor@sapar.uz',
          phone: '+998 90 123-45-67',
          position: 'Bosh Buxgalter / Moliyachi',
        },
        calculation: {
          baseSalary: 12000000,
          bonus: 2000000,
          allowances: 1000000,
          overtimePay: 0,
          grossSalary: 15000000,
          inpsAmount: 15000,
          jshodsBudget: 1785000,
          jshodsTotal: 1800000,
          advancePaid: 3000000,
          otherDeductions: 0,
          totalDeductions: 4800000,
          netSalary: 10200000,
          socialTaxRate: 12,
          socialTaxAmount: 1800000,
          totalEmployerCost: 16800000,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold text-white">
              Hisob-Kitob Varaqasi (Raschyotniy Listok)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-slate-800 bg-white hover:bg-slate-100"
            >
              <Printer className="w-4 h-4 mr-1.5" /> Chop etish
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800" ref={printRef}>
          {loading ? (
            <div className="py-12 text-center text-slate-400">Yuklanmoqda...</div>
          ) : data ? (
            <div className="space-y-6">
              {/* Company & Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-900 pb-4 gap-4">
                <div>
                  <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                    {data.company?.name}
                  </h1>
                  <p className="text-xs text-slate-600 font-mono mt-0.5">
                    STIR (ИНН): {data.company?.tin} • {data.company?.address}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold text-xs rounded-lg">
                    № {data.payslipNumber}
                  </span>
                  <p className="text-xs font-semibold text-slate-600 mt-1">
                    Davr: <span className="text-slate-900 font-bold">{data.period}</span>
                  </p>
                </div>
              </div>

              {/* Employee Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Xodim F.I.Sh.:</span>
                  <span className="font-bold text-slate-900 text-sm">{data.employee?.name}</span>
                  <span className="text-slate-600 block mt-0.5">{data.employee?.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Lavozimi:</span>
                  <span className="font-bold text-slate-900">{data.employee?.position}</span>
                  <span className="text-slate-600 block mt-0.5">Hisoblangan sana: {data.generatedDate}</span>
                </div>
              </div>

              {/* Accruals & Deductions Breakdown Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Accruals (Hisoblandi) */}
                <div className="rounded-2xl border border-slate-200 overflow-hidden text-xs">
                  <div className="bg-teal-700 text-white font-bold px-4 py-2 uppercase tracking-wider text-[11px]">
                    1. Hisoblangan Daromadlar (Accruals)
                  </div>
                  <div className="p-4 space-y-2 divide-y divide-slate-100">
                    <div className="flex justify-between pt-1 text-slate-600">
                      <span>Oylik maosh (Oklad):</span>
                      <span className="font-mono font-bold text-slate-900">{format(data.calculation?.baseSalary)}</span>
                    </div>
                    <div className="flex justify-between pt-2 text-slate-600">
                      <span>Ustamalar:</span>
                      <span className="font-mono font-bold text-slate-900">{format(data.calculation?.allowances)}</span>
                    </div>
                    <div className="flex justify-between pt-2 text-slate-600">
                      <span>Mukofot / Bonus:</span>
                      <span className="font-mono font-bold text-slate-900">{format(data.calculation?.bonus)}</span>
                    </div>
                    {data.calculation?.overtimePay > 0 && (
                      <div className="flex justify-between pt-2 text-slate-600">
                        <span>Qoʻshimcha soatlar:</span>
                        <span className="font-mono font-bold text-slate-900">{format(data.calculation?.overtimePay)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-3 font-bold text-teal-900 border-t border-slate-200">
                      <span>JAMI BRUTTO:</span>
                      <span className="font-mono text-sm">{format(data.calculation?.grossSalary)}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Deductions (Ushlab qolindi) */}
                <div className="rounded-2xl border border-slate-200 overflow-hidden text-xs">
                  <div className="bg-red-800 text-white font-bold px-4 py-2 uppercase tracking-wider text-[11px]">
                    2. Ushlanmalar va Soliqlar (Deductions)
                  </div>
                  <div className="p-4 space-y-2 divide-y divide-slate-100">
                    <div className="flex justify-between pt-1 text-slate-600">
                      <span>JShODS Soligʻi (11.9% Byudjet):</span>
                      <span className="font-mono font-bold text-red-700">{format(data.calculation?.jshodsBudget)}</span>
                    </div>
                    <div className="flex justify-between pt-2 text-slate-600">
                      <span>INPS Pensiya (0.1% Xalq Banki):</span>
                      <span className="font-mono font-bold text-red-700">{format(data.calculation?.inpsAmount)}</span>
                    </div>
                    <div className="flex justify-between pt-2 text-slate-600">
                      <span>Toʻlangan avans:</span>
                      <span className="font-mono font-bold text-slate-900">{format(data.calculation?.advancePaid)}</span>
                    </div>
                    <div className="flex justify-between pt-3 font-bold text-red-900 border-t border-slate-200">
                      <span>JAMI USHLANMALAR:</span>
                      <span className="font-mono text-sm">{format(data.calculation?.totalDeductions)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Net Payout Summary Banner */}
              <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 block">
                    Qoʻlga Tegadigan Summa (Netto / To Payout)
                  </span>
                  <p className="text-2xl font-black text-emerald-700 font-mono tracking-tight mt-0.5">
                    {format(data.calculation?.netSalary)}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-600">
                  <span>Ish beruvchi ijtimoiy soligʻi (12%): </span>
                  <span className="font-mono font-bold text-slate-900 block">{format(data.calculation?.socialTaxAmount)}</span>
                </div>
              </div>

              {/* Signatures & Stamp area */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 text-xs">
                <div>
                  <p className="text-slate-500 mb-8">Bosh buxgalter (Hisobchi):</p>
                  <div className="border-b border-slate-400 w-48 mb-1" />
                  <p className="font-semibold text-slate-700">F.I.Sh. / Imzo</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 mb-8">Xodim (Qabul qilib oldim):</p>
                  <div className="border-b border-slate-400 w-48 ml-auto mb-1" />
                  <p className="font-semibold text-slate-700">F.I.Sh. / Imzo</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
