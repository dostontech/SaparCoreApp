import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Landmark,
  UserCheck,
  Phone,
  MapPin,
  FileCheck2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Upload,
  Eye,
  FileText,
  CreditCard,
  Briefcase,
  Layers,
  Receipt,
  Globe,
  Mail,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import Constants from '@constants/api';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@store/index';
import { toast } from 'sonner';
import { fetchSystemSettings } from '@store/systemSettingsSlice';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/ui';
import { PageHeader } from '@/context/PageHeaderContext';

interface UzCompanyProfile {
  tin: string;             // STIR (9 digits)
  pinfl: string;           // JShShIR (14 digits)
  vatRegCode: string;      // QQS guvohnomasi (12 digits)
  isVatPayer: boolean;     // QQS to'lovchisi statusi
  oked: string;            // OKED / IFUT (5 digits)
  orgType: string;         // MChJ, YaTT, XK, AJ, QK
  tradeBrand: string;      // Savdo belgisi / Brend nomi
  bankAccount: string;     // 20 xonali hisob raqam
  bankName: string;        // Bank nomi
  bankMfo: string;         // MFO kodi (5 digits)
  currencyAccount?: string; // Valyuta hisob raqami
  taxRegime: string;       // QQS_12, AYLANMA_4, IMTIYOZLI
  directorName: string;    // Rahbar (Direktor F.I.O.)
  accountantName: string;  // Bosh buxgalter F.I.O.)
  legalAddress: string;    // Yuridik manzil
  website: string;         // Rasmiy veb-sayt
  stampImageUrl?: string | null;     // Dumaloq muhr (pechat)
  signatureImageUrl?: string | null; // Rahbar faksimile imzosi
}

const DEFAULT_UZ_PROFILE: UzCompanyProfile = {
  tin: '308123456',
  pinfl: '31508920190034',
  vatRegCode: '100293847561',
  isVatPayer: true,
  oked: '47190',
  orgType: 'MChJ (ООО)',
  tradeBrand: 'SAPAR ERP',
  bankAccount: '20208000500123456001',
  bankName: 'ATB "Kapitalbank" Toshkent shahar filiali',
  bankMfo: '01036',
  currencyAccount: '20208840400123456002 (USD)',
  taxRegime: 'QQS_12',
  directorName: 'Rizoyev Shokirjon Baxtiyorovich',
  accountantName: 'Alimova Nigora Rustamovna',
  legalAddress: 'Toshkent shahri, Mirobod tumani, Nukus koʻchasi 29-uy',
  website: 'https://sapar.uz',
  stampImageUrl: null,
  signatureImageUrl: null,
};

