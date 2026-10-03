import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, X, Check, ShieldCheck, Tag, Box, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import Constants from '../../constants/api';

export interface MxikItem {
  mxikCode: string;
  nameUz: string;
  nameRu: string;
  categoryUz: string;
  categoryRu: string;
  packageCode: string;
  packageName: string;
  unit: string;
  vatRate: number;
  isMarked: boolean;
  markingCategory: 'WATER_BEVERAGES' | 'PHARMACEUTICALS' | 'TOBACCO' | 'ALCOHOL' | 'APPLIANCES' | 'NONE';
}

interface MxikSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: MxikItem) => void;
  currentCode?: string;
}

export const MxikSearchModal: React.FC<MxikSearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentCode,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<{ uz: string; ru: string; count: number }[]>([]);
  const [items, setItems] = useState<MxikItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    if (!isOpen) return;
    axios
      .get(Constants.REGISTRY_MXIK_CATEGORIES_URL)
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setCategories(res.data.data);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  // Search items with debounce
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (selectedCategory) params.set('category', selectedCategory);

      axios
        .get(`${Constants.REGISTRY_MXIK_SEARCH_URL}?${params.toString()}`)
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data.data)) {
            setItems(res.data.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [isOpen, query, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/50">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 dark:bg-teal-950/80 dark:border-teal-800 dark:text-teal-300 text-[11px] font-bold">
                tasnif.soliq.uz
              </span>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Soliq MXIK / IKPU Tasniflagichi
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Oʻzbekiston elektron hisob-fakturalari va POS cheklar uchun rasmiy mahsulot kodi
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar & Category Filter */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mahsulot nomi yoki 17 xonali MXIK kodini kiriting (masalan: sement, shakar, dastur, arenda)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-950 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#028090] focus:outline-none"
            />
            {loading && (
              <RefreshCw size={15} className="absolute right-3.5 top-3 text-teal-600 animate-spin" />
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                !selectedCategory
                  ? 'bg-[#028090] text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200'
              }`}
            >
              Hammasi
            </button>
            {categories.map((cat) => (
              <button
                key={cat.uz}
                onClick={() => setSelectedCategory(selectedCategory === cat.uz ? '' : cat.uz)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.uz
                    ? 'bg-[#028090] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200'
                }`}
              >
                <span>{cat.uz}</span>
                <span className="text-[10px] opacity-70">({cat.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[50vh]">
          {loading && items.length === 0 ? (
            <div className="py-12 text-center text-gray-400 dark:text-slate-500">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-teal-600" />
              <span>Katalogdan qidirilmoqda...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-gray-400 dark:text-slate-500">
              <AlertCircle size={28} className="mx-auto mb-2 opacity-50" />
              <span>Hech qanday MXIK kodi topilmadi. Qidiruv soʻzini oʻzgartirib koʻring.</span>
            </div>
          ) : (
            items.map((item) => {
              const isCurrent = currentCode === item.mxikCode;
              return (
                <div
                  key={item.mxikCode}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:border-teal-500 hover:shadow-sm ${
                    isCurrent
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30'
                      : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-teal-300">
                          {item.mxikCode}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                          {item.categoryUz}
                        </span>
                        {item.vatRate === 0 ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                            QQS 0% (Imtiyoz)
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                            QQS 12%
                          </span>
                        )}
                        {item.isMarked && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold flex items-center gap-1">
                            <ShieldCheck size={11} />
                            Asl Belgisi Markirovkasi
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                        {item.nameUz}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400">
                        {item.nameRu}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-gray-500 dark:text-slate-400 pt-1">
                        <span>Qadoq: <strong>{item.packageName}</strong> ({item.packageCode})</span>
                        <span>Oʻlchov birligi: <strong>{item.unit}</strong></span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 hover:bg-teal-600 hover:text-white text-gray-700 dark:bg-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {isCurrent ? 'Tanlangan ✓' : 'Tanlash'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-gray-500">
          <span>Oʻzbekiston Respublikasi Vazirlar Mahkamasining 249-son qarori</span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs font-semibold rounded-lg text-gray-600 hover:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};

export default MxikSearchModal;
