import React, { type FC, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { Edit, Trash2Icon, CirclePlusIcon, EyeIcon, RotateCcw, Scale } from "lucide-react";
import Modal from "@components/admin/Modal";
import Table from "@components/admin/Table";
import TableRow, { type Action } from "@components/admin/TableRow";
import Switch from "@components/admin/Switch";
import PaginationWrapper from "@components/admin/PaginationWrapper";
import Constants from "@constants/api";
import type { RootState } from "@store/index";
import LoaderSpinner from "@components/admin/LoaderSpinner";
import { hasPermission } from "@utils/hasPermission";
import SubmitButton from "@components/admin/SubmitButton";
import DeleteConfirmationModal from "@components/admin/DeleteConfirmationModal";
import SmartDropdown from "@components/admin/SmartDropdown";
import type { OptionType, Pagination } from "@models/common";
import { useCurrencies } from "@hooks/useCurrencies";
import CurrencySelect from "@components/admin/CurrencySelect";
import { BANK_CODE_TYPES, getBankCodeType } from "@constants/bankCodeTypes";
import type { BankAccount, BankAccountFormData } from "@models/bank-account";
import BankAccountDetailsModal from "./BankAccountDetailsModal";
import AdjustBalanceModal from "./AdjustBalanceModal";
import { Button, FormField, Select } from "@components/ui";
import { PageHeader } from "@/context/PageHeaderContext";

const getBankAccountTypes = (t: any): OptionType[] => [
    { id: "current", name: t("banking.currentAccount", "Joriy hisob-kitob (20208)") },
    { id: "savings", name: t("banking.depositAccount", "Jamgʻarma / Depozit") },
    { id: "currency", name: t("banking.currencyAccount", "Valyuta hisobi (20208 USD/EUR)") },
    { id: "cash", name: t("banking.cashAccount", "Naqd pul kassasi (1010)") },
];

const initialFormData: BankAccountFormData = {
    userId: "",
    accountHoldername: "",
    bankName: "",
    branchName: "",
    accountNumber: "",
    IFSCCode: "",
    status: true,
    accountType: "current",
    bankCodeType: "MFO",
    openingBalance: 0,
    currencyCode: "",
};

const BankAccountList: FC = () => {
    const { t } = useTranslation();
    const { token, user } = useSelector((state: RootState) => state.auth);
    const { data: systemSettings } = useSelector((state: RootState) => state.systemSettings);
    const permissions = systemSettings?.permissions || [];
    initialFormData.userId = user.id;
    const [searchParams, setSearchParams] = useSearchParams();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [itemToDelete, setItemToDelete] = useState<BankAccount | null>(null);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [formData, setFormData] = useState<BankAccountFormData>(initialFormData);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const search = searchParams.get('search') || '';
    const limit = Number(searchParams.get('limit') || 10);
    const page = Number(searchParams.get('page') || 1);
    const [isDeleting, setIsDeleting] = useState(false);
    const [accountTypeSearchInput, setAccountTypeSearchInput] = useState<string>("");
    const { formatMoney, defaultCurrencyCode } = useCurrencies();
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [itemToView, setItemToView] = useState<BankAccount | null>(null);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [itemToAdjust, setItemToAdjust] = useState<BankAccount | null>(null);
    const [showDeleted, setShowDeleted] = useState<boolean>(false);

    const bankAccountTypes = getBankAccountTypes(t);

    const fetchBankAccounts = async (currentSearch = search, currentLimit = limit, currentPage = page) => {
        try {
            setIsLoading(true);
            const response = await axios.get(Constants.GET_BANK_ACCOUNTS_URL, {
                params: {
                    search: currentSearch,
                    limit: currentLimit,
                    page: currentPage,
                    ...(showDeleted ? { deleted: 'true' } : {}),
                },
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setBankAccounts(response.data.data.bankDetails);
            if (response.data.data.pagination) setPagination(response.data.data.pagination);
        } catch (error) {
            console.error("Error fetching bank accounts:", error);
            toast.error(t("banking.fetchError", "Bank hisoblarini yuklashda xatolik yuz berdi."));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBankAccounts();
    }, [search, limit, page, token, showDeleted]);

    const handleViewChange = (deleted: boolean) => {
        if (deleted === showDeleted) return;
        setShowDeleted(deleted);
        setSearchParams({ search, limit: String(limit), page: '1' });
    };

    const handleRestore = async (account: BankAccount) => {
        try {
            await axios.patch(`${Constants.RESTORE_BANK_ACCOUNT_URL}/${account.id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(t("banking.restoreSuccess", "Bank hisobi muvaffaqiyatli qayta tiklandi"));
            fetchBankAccounts();
        } catch (error) {
            const message = error instanceof AxiosError
                ? (error.response?.data as { message?: string } | undefined)?.message
                : undefined;
            toast.error(message || t("banking.restoreError", "Bank hisobini tiklashda xatolik yuz berdi."));
        }
    };

    const handleSearch = (keyword: string) => {
        setSearchParams({ search: keyword, limit: String(limit), page: '1' });
    };

    const handlePageLengthChange = (newLimit: number) => {
        setSearchParams({ search, limit: String(newLimit), page: '1' });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams({ search, limit: String(limit), page: String(newPage) });
    };

    const openCreate = () => {
        setIsEditMode(false);
        setFormData({ ...initialFormData, currencyCode: defaultCurrencyCode, bankCodeType: "MFO" });
        setFormErrors({});
        setShowModal(true);
    };

    const handleEditClick = (item: BankAccount) => {
        setFormData({
            ...item,
            bankCodeType: item.bankCodeType || "MFO",
            currencyCode: item.currencyCode || defaultCurrencyCode,
        });
        setIsEditMode(true);
        setFormErrors({});
        setShowModal(true);
    };

    const handleDeleteClick = (account: BankAccount) => {
        setItemToDelete(account);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            setIsDeleting(true);
            await axios.delete(`${Constants.DELETE_BANK_ACCOUNT_URL}/${itemToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(t("banking.deleteSuccess", "Bank hisobi muvaffaqiyatli oʻchirildi"));
            fetchBankAccounts();
            setShowDeleteModal(false);
            setItemToDelete(null);
        } catch (error) {
            console.error('Failed to delete bank account:', error);
            toast.error(t("banking.deleteError", "Bank hisobini oʻchirishda xatolik yuz berdi."));
        } finally {
            setIsDeleting(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: boolean) => {
        setBankAccounts(prev =>
            prev.map(acc =>
                acc.id === id ? { ...acc, status: newStatus } : acc
            )
        );
        try {
            await axios.patch(`${Constants.UPDATE_BANK_ACCOUNT_STATUS_URL}/${id}`, { status: newStatus }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success(t("banking.statusSuccess", "Holat muvaffaqiyatli yangilandi"));
            fetchBankAccounts();
        } catch (error) {
            toast.error(t("banking.statusError", "Holatni yangilashda xatolik."));
            fetchBankAccounts();
        }
    };

    const tableActions: Action<BankAccount>[] = showDeleted
        ? [
            { label: t("common.view", "Koʻrish"), icon: <EyeIcon size={14} />, primary: true, onClick: (item) => handleViewDetails(item) },
            { label: t("banking.restore", "Qayta tiklash"), icon: <RotateCcw size={14} />, primary: true, requirePermission: { moduleSlug: 'finance-settings', action: 'edit' }, onClick: (item) => handleRestore(item) },
        ]
        : [
            { label: t("common.view", "Koʻrish"), icon: <EyeIcon size={14} />, primary: true, onClick: (item) => handleViewDetails(item) },
            { label: t("common.edit", "Tahrirlash"), icon: <Edit size={14} />, primary: true, requirePermission: { moduleSlug: 'finance-settings', action: 'edit' }, onClick: (item) => handleEditClick(item) },
            { label: t("banking.adjustBalance", "Qoldiqni toʻgʻrilash"), icon: <Scale size={14} />, requirePermission: { moduleSlug: 'finance-settings', action: 'edit' }, onClick: (item) => handleAdjustClick(item) },
            { label: t("common.delete", "Oʻchirish"), icon: <Trash2Icon size={14} />, primary: true, variant: 'danger', requirePermission: { moduleSlug: 'finance-settings', action: 'delete' }, onClick: (item) => handleDeleteClick(item) },
        ];

    const tableHeaders = [
        "#",
        t("banking.bankName", "Bank Nomi"),
        t("banking.accountHolder", "Hisob Egasi"),
        t("banking.accountNumber", "Hisob Raqami"),
        t("banking.currency", "Valyuta"),
        t("banking.currentBalance", "Joriy Qoldiq"),
        t("banking.bankCode", "Bank Kodi (MFO)"),
        t("common.status", "Holat"),
        t("common.actions", "Amallar"),
    ];

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.accountHoldername.trim()) newErrors.accountHoldername = t("banking.errorAccountHolder", "Hisob egasi nomi kiritilishi shart.");
        if (!formData.bankName.trim()) newErrors.bankName = t("banking.errorBankName", "Bank nomi kiritilishi shart.");
        if (!formData.branchName.trim()) {
            newErrors.branchName = t("banking.errorBranchName", "Filial / MFO nomi kiritilishi shart.");
        } else if (formData.branchName.trim().length < 2) {
            newErrors.branchName = t("banking.errorBranchLength", "Filial nomi kamida 2 ta belgidan iborat boʻlishi kerak.");
        }
        if (!formData.accountNumber.trim()) {
            newErrors.accountNumber = t("banking.errorAccountNumber", "Hisob raqami kiritilishi shart.");
        } else if (formData.accountNumber.trim().length < 5) {
            newErrors.accountNumber = t("banking.errorAccountLength", "Hisob raqami kamida 5 ta belgidan iborat boʻlishi kerak.");
        }
        if (!formData.IFSCCode.trim()) {
            newErrors.IFSCCode = `${getBankCodeType(formData.bankCodeType).label} ${t("banking.isRequired", "kiritilishi shart.")}`;
        } else if (formData.IFSCCode.trim().length < 4) {
            newErrors.IFSCCode = `${getBankCodeType(formData.bankCodeType).label} ${t("banking.isMinLength", "kamida 4 ta belgidan iborat boʻlishi kerak.")}`;
        }
        if (!formData.accountType) newErrors.accountType = t("banking.errorAccountType", "Hisob turi tanlanishi shart.");
        if (formData.openingBalance === undefined || formData.openingBalance === null || String(formData.openingBalance).trim() === '') {
            newErrors.openingBalance = t("banking.errorOpeningBalance", "Boshlangʻich qoldiq kiritilishi shart.");
        } else if (formData.openingBalance < 0) {
            newErrors.openingBalance = t("banking.errorNegativeBalance", "Boshlangʻich qoldiq manfiy boʻlishi mumkin emas.");
        } else if (formData.openingBalance > 9999999999) {
            newErrors.openingBalance = t("banking.errorMaxBalance", "Boshlangʻich qoldiq juda katta miqdorda.");
        }
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };
    const handleOptionTypeChange = (option: OptionType | null) => {
        if (option) {
            setFormData(prev => ({
                ...prev,
                accountType: option.id,
            }));
        }
    };
    const handleCurrencyChange = (code: string) => {
        setFormData(prev => ({ ...prev, currencyCode: code }));
    };
    const handleBankCodeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, bankCodeType: e.target.value }));
    };
    const handleViewDetails = (item: BankAccount) => {
        setItemToView(item);
        setIsDetailsModalOpen(true);
    };
    const handleAdjustClick = (item: BankAccount) => {
        setItemToAdjust(item);
        setIsAdjustModalOpen(true);
    };
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;

        const payload = {
            ...formData,
            IFSCCode: formData.IFSCCode.toUpperCase()
        };

        try {
            setIsSaving(true);
            if (isEditMode) {
                await axios.put(`${Constants.UPDATE_BANK_ACCOUNT_URL}/${formData.id}`, payload, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                toast.success(t("banking.updateSuccess", "Bank hisobi muvaffaqiyatli saqlandi"));
            } else {
                await axios.post(Constants.CREATE_BANK_ACCOUNT_URL, payload, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                toast.success(t("banking.createSuccess", "Yangi bank hisobi muvaffaqiyatli yaratildi"));
            }
            fetchBankAccounts();
            setShowModal(false);
        } catch (error: any | AxiosError) {
            const serverErrors = error?.response?.data?.errors;
            const serverMessage = error?.response?.data?.message;
            if (serverErrors) setFormErrors(serverErrors);
            toast.error(serverMessage || t("common.error", "Xatolik yuz berdi. Iltimos qaytadan urinib koʻring."));
        } finally {
            setIsSaving(false);
        }
    };

    const from = (pagination.page - 1) * pagination.limit + 1;
    const to = Math.min(pagination.page * pagination.limit, pagination.total);

    return (
        <div className="space-y-4">
            <PageHeader title={t("banking.title", "Bank Hisoblari & Kassa")}>
                {!showDeleted && hasPermission(permissions, 'finance-settings', 'create') && (
                    <Button
                        variant="primary"
                        onClick={openCreate}
                        leftIcon={<CirclePlusIcon size={14} />}>
                        {t("banking.newAccount", "Yangi Bank Hisobi")}
                    </Button>
                )}
            </PageHeader>

            {/* Active / Deleted view toggle */}
            <div className="inline-flex rounded-md border border-gray-200 p-0.5">
                <button
                    type="button"
                    onClick={() => handleViewChange(false)}
                    className={`px-4 py-1.5 text-sm font-medium rounded ${!showDeleted ? 'bg-teal-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    {t("common.active", "Faol")}
                </button>
                <button
                    type="button"
                    onClick={() => handleViewChange(true)}
                    className={`px-4 py-1.5 text-sm font-medium rounded ${showDeleted ? 'bg-teal-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    {t("banking.deleted", "Oʻchirilgan")}
                </button>
            </div>

            {/* Search and Page Length */}
            <div className="flex justify-between items-center">
                <FormField
                    type="text"
                    placeholder={t("banking.searchPlaceholder", "Bank hisoblarini qidirish...")}
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    containerClassName="w-full md:w-64"
                />
                <Select
                    value={limit}
                    onChange={(e) => handlePageLengthChange(Number(e.target.value))}
                    containerClassName="w-auto"
                    options={[10, 25, 50].map((num) => ({ value: num, label: `${num} / sahifa` }))}
                />
            </div>

            {/* Table */}
            <Table headers={tableHeaders}>
                {!isLoading && bankAccounts && bankAccounts.length > 0 && bankAccounts.map((acc, index) => (
                    <TableRow
                        key={acc.id}
                        index={from + index}
                        row={acc}
                        onRowClick={(item) => handleViewDetails(item)}
                        columns={[
                            <span className="text-teal-700 capitalize font-bold">{acc.bankName}</span>,
                            acc.accountHoldername,
                            <span className="font-mono">{acc.accountNumber}</span>,
                            acc.currencyCode || defaultCurrencyCode,
                            <span className="font-mono font-bold">{formatMoney(acc.currentBalance ?? 0, acc.currencyCode)}</span>,
                            <span className="font-mono font-semibold">{acc.IFSCCode}</span>,
                            showDeleted
                                ? <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">{t("banking.deleted", "Oʻchirilgan")}</span>
                                : <span onClick={(e) => e.stopPropagation()}><Switch name={`status-${acc.id}`} checked={acc.status} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleStatusChange(acc.id, e.target.checked)} disabled={!hasPermission(permissions, 'finance-settings', 'edit')} /></span>,
                        ]}
                        actions={tableActions}
                    />
                ))}

                {!isLoading && bankAccounts && bankAccounts.length === 0 &&
                    <tr>
                        <td colSpan={9} className="text-center py-4 text-body font-medium">
                            {showDeleted ? t("banking.noDeletedAccounts", "Oʻchirilgan bank hisoblari mavjud emas") : t("banking.noAccounts", "Bank hisoblari topilmadi")}
                        </td>
                    </tr>
                }

                {isLoading && (
                    <tr key="table-loader">
                        <td className="text-center py-2 text-heading font-semibold" colSpan={9}>
                            <LoaderSpinner />
                        </td>
                    </tr>
                )}
            </Table>

            {/* Pagination */}
            <PaginationWrapper
                count={pagination.totalPages}
                page={page}
                from={from}
                to={to}
                total={pagination.total}
                onChange={(_, newPage) => handlePageChange(newPage)}
                paginationVariant="outlined"
                paginationShape="rounded"
            />

            {/* Add/Edit Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={isEditMode ? t("banking.updateTitle", "Bank Hisobini Tahrirlash") : t("banking.createTitle", "Yangi Bank Hisobi Ochish")}>
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            label={t("banking.accountHolder", "Hisob Egasi Nomi (Kompaniya / F.I.Sh)")}
                            required
                            name="accountHoldername"
                            value={formData.accountHoldername}
                            onChange={handleChange}
                            type="text"
                            placeholder="Masalan: RAYHON MILLIY TAOMLAR RESTORANI MCHJ"
                            error={formErrors.accountHoldername}
                        />
                        <FormField
                            label={t("banking.bankName", "Bank Nomi")}
                            required
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleChange}
                            type="text"
                            placeholder="Masalan: Kapitalbank ATB yoki Ipak Yoʻli Bank"
                            error={formErrors.bankName}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            label={t("banking.branchName", "Filial / MFO Nomi")}
                            required
                            name="branchName"
                            value={formData.branchName}
                            onChange={handleChange}
                            type="text"
                            placeholder="Masalan: Sayram filiali yoki Bosh ofis"
                            error={formErrors.branchName}
                        />

                        {/* accountType */}
                        <FormField label={t("banking.accountType", "Hisob Turi")} required error={formErrors.accountType}>
                            {() => (
                                <SmartDropdown
                                    items={bankAccountTypes}
                                    value={accountTypeSearchInput}
                                    onChange={(value) => setAccountTypeSearchInput(value)}
                                    onSelect={(option) => handleOptionTypeChange(option as OptionType)}
                                    selectedItem={bankAccountTypes.find(option => option.id == formData.accountType) || null}
                                    placeholder={t("banking.selectAccountType", "Hisob turini tanlang")}
                                    serverside={false}
                                />
                            )}
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            label={t("banking.accountNumber", "Hisob Raqami (20 xonali)")}
                            required
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleChange}
                            type="text"
                            placeholder="Masalan: 20208000500987654001"
                            error={formErrors.accountNumber}
                        />

                        <Select
                            label={t("banking.bankCodeType", "Bank Kodi Turi")}
                            name="bankCodeType"
                            value={formData.bankCodeType || "MFO"}
                            onChange={handleBankCodeTypeChange}
                            options={BANK_CODE_TYPES.map((t) => ({ value: t.id, label: t.label }))}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Bank Code (label + placeholder adapt to selected type) */}
                        <FormField
                            label={getBankCodeType(formData.bankCodeType).label}
                            required
                            name="IFSCCode"
                            value={formData.IFSCCode}
                            onChange={handleChange}
                            type="text"
                            placeholder={getBankCodeType(formData.bankCodeType).placeholder}
                            error={formErrors.IFSCCode}
                        />

                        {/* Currency */}
                        <div>
                            <CurrencySelect
                                label={t("banking.currency", "Valyuta")}
                                value={formData.currencyCode || defaultCurrencyCode}
                                onChange={handleCurrencyChange}
                            />
                            {formErrors.currencyCode && <p className="text-sm text-danger mt-1">{formErrors.currencyCode}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            label={t("banking.openingBalance", "Boshlangʻich Qoldiq")}
                            required
                            placeholder="0.00"
                            disabled={isEditMode}
                            type="number"
                            name="openingBalance"
                            value={formData.openingBalance}
                            onChange={handleChange}
                            error={formErrors.openingBalance}
                        />

                        {/* Status Switch */}
                        <div className="flex items-center gap-3 pt-6">
                            <label htmlFor="status" className="font-bold text-xs text-heading">{t("banking.statusLabel", "Holat (Faol)")}</label>
                            <Switch name="status" checked={formData.status ?? false} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end pt-4 space-x-2 border-t border-slate-100">
                        <Button type="button" variant="white" onClick={() => setShowModal(false)}>
                            {t("common.cancel", "Bekor qilish")}
                        </Button>
                        <SubmitButton isDisabled={isSaving} isLoading={isSaving} mode={isEditMode ? "edit" : "create"} />
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
                title={t("banking.deleteTitle", "Bank hisobini oʻchirish")}
                message={t("banking.deleteConfirmMessage", `Haqiqatan ham "${itemToDelete?.accountHoldername}" bank hisobini oʻchirmoqchimisiz? Bu amalni qaytarib boʻlmaydi.`)}
            />
            {/* Details Modal */}
            {isDetailsModalOpen && itemToView && (
                <BankAccountDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} bankAccount={itemToView} />
            )}

            {/* Adjust Balance Modal */}
            <AdjustBalanceModal
                isOpen={isAdjustModalOpen}
                onClose={() => setIsAdjustModalOpen(false)}
                onSuccess={() => fetchBankAccounts()}
                bankAccount={itemToAdjust}
            />
        </div>
    );
};

export default BankAccountList;