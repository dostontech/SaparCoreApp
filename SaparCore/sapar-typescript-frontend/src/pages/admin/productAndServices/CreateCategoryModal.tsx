import { useEffect, useState } from "react";
import Modal from "@components/admin/Modal";
import axios, { AxiosError } from "axios";
import Constants from "@constants/api";
import type { RootState } from "@store/index";
import { useSelector } from "react-redux";
import SubmitButton from "@components/admin/SubmitButton";
import { toast } from "sonner";
import DynamicCustomFields from "@components/admin/DynamicCustomFields";
import ImageCropperUpload from "@components/common/ImageCropperUpload";
import {
    Package,
    ShoppingBag,
    Wrench,
    Sparkles,
    Building2,
    Layers,
    Utensils,
    Zap,
    Shirt,
    Coffee,
    Tag,
    Palette,
} from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface CategoryFormData {
    id: string;
    category_name: string;
    slug: string;
    status: boolean;
    category_image: File | null;
    categoryImageUrl: string;
    color: string;
    icon: string;
    parentId?: string;
}

const COLOR_PRESETS = [
    { name: 'Teal', hex: '#028090', bg: 'bg-[#028090]' },
    { name: 'Mint', hex: '#02C39A', bg: 'bg-[#02C39A]' },
    { name: 'Navy', hex: '#0B2B33', bg: 'bg-[#0B2B33]' },
    { name: 'Amber', hex: '#F59E0B', bg: 'bg-amber-500' },
    { name: 'Blue', hex: '#3B82F6', bg: 'bg-blue-500' },
    { name: 'Purple', hex: '#8B5CF6', bg: 'bg-purple-500' },
    { name: 'Emerald', hex: '#10B981', bg: 'bg-emerald-500' },
    { name: 'Rose', hex: '#F43F5E', bg: 'bg-rose-500' },
];

const ICON_PRESETS = [
    { id: 'package', label: 'Mahsulot', icon: Package },
    { id: 'bag', label: 'Sumka', icon: ShoppingBag },
    { id: 'tool', label: 'Asbob', icon: Wrench },
    { id: 'sparkles', label: 'Maxsus', icon: Sparkles },
    { id: 'building', label: 'Qurilish', icon: Building2 },
    { id: 'layers', label: 'Xom-ashyo', icon: Layers },
    { id: 'food', label: 'Oziq-ovqat', icon: Utensils },
    { id: 'tech', label: 'Elektr', icon: Zap },
    { id: 'clothes', label: 'Kiyim', icon: Shirt },
    { id: 'cafe', label: 'Kafe', icon: Coffee },
    { id: 'tag', label: 'Aksiya', icon: Tag },
];

const CreateCategoryModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
    const setInitialFormData = (): CategoryFormData => ({
        id: '',
        category_name: '',
        slug: '',
        status: true,
        category_image: null,
        categoryImageUrl: '',
        color: '#028090',
        icon: 'package',
        parentId: '',
    });
    const { token } = useSelector((state: RootState) => state.auth);
    const [formData, setFormData] = useState<CategoryFormData>(setInitialFormData());
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: value,
            };

            if (name === "category_name") {
                updated.slug = value.trim().replace(/\s+/g, "-").toLowerCase();
            }

            return updated;
        });
    };

    const handleCroppedCategoryImage = (file: File) => {
        setFormData(prev => ({
            ...prev,
            category_image: file,
            categoryImageUrl: URL.createObjectURL(file),
        }));
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.category_name.trim()) {
            newErrors.category_name = 'Kategoriya nomi kiritilishi shart.';
        } else if (formData.category_name.length < 2) {
            newErrors.category_name = 'Nom kamida 2 ta belgidan iborat boʻlishi kerak.';
        }
        if (!formData.slug.trim()) {
            newErrors.slug = 'Slug talab qilinadi.';
        }
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;

        const data = new FormData();
        data.append('category_name', formData.category_name);
        data.append('slug', formData.slug);
        data.append('status', String(formData.status || false));
        data.append('color', formData.color || '#028090');
        data.append('icon', formData.icon || 'package');
        if (formData.parentId) {
            data.append('parentId', formData.parentId);
        }

        if (formData.category_image instanceof File) {
            data.append('category_image', formData.category_image);
        }

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
            await axios.post(Constants.CREATE_CATEGORY_URL, data, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Kategoriya muvaffaqiyatli yaratildi!');
            onSuccess();
        } catch (error: any | AxiosError) {
            setFormErrors(error?.response?.data?.errors || {});
            toast.error(error?.response?.data?.message || 'Xatolik yuz berdi. Iltimos qaytadan urinib koʻring.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Yangi Kategoriya Yaratish (iBox / Bukku)">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                {/* Image Upload Section */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Rasm / Logo</label>
                    <ImageCropperUpload
                        value={formData.categoryImageUrl || undefined}
                        aspect={1}
                        label="Kategoriya rasmini yuklash"
                        onCropped={handleCroppedCategoryImage}
                    />
                    {formErrors.category_image && <p className="text-red-500 text-[11px] mt-1">{formErrors.category_image}</p>}
                </div>

                {/* Name & Slug Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="category_name" className="block text-xs font-bold text-slate-700 mb-1">
                            Kategoriya Nomi <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="category_name"
                            name="category_name"
                            type="text"
                            maxLength={100}
                            value={formData.category_name || ""}
                            onChange={handleChange}
                            placeholder="Masalan: Qurilish Materiallari"
                            className="w-full bg-slate-50 text-slate-900 px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#028090] focus:outline-none"
                        />
                        {formErrors.category_name && <p className="text-red-500 text-[11px] mt-1">{formErrors.category_name}</p>}
                    </div>

                    <div>
                        <label htmlFor="slug" className="block text-xs font-bold text-slate-700 mb-1">
                            Slug (Identifikator) <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="slug"
                            type="text"
                            name="slug"
                            maxLength={100}
                            value={formData.slug || ""}
                            onChange={handleChange}
                            placeholder="qurilish-materiallari"
                            className="w-full bg-slate-50 text-slate-900 px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#028090] focus:outline-none"
                        />
                        {formErrors.slug && <p className="text-red-500 text-[11px] mt-1">{formErrors.slug}</p>}
                    </div>
                </div>

                {/* POS Touch Grid: Color & Icon Picker (iBox Style) */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                            <Palette className="w-3.5 h-3.5 text-[#028090]" />
                            <span>POS Sensorli Plitka Sozlamalari (iBox Standarti)</span>
                        </span>
                        <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-2xs"
                            style={{ backgroundColor: formData.color }}
                        >
                            {(() => {
                                const SelectedIcon = ICON_PRESETS.find(i => i.id === formData.icon)?.icon || Package;
                                return <SelectedIcon className="w-3.5 h-3.5" />;
                            })()}
                        </div>
                    </div>

                    {/* Color palette */}
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Plitka Rangi:</label>
                        <div className="flex items-center gap-2 flex-wrap">
                            {COLOR_PRESETS.map(c => (
                                <button
                                    key={c.hex}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, color: c.hex }))}
                                    className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${
                                        formData.color === c.hex ? 'border-slate-900 scale-110 shadow-xs' : 'border-white'
                                    }`}
                                    style={{ backgroundColor: c.hex }}
                                    title={c.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Icon selector */}
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Piktogramma (Ikonka):</label>
                        <div className="grid grid-cols-6 gap-1.5">
                            {ICON_PRESETS.map(item => {
                                const IconComponent = item.icon;
                                const isSelected = formData.icon === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, icon: item.id }))}
                                        className={`p-1.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                                            isSelected
                                                ? 'bg-[#028090] text-white border-[#028090] shadow-xs'
                                                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                                        }`}
                                        title={item.label}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                        <span className="text-[9px] truncate max-w-full">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Custom Fields */}
                <DynamicCustomFields
                    moduleSlug="categories"
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

export default CreateCategoryModal;
