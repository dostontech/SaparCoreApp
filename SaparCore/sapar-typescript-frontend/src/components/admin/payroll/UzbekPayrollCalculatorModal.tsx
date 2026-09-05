import React, { useState, useEffect } from 'react';
import {
  X,
  Calculator,
  Sparkles,
} from 'lucide-react';
import axios from 'axios';
import { Button, FormField } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import Constants from '@constants/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialBaseSalary?: number;
}

export const UzbekPayrollCalculatorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialBaseSalary = 10000000,
}) => {
  const token = localStorage.getItem('token') || '';
  const { format } = useCurrencyFormatter();

  const [baseSalary, setBaseSalary] = useState<number>(initialBaseSalary);
  const [bonus, setBonus] = useState<number>(0);
  const [allowances, setAllowances] = useState<number>(0);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);
  const [isItPark, setIsItPark] = useState<boolean>(false);

  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      calculateSalary();
    }
  }, [isOpen, baseSalary, bonus, allowances, overtimeHours, advancePaid, otherDeductions, isItPark]);

  const calculateSalary = async () => {
    try {
      const payload = {
        baseSalary: Number(baseSalary || 0),
        bonus: Number(bonus || 0),
        allowances: Number(allowances || 0),
        overtimeHours: Number(overtimeHours || 0),
        advancePaid: Number(advancePaid || 0),
        otherDeductions: Number(otherDeductions || 0),
        isItPark,
      };

      const response = await axios.post(
        `${Constants.API_BASE_URL}/admin/payroll/calculate-uz`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.data) {
        setResult(response.data.data);
      }
    } catch {
      // Fallback local calculation
      const gross = Number(baseSalary || 0) + Number(bonus || 0) + Number(allowances || 0);
      const inps = Math.round(gross * 0.001);
      const jshodsTotal = Math.round(gross * 0.12);
      const jshodsBudget = jshodsTotal - inps;
      const net = Math.max(0, gross - jshodsTotal - Number(advancePaid || 0) - Number(otherDeductions || 0));
      const socRate = isItPark ? 1 : 12;
      const socTax = Math.round(gross * (socRate / 100));

      setResult({
        baseSalary,
        bonus,
        allowances,
        overtimePay: 0,
        grossSalary: gross,
        inpsRate: 0.1,
        inpsAmount: inps,
        jshodsRate: 12.0,
        jshodsTotal,
        jshodsBudget,
        advancePaid,
        otherDeductions,
        totalDeductions: jshodsTotal + Number(advancePaid || 0) + Number(otherDeductions || 0),
        netSalary: net,
        socialTaxRate: socRate,
        socialTaxAmount: socTax,
        totalEmployerCost: gross + socTax,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500/30 rounded-xl text-teal-200">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Oʻzbekiston Ish Haqi va Soliqlar Kalkulyatori
              </h2>
              <p className="text-xs text-slate-300">
                Soliq Kodeksi & Mehnat Kodeksi (JShODS 12%, INPS 0.1%, Ijtimoiy Soliq 12%)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* Inputs Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <FormField
              label="Oylik maosh (Oklad) *"
              type="number"
              value={baseSalary}
              onChange={(e) => setBaseSalary(Number(e.target.value))}
              placeholder="Masalan: 10000000"
            />
            <FormField
              label="Mukofot / Bonus (soʻm)"
              type="number"
              value={bonus}
              onChange={(e) => setBonus(Number(e.target.value))}
              placeholder="0"
            />
            <FormField
              label="Ustamalar / Kompensatsiya"
              type="number"
              value={allowances}
              onChange={(e) => setAllowances(Number(e.target.value))}
              placeholder="0"
            />
            <FormField
              label="Qoʻshimcha soatlar (Overtime)"
              type="number"
              value={overtimeHours}
              onChange={(e) => setOvertimeHours(Number(e.target.value))}
              placeholder="0 soat"
            />
            <FormField
              label="Toʻlangan avans (soʻm)"
              type="number"
              value={advancePaid}
              onChange={(e) => setAdvancePaid(Number(e.target.value))}
              placeholder="0"
            />
            <FormField
              label="Boshqa ushlanmalar (Ijro/Aliment)"
              type="number"
              value={otherDeductions}
              onChange={(e) => setOtherDeductions(Number(e.target.value))}
              placeholder="0"
            />
          </div>

          {/* IT Park / SME Concession Checkbox */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="itParkToggle"
                checked={isItPark}
                onChange={(e) => setIsItPark(e.target.checked)}
                className="w-4 h-4 text-teal-700 rounded border-slate-300 focus:ring-teal-500"
              />
              <label htmlFor="itParkToggle" className="text-xs font-bold text-teal-950 cursor-pointer">
                IT Park Rezidenti / Kichik biznes imtiyozi (Ijtimoiy soliq 1%)
              </label>
            </div>
            <span className="text-[11px] font-semibold text-teal-800 hidden sm:inline-block">
              {isItPark ? '1.0% Ijtimoiy Soliq qoʻllanadi' : '12.0% Standart stavka'}
            </span>
          </div>

          {/* Results Breakdown Cards */}
          {result && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Hisob-Kitob Xulosasi
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Gross */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Brutto (Jami Hisoblandi)
                  </span>
                  <p className="text-xl font-black text-slate-900 font-mono">
                    {format(result.grossSalary)}
                  </p>
                  <p className="text-[11px] text-slate-500">Oklad + Ustama + Mukofot</p>
                </div>

                {/* 2. Deductions */}
                <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200 space-y-1">
                  <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">
                    JShODS Soligʻi (12%)
                  </span>
                  <p className="text-xl font-black text-red-700 font-mono">
                    {format(result.jshodsTotal)}
                  </p>
                  <p className="text-[11px] text-red-800/80">
                    Byudjet: {format(result.jshodsBudget)} | INPS: {format(result.inpsAmount)}
                  </p>
                </div>

                {/* 3. Net Take-Home */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-1">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                    Netto (Qoʻlga Tegadigan)
                  </span>
                  <p className="text-xl font-black text-emerald-700 font-mono">
                    {format(result.netSalary)}
                  </p>
                  <p className="text-[11px] text-emerald-800/80">Xodim plastik kartasiga toʻlanadi</p>
                </div>
              </div>

              {/* Detailed Breakdown Table */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100/80 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Koʻrsatkich / Modda</th>
                      <th className="py-2.5 px-4 text-center">Stavka</th>
                      <th className="py-2.5 px-4 text-right">Summa (soʻm)</th>
                      <th className="py-2.5 px-4">Buxgalteriya Provodkasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-900">Jami Hisoblangan Ish Haqi (Brutto)</td>
                      <td className="py-2.5 px-4 text-center">—</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold">{format(result.grossSalary)}</td>
                      <td className="py-2.5 px-4 font-mono text-teal-700">Dt 9420 / Kt 6710</td>
                    </tr>
                    <tr className="bg-red-50/30">
                      <td className="py-2.5 px-4 text-red-900">Daromad Soligʻi Byudjetga (JShODS 11.9%)</td>
                      <td className="py-2.5 px-4 text-center text-red-700">11.9%</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-red-700">{format(result.jshodsBudget)}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">Dt 6710 / Kt 6410</td>
                    </tr>
                    <tr className="bg-red-50/30">
                      <td className="py-2.5 px-4 text-red-900">INPS Jamgʻarib boriladigan pensiya (0.1%)</td>
                      <td className="py-2.5 px-4 text-center text-red-700">0.1%</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-red-700">{format(result.inpsAmount)}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">Dt 6710 / Kt 6510</td>
                    </tr>
                    <tr className="bg-emerald-50/30">
                      <td className="py-2.5 px-4 font-bold text-emerald-950">Ish Beruvchi Ijtimoiy Soligʻi</td>
                      <td className="py-2.5 px-4 text-center font-bold text-teal-700">{result.socialTaxRate}%</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-teal-800">{format(result.socialTaxAmount)}</td>
                      <td className="py-2.5 px-4 font-mono text-teal-700">Dt 9420 / Kt 6520</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td className="py-3 px-4 text-slate-900">JAMI KORXONA XARAJATI (Gross + Ijtimoiy Soliq)</td>
                      <td className="py-3 px-4 text-center">—</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-900 text-sm">{format(result.totalEmployerCost)}</td>
                      <td className="py-3 px-4 text-slate-500 font-normal">Korxona tannarxi</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Yopish
          </Button>
        </div>
      </div>
    </div>
  );
};
