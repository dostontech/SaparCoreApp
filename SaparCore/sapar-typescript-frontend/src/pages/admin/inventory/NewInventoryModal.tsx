import Modal from "@components/admin/Modal";
import SearchableDropdown from "@components/admin/SearchableDropdown";
import SubmitButton from "@components/admin/SubmitButton";
import Constants from "@constants/api";
import { useDebounce } from "@hooks/useDebounce";
import type { RootState } from "@store/index";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface InventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void
}

interface Options {
    id: string;
    name: string;
    code: string;
    unit: { id: string; name: string; } | null;
    prices: { selling: number; purchase: number; };
}

interface InventoryFormData {
    productId: string;
    quantity: number;
    type: string;
    notes: string | null;
}

const initialFormData: InventoryFormData = { productId: '', quantity: 0, type: '', notes: null };
const NewInventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { token } = useSelector((state: RootState) => state.auth);
    const [products, setProducts] = useState<Options[]>([]);
    const [productSearchInput, setProductSearchInput] = useState<string>("");
    const [selectedProduct, setSelectedProduct] = useState<Options | null>(null);
    const [formData, setFormData] = useState<InventoryFormData>(initialFormData);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const debouncedSearchTerm = useDebounce(productSearchInput, 500);
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        setSelectedProduct(null);
        setProductSearchInput('');
        setFormErrors({});
        setFormData(initialFormData);
    }, [isOpen]);

    useEffect(() => {
        const fetchProductsByQuery = async () => {
            try {
                const response = await axios.get(`${Constants.FETCH_PRODUCTS_WITH_SEARCH_URL}?search=${debouncedSearchTerm}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setProducts(response.data.data);
            } catch (error) {
                console.error('Error fetching products:', error);
                setProducts([]);
            }
        }

        fetchProductsByQuery();
    }, [debouncedSearchTerm]);

    const { t } = useTranslation();

    const validateForm = () => {
        const errors: { [key: string]: string } = {};
        if (!selectedProduct) {
            errors.product = t('inventory.errorProductRequired', 'Mahsulot tanlanishi shart');
        }
        if (formData.quantity <= 0) {
            errors.quantity = t('inventory.errorQtyPositive', 'Miqdor 0 dan katta boʻlishi kerak');
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            setIsSubmitting(true);
            const payload = {
                ...formData,
                productId: selectedProduct?.id || '',
                type: 'stock_in',
            };
            await axios.post(Constants.UPDATE_INVENTORY_URL, payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Tovar qoldigʻi muvaffaqiyatli saqlandi');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating inventory:', error);
        } finally {
            setIsSubmitting(false);
        }
    }
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('inventory.newInventoryModalTitle', 'Yangi tovar qoldigʻini kiritish')}>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="product" className="block text-gray-700 font-semibold mb-1 text-sm">{t('inventory.productService', 'Mahsulot / Xizmat')} <em className="text-red-500">*</em></label>
                    <SearchableDropdown
                        options={products}
                        placeholder={t('inventory.searchProductPlaceholder', 'Mahsulot nomini yozing...')}
                        onInputChange={(_, value) => setProductSearchInput(value)}
                        onChange={(_, value) => setSelectedProduct(value as Options)}
                        value={selectedProduct}
                    />
                    {formErrors.product && <p className="text-red-500 text-xs mt-1">{formErrors.product}</p>}
                </div>
                <div className="flex gap-4">
                    <div className="mb-4 w-1/2">
                        <label className="block text-gray-700 font-semibold mb-1 text-sm">{t('inventory.skuCode', 'Artikul / Kod')}</label>
                        <input
                            type="text"
                            value={selectedProduct?.code || ''}
                            readOnly
                            className="border border-gray-300 bg-gray-100 mt-1 rounded-md px-4 py-2 w-full text-gray-950 focus:outline-none"
                        />
                    </div>
                    <div className="mb-4 w-1/2">
                        <label className="block text-gray-700 font-semibold mb-1 text-sm">{t('inventory.unit', 'Oʻlchov birligi')}</label>
                        <input
                            type="text"
                            value={selectedProduct?.unit?.name || ''}
                            readOnly
                            className="border border-gray-300 bg-gray-100 mt-1 rounded-md px-4 py-2 w-full text-gray-950 focus:outline-none"
                        />
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="mb-4 w-1/2">
                        <label className="block text-gray-700 font-semibold mb-1 text-sm">{t('inventory.purchasePrice', 'Xarid narxi')}</label>
                        <input
                            type="text"
                            value={selectedProduct?.prices?.purchase || ''}
                            readOnly
                            className="border border-gray-300 bg-gray-100 mt-1 rounded-md px-4 py-2 w-full text-gray-950 focus:outline-none"
                        />
                    </div>
                    <div className="mb-4 w-1/2">
                        <label className="block text-gray-700 font-semibold mb-1 text-sm">{t('inventory.sellingPrice', 'Sotish narxi')}</label>
                        <input
                            type="text"
                            value={selectedProduct?.prices?.selling || ''}
                            readOnly
                            className="border border-gray-300 bg-gray-100 mt-1 rounded-md px-4 py-2 w-full text-gray-950 focus:outline-none"
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="type" className="block text-gray-700 font-semibold mb-1 text-sm">{t('inventory.type', 'Operatsiya turi')} <em className="text-red-500">*</em></label>
                    <input
                        type="text"
                        value={t('inventory.stockIn', 'Omborga kirim')}
                        readOnly
                        className="border border-gray-300 bg-gray-100 mt-1 rounded-md px-4 py-2 w-full text-gray-950 focus:outline-none"
                    />
                    {formErrors.type && <span className="text-red-500 text-xs">{formErrors.type}</span>}
                </div>
                <div className="mb-4">
                    <label htmlFor="quantity" className="block text-gray-700 font-semibold mb-1 text-sm">{t('inventory.quantityLabel', 'Miqdori')} <em className="text-red-500">*</em></label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                        className="border border-gray-300 mt-1 rounded-md px-4 py-2 w-full text-gray-950 focus:outline-none focus:ring-1 focus:ring-[#028090]"
                    />
                    {formErrors.quantity && <span className="text-red-500 text-xs">{formErrors.quantity}</span>}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm cursor-pointer"
                    >
                        {t('common.cancel', 'Bekor qilish')}
                    </button>
                    <SubmitButton isDisabled={isSubmitting} isLoading={isSubmitting} mode="create" />
                </div>
            </form>
        </Modal>
    );
}

export default NewInventoryModal;