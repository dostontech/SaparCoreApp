import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  Loader2,
  XCircle,
  Printer,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import Constants from '@constants/api';
import { eimzoService, type EimzoCertificate } from '../../services/eimzoService';
import { EDigitalStamp } from '@components/admin/eimzo/EDigitalStamp';

export const PublicDocumentSigner: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [document, setDocument] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);

  // E-IMZO local certificates
  const [certificates, setCertificates] = useState<EimzoCertificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<EimzoCertificate | null>(null);
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchDocument();
    loadCertificates();
  }, [id]);

  const fetchDocument = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${Constants.BASE_URL}/public/e-documents/${id}/verify`);
      if (res.data.success) {
        setDocument(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching public document:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCertificates = async () => {
    try {
      const certs = await eimzoService.listCertificates();
      setCertificates(certs);
      if (certs.length > 0) setSelectedCert(certs[0]);
    } catch (err) {
      console.warn('Could not load E-IMZO certificates:', err);
    }
  };

  const handleSignAsRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCert) {
      toast.error('Iltimos, E-IMZO kalitini tanlang');
      return;
    }

    setSigning(true);
    try {
      const pkcs7Signature = await eimzoService.signPkcs7(
        selectedCert,
        JSON.stringify(document),
        password
      );

      const res = await axios.post(`${Constants.BASE_URL}/public/e-documents/${id}/sign-recipient`, {
        pkcs7Signature,
        certInfo: selectedCert,
      });

      if (res.data.success) {
        toast.success('Hujjat E-IMZO bilan muvaffaqiyatli tasdiqlandi!');
        setShowSignModal(false);
        fetchDocument();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Imzolashda xatolik yuz berdi');
    } finally {
      setSigning(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Iltimos, rad etish sababini kiriting');
      return;
    }

    setRejecting(true);
    try {
      const res = await axios.post(`${Constants.BASE_URL}/public/e-documents/${id}/reject`, {
        reason: rejectionReason,
      });
      if (res.data.success) {
        toast.success('Hujjat rad etildi');
        setShowRejectModal(false);
        fetchDocument();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Rad etishda xatolik yuz berdi');
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
          <p className="text-sm font-semibold text-heading">Hujjat yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto" />
          <h2 className="text-lg font-bold text-heading">Hujjat topilmadi</h2>
          <p className="text-xs text-body">
            Ushbu elektron hujjat mavjud emas yoki muddati tugagan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Branding Banner */}
        <div className="flex items-center justify-between bg-surface border border-border p-4 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-heading text-base leading-tight">SAPAR E-Faktura Portali</h2>
              <p className="text-[11px] text-body">Oʻzbekiston Respublikasi elektron hujjat aylanishi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-body hover:bg-muted transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Chop etish
            </button>
          </div>
        </div>

        {/* Status Callout Banner */}
        {document.status === 'FULLY_SIGNED' ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Hujjat ikki tomonlama imzolangan</h4>
                <p className="text-xs text-emerald-800">
                  Ushbu hujjat ikkala tomonning E-IMZO elektron raqamli imzosi bilan toʻliq tasdiqlangan va qonuniy kuchga ega.
                </p>
              </div>
            </div>
          </div>
        ) : document.status === 'REJECTED' ? (
          <div className="bg-red-50 border border-red-200 text-red-900 rounded-2xl p-4 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Hujjat rad etilgan</h4>
              <p className="text-xs text-red-800">Ushbu hujjat qabul qiluvchi tomonidan rad etilgan.</p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Sizning E-IMZO imzoingiz kutilmoqda</h4>
                <p className="text-xs text-amber-800">
                  Yetkazib beruvchi hujjatni imzolab yuborgan. Hujjatni qabul qilish uchun E-IMZO kalitingiz bilan tasdiqlang.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition"
              >
                Rad etish
              </button>
              <button
                type="button"
                onClick={() => setShowSignModal(true)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-700 text-white hover:bg-teal-800 transition flex items-center gap-1.5 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" /> E-IMZO bilan Tasdiqlash
              </button>
            </div>
          </div>
        )}

        {/* Document Sheet */}
        <div className="bg-surface border border-border rounded-2xl p-8 sm:p-12 space-y-8 shadow-xs">
          {/* Header */}
          <div className="text-center border-b border-border pb-6 space-y-1">
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
              Elektron Hujjat (E-Faktura)
            </span>
            <h1 className="text-2xl font-black text-heading uppercase">{document.title}</h1>
            <p className="text-xs text-body">
              Hujjat raqami: <span className="font-bold text-heading">{document.docNumber}</span> • Sana: <span className="font-bold text-heading">{document.docDate}</span>
            </p>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-1.5">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                Yetkazib beruvchi (Sotuvchi)
              </span>
              <p className="font-bold text-heading text-sm">{document.seller?.name}</p>
              <p className="font-mono text-body">STIR: {document.seller?.tin}</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-1.5">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                Qabul qiluvchi (Xaridor)
              </span>
              <p className="font-bold text-heading text-sm">{document.buyer?.name}</p>
              <p className="font-mono text-body">STIR: {document.buyer?.tin}</p>
            </div>
          </div>

          {/* Dual Digital Stamps */}
          <div className="border-t border-border pt-6 space-y-4">
            <h3 className="text-xs font-bold text-heading uppercase tracking-wider text-center">
              Elektron Raqamli Imzolar
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
              <div className="w-full flex justify-center">
                <EDigitalStamp
                  signature={document.senderSignature}
                  roleTitle="Joʻnatuvchi Muhri"
                  isSigned={!!document.senderSignature}
                />
              </div>

              <div className="w-full flex justify-center">
                <EDigitalStamp
                  signature={document.recipientSignature}
                  roleTitle="Qabul qiluvchi Muhri"
                  isSigned={!!document.recipientSignature}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipient Signing Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-surface rounded-2xl shadow-2xl border border-border max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-heading text-base">E-IMZO bilan tasdiqlash</h3>
              </div>
              <button onClick={() => setShowSignModal(false)} className="text-body hover:text-heading">✕</button>
            </div>

            <form onSubmit={handleSignAsRecipient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-heading mb-1.5">E-IMZO Kalitingizni tanlang</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      onClick={() => setSelectedCert(cert)}
                      className={`p-3 rounded-xl border text-left cursor-pointer text-xs transition ${
                        selectedCert?.id === cert.id
                          ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600/20'
                          : 'border-border hover:border-teal-500'
                      }`}
                    >
                      <p className="font-bold text-heading">{cert.CN}</p>
                      <p className="text-body text-[11px]">{cert.O || 'Tashkilot'}</p>
                      <p className="font-mono text-[10px] text-body mt-1">STIR: {cert.TIN} • PINFL: {cert.PINFL}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-heading mb-1.5 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-teal-600" /> Kalit Paroli
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kalit paroli (agar mavjud boʻlsa)"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-surface text-heading focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSignModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-xs font-medium text-body hover:bg-muted"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={signing || !selectedCert}
                  className="flex-1 py-2.5 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {signing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tasdiqlash & Imzolash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-surface rounded-2xl shadow-2xl border border-border max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-heading text-base text-red-600">Hujjatni rad etish</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-body hover:text-heading">✕</button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-heading">Rad etish sababini yozing</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Masalan: Mahsulot narxi yoki miqdorida tafovut mavjud..."
                rows={4}
                className="w-full p-3 text-xs rounded-xl border border-border bg-surface text-heading focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-xs font-medium text-body hover:bg-muted"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={rejecting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {rejecting ? 'Yuborilmoqda...' : 'Rad etishni tasdiqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicDocumentSigner;
