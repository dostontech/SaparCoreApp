import { useEffect, useState } from "react";
import Modal from "@components/admin/Modal";
import axios, { AxiosError } from "axios";
import Constants from "@constants/api";
import type { RootState } from "@store/index";
import { useSelector } from "react-redux";
import SubmitButton from "@components/admin/SubmitButton";
import { toast } from "sonner";
import DynamicCustomFields from "@components/admin/DynamicCustomFields";
import { Scale, Sparkles, CheckCircle2 } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface UnitFormData {
    unit_name: string;
    short_name: string;
    package_code: string;
    allow_decimal: boolean;
    status: boolean;
}

const UZ_UNIT_PRESETS = [
    { name: 'Dona', short: 'dona', code: '796', decimal: false },
    { name: 'Kilogramm', short: 'kg', code: '166', decimal: true },
    { name: 'Metr', short: 'm', code: '006', decimal: true },
    { name: 'Litr', short: 'l', code: '112', decimal: true },
    { name: 'Qop', short: 'qop', code: '796', decimal: false },
    { name: 'Kvadrat metr', short: 'm²', code: '055', decimal: true },
    { name: 'Kubometr', short: 'm³', code: '113', decimal: true },
    { name: 'Tonna', short: 't', code: '163', decimal: true },
    { name: 'Pachka', short: 'pck', code: '778', decimal: false },
];

const CreateUnitModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
    const setInitialFormData = (): UnitFormData => ({
        unit_name: "",
        short_name: "",
        package_code: "796",
        allow_decimal: false,
        status: true
    });
    const { token } = useSelector((state: RootState) => state.auth);
    const [formData, setFormData] = useState<UnitFormData>(setInitialFormData());
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customFields, setCustomFields] = useState<Record<string, any>>({});
    const [activeCustomFields, setActiveCustomFields] = useState<any[]>([]);

    const handleCustomFieldChange = (fieldSlugOrId: string, value: any) => {
        setCustomFields(prev => ({ ...prev, [fieldSlugOrId]: value }));
    };

    // Reset form whenever modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData(setInitialFormData());
            setFormErrors({});
            setCustomFields({});
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleApplyPreset = (preset: typeof UZ_UNIT_PRESETS[0]) => {
        setFormData(prev => ({
            ...prev,
            unit_name: preset.name,
            short_name: preset.short,
            package_code: preset.code,
            allow_decimal: preset.decimal,
        }));
        setFormErrors({});
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.unit_name.trim()) {
            newErrors.unit_name = "Oʻlchov birligi nomi kiritilishi shart.";
        } else if (formData.unit_name.length < 2 || formData.unit_name.length > 50) {
            newErrors.unit_name = "Nom 2 dan 50 belgigacha boʻlishi kerak.";
        }

        if (!formData.short_name.trim()) {
            newErrors.short_name = "Qisqartma (belgi) kiritilishi shart.";
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;

        const data = new FormData();
        data.append('unit_name', formData.unit_name);
        data.append('short_name', formData.short_name);
        data.append('package_code', formData.package_code || '796');
        data.append('allow_decimal', String(formData.allow_decimal));
        data.append('status', String(formData.status));

        // Append custom fields (slug→id resolved from loaded definitions)
        Object.entries(customFields)
            .filter(([, val]) => {
                if (val === undefined || val === null) return false;
                if (typeof val === 'string' && val.trim() === '') return false;
                if (Array.isArray(val) && val.length === 0) return false;
                return true;
            })
            .forEach(([fieldSlugOrId, val], index) => {
                const matchedField = activeCustomFields.find(f => f.fieldSlug === fieldSlugOrId || f.id === fieldSlugOrId);
                const finalFieldId = matchedField ? matchedField.id : fieldSlugOrId;
                data.append(`customFields[${index}][fieldId]`, finalFieldId);
                if (Array.isArray(val)) {
                    data.append(`customFields[${index}][value]`, val.join(','));
                } else if (val instanceof Date) {
                    const year = val.getFullYear();
                    const month = String(val.getMonth() + 1).padStart(2, '0');
                    const day = String(val.getDate()).padStart(2, '0');
                    data.append(`customFields[${index}][value]`, `${year}-${month}-${day}`);
                } else if (val instanceof File) {
                    data.append(`customField_${finalFieldId}`, val);
                } else {
                    data.append(`customFields[${index}][value]`, String(val));
                }
            });

        try {
            setIsSubmitting(true);
            await axios.post(Constants.CREATE_UNIT_URL, data, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Oʻlchov birligi muvaffaqiyatli yaratildi!');
            onSuccess();
        } catch (error: any | AxiosError) {
            setFormErrors(error?.response?.data?.errors || {});
            toast.error(error?.response?.data?.message || 'Xatolik yuz berdi. Iltimos qaytadan urinib koʻring.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Yangi Oʻlchov Birligi (Bukku & Soliq Standarti)">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                {/* Standard presets */}
                <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-200/80 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-[#028090]" />
                        <span>Oʻzbekiston Standart Oʻlchov Birliklari (Tezkor tanlov)</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {UZ_UNIT_PRESETS.map((p) => {
                            const isSelected = formData.short_name === p.short;
                            return (
                                <button
                                    key={p.short}
                                    type="button"
                                    onClick={() => handleApplyPreset(p)}
                                    className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                                        isSelected
                                            ? 'bg-[#028090] text-white border-[#028090] shadow-2xs'
                                            : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                                    }`}
                                >
                                    <span>{p.name}</span>
                                    <span className={`text-[10px] ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                                        ({p.short})
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Unit Name & Short Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="unit_name" className="block text-xs font-bold text-slate-700 mb-1">
                            Birlik Nomi <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="unit_name"
                            name="unit_name"
                            type="text"
                            maxLength={50}
                            value={formData.unit_name || ""}
                            onChange={handleChange}
                            placeholder="Masalan: Kilogramm"
                            className="w-full bg-slate-50 text-slate-900 px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#028090] focus:outline-none"
                        />
                        {formErrors.unit_name && <p className="text-red-500 text-[11px] mt-1">{formErrors.unit_name}</p>}
                    </div>

                    <div>
                        <label htmlFor="short_name" className="block text-xs font-bold text-slate-700 mb-1">
                            Qisqa belgisi <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="short_name"
                            name="short_name"
                            type="text"
                            maxLength={15}
                            value={formData.short_name || ""}
                            onChange={handleChange}
                            placeholder="kg, dona, m"
                            className="w-full bg-slate-50 text-slate-900 px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#028090] focus:outline-none"
                        />
                        {formErrors.short_name && <p className="text-red-500 text-[11px] mt-1">{formErrors.short_name}</p>}
                    </div>
                </div>

                {/* Soliq Package Code & Allow Decimals */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="package_code" className="block text-xs font-bold text-slate-700 mb-1">
                            Soliq Qadoq Kodi (Package Code)
                        </label>
                        <input
                            id="package_code"
                            name="package_code"
                            type="text"
                            maxLength={10}
                            value={formData.package_code}
                            onChange={handleChange}
                            placeholder="796 (dona), 166 (kg)"
                            className="w-full bg-slate-50 text-slate-900 px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#028090] focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400">Didox / E-Faktura uchun rasmiy kod</span>
                    </div>

                    <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                name="allow_decimal"
                                checked={formData.allow_decimal}
                                onChange={handleChange}
                                className="w-4 h-4 rounded text-[#028090] focus:ring-[#028090] border-slate-300"
                            />
                            <span className="font-bold text-slate-700 text-xs">
                                Kasrli miqdorga ruxsat (0.5 kg, 1.25 m)
                            </span>
                        </label>
                    </div>
                </div>

                {/* Custom Fields */}
                <DynamicCustomFields
                    moduleSlug="units"
                    values={customFields}
                    onChange={handleCustomFieldChange}
                    onFieldsLoaded={setActiveCustomFields}
                />

                {/* Form Buttons */}
                <div className="flex justify-end pt-2 space-x-2 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 text-slate-700 cursor-pointer"
                    >
                        Bekor Qilish
                    </button>
                    <SubmitButton isDisabled={isSubmitting} isLoading={isSubmitting} mode={"create"} />
                </div>
            </form>
        </Modal>
    );
}

export default CreateUnitModal;
