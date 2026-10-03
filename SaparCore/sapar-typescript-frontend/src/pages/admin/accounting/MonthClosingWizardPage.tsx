import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CalendarCheck2,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Scale,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';

interface Provodka {
  debit: string;
  credit: string;
  amount: number;
  description: string;
}

interface ClosingStep {
  stepNumber: number;
  title: string;
  titleRu: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  generatedProvodkas: Provodka[];
}

interface PeriodClosingState {
  period: string;
  isClosed: boolean;
  isLocked: boolean;
  closedAt?: string;
  closedBy?: string;
  steps: ClosingStep[];
}

export const MonthClosingWizardPage: React.FC = () => {
  const { format } = useCurrencyFormatter();
  const [period, setPeriod] = useState('2026-06');
  const [state, setState] = useState<PeriodClosingState | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([1, 4, 5, 6]);

  const fetchStatus = async (selectedPeriod: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/accounting/month-closing/status?period=${selectedPeriod}`);
      if (res.data?.data) {
        setState(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load month closing status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus(period);
  }, [period]);

  const handleExecuteAll = async () => {
    if (!window.confirm(`${period} davri uchun oylik yopilish (Закрытие месяца) amallarini bajarishni tasdiqlaysizmi?`)) {
      return;
    }
    setExecuting(true);
    try {
      const res = await axios.post('/api/admin/accounting/month-closing/execute', { period });
      if (res.data?.data) {
        setState(res.data.data);
      }
      alert(res.data.message || 'Oylik yopilish muvaffaqiyatli yakunlandi!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Yopilishda xatolik yuz berdi');
    } finally {
      setExecuting(false);
    }
  };

  const handleToggleLock = async () => {
    if (!state) return;
    const newLockState = !state.isLocked;
    try {
      const res = await axios.post('/api/admin/accounting/month-closing/toggle-lock', {
        period,
        locked: newLockState,
      });
      setState((prev) => (prev ? { ...prev, isLocked: newLockState } : null));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Qulflashda xatolik');
    }
  };

  const toggleStepAccordion = (stepNumber: number) => {
    if (expandedSteps.includes(stepNumber)) {
      setExpandedSteps(expandedSteps.filter((s) => s !== stepNumber));
    } else {
      setExpandedSteps([...expandedSteps, stepNumber]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#F0FBF8] text-[#028090] rounded-xl border border-[#02C39A]/20">
            <CalendarCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Oyni Yopish Ustasi (Закрытие месяца) — 21-son BHMS
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Oylik amortizatsiya, kurs farqlari, tannarx, 9000-schyotlar yopilishi va davrni qulflash
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className={`flex items-center gap-2 border-slate-200 font-medium ${
              state?.isLocked
                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
            onClick={handleToggleLock}
          >
            {state?.isLocked ? (
              <>
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Davr Qulflangan (Blokirovka)</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-slate-500" />
                <span>Davrni Qulflash</span>
              </>
            )}
          </Button>

          <Button
            disabled={executing || state?.isLocked}
            className="flex items-center gap-2 bg-[#028090] hover:bg-[#026c7a] text-white font-medium shadow-xs"
            onClick={handleExecuteAll}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{executing ? 'Hisoblanmoqda...' : 'Oyni Toʻliq Yopish (Avtomat)'}</span>
          </Button>
        </div>
      </div>

      {/* Period Selection & Summary */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700">Hisobot Oyi:</label>
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#028090]"
          />
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Holat:</span>
            {state?.isClosed ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> Yopilgan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full text-xs">
                <Clock className="w-3.5 h-3.5" /> Kutilmoqda
              </span>
            )}
          </div>

          {state?.closedAt && (
            <div className="text-xs text-slate-400">
              Yopilgan vaqti: {new Date(state.closedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {state?.steps.map((step) => {
          const isExpanded = expandedSteps.includes(step.stepNumber);
          const isDone = step.status === 'COMPLETED';

          return (
            <div
              key={step.stepNumber}
              className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                isDone ? 'border-slate-200' : 'border-slate-200'
              }`}
            >
              {/* Step Header */}
              <div
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70"
                onClick={() => toggleStepAccordion(step.stepNumber)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : step.stepNumber}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>{step.title}</span>
                      <span className="text-xs text-slate-400 font-normal">({step.titleRu})</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{step.description}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isDone ? '✅ Bajarilgan' : 'Kutilmoqda'}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Step Generated Provodkas Body */}
              {isExpanded && step.generatedProvodkas.length > 0 && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-5">
                  <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-3">
                    Shakllantirilgan Buxgalteriya Provodkalari (21-BHMS):
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <th className="py-2.5 px-4 w-24">Debet (D)</th>
                          <th className="py-2.5 px-4 w-24">Kredit (K)</th>
                          <th className="py-2.5 px-4">Operatsiya Mazmuni</th>
                          <th className="py-2.5 px-4 text-right w-40">Summa (soʻm)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {step.generatedProvodkas.map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70">
                            <td className="py-2 px-4 font-mono font-bold text-[#028090]">{p.debit}</td>
                            <td className="py-2 px-4 font-mono font-bold text-slate-700">{p.credit}</td>
                            <td className="py-2 px-4 text-slate-800">{p.description}</td>
                            <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">
                              {format(p.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthClosingWizardPage;
