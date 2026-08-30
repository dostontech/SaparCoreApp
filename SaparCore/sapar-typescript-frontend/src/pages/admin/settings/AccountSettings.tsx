import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Constants from '../../../constants/api';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import axios from 'axios';
import SearchableDropdown from '@components/admin/SearchableDropdown';
import { User, MapPin, DatabaseIcon, Camera, CheckCircle2 } from 'lucide-react';
import SubmitButton from '@components/admin/SubmitButton';
import ExportButton from '@components/admin/ExportButton';
import DateInput from '@components/admin/DateInput';
import LoaderSpinner from '@components/admin/LoaderSpinner';
import { ymdStringToDate, dateToYmdString } from '@utils/converters';
import { PageHeader } from '@/context/PageHeaderContext';
import { Button, Card, FormField, Select } from '@components/ui';

interface LocationItem {
    id: string;
    name: string;
}

interface ApiProfile {
    profileImage?: string;
    profileImageUrl?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender: 'male' | 'female' | 'other' | '';
    dateOfBirth: string;
    address: string;
    country: number | string | null;
    state: number | string | null;
    city: number | string | null;
    postalCode: string;
}

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
    address?: string;
    country?: string;
    state?: string;
    city?: string;
    postalCode?: string;
}

interface Profile extends ApiProfile {
    profileImageFile?: File | null;
}

interface Option {
    id: string;
    name: string;
}

const UZBEKISTAN_REGIONS: Option[] = [
    { id: '1', name: 'Toshkent shahri' },
    { id: '2', name: 'Toshkent viloyati' },
    { id: '3', name: 'Samarqand viloyati' },
    { id: '4', name: 'Buxoro viloyati' },
    { id: '5', name: 'Fargʻona viloyati' },
    { id: '6', name: 'Andijon viloyati' },
    { id: '7', name: 'Namangan viloyati' },
    { id: '8', name: 'Qashqadaryo viloyati' },
    { id: '9', name: 'Surxondaryo viloyati' },
    { id: '10', name: 'Jizzax viloyati' },
    { id: '11', name: 'Sirdaryo viloyati' },
    { id: '12', name: 'Navoiy viloyati' },
    { id: '13', name: 'Xorazm viloyati' },
    { id: '14', name: 'Qoraqalpogʻiston Respublikasi' },
];

const DEFAULT_COUNTRIES: Option[] = [
    { id: '1', name: 'Oʻzbekiston (Uzbekistan)' },
    { id: '2', name: 'Qozogʻiston (Kazakhstan)' },
    { id: '3', name: 'Qirgʻiziston (Kyrgyzstan)' },
    { id: '4', name: 'Tojikiston (Tajikistan)' },
    { id: '5', name: 'Turkmaniston (Turkmenistan)' },
];

