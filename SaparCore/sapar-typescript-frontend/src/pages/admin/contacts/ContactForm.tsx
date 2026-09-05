import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { RootState } from '@store/index';
import Constants from '@constants/api';
import InputField from '@components/admin/InputField';
import CurrencySelect from '@components/admin/CurrencySelect';
import { useCurrencies } from '@hooks/useCurrencies';
import FullPageLoader from '@components/admin/FullPageLoader';
import { Save, Users, Building2, Phone, MapPin, Receipt, ArrowLeft } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

type DefaultTaxTreatment = 'STANDARD' | 'ZERO_RATED' | 'EXEMPT' | 'REVERSE_CHARGE' | 'OUT_OF_SCOPE';
type ContactStatus = 'ACTIVE' | 'HIDDEN';

interface CountryOption {
    id: string;
    name: string;
}

interface ContactFormData {
    // Identity
    firstName: string;
    lastName: string;
    organisation: string;
    showNameOnInvoice: boolean;
    // Comms
    email: string;
    billingEmail: string;
    telephone: string;
    mobile: string;
    // Address
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    town: string;
    region: string;
    postcode: string;
    countryId: string;
    country: string;
    // Invoicing
    defaultPaymentTermDays: string;
    defaultTaxTreatment: DefaultTaxTreatment;
    vatRegNumber: string;
    vatNumber: string;
    gstin: string;
    invoiceLanguage: string;
    invoiceSequencePrefix: string;
    useContactEmailSettings: boolean;
    // Currency
    currencyCode: string;
    // Status
    status: ContactStatus;
}

type ErrorResponse = {
    errors: { [key: string]: string };
    message?: string;
};

const UZBEKISTAN_REGIONS = [
    'Toshkent shahri',
    'Toshkent viloyati',
    'Samarqand viloyati',
    'Buxoro viloyati',
    'Fargʻona viloyati',
    'Andijon viloyati',
    'Namangan viloyati',
    'Qashqadaryo viloyati',
    'Surxondaryo viloyati',
    'Jizzax viloyati',
    'Sirdaryo viloyati',
    'Navoiy viloyati',
    'Xorazm viloyati',
    'Qoraqalpogʻiston Respublikasi',
];

const initialFormData: ContactFormData = {
    firstName: '',
    lastName: '',
    organisation: '',
    showNameOnInvoice: true,
    email: '',
    billingEmail: '',
    telephone: '',
    mobile: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    town: '',
    region: 'Toshkent shahri',
    postcode: '',
    countryId: '',
    country: 'UZ',
    defaultPaymentTermDays: '15',
    defaultTaxTreatment: 'STANDARD',
    vatRegNumber: '',
    vatNumber: '',
    gstin: '',
    invoiceLanguage: 'uz',
    invoiceSequencePrefix: 'SF-',
    useContactEmailSettings: false,
    currencyCode: 'UZS',
    status: 'ACTIVE',
};

// ── Component ─────────────────────────────────────────────────────────────────

const CONTACTS_URL = `${Constants.API_BASE_URL}/admin/contacts`;

