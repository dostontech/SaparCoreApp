import React, { useEffect, useState } from 'react';
import { KeyRound, ShieldCheck, FileCheck2, AlertCircle, Loader2, CheckCircle2, Lock } from 'lucide-react';
import axios from 'axios';
import { eimzoService, type EimzoCertificate } from '../../../services/eimzoService';
import Constants from '@constants/api';

interface EimzoSignModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber?: string;
  customerName?: string;
  totalAmount?: number;
  onSuccess?: (result: any) => void;
}

export const EimzoSignModal: React.FC<EimzoSignModalProps> = ({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
  customerName,
  totalAmount,
  onSuccess,
}) => {
  const [certificates, setCertificates] = useState<EimzoCertificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<EimzoCertificate | null>(null);
  const [password, setPassword] = useState('');
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [signing, setSigning] = useState(false);
  const [agentRunning, setAgentRunning] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessResult(null);
      setPassword('');
      loadCertificates();
    }
  }, [isOpen]);

  const loadCertificates = async () => {
    setLoadingKeys(true);
    setError(null);
    try {
      const isRunning = await eimzoService.isAgentRunning();
      setAgentRunning(isRunning);
      const certs = await eimzoService.listCertificates();
      setCertificates(certs);
      if (certs.length > 0) {
        setSelectedCert(certs[0]);
      }
    } catch (err: any) {
      setError('E-IMZO kalitlarini yuklashda xatolik: ' + (err.message || ''));
    } finally {
      setLoadingKeys(false);
    }
  };

  const handleSignAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCert) {
      setError('Iltimos, raqamli imzo kalitini tanlang.');
      return;
    }

    setSigning(true);
    setError(null);

    try {
      // 1. Fetch canonical Soliq/Didox document JSON from backend
      const prepareRes = await axios.get(
        `${Constants.BASE_URL}/admin/e-invoices/prepare/${invoiceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { canonicalString, soliqPayload } = prepareRes.data.data;

      // 2. Sign canonical document with E-IMZO PKCS#7
      const pkcs7Signature = await eimzoService.signPkcs7(
        selectedCert,
        canonicalString,
        password
      );

      // 3. Submit signed document to Didox / Soliq EDI via backend
      const submitRes = await axios.post(
        `${Constants.BASE_URL}/admin/e-invoices/send-signed`,
        {
          invoiceId,
          pkcs7Signature,
          soliqPayload,
          signerPinfl: selectedCert.PINFL,
          signerTin: selectedCert.TIN,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessResult(submitRes.data.data);
      if (onSuccess) {
        onSuccess(submitRes.data.data);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'E-IMZO orqali imzolashda xatolik yuz berdi';
      setError(msg);
    } finally {
      setSigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl shadow-2xl border border-border max-w-lg w-full overflow-hidden transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight">E-IMZO bilan imzolash</h3>
              <p className="text-xs text-emerald-100/80">E-Faktura (Didox / Soliq) milliy standarti</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-white/70 hover:text-white rounded-lg p-1 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Document Summary Card */}
          <div className="bg-primary-soft border border-primary/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Hujjat</span>
              <p className="font-bold text-heading text-base">
                № {invoiceNumber || 'Hisob-faktura'}
              </p>
              {customerName && <p className="text-xs text-body">Mijoz: {customerName}</p>}
            </div>
            {totalAmount !== undefined && (
              <div className="text-right">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Jami summa</span>
                <p className="font-bold text-heading text-lg">
                  {totalAmount.toLocaleString()} <span className="text-xs font-normal text-body">soʻm</span>
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">
                  QQS 12% hisoblangan
                </span>
              </div>
            )}
          </div>

          {/* Success State */}
          {successResult ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-heading">Hujjat imzolandi va yuborildi!</h4>
                <p className="text-sm text-body mt-1">
                  E-Faktura Didox/Soliq tizimiga uzatildi. Hujjat ID: <span className="font-mono font-medium text-primary">{successResult.externalDocId}</span>
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl font-medium bg-primary text-white hover:bg-primary-hover transition"
                >
                  Yopish
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSignAndSubmit} className="space-y-4">
              {/* Agent status banner */}
              {agentRunning === false && (
                <div className="flex items-start gap-2 bg-amber-50 text-amber-800 text-xs p-3 rounded-lg border border-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Mahalliy E-IMZO dasturi topilmadi. Tizim oʻrnatilgan xavfsiz kalitlar orqali sinov rejimida imzolashni davom ettiradi.
                  </span>
                </div>
              )}

              {/* Key Selector */}
              <div>
                <label className="block text-xs font-semibold text-heading mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-primary" /> E-IMZO Kalitini tanlang
                  </span>
                  {loadingKeys && (
                    <span className="text-[11px] text-primary flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Qidirilmoqda...
                    </span>
                  )}
                </label>

                {certificates.length === 0 && !loadingKeys ? (
                  <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    Hech qanday E-IMZO kaliti (.pfx) topilmadi.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {certificates.map((cert) => {
                      const isSelected = selectedCert?.id === cert.id;
                      return (
                        <div
                          key={cert.id}
                          onClick={() => setSelectedCert(cert)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                              : 'border-border bg-surface hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-heading">{cert.CN}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-body">
                              STIR: {cert.TIN}
                            </span>
                          </div>
                          {cert.O && (
                            <p className="text-[11px] text-body mt-0.5 truncate">{cert.O} • {cert.T || 'Rahbar'}</p>
                          )}
                          <div className="flex items-center justify-between mt-2 text-[10px] text-body/70">
                            <span>PINFL: {cert.PINFL || '—'}</span>
                            <span>Amal qiladi: {cert.validTo} gacha</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-heading mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" /> E-IMZO Kalit Paroli
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kalit paroli (agar oʻrnatilgan boʻlsa)"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-surface text-heading placeholder:text-body/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={signing}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border border-border text-body hover:bg-muted transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={signing || !selectedCert}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary-hover transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {signing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Imzolanmoqda...
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="w-4 h-4" /> Tasdiqlash & Imzolash
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
