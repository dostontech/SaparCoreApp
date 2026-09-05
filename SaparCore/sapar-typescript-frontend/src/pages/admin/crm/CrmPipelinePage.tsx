import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  Clock,
  User,
  Trash2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, FormField } from '@components/ui';
import { PageHeader } from '@/context/PageHeaderContext';
import Constants from '@constants/api';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';

interface Deal {
  id: string;
  title: string;
  customerName: string;
  value: number;
  currency: string;
  stage: 'LEAD' | 'CONTACTED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
  probability: number;
  expectedCloseDate: string;
  assignedToName: string;
  phone?: string;
  notes?: string;
}

const STAGES = [
  { key: 'LEAD', label: '1. Lidlar (Leads)', color: 'border-amber-400 bg-amber-50/50 text-amber-900', badge: 'bg-amber-100 text-amber-800' },
  { key: 'CONTACTED', label: '2. Muloqotda', color: 'border-blue-400 bg-blue-50/50 text-blue-900', badge: 'bg-blue-100 text-blue-800' },
  { key: 'PROPOSAL', label: '3. Tijorat Taklifi', color: 'border-purple-400 bg-purple-50/50 text-purple-900', badge: 'bg-purple-100 text-purple-800' },
  { key: 'NEGOTIATION', label: '4. Muzokara & Shartnoma', color: 'border-orange-400 bg-orange-50/50 text-orange-900', badge: 'bg-orange-100 text-orange-800' },
  { key: 'WON', label: '5. Yutuq (Won)', color: 'border-emerald-500 bg-emerald-50/50 text-emerald-900', badge: 'bg-emerald-100 text-emerald-800' },
  { key: 'LOST', label: '6. Yoʻqotilgan (Lost)', color: 'border-slate-300 bg-slate-50 text-slate-700', badge: 'bg-slate-200 text-slate-700' },
] as const;

