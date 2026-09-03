import React, { useState, useRef } from 'react';
import { Printer, X, Tag, Barcode, Copy, Check, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Button } from '@components/ui';

interface ProductItem {
  id: string;
  name: string;
  code: string;
  selling_price: number;
  barcode?: string;
}

interface BarcodeLabelPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  companyName?: string;
}

type LabelSize = '30x20' | '40x25' | '58x40';

export const BarcodeLabelPrintModal: React.FC<BarcodeLabelPrintModalProps> = ({
  isOpen,
  onClose,
  products,
  companyName = 'OOO "RIZOBAY STROY"',
}) => {
  const [selectedSize, setSelectedSize] = useState<LabelSize>('40x25');
  const [copies, setCopies] = useState<number>(1);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showCompanyName, setShowCompanyName] = useState<boolean>(true);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handlePrint = () => {
    window.print();
  };

  // Dimensions based on size in mm
  const sizeStyles = {
    '30x20': { width: '30mm', minHeight: '20mm', fontSize: '9px', barcodeHeight: '24px' },
    '40x25': { width: '40mm', minHeight: '25mm', fontSize: '10px', barcodeHeight: '32px' },
    '58x40': { width: '58mm', minHeight: '40mm', fontSize: '12px', barcodeHeight: '48px' },
  }[selectedSize];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0B2B33] to-[#0D3B46] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#02C39A] text-[#0B2B33] flex items-center justify-center font-black shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Shtrix-kodli Narx Yorliqlari (Tsennik)</h3>
              <p className="text-[11px] text-[#02C39A]">Termo-printerlar uchun narx va EAN-13 shtrix-kod chop etish</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            {/* Product Selector */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Mahsulotni tanlang</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-2 bg-white rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-[#028090] focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Label Size */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Yorliq Oʻlchami (Sticker)</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value as LabelSize)}
                className="w-full p-2 bg-white rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-[#028090] focus:outline-none"
              >
                <option value="30x20">30 × 20 mm (Kichik)</option>
                <option value="40x25">40 × 25 mm (Standart Chakana)</option>
                <option value="58x40">58 × 40 mm (Katta Ombor)</option>
              </select>
            </div>

            {/* Copies */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Nusxalar soni</label>
              <div className="flex items-center gap-1">
                {[1, 2, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCopies(num)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                      copies === num
                        ? 'bg-[#028090] text-white border-[#028090]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {num} ta
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={(e) => setShowPrice(e.target.checked)}
                className="rounded text-[#028090] focus:ring-[#028090]"
              />
              <span>Narxni koʻrsatish (soʻm)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCompanyName}
                onChange={(e) => setShowCompanyName(e.target.checked)}
                className="rounded text-[#028090] focus:ring-[#028090]"
              />
              <span>Korxona nomini koʻrsatish</span>
            </label>
          </div>

          {/* Live Preview of Thermal Label */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Yorliq Oldindan Koʻrish (Live Preview)
            </h4>
            <div className="p-8 bg-slate-100 rounded-2xl border border-dashed border-slate-300 flex items-center justify-center min-h-[160px]">
              {/* Individual Label Card */}
              <div
                className="bg-white rounded shadow-md border border-slate-300 p-2.5 flex flex-col justify-between items-center text-center font-sans"
                style={{
                  width: selectedSize === '30x20' ? '180px' : selectedSize === '40x25' ? '230px' : '290px',
                  minHeight: selectedSize === '30x20' ? '110px' : selectedSize === '40x25' ? '140px' : '190px',
                }}
              >
                {showCompanyName && (
                  <div className="text-[10px] font-bold text-slate-600 truncate max-w-full">
                    {companyName}
                  </div>
                )}
                <div className="text-xs font-extrabold text-slate-900 leading-tight line-clamp-2 mt-0.5">
                  {currentProduct?.name || 'Mahsulot Nomi'}
                </div>

                {/* Barcode Visual Representation */}
                <div className="my-1.5 flex flex-col items-center">
                  <div className="flex items-end justify-center gap-[2px] h-8 px-2 bg-slate-50 rounded">
                    {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6].map((w, i) => (
                      <div
                        key={i}
                        className="bg-black"
                        style={{
                          width: `${(w % 2) + 1.5}px`,
                          height: `${18 + (i % 3) * 4}px`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="font-mono text-[10px] tracking-widest text-slate-800 font-bold mt-0.5">
                    {currentProduct?.barcode || currentProduct?.code || '4780001234567'}
                  </div>
                </div>

                {showPrice && (
                  <div className="text-sm font-black text-slate-950">
                    {(currentProduct?.selling_price || 0).toLocaleString()} <span className="text-[10px] font-bold">soʻm</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Jami: <strong className="text-slate-800">{copies} ta</strong> yorliq chop etiladi
          </span>
          <div className="flex items-center gap-2.5">
            <Button variant="outline" onClick={onClose} className="text-xs font-bold border-slate-300 cursor-pointer">
              Yopish
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-[#028090] hover:bg-[#026c7a] text-white font-bold text-xs px-5 py-2.5 shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Printerga Yuborish</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeLabelPrintModal;
