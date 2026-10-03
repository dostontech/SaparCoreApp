import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Package,
  Layers,
  Sparkles,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';

interface OsvItem {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  subconto?: string;
}

interface CounterpartyItem {
  inn: string;
  name: string;
  type: 'CUSTOMER' | 'SUPPLIER';
  balance: number;
  phone?: string;
  bankAccount?: string;
  bankMfo?: string;
}

interface InventoryItem {
  itemName: string;
  sku: string;
  ikpu?: string;
  unit: string;
  warehouseName: string;
  quantity: number;
  unitCost: number;
  accountCode: '1000' | '2910';
}

interface FixedAssetItem {
  assetName: string;
  inventoryNumber: string;
  commissioningDate: string;
  originalCost: number;
  accumulatedDepreciation: number;
  usefulLifeMonths: number;
  responsiblePerson?: string;
}

interface MigrationData {
  isCommitted: boolean;
  committedAt?: string;
  summary: {
    osvAccountsCount: number;
    totalDebit: number;
    totalCredit: number;
    diff: number;
    balanced: boolean;
    counterpartiesCount: number;
    totalReceivables: number;
    totalPayables: number;
    inventoryItemsCount: number;
    totalInventoryValue: number;
    fixedAssetsCount: number;
    totalFixedAssetsOriginalCost: number;
    totalFixedAssetsDepreciation: number;
  };
  draftDetails: {
    osvItems: OsvItem[];
    counterparties: CounterpartyItem[];
    inventory: InventoryItem[];
    fixedAssets: FixedAssetItem[];
  };
}

