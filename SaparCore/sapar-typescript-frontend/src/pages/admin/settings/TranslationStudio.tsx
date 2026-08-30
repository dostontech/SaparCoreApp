import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Languages,
  Search,
  Download,
  Plus,
  Sparkles,
  Filter,
} from 'lucide-react';
import { PageHeader } from '@/context/PageHeaderContext';
import { Button, Badge } from '@components/ui';

import enJson from '@/locales/en.json';
import uzJson from '@/locales/uz.json';
import ozJson from '@/locales/oz.json';
import ruJson from '@/locales/ru.json';

interface FlatTranslationRow {
  key: string;
  category: string;
  en: string;
  uz: string;
  oz: string;
  ru: string;
}

// Helper to flatten nested objects into dot-notation keys
const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      const val = obj[k];
      const newKey = prefix ? `${prefix}.${k}` : k;
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        Object.assign(result, flattenObject(val, newKey));
      } else {
        result[newKey] = String(val ?? '');
      }
    }
  }
  return result;
};

// Helper to unflatten dot-notation keys back into a nested JSON object
const unflattenObject = (data: Record<string, string>): any => {
  const result: any = {};
  for (const key in data) {
    const keys = key.split('.');
    let current = result;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (i === keys.length - 1) {
        current[k] = data[key];
      } else {
        current[k] = current[k] || {};
        current = current[k];
      }
    }
  }
  return result;
};