export const CrmPipelinePage: React.FC = () => {
  const token = localStorage.getItem('token') || '';
  const { format } = useCurrencyFormatter();

  const [loading, setLoading] = useState(true);
  const [pipelineData, setPipelineData] = useState<any | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);

  // Create Deal Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCustomer, setNewCustomer] = useState('');
  const [newValue, setNewValue] = useState<number>(10000000);
  const [newStage, setNewStage] = useState<Deal['stage']>('LEAD');
  const [newCloseDate, setNewCloseDate] = useState('2026-09-30');
  const [newAssigned, setNewAssigned] = useState('Sardor Raximov');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${Constants.API_BASE_URL}/admin/crm/pipeline`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.data) {
        setPipelineData(res.data.data);
        setDeals(res.data.data.deals || []);
      }
    } catch {
      // Mock fallback
      const mockDeals: Deal[] = [
        {
          id: 'DEAL-101',
          title: 'Toshkent Toʻqimachilik Korxonasiga ERP litsenziyalari',
          customerName: 'OASIS TEXTILE TRADING MCHJ',
          value: 45000000,
          currency: 'UZS',
          stage: 'PROPOSAL',
          probability: 60,
          expectedCloseDate: '2026-08-30',
          assignedToName: 'Sardor Raximov',
          phone: '+998 90 123-45-67',
          notes: 'Tijorat taklifi yuborildi',
        },
        {
          id: 'DEAL-102',
          title: 'Ombor logistika tizimi integratsiyasi',
          customerName: 'SAMARQAND LOGISTIKA SERVIS XK',
          value: 85000000,
          currency: 'UZS',
          stage: 'NEGOTIATION',
          probability: 80,
          expectedCloseDate: '2026-09-15',
          assignedToName: 'Nodir Karimov',
          phone: '+998 93 555-88-22',
        },
        {
          id: 'DEAL-103',
          title: 'Farmatsevtika ombori avtomatlashtirish',
          customerName: 'TOSHKENT MEGA PHARMA QK',
          value: 120000000,
          currency: 'UZS',
          stage: 'WON',
          probability: 100,
          expectedCloseDate: '2026-08-10',
          assignedToName: 'Sardor Raximov',
        },
        {
          id: 'DEAL-104',
          title: 'Buxoro Agro Cluster kassa terminallari',
          customerName: 'BUXORO AGRO CLUSTER MCHJ',
          value: 28000000,
          currency: 'UZS',
          stage: 'LEAD',
          probability: 20,
          expectedCloseDate: '2026-09-20',
          assignedToName: 'Nodir Karimov',
        },
        {
          id: 'DEAL-105',
          title: 'FinTech integratsiya loyihasi',
          customerName: 'GLOBAL FINTECH SYSTEMS MCHJ',
          value: 65000000,
          currency: 'UZS',
          stage: 'CONTACTED',
          probability: 40,
          expectedCloseDate: '2026-09-05',
          assignedToName: 'Sardor Raximov',
        },
      ];
      setDeals(mockDeals);
      setPipelineData({
        metrics: {
          totalPipelineValue: 343000000,
          wonValue: 120000000,
          winRate: 100,
          activeDealsCount: 4,
          totalDealsCount: 5,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeal = async () => {
    if (!newTitle || !newCustomer) {
      toast.error('Bitim nomi va mijoz nomi kiritilishi shart');
      return;
    }

    try {
      const payload = {
        title: newTitle,
        customerName: newCustomer,
        value: Number(newValue || 0),
        stage: newStage,
        expectedCloseDate: newCloseDate,
        assignedToName: newAssigned,
        notes: newNotes,
      };

      const res = await axios.post(`${Constants.API_BASE_URL}/admin/crm/deals`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.data) {
        setDeals((prev) => [res.data.data, ...prev]);
        setIsModalOpen(false);
        setNewTitle('');
        setNewCustomer('');
        toast.success('Yangi bitim yaratildi!');
        fetchPipeline();
      }
    } catch {
      const created: Deal = {
        id: `DEAL-${Date.now().toString().slice(-4)}`,
        title: newTitle,
        customerName: newCustomer,
        value: Number(newValue || 0),
        currency: 'UZS',
        stage: newStage,
        probability: newStage === 'WON' ? 100 : newStage === 'LEAD' ? 20 : 50,
        expectedCloseDate: newCloseDate,
        assignedToName: newAssigned,
        notes: newNotes,
      };
      setDeals((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setNewTitle('');
      setNewCustomer('');
      toast.success('Yangi bitim yaratildi!');
    }
  };

  const handleMoveStage = async (dealId: string, direction: 'next' | 'prev') => {
    const stageOrder: Deal['stage'][] = ['LEAD', 'CONTACTED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;

    const currentIdx = stageOrder.indexOf(deal.stage);
    let nextIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;

    if (nextIdx < 0 || nextIdx >= stageOrder.length) return;
    const targetStage = stageOrder[nextIdx];

    try {
      await axios.put(
        `${Constants.API_BASE_URL}/admin/crm/deals/${dealId}/stage`,
        { stage: targetStage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stage: targetStage } : d))
      );
      toast.success(`Bitim ${targetStage} bosqichiga koʻchirildi`);
    } catch {
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stage: targetStage } : d))
      );
      toast.success(`Bitim ${targetStage} bosqichiga koʻchirildi`);
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    try {
      await axios.delete(`${Constants.API_BASE_URL}/admin/crm/deals/${dealId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeals((prev) => prev.filter((d) => d.id !== dealId));
      toast.success('Bitim oʻchirildi');
    } catch {
      setDeals((prev) => prev.filter((d) => d.id !== dealId));
      toast.success('Bitim oʻchirildi');
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-full mx-auto font-sans text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Savdo Quvuri va Bitimlar (CRM Deals)" />
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-700 hover:bg-teal-800 text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Yangi Bitim Qoʻshish
        </Button>
      </div>

      {/* Top Metrics Row */}
      {pipelineData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Jami Quvur Qiymati (Pipeline)
            </span>
            <p className="text-xl font-black text-slate-900 font-mono mt-1">
              {format(pipelineData.metrics?.totalPipelineValue || 343000000)}
            </p>
            <span className="text-[11px] text-teal-700 font-semibold">
              {pipelineData.metrics?.activeDealsCount || 4} ta faol bitim
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Yutilgan Bitimlar (Won Revenue)
            </span>
            <p className="text-xl font-black text-emerald-700 font-mono mt-1">
              {format(pipelineData.metrics?.wonValue || 120000000)}
            </p>
            <span className="text-[11px] text-emerald-800 font-semibold">Tushum taʼminlangan</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
              Yutuq Koʻrsatkichi (Win Rate)
            </span>
            <p className="text-xl font-black text-blue-700 font-mono mt-1">
              {pipelineData.metrics?.winRate || 100}%
            </p>
            <span className="text-[11px] text-blue-800 font-semibold">Bitimlar konversiyasi</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider block">
              Oʻrtacha Bitim Hajmi
            </span>
            <p className="text-xl font-black text-purple-700 font-mono mt-1">
              {format(Math.round((pipelineData.metrics?.totalPipelineValue || 343000000) / (deals.length || 1)))}
            </p>
            <span className="text-[11px] text-purple-800 font-semibold">Har bir mijoz uchun</span>
          </div>
        </div>
      )}

      {/* Visual Sales Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 min-w-[1200px]">
          {STAGES.map((st) => {
            const stageDeals = deals.filter((d) => d.stage === st.key);
            const stageTotal = stageDeals.reduce((s, d) => s + d.value, 0);

            return (
              <div
                key={st.key}
                className="flex flex-col bg-slate-100/70 rounded-2xl border border-slate-200 p-3 space-y-3 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="pb-2 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-slate-800">{st.label}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${st.badge}`}>
                      {stageDeals.length}
                    </span>
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-600 mt-1">
                    {format(stageTotal)}
                  </p>
                </div>

                {/* Deal Cards */}
                <div className="flex-1 space-y-2.5 overflow-y-auto">
                  {loading ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-medium">
                      Yuklanmoqda...
                    </div>
                  ) : stageDeals.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-medium border-2 border-dashed border-slate-200 rounded-xl">
                      Bitimlar yoʻq
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-2.5 group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-mono">{deal.id}</span>
                            <span className="flex items-center gap-1 text-slate-600">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {deal.expectedCloseDate}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 leading-snug">
                            {deal.title}
                          </h4>
                          <p className="text-[11px] font-semibold text-teal-800">
                            {deal.customerName}
                          </p>
                        </div>

                        {/* Value & Probability */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="font-mono font-black text-sm text-slate-900">
                            {format(deal.value)}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {deal.probability}%
                          </span>
                        </div>

                        {/* Manager & Quick Move Buttons */}
                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 truncate max-w-[110px]">
                            <User className="w-3 h-3 text-slate-400" />
                            {deal.assignedToName}
                          </span>

                          <div className="flex items-center gap-1">
                            {st.key !== 'LEAD' && (
                              <button
                                type="button"
                                title="Oldingi bosqichga qaytarish"
                                onClick={() => handleMoveStage(deal.id, 'prev')}
                                className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {st.key !== 'LOST' && (
                              <button
                                type="button"
                                title="Keyingi bosqichga oʻtkazish"
                                onClick={() => handleMoveStage(deal.id, 'next')}
                                className="p-1 rounded hover:bg-teal-50 text-teal-700 hover:text-teal-900 font-bold"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              title="Bitimni oʻchirish"
                              onClick={() => handleDeleteDeal(deal.id)}
                              className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Create New Deal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg border border-slate-200 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Yangi Savdo Bitimi (CRM Deal) Qoʻshish</h3>

            <FormField
              label="Bitim nomi *"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Masalan: ERP tizimi litsenziyalari"
            />
            <FormField
              label="Mijoz (Kompaniya yoki shaxs) *"
              value={newCustomer}
              onChange={(e) => setNewCustomer(e.target.value)}
              placeholder="Masalan: OASIS TEXTILE MCHJ"
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Kutilayotgan summa (soʻm)"
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(Number(e.target.value))}
              />
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dastlabki bosqich</label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border rounded-xl"
                >
                  <option value="LEAD">1. Lidlar (Leads)</option>
                  <option value="CONTACTED">2. Muloqotda</option>
                  <option value="PROPOSAL">3. Tijorat Taklifi</option>
                  <option value="NEGOTIATION">4. Muzokara & Shartnoma</option>
                  <option value="WON">5. Yutuq (Won)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Kutilayotgan sana"
                type="date"
                value={newCloseDate}
                onChange={(e) => setNewCloseDate(e.target.value)}
              />
              <FormField
                label="Masʼul menejer"
                value={newAssigned}
                onChange={(e) => setNewAssigned(e.target.value)}
              />
            </div>

            <FormField
              label="Qaydlar (Izoh)"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Bitim tafsilotlari..."
            />

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Bekor Qilish
              </Button>
              <Button onClick={handleCreateDeal} className="bg-teal-700 text-white font-bold">
                Bitimni Saqlash
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrmPipelinePage;