export const OneCMigrationPage: React.FC = () => {
  const { format } = useCurrencyFormatter();
  const [activeTab, setActiveTab] = useState<'OSV' | 'CONTRAGENTS' | 'INVENTORY' | 'ASSETS'>('OSV');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MigrationData | null>(null);
  const [committing, setCommitting] = useState(false);
  const [commitMessage, setCommitMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/accounting/1c-migration/status');
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch migration status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleCommit = async () => {
    if (!window.confirm('Barcha boshlangʻich qoldiqlarni SAPAR Bosh kitobiga (0000 schyot orqali) tasdiqlashni xohlaysizmi?')) {
      return;
    }
    setCommitting(true);
    setCommitMessage(null);
    try {
      const res = await axios.post('/api/admin/accounting/1c-migration/commit');
      setCommitMessage(res.data.message || 'Muvaffaqiyatli tasdiqlandi!');
      fetchStatus();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Tasdiqlashda xatolik yuz berdi');
    } finally {
      setCommitting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="w-8 h-8 text-[#028090] animate-spin" />
        <span className="ml-3 text-slate-600 font-medium">1C Maʼlumotlari tekshirilmoqda...</span>
      </div>
    );
  }

  const summary = data?.summary;
  const draft = data?.draftDetails;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#F0FBF8] text-[#028090] rounded-xl border border-[#02C39A]/20">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                1C:Бухгалтерия (Узбекистан) dan Maʼlumot Koʻchirish Markazi
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Boshlangʻich qoldiqlarni kiritish (Ввод начальных остатков) va 21-BHMS Bosh kitobiga oʻtkazish
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
            onClick={() => alert('1C Migration Excel Shablon yuklab olindi (1c_sapar_migration_template.xlsx)')}
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>1C Shablonini Yuklab Olish</span>
          </Button>

          <Button
            disabled={!summary?.balanced || data?.isCommitted || committing}
            className={`flex items-center gap-2 text-white font-medium ${
              data?.isCommitted
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : summary?.balanced
                ? 'bg-[#028090] hover:bg-[#026c7a]'
                : 'bg-slate-400 cursor-not-allowed'
            }`}
            onClick={handleCommit}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {data?.isCommitted
                ? '✅ Qoldiqlar Tasdiqlangan'
                : committing
                ? 'Bosh kitobga yozilmoqda...'
                : 'Bosh Kitobga Tasdiqlash (0000)'}
            </span>
          </Button>
        </div>
      </div>

      {/* Success Banner */}
      {commitMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold text-sm">{commitMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Balance Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Buxgalteriya Balansi</span>
            {summary?.balanced ? (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Balanslangan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5" /> Farq: {format(summary?.diff || 0)}
              </span>
            )}
          </div>
          <div className="mt-3">
            <div className="text-sm text-slate-600 flex justify-between">
              <span>Debet:</span> <span className="font-mono font-bold text-slate-800">{format(summary?.totalDebit || 0)}</span>
            </div>
            <div className="text-sm text-slate-600 flex justify-between mt-1">
              <span>Kredit:</span> <span className="font-mono font-bold text-slate-800">{format(summary?.totalCredit || 0)}</span>
            </div>
          </div>
        </div>

        {/* Counterparties */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Kontragentlar Saldosi</span>
            <Building2 className="w-4 h-4 text-[#028090]" />
          </div>
          <div className="mt-3">
            <div className="text-sm text-slate-600 flex justify-between">
              <span>Debitorlar (4010):</span>{' '}
              <span className="font-mono font-bold text-emerald-600">+{format(summary?.totalReceivables || 0)}</span>
            </div>
            <div className="text-sm text-slate-600 flex justify-between mt-1">
              <span>Kreditorlar (6010):</span>{' '}
              <span className="font-mono font-bold text-rose-600">-{format(summary?.totalPayables || 0)}</span>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ombor Zaxiralari (TMTs)</span>
            <Package className="w-4 h-4 text-[#028090]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900">
              {format(summary?.totalInventoryValue || 0)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {summary?.inventoryItemsCount} ta pozitsiya (1000 / 2910)
            </div>
          </div>
        </div>

        {/* Fixed Assets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Asosiy Vositalar (OS)</span>
            <Layers className="w-4 h-4 text-[#028090]" />
          </div>
          <div className="mt-3">
            <div className="text-sm text-slate-600 flex justify-between">
              <span>Boshlangʻich (0100):</span>{' '}
              <span className="font-mono font-bold text-slate-800">{format(summary?.totalFixedAssetsOriginalCost || 0)}</span>
            </div>
            <div className="text-sm text-slate-600 flex justify-between mt-1">
              <span>Eskirish (0200):</span>{' '}
              <span className="font-mono font-bold text-amber-600">-{format(summary?.totalFixedAssetsDepreciation || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/60 px-6 pt-4 gap-4">
          <button
            onClick={() => setActiveTab('OSV')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'OSV'
                ? 'border-[#028090] text-[#028090]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            1. Aylanma Vedomost Qoldiqlari (OSV)
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {draft?.osvItems?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('CONTRAGENTS')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'CONTRAGENTS'
                ? 'border-[#028090] text-[#028090]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            2. Kontragentlar Saldosi (Akt sverka)
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {draft?.counterparties?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'INVENTORY'
                ? 'border-[#028090] text-[#028090]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            3. Ombor & Tovar Qoldiqlari (TMTs)
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {draft?.inventory?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ASSETS')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'ASSETS'
                ? 'border-[#028090] text-[#028090]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            4. Asosiy Vositalar Kartochkalari (OS)
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {draft?.fixedAssets?.length || 0}
            </span>
          </button>
        </div>

        {/* Tab 1: OSV */}
        {activeTab === 'OSV' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                21-BHMS Hisoblar Rejasi Boʻyicha Boshlangʻich Saldolar
              </h2>
              <span className="text-xs text-slate-500">
                1C:Предприятие &quot;Оборотно-сальдовая ведомость&quot; dan import qilingan
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs uppercase">
                    <th className="py-3 px-4 w-28">Schyot</th>
                    <th className="py-3 px-4">Schyot Nomi (BHMS-21)</th>
                    <th className="py-3 px-4 text-right">Debet Saldo (soʻm)</th>
                    <th className="py-3 px-4 text-right">Kredit Saldo (soʻm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {draft?.osvItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#028090]">{item.accountCode}</td>
                      <td className="py-2.5 px-4 text-slate-800 font-medium">{item.accountName}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-700">
                        {item.debit > 0 ? format(item.debit) : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-700">
                        {item.credit > 0 ? format(item.credit) : '—'}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300">
                    <td colSpan={2} className="py-3 px-4 text-slate-900">
                      JAMI SALDO (BALANS TEKSHIRUVI):
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700 text-base">
                      {format(summary?.totalDebit || 0)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700 text-base">
                      {format(summary?.totalCredit || 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Counterparties */}
        {activeTab === 'CONTRAGENTS' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Xaridorlar va Yetkazib Beruvchilar Boshlangʻich Saldosi
              </h2>
              <span className="text-xs text-slate-500">
                1C &quot;Акт сверки взаиморасчетов&quot; boʻyicha tekshirilgan qoldiqlar
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs uppercase">
                    <th className="py-3 px-4 w-32">STIR / ИНН</th>
                    <th className="py-3 px-4">Kontragent Nomi</th>
                    <th className="py-3 px-4">Turi</th>
                    <th className="py-3 px-4">Bank Hisob-Raqami (20 xonali)</th>
                    <th className="py-3 px-4 text-right">Qoldiq Saldo (soʻm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {draft?.counterparties.map((cp, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-semibold text-slate-700">{cp.inn}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{cp.name}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            cp.type === 'CUSTOMER'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {cp.type === 'CUSTOMER' ? 'Xaridor (4010)' : 'Taʼminotchi (6010)'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-xs text-slate-600">{cp.bankAccount || '—'}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold">
                        {cp.balance > 0 ? (
                          <span className="text-emerald-600">+{format(cp.balance)} (Debitor)</span>
                        ) : (
                          <span className="text-rose-600">-{format(Math.abs(cp.balance))} (Kreditor)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Inventory */}
        {activeTab === 'INVENTORY' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Ombor Qoldiqlari (Materiallar va Tovarlar)
              </h2>
              <span className="text-xs text-slate-500">1C &quot;Ведомость по товарам на складах&quot;</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs uppercase">
                    <th className="py-3 px-4 w-28">Artikul / SKU</th>
                    <th className="py-3 px-4">Nomi & MXIK Kodi</th>
                    <th className="py-3 px-4">Ombor</th>
                    <th className="py-3 px-4 text-right">Miqdor</th>
                    <th className="py-3 px-4 text-right">Birlik Tannarxi</th>
                    <th className="py-3 px-4 text-right">Jami Summa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {draft?.inventory.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-xs font-bold text-slate-700">{inv.sku}</td>
                      <td className="py-2.5 px-4">
                        <div className="font-medium text-slate-900">{inv.itemName}</div>
                        <div className="text-xs font-mono text-slate-400">MXIK: {inv.ikpu || '—'}</div>
                      </td>
                      <td className="py-2.5 px-4 text-xs font-medium text-slate-600">{inv.warehouseName}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800">
                        {inv.quantity} {inv.unit}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700">{format(inv.unitCost)}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-[#028090]">
                        {format(inv.quantity * inv.unitCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Fixed Assets */}
        {activeTab === 'ASSETS' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Asosiy Vositalar Roʻyxati (0100 va 0200)
              </h2>
              <span className="text-xs text-slate-500">1C &quot;Инвентарная книга ОС&quot; (ОС-6)</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs uppercase">
                    <th className="py-3 px-4 w-28">Inv. Raqam</th>
                    <th className="py-3 px-4">Obyekt Nomi</th>
                    <th className="py-3 px-4">Kiritilgan Sana</th>
                    <th className="py-3 px-4 text-right">Boshlangʻich Qiymat (0100)</th>
                    <th className="py-3 px-4 text-right">Eskirish (0200)</th>
                    <th className="py-3 px-4 text-right">Qoldiq Qiymat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {draft?.fixedAssets.map((asset, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#028090]">{asset.inventoryNumber}</td>
                      <td className="py-2.5 px-4">
                        <div className="font-medium text-slate-900">{asset.assetName}</div>
                        <div className="text-xs text-slate-400">Javobgar: {asset.responsiblePerson || '—'}</div>
                      </td>
                      <td className="py-2.5 px-4 text-xs font-mono text-slate-600">{asset.commissioningDate}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800">
                        {format(asset.originalCost)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-amber-600">
                        -{format(asset.accumulatedDepreciation)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600">
                        {format(asset.originalCost - asset.accumulatedDepreciation)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OneCMigrationPage;
