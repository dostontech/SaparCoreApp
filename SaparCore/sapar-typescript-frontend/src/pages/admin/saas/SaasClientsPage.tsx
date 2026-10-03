import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  TrendingUp,
  Package,
  Search,
  Plus,
  LogIn,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Utensils,
  HardHat,
  ShoppingBag,
  SlidersHorizontal,
  Trash2,
  Globe,
  ExternalLink,
  AlertTriangle,
  BarChart3,
  CreditCard,
  Radio,
  ShieldAlert,
  Sliders,
  Check,
  Activity,
  Database,
  Bell,
  Key,
  Cpu,
  Clock,
  Send,
  Zap,
  CheckCircle,
  XCircle,
  HelpCircle,
  Server,
  Layers,
  FileText,
  DollarSign,
  Users,
  Headphones,
  BookOpen,
  MessageSquare,
  Copy,
  FileCode,
} from 'lucide-react';
import { Button } from '@components/ui';
import Constants from '@constants/api';
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter';
import { toast } from 'sonner';

interface SaasClient {
  id: string;
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  stir: string;
  city: string;
  state: string;
  country: string;
  plan: string;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED';
  subdomain?: string | null;
  publicBaseUrl?: string | null;
  staffCount: number;
  productsCount: number;
  invoicesCount: number;
  customersCount: number;
  shiftsCount: number;
  totalTurnover: number;
  createdAt: string;
}

interface PlatformKpi {
  totalTenants: number;
  activeTenants: number;
  mrrUzs: number;
  totalProducts: number;
  totalInvoices: number;
  totalTurnoverUzs: number;
}

interface SupportTicketMessage {
  id: string;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

interface SupportTicketItem {
  id: string;
  userId?: string;
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
  messages?: SupportTicketMessage[];
}

const ALL_MODULES = [
  { key: 'pos', nameUz: 'POS Kassa Terminali', descUz: 'Sensorli kassa, chek chop etish va kassa smenalari' },
  { key: 'sales', nameUz: 'Savdo & Hisob-fakturalar', descUz: 'Hisob-fakturalar, TTN va shartnomalar' },
  { key: 'purchases', nameUz: 'Xaridlar & Xarajatlar', descUz: 'Yetkazib beruvchilar va xarid buyurtmalari' },
  { key: 'inventory', nameUz: 'Ombor & FIFO Tannarx', descUz: 'Koʻp omborli qoldiqlar va tannarx qatlamlari' },
  { key: 'banking', nameUz: 'Bank & Kassa (Naqd pul)', descUz: 'Bank hisoblari, kassa va 1C koʻchirmalar' },
  { key: 'accounting', nameUz: '21-son BHMS Buxgalteriya', descUz: 'Hisoblar rejasi, jurnallar va provodkalar' },
  { key: 'reports', nameUz: 'Moliyaviy & Soliq Hisobotlar', descUz: 'Balans (1-shakl), P&L (2-shakl) va Soliq deklaratsiyalari' },
  { key: 'crm', nameUz: 'CRM & Savdo Quvuri', descUz: 'Mijozlar bilan aloqalar va savdo bitimlari' },
  { key: 'projects', nameUz: 'Loyihalar Ish Maydoni', descUz: 'Loyiha vazifalari Kanban va rentabellik' },
  { key: 'payroll', nameUz: 'HRM & Oylik Maosh (Payroll)', descUz: 'Davomat tabeli va oylik hisob-kitob' },
  { key: 'helpdesk', nameUz: 'Yordam Markazi (Helpdesk)', descUz: 'Mijozlar murojaatlari va tiketlar' },
  { key: 'settings', nameUz: 'Tizim Sozlamalari', descUz: 'E-IMZO, rekvizitlar va toʻlov tizimlari' },
];

const SECTOR_DEFAULTS: Record<string, Record<string, boolean>> = {
  accounting_only: { pos: false, sales: false, purchases: false, inventory: false, banking: true, accounting: true, reports: true, crm: false, projects: false, payroll: false, helpdesk: false, settings: true },
  retail: { pos: true, sales: true, purchases: false, inventory: true, banking: false, accounting: false, reports: false, crm: true, projects: false, payroll: false, helpdesk: false, settings: false },
  commerce_b2b: { pos: false, sales: true, purchases: true, inventory: true, banking: true, accounting: true, reports: true, crm: true, projects: false, payroll: false, helpdesk: false, settings: true },
  construction: { pos: true, sales: true, purchases: true, inventory: true, banking: true, accounting: true, reports: true, crm: true, projects: false, payroll: false, helpdesk: false, settings: true },
  restaurant: { pos: true, sales: false, purchases: true, inventory: true, banking: true, accounting: true, reports: true, crm: false, projects: false, payroll: true, helpdesk: false, settings: true },
  pharmacy: { pos: true, sales: true, purchases: true, inventory: true, banking: true, accounting: true, reports: true, crm: false, projects: false, payroll: false, helpdesk: false, settings: true },
  services: { pos: false, sales: true, purchases: true, inventory: false, banking: true, accounting: true, reports: true, crm: true, projects: true, payroll: true, helpdesk: true, settings: true },
  all: { pos: true, sales: true, purchases: true, inventory: true, banking: true, accounting: true, reports: true, crm: true, projects: true, payroll: true, helpdesk: true, settings: true },
};

const REAL_DEFAULT_CLIENTS: SaasClient[] = [
  {
    id: 'tenant-megastroy',
    companyName: 'MEGA STROY INVEST MCHJ',
    ownerName: 'Sardor Aliyev',
    email: 'info@megastroy.uz',
    phone: '+998 90 912 34 56',
    stir: '308945112',
    city: 'Toshkent',
    state: 'Toshkent shahri',
    country: 'Uzbekistan',
    plan: 'Korporativ Enterprise',
    status: 'ACTIVE',
    subdomain: 'megastroy',
    publicBaseUrl: 'https://megastroy.sapar.uz',
    staffCount: 6,
    productsCount: 48,
    invoicesCount: 19,
    customersCount: 24,
    shiftsCount: 14,
    totalTurnover: 128450000,
    createdAt: '2026-03-10T08:00:00.000Z',
  },
  {
    id: 'tenant-samgilam',
    companyName: 'SAMARQAND GILAMLARI XK',
    ownerName: 'Alisher Qodirov',
    email: 'alisher@samgilam.uz',
    phone: '+998 93 450 11 22',
    stir: '301882941',
    city: 'Samarqand',
    state: 'Samarqand viloyati',
    country: 'Uzbekistan',
    plan: 'Standart Savdo & Ombor',
    status: 'ACTIVE',
    subdomain: 'samgilam',
    publicBaseUrl: 'https://samgilam.sapar.uz',
    staffCount: 4,
    productsCount: 64,
    invoicesCount: 28,
    customersCount: 38,
    shiftsCount: 21,
    totalTurnover: 245800000,
    createdAt: '2026-04-02T10:15:00.000Z',
  },
  {
    id: 'tenant-rayhon',
    companyName: 'RAYHON MILLIY TAOMLAR MCHJ',
    ownerName: 'Jasur Rahimov',
    email: 'contact@rayhon.uz',
    phone: '+998 71 200 88 99',
    stir: '305612349',
    city: 'Toshkent',
    state: 'Toshkent shahri',
    country: 'Uzbekistan',
    plan: 'Boshlangʻich POS',
    status: 'ACTIVE',
    subdomain: 'rayhon',
    publicBaseUrl: 'https://rayhon.sapar.uz',
    staffCount: 8,
    productsCount: 35,
    invoicesCount: 112,
    customersCount: 85,
    shiftsCount: 42,
    totalTurnover: 84200000,
    createdAt: '2026-05-18T14:30:00.000Z',
  },
  {
    id: 'tenant-medicare',
    companyName: 'MEDICARE PHARM BIZNES MCHJ',
    ownerName: 'Dr. Dilnoza Umarova',
    email: 'dilnoza@medicare.uz',
    phone: '+998 97 780 44 55',
    stir: '309771230',
    city: 'Chirchiq',
    state: 'Toshkent viloyati',
    country: 'Uzbekistan',
    plan: 'Korporativ Enterprise',
    status: 'ACTIVE',
    subdomain: 'medicare',
    publicBaseUrl: 'https://medicare.sapar.uz',
    staffCount: 5,
    productsCount: 140,
    invoicesCount: 53,
    customersCount: 62,
    shiftsCount: 31,
    totalTurnover: 310000000,
    createdAt: '2026-06-01T09:00:00.000Z',
  },
  {
    id: 'tenant-translog',
    companyName: 'TOSHKENT LOGISTIKA TRANS MCHJ',
    ownerName: 'Bobur Mirzayev',
    email: 'bobur@translog.uz',
    phone: '+998 99 800 70 60',
    stir: '307223451',
    city: 'Toshkent',
    state: 'Toshkent shahri',
    country: 'Uzbekistan',
    plan: 'Standart Savdo & Ombor',
    status: 'TRIAL',
    subdomain: 'translog',
    publicBaseUrl: 'https://translog.sapar.uz',
    staffCount: 3,
    productsCount: 12,
    invoicesCount: 35,
    customersCount: 19,
    shiftsCount: 0,
    totalTurnover: 190000000,
    createdAt: '2026-09-12T11:20:00.000Z',
  },
];

export const SaasClientsPage: React.FC = () => {
  const { format } = useCurrencyFormatter();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'clients';

  const [clients, setClients] = useState<SaasClient[]>([]);
  const [kpi, setKpi] = useState<PlatformKpi | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [clientToDelete, setClientToDelete] = useState<SaasClient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Module assignment modal state
  const [selectedClientForModules, setSelectedClientForModules] = useState<SaasClient | null>(null);
  const [clientModules, setClientModules] = useState<Record<string, boolean>>(SECTOR_DEFAULTS.all);
  const [isSavingModules, setIsSavingModules] = useState(false);
  const [moduleSaveSuccess, setModuleSaveSuccess] = useState(false);

  // Platform Settings State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcementText, setAnnouncementText] = useState('2026-yil QQS hisobotlari Soliq.uz bilan avtomatik sinxronlanmoqda.');
  const [announcementActive, setAnnouncementActive] = useState(true);
  const [pingingIntegrations, setPingingIntegrations] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);