const AccountSettings: React.FC = () => {
    const { t } = useTranslation();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
    const [savingProfile, setSavingProfile] = useState<boolean>(false);
    const [profileImagePreview, setProfileImagePreview] = useState<string>('');
    const [countryOptions, setCountryOptions] = useState<Option[]>(DEFAULT_COUNTRIES);
    const [stateOptions, setStateOptions] = useState<Option[]>(UZBEKISTAN_REGIONS);
    const [cityOptions, setCityOptions] = useState<Option[]>([]);
    const [countrySearchInput, setCountrySearchInput] = useState<string>('');
    const [stateSearchInput, setStateSearchInput] = useState<string>('');
    const [citySearchInput, setCitySearchInput] = useState<string>('');
    const [loadingCountries, setLoadingCountries] = useState<boolean>(false);
    const [loadingStates, setLoadingStates] = useState<boolean>(false);
    const [loadingCities, setLoadingCities] = useState<boolean>(false);

    const { token, user } = useSelector((state: RootState) => state.auth);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const profileImageInputRef = useRef<HTMLInputElement>(null);

    const fetchCountries = useCallback(async (searchQuery: string = '') => {
        setLoadingCountries(true);
        try {
            const url = searchQuery
                ? `${Constants.FETCH_COUNTRIES_URL}?search=${encodeURIComponent(searchQuery)}`
                : Constants.FETCH_COUNTRIES_URL;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json() as LocationItem[];
                if (Array.isArray(data) && data.length > 0) {
                    setCountryOptions(data.map(item => ({ id: String(item.id), name: item.name })));
                    return;
                }
            }
            setCountryOptions(DEFAULT_COUNTRIES);
        } catch (error) {
            setCountryOptions(DEFAULT_COUNTRIES);
        } finally {
            setLoadingCountries(false);
        }
    }, [token]);

    const fetchStates = useCallback(async (searchQuery: string = '') => {
        setLoadingStates(true);
        try {
            if (profile?.country) {
                const baseUrl = `${Constants.FETCH_STATES_URL}/${profile.country}`;
                const url = searchQuery
                    ? `${baseUrl}?search=${encodeURIComponent(searchQuery)}`
                    : baseUrl;

                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json() as LocationItem[];
                    if (Array.isArray(data) && data.length > 0) {
                        setStateOptions(data.map(item => ({ id: String(item.id), name: item.name })));
                        return;
                    }
                }
            }
            setStateOptions(UZBEKISTAN_REGIONS);
        } catch (error) {
            setStateOptions(UZBEKISTAN_REGIONS);
        } finally {
            setLoadingStates(false);
        }
    }, [profile?.country, token]);

    const fetchCities = useCallback(async (searchQuery: string = '') => {
        if (!profile?.state) {
            setCityOptions([]);
            return;
        }

        setLoadingCities(true);
        try {
            const baseUrl = `${Constants.FETCH_CITIES_URL}/${profile.state}`;
            const url = searchQuery
                ? `${baseUrl}?search=${encodeURIComponent(searchQuery)}`
                : baseUrl;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json() as LocationItem[];
                if (Array.isArray(data) && data.length > 0) {
                    setCityOptions(data.map(item => ({ id: String(item.id), name: item.name })));
                    return;
                }
            }
            setCityOptions([]);
        } catch (error) {
            setCityOptions([]);
        } finally {
            setLoadingCities(false);
        }
    }, [profile?.state, token]);

    useEffect(() => {
        fetchCountries();
    }, [fetchCountries]);

    useEffect(() => {
        if (profile?.country) {
            fetchStates();
        }
    }, [profile?.country, fetchStates]);

    useEffect(() => {
        if (profile?.state) {
            fetchCities();
        }
    }, [profile?.state, fetchCities]);

    const fetchProfile = useCallback(async () => {
        setLoadingProfile(true);
        try {
            const response = await fetch(Constants.FETCH_PROFILE_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data: ApiProfile = await response.json();

            setProfile({
                ...data,
                country: data.country || '1',
                gender: (data.gender?.toLowerCase() as 'male' | 'female' | 'other') || '',
                dateOfBirth: data.dateOfBirth ? dateToYmdString(new Date(data.dateOfBirth)) : '',
            });

            if (data.profileImage) {
                setProfileImagePreview(data.profileImage);
            }
        } catch (error) {
            toast.error(t('common.error', "Profil maʼlumotlarini yuklashda xatolik yuz berdi."));
        } finally {
            setLoadingProfile(false);
        }
    }, [token, t]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => prev ? { ...prev, [name]: value } : null);
        if (formErrors[name as keyof FormErrors]) {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfile(prev => prev ? { ...prev, profileImageFile: file } : null);
            setProfileImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCountryChange = (selectedOption: Option | null) => {
        const newCountryId = selectedOption ? selectedOption.id : null;
        setProfile(prev => prev ? {
            ...prev,
            country: newCountryId,
            state: null,
            city: null
        } : null);

        if (formErrors.country) {
            setFormErrors(prev => ({ ...prev, country: undefined }));
        }
        setStateOptions(UZBEKISTAN_REGIONS);
        setCityOptions([]);
        setStateSearchInput('');
        setCitySearchInput('');
    };

    const handleStateChange = (selectedOption: Option | null) => {
        const newStateId = selectedOption ? selectedOption.id : null;
        setProfile(prev => prev ? {
            ...prev,
            state: newStateId,
            city: null
        } : null);

        if (formErrors.state) {
            setFormErrors(prev => ({ ...prev, state: undefined }));
        }
        setCityOptions([]);
        setCitySearchInput('');
    };

    const handleCityChange = (selectedOption: Option | null) => {
        const newCityId = selectedOption ? selectedOption.id : null;
        setProfile(prev => prev ? { ...prev, city: newCityId } : null);
        if (formErrors.city) {
            setFormErrors(prev => ({ ...prev, city: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!profile) return;

        setSavingProfile(true);

        try {
            const formData = new FormData();

            Object.keys(profile).forEach(key => {
                const formKey = key as keyof Profile;
                const value = profile[formKey];

                if (
                    formKey !== 'profileImage' &&
                    formKey !== 'profileImageFile' &&
                    formKey !== 'profileImageUrl'
                ) {
                    formData.append(formKey, value !== undefined && value !== null ? String(value) : '');
                }
            });

            if (profile.profileImageFile) {
                formData.append('profileImage', profile.profileImageFile);
            }
            await axios.put(Constants.UPDATE_PROFILE_URL, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSavingProfile(false);
            setFormErrors({});
            toast.success(t('common.savedSuccess', "Profil maʼlumotlari muvaffaqiyatli saqlandi."));
        } catch (error) {
            const AxiosError = error as AxiosError<{ errors: FormErrors }>;
            if (AxiosError?.response?.data?.errors) setFormErrors(AxiosError.response.data.errors);
            setSavingProfile(false);
            toast.error(t('common.error', "Saqlashda xatolik yuz berdi."));
        }
    };

    const sectionHeaderClass = "flex items-center gap-2 px-5 py-4 border-b border-border text-base font-bold text-heading";

    if (loadingProfile) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoaderSpinner size={32} />
                <p className="ml-3 text-body text-sm font-medium">{t('common.loading', 'Yuklanmoqda...')}</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
            <PageHeader title={t('nav.accountSettings', 'Profil va Hisob Sozlamalari')}>
                <SubmitButton
                    form="account-settings-form"
                    isDisabled={savingProfile}
                    isLoading={savingProfile}
                    mode="edit"
                />
            </PageHeader>

            <form id="account-settings-form" onSubmit={handleSubmit} className="space-y-6">
                {/* 1. GENERAL INFORMATION */}
                <Card
                    padded={false}
                    header={
                        <div className={sectionHeaderClass}>
                            <User className="w-5 h-5 text-teal-600" />
                            <span>{t('settings.generalInfo', 'Asosiy Shaxsiy Maʼlumotlar')}</span>
                        </div>
                    }
                >
                    <div className="p-5">
                        <div className="flex flex-col sm:flex-row items-center mb-8 gap-6">
                            <div className="relative group">
                                <img
                                    src={profileImagePreview || "https://placehold.co/120x120/028090/FFFFFF?text=SAPAR"}
                                    alt="Profile"
                                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-teal-500/20 shadow-sm"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = "https://placehold.co/120x120/028090/FFFFFF?text=SAPAR";
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => profileImageInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"
                                >
                                    <Camera className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex flex-col items-center sm:items-start">
                                <input
                                    ref={profileImageInputRef}
                                    type="file"
                                    id="profileImage"
                                    name="profileImage"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={() => profileImageInputRef.current?.click()}
                                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
                                >
                                    {t('settings.uploadPhoto', 'Yangi Rasm Yuklash')}
                                </Button>
                                <p className="text-xs text-body mt-2 text-center sm:text-left text-slate-500">
                                    Tavsiya: 150×150px. JPG, PNG yoki WebP formatida.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            <FormField
                                label={t('common.firstName', 'Ism')}
                                required
                                id="firstName"
                                name="firstName"
                                type="text"
                                value={profile?.firstName || ''}
                                onChange={handleChange}
                                error={formErrors.firstName}
                            />
                            <FormField
                                label={t('common.lastName', 'Familiya')}
                                id="lastName"
                                name="lastName"
                                type="text"
                                value={profile?.lastName || ''}
                                onChange={handleChange}
                                error={formErrors.lastName}
                            />
                            <FormField
                                label={t('common.email', 'Elektron Pochta')}
                                required
                                id="email"
                                name="email"
                                type="email"
                                value={profile?.email || ''}
                                onChange={handleChange}
                                error={formErrors.email}
                            />
                            <FormField
                                label={t('common.phone', 'Telefon Raqami')}
                                required
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="+998 90 123 45 67"
                                value={profile?.phone || ''}
                                onChange={handleChange}
                                error={formErrors.phone}
                            />
                            <Select
                                label={t('common.gender', 'Jinsi')}
                                id="gender"
                                name="gender"
                                value={profile?.gender || ''}
                                onChange={handleChange}
                                error={formErrors.gender}
                                options={[
                                    { value: '', label: t('common.select', 'Tanlang') },
                                    { value: 'male', label: 'Erkak' },
                                    { value: 'female', label: 'Ayol' },
                                ]}
                            />
                            <div>
                                <DateInput
                                    label={t('common.dateOfBirth', 'Tugʻilgan Sana')}
                                    value={ymdStringToDate(profile?.dateOfBirth)}
                                    onChange={(date) =>
                                        setProfile((prev) => (prev ? { ...prev, dateOfBirth: dateToYmdString(date) } : null))
                                    }
                                />
                                {formErrors.dateOfBirth && <p className="mt-1 text-xs text-danger">{formErrors.dateOfBirth}</p>}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 2. ADDRESS INFORMATION */}
                <Card
                    padded={false}
                    header={
                        <div className={sectionHeaderClass}>
                            <MapPin className="w-5 h-5 text-teal-600" />
                            <span>{t('settings.addressInfo', 'Manzil va Hudud Rekvizitlari')}</span>
                        </div>
                    }
                >
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                            label={t('common.address', 'Koʻcha, Uy / Ofis Manzili')}
                            required
                            id="address"
                            name="address"
                            type="text"
                            placeholder="Masalan: Amir Temur koʻchasi, 12-uy"
                            value={profile?.address || ''}
                            onChange={handleChange}
                            error={formErrors.address}
                            containerClassName="md:col-span-2"
                        />

                        <FormField label={t('common.country', 'Davlat')} required error={formErrors.country}>
                            {(field) => (
                                <SearchableDropdown
                                    id={field.id}
                                    aria-invalid={field['aria-invalid']}
                                    aria-describedby={field['aria-describedby']}
                                    options={countryOptions}
                                    placeholder={loadingCountries ? 'Yuklanmoqda...' : 'Davlatni tanlang'}
                                    value={countryOptions.find(option => option.id === String(profile?.country)) || countryOptions[0]}
                                    inputValue={countrySearchInput}
                                    onInputChange={(_, value) => setCountrySearchInput(value)}
                                    onChange={(_, value) => handleCountryChange(value)}
                                    disabled={loadingCountries}
                                    loading={loadingCountries}
                                />
                            )}
                        </FormField>

                        <FormField label={t('common.state', 'Viloyat / Shahar (Hudud)')} required error={formErrors.state}>
                            {(field) => (
                                <SearchableDropdown
                                    id={field.id}
                                    aria-invalid={field['aria-invalid']}
                                    aria-describedby={field['aria-describedby']}
                                    options={stateOptions}
                                    placeholder={loadingStates ? 'Yuklanmoqda...' : 'Viloyat yoki shaharni tanlang'}
                                    value={stateOptions.find(option => option.id === String(profile?.state) || option.name === String(profile?.state)) || null}
                                    inputValue={stateSearchInput}
                                    onInputChange={(_, value) => setStateSearchInput(value)}
                                    onChange={(_, value) => handleStateChange(value)}
                                    disabled={loadingStates}
                                    loading={loadingStates}
                                />
                            )}
                        </FormField>

                        <FormField
                            label={t('common.city', 'Shahar / Tuman')}
                            id="city"
                            name="city"
                            type="text"
                            placeholder="Masalan: Yunusobod tumani"
                            value={typeof profile?.city === 'string' ? profile.city : ''}
                            onChange={handleChange}
                            error={formErrors.city}
                        />

                        <FormField
                            label={t('common.pincode', 'Pochta Indeksi (Pincode)')}
                            required
                            id="postalCode"
                            name="postalCode"
                            type="text"
                            placeholder="Masalan: 100000"
                            value={profile?.postalCode || ''}
                            onChange={handleChange}
                            error={formErrors.postalCode}
                        />
                    </div>
                </Card>

                {/* 3. DATA & BACKUP */}
                {user?.user_type === 1 && (
                    <Card
                        padded={false}
                        header={
                            <div className={sectionHeaderClass}>
                                <DatabaseIcon className="w-5 h-5 text-teal-600" />
                                <span>{t('settings.backupTitle', 'Maʼlumotlar Zaxira Nusxasi (Backup)')}</span>
                            </div>
                        }
                    >
                        <div className="p-5 space-y-3">
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Korxonangizning barcha buxgalteriya provodkalari, ombor qoldiqlari, hisob-fakturalar va mijozlar bazasini toʻliq ZIP arxiv holatida yuklab olish.
                            </p>
                            <ExportButton
                                url={Constants.EXPORT_BACKUP_URL}
                                filename="sapar-backup.zip"
                                label="Toʻliq zaxira nusxasini yuklab olish (.zip)"
                                variant="primary"
                            />
                        </div>
                    </Card>
                )}
            </form>
        </div>
    );
};

export default AccountSettings;