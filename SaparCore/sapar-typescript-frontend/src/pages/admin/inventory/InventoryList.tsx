import PaginationWrapper from "@components/admin/PaginationWrapper";
import Table from "@components/admin/Table";
import TableRow from "@components/admin/TableRow";
import Constants from "@constants/api";
import type { RootState } from "@store/index";
import axios from "axios";
import { CirclePlusIcon, HistoryIcon, MinusCircle, PlusCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { InventoryData } from "@models/inventory";
import { useCurrencyFormatter } from "@hooks/useCurrencyFormatter";
import { useCurrencies } from "@hooks/useCurrencies";
import { useTranslation } from "react-i18next";
import Modal from "@components/admin/Modal";
import NewInventoryModal from "./NewInventoryModal";
import PermissionGuard from "@components/admin/PermissionGuard";
import { hasPermission } from "@utils/hasPermission";
import LoaderSpinner from "@components/admin/LoaderSpinner";
import SubmitButton from "@components/admin/SubmitButton";
import ProfileCard from "@components/admin/ProfileImage";
import { PageHeader } from "@/context/PageHeaderContext";
import { Button } from "@components/ui";

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface InventoryFormData {
    productId: string;
    quantity: number;
    type: string;
    notes: string | null;
}

const initialFormData: InventoryFormData = { productId: '', quantity: 0, type: '', notes: null };
const InventoryList: React.FC = () => {
    const { t } = useTranslation();
    const { token } = useSelector((state: RootState) => state.auth);
    const { data: systemSettings } = useSelector((state: RootState) => state.systemSettings);
    const permissions = systemSettings?.permissions || [];
    const [inventories, setInventories] = useState<InventoryData[]>([]);
    const [stockUpdateType, setStockUpdateType] = useState<string>('');
    const [itemToUpdate, setItemToUpdate] = useState<InventoryData | null>(null);
    const [isStockUpdateModalOpen, setStockUpdateModalOpen] = useState<boolean>(false);
    const [formData, setFormData] = useState<InventoryFormData>(initialFormData);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [newInventoryModalOpen, setNewInventoryModalOpen] = useState<boolean>(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const search = searchParams.get('search') || '';
    const limit = Number(searchParams.get('limit') || 10);
    const page = Number(searchParams.get('page') || 1);
    const { locale } = useCurrencyFormatter();
    const { resolveCurrency } = useCurrencies();
    // Show each product's prices in ITS OWN currency (not the global default).
    const formatProductPrice = (amount: number, code?: string | null) =>
        `${resolveCurrency(code).symbol}${Number(amount).toLocaleString(locale, { maximumFractionDigits: 2 })}`;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const handleSearch = (value: string) => {
        setSearchParams({
            search: value,
            limit: String(limit),
            page: String(page)
        });
    }

    const handlePageLengthChange = (value: number) => {
        setSearchParams({
            search,
            limit: String(value),
            page: String(page)
        });
    }

    const fetchInventories = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(Constants.FETCH_INVENTORY_LIST_URL, {
                params: { search, limit, page },
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let data = response.data.data;
            if (data.length > 0) {
                setInventories(data);
            } else {
                setInventories([]);
            }

            if (response.data.pagination) {
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error("Error fetching inventories:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchInventories();
    }, [search, limit, page, token]);

    const handleView = (inventory: InventoryData) => {
        navigate(`/admin/inventory/view/${inventory.id}`);
    }
    const handleStockUpdate = (inventory: InventoryData, type: string) => {
        setFormData(initialFormData);
        setFormData(prev => ({ ...prev, type: type, productId: inventory.productId || '' }));
        setFormErrors({});
        setStockUpdateType(type);
        setItemToUpdate(inventory);
        setStockUpdateModalOpen(true);
    }

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (formData.quantity <= 0) newErrors.quantity = t('inventory.errorQtyPositive', 'Miqdor 0 dan katta boʻlishi kerak.');
        if (formData.quantity > 100000) newErrors.quantity = t('inventory.errorQtyMax', 'Miqdor 100 000 dan oshmasligi kerak.');
        // if remove type is selected don't allow quantity greater than itemToUpdate.quantity
        if (stockUpdateType === 'stock_out' && itemToUpdate?.quantity && formData.quantity > itemToUpdate.quantity) {
            newErrors.quantity = `${t('inventory.quantityLabel', 'Miqdori')} ombordagi qoldiqdan (${itemToUpdate.quantity}) oshib ketmasligi kerak.`;
        }
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }
    const handleStockUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormErrors({});
        if (!validateForm()) return;
        try {
            setIsSaving(true);
            await axios.post(Constants.UPDATE_INVENTORY_URL, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStockUpdateModalOpen(false);
            setItemToUpdate(null);
            setStockUpdateType('');
            fetchInventories();
        } catch (error) {
            console.error("Error updating inventory:", error);
        } finally {
            setIsSaving(false);
        }
    }

    const handleNewInventoryClick = () => {
        setNewInventoryModalOpen(true);
        setFormErrors({});
    }

    const handleNewInventorySuccess = () => {
        setNewInventoryModalOpen(false);
        fetchInventories();
    }
    const handlePageChange = (page: number) => {
        setSearchParams({
            search: search || '',
            limit: limit ? String(limit) : '10',
            page: String(page)
        });
    }

    // Calculate pagination display text
    const from = (pagination.page - 1) * pagination.limit + 1;
    const to = Math.min(pagination.page * pagination.limit, pagination.total);

    return (
        <div className="space-y-4">
            <PageHeader title={t('inventory.title', 'Ombor qoldiqlari')}>
                {hasPermission(permissions, 'inventory', 'create') && (
                    <Button
                        onClick={handleNewInventoryClick}
                        leftIcon={<CirclePlusIcon size={14} />}
                        className="shadow">
                        {t('inventory.newInventory', 'Yangi qoldiq kiritish')}
                    </Button>
                )}
            </PageHeader>

            {/* Search Input & PageLength */}
            <div className="flex justify-between items-center">
                <input
                    type="text"
                    placeholder={t('common.search', 'Qidirish...')}
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="border border-gray-300 rounded-md px-4 py-2 w-full md:w-64 text-gray-950 focus:outline-none focus:ring-2 focus:ring-[#028090] focus:border-transparent"
                />
                <select
                    value={limit}
                    onChange={(e) => handlePageLengthChange(Number(e.target.value))}
                    className="border border-gray-300 px-3 py-2 rounded-md bg-white text-gray-950 focus:outline-none focus:ring-2 focus:ring-[#028090] focus:border-transparent"
                >
                    {[10, 25, 50].map((num) => (
                        <option className="text-gray-950" key={num} value={num}>
                            {num} / {t('common.page', 'sahifa')}
                        </option>
                    ))}
                </select>
            </div>
            {/* Invoice Table */}
            <Table
                fitWidth
                headers={[
                    "#",
                    t('inventory.productService', 'Mahsulot / Xizmat'),
                    t('inventory.unit', 'Oʻlchov birligi'),
                    t('inventory.quantity', 'Qoldiq miqdori'),
                    t('inventory.sellingPrice', 'Sotish narxi'),
                    t('inventory.purchasePrice', 'Tannarx (Xarid)'),
                    t('inventory.stockActions', 'Ombor amallari')
                ]}
                colWidths={['w-12', 'min-w-[240px]', 'w-36', 'w-36', 'w-36', 'w-36', 'w-[230px]']}
            >
                {!isLoading && inventories && inventories.map((inventory, index) => (
                    <TableRow
                        key={inventory.id}
                        index={(page - 1) * limit + index + 1}
                        row={inventory}
                        columns={[
                            <ProfileCard
                                imageUrl={inventory.productDetails.product_image ?? ""}
                                name={inventory.productDetails.name ?? ""}
                                email={inventory.productDetails.code ?? ""}
                            />,
                            inventory?.productDetails?.unit_name,
                            inventory.quantity,
                            formatProductPrice(inventory.productDetails.selling_price, inventory.productDetails.currencyCode),
                            formatProductPrice(inventory.productDetails.purchase_price, inventory.productDetails.currencyCode),
                            <div className="flex items-center gap-1.5 whitespace-nowrap min-w-[210px]">
                                {/* History */}
                                <span
                                    onClick={(e) => { e.stopPropagation(); handleView(inventory); }}
                                    className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap rounded-md bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-200 transition cursor-pointer">
                                    <HistoryIcon className="h-3.5 w-3.5" />
                                    {t('inventory.history', 'Tarix')}
                                </span>

                                {/* Stock In */}
                                <PermissionGuard moduleSlug="inventory" action="edit">
                                    <span
                                        onClick={(e) => { e.stopPropagation(); handleStockUpdate(inventory, 'stock_in'); }}
                                        className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 transition cursor-pointer">
                                        <PlusCircleIcon className="h-3.5 w-3.5" />
                                        {t('inventory.stockIn', 'Kirim')}
                                    </span>
                                </PermissionGuard>

                                {/* Stock Out */}
                                <PermissionGuard moduleSlug="inventory" action="edit">
                                    <span
                                        onClick={(e) => { e.stopPropagation(); handleStockUpdate(inventory, 'stock_out'); }}
                                        className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200 transition cursor-pointer">
                                        <MinusCircle className="h-3.5 w-3.5" />
                                        {t('inventory.stockOut', 'Chiqim')}
                                    </span>
                                </PermissionGuard>
                            </div>

                        ]}
                        onRowClick={(item) => handleView(item)}
                    />
                ))}
                {
                    !isLoading && inventories.length === 0 && (
                        <tr key="no-quotations">
                            <td className="text-center py-6 text-gray-500 font-medium" colSpan={10}>
                                {t('inventory.noItemsFound', 'Omborda tovarlar topilmadi')}
                            </td>
                        </tr>
                    )
                }

                {
                    isLoading && (
                        <tr key="table-loader">
                            <td className="text-center py-6 text-gray-500 font-medium" colSpan={10}>
                                <LoaderSpinner />
                            </td>
                        </tr>
                    )
                }

            </Table >

            {/* Pagination Component */}
            < PaginationWrapper
                count={pagination.totalPages}
                page={page}
                from={from}
                to={to}
                total={pagination.total}
                onChange={(_, newPage) => handlePageChange(newPage)}
                paginationVariant="outlined"
                paginationShape="rounded"
            />

            {/* Stock Update Modal */}
            < Modal isOpen={isStockUpdateModalOpen}
                onClose={() => setStockUpdateModalOpen(false)}
                title={stockUpdateType === 'stock_in' ? t('inventory.addStockTitle', 'Omborga kirim qilish') : t('inventory.removeStockTitle', 'Ombordan chiqim qilish')}>
                <form onSubmit={handleStockUpdateSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1 text-sm">{t('inventory.productName', 'Mahsulot nomi')}</label>
                        <input
                            type="text"
                            value={itemToUpdate?.productDetails.name}
                            readOnly
                            className="border border-gray-300 bg-gray-100 mt-1 rounded-md px-4 py-2 w-full text-gray-950 focus:outline-none"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="mb-4 w-1/2">
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">{t('inventory.quantityLabel', 'Miqdori')}</label>
                            <input
                                type="number"
                                value={Number(formData.quantity) || 0}
                                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                className="border border-gray-300 mt-1 rounded-md px-4 py-2 w-full text-gray-950 focus:outline-none focus:ring-1 focus:ring-[#028090]"
                            />
                            {formErrors.quantity && <p className="text-red-500 text-xs mt-1">{formErrors.quantity}</p>}
                        </div>
                        <div className="mb-4 w-1/2">
                            <label className="block text-gray-700 font-semibold mb-1 text-sm">{t('inventory.unit', 'Oʻlchov birligi')} <em className="text-red-500">*</em></label>
                            <input
                                type="text"
                                value={itemToUpdate?.productDetails.unit_name}
                                readOnly
                                className="border border-gray-300 bg-gray-100 mt-1 rounded-md px-4 py-2 w-full text-gray-950 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1 text-sm">{t('inventory.notes', 'Izoh / Sabab')}</label>
                        <textarea
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="border border-gray-300 mt-1 rounded-md px-4 py-2 w-full text-gray-950 focus:outline-none focus:ring-1 focus:ring-[#028090]"
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="white"
                            onClick={() => setStockUpdateModalOpen(false)}
                        >
                            {t('common.cancel', 'Bekor qilish')}
                        </Button>
                        <SubmitButton isDisabled={isSaving} isLoading={isSaving}>
                            {stockUpdateType === 'stock_in' ? t('inventory.addStock', 'Kirimni saqlash') : t('inventory.removeStock', 'Chiqimni saqlash')}
                        </SubmitButton>
                    </div>
                </form>
            </Modal >

            {/* New Inventory Modal */}
            < NewInventoryModal
                isOpen={newInventoryModalOpen}
                onClose={() => setNewInventoryModalOpen(false)}
                onSuccess={handleNewInventorySuccess} />
        </div >
    );
};

export default InventoryList;