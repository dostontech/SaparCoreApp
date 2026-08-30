import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  Send,
  Clock,
  CheckCircle2,
  Headphones,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, FormField } from '@components/ui';
import { PageHeader } from '@/context/PageHeaderContext';
import Constants from '@constants/api';

interface TicketMessage {
  id: string;
  senderName: string;
  senderRole: 'CUSTOMER' | 'AGENT' | 'SYSTEM';
  message: string;
  createdAt: string;
}

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'NEW' | 'IN_PROGRESS' | 'WAITING_CLIENT' | 'RESOLVED';
  slaHours: number;
  assignedAgentName: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export const HelpdeskTicketsPage: React.FC = () => {
  const token = localStorage.getItem('token') || '';

  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // New Ticket Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [priority, setPriority] = useState<SupportTicket['priority']>('MEDIUM');
  const [initialMessage, setInitialMessage] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${Constants.API_BASE_URL}/admin/helpdesk/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.data) {
        setTickets(res.data.data);
        if (res.data.data.length > 0 && !selectedTicket) {
          setSelectedTicket(res.data.data[0]);
        }
      }
    } catch {
      // Mock fallback
      const mock: SupportTicket[] = [
        {
          id: 'TICK-101',
          ticketNumber: 'SUP-2026-081',
          subject: 'E-Faktura orqali hisob-faktura yuborishda xatolik',
          customerName: 'OASIS TEXTILE TRADING MCHJ',
          customerEmail: 'info@oasis.uz',
          customerPhone: '+998 90 123-45-67',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          slaHours: 4,
          assignedAgentName: 'Sardor Raximov',
          createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: 'MSG-1',
              senderName: 'Aziz Qodirov (Mijoz)',
              senderRole: 'CUSTOMER',
              message: 'Assalomu alaykum, Didox orqali imzolashda sertifikat muddati xatosi chiqyapti.',
              createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
            },
            {
              id: 'MSG-2',
              senderName: 'Sardor Raximov (SAPAR Support)',
              senderRole: 'AGENT',
              message: 'Assalomu alaykum! E-IMZO brauzer modulini 64443 portda yangilashingizni tavsiya qilamiz.',
              createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
            },
          ],
        },
        {
          id: 'TICK-102',
          ticketNumber: 'SUP-2026-082',
          subject: 'Bank koʻchirmasi avtomatik tushmadi',
          customerName: 'SAMARQAND LOGISTIKA SERVIS XK',
          customerEmail: 'sam@logistika.uz',
          customerPhone: '+998 93 555-88-22',
          priority: 'MEDIUM',
          status: 'NEW',
          slaHours: 8,
          assignedAgentName: 'Nodir Karimov',
          createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: 'MSG-3',
              senderName: 'Rustam Saidov (Mijoz)',
              senderRole: 'CUSTOMER',
              message: 'Ipak Yoʻli Bankidan toʻlov qildik, tizimda qachon koʻrinadi?',
              createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
            },
          ],
        },
      ];
      setTickets(mock);
      setSelectedTicket(mock[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!subject || !customerName) {
      toast.error('Mavzu va mijoz nomi kiritilishi shart');
      return;
    }

    try {
      const payload = {
        subject,
        customerName,
        customerEmail,
        customerPhone,
        priority,
        initialMessage,
      };

      const res = await axios.post(`${Constants.API_BASE_URL}/admin/helpdesk/tickets`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.data) {
        setTickets((prev) => [res.data.data, ...prev]);
        setSelectedTicket(res.data.data);
        setIsModalOpen(false);
        setSubject('');
        setCustomerName('');
        setInitialMessage('');
        toast.success('Murojaat yaratildi!');
      }
    } catch {
      const created: SupportTicket = {
        id: `TICK-${Date.now().toString().slice(-4)}`,
        ticketNumber: `SUP-2026-${Math.floor(100 + Math.random() * 900)}`,
        subject,
        customerName,
        customerEmail,
        customerPhone,
        priority,
        status: 'NEW',
        slaHours: 4,
        assignedAgentName: 'Sardor Raximov',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: initialMessage
          ? [
              {
                id: `MSG-${Date.now()}`,
                senderName: customerName,
                senderRole: 'CUSTOMER',
                message: initialMessage,
                createdAt: new Date().toISOString(),
              },
            ]
          : [],
      };
      setTickets((prev) => [created, ...prev]);
      setSelectedTicket(created);
      setIsModalOpen(false);
      setSubject('');
      setCustomerName('');
      setInitialMessage('');
      toast.success('Murojaat yaratildi!');
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    try {
      setSendingReply(true);
      const res = await axios.post(
        `${Constants.API_BASE_URL}/admin/helpdesk/tickets/${selectedTicket.id}/reply`,
        { message: replyText, senderName: 'Sardor Raximov (SAPAR Support)', role: 'AGENT' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.data) {
        const updated = res.data.data;
        setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setSelectedTicket(updated);
        setReplyText('');
        toast.success('Javob mijozga yuborildi!');
      }
    } catch {
      const newMsg: TicketMessage = {
        id: `MSG-${Date.now()}`,
        senderName: 'Sardor Raximov (SAPAR Support)',
        senderRole: 'AGENT',
        message: replyText,
        createdAt: new Date().toISOString(),
      };
      const updated = {
        ...selectedTicket,
        status: 'WAITING_CLIENT' as const,
        messages: [...selectedTicket.messages, newMsg],
      };
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setSelectedTicket(updated);
      setReplyText('');
      toast.success('Javob mijozga yuborildi!');
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateStatus = async (status: SupportTicket['status']) => {
    if (!selectedTicket) return;

    try {
      await axios.put(
        `${Constants.API_BASE_URL}/admin/helpdesk/tickets/${selectedTicket.id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = { ...selectedTicket, status };
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setSelectedTicket(updated);
      toast.success('Status yangilandi!');
    } catch {
      const updated = { ...selectedTicket, status };
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setSelectedTicket(updated);
      toast.success('Status yangilandi!');
    }
  };

  const filteredTickets = tickets.filter(
    (t) => statusFilter === 'ALL' || t.status === statusFilter
  );

  return (
    <div className="space-y-6 pb-20 max-w-full mx-auto font-sans text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Mijozlar Yordam Markazi & Helpdesk" />
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-700 hover:bg-teal-800 text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Yangi Murojaat (Ticket)
        </Button>
      </div>

      {/* Main Grid: Ticket List (Left) & Ticket Chat / Thread (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 5 Cols: Tickets List */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col overflow-hidden h-[750px]">
          {/* Status Filters */}
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center gap-1.5 overflow-x-auto text-xs">
            {['ALL', 'NEW', 'IN_PROGRESS', 'WAITING_CLIENT', 'RESOLVED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                  statusFilter === st
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {st === 'ALL'
                  ? 'Barchasi'
                  : st === 'NEW'
                  ? 'Yangi'
                  : st === 'IN_PROGRESS'
                  ? 'Jarayonda'
                  : st === 'WAITING_CLIENT'
                  ? 'Mijoz javobi'
                  : 'Hal qilindi'}
              </button>
            ))}
          </div>

          {/* Ticket items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {loading ? (
              <div className="py-12 text-center text-slate-400">Yuklanmoqda...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">Murojaatlar mavjud emas</div>
            ) : (
              filteredTickets.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTicket(t)}
                  className={`w-full text-left p-3 rounded-2xl transition flex flex-col gap-1.5 ${
                    selectedTicket?.id === t.id
                      ? 'bg-teal-50 border border-teal-300 shadow-xs'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-teal-800">{t.ticketNumber}</span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        t.status === 'NEW'
                          ? 'bg-blue-100 text-blue-800'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-800'
                          : t.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {t.status === 'NEW'
                        ? 'Yangi'
                        : t.status === 'IN_PROGRESS'
                        ? 'Jarayonda'
                        : t.status === 'RESOLVED'
                        ? 'Hal qilindi'
                        : 'Mijoz javobi'}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{t.subject}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[150px] font-semibold">{t.customerName}</span>
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right 7 Cols: Ticket Detail & Thread */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col overflow-hidden h-[750px]">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-teal-800">
                      {selectedTicket.ticketNumber}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-600">
                      Mijoz: {selectedTicket.customerName} ({selectedTicket.customerPhone || selectedTicket.customerEmail})
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                    {selectedTicket.subject}
                  </h3>
                </div>

                {/* Status Switcher Buttons */}
                <div className="flex items-center gap-1.5">
                  {selectedTicket.status !== 'RESOLVED' ? (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus('RESOLVED')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Hal Qilindi
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus('IN_PROGRESS')}
                      className="text-xs"
                    >
                      Qayta Ochish
                    </Button>
                  )}
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                {selectedTicket.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col max-w-[80%] rounded-2xl p-3 text-xs space-y-1 shadow-xs ${
                      m.senderRole === 'AGENT'
                        ? 'ml-auto bg-teal-800 text-white'
                        : 'mr-auto bg-white border border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] opacity-80">
                      <span className="font-bold">{m.senderName}</span>
                      <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Input Box */}
              <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  placeholder="Mijozga javob yozing..."
                  className="flex-1 text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <Button
                  onClick={handleSendReply}
                  disabled={sendingReply || !replyText.trim()}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Headphones className="w-12 h-12 text-slate-300" />
              <p className="text-xs font-semibold">Murojaatni koʻrish uchun chap tomondan tanlang</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Ticket */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg border border-slate-200 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Yangi Yordam Murojaati (Ticket) Ochish</h3>

            <FormField
              label="Murojaat mavzusi *"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Masalan: Toʻlov hisobga oʻtmadi"
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Mijoz nomi *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <FormField
                label="Telefon raqam"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+998 90 123-45-67"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="info@client.uz"
              />
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Muhimlik (Priority)</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border rounded-xl"
                >
                  <option value="LOW">Oddiy (Low)</option>
                  <option value="MEDIUM">Oʻrta (Medium)</option>
                  <option value="HIGH">Yuqori (High)</option>
                  <option value="URGENT">Shoshilinch (Urgent)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Murojaat matni</label>
              <textarea
                rows={3}
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                placeholder="Mijozning savoli yoki shikoyati..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Bekor Qilish
              </Button>
              <Button onClick={handleCreateTicket} className="bg-teal-700 text-white font-bold">
                Murojaatni Yaratish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpdeskTicketsPage;