export const TranslationStudio: React.FC = () => {
  const { i18n } = useTranslation();

  // Load baseline flattened dictionaries
  const [translations, setTranslations] = useState<FlatTranslationRow[]>(() => {
    const flatEn = flattenObject(enJson);
    const flatUz = flattenObject(uzJson);
    const flatOz = flattenObject(ozJson);
    const flatRu = flattenObject(ruJson);

    const allKeys = Array.from(
      new Set([
        ...Object.keys(flatEn),
        ...Object.keys(flatUz),
        ...Object.keys(flatOz),
        ...Object.keys(flatRu),
      ])
    ).sort();

    return allKeys.map((key) => {
      const parts = key.split('.');
      const category = parts.length > 1 ? parts[0] : 'common';
      return {
        key,
        category,
        en: flatEn[key] || '',
        uz: flatUz[key] || '',
        oz: flatOz[key] || '',
        ru: flatRu[key] || '',
      };
    });
  });

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKey, setNewKey] = useState({ category: 'common', keyName: '', en: '', uz: '', oz: '', ru: '' });

  // Get distinct categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(translations.map((t) => t.category))).sort();
    return ['ALL', ...cats];
  }, [translations]);

  // Filter rows based on search, category and missing status
  const filteredRows = useMemo(() => {
    return translations.filter((row) => {
      if (selectedCategory !== 'ALL' && row.category !== selectedCategory) {
        return false;
      }
      if (onlyMissing && row.en && row.uz && row.oz && row.ru) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matches =
          row.key.toLowerCase().includes(q) ||
          row.en.toLowerCase().includes(q) ||
          row.uz.toLowerCase().includes(q) ||
          row.oz.toLowerCase().includes(q) ||
          row.ru.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [translations, selectedCategory, onlyMissing, search]);

  // Update a specific cell
  const handleCellChange = (key: string, lang: 'en' | 'uz' | 'oz' | 'ru', value: string) => {
    setTranslations((prev) =>
      prev.map((row) => (row.key === key ? { ...row, [lang]: value } : row))
    );
  };

  // Live Apply to i18next runtime
  const handleApplyRuntime = () => {
    try {
      const enDict: Record<string, string> = {};
      const uzDict: Record<string, string> = {};
      const ozDict: Record<string, string> = {};
      const ruDict: Record<string, string> = {};

      translations.forEach((t) => {
        if (t.en) enDict[t.key] = t.en;
        if (t.uz) uzDict[t.key] = t.uz;
        if (t.oz) ozDict[t.key] = t.oz;
        if (t.ru) ruDict[t.key] = t.ru;
      });

      i18n.addResourceBundle('en', 'translation', unflattenObject(enDict), true, true);
      i18n.addResourceBundle('uz', 'translation', unflattenObject(uzDict), true, true);
      i18n.addResourceBundle('oz', 'translation', unflattenObject(ozDict), true, true);
      i18n.addResourceBundle('ru', 'translation', unflattenObject(ruDict), true, true);

      toast.success("Barcha tarjimalar jonli tizimga qoʻllandi va yangilandi! (Live Applied)");
    } catch (err) {
      console.error("Apply failed:", err);
      toast.error("Tarjimalarni qoʻllashda xatolik yuz berdi");
    }
  };

  // Download all 4 JSON files
  const handleExportJson = (lang: 'en' | 'uz' | 'oz' | 'ru') => {
    const dict: Record<string, string> = {};
    translations.forEach((t) => {
      dict[t.key] = t[lang] || '';
    });
    const nested = unflattenObject(dict);
    const blob = new Blob([JSON.stringify(nested, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lang}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${lang}.json fayli muvaffaqiyatli yuklab olindi!`);
  };

  // Add new translation key
  const handleAddNewKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.keyName.trim()) {
      toast.error("Iltimos, kalit nomini kiriting");
      return;
    }
    const fullKey = `${newKey.category}.${newKey.keyName.trim()}`;
    if (translations.some((t) => t.key === fullKey)) {
      toast.error("Ushbu kalit allaqachon mavjud!");
      return;
    }

    setTranslations((prev) => [
      ...prev,
      {
        key: fullKey,
        category: newKey.category,
        en: newKey.en,
        uz: newKey.uz,
        oz: newKey.oz,
        ru: newKey.ru,
      },
    ]);
    setShowAddModal(false);
    setNewKey({ category: 'common', keyName: '', en: '', uz: '', oz: '', ru: '' });
    toast.success(`Yangi kalit (${fullKey}) qoʻshildi!`);
  };

  // Missing stats
  const missingCount = useMemo(() => {
    return translations.filter((r) => !r.en || !r.uz || !r.oz || !r.ru).length;
  }, [translations]);

  return (
    <div className="space-y-5 pb-20 max-w-[1600px] mx-auto font-sans">
      <PageHeader title="Tarjimalar va Matnlar Studiyasi (Translation Studio)">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="white"
            size="sm"
            onClick={handleApplyRuntime}
            leftIcon={<Sparkles size={14} className="text-teal-600" />}
          >
            Jonli Qoʻllash (Live Apply)
          </Button>

          <div className="relative inline-block text-left">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-2xs">
              <span className="text-xs font-bold text-gray-500 px-2 flex items-center gap-1">
                <Download size={13} /> Eksport:
              </span>
              <button
                type="button"
                onClick={() => handleExportJson('uz')}
                className="px-2 py-1 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition cursor-pointer"
              >
                uz.json
              </button>
              <button
                type="button"
                onClick={() => handleExportJson('oz')}
                className="px-2 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition cursor-pointer"
              >
                oz.json
              </button>
              <button
                type="button"
                onClick={() => handleExportJson('ru')}
                className="px-2 py-1 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer"
              >
                ru.json
              </button>
              <button
                type="button"
                onClick={() => handleExportJson('en')}
                className="px-2 py-1 text-xs font-bold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition cursor-pointer"
              >
                en.json
              </button>
            </div>
          </div>

          <Button size="sm" onClick={() => setShowAddModal(true)} leftIcon={<Plus size={14} />}>
            Yangi Matn / Kalit
          </Button>
        </div>
      </PageHeader>

      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
            <Languages size={14} /> Koʻp tilli Lokalizatsiya Tizimi
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Platformaning Barcha Soʻz va Matnlarini Boshqarish
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Har qanday menyu, hisobot, hisob-faktura, tugma yoki xabarni 4 ta tilda (Oʻzbekcha Lotin, Ўзбекча Кирилл, Русский, English) bir joyda qidirish, qoʻlda tahrirlash va jonli yangilash imkoniyati.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
          <div className="text-center px-3 border-r border-white/20">
            <div className="text-2xl font-black font-mono text-teal-300">{translations.length}</div>
            <div className="text-[11px] text-slate-300">Jami Matnlar</div>
          </div>
          <div className="text-center px-3">
            <div className="text-2xl font-black font-mono text-amber-400">{missingCount}</div>
            <div className="text-[11px] text-slate-300">Toʻldirilmagan</div>
          </div>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-gray-500 flex items-center gap-1 px-1">
            <Filter size={13} /> Kategoriya:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer select-none bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
            <input
              type="checkbox"
              checked={onlyMissing}
              onChange={(e) => setOnlyMissing(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>Faqat yetishmayotganlar ({missingCount})</span>
          </label>

          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Qidirish (Key, soʻz, matn)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Translations Master Grid - Single Clean Flow, No Inner Overflow Scrollbar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 w-56 min-w-[200px]">Kalit (Key ID)</th>
                <th className="p-3 min-w-[240px]">
                  <span className="flex items-center gap-1.5 text-teal-950 font-black">
                    🇺🇿 Oʻzbekcha (Lotin)
                  </span>
                </th>
                <th className="p-3 min-w-[240px]">
                  <span className="flex items-center gap-1.5 text-emerald-950 font-black">
                    🇺🇿 Ўзбекча (Кирилл)
                  </span>
                </th>
                <th className="p-3 min-w-[240px]">
                  <span className="flex items-center gap-1.5 text-blue-950 font-black">
                    🇷🇺 Русский
                  </span>
                </th>
                <th className="p-3 min-w-[240px]">
                  <span className="flex items-center gap-1.5 text-indigo-950 font-black">
                    🇬🇧 English
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRows.map((row) => (
                <tr key={row.key} className="hover:bg-teal-50/20 transition-colors">
                  <td className="p-2.5 align-middle">
                    <span className="font-mono text-[11px] font-bold text-slate-700 block break-all">
                      {row.key}
                    </span>
                    <Badge color="gray" className="text-[9px] mt-0.5">
                      {row.category}
                    </Badge>
                  </td>
                  <td className="p-1.5 align-middle">
                    <input
                      type="text"
                      value={row.uz}
                      onChange={(e) => handleCellChange(row.key, 'uz', e.target.value)}
                      placeholder="Oʻzbekcha matn..."
                      className={`w-full px-2.5 py-2 text-xs rounded-lg border transition focus:ring-2 focus:ring-teal-500 bg-white font-medium ${
                        !row.uz ? 'border-amber-300 bg-amber-50/40' : 'border-gray-200'
                      }`}
                    />
                  </td>
                  <td className="p-1.5 align-middle">
                    <input
                      type="text"
                      value={row.oz}
                      onChange={(e) => handleCellChange(row.key, 'oz', e.target.value)}
                      placeholder="Ўзбекча кириллча..."
                      className={`w-full px-2.5 py-2 text-xs rounded-lg border transition focus:ring-2 focus:ring-emerald-500 bg-white font-medium ${
                        !row.oz ? 'border-amber-300 bg-amber-50/40' : 'border-gray-200'
                      }`}
                    />
                  </td>
                  <td className="p-1.5 align-middle">
                    <input
                      type="text"
                      value={row.ru}
                      onChange={(e) => handleCellChange(row.key, 'ru', e.target.value)}
                      placeholder="Русский перевод..."
                      className={`w-full px-2.5 py-2 text-xs rounded-lg border transition focus:ring-2 focus:ring-blue-500 bg-white font-medium ${
                        !row.ru ? 'border-amber-300 bg-amber-50/40' : 'border-gray-200'
                      }`}
                    />
                  </td>
                  <td className="p-1.5 align-middle">
                    <input
                      type="text"
                      value={row.en}
                      onChange={(e) => handleCellChange(row.key, 'en', e.target.value)}
                      placeholder="English text..."
                      className={`w-full px-2.5 py-2 text-xs rounded-lg border transition focus:ring-2 focus:ring-indigo-500 bg-white font-medium ${
                        !row.en ? 'border-amber-300 bg-amber-50/40' : 'border-gray-200'
                      }`}
                    />
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400 text-xs">
                    Hech qanday tarjima kaliti topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Translation Key Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Plus size={18} className="text-teal-600" />
                Yangi Tarjima Kaliti Qoʻshish
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddNewKey} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Kategoriya</label>
                  <select
                    value={newKey.category}
                    onChange={(e) => setNewKey({ ...newKey, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="common">common (Umumiy)</option>
                    <option value="nav">nav (Navigatsiya)</option>
                    <option value="accounting">accounting (Buxgalteriya)</option>
                    <option value="invoices">invoices (Hisob-fakturalar)</option>
                    <option value="purchases">purchases (Xaridlar)</option>
                    <option value="banking">banking (Bank & Kassa)</option>
                    <option value="reports">reports (Hisobotlar)</option>
                    <option value="settings">settings (Sozlamalar)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Kalit ID (camelCase) *</label>
                  <input
                    type="text"
                    required
                    placeholder="masalan: taxSummary"
                    value={newKey.keyName}
                    onChange={(e) => setNewKey({ ...newKey, keyName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">🇺🇿 Oʻzbekcha (Lotin)</label>
                <input
                  type="text"
                  placeholder="Oʻzbekcha tarjimasi"
                  value={newKey.uz}
                  onChange={(e) => setNewKey({ ...newKey, uz: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">🇺🇿 Ўзбекча (Кирилл)</label>
                <input
                  type="text"
                  placeholder="Ўзбекча кириллча таржимаси"
                  value={newKey.oz}
                  onChange={(e) => setNewKey({ ...newKey, oz: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">🇷🇺 Русский</label>
                <input
                  type="text"
                  placeholder="Перевод на русский"
                  value={newKey.ru}
                  onChange={(e) => setNewKey({ ...newKey, ru: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">🇬🇧 English</label>
                <input
                  type="text"
                  placeholder="English translation"
                  value={newKey.en}
                  onChange={(e) => setNewKey({ ...newKey, en: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button variant="white" size="sm" onClick={() => setShowAddModal(false)}>
                  Bekor qilish
                </Button>
                <Button type="submit" size="sm">
                  Qoʻshish va Saqlash
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationStudio;
