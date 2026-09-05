import { useEffect, useState } from "react";
import Modal from "@components/admin/Modal";
import axios, { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import Constants from "@constants/api";
import type { RootState } from "@store/index";
import { useSelector } from "react-redux";
import SubmitButton from "@components/admin/SubmitButton";
import { toast } from "sonner";
import Switch from "@components/admin/Switch";
import type { BankAccountCreatedResponse } from "@models/bank-account";
import SmartDropdown from "@components/admin/SmartDropdown";
import type { OptionType } from "@models/common";
import { BANK_CODE_TYPES, getBankCodeType } from "@constants/bankCodeTypes";
import { Button, FormField, Select } from "@components/ui";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newBankAccount: BankAccountCreatedResponse) => void;
}

interface BankAccountFormData {
    id?: string;
    accountHoldername: string;
    bankName: string;
    branchName: string;
    accountNumber: string;
    bankCodeType?: string;
    IFSCCode: string;
    accountType: string;
    openingBalance: number;
    status?: boolean;
}

const getBankAccountTypes = (t: any): OptionType[] => [
    { id: "current", name: t("banking.currentAccount", "Joriy hisob-kitob (20208)") },
    { id: "savings", name: t("banking.depositAccount", "Jamgʻarma / Depozit") },
    { id: "currency", name: t("banking.currencyAccount", "Valyuta hisobi (20208 USD/EUR)") },
    { id: "cash", name: t("banking.cashAccount", "Naqd pul kassasi (1010)") },
];

const CreateBankAccountModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const { token } = useSelector((state: RootState) => state.auth);

    const setInitialFormData = (): BankAccountFormData => ({
        accountHoldername: "",
        bankName: "",
        branchName: "",
        accountNumber: "",
        bankCodeType: "MFO",
        IFSCCode: "",
        accountType: "current",
        openingBalance: 0,
        status: true,
    });
    const [formData, setFormData] = useState<BankAccountFormData>(setInitialFormData());
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [accountTypeSearchInput, setAccountTypeSearchInput] = useState<string>("");

    const bankAccountTypes = getBankAccountTypes(t);

    // Reset form whenever modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData(setInitialFormData());
            setFormErrors({});
        }
    }, [isOpen]);

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

    const handleBankCodeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, bankCodeType: e.target.value }));
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.accountHoldername.trim()) newErrors.accountHoldername = t("banking.errorAccountHolder", 'Hisob egasi nomi kiritilishi shart.');
        if (!formData.bankName.trim()) newErrors.bankName = t("banking.errorBankName", 'Bank nomi kiritilishi shart.');
        if (!formData.accountNumber.trim()) newErrors.accountNumber = t("banking.errorAccountNumber", 'Hisob raqami kiritilishi shart.');
        if (!formData.IFSCCode.trim()) newErrors.IFSCCode = `${getBankCodeType(formData.bankCodeType).label} ${t("banking.isRequired", "kiritilishi shart.")}`;
        if (!formData.accountType) newErrors.accountType = t("banking.errorAccountType", 'Hisob turi tanlanishi shart.');
        if (formData.openingBalance < 0) {
            newErrors.openingBalance = t("banking.errorNegativeBalance", 'Boshlangʻich qoldiq manfiy boʻlishi mumkin emas.');
        } else if (formData.openingBalance > 9999999999) {
            newErrors.openingBalance = t("banking.errorMaxBalance", 'Boshlangʻich qoldiq juda katta miqdorda.');
        }
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;

        const payload = {
            ...formData,
            IFSCCode: formData.IFSCCode.toUpperCase()
        };

        try {
            setIsSubmitting(true);
            const response = await axios.post(Constants.CREATE_BANK_ACCOUNT_URL, payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success(t("banking.createSuccess", 'Yangi bank hisobi muvaffaqiyatli yaratildi'));
            onSuccess(response.data.data || {});
        } catch (error: any | AxiosError) {
            setFormErrors(error?.response?.data?.errors || {});
            toast.error(t("common.error", 'Xatolik yuz berdi. Iltimos qaytadan urinib koʻring.'));
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t("banking.createTitle", "Yangi Bank Hisobi Ochish")}>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Account Holder Name */}
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
                    {/* Bank Name */}
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
                    {/* Branch Name */}
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
                        <SmartDropdown
                            items={bankAccountTypes}
                            value={accountTypeSearchInput}
                            onChange={(value) => setAccountTypeSearchInput(value)}
                            onSelect={(option) => handleOptionTypeChange(option as OptionType)}
                            selectedItem={bankAccountTypes.find(option => option.id == formData.accountType) || null}
                            placeholder={t("banking.selectAccountType", "Hisob turini tanlang")}
                            serverside={false}
                        />
                    </FormField>
                    {/* Account Number */}
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

                    {/* Bank Code Type */}
                    <Select
                        label={t("banking.bankCodeType", "Bank Kodi Turi")}
                        name="bankCodeType"
                        value={formData.bankCodeType || "MFO"}
                        onChange={handleBankCodeTypeChange}
                        options={BANK_CODE_TYPES.map((t) => ({ value: t.id, label: t.label }))}
                    />

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
                    {/* Opening Balance */}
                    <FormField
                        label={t("banking.openingBalance", "Boshlangʻich Qoldiq")}
                        required
                        placeholder="0.00"
                        disabled={false}
                        type="number"
                        name="openingBalance"
                        value={formData.openingBalance ? Number(formData.openingBalance) : 0}
                        onChange={handleChange}
                        error={formErrors.openingBalance}
                    />
                </div>
                {/* Status Switch */}
                <div className="flex items-center gap-3 pt-2">
                    <label htmlFor="status" className="font-bold text-xs text-heading">{t("banking.statusLabel", "Holat (Faol)")}</label>
                    <Switch name="status" checked={formData.status ?? false} onChange={handleChange} />
                </div>

                {/* Buttons */}
                <div className="flex justify-end pt-4 space-x-2 border-t border-slate-100">
                    <Button type="button" variant="white" onClick={onClose}>
                        {t("common.cancel", "Bekor qilish")}
                    </Button>
                    <SubmitButton isDisabled={isSubmitting} isLoading={isSubmitting} mode={"create"} />
                </div>
            </form>
        </Modal>
    );
};

export default CreateBankAccountModal;