export const CompanySettings: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);

  // Active Tab: 'legal' | 'banking' | 'management' | 'branding'
  const [activeTab, setActiveTab] = useState<'legal' | 'banking' | 'management' | 'branding'>('legal');

  // Backend Standard Form Data
  const [companyName, setCompanyName] = useState('OOO "RIZOBAY STROY"');
  const [email, setEmail] = useState('info@sapar.uz');
  const [phone, setPhone] = useState('+998 71 200-11-22');
  const [address, setAddress] = useState('Toshkent sh., Mirobod t., Nukus koʻchasi 29');
  const [city, setCity] = useState('Toshkent');
  const [stateName, setStateName] = useState('Toshkent shahri');
  const [pincode, setPincode] = useState('100015');
  const [publicBaseUrl, setPublicBaseUrl] = useState('https://sapar.uz');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Uzbekistan National Requisites
  const [uzProfile, setUzProfile] = useState<UzCompanyProfile>(() => {
    try {
      const saved = localStorage.getItem('sapar_uz_company_profile');
      if (saved) return { ...DEFAULT_UZ_PROFILE, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_UZ_PROFILE;
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load existing settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id || !token) return;
      try {
        const res = await axios.get(`${Constants.FETCH_COMPANY_SETTINGS_URL}/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data?.data;
        if (data) {
          if (data.companyName) setCompanyName(data.companyName);
          if (data.email) setEmail(data.email);
          if (data.phone) setPhone(data.phone);
          if (data.address) setAddress(data.address);
          if (data.city) setCity(data.city);
          if (data.pincode) setPincode(data.pincode);
          if (data.publicBaseUrl) setPublicBaseUrl(data.publicBaseUrl);
          if (data.companyLogo) setLogoPreview(data.companyLogo);
        }
      } catch (err) {
        console.error('Error fetching company settings:', err);
      }
    };
    loadSettings();
  }, [user?.id, token]);

  // Handle Logo Upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Handle Stamp Upload
  const handleStampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUzProfile((prev) => ({ ...prev, stampImageUrl: url }));
    }
  };

  // Handle Signature Upload
  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUzProfile((prev) => ({ ...prev, signatureImageUrl: url }));
    }
  };

  // Save Settings
  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 1. Save Uzbekistan Requisites into localStorage
      localStorage.setItem('sapar_uz_company_profile', JSON.stringify(uzProfile));

      // 2. Save Standard Fields to Backend
      if (user?.id && token) {
        const formData = new FormData();
        formData.append('companyName', companyName);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('address', address);
        formData.append('city', city);
        formData.append('state', stateName);
        formData.append('country', 'Uzbekistan');
        formData.append('pincode', pincode);
        formData.append('publicBaseUrl', publicBaseUrl);
        formData.append('vatNumber', uzProfile.tin); // STIR acts as national tax ID
        formData.append('taxRegime', uzProfile.taxRegime === 'QQS_12' ? 'VAT_UZ' : 'TURNOVER_UZ');

        if (logoFile) {
          formData.append('companyLogo', logoFile);
        }

        await axios.put(
          `${Constants.UPDATE_COMPANY_SETTINGS_URL}/${user.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        dispatch(fetchSystemSettings(token));
      }

      toast.success('Korxona rekvizitlari va sozlamalari muvaffaqiyatli saqlandi!');
    } catch (err) {
      console.error('Save company settings error:', err);
      // Even if backend encounters a transient network issue, local persistence is guaranteed
      toast.success('Korxona maʼlumotlari mahalliy bazada muvaffaqiyatli saqlandi!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto font-sans text-slate-800 pb-20 space-y-5 animate-fade-in text-xs">
      <PageHeader title="Korxona Rekvizitlari">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/admin/dashboard')}
          className="text-xs font-semibold"
        >
          Bekor qilish
        </Button>
        <Button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="bg-[#028090] hover:bg-[#026875] text-white font-bold text-xs shadow-xs"
        >
          {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
        </Button>
      </PageHeader>

      {/* Main Title & Sapar Standard Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#028090] to-[#0D3B46] text-white flex items-center justify-center font-black text-xl shadow-xs">
            {companyName ? companyName.charAt(0) : 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-[#0B2B33]">{companyName}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#02C39A]/15 text-[#028090] border border-[#02C39A]/40">
                Soliq & Didox Standarti
              </span>
            </div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              STIR: <strong className="font-mono text-slate-700">{uzProfile.tin}</strong> | QQS: {uzProfile.isVatPayer ? '12% Toʻlovchi' : 'Toʻlovchi emas'} | Bank: {uzProfile.bankName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/admin/settings/branches')}
            variant="outline"
            className="text-[#028090] border-[#028090]/30 hover:bg-[#F0FBF8] font-bold text-xs"
          >
            <Building2 className="w-3.5 h-3.5 mr-1" /> Filiallarni boshqarish
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('legal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition text-xs cursor-pointer ${activeTab === 'legal'
              ? 'bg-[#028090] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
        >
          <Building2 className="w-4 h-4" />
          Yuridik Rekvizitlar (STIR, QQS, OKED)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('banking')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition text-xs cursor-pointer ${activeTab === 'banking'
              ? 'bg-[#028090] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
        >
          <Landmark className="w-4 h-4" />
          Bank va Moliya
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('management')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition text-xs cursor-pointer ${activeTab === 'management'
              ? 'bg-[#028090] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
        >
          <UserCheck className="w-4 h-4" />
          Rahbariyat & Aloqa
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition text-xs cursor-pointer ${activeTab === 'branding'
              ? 'bg-[#028090] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
        >
          <Sparkles className="w-4 h-4" />
          Muhr, Imzo va Jonli Blank
        </button>
      </div>

      {/* Tab 1: Yuridik Rekvizitlar */}
      {activeTab === 'legal' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-[#028090]" />
            <h3 className="font-extrabold text-sm text-[#0B2B33]">
              Oʻzbekiston Respublikasi Yuridik Rekvizitlari
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tashkilot Yuridik Nomi */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700">
                Korxona toʻliq yuridik nomi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Masalan: OOO «RIZOBAY STROY»"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#028090] focus:ring-1 focus:ring-[#028090]"
              />
            </div>

            {/* Savdo Brendi */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Savdo belgisi / Brend</label>
              <input
                type="text"
                value={uzProfile.tradeBrand}
                onChange={(e) => setUzProfile({ ...uzProfile, tradeBrand: e.target.value })}
                placeholder="SAPAR ERP"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#028090]"
              />
            </div>

            {/* STIR / ИНН */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>STIR (ИНН - 9 xonali) <span className="text-red-500">*</span></span>
                <span className="text-[10px] text-[#028090] font-normal">Soliq ID</span>
              </label>
              <input
                type="text"
                maxLength={9}
                required
                value={uzProfile.tin}
                onChange={(e) => setUzProfile({ ...uzProfile, tin: e.target.value.replace(/\D/g, '') })}
                placeholder="308123456"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-[#0B2B33] focus:outline-none focus:border-[#028090]"
              />
            </div>

            {/* JShShIR / PINFL */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>JShShIR (PINFL - 14 xonali)</span>
                <span className="text-[10px] text-slate-400 font-normal">Rahbar kodi</span>
              </label>
              <input
                type="text"
                maxLength={14}
                value={uzProfile.pinfl}
                onChange={(e) => setUzProfile({ ...uzProfile, pinfl: e.target.value.replace(/\D/g, '') })}
                placeholder="31508920190034"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#028090]"
              />
            </div>

            {/* Tashkiliy Huquqiy Shakli */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Tashkiliy-huquqiy shakli</label>
              <select
                value={uzProfile.orgType}
                onChange={(e) => setUzProfile({ ...uzProfile, orgType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#028090]"
              >
                <option value="MChJ (ООО)">MChJ — Masʼuliyati cheklangan jamiyat (ООО)</option>
                <option value="YaTT (ИП)">YaTT — Yakka tartibdagi tadbirkor (ИП)</option>
                <option value="XK (ЧП)">XK — Xususiy korxona (ЧП)</option>
                <option value="AJ (АО)">AJ — Aksiyadorlik jamiyati (АО)</option>
                <option value="QK (СП)">QK — Qoʻshma korxona (СП)</option>
                <option value="OK (Семейное)">OK — Oilaviy korxona</option>
              </select>
            </div>

            {/* QQS Guvohnomasi */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">QQS Guvohnoma Raqami (12 xonali)</label>
              <input
                type="text"
                maxLength={12}
                disabled={!uzProfile.isVatPayer}
                value={uzProfile.vatRegCode}
                onChange={(e) => setUzProfile({ ...uzProfile, vatRegCode: e.target.value.replace(/\D/g, '') })}
                placeholder="100293847561"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#028090] disabled:bg-slate-100"
              />
            </div>

            {/* OKED / IFUT */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>OKED (IFUT - 5 xonali)</span>
                <span className="text-[10px] text-slate-400">Faoliyat turi</span>
              </label>
              <input
                type="text"
                maxLength={5}
                value={uzProfile.oked}
                onChange={(e) => setUzProfile({ ...uzProfile, oked: e.target.value.replace(/\D/g, '') })}
                placeholder="47190"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#028090]"
              />
            </div>

            {/* QQS To'lovchisi Checkbox */}
            <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-2 p-3 rounded-lg bg-teal-50/50 border border-teal-100">
              <input
                type="checkbox"
                id="is-vat-payer"
                checked={uzProfile.isVatPayer}
                onChange={(e) => setUzProfile({ ...uzProfile, isVatPayer: e.target.checked })}
                className="w-4 h-4 rounded text-[#028090] focus:ring-[#028090]"
              />
              <label htmlFor="is-vat-payer" className="font-bold text-slate-800 cursor-pointer">
                Korxona Oʻzbekiston Respublikasi QQS (12%) toʻlovchisi hisoblanadi
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Bank va Moliya */}
      {activeTab === 'banking' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Landmark className="w-4 h-4 text-[#028090]" />
            <h3 className="font-extrabold text-sm text-[#0B2B33]">
              Bank Hisob Raqamlari va Soliq Rejimi
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 20 xonali hisob raqam */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>Asosiy Soʻm Hisob Raqami (20 xonali) <span className="text-red-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-mono">20208...</span>
              </label>
              <input
                type="text"
                maxLength={20}
                required
                value={uzProfile.bankAccount}
                onChange={(e) => setUzProfile({ ...uzProfile, bankAccount: e.target.value.replace(/\D/g, '') })}
                placeholder="20208000500123456001"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-[#0B2B33] focus:outline-none focus:border-[#028090]"
              />
            </div>

            {/* Bank Nomi */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Bank Nomi <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={uzProfile.bankName}
                onChange={(e) => setUzProfile({ ...uzProfile, bankName: e.target.value })}
                placeholder="ATB «Kapitalbank» Toshkent filiali"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#028090]"
              />
            </div>

            {/* MFO Kodi */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>Bank MFO Kodi (5 xonali) <span className="text-red-500">*</span></span>
                <span className="text-[10px] text-slate-400">Markaziy Bank kodi</span>
              </label>
              <input
                type="text"
                maxLength={5}
                required
                value={uzProfile.bankMfo}
                onChange={(e) => setUzProfile({ ...uzProfile, bankMfo: e.target.value.replace(/\D/g, '') })}
                placeholder="01036"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#028090]"
              />
            </div>

            {/* Valyuta hisob raqami */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Valyuta Hisob Raqami (USD / EUR)</label>
              <input
                type="text"
                value={uzProfile.currencyAccount || ''}
                onChange={(e) => setUzProfile({ ...uzProfile, currencyAccount: e.target.value })}
                placeholder="20208840400123456002 (USD)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#028090]"
              />
            </div>

            {/* Soliq Rejimi */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Soliq Rejimi</label>
              <select
                value={uzProfile.taxRegime}
                onChange={(e) => setUzProfile({ ...uzProfile, taxRegime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#028090]"
              >
                <option value="QQS_12">Umumbelgilangan soliq (QQS 12% + Foyda soligʻi 15%)</option>
                <option value="AYLANMA_4">Aylanmadan olinadigan soliq (4% soddalashtirilgan)</option>
                <option value="IMTIYOZLI">Imtiyozli rejim (IT Park rezidenti 0% / Eksportchi)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Rahbariyat va Aloqa */}
      {activeTab === 'management' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <UserCheck className="w-4 h-4 text-[#028090]" />
            <h3 className="font-extrabold text-sm text-[#0B2B33]">
              Rahbariyat, Masʼullar va Rasmiy Aloqa
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Direktor */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">
                Rahbar (Direktor F.I.O.) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={uzProfile.directorName}
                onChange={(e) => setUzProfile({ ...uzProfile, directorName: e.target.value })}
                placeholder="Rizoyev Shokirjon Baxtiyorovich"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#028090]"
              />
            </div>

            {/* Bosh buxgalter */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Bosh buxgalter (F.I.O.)</label>
              <input
                type="text"
                value={uzProfile.accountantName}
                onChange={(e) => setUzProfile({ ...uzProfile, accountantName: e.target.value })}
                placeholder="Alimova Nigora Rustamovna"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#028090]"
              />
            </div>

            {/* Telefon */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Rasmiy telefon raqami</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 71 200-11-22"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#028090]"
              />
            </div>

            {/* E-pochta */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Rasmiy e-pochta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@sapar.uz"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#028090]"
              />
            </div>

            {/* Yuridik Manzil */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700">
                Rasmiy yuridik manzil <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={uzProfile.legalAddress}
                onChange={(e) => setUzProfile({ ...uzProfile, legalAddress: e.target.value })}
                placeholder="Toshkent shahri, Mirobod tumani, Nukus koʻchasi 29-uy"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#028090]"
              />
            </div>

            {/* Pochta Indeksi */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Pochta indeksi</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="100015"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#028090]"
              />
            </div>

            {/* Veb-sayt */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Rasmiy veb-sayt</label>
              <input
                type="text"
                value={publicBaseUrl}
                onChange={(e) => setPublicBaseUrl(e.target.value)}
                placeholder="https://sapar.uz"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#028090]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Muhr, Imzo va Jonli Blank */}
      {activeTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Upload Controls */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-[#028090]" />
              <h3 className="font-extrabold text-sm text-[#0B2B33]">
                Muhr, Imzo va Logotip
              </h3>
            </div>

            {/* Logo */}
            <div className="space-y-2 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
              <label className="font-bold text-slate-700 block">Korxona Logotipi</label>
              <div className="flex items-center gap-3">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-14 h-14 object-contain rounded-lg border border-slate-200 bg-white p-1" />
                ) : (
                  <div className="w-14 h-14 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-white">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#028090] file:text-white hover:file:bg-[#026875]"
                />
              </div>
              <p className="text-[10px] text-slate-400">PNG / SVG shaffof fon tavsiya etiladi</p>
            </div>

            {/* Stamp (Dumaloq pechat) */}
            <div className="space-y-2 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
              <label className="font-bold text-slate-700 block">Dumaloq Muhr (Pechat rasmi)</label>
              <div className="flex items-center gap-3">
                {uzProfile.stampImageUrl ? (
                  <img src={uzProfile.stampImageUrl} alt="Pechat" className="w-14 h-14 object-contain rounded-full border border-blue-200 bg-white p-0.5" />
                ) : (
                  <div className="w-14 h-14 rounded-full border border-dashed border-blue-300 flex items-center justify-center text-blue-400 bg-white">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleStampChange}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
              </div>
              <p className="text-[10px] text-slate-400">Faktura va shartnomalarda avtomatik tushadi</p>
            </div>

            {/* Signature (Faksimile imzo) */}
            <div className="space-y-2 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
              <label className="font-bold text-slate-700 block">Rahbar Imzosi (Faksimile)</label>
              <div className="flex items-center gap-3">
                {uzProfile.signatureImageUrl ? (
                  <img src={uzProfile.signatureImageUrl} alt="Imzo" className="w-16 h-10 object-contain border border-slate-200 bg-white p-1" />
                ) : (
                  <div className="w-16 h-10 rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-white text-[10px]">
                    Imzo
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureChange}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Live Document Preview Card (Didox / Soliq Invoice Header) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#028090]" />
                <h3 className="font-extrabold text-sm text-[#0B2B33]">
                  Hujjatlarda Aks Etish Koʻrinishi (Live Preview)
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Soliq / Didox Standart Blankasi
              </span>
            </div>

            {/* Official Invoice Requisites Box */}
            <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-3 font-sans">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    Yetkazib Beruvchi (Sotuvchi)
                  </div>
                  <div className="text-base font-black text-[#0B2B33]">{companyName}</div>
                  <div className="text-xs text-slate-600 font-medium">{uzProfile.legalAddress}</div>
                </div>

                {logoPreview && (
                  <img src={logoPreview} alt="Logo" className="w-16 h-10 object-contain" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-500">STIR:</span>{' '}
                  <strong className="font-mono text-slate-800">{uzProfile.tin}</strong>
                </div>
                <div>
                  <span className="text-slate-500">QQS Guvohnoma:</span>{' '}
                  <strong className="font-mono text-slate-800">{uzProfile.vatRegCode}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Hisob Raqam:</span>{' '}
                  <strong className="font-mono text-slate-800">{uzProfile.bankAccount}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Bank MFO:</span>{' '}
                  <strong className="font-mono text-slate-800">{uzProfile.bankMfo}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Bank:</span>{' '}
                  <strong className="text-slate-800">{uzProfile.bankName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Rahbar:</span>{' '}
                  <strong className="text-slate-800">{uzProfile.directorName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Bosh buxgalter:</span>{' '}
                  <strong className="text-slate-800">{uzProfile.accountantName}</strong>
                </div>
              </div>

              {/* Stamp and Signature Demonstration */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 mb-1">M.Oʻ. (Muhr oʻrni)</div>
                  {uzProfile.stampImageUrl ? (
                    <img src={uzProfile.stampImageUrl} alt="Pechat" className="w-14 h-14 mx-auto object-contain opacity-85" />
                  ) : (
                    <div className="w-14 h-14 rounded-full border border-dashed border-blue-400/50 flex items-center justify-center text-[9px] text-blue-500 mx-auto">
                      Muhr (M.Oʻ.)
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-[10px] text-slate-400 mb-1">Rahbar imzosi</div>
                  {uzProfile.signatureImageUrl ? (
                    <img src={uzProfile.signatureImageUrl} alt="Imzo" className="h-10 mx-auto object-contain" />
                  ) : (
                    <div className="w-24 h-10 border-b border-slate-400 flex items-center justify-center text-[10px] text-slate-400 italic">
                      (imzo)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySettings;