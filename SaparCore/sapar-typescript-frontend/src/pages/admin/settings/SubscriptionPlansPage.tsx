import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CheckCircle2,
  SlidersHorizontal,
  Zap,
  Layers,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@components/ui';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';

interface PlanConfig {
  id: string;
  name: string;
  nameUz: string;
  pricePerMonth: number;
  description: string;
  modules: string[];
}

export const SubscriptionPlansPage: React.FC = () => {
  const { format } = useCurrencyFormatter();
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('ENTERPRISE_FULL');
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const MODULE_DEFINITIONS = [
    { key: 'accounting', label: '📖 21-son BHMS Buxgalteriya', desc: 'Hisoblar rejasi, 1/2-shakl hisobotlar, aylanma vedomost' },
    { key: 'banking', label: '🏦 Bank & Kassa (Cash)', desc: 'Bank hisoblari, kassa, xarajatlar va 1C koʻchirma import' },
    { key: 'pos', label: '🛒 POS Kassa Terminali', desc: 'Sensorli kassa, chek chop etish va kassa smenalari' },
    { key: 'sales', label: '🧾 Savdo & Hisob-fakturalar', desc: 'Fakturalar, tijorat takliflari, TTN va shablonlar' },
    { key: 'purchases', label: '🛍️ Xaridlar & Buyurtmalar', desc: 'Yetkazib beruvchilar va xarid buyurtmalari' },
    { key: 'inventory', label: '📦 Ombor & Tovarlar', desc: 'Koʻp omborli qoldiqlar, FIFO tannarx va tovarlar' },
    { key: 'crm', label: '💼 CRM & Bitimlar Quvuri', desc: 'Savdo bitimlari quvuri (Pipeline) va mijozlar' },
    { key: 'payroll', label: '👥 HRM, Davomat & Ish Haqi', desc: 'Oylik ish vaqti tabeli va maosh hisoblash' },
    { key: 'projects', label: '📁 Loyihalar Ish Maydoni', desc: 'Vazifalar Kanban va loyiha rentabelligi (P&L)' },
    { key: 'helpdesk', label: '🎧 Yordam Markazi (Helpdesk)', desc: 'Mijozlar murojaatlari va xizmat koʻrsatish' },
  ];

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await axios.get('/api/admin/subscriptions/current');
        if (res.data?.data) {
          setPlans(res.data.data.availablePlans || []);
          setSelectedPlanId(res.data.data.currentPlan?.id || 'ENTERPRISE_FULL');
          setActiveModules(res.data.data.activeModules || []);
        }
      } catch (err) {
        console.error('Failed to load subscription info', err);
      }
    };
    fetchSubscription();
  }, []);

  const handleSelectPlan = (plan: PlanConfig) => {
    setSelectedPlanId(plan.id);
    setActiveModules(plan.modules);
  };

  const toggleModule = (moduleKey: string) => {
    if (activeModules.includes(moduleKey)) {
      setActiveModules(activeModules.filter((m) => m !== moduleKey));
    } else {
      setActiveModules([...activeModules, moduleKey]);
    }
  };

  const handleSavePlan = async () => {
    setIsSaving(true);
    try {
      await axios.post('/api/admin/subscriptions/update-plan', {
        planId: selectedPlanId,
        customModules: activeModules,
      });
      // Update local sidebar sync
      const visMap: Record<string, boolean> = {};
      MODULE_DEFINITIONS.forEach((m) => {
        visMap[m.key] = activeModules.includes(m.key);
      });
      localStorage.setItem('sapar_sidebar_modules', JSON.stringify(visMap));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Update plan error', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <Zap className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Tariflar va Obuna Boshqaruvi (Subscription & Feature Provisioning)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-11">
            Korxonangiz obunasiga mos tarif rejasini tanlang yoki faqat kerakli modullarni yoqing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Muvaffaqiyatli saqlandi!
            </span>
          )}
          <Button
            onClick={handleSavePlan}
            disabled={isSaving}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
          >
            {isSaving ? 'Saqlanmoqda...' : 'Oʻzgarishlarni Saqlash'}
          </Button>
        </div>
      </div>

      {/* Available Plans Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-700" />
          1. Standart Tarif Paketlari
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {plans.map((p) => {
            const isSelected = selectedPlanId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleSelectPlan(p)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-teal-800 bg-teal-100/60 px-2 py-0.5 rounded-full">
                      {p.id === 'ENTERPRISE_FULL' ? '🔥 Ommabop' : 'Paket'}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />}
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mt-2">{p.nameUz}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{p.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-base font-black text-slate-900 font-mono">
                    {format(p.pricePerMonth)}
                    <span className="text-[10px] font-normal text-slate-400"> /oy</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modular Feature Entitlement Toggles */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-teal-700" />
              2. Alohida Modullarni Yoqish / Oʻchirish (Feature Provisioning)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ushbu korxona xodimlari va foydalanuvchilariga ruxsat berilgan modullar ({activeModules.length} ta faol)
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveModules(MODULE_DEFINITIONS.map((m) => m.key))}
            className="text-xs text-slate-700"
          >
            Barchasini Faollashtirish
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MODULE_DEFINITIONS.map((m) => {
            const isEnabled = activeModules.includes(m.key);
            return (
              <div
                key={m.key}
                onClick={() => toggleModule(m.key)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  isEnabled
                    ? 'bg-teal-50/50 border-teal-300 shadow-2xs'
                    : 'bg-slate-50/60 border-slate-200 opacity-60'
                }`}
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900">{m.label}</h4>
                  <p className="text-[11px] text-slate-500">{m.desc}</p>
                </div>
                <div
                  className={`p-2 rounded-xl transition ${
                    isEnabled ? 'bg-teal-700 text-white shadow-xs' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isEnabled ? <Eye size={15} /> : <EyeOff size={15} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansPage;
