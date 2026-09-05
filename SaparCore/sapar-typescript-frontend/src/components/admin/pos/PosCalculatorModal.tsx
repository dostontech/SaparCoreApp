import React, { useState } from 'react';
import { X, Calculator, Delete, RotateCcw } from 'lucide-react';
import { Button } from '@components/ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PosCalculatorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState<string[]>([]);
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (display === '0' || resetNext) {
      setDisplay(digit);
      setResetNext(false);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleDecimal = () => {
    if (resetNext) {
      setDisplay('0.');
      setResetNext(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOp = (nextOp: string) => {
    const current = parseFloat(display);
    if (prevVal === null) {
      setPrevVal(current);
    } else if (op) {
      const res = calculate(prevVal, current, op);
      setPrevVal(res);
      setDisplay(String(res));
    }
    setOp(nextOp);
    setResetNext(true);
  };

  const handleEqual = () => {
    if (prevVal === null || !op) return;
    const current = parseFloat(display);
    const res = calculate(prevVal, current, op);
    const historyEntry = `${prevVal} ${op} ${current} = ${res}`;
    setHistory((prev) => [historyEntry, ...prev.slice(0, 9)]);
    setDisplay(String(res));
    setPrevVal(null);
    setOp(null);
    setResetNext(true);
  };

  const calculate = (a: number, b: number, operator: string): number => {
    switch (operator) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b !== 0 ? a / b : 0;
      default:
        return b;
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevVal(null);
    setOp(null);
    setResetNext(false);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold">Kassir Kalkulyatori (Alt+C)</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display */}
        <div className="p-4 bg-slate-900 text-right font-mono">
          <div className="text-xs text-slate-400 h-4">
            {prevVal !== null && op ? `${prevVal} ${op}` : ''}
          </div>
          <div className="text-3xl font-bold text-white tracking-wider overflow-x-auto">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="p-4 bg-slate-50 grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="p-3 font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition text-sm flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="p-3 font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition text-sm flex items-center justify-center"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOp('÷')}
            className={`p-3 font-bold rounded-xl transition text-sm ${op === '÷' ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}
          >
            ÷
          </button>
          <button
            type="button"
            onClick={() => handleOp('×')}
            className={`p-3 font-bold rounded-xl transition text-sm ${op === '×' ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}
          >
            ×
          </button>

          {['7', '8', '9'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleDigit(d)}
              className="p-3.5 font-bold text-slate-800 bg-white hover:bg-slate-100 rounded-xl shadow-xs border border-slate-200 transition text-base"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleOp('-')}
            className={`p-3 font-bold rounded-xl transition text-sm ${op === '-' ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}
          >
            -
          </button>

          {['4', '5', '6'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleDigit(d)}
              className="p-3.5 font-bold text-slate-800 bg-white hover:bg-slate-100 rounded-xl shadow-xs border border-slate-200 transition text-base"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleOp('+')}
            className={`p-3 font-bold rounded-xl transition text-sm ${op === '+' ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}
          >
            +
          </button>

          {['1', '2', '3'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleDigit(d)}
              className="p-3.5 font-bold text-slate-800 bg-white hover:bg-slate-100 rounded-xl shadow-xs border border-slate-200 transition text-base"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={handleEqual}
            className="row-span-2 p-3.5 font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md transition text-lg flex items-center justify-center"
          >
            =
          </button>

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="col-span-2 p-3.5 font-bold text-slate-800 bg-white hover:bg-slate-100 rounded-xl shadow-xs border border-slate-200 transition text-base"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDecimal}
            className="p-3.5 font-bold text-slate-800 bg-white hover:bg-slate-100 rounded-xl shadow-xs border border-slate-200 transition text-base"
          >
            .
          </button>
        </div>

        {/* History Log */}
        {history.length > 0 && (
          <div className="p-3 bg-slate-100 border-t border-slate-200 max-h-24 overflow-y-auto text-[11px] text-slate-600 font-mono space-y-0.5">
            <div className="font-semibold text-slate-500 uppercase text-[9px] mb-1">Hisoblar tarixi:</div>
            {history.map((h, i) => (
              <div key={i}>{h}</div>
            ))}
          </div>
        )}

        <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Yopish
          </Button>
        </div>
      </div>
    </div>
  );
};