const ContactForm: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const { token } = useSelector((state: RootState) => state.auth);

    const [formData, setFormData] = useState<ContactFormData>(initialFormData);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetching, setIsFetching] = useState(isEditMode);

    // Country dropdown
    const [countries, setCountries] = useState<CountryOption[]>([]);
    const [isLoadingCountries, setIsLoadingCountries] = useState(false);

    const { defaultCurrencyCode } = useCurrencies();

    // Seed currency default for new contacts
    useEffect(() => {
        if (!isEditMode) {
            setFormData((prev) => ({
                ...prev,
                currencyCode: prev.currencyCode || defaultCurrencyCode || 'UZS',
            }));
        }
    }, [defaultCurrencyCode, isEditMode]);

    // Fetch countries on mount
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                setIsLoadingCountries(true);
                const response = await axios.get(Constants.FETCH_COUNTRIES_URL, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const list: CountryOption[] = (response.data || []).map((c: { id: string | number; name: string }) => ({
                    id: String(c.id),
                    name: c.name,
                }));
                setCountries(list);

                // Default to Uzbekistan if available
                if (!isEditMode && list.length > 0) {
                    const uz = list.find((c) => c.name.toLowerCase().includes('uzbek') || c.name.toLowerCase().includes('oʻzbek'));
                    if (uz) {
                        setFormData((prev) => ({ ...prev, countryId: prev.countryId || uz.id, country: 'UZ' }));
                    }
                }
            } catch (error) {
                console.error('Failed to load countries:', error);
            } finally {
                setIsLoadingCountries(false);
            }
        };
        fetchCountries();
    }, [token, isEditMode]);

    // Load existing contact for edit mode
    useEffect(() => {
        if (!isEditMode) return;
        const fetchContact = async () => {
            try {
                setIsFetching(true);
                const response = await axios.get(`${CONTACTS_URL}/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = response.data.data;
                if (data) {
                    setFormData({
                        firstName: data.firstName || '',
                        lastName: data.lastName || '',
                        organisation: data.organisation || '',
                        showNameOnInvoice: data.showNameOnInvoice ?? true,
                        email: data.email || '',
                        billingEmail: data.billingEmail || '',
                        telephone: data.telephone || '',
                        mobile: data.mobile || '',
                        addressLine1: data.addressLine1 || '',
                        addressLine2: data.addressLine2 || '',
                        addressLine3: data.addressLine3 || '',
                        town: data.town || '',
                        region: data.region || 'Toshkent shahri',
                        postcode: data.postcode || '',
                        countryId: data.countryId ? String(data.countryId) : '',
                        country: data.country || 'UZ',
                        defaultPaymentTermDays: data.defaultPaymentTermDays != null ? String(data.defaultPaymentTermDays) : '15',
                        defaultTaxTreatment: data.defaultTaxTreatment || 'STANDARD',
                        vatRegNumber: data.vatRegNumber || '',
                        vatNumber: data.vatNumber || '',
                        gstin: data.gstin || data.vatRegNumber || '',
                        invoiceLanguage: data.invoiceLanguage || 'uz',
                        invoiceSequencePrefix: data.invoiceSequencePrefix || 'SF-',
                        useContactEmailSettings: data.useContactEmailSettings ?? false,
                        currencyCode: data.currencyCode || defaultCurrencyCode || 'UZS',
                        status: data.status || 'ACTIVE',
                    });
                }
            } catch (error) {
                console.error('Error fetching contact:', error);
                toast.error('Kontakt maʼlumotlarini yuklab boʻlmadi.');
            } finally {
                setIsFetching(false);
            }
        };
        fetchContact();
    }, [id, isEditMode, token, defaultCurrencyCode]);

    const handleFormChange = (field: keyof ContactFormData, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    // Client-side identity validation: need org OR (firstName + lastName)
    const validateForm = (): boolean => {
        setFormErrors({});
        const errors: { [key: string]: string } = {};

        const hasOrg = formData.organisation.trim().length > 0;
        const hasFirstName = formData.firstName.trim().length > 0;
        const hasLastName = formData.lastName.trim().length > 0;

        if (!hasOrg && !(hasFirstName && hasLastName)) {
            errors.identity = 'Kompaniya / korxona nomini yoki masʼul shaxsning ism va familiyasini kiriting.';
        }

        if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Elektron pochta manzili notoʻgʻri formatda.';
        }

        if (formData.billingEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingEmail)) {
            errors.billingEmail = 'Hisob-faktura uchun email notoʻgʻri formatda.';
        }

        if (formData.defaultPaymentTermDays.trim()) {
            const days = Number(formData.defaultPaymentTermDays);
            if (!Number.isInteger(days) || days < 0) {
                errors.defaultPaymentTermDays = 'Toʻlov muddati butun musbat son boʻlishi kerak.';
            }
        }

        if (formData.gstin.trim()) {
            const digits = formData.gstin.trim().replace(/\D/g, '');
            if (digits.length !== 9 && digits.length !== 14) {
                errors.gstin = 'STIR 9 xonali (yuridik shaxs) yoki JShShIR 14 xonali (jismoniy shaxs) boʻlishi kerak.';
            }
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            if (errors.identity) {
                toast.error(errors.identity);
            } else {
                toast.error('Iltimos, shakldagi xatoliklarni toʻgʻrilang.');
            }
            return false;
        }
        return true;
    };

    const buildPayload = () => {
        const stirClean = formData.gstin.trim() || null;
        return {
            firstName: formData.firstName.trim() || null,
            lastName: formData.lastName.trim() || null,
            organisation: formData.organisation.trim() || null,
            showNameOnInvoice: formData.showNameOnInvoice,
            email: formData.email.trim() || null,
            billingEmail: formData.billingEmail.trim() || null,
            telephone: formData.telephone.trim() || null,
            mobile: formData.mobile.trim() || null,
            addressLine1: formData.addressLine1.trim() || null,
            addressLine2: formData.addressLine2.trim() || null,
            addressLine3: formData.addressLine3.trim() || null,
            town: formData.town.trim() || null,
            region: formData.region.trim() || 'Toshkent shahri',
            postcode: formData.postcode.trim() || null,
            countryId: formData.countryId || null,
            country: formData.country.trim().toUpperCase() || 'UZ',
            defaultPaymentTermDays: formData.defaultPaymentTermDays.trim() ? Number(formData.defaultPaymentTermDays) : 15,
            defaultTaxTreatment: formData.defaultTaxTreatment,
            vatRegNumber: stirClean,
            vatNumber: stirClean,
            gstin: stirClean,
            invoiceLanguage: formData.invoiceLanguage.trim() || 'uz',
            invoiceSequencePrefix: formData.invoiceSequencePrefix.trim() || 'SF-',
            useContactEmailSettings: formData.useContactEmailSettings,
            currencyCode: formData.currencyCode || 'UZS',
            status: formData.status,
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            const payload = buildPayload();

            if (isEditMode) {
                await axios.put(`${CONTACTS_URL}/${id}`, payload, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                });
                toast.success('Kontakt muvaffaqiyatli yangilandi!');
            } else {
                await axios.post(CONTACTS_URL, payload, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                });
                toast.success('Yangi kontakt muvaffaqiyatli yaratildi!');
            }
            navigate('/admin/contacts');
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            const data = axiosError.response?.data;
            if (data?.errors) {
                setFormErrors(data.errors);
                if (data.errors.identity) {
                    toast.error(data.errors.identity);
                } else {
                    toast.error('Shaklni toʻldirishda xatolik yuz berdi.');
                }
            } else {
                toast.error(data?.message || 'Xatolik yuz berdi. Iltimos qayta urinib koʻring.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectClass = 'mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#028090] focus:border-transparent text-sm text-slate-800 disabled:bg-slate-50';

    return (
        <div className="space-y-5 max-w-5xl mx-auto pb-12">
            {/* Top Page Banner with Title and Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/contacts')}
                        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition cursor-pointer"
                        title="Orqaga"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#028090]" />
                            {isEditMode ? 'Kontaktni tahrirlash' : 'Yangi kontakt / mijoz qoʻshish'}
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Oʻzbekiston rekvizitlari, STIR (9 xonali), QQS 12% va hisob-kitob parametrlari
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/contacts')}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                    >
                        Bekor qilish
                    </button>
                    <button
                        type="submit"
                        form="contact-form"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#028090] to-[#02C39A] hover:brightness-105 transition shadow-sm cursor-pointer disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {isSubmitting ? 'Saqlanmoqda...' : isEditMode ? 'Oʻzgarishlarni saqlash' : 'Kontaktni saqlash'}
                    </button>
                </div>
            </div>

            {/* Main Form Card */}
            <div className="p-6 bg-white rounded-2xl shadow-xs border border-slate-200">
                <form id="contact-form" className="space-y-8" onSubmit={handleSubmit}>

                    {/* ── 1. Shaxs va Korxona (Identity) ───────────────────── */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2.5 mb-5 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#028090]" />
                            1. Shaxs va Korxona maʼlumotlari
                        </h3>
                        {formErrors.identity && (
                            <p className="mb-4 text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                                {formErrors.identity}
                            </p>
                        )}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-6">
                            <InputField
                                id="contactOrganisation"
                                label="Kompaniya / Korxona nomi (Yuridik shaxs)"
                                value={formData.organisation}
                                onChange={(e) => handleFormChange('organisation', e.target.value)}
                                placeholder="Masalan: OOO 'MEGA SAVDO' yoki YaTT 'Aliyev'"
                                className="sm:col-span-3"
                                error={formErrors.organisation}
                            />
                            <InputField
                                id="contactFirstName"
                                label="Masʼul shaxs ismi"
                                value={formData.firstName}
                                onChange={(e) => handleFormChange('firstName', e.target.value)}
                                placeholder="Ismni kiriting"
                                className="sm:col-span-3"
                                error={formErrors.firstName}
                            />
                            <InputField
                                id="contactLastName"
                                label="Masʼul shaxs familiyasi"
                                value={formData.lastName}
                                onChange={(e) => handleFormChange('lastName', e.target.value)}
                                placeholder="Familiyani kiriting"
                                className="sm:col-span-3"
                                error={formErrors.lastName}
                            />
                            <div className="sm:col-span-6 flex items-center gap-3 pt-1">
                                <input
                                    id="contactShowNameOnInvoice"
                                    type="checkbox"
                                    checked={formData.showNameOnInvoice}
                                    onChange={(e) => handleFormChange('showNameOnInvoice', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-[#028090] focus:ring-[#028090]"
                                />
                                <label htmlFor="contactShowNameOnInvoice" className="text-xs font-medium text-slate-700 cursor-pointer">
                                    Hisob-fakturada kompaniya / masʼul shaxs nomini chop etish
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* ── 2. Aloqa maʼlumotlari (Communications) ───────────── */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2.5 mb-5 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-[#028090]" />
                            2. Aloqa maʼlumotlari (Telefon & Email)
                        </h3>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-6">
                            <InputField
                                id="contactTelephone"
                                label="Telefon raqami (Asosiy)"
                                value={formData.telephone}
                                onChange={(e) => handleFormChange('telephone', e.target.value)}
                                placeholder="+998 71 123 45 67"
                                className="sm:col-span-3"
                                error={formErrors.telephone}
                            />
                            <InputField
                                id="contactMobile"
                                label="Mobil / Qoʻshimcha telefon"
                                value={formData.mobile}
                                onChange={(e) => handleFormChange('mobile', e.target.value)}
                                placeholder="+998 90 123 45 67"
                                className="sm:col-span-3"
                                error={formErrors.mobile}
                            />
                            <InputField
                                id="contactEmail"
                                label="Elektron pochta (Asosiy email)"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleFormChange('email', e.target.value)}
                                placeholder="pochta@kompaniya.uz"
                                className="sm:col-span-3"
                                error={formErrors.email}
                            />
                            <InputField
                                id="contactBillingEmail"
                                label="Hisob-fakturalar uchun email (Buxgalteriya)"
                                type="email"
                                value={formData.billingEmail}
                                onChange={(e) => handleFormChange('billingEmail', e.target.value)}
                                placeholder="buxgalteriya@kompaniya.uz"
                                className="sm:col-span-3"
                                error={formErrors.billingEmail}
                            />
                        </div>
                    </section>

                    {/* ── 3. Manzil (Address) ──────────────────────────────── */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2.5 mb-5 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#028090]" />
                            3. Manzil maʼlumotlari
                        </h3>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <label htmlFor="contactCountry" className="block text-xs font-semibold text-slate-700">
                                    Mamlakat (Davlat)
                                </label>
                                <select
                                    id="contactCountry"
                                    value={formData.countryId}
                                    onChange={(e) => handleFormChange('countryId', e.target.value)}
                                    disabled={isLoadingCountries}
                                    className={selectClass}
                                >
                                    <option value="">
                                        {isLoadingCountries ? 'Yuklanmoqda...' : 'Oʻzbekiston (Default)'}
                                    </option>
                                    {countries.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="contactRegionSelect" className="block text-xs font-semibold text-slate-700">
                                    Viloyat / Shahar (Oʻzbekiston)
                                </label>
                                <select
                                    id="contactRegionSelect"
                                    value={formData.region}
                                    onChange={(e) => handleFormChange('region', e.target.value)}
                                    className={selectClass}
                                >
                                    {UZBEKISTAN_REGIONS.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <InputField
                                id="contactTown"
                                label="Tuman / Shahar"
                                value={formData.town}
                                onChange={(e) => handleFormChange('town', e.target.value)}
                                placeholder="Masalan: Mirzo Ulugʻbek tumani"
                                className="sm:col-span-3"
                                error={formErrors.town}
                            />

                            <InputField
                                id="contactPostcode"
                                label="Pochta indeksi"
                                value={formData.postcode}
                                onChange={(e) => handleFormChange('postcode', e.target.value)}
                                placeholder="Masalan: 100000"
                                className="sm:col-span-3"
                                error={formErrors.postcode}
                            />

                            <InputField
                                id="contactAddressLine1"
                                label="Koʻcha va bino (Manzil 1-qator)"
                                value={formData.addressLine1}
                                onChange={(e) => handleFormChange('addressLine1', e.target.value)}
                                placeholder="Masalan: Mustaqillik shoh koʻchasi, 45-uy"
                                className="sm:col-span-3"
                                error={formErrors.addressLine1}
                            />

                            <InputField
                                id="contactAddressLine2"
                                label="Xonadon / Ofis (Manzil 2-qator)"
                                value={formData.addressLine2}
                                onChange={(e) => handleFormChange('addressLine2', e.target.value)}
                                placeholder="Masalan: 4-qavat, 402-ofis"
                                className="sm:col-span-3"
                                error={formErrors.addressLine2}
                            />
                        </div>
                    </section>

                    {/* ── 4. Soliq va Hisob-faktura (Invoicing & Taxes) ───────── */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2.5 mb-5 flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-[#028090]" />
                            4. Soliq va Hisob-faktura sozlamalari
                        </h3>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-6">
                            <InputField
                                id="contactGstin"
                                label="STIR / ИНН (9 xonali) yoki JShShIR (14 xonali PINFL)"
                                value={formData.gstin}
                                onChange={(e) => handleFormChange('gstin', e.target.value)}
                                placeholder="Masalan: 308123456 yoki 31204958271049"
                                className="sm:col-span-3"
                                error={formErrors.gstin}
                            />

                            <div className="sm:col-span-3">
                                <label htmlFor="contactDefaultTaxTreatment" className="block text-xs font-semibold text-slate-700">
                                    QQS soliq rejimi
                                </label>
                                <select
                                    id="contactDefaultTaxTreatment"
                                    value={formData.defaultTaxTreatment}
                                    onChange={(e) => handleFormChange('defaultTaxTreatment', e.target.value as DefaultTaxTreatment)}
                                    className={selectClass}
                                >
                                    <option value="STANDARD">Standart QQS 12% (QQS toʻlovchi)</option>
                                    <option value="ZERO_RATED">0% stavka (Eksport tovarlari)</option>
                                    <option value="EXEMPT">QQSdan ozod qilingan / Imtiyozli</option>
                                    <option value="OUT_OF_SCOPE">Aylanma soliq / QQS toʻlovchi emas (4%)</option>
                                    <option value="REVERSE_CHARGE">Teskari soliq solish</option>
                                </select>
                            </div>

                            <InputField
                                id="contactPaymentTermDays"
                                label="Standart toʻlov muddati (kunlar)"
                                type="number"
                                value={formData.defaultPaymentTermDays}
                                onChange={(e) => handleFormChange('defaultPaymentTermDays', e.target.value)}
                                placeholder="15"
                                className="sm:col-span-2"
                                error={formErrors.defaultPaymentTermDays}
                            />

                            <InputField
                                id="contactInvoiceSequencePrefix"
                                label="Faktura prefiksi (Sequence Prefix)"
                                value={formData.invoiceSequencePrefix}
                                onChange={(e) => handleFormChange('invoiceSequencePrefix', e.target.value)}
                                placeholder="Masalan: SF-"
                                className="sm:col-span-2"
                                error={formErrors.invoiceSequencePrefix}
                            />

                            <div className="sm:col-span-2">
                                <label htmlFor="contactInvoiceLanguage" className="block text-xs font-semibold text-slate-700">
                                    Faktura hujjati tili
                                </label>
                                <select
                                    id="contactInvoiceLanguage"
                                    value={formData.invoiceLanguage}
                                    onChange={(e) => handleFormChange('invoiceLanguage', e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="uz">Oʻzbekcha (uz)</option>
                                    <option value="ru">Русский (ru)</option>
                                    <option value="en">English (en)</option>
                                </select>
                            </div>

                            <div className="sm:col-span-6 flex items-center gap-3">
                                <input
                                    id="contactUseContactEmailSettings"
                                    type="checkbox"
                                    checked={formData.useContactEmailSettings}
                                    onChange={(e) => handleFormChange('useContactEmailSettings', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-[#028090] focus:ring-[#028090]"
                                />
                                <label htmlFor="contactUseContactEmailSettings" className="text-xs font-medium text-slate-700 cursor-pointer">
                                    Mijozga fakturalar va toʻlov bildirishnomalarini avtomatik email orqali yuborish
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* ── 5. Valyuta va Holat (Currency & Status) ─────────────── */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2.5 mb-5 flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-[#028090]" />
                            5. Hisob-kitob valyutasi va Holati
                        </h3>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Asosiy hisob-kitob valyutasi
                                </label>
                                <CurrencySelect
                                    value={formData.currencyCode}
                                    onChange={(code) => handleFormChange('currencyCode', code)}
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="contactStatus" className="block text-xs font-semibold text-slate-700 mb-1">
                                    Kontakt holati
                                </label>
                                <select
                                    id="contactStatus"
                                    value={formData.status}
                                    onChange={(e) => handleFormChange('status', e.target.value as ContactStatus)}
                                    className={selectClass}
                                >
                                    <option value="ACTIVE">Faol (Active)</option>
                                    <option value="HIDDEN">Yashirilgan / Nofaol (Hidden)</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* ── Bottom Form Action Bar ───────────────────────────────── */}
                    <div className="pt-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/contacts')}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#028090] to-[#02C39A] hover:brightness-105 transition shadow-sm cursor-pointer disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {isSubmitting ? 'Saqlanmoqda...' : isEditMode ? 'Oʻzgarishlarni saqlash' : 'Kontaktni saqlash'}
                        </button>
                    </div>

                </form>
            </div>

            {isFetching && <FullPageLoader />}
        </div>
    );
};

export default ContactForm;
