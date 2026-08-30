import React, { useState } from 'react';
import { X, Percent, Check } from 'lucide-react';
import { Button, FormField, fieldControlClasses } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  currentDiscount: number;
  onApplyDiscount: (discountAmount: number, reason: string) => void;
}

export const PosDiscountModal: React.FC<Props> = ({
  isOpen,
  onClose,
  subtotal,
  currentDiscount,
  onApplyDiscount,
}) => {
  const { format } = useCurrencyFormatter();
  const [mode, setMode] = useState<'percent' | 'fixed'>('percent');
  const [percentVal, setPercentVal] = useState<number>(0);
  const [fixedVal, setFixedVal] = useState<number>(currentDiscount);
  const [reason, setReason] = useState<string>('Doimiy mijoz (Loyalty)');

  if (!isOpen) return null;

  const controlClass = typeof fieldControlClasses === 'function' ? fieldControlClasses() : fieldControlClasses;

  const quickPercentages = [5, 10, 15, 20];
  const reasons = [
    'Doimiy mijoz (Loyalty)',
    'Katta hajm / Ulgurji xarid',
    'Aksiya / Bayram chegirmasi',
    'Muddati yaqin tovar',
    'Menejer maxsus ruxsati',
  ];

  const calculatedDiscount = mode === 'percent' ? Math.round((subtotal * percentVal) / 100) : fixedVal;
  const newTotal = Math.max(0, subtotal - calculatedDiscount);

  const handleApply = () => {
    onApplyDiscount(calculatedDiscount, reason);
    onClose();
  };

  const handleRemove = () => {
    onApplyDiscount(0, '');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold">Chegirma Qoʻllash (F3)</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 bg-slate-50">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('percent')}
              className={`py-2 text-xs font-bold rounded-lg transition ${mode === 'percent' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Foiz (%) Chegirma
            </button>
            <button
              type="button"
              onClick={() => setMode('fixed')}
              className={`py-2 text-xs font-bold rounded-lg transition ${mode === 'fixed' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Aniq Summa (UZS)
            </button>
          </div>

          {mode === 'percent' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {quickPercentages.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPercentVal(p)}
                    className={`py-2.5 font-bold rounded-xl text-sm border transition ${percentVal === p ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                  >
                    {p}%
                  </button>
                ))}
              </div>

              <FormField label="Maxsus foiz kiriting (%)">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={percentVal || ''}
                  onChange={(e) => setPercentVal(Number(e.target.value))}
                  placeholder="Masalan: 12"
                  className={controlClass}
                />
              </FormField>
            </div>
          ) : (
            <FormField label="Chegirma summasini kiriting (UZS)">
              <input
                type="number"
                min="0"
                max={subtotal}
                value={fixedVal || ''}
                onChange={(e) => setFixedVal(Number(e.target.value))}
                placeholder="Masalan: 15000"
                className={controlClass}
              />
            </FormField>
          )}

          {/* Reason Code */}
          <FormField label="Chegirma Sababi">
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={controlClass}
            >
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </FormField>

          {/* Summary Box */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Savdo summasi:</span>
              <span>{format(subtotal)}</span>
            </div>
            <div className="flex justify-between text-teal-600 font-bold">
              <span>Chegirma:</span>
              <span>-{format(calculatedDiscount)}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t border-slate-100">
              <span>YANGI SUMMA:</span>
              <span>{format(newTotal)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleRemove}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition"
          >
            Chegirmani Oʻchirish
          </button>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Bekor Qilish
            </Button>
            <Button variant="primary" size="sm" onClick={handleApply} className="flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              Qoʻllash
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
