import React from 'react';
import {
  X,
  Barcode,
  Package,
  ShieldCheck,
  ShoppingCart,
  Percent,
} from 'lucide-react';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
  onAddToCart: (product: any) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
}) => {
  const { format } = useCurrencyFormatter();
  if (!isOpen || !product) return null;

  const price = product.price || 0;
  const vatRate = 0.12; // 12% Uzbekistan VAT (QQS)
  const netPrice = Math.round(price / (1 + vatRate));
  const vatAmount = price - netPrice;
  const costPrice = product.costPrice || Math.round(price * 0.72);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              {product.category || 'Tovarlar'}
            </span>
            <h3 className="text-lg font-black text-slate-900 leading-snug">
              {product.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Attributes Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Barcode & SKU */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
              <Barcode className="w-3.5 h-3.5 text-teal-700" />
              Shtrix-kod & SKU
            </span>
            <p className="text-xs font-mono font-bold text-slate-900">
              {product.barcode || '4780001234567'}
            </p>
            <p className="text-[10px] font-mono text-slate-500">
              SKU: {product.sku || 'SKU-001'}
            </p>
          </div>

          {/* Stock Level */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-teal-700" />
              Ombordagi Mavjud Qoldiq
            </span>
            <p className="text-base font-mono font-black text-emerald-700">
              {product.stock ?? 120} {product.unit || 'dona'}
            </p>
            <p className="text-[10px] text-emerald-600 font-bold">
              ✓ Yetarli miqdorda
            </p>
          </div>

          {/* Soliq IKPU / MXIK Code */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 col-span-2">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              Milliy MXIK / IKPU Kodi (Soliq Tasniflagichi)
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                {product.ikpu || '02102001001000000'}
              </span>
              <span className="text-[11px] text-slate-500">
                QQS stavkasi: 12%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & VAT Breakdown */}
        <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>Sof narx (QQSsiz):</span>
            <span className="font-mono font-bold text-slate-900">{format(netPrice)}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Percent className="w-3 h-3 text-teal-700" /> QQS (12%):
            </span>
            <span className="font-mono font-bold text-teal-800">{format(vatAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>Tannarx (Xarid):</span>
            <span className="font-mono text-slate-500">{format(costPrice)}</span>
          </div>
          <div className="border-t border-teal-200/80 pt-2 flex justify-between items-center">
            <span className="text-sm font-black text-slate-900">Yakuniy Sotish Narxi:</span>
            <span className="text-lg font-black text-teal-900 font-mono">{format(price)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-1/3 text-xs font-bold border-slate-200 text-slate-700"
          >
            Yopish
          </Button>
          <Button
            onClick={() => {
              onAddToCart(product);
              onClose();
            }}
            className="w-2/3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-xs"
          >
            <ShoppingCart className="w-4 h-4" />
            Savatga Qoʻshish (+1)
          </Button>
        </div>
      </div>
    </div>
  );
};
