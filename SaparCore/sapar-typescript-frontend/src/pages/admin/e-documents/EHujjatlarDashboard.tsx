import React, { useEffect, useState, useRef } from 'react';
import {
  FileText,
  Inbox,
  Send,
  FileClock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Copy,
  Plus,
  Truck,
  FileSignature,
  FileCheck2,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { PageHeader } from '@/context/PageHeaderContext';
import { Button, FormField, Select } from '@components/ui';
import Constants from '@constants/api';
import { EimzoSignModal } from '@components/admin/eimzo/EimzoSignModal';
import { AktSverkiGeneratorModal } from '@components/admin/e-documents/AktSverkiGeneratorModal';
import { IshonchnomaGeneratorModal } from '@components/admin/e-documents/IshonchnomaGeneratorModal';
import { ContractGeneratorModal } from '@components/admin/e-documents/ContractGeneratorModal';

export const EHujjatlarDashboard: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken') || localStorage.getItem('token') || '';

  const [activeTab, setActiveTab] = useState<'all' | 'inbox' | 'outbox' | 'drafts'>('all');
  const [docTypeFilter, setDocTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    all: 0,
    inbox: 0,
    outbox: 0,
    drafts: 0,
    waiting: 0,
    signed: 0,
  });

  const [signingDoc, setSigningDoc] = useState<any | null>(null);

  // Generator Modals state
  const [aktSverkiModalOpen, setAktSverkiModalOpen] = useState(false);
  const [ishonchnomaModalOpen, setIshonchnomaModalOpen] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, [activeTab, docTypeFilter, statusFilter, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setCreateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${Constants.BASE_URL}/admin/e-documents`, {
        params: {
          tab: activeTab,
          docType: docTypeFilter,
          status: statusFilter,
          search,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setDocuments(res.data.data.documents || []);
        setCounts(res.data.data.counts || {});
      }
    } catch (err) {
      console.error('Error fetching e-documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyPublicLink = (docId: string) => {
    const url = `${window.location.origin}/public/sign-document/${docId}`;
    navigator.clipboard.writeText(url);
    toast.success('Hujjatni imzolash havolasi nusxalandi');
  };

  const handleDocumentCreated = (newDoc: any) => {
    fetchDocuments();
    if (newDoc?.id) {
      navigate(`/admin/e-documents/${newDoc.id}`);
    }
  };

  const getDocTypeIcon = (type: string) => {
    switch (type) {
      case 'INVOICE':
        return <FileText className="w-4 h-4 text-teal-600" />;
      case 'WAYBILL':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'EMPOWERMENT':
        return <FileSignature className="w-4 h-4 text-indigo-600" />;
      case 'ACT_RECONCILIATION':
        return <FileCheck2 className="w-4 h-4 text-emerald-600" />;
      case 'CONTRACT':
        return <Layers className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-teal-600" />;
    }
  };

  const getDocTypeName = (type: string) => {
    switch (type) {
      case 'INVOICE':
        return 'Hisob-faktura';
      case 'WAYBILL':
        return 'Yukxati (TTN)';
      case 'EMPOWERMENT':
        return 'Ishonchnoma (M-2)';
      case 'ACT_RECONCILIATION':
        return 'Akt sverki';
      case 'CONTRACT':
        return 'Shartnoma';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FULLY_SIGNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Toʻliq imzolangan
          </span>
        );
      case 'WAITING_COUNTERPARTY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <FileClock className="w-3.5 h-3.5" /> Imzo kutilmoqda
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <AlertCircle className="w-3.5 h-3.5" /> Rad etilgan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            Qoralama
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="E-Hujjatlar (Elektron Hujjat Aylanishi & E-Faktura)"
      >
        <div className="flex items-center gap-3">
          {/* Multi-Action Create Dropdown */}
          <div className="relative inline-block" ref={menuRef}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCreateMenuOpen(!createMenuOpen)}
              leftIcon={<Plus className="w-4 h-4" />}
              rightIcon={<ChevronDown className={`w-3.5 h-3.5 transition-transform ${createMenuOpen ? 'rotate-180' : ''}`} />}
            >
              + Yangi Hujjat
            </Button>

            {createMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-surface border border-border shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] font-bold text-body uppercase tracking-wider">
                  Milliy Hujjat Generatorlari
                </div>
                <div className="space-y-1 mt-1">
                  <button
                    onClick={() => {
                      setCreateMenuOpen(false);
                      setAktSverkiModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-heading hover:bg-emerald-50 hover:text-emerald-800 transition text-left"
                  >
                    <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold">Solishtirma dalolatnoma</p>
                      <p className="text-[10px] text-body font-normal">Akt sverki взаиморасчетов</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCreateMenuOpen(false);
                      setIshonchnomaModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-heading hover:bg-indigo-50 hover:text-indigo-800 transition text-left"
                  >
                    <FileSignature className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <p className="font-bold">Ishonchnoma (Shakl M-2)</p>
                      <p className="text-[10px] text-body font-normal">Tovarlarni olish uchun</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCreateMenuOpen(false);
                      setContractModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-heading hover:bg-purple-50 hover:text-purple-800 transition text-left"
                  >
                    <Layers className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <p className="font-bold">Elektron Shartnoma</p>
                      <p className="text-[10px] text-body font-normal">Oldi-sotdi, xizmat, ijara</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCreateMenuOpen(false);
                      navigate('/admin/invoices');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-heading hover:bg-teal-50 hover:text-teal-800 transition text-left"
                  >
                    <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <p className="font-bold">Elektron Hisob-Faktura</p>
                      <p className="text-[10px] text-body font-normal">QQS 12% va MXIK kodi bilan</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="white"
            size="sm"
            onClick={() => navigate('/admin/settings/edi-settings')}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            E-IMZO Sozlamalari
          </Button>
        </div>
      </PageHeader>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-2xl border border-border flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-medium text-body">Barcha E-Hujjatlar</p>
            <p className="text-2xl font-bold text-heading mt-1">{counts.all}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-border flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-medium text-body">Ikki Tomonlama Imzolangan</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{counts.signed}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-border flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-medium text-body">Imzo Kutilmoqda</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{counts.waiting}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileClock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-border flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-medium text-body">Kiruvchi Fakturalar</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{counts.inbox}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Inbox className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        {[
          { id: 'all', label: 'Barcha hujjatlar', icon: FileText, count: counts.all },
          { id: 'inbox', label: 'Kiruvchi (Inbox)', icon: Inbox, count: counts.inbox },
          { id: 'outbox', label: 'Chiquvchi (Outbox)', icon: Send, count: counts.outbox },
          { id: 'drafts', label: 'Qoralamalar', icon: FileClock, count: counts.drafts },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-body hover:text-heading hover:bg-muted/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-muted text-body'
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'Barcha hujjat turlari' },
              { value: 'INVOICE', label: 'Hisob-faktura (Invoice)' },
              { value: 'ACT_RECONCILIATION', label: 'Solishtirma dalolatnoma (Akt sverki)' },
              { value: 'EMPOWERMENT', label: 'Ishonchnoma (Form M-2)' },
              { value: 'CONTRACT', label: 'Shartnomalar (Contracts)' },
              { value: 'WAYBILL', label: 'Yukxati (TTN)' },
            ]}
            className="w-48 text-xs"
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'Barcha holatlar' },
              { value: 'FULLY_SIGNED', label: 'Toʻliq imzolangan' },
              { value: 'WAITING_COUNTERPARTY', label: 'Imzo kutilmoqda' },
              { value: 'DRAFT', label: 'Qoralama' },
              { value: 'REJECTED', label: 'Rad etilgan' },
            ]}
            className="w-44 text-xs"
          />
        </div>

        <div className="w-full sm:w-64">
          <FormField
            placeholder="Hujjat raqami, STIR yoki tashkilot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs"
          />
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-body font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4">Hujjat turi & №</th>
                <th className="py-3 px-4">Sana</th>
                <th className="py-3 px-4">Yetkazib beruvchi / Sotuvchi</th>
                <th className="py-3 px-4">Qabul qiluvchi / Xaridor</th>
                <th className="py-3 px-4 text-right">Summa (soʻm)</th>
                <th className="py-3 px-4 text-center">Holati</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-body">
                    Hujjatlar yuklanmoqda...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-body">
                    <p className="font-semibold text-sm text-heading">Hujjatlar topilmadi</p>
                    <p className="text-xs text-body mt-1">Yangi hujjat yaratish uchun yuqoridagi tugmadan foydalaning.</p>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-muted/50">
                          {getDocTypeIcon(doc.docType)}
                        </div>
                        <div>
                          <span className="font-bold text-heading block font-mono">
                            {doc.docNumber}
                          </span>
                          <span className="text-[11px] text-body">
                            {getDocTypeName(doc.docType)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-body font-medium">
                      {doc.docDate}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-heading block">
                        {doc.sellerName}
                      </span>
                      <span className="text-[11px] text-body font-mono">
                        STIR: {doc.sellerTin}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-heading block">
                        {doc.buyerName}
                      </span>
                      <span className="text-[11px] text-body font-mono">
                        STIR: {doc.buyerTin}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-heading">
                      {Number(doc.totalSum).toLocaleString('uz-UZ')} {doc.currency}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/e-documents/${doc.id}`)}
                          className="p-1.5 rounded-lg text-body hover:text-heading hover:bg-muted/60 transition"
                          title="Koʻrish"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => copyPublicLink(doc.id)}
                          className="p-1.5 rounded-lg text-body hover:text-heading hover:bg-muted/60 transition"
                          title="Imzolash havolasini nusxalash"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {!doc.senderSignature && (
                          <button
                            type="button"
                            onClick={() => setSigningDoc(doc)}
                            className="px-2.5 py-1.5 rounded-lg font-medium text-xs bg-primary text-white hover:bg-primary-hover transition flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" /> Imzolash
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generator Modals */}
      <AktSverkiGeneratorModal
        isOpen={aktSverkiModalOpen}
        onClose={() => setAktSverkiModalOpen(false)}
        onSuccess={handleDocumentCreated}
      />

      <IshonchnomaGeneratorModal
        isOpen={ishonchnomaModalOpen}
        onClose={() => setIshonchnomaModalOpen(false)}
        onSuccess={handleDocumentCreated}
      />

      <ContractGeneratorModal
        isOpen={contractModalOpen}
        onClose={() => setContractModalOpen(false)}
        onSuccess={handleDocumentCreated}
      />

      {/* E-IMZO Signing Modal */}
      {signingDoc && (
        <EimzoSignModal
          isOpen={!!signingDoc}
          onClose={() => setSigningDoc(null)}
          invoiceId={signingDoc.id}
          invoiceNumber={signingDoc.docNumber}
          customerName={signingDoc.buyerName}
          totalAmount={signingDoc.totalSum}
          onSuccess={() => {
            toast.success('Hujjat E-IMZO bilan imzolandi');
            fetchDocuments();
          }}
        />
      )}
    </div>
  );
};

export default EHujjatlarDashboard;