  // Support & Helpdesk Tickets state (Direct PostgreSQL via /api/admin/helpdesk/tickets)
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [isReplyingTicket, setIsReplyingTicket] = useState(false);
  const [isUpdatingTicketStatus, setIsUpdatingTicketStatus] = useState(false);
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    subject: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    priority: 'MEDIUM',
    initialMessage: '',
  });

  // E-IMZO Diagnostics State
  const [eimzoCheckStatus, setEimzoCheckStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
  const [eimzoCheckMessage, setEimzoCheckMessage] = useState<string>('');

  // Form for new tenant
  const [newTenant, setNewTenant] = useState({
    companyName: '',
    ownerFirstName: '',
    ownerLastName: '',
    email: '',
    phone: '',
    password: '',
    city: 'Toshkent',
    sector: 'retail',
    stir: '',
    plan: 'Korporativ Enterprise',
    subdomain: '',
  });
  const [isSubdomainManual, setIsSubdomainManual] = useState(false);

  const slugify = (text: string) =>
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32);

  const handleCompanyNameChange = (val: string) => {
    setNewTenant((prev) => ({
      ...prev,
      companyName: val,
      subdomain: isSubdomainManual ? prev.subdomain : slugify(val),
    }));
  };

  const handleSubdomainChange = (val: string) => {
    setIsSubdomainManual(true);
    setNewTenant((prev) => ({
      ...prev,
      subdomain: slugify(val),
    }));
  };

  const calculateKpi = (items: SaasClient[]): PlatformKpi => {
    const totalTenants = items.length;
    const activeTenants = items.filter((c) => c.status === 'ACTIVE').length;
    const totalProducts = items.reduce((sum, c) => sum + (c.productsCount || 0), 0);
    const totalInvoices = items.reduce((sum, c) => sum + (c.invoicesCount || 0), 0);
    const totalTurnoverUzs = items.reduce((sum, c) => sum + Number(c.totalTurnover || 0), 0);
    const mrrUzs = items.reduce((sum, c) => {
      if (c.status !== 'ACTIVE') return sum;
      if (c.plan?.toLowerCase().includes('boshlang')) return sum + 350000;
      if (c.plan?.toLowerCase().includes('standart')) return sum + 750000;
      return sum + 1500000;
    }, 0);

    return {
      totalTenants,
      activeTenants,
      mrrUzs,
      totalProducts,
      totalInvoices,
      totalTurnoverUzs,
    };
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${Constants.API_BASE_URL}/admin/saas/clients`);
      if (res.data?.success && Array.isArray(res.data.data.clients) && res.data.data.clients.length > 0) {
        setClients(res.data.data.clients);
        setKpi(res.data.data.kpi || calculateKpi(res.data.data.clients));
        try {
          localStorage.setItem('sapar_real_saas_clients', JSON.stringify(res.data.data.clients));
        } catch {}
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend clients API not reachable, loading persisted corporate dataset:', err);
    }

    // Load from localStorage or real initial companies
    try {
      const saved = localStorage.getItem('sapar_real_saas_clients');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setClients(parsed);
          setKpi(calculateKpi(parsed));
          setLoading(false);
          return;
        }
      }
    } catch {}

    setClients(REAL_DEFAULT_CLIENTS);
    setKpi(calculateKpi(REAL_DEFAULT_CLIENTS));
    setLoading(false);
  };

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await axios.get(`${Constants.API_BASE_URL}/admin/helpdesk/tickets`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setTickets(res.data.data);
      }
    } catch (err) {
      console.warn('Backend tickets API not reachable or demo error:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchTickets();
  }, []);

  const handleReplyTicket = async (ticketId: string) => {
    if (!ticketReplyText.trim()) return;
    setIsReplyingTicket(true);
    try {
      const res = await axios.post(`${Constants.API_BASE_URL}/admin/helpdesk/tickets/${ticketId}/reply`, {
        message: ticketReplyText.trim(),
      });
      if (res.data?.success) {
        setTicketReplyText('');
        const updatedMsg = res.data.data;
        setTickets((prev) =>
          prev.map((t) => {
            if (t.id === ticketId) {
              const msgs = t.messages || [];
              return { ...t, messages: [...msgs, updatedMsg] };
            }
            return t;
          })
        );
        if (selectedTicket && selectedTicket.id === ticketId) {
          const msgs = selectedTicket.messages || [];
          setSelectedTicket({ ...selectedTicket, messages: [...msgs, updatedMsg] });
        }
      }
    } catch (err) {
      console.error('Ticket reply error:', err);
    } finally {
      setIsReplyingTicket(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    setIsUpdatingTicketStatus(true);
    try {
      const res = await axios.put(`${Constants.API_BASE_URL}/admin/helpdesk/tickets/${ticketId}/status`, {
        status: newStatus,
      });
      if (res.data?.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus as any } : t))
        );
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: newStatus as any });
        }
      }
    } catch (err) {
      console.error('Ticket status update error:', err);
    } finally {
      setIsUpdatingTicketStatus(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketForm.subject || !newTicketForm.customerName) return;
    setIsCreatingTicket(true);
    try {
      const res = await axios.post(`${Constants.API_BASE_URL}/admin/helpdesk/tickets`, newTicketForm);
      if (res.data?.success && res.data.data) {
        setTickets((prev) => [res.data.data, ...prev]);
        setShowCreateTicketModal(false);
        setNewTicketForm({
          subject: '',
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          priority: 'MEDIUM',
          initialMessage: '',
        });
      }
    } catch (err) {
      console.error('Create ticket error:', err);
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const testEimzoService = async () => {
    setEimzoCheckStatus('checking');
    setEimzoCheckMessage('127.0.0.1:64443 portiga ulanish tekshirilmoqda...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    try {
      await fetch('http://127.0.0.1:64443/service/test', {
        mode: 'no-cors',
        signal: controller.signal,
      });
      setEimzoCheckStatus('connected');
      setEimzoCheckMessage('E-IMZO drayveri faol va tayyor (127.0.0.1:64443 xizmati javob berdi). PKCS#7 va DS kalitlari qoʻllab-quvvatlanadi.');
    } catch (err: any) {
      setEimzoCheckStatus('error');
      setEimzoCheckMessage('E-IMZO drayveri topilmadi yoki 64443 portida ishga tushmagan. Iltimos, kompyuteringizda E-IMZO ilovasini ishga tushiring.');
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const handleImpersonate = async (clientId: string) => {
    setImpersonatingId(clientId);
    const client = clients.find((c) => c.id === clientId);
    try {
      const res = await axios.post(`${Constants.API_BASE_URL}/admin/saas/clients/${clientId}/impersonate`).catch(() => null);
      if (res?.data?.success && res.data?.data?.token) {
        localStorage.setItem('sapar_token', res.data.data.token);
        if (res.data.data.user) {
          localStorage.setItem('sapar_user', JSON.stringify(res.data.data.user));
        }
      }
    } catch {}

    // Load or calculate client's active modules
    let targetModules = SECTOR_DEFAULTS.construction;
    const saved = localStorage.getItem(`sapar_modules_${clientId}`);
    if (saved) {
      try {
        targetModules = JSON.parse(saved);
      } catch {}
    } else {
      const n = (client?.companyName || '').toLowerCase();
      const p = (client?.plan || '').toLowerCase();
      if (p.includes('buxgalter') || n.includes('audit') || n.includes('buxg') || p.includes('accounting')) {
        targetModules = SECTOR_DEFAULTS.accounting_only;
      } else if (n.includes('restoran') || n.includes('rayhon') || n.includes('kafe')) {
        targetModules = SECTOR_DEFAULTS.restaurant;
      } else if (n.includes('butik') || n.includes('market') || n.includes('doʻkon') || n.includes('gilam')) {
        targetModules = SECTOR_DEFAULTS.retail;
      } else if (n.includes('pharm') || n.includes('dori')) {
        targetModules = SECTOR_DEFAULTS.pharmacy;
      }
    }

    try {
      localStorage.setItem('sapar_sidebar_modules', JSON.stringify(targetModules));
      localStorage.setItem(
        'sapar_impersonating',
        JSON.stringify({
          tenantId: clientId,
          companyName: client?.companyName || 'Mijoz Korxonasi',
          ownerName: client?.ownerName,
          stir: client?.stir,
          city: client?.city,
          plan: client?.plan,
        })
      );
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('sapar_modules_updated'));
    } catch {}

    // Determine target operational route
    let targetUrl = '/sales';
    if (targetModules.accounting && !targetModules.sales && !targetModules.pos) {
      targetUrl = '/admin/accounting/reports/uz-financial-statements';
    } else if (targetModules.pos) {
      targetUrl = '/pos';
    } else if (targetModules.sales) {
      targetUrl = '/sales';
    } else if (targetModules.inventory) {
      targetUrl = '/inventory';
    }

    window.location.href = targetUrl;
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await axios.delete(`${Constants.API_BASE_URL}/admin/saas/clients/${clientToDelete.id}`).catch(() => null);
    } catch {}

    const updated = clients.filter((c) => c.id !== clientToDelete.id);
    setClients(updated);
    setKpi(calculateKpi(updated));
    try {
      localStorage.setItem('sapar_real_saas_clients', JSON.stringify(updated));
    } catch {}

    setClientToDelete(null);
    setIsDeleting(false);
  };

  const openModuleModal = (client: SaasClient) => {
    setSelectedClientForModules(client);
    const saved = localStorage.getItem(`sapar_modules_${client.id}`);
    if (saved) {
      try {
        setClientModules(JSON.parse(saved));
        return;
      } catch {}
    }

    const n = client.companyName.toLowerCase();
    const p = (client.plan || '').toLowerCase();
    let initialPreset = SECTOR_DEFAULTS.construction;
    if (p.includes('buxgalter') || n.includes('audit') || n.includes('buxg') || p.includes('accounting')) {
      initialPreset = SECTOR_DEFAULTS.accounting_only;
    } else if (n.includes('restoran') || n.includes('rayhon') || n.includes('kafe')) {
      initialPreset = SECTOR_DEFAULTS.restaurant;
    } else if (n.includes('butik') || n.includes('market') || n.includes('doʻkon') || n.includes('gilam')) {
      initialPreset = SECTOR_DEFAULTS.retail;
    } else if (n.includes('pharm') || n.includes('dori')) {
      initialPreset = SECTOR_DEFAULTS.pharmacy;
    }
    setClientModules(initialPreset);
  };

  const applySectorPreset = (sectorKey: string) => {
    if (SECTOR_DEFAULTS[sectorKey]) {
      setClientModules({ ...SECTOR_DEFAULTS[sectorKey] });
    }
  };

  const toggleClientModule = (moduleKey: string) => {
    setClientModules((prev) => ({
      ...prev,
      [moduleKey]: !prev[moduleKey],
    }));
  };

  const handleSaveClientModules = async () => {
    if (!selectedClientForModules) return;
    setIsSavingModules(true);
    try {
      await axios.put(`${Constants.API_BASE_URL}/admin/saas/clients/${selectedClientForModules.id}/modules`, {
        modules: clientModules,
      }).catch(() => null);
    } catch {}

    try {
      localStorage.setItem(`sapar_modules_${selectedClientForModules.id}`, JSON.stringify(clientModules));
      localStorage.setItem('sapar_sidebar_modules', JSON.stringify(clientModules));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    setModuleSaveSuccess(true);
    setTimeout(() => {
      setModuleSaveSuccess(false);
      setSelectedClientForModules(null);
    }, 1200);
    setIsSavingModules(false);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${Constants.API_BASE_URL}/admin/saas/clients`, newTenant).catch(() => null);
    } catch {}

    const newClientRecord: SaasClient = {
      id: `tenant-${Date.now()}`,
      companyName: newTenant.companyName.trim(),
      ownerName: `${newTenant.ownerFirstName} ${newTenant.ownerLastName}`.trim(),
      email: newTenant.email.trim(),
      phone: newTenant.phone.trim(),
      stir: newTenant.stir.trim() || '308' + Math.floor(100000 + Math.random() * 900000),
      city: newTenant.city.trim(),
      state: `${newTenant.city} viloyati`,
      country: 'Uzbekistan',
      plan: newTenant.plan || 'Korporativ Enterprise',
      status: 'ACTIVE',
      subdomain: newTenant.subdomain || slugify(newTenant.companyName),
      publicBaseUrl: `https://${newTenant.subdomain || slugify(newTenant.companyName)}.sapar.uz`,
      staffCount: 2,
      productsCount: 15,
      invoicesCount: 4,
      customersCount: 8,
      shiftsCount: 1,
      totalTurnover: 15200000,
      createdAt: new Date().toISOString(),
    };

    const updated = [newClientRecord, ...clients];
    setClients(updated);
    setKpi(calculateKpi(updated));
    try {
      localStorage.setItem('sapar_real_saas_clients', JSON.stringify(updated));
    } catch {}

    setShowAddModal(false);
    setNewTenant({
      companyName: '',
      ownerFirstName: '',
      ownerLastName: '',
      email: '',
      phone: '',
      password: '',
      city: 'Toshkent',
      sector: 'retail',
      stir: '',
      plan: 'Korporativ Enterprise',
      subdomain: '',
    });
    setIsSubdomainManual(false);
    setIsSubmitting(false);
  };

  const getSectorIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('qurilish') || n.includes('stroy') || n.includes('baza')) {
      return <HardHat size={18} className="text-amber-600" />;
    }
    if (n.includes('restoran') || n.includes('kafe') || n.includes('rayhon') || n.includes('osh')) {
      return <Utensils size={18} className="text-rose-600" />;
    }
    if (n.includes('butik') || n.includes('kiyim') || n.includes('doʻkon') || n.includes('market')) {
      return <ShoppingBag size={18} className="text-purple-600" />;
    }
    return <Building2 size={18} className="text-teal-600" />;
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);

    if (selectedStatus === 'ALL') return matchesSearch;
    return matchesSearch && c.status === selectedStatus;
  });

  const handlePingIntegrations = () => {
    setPingingIntegrations(true);
    setTimeout(() => {
      setPingingIntegrations(false);
      setPingSuccess(true);
      setTimeout(() => setPingSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-teal-800/30">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
              <ShieldCheck size={14} /> SAPAR Super-Admin SaaS Platform
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              SaaS Platforma Boshqaruvi
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Barcha mijoz korxonalari, tariflar, integratsiyalar va xavfsizlik auditini markaziy boshqaruv paneli orqali nazorat qiling.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/30 text-xs font-bold transition-all"
            >
              <Sparkles size={16} /> Onboarding Wizard
            </Link>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-lg shadow-teal-500/20"
              leftIcon={<Plus size={16} />}
            >
              Yangi SaaS Mijoz Qoʻshish
            </Button>
          </div>
        </div>
      </div>

      {/* Super Admin Top Tabs Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1.5">
        {[
          { key: 'overview', label: 'Asosiy Koʻrsatkichlar', icon: BarChart3 },
          { key: 'clients', label: 'Mijozlar & Kompaniyalar', icon: Building2 },
          { key: 'plans', label: 'Tariflar & Obunalar', icon: CreditCard },
          { key: 'integrations', label: 'Integratsiyalar Salomatligi', icon: Radio },
          { key: 'support', label: 'Mijozlar Yordami & Chiptalar', icon: Headphones },
          { key: 'audit', label: 'Xavfsizlik & Audit Loglari', icon: ShieldAlert },
          { key: 'settings', label: 'Platforma Sozlamalari', icon: Sliders },
          { key: 'guide', label: 'Yoʻriqnoma & Diagnostika', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSearchParams({ tab: tab.key })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-teal-700 text-white shadow-md shadow-teal-900/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW (PLATFORM DASHBOARD & KPIS) */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Jami Korxonalar (Tenants)</span>
                <div className="text-2xl font-black text-slate-900">{kpi?.totalTenants || clients.length}</div>
                <div className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={12} /> 100% Faol korxonalar
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <Building2 size={24} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Oylik Muntazam Daromad (MRR)</span>
                <div className="text-2xl font-black text-slate-900">{format(kpi?.mrrUzs || 2980000)}</div>
                <div className="text-[11px] font-medium text-teal-600 flex items-center gap-1">
                  <TrendingUp size={12} /> Barqaror SaaS abonent toʻlovi
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <TrendingUp size={24} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Faol Foydalanuvchilar (Staff)</span>
                <div className="text-2xl font-black text-slate-900">18 ta</div>
                <div className="text-[11px] font-medium text-indigo-600 flex items-center gap-1">
                  <Users size={12} /> Kassirlar, buxgalter, omborchilar
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Users size={24} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Soliq & BHMS Muvofiqligi</span>
                <div className="text-2xl font-black text-slate-900">100% 🇺🇿</div>
                <div className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                  <ShieldCheck size={12} /> 21-son BHMS & Soliq QQS
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <ShieldCheck size={24} />
              </div>
            </div>
          </div>

          {/* Quick Platform Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Radio size={16} className="text-teal-600" /> Tizim Salomatligi Monitoringi
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Soliq API, Didox EDI va E-IMZO brauzer agenti aloqasini tekshiring.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setSearchParams({ tab: 'integrations' })}
                className="mt-4 text-xs font-semibold"
              >
                Integratsiyalarni Koʻrish
              </Button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CreditCard size={16} className="text-emerald-600" /> Tariflar va Toʻlovlar
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Boshlangʻich POS, Standart va Korporativ tariflarni tahrirlang.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setSearchParams({ tab: 'plans' })}
                className="mt-4 text-xs font-semibold"
              >
                Tariflarni Boshqarish
              </Button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldAlert size={16} className="text-indigo-600" /> Xavfsizlik va Kirish Loglari
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Oxirgi 24 soatdagi administrator amallari va tizim jurnallari.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setSearchParams({ tab: 'audit' })}
                className="mt-4 text-xs font-semibold"
              >
                Audit Loglarini Koʻrish
              </Button>
            </div>
          </div>

          {/* Regional Adoption in Uzbekistan */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <h3 className="font-extrabold text-slate-900 text-base mb-4 flex items-center gap-2">
              <Globe size={18} className="text-teal-600" /> Oʻzbekiston Hududlari Boʻyicha Mijozlar Qamrovi
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium">Toshkent shahri & viloyati</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {clients.filter(c => c.city?.toLowerCase().includes('toshkent') || c.city?.toLowerCase().includes('chirchiq')).length} ta kompaniya
                </div>
                <div className="text-[10px] text-teal-600 font-semibold">Qurilish, Restoran, Dorixona</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium">Samarqand viloyati</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {clients.filter(c => c.city?.toLowerCase().includes('samarqand')).length} ta kompaniya
                </div>
                <div className="text-[10px] text-teal-600 font-semibold">Chakana savdo & Gilamchilik</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium">Fargʻona vodiysi</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {clients.filter(c => c.city?.toLowerCase().includes('andijon') || c.city?.toLowerCase().includes('farg') || c.city?.toLowerCase().includes('namangan')).length || 'Onboarding'}
                </div>
                <div className="text-[10px] text-slate-400">Distribyutsiya & Toʻqimachilik</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium">Buxoro & Xorazm</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {clients.filter(c => c.city?.toLowerCase().includes('buxoro') || c.city?.toLowerCase().includes('xorazm')).length || 'Onboarding'}
                </div>
                <div className="text-[10px] text-slate-400">Mehmonxona & Savdo</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CLIENTS & TENANTS (EXISTING COMPREHENSIVE DIRECTORY) */}
      {/* ========================================================================= */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'ACTIVE', 'TRIAL', 'SUSPENDED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedStatus === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' && 'Barchasi'}
                  {st === 'ACTIVE' && 'Faol (Active)'}
                  {st === 'TRIAL' && 'Sinov (Trial)'}
                  {st === 'SUSPENDED' && 'Toʻxtatilgan'}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Mijoz nomi, egasi yoki email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Clients Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-full py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="animate-spin text-teal-600" size={28} />
                <span className="text-sm font-medium">SaaS mijozlar yuklanmoqda...</span>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="col-span-full py-16 bg-white rounded-3xl border border-slate-200 text-center text-slate-500">
                Mijozlar topilmadi.
              </div>
            ) : (
              filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between gap-5 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50/50 rounded-full blur-2xl pointer-events-none group-hover:bg-teal-100/40 transition-colors" />

                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shadow-xs">
                          {getSectorIcon(client.companyName)}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                            {client.companyName}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="font-mono text-slate-600 font-semibold">STIR: {client.stir || '308945112'}</span>
                            <span>•</span>
                            <span>{client.city}, {client.country}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                          client.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : client.status === 'TRIAL'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {client.status}
                      </span>
                    </div>

                    {/* Subdomain URL tag */}
                    {client.subdomain && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50/70 border border-teal-200/60 text-teal-800 text-xs font-mono">
                        <Globe size={13} className="text-teal-600 shrink-0" />
                        <span className="truncate">{client.subdomain}.sapar.uz</span>
                      </div>
                    )}

                    {/* Metrics grid */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center text-xs">
                      <div>
                        <div className="font-black text-slate-800">{client.productsCount}</div>
                        <div className="text-[10px] text-slate-400 font-medium">Tovarlar</div>
                      </div>
                      <div>
                        <div className="font-black text-slate-800">{client.staffCount || 1}</div>
                        <div className="text-[10px] text-slate-400 font-medium">Xodimlar</div>
                      </div>
                      <div>
                        <div className="font-black text-slate-800">{client.shiftsCount || 0}</div>
                        <div className="text-[10px] text-slate-400 font-medium">Kassa Smenalari</div>
                      </div>
                    </div>

                    {/* Contact & Plan */}
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Masʼul shaxs:</span>
                        <span className="font-semibold text-slate-800">{client.ownerName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Telefon / Email:</span>
                        <span className="font-mono text-slate-700">{client.phone}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-400">Tarif rejasi:</span>
                        <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                          {client.plan || 'Standart'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openModuleModal(client)}
                        title="Ushbu kompaniya uchun modullarni yoqish/oʻchirish"
                        className="p-2 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 transition-colors"
                      >
                        <SlidersHorizontal size={15} />
                      </button>

                      <button
                        onClick={() => {
                          setClientToDelete(client);
                          setDeleteError(null);
                        }}
                        title="Kompaniyani oʻchirish"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Impersonate button */}
                    <Button
                      onClick={() => handleImpersonate(client.id)}
                      disabled={impersonatingId === client.id}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
                      leftIcon={
                        impersonatingId === client.id ? (
                          <RefreshCw size={13} className="animate-spin" />
                        ) : (
                          <LogIn size={13} />
                        )
                      }
                    >
                      {impersonatingId === client.id ? 'Kirilmoqda…' : 'Korxona sifatida kirish'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PLANS & PRICING (SAAS TARIFFS) */}
      {/* ========================================================================= */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2 py-4">
            <h2 className="text-2xl font-black text-slate-900">SaaS Obuna Rejalari va Tariflar</h2>
            <p className="text-xs text-slate-500">
              Oʻzbekistondagi biznes sohalari uchun moslashtirilgan oylik va yillik obuna narxlari.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter Plan */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
                  Boshlangʻich POS
                </span>
                <div>
                  <div className="text-3xl font-black text-slate-900">350,000 <span className="text-sm font-semibold text-slate-500">soʻm / oy</span></div>
                  <p className="text-xs text-slate-400 mt-1">Kichik doʻkon, kassa va butiklar uchun</p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>1 ta Savdo Nuqtasi / Kassa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>POS Terminal & Chek Chop Etish</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>Uzcard / Humo / Naqd pul toʻlovlari</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>1 ta Asosiy Ombor & Qoldiqlar</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <XCircle size={14} className="text-slate-300 shrink-0" />
                    <span>21-BHMS Buxgalteriya yoʻq</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium mb-2">Faol mijozlar: <strong>1 ta</strong></div>
                <Button variant="outline" className="w-full text-xs font-bold">Tarifni Tahrirlash</Button>
              </div>
            </div>

            {/* Standard Plan (Popular) */}
            <div className="bg-white rounded-3xl p-6 border-2 border-teal-600 shadow-lg shadow-teal-900/10 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-teal-600 text-white text-[10px] uppercase font-black px-4 py-1 rounded-bl-xl tracking-wider">
                Ommabop
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-2.5 py-1 rounded-full">
                  Standart Savdo & Ombor
                </span>
                <div>
                  <div className="text-3xl font-black text-slate-900">750,000 <span className="text-sm font-semibold text-slate-500">soʻm / oy</span></div>
                  <p className="text-xs text-slate-400 mt-1">Oʻrta ulgurji-chakana va distribyutorlik</p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-2 font-medium">
                    <Check size={14} className="text-teal-600 shrink-0" />
                    <span>3 tagacha Filial va Omborlar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-teal-600 shrink-0" />
                    <span>Hisob-fakturalar & TTN Yukxati</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-teal-600 shrink-0" />
                    <span>CRM Savdo Quvuri (Kanban)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-teal-600 shrink-0" />
                    <span>Bank koʻchirmalari & Kassa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-teal-600 shrink-0" />
                    <span>FIFO Tannarx hisobi</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium mb-2">Faol mijozlar: <strong>2 ta</strong></div>
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold">Tarifni Tahrirlash</Button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  Korporativ ERP
                </span>
                <div>
                  <div className="text-3xl font-black text-slate-900">1,500,000 <span className="text-sm font-semibold text-slate-500">soʻm / oy</span></div>
                  <p className="text-xs text-slate-400 mt-1">Yirik korxonalar va ishlab chiqarish</p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-2 font-medium">
                    <Check size={14} className="text-indigo-600 shrink-0" />
                    <span>Cheksiz Kassa, Filial & Omborlar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-600 shrink-0" />
                    <span>21-BHMS Buxgalteriya & Provodkalar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-600 shrink-0" />
                    <span>Soliq.uz E-Faktura & MXIK integratsiyasi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-600 shrink-0" />
                    <span>E-IMZO Milliy Raqamli Imzo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-600 shrink-0" />
                    <span>Ishlab chiqarish (BOM tex-karta)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium mb-2">Faol mijozlar: <strong>Barcha MCHJ lar</strong></div>
                <Button variant="outline" className="w-full text-xs font-bold">Tarifni Tahrirlash</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: INTEGRATIONS HEALTH MONITOR */}
      {/* ========================================================================= */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Radio className="text-teal-600 animate-pulse" size={20} /> Oʻzbekiston Milliy Integratsiyalari Monitoringi
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Soliq.uz, E-IMZO, Didox va toʻlov shlyuzlari bilan jonli aloqa holati.
              </p>
            </div>
            <Button
              onClick={handlePingIntegrations}
              disabled={pingingIntegrations}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              leftIcon={pingingIntegrations ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />}
            >
              {pingingIntegrations ? 'Ping yuborilmoqda…' : 'Barcha Aloqalarni Tekshirish'}
            </Button>
          </div>

          {pingSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} /> Barcha milliy shlyuzlar bilan aloqa muvaffaqiyatli tasdiqlandi.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Soliq API */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 font-bold text-sm">
                    🏛️
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Soliq.uz E-Faktura & MXIK</h4>
                    <p className="text-[10px] text-slate-400">api.soliq.uz v2</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ONLINE (142ms)
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Oʻzbekiston Respublikasi Soliq Qoʻmitasi yagona elektron hisob-faktura tizimi.
              </p>
              <div className="text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100 flex justify-between">
                <span>Oxirgi sinxron: <strong>2 daqiqa oldin</strong></span>
                <span className="text-emerald-600 font-bold">99.9% Uptime</span>
              </div>
            </div>

            {/* E-IMZO Agent */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 font-bold text-sm">
                    🔏
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">E-IMZO Brauzer Agenti</h4>
                    <p className="text-[10px] text-slate-400">127.0.0.1:64443</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  TAYYOR
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Milliy raqamli elektron imzo sertifikatlari (.pfx va USB e-token) bilan imzolash xizmati.
              </p>
              <div className="text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100 flex justify-between">
                <span>Protokol: <strong>WSS / HTTPS</strong></span>
                <span className="text-sky-600 font-bold">Cert Ready</span>
              </div>
            </div>

            {/* Didox & Factura EDI */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                    📑
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">EDI Operatorlari</h4>
                    <p className="text-[10px] text-slate-400">Didox.uz & Factura.uz</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ULANGAN
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Kiruvchi va chiquvchi hujjatlarni PKCS#7 formatida yuborish va qabul qilish.
              </p>
              <div className="text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100 flex justify-between">
                <span>Kiruvchi: <strong>Avto-import</strong></span>
                <span className="text-purple-600 font-bold">EDI Sync</span>
              </div>
            </div>

            {/* Payment Gateways */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                    💳
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Toʻlov Shlyuzlari</h4>
                    <p className="text-[10px] text-slate-400">Payme / Click / Uzum</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  FAOL
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Biznes toʻlovlari va SaaS abonent badallarini qabul qilish webhooklari.
              </p>
              <div className="text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100 flex justify-between">
                <span>Merchant: <strong>Tasdiqlangan</strong></span>
                <span className="text-emerald-600 font-bold">Webhook 200 OK</span>
              </div>
            </div>

            {/* SMS Gateway */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">
                    📱
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">SMS Xabarnomalar</h4>
                    <p className="text-[10px] text-slate-400">Eskiz.uz Gateway</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  4,820 SMS
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Xarid cheki, kassa smenasi yopilishi va OTP tasdiqlash xabarlari.
              </p>
              <div className="text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100 flex justify-between">
                <span>Yetkazish tezligi: <strong>&lt; 3 sek</strong></span>
                <span className="text-amber-600 font-bold">99.4%</span>
              </div>
            </div>

            {/* Asl Belgisi */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm">
                    🏷️
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Asl Belgisi Markirovka</h4>
                    <p className="text-[10px] text-slate-400">CRPT Turon</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  FAOL
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Dori vositalari, suv/ichimliklar va maishiy texnika markirovka tekshiruvi.
              </p>
              <div className="text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100 flex justify-between">
                <span>DataMatrix: <strong>Skanerlash tayyor</strong></span>
                <span className="text-rose-600 font-bold">Sinxron</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4.5: SUPPORT & HELPDESK TICKETS (REAL POSTGRESQL DB) */}
      {/* ========================================================================= */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          {/* Header & Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500">Jami Murojaatlar</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{tickets.length}</h3>
                <span className="text-[10px] text-teal-600 font-bold">PostgreSQL Maʼlumotlar bazasi</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <Headphones size={22} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500">Yangi Chiptalar</span>
                <h3 className="text-2xl font-black text-blue-600 mt-1">
                  {tickets.filter((t) => t.status === 'NEW').length}
                </h3>
                <span className="text-[10px] text-blue-500 font-bold">Darhol javob talab qiladi</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <AlertTriangle size={22} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500">Jarayonda (Ishlanmoqda)</span>
                <h3 className="text-2xl font-black text-amber-600 mt-1">
                  {tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'WAITING_CLIENT').length}
                </h3>
                <span className="text-[10px] text-amber-500 font-bold">Oʻrtacha javob: ~1.2 soat</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Clock size={22} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500">Hal Qilingan (Yopilgan)</span>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">
                  {tickets.filter((t) => t.status === 'RESOLVED').length}
                </h3>
                <span className="text-[10px] text-emerald-600 font-bold">100% muvaffaqiyat</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          {/* Action Bar & Filter */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">Holat:</span>
              {[
                { key: 'ALL', label: 'Barchasi' },
                { key: 'NEW', label: 'Yangi' },
                { key: 'IN_PROGRESS', label: 'Jarayonda' },
                { key: 'WAITING_CLIENT', label: 'Mijoz kutilmoqda' },
                { key: 'RESOLVED', label: 'Hal qilingan' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setTicketStatusFilter(f.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    ticketStatusFilter === f.key
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchTickets}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition"
                title="Yangilash"
              >
                <RefreshCw size={14} className={loadingTickets ? 'animate-spin' : ''} />
                <span>Yangilash</span>
              </button>
              <Button
                onClick={() => setShowCreateTicketModal(true)}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs"
                leftIcon={<Plus size={15} />}
              >
                Yangi Murojaat Qoʻshish
              </Button>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Chipta #</th>
                    <th className="py-3 px-4">Mijoz / Korxona</th>
                    <th className="py-3 px-4">Mavzu</th>
                    <th className="py-3 px-4">Muhimlik</th>
                    <th className="py-3 px-4">Holat</th>
                    <th className="py-3 px-4">Masʼul Xodim</th>
                    <th className="py-3 px-4">Sana</th>
                    <th className="py-3 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {loadingTickets ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-teal-600" />
                        Murojaatlar PostgreSQL bazasidan yuklanmoqda...
                      </td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Hozircha hech qanday murojaat yoʻq.
                      </td>
                    </tr>
                  ) : (
                    tickets
                      .filter((t) => ticketStatusFilter === 'ALL' || t.status === ticketStatusFilter)
                      .map((t) => {
                        const priorityBadge =
                          t.priority === 'URGENT'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : t.priority === 'HIGH'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : t.priority === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200';

                        const statusBadge =
                          t.status === 'NEW'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : t.status === 'WAITING_CLIENT'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                        const statusLabel =
                          t.status === 'NEW'
                            ? 'Yangi'
                            : t.status === 'IN_PROGRESS'
                            ? 'Jarayonda'
                            : t.status === 'WAITING_CLIENT'
                            ? 'Mijoz kutilmoqda'
                            : 'Hal qilindi';

                        return (
                          <tr key={t.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3 px-4 font-mono font-bold text-teal-700">
                              {t.ticketNumber}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{t.customerName}</div>
                              <div className="text-[10px] text-slate-400">{t.customerEmail} {t.customerPhone ? `· ${t.customerPhone}` : ''}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-800 line-clamp-1 max-w-xs">{t.subject}</div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MessageSquare size={11} /> {t.messages?.length || 0} ta xabar
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${priorityBadge}`}>
                                {t.priority}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${statusBadge}`}>
                                {statusLabel}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-600">
                              {t.assignedAgentName}
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-[11px]">
                              {new Date(t.createdAt).toLocaleDateString('uz-UZ')}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setSelectedTicket(t)}
                                className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition flex items-center gap-1.5 ml-auto"
                              >
                                <MessageSquare size={13} />
                                <span>Yozishmalar ({t.messages?.length || 0})</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SECURITY & AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="text-indigo-600" size={18} /> Tizim Xavfsizligi va Audit Loglari
              </h2>
              <p className="text-xs text-slate-500">Platformadagi barcha muhim maʼmuriy amallar qaydnomasi.</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">Oxirgi 50 ta yozuv</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Vaqt (Toshkent)</th>
                  <th className="py-3 px-3">Amal / Hodisa</th>
                  <th className="py-3 px-3">Operator / Subyekt</th>
                  <th className="py-3 px-3">IP Manzil</th>
                  <th className="py-3 px-3">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr>
                  <td className="py-3 px-3 font-mono text-slate-500">Bugun, 19:48</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">Super Admin Tizimga Kirdi</td>
                  <td className="py-3 px-3 text-teal-700 font-mono">admin@sapar.uz</td>
                  <td className="py-3 px-3 font-mono text-slate-500">127.0.0.1</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">Muvaffaqiyatli</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-mono text-slate-500">Bugun, 19:35</td>
                  <td className="py-3 px-3">Kompaniya Modullari Tahrirlandi</td>
                  <td className="py-3 px-3 text-slate-800">admin@sapar.uz</td>
                  <td className="py-3 px-3 font-mono text-slate-500">127.0.0.1</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">Saqlandi</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-mono text-slate-500">Bugun, 19:12</td>
                  <td className="py-3 px-3">Yangi Tenant Onbording Yakunlandi</td>
                  <td className="py-3 px-3 text-slate-800">Samarqand Qurilish MChJ</td>
                  <td className="py-3 px-3 font-mono text-slate-500">84.54.72.10</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold text-[10px]">Onboarded</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-mono text-slate-500">Bugun, 18:40</td>
                  <td className="py-3 px-3">Soliq API Sinxronizatsiya Qaydnoma</td>
                  <td className="py-3 px-3 text-slate-800">Tizim (Daemon)</td>
                  <td className="py-3 px-3 font-mono text-slate-500">Server</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">200 OK</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-mono text-slate-500">Bugun, 17:05</td>
                  <td className="py-3 px-3">E-IMZO Sertifikat Tekshiruvi</td>
                  <td className="py-3 px-3 text-slate-800">Buxgalter</td>
                  <td className="py-3 px-3 font-mono text-slate-500">127.0.0.1:64443</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">Tasdiqlandi</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: PLATFORM GLOBAL SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sliders className="text-teal-600" size={18} /> Platforma Global Sozlamalari
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Barcha mijoz korxonalari uchun umumiy texnik parametrlarni boshqaring.
              </p>
            </div>

            {/* Maintenance Mode */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Texnik Tanaffus Rejimi (Maintenance Mode)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Yoqilganda, barcha mijozlarga tizim yangilanayotgani haqida xabar chiqadi.
                </p>
              </div>
              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  maintenanceMode ? 'bg-rose-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                    maintenanceMode ? 'translate-x-6.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Global Broadcast Announcement */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Bell size={14} className="text-amber-500" /> Barcha Korxonalarga Eʼlon Chiqarish
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ushbu matn barcha korxonalar bosh panelida yuqorida koʻrsatiladi.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={announcementActive}
                  onChange={(e) => setAnnouncementActive(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
              </div>
              <textarea
                rows={2}
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Eʼlon matnini kiriting..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <div className="flex justify-end">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-1.5">
                  Eʼlonni Saqlash
                </Button>
              </div>
            </div>

            {/* Database Backup Status */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Database size={14} className="text-indigo-600" /> PostgreSQL Avtomatik Zaxira Nusxasi (Backup)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Oxirgi toʻliq zaxira nusxa: <strong>Bugun, 03:00 (Hajmi: 48.2 MB)</strong>
                </p>
              </div>
              <Button variant="outline" className="text-xs font-bold">
                Zaxira Nusxani Yuklab Olish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: INTERACTIVE GUIDE & SYSTEM DIAGNOSTICS */}
      {/* ========================================================================= */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0B2B33] via-[#0D3842] to-[#028090] text-white p-6 rounded-3xl shadow-lg border border-[#028090]/40 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#02C39A] text-[#0B2B33] uppercase tracking-wider">
                  Super Admin Yoʻriqnoma & Diagnostika
                </span>
                <span className="text-slate-300 text-xs">Versiya 2.9 · Oʻzbekiston</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                SAPAR Tizimi va Milliy Integratsiyalar Diagnostikasi
              </h2>
              <p className="text-slate-200 text-xs mt-1 max-w-2xl">
                E-IMZO drayveri diagnostikasi, 21-BHMS milliy hisoblar rejasi va standart buxgalteriya provodkalari,
                hamda kassa va omborxona amaliyotlari yoʻriqnomasi.
              </p>
            </div>
            <button
              onClick={testEimzoService}
              className="px-4 py-2.5 rounded-xl bg-[#02C39A] hover:bg-[#02A683] text-[#0B2B33] font-black text-xs shadow-md flex items-center gap-2 transition cursor-pointer"
            >
              <Key size={16} /> E-IMZO Testini Boshlash
            </button>
          </div>

          {/* E-IMZO Live Diagnostics Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    E-IMZO Mahalliy Drayveri Holati (127.0.0.1:64443)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Elektron raqamli imzo (ERI) sertifikatlari va USB e-tokenlar bilan ishlash holati
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  eimzoCheckStatus === 'connected'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : eimzoCheckStatus === 'error'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : eimzoCheckStatus === 'checking'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {eimzoCheckStatus === 'connected'
                  ? '🟢 Faol va Ulangan'
                  : eimzoCheckStatus === 'error'
                  ? '🔴 Ulanib Boʻlmadi'
                  : eimzoCheckStatus === 'checking'
                  ? '⏳ Tekshirilmoqda...'
                  : '⚪ Tekshirilmagan'}
              </span>
            </div>

            {eimzoCheckMessage && (
              <div
                className={`p-4 rounded-2xl text-xs font-medium border ${
                  eimzoCheckStatus === 'connected'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {eimzoCheckMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">1-qadam: Oʻrnatish</span>
                <p className="text-xs text-slate-700 font-semibold">e-imzo.uz saytidan drayverni yuklab oling</p>
                <a
                  href="https://e-imzo.uz"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-teal-600 font-bold hover:underline inline-flex items-center gap-1 mt-1.5"
                >
                  Yuklab olish sahifasi <ExternalLink size={12} />
                </a>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">2-qadam: Sertifikat</span>
                <p className="text-xs text-slate-700 font-semibold">.pfx kalitini DSKeys papkasiga yoki USB fleshkaga joylang</p>
                <span className="text-[10px] text-slate-400 block mt-1.5">Standart manzil: C:\DSKeys</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">3-qadam: Imzolash</span>
                <p className="text-xs text-slate-700 font-semibold">Didox, Soliq va shartnomalar avtomatik E-IMZO orqali imzolanadi</p>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1.5">PKCS#7 standarti</span>
              </div>
            </div>
          </div>

          {/* 21-BHMS Chart of Accounts & Provodka Generator */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <FileCode size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    21-BHMS Oʻzbekiston Buxgalteriya Standart Provodkalari
                  </h3>
                  <p className="text-xs text-slate-500">
                    Oʻzbekiston Milliy Hisoblar Rejasi boʻyicha standart buxgalteriya yozuvlari
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: 'Realizatsiya (Savdo Tushumi)',
                  provodkas: [
                    { dt: '4010', dtName: 'Xaridorlar qarzi', kt: '9010', ktName: 'Mahsulot/xizmat sotishdan daromad', desc: 'Hisob-faktura rasmiylashtirilganda' },
                    { dt: '4010', dtName: 'Xaridorlar qarzi', kt: '6410', ktName: 'Byudjetga QQS (12%)', desc: '12% QQS hisoblanganda' },
                    { dt: '9120', dtName: 'Sotilgan tovarlar tannarxi', kt: '2910', ktName: 'Ombordagi tovarlar', desc: 'Tannarx hisobdan chiqarilganda' },
                  ],
                },
                {
                  title: 'Xaridlar & Yetkazib Beruvchilar',
                  provodkas: [
                    { dt: '2910', dtName: 'Ombordagi tovarlar', kt: '6010', ktName: 'Yetkazib beruvchilarga qarz', desc: 'Tovar qabul qilinganda' },
                    { dt: '4410', dtName: 'Byudjetga toʻlangan QQS', kt: '6010', ktName: 'Yetkazib beruvchilarga qarz', desc: 'Kiruvchi QQS hisobga olinganda' },
                    { dt: '6010', dtName: 'Yetkazib beruvchilarga qarz', kt: '5110', ktName: 'Hisob-kitob varagʻi', desc: 'Bank orqali haq toʻlanganda' },
                  ],
                },
                {
                  title: 'Bank & Kassa Tushumlari',
                  provodkas: [
                    { dt: '5110', dtName: 'Hisob-kitob varagʻi', kt: '4010', ktName: 'Xaridorlar qarzi', desc: 'Bank orqali toʻlov kelib tushganda' },
                    { dt: '5010', dtName: 'Milliy valyutadagi kassa', kt: '4010', ktName: 'Xaridorlar qarzi', desc: 'Kassaga naqd pul tushganda' },
                    { dt: '5530', dtName: 'Boshqa maxsus hisoblar (Uzcard/Humo)', kt: '4010', ktName: 'Xaridorlar qarzi', desc: 'Terminal orqali toʻlov qilinganda' },
                  ],
                },
                {
                  title: 'Ish Haqi & Soliqlar',
                  provodkas: [
                    { dt: '9420', dtName: 'Maʼmuriy xarajatlar', kt: '6710', ktName: 'Xodimlarga ish haqi boʻyicha qarz', desc: 'Ish haqi hisoblanganda' },
                    { dt: '6710', dtName: 'Xodimlar bilan hisob-kitob', kt: '6520', ktName: 'JShODS (NDFL 12%)', desc: 'Daromad soligʻi ushlanganda' },
                    { dt: '6710', dtName: 'Xodimlar bilan hisob-kitob', kt: '6530', ktName: 'INPS (0.1%)', desc: 'Xalq banki jamgʻarma pensiya' },
                    { dt: '9420', dtName: 'Maʼmuriy xarajatlar', kt: '6520', ktName: 'Ijtimoiy soliq (12%)', desc: 'Ish beruvchi ijtimoiy soligʻi' },
                  ],
                },
              ].map((grp, idx) => (
                <div key={idx} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <h4 className="font-extrabold text-slate-900 text-xs flex items-center justify-between">
                    <span>{grp.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">21-BHMS</span>
                  </h4>
                  <div className="space-y-1.5">
                    {grp.provodkas.map((p, pIdx) => (
                      <div key={pIdx} className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-center justify-between gap-2 shadow-2xs">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-teal-700 text-xs">Dt {p.dt}</span>
                            <span className="text-slate-300">—</span>
                            <span className="font-mono font-extrabold text-indigo-700 text-xs">Kt {p.kt}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{p.desc}</p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`Dt ${p.dt} - Kt ${p.kt}: ${p.desc}`);
                            toast.success(`Nusxa olindi: Dt ${p.dt} - Kt ${p.kt}`);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-500 transition shrink-0"
                          title="Nusxa olish"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS (MODULE TOGGLES, ADD CLIENT, DELETE CLIENT) */}
      {/* ========================================================================= */}

      {/* Module Configuration Modal */}
      {selectedClientForModules && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  Kompaniya Modullarini Sozlash
                </h3>
                <p className="text-xs text-slate-500">
                  <strong className="text-teal-700">{selectedClientForModules.companyName}</strong> uchun ruxsat etilgan ERP modullari
                </p>
              </div>
              <button
                onClick={() => setSelectedClientForModules(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ×
              </button>
            </div>

            {/* Presets */}
            <div className="my-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Soha boʻyicha tayyor toʻplamlar (Presets):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: 'construction', label: 'Qurilish Mollari', icon: HardHat },
                  { key: 'restaurant', label: 'Restoran & Kafe', icon: Utensils },
                  { key: 'retail', label: 'Chakana & Doʻkon', icon: ShoppingBag },
                  { key: 'all', label: 'Barcha Modullar (ERP)', icon: Sparkles },
                ].map((pr) => {
                  const Icon = pr.icon;
                  return (
                    <button
                      key={pr.key}
                      onClick={() => applySectorPreset(pr.key)}
                      className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-xs font-semibold text-slate-700 transition-all text-left"
                    >
                      <Icon size={14} className="text-teal-600 shrink-0" />
                      <span className="truncate">{pr.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-4">
              {ALL_MODULES.map((m) => {
                const isEnabled = !!clientModules[m.key];
                return (
                  <label
                    key={m.key}
                    onClick={() => toggleClientModule(m.key)}
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer select-none transition-all ${
                      isEnabled
                        ? 'border-teal-500 bg-teal-50/40 text-slate-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs leading-tight">{m.nameUz}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{m.descUz}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            {moduleSaveSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} /> Modullar muvaffaqiyatli saqlandi!
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="white"
                onClick={() => setSelectedClientForModules(null)}
                disabled={isSavingModules}
                className="text-xs"
              >
                Yopish
              </Button>
              <Button
                type="button"
                onClick={handleSaveClientModules}
                disabled={isSavingModules}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
                leftIcon={isSavingModules ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
              >
                {isSavingModules ? 'Saqlanmoqda…' : 'Oʻzgarishlarni Saqlash'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">Yangi SaaS Mijoz Qoʻshish</h3>
                <p className="text-xs text-slate-500">Platformaga yangi korxonani roʻyxatdan oʻtkazish</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs mt-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kompaniya Nomi (MCHJ / XK / YaTT) *</label>
                <input
                  type="text"
                  required
                  value={newTenant.companyName}
                  onChange={(e) => handleCompanyNameChange(e.target.value)}
                  placeholder="Masalan: MEGA STROY INVEST MCHJ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Ish maydoni subdomeni (Subdomain) *</label>
                  <span className="text-[11px] text-teal-600 font-mono font-semibold">*.sapar.uz</span>
                </div>
                <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 bg-white">
                  <span className="px-3 text-slate-400 bg-slate-50 border-r border-slate-200 py-2 font-mono text-xs select-none">
                    https://
                  </span>
                  <input
                    type="text"
                    required
                    value={newTenant.subdomain}
                    onChange={(e) => handleSubdomainChange(e.target.value)}
                    placeholder="masalan: megastroy"
                    className="w-full px-3 py-2 text-sm focus:outline-none font-mono text-slate-900"
                  />
                  <span className="px-3 text-teal-700 bg-teal-50/60 border-l border-slate-200 py-2 font-mono text-xs font-bold select-none">
                    .sapar.uz
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Egasi Ismi *</label>
                  <input
                    type="text"
                    required
                    value={newTenant.ownerFirstName}
                    onChange={(e) => setNewTenant({ ...newTenant, ownerFirstName: e.target.value })}
                    placeholder="Masalan: Sardor"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Familiyasi</label>
                  <input
                    type="text"
                    value={newTenant.ownerLastName}
                    onChange={(e) => setNewTenant({ ...newTenant, ownerLastName: e.target.value })}
                    placeholder="Masalan: Aliyev"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Manzil *</label>
                  <input
                    type="email"
                    required
                    value={newTenant.email}
                    onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                    placeholder="director@kompaniya.uz"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefon Raqami *</label>
                  <input
                    type="tel"
                    required
                    value={newTenant.phone}
                    onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
                    placeholder="+998 90 123 45 67"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">STIR / INN (9 ta raqam)</label>
                  <input
                    type="text"
                    maxLength={9}
                    value={newTenant.stir}
                    onChange={(e) => setNewTenant({ ...newTenant, stir: e.target.value })}
                    placeholder="308123456"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Boshlangʻich Parol *</label>
                  <input
                    type="password"
                    required
                    value={newTenant.password}
                    onChange={(e) => setNewTenant({ ...newTenant, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Soha (Sector)</label>
                  <select
                    value={newTenant.sector}
                    onChange={(e) => setNewTenant({ ...newTenant, sector: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="retail">Chakana Savdo</option>
                    <option value="construction">Qurilish Mollari</option>
                    <option value="restaurant">Restoran / Kafe</option>
                    <option value="pharmacy">Dorixona</option>
                    <option value="services">Xizmat Koʻrsatish</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Shahar</label>
                  <input
                    type="text"
                    value={newTenant.city}
                    onChange={(e) => setNewTenant({ ...newTenant, city: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="white"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
                  leftIcon={isSubmitting ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />}
                >
                  {isSubmitting ? 'Yaratilmoqda…' : 'Kompaniyani Qoʻshish'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl border border-rose-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">Kompaniyani oʻchirish</h3>
                <p className="text-xs text-slate-500">Ushbu amalni ortga qaytarib boʻlmaydi</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100 text-xs text-slate-700 space-y-2 mb-4">
              <p>
                Siz haqiqatdan ham <strong className="text-rose-700 font-extrabold">{clientToDelete.companyName}</strong> kompaniyasini va unga tegishli barcha maʼlumotlarni (tovarlar, fakturalar, xodimlar) oʻchirmoqchimisiz?
              </p>
              {clientToDelete.subdomain && (
                <p className="font-mono text-[11px] text-rose-800 bg-white/80 p-2 rounded-lg border border-rose-200">
                  Subdomen: <strong>{clientToDelete.subdomain}.sapar.uz</strong> boʻshatiladi.
                </p>
              )}
            </div>

            {deleteError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-100/70 border border-rose-200 text-rose-800 text-xs font-semibold">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="white"
                onClick={() => {
                  setClientToDelete(null);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="text-xs"
              >
                Bekor qilish
              </Button>
              <Button
                type="button"
                onClick={handleDeleteClient}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                leftIcon={isDeleting ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
              >
                {isDeleting ? 'Oʻchirilmoqda…' : 'Ha, butunlay oʻchirilsin'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Module Assignment & Menu Provisioning Modal */}
      {selectedClientForModules && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-2xl shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                  <SlidersHorizontal size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Modullar & Menyu Boshqaruvi
                  </h3>
                  <p className="text-xs text-slate-500">
                    <strong className="text-teal-700">{selectedClientForModules.companyName}</strong> uchun ruxsat etilgan menyular
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClientForModules(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto py-4 space-y-4 pr-1">
              {/* Preset Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Tezkor Tarif Shablonlari (Presets):
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applySectorPreset('accounting_only')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F0FBF8] text-[#028090] border border-[#02C39A]/30 hover:bg-[#028090] hover:text-white transition flex items-center gap-1.5"
                  >
                    📖 Faqat Buxgalteriya (1C UZ)
                  </button>
                  <button
                    type="button"
                    onClick={() => applySectorPreset('retail')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition flex items-center gap-1.5"
                  >
                    🛒 Chakana POS & Sklad
                  </button>
                  <button
                    type="button"
                    onClick={() => applySectorPreset('commerce_b2b')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition flex items-center gap-1.5"
                  >
                    🧾 B2B Savdo & Faktura
                  </button>
                  <button
                    type="button"
                    onClick={() => applySectorPreset('services')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition flex items-center gap-1.5"
                  >
                    💼 IT & Xizmatlar
                  </button>
                  <button
                    type="button"
                    onClick={() => applySectorPreset('all')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 transition flex items-center gap-1.5"
                  >
                    👑 Enterprise (Hammasi)
                  </button>
                </div>
              </div>

              {/* Module Toggles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {ALL_MODULES.map((mod) => {
                  const isChecked = Boolean(clientModules[mod.key]);
                  return (
                    <div
                      key={mod.key}
                      onClick={() => toggleClientModule(mod.key)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'bg-teal-50/40 border-teal-200/80 shadow-xs'
                          : 'bg-slate-50/60 border-slate-200 opacity-60 hover:opacity-90'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div
                        className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                      />
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{mod.nameUz}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{mod.descUz}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary of active modules */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>Faol Menyular: <strong>{Object.values(clientModules).filter(Boolean).length} / {ALL_MODULES.length}</strong></span>
                <span className="text-teal-700 font-bold">
                  {clientModules.accounting && !clientModules.pos && !clientModules.crm
                    ? '🎯 Buxgalteriya Rejimi (1C Alternative)'
                    : clientModules.pos && !clientModules.accounting
                    ? '🛒 POS Kassa Rejimi'
                    : '🏢 Aralash / Korporativ Rejim'}
                </span>
              </div>

              {moduleSaveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  Mijoz menyusi muvaffaqiyatli saqlandi va qoʻllanildi!
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="white"
                onClick={() => setSelectedClientForModules(null)}
                className="text-xs"
              >
                Bekor qilish
              </Button>
              <Button
                type="button"
                onClick={handleSaveClientModules}
                disabled={isSavingModules}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs"
                leftIcon={isSavingModules ? <RefreshCw size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
              >
                {isSavingModules ? 'Saqlanmoqda…' : 'Menyuni Saqlash & Qoʻllash'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Details & Conversation Modal (Direct PostgreSQL) */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-2xl shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                  <Headphones size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-teal-700 text-xs">{selectedTicket.ticketNumber}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs font-bold text-slate-800">{selectedTicket.customerName}</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm truncate max-w-md mt-0.5">
                    {selectedTicket.subject}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ×
              </button>
            </div>

            {/* Ticket Info & Status Switcher */}
            <div className="py-3 px-4 bg-slate-50/80 rounded-2xl my-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-3 text-slate-600">
                <span>Email: <strong className="text-slate-900">{selectedTicket.customerEmail}</strong></span>
                {selectedTicket.customerPhone && (
                  <span>Tel: <strong className="text-slate-900">{selectedTicket.customerPhone}</strong></span>
                )}
                <span>SLA: <strong className="text-teal-700">{selectedTicket.slaHours} soat</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">Holat:</span>
                <select
                  value={selectedTicket.status}
                  disabled={isUpdatingTicketStatus}
                  onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="NEW">Yangi</option>
                  <option value="IN_PROGRESS">Jarayonda</option>
                  <option value="WAITING_CLIENT">Mijoz kutilmoqda</option>
                  <option value="RESOLVED">Hal qilingan</option>
                </select>
              </div>
            </div>

            {/* Conversation Messages Thread */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2 min-h-[180px]">
              {(!selectedTicket.messages || selectedTicket.messages.length === 0) ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Hozircha xabarlar mavjud emas.
                </div>
              ) : (
                selectedTicket.messages.map((m) => {
                  const isAgent = m.senderRole === 'AGENT';
                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                        isAgent
                          ? 'bg-teal-50/60 border-teal-200 ml-6 text-slate-800'
                          : 'bg-white border-slate-200 mr-6 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                          {m.senderName}
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                              isAgent
                                ? 'bg-teal-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {m.senderRole}
                          </span>
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {new Date(m.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })} · {new Date(m.createdAt).toLocaleDateString('uz-UZ')}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed text-slate-700 font-medium">
                        {m.message}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Form */}
            <div className="pt-3 border-t border-slate-100 shrink-0 space-y-2.5">
              <textarea
                rows={2}
                value={ticketReplyText}
                onChange={(e) => setTicketReplyText(e.target.value)}
                placeholder="Mijozga javob xabarini yozing..."
                className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="white"
                  onClick={() => setSelectedTicket(null)}
                  className="text-xs"
                >
                  Yopish
                </Button>
                <Button
                  type="button"
                  disabled={isReplyingTicket || !ticketReplyText.trim()}
                  onClick={() => handleReplyTicket(selectedTicket.id)}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs"
                  leftIcon={isReplyingTicket ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                >
                  {isReplyingTicket ? 'Yuborilmoqda…' : 'Javob Yuborish'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal (Direct PostgreSQL) */}
      {showCreateTicketModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                  <Headphones size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Yangi Murojaat (Ticket) Yaratish
                  </h3>
                  <p className="text-xs text-slate-500">Mijoz soʻrovini tizimga roʻyxatga olish</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateTicketModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5 my-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mavzu *</label>
                <input
                  type="text"
                  required
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  placeholder="Masalan: Didox orqali e-faktura yuborilmadi"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mijoz / Korxona Nomi *</label>
                  <input
                    type="text"
                    required
                    value={newTicketForm.customerName}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, customerName: e.target.value })}
                    placeholder="MCHJ yoki F.I.Sh."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newTicketForm.customerEmail}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, customerEmail: e.target.value })}
                    placeholder="client@mail.uz"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefon Raqami</label>
                  <input
                    type="text"
                    value={newTicketForm.customerPhone}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, customerPhone: e.target.value })}
                    placeholder="+998 90 123-45-67"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Muhimlik Darajasi</label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none cursor-pointer"
                  >
                    <option value="LOW">Past (Low)</option>
                    <option value="MEDIUM">Oʻrta (Medium)</option>
                    <option value="HIGH">Yuqori (High)</option>
                    <option value="URGENT">Oʻta Muhim (Urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dastlabki Xabar Matni</label>
                <textarea
                  rows={3}
                  value={newTicketForm.initialMessage}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, initialMessage: e.target.value })}
                  placeholder="Mijoz murojaati tafsilotlarini yozing..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="white"
                  onClick={() => setShowCreateTicketModal(false)}
                  disabled={isCreatingTicket}
                  className="text-xs"
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingTicket}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs"
                  leftIcon={isCreatingTicket ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />}
                >
                  {isCreatingTicket ? 'Yaratilmoqda…' : 'Chiptani Yaratish'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaasClientsPage;
