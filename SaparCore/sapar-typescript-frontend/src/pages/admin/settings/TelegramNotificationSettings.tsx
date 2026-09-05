import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Send,
  CheckCircle2,
  BellRing,
  DollarSign,
  PackageCheck,
  Receipt,
  ShieldCheck,
  RefreshCw,
  Play,
  Sliders,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

import type { RootState } from '@store/index';
import { Button, Card, FormField, fieldControlClasses } from '@components/ui';
import { PageHeader } from '@/context/PageHeaderContext';

interface TelegramFormState {
  enabled: boolean;
  botToken: string;
  chatId: string;
  dailySummaryEnabled: boolean;
  dailySummaryTime: string;
  shiftZReportEnabled: boolean;
  lowStockAlertEnabled: boolean;
  minStockThreshold: number;
}

export default function TelegramNotificationSettings() {
  const token = useSelector((s: RootState) => s.auth.token);
  const [form, setForm] = useState<TelegramFormState>({
    enabled: true,
    botToken: '',
    chatId: '',
    dailySummaryEnabled: true,
    dailySummaryTime: '21:00',
    shiftZReportEnabled: true,
    lowStockAlertEnabled: true,
    minStockThreshold: 5,
  });

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [triggeringSummary, setTriggeringSummary] = useState(false);
  const [triggeringStock, setTriggeringStock] = useState(false);
  const [pairingCode, setPairingCode] = useState<string>('');
  const [pairingLink, setPairingLink] = useState<string>('');
  const [directInput, setDirectInput] = useState<string>('');
  const [pairingLoading, setPairingLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  async function loadSettings() {
    try {
      const res = await axios.get('/api/admin/settings/telegram', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.data) {
        setForm(res.data.data);
      }
    } catch {
      /* ignore */
    }
  }

  async function fetchPairingCode() {
    try {
      const res = await axios.get('/api/admin/settings/telegram/pair-code', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.data) {
        setPairingCode(res.data.data.code);
        setPairingLink(res.data.data.telegramLink);
      }
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    loadSettings();
    fetchPairingCode();
    /* eslint-disable-next-line */
  }, []);

  function update<K extends keyof TelegramFormState>(key: K, value: TelegramFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setLoading(true);
    try {
      const res = await axios.post('/api/admin/settings/telegram', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data?.message || 'Telegram sozlamalari saqlandi');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Sozlamalarni saqlashda xatolik');
    } finally {
      setLoading(false);
    }
  }

  async function handleDirectPair() {
    if (!directInput.trim()) {
      toast.error('Telegram username yoki Chat ID kiriting');
      return;
    }
    setPairingLoading(true);
    try {
      const res = await axios.post(
        '/api/admin/settings/telegram/pair-direct',
        { chatIdOrUsername: directInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data?.message || 'Telegram hisobingiz ulandi');
      loadSettings();
      setDirectInput('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Ulashda xatolik');
    } finally {
      setPairingLoading(false);
    }
  }

  async function handleTestConnection() {
    setTesting(true);
    try {
      const res = await axios.post(
        '/api/admin/settings/telegram/test',
        { botToken: form.botToken, chatId: form.chatId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data?.message || 'Sinov xabari yuborildi');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Ulanishda xatolik');
    } finally {
      setTesting(false);
    }
  }

  async function handleTriggerSummary() {
    setTriggeringSummary(true);
    try {
      const res = await axios.post(
        '/api/admin/settings/telegram/trigger-daily-summary',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data?.message || 'Kunlik xulosa yuborildi');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Xulosani yuborishda xatolik');
    } finally {
      setTriggeringSummary(false);
    }
  }

  async function handleTriggerStock() {
    setTriggeringStock(true);
    try {
      const res = await axios.post(
        '/api/admin/settings/telegram/trigger-low-stock',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data?.message || 'Ombor tekshiruvi amalga oshirildi');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Tekshiruvda xatolik');
    } finally {
      setTriggeringStock(false);
    }
  }

  const controlClass = typeof fieldControlClasses === 'function' ? fieldControlClasses() : fieldControlClasses;
  const isConnected = !!form.chatId && form.enabled;

  return (
    <div className="space-y-6">
      <PageHeader title="Telegram Boshqaruv Boti Sozlamalari">
        <Button
          type="button"
          variant="primary"
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          {loading ? 'Saqlanmoqda...' : 'Sozlamalarni Saqlash'}
        </Button>
      </PageHeader>

      {/* 1-Click Simple Client Hero Card */}
      <div className="bg-gradient-to-r from-[#028090] to-[#02C39A] rounded-2xl p-6 text-white shadow-lg shadow-teal-900/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              1 Bosishda Ulash (Oddiy Mijozlar Uchun)
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Telegram Bildirishnomalarini Yoqish</h2>
            <p className="text-teal-50 text-sm max-w-xl leading-relaxed">
              Bot yaratish shart emas! Telegramingizni ulash uchun quyidagi tugmani bosing yoki Telegram username / Chat ID raqamingizni kiriting.
            </p>
          </div>

          <div className="bg-white text-gray-900 p-5 rounded-xl shadow-md min-w-[280px] space-y-3">
            <div className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Ulanish Holati</div>
            {isConnected ? (
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span>Ulangan ({form.chatId})</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded border border-amber-200">
                  Hali ulanmagan
                </div>
                {pairingCode && (
                  <div className="text-center bg-gray-50 p-2 rounded border border-gray-200">
                    <div className="text-[11px] text-gray-500 uppercase">Ulanish Kodi:</div>
                    <div className="font-mono text-lg font-bold text-teal-700">{pairingCode}</div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-1">
              <a
                href={pairingLink || 'https://t.me/sapar_test'}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-xs"
              >
                <Send className="h-4 w-4" />
                Telegramda Ochish va Ulash
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            </div>
          </div>
        </div>

        {/* Quick Username / Chat ID Input */}
        <div className="mt-6 pt-5 border-t border-white/20 flex flex-col sm:flex-row items-center gap-3">
          <span className="text-xs text-teal-50 font-medium whitespace-nowrap">
            Yoki toʻgʻridan-toʻgʻri username/Chat ID bilan ulaning:
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
            <input
              type="text"
              value={directInput}
              onChange={(e) => setDirectInput(e.target.value)}
              placeholder="Masalan: @sapar_test yoki 987654321"
              className="bg-white/10 text-white placeholder:text-white/60 border border-white/30 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 w-full"
            />
            <button
              type="button"
              onClick={handleDirectPair}
              disabled={pairingLoading}
              className="bg-white text-teal-900 font-bold px-4 py-2 rounded-lg text-sm hover:bg-teal-50 transition-colors whitespace-nowrap"
            >
              {pairingLoading ? 'Ulanmoqda...' : 'Ulash'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Notification Triggers */}
          <Card className="p-6">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-gray-100">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base">Avtomatik Bildirishnomalar Turlari</h3>
                <p className="text-xs text-gray-500">Qaysi hisobotlar Telegramga borishini belgilang</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Trigger 1: Daily Summary */}
              <div className="flex items-start justify-between p-3.5 rounded-lg border border-gray-100 bg-gray-50/50">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded bg-white shadow-xs border border-gray-200 text-teal-700 mt-0.5">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">Kunlik Moliya va Foyda Xulosasi</div>
                    <div className="text-xs text-gray-500 mt-0.5">Har kuni kechki vaqtda jami savdo, naqd/karta tushumlari va sof foyda hisoboti</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.dailySummaryEnabled}
                  onChange={(e) => update('dailySummaryEnabled', e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 h-4 w-4 mt-1"
                />
              </div>

              {/* Trigger 2: Shift Z-Report */}
              <div className="flex items-start justify-between p-3.5 rounded-lg border border-gray-100 bg-gray-50/50">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded bg-white shadow-xs border border-gray-200 text-teal-700 mt-0.5">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">POS Kassir Smena Z-Hisobotlari</div>
                    <div className="text-xs text-gray-500 mt-0.5">Kassir smenani yopganda, kassa balansi, naqd va terminal tushumi toʻgʻridan-toʻgʻri yuboriladi</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.shiftZReportEnabled}
                  onChange={(e) => update('shiftZReportEnabled', e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 h-4 w-4 mt-1"
                />
              </div>

              {/* Trigger 3: Low Stock Alert */}
              <div className="flex items-start justify-between p-3.5 rounded-lg border border-gray-100 bg-gray-50/50">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded bg-white shadow-xs border border-gray-200 text-teal-700 mt-0.5">
                    <PackageCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">Ombor Minimal Qoldiq Ogohlantirishlari</div>
                    <div className="text-xs text-gray-500 mt-0.5">Tovarlar soni minimal meʼyordan kam qolganda avtomatik signal berish</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.lowStockAlertEnabled}
                  onChange={(e) => update('lowStockAlertEnabled', e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 h-4 w-4 mt-1"
                />
              </div>

              {/* Threshold input */}
              <div className="pt-2">
                <FormField label="Standart Minimal Qoldiq Chegarasi (Dona / Oʻlchov birligi)">
                  <input
                    type="number"
                    min="1"
                    value={form.minStockThreshold}
                    onChange={(e) => update('minStockThreshold', Number(e.target.value))}
                    className={controlClass}
                  />
                </FormField>
              </div>
            </div>
          </Card>

          {/* Collapsible Card: Advanced Custom Bot Settings */}
          <Card className="p-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-gray-100 text-gray-700">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base">Shaxsiy Bot Rekvizitlari (Ixtiyoriy / Katta Korxonalar Uchun)</h3>
                  <p className="text-xs text-gray-500">Agar oʻz kompaniyangiz nomidagi alohida botdan foydalanmoqchi boʻlsangiz</p>
                </div>
              </div>
              {showAdvanced ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
            </button>

            {showAdvanced && (
              <div className="space-y-4 pt-5 mt-4 border-t border-gray-100">
                <FormField label="Shaxsiy Telegram Bot Tokeni">
                  <input
                    type="text"
                    value={form.botToken}
                    onChange={(e) => update('botToken', e.target.value)}
                    placeholder="Masalan: 7412345678:AAFakeTokenForSaparManagementBot"
                    className={controlClass}
                  />
                </FormField>

                <FormField label="Chat ID / Guruh ID">
                  <input
                    type="text"
                    value={form.chatId}
                    onChange={(e) => update('chatId', e.target.value)}
                    placeholder="Masalan: -1001234567890 yoki @sapar_test"
                    className={controlClass}
                  />
                </FormField>

                <div className="flex items-center justify-end pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={testing || !form.enabled}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
                    Aloqani Sinash (Test Message)
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Info & Quick Action Column */}
        <div className="space-y-6">
          {/* Quick Manual Actions */}
          <Card className="p-6">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-gray-100">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base">Qoʻlda Yuborish (Tezkor)</h3>
                <p className="text-xs text-gray-500">Hozirgi holat boʻyicha Telegramga darhol hisobot joʻnatish</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTriggerSummary}
                disabled={triggeringSummary || !isConnected}
                className="w-full flex items-center justify-center gap-2 py-2.5"
              >
                <Play className="h-4 w-4 text-teal-600" />
                {triggeringSummary ? 'Yuborilmoqda...' : 'Kunlik Xulosani Hozir Yuborish'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleTriggerStock}
                disabled={triggeringStock || !isConnected}
                className="w-full flex items-center justify-center gap-2 py-2.5"
              >
                <PackageCheck className="h-4 w-4 text-amber-600" />
                {triggeringStock ? 'Tekshirilmoqda...' : 'Kam Qolgan Tovarlarni Tekshirish'}
              </Button>
            </div>
          </Card>

          {/* Security & Verification Card */}
          <Card className="p-6">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-gray-100">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base">Xavfsizlik va Maxfiylik</h3>
                <p className="text-xs text-gray-500">Toʻgʻridan-toʻgʻri shifrlangan kanal</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Barcha xabarnomalar Telegram rasmiy HTTPS shifrlangan protokoli orqali toʻgʻridan-toʻgʻri sizning yopiq chat yoki guruhingizga yetkaziladi. Hech qanday uchinchi tomon serverlarida saqlanmaydi.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
