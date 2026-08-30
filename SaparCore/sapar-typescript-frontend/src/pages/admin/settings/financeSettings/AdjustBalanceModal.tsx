import Modal from "@components/admin/Modal";
import SubmitButton from "@components/admin/SubmitButton";
import { Button, FormField, Select, fieldControlClasses } from "@components/ui";
import DateInput from "@components/admin/DateInput";
import { ymdStringToDate, dateToYmdString } from "@utils/converters";
import Constants from "@constants/api";
import type { RootState } from "@store/index";
import type { BankAccount } from "@models/bank-account";
import { useCurrencies } from "@hooks/useCurrencies";
import { useTranslation } from "react-i18next";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

interface AdjustBalanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    bankAccount: BankAccount | null;
}

type AdjustType = "DEPOSIT" | "WITHDRAWAL";

const todayISO = () => new Date().toISOString().slice(0, 10);

const AdjustBalanceModal: React.FC<AdjustBalanceModalProps> = ({ isOpen, onClose, onSuccess, bankAccount }) => {
    const { t } = useTranslation();
    const { token } = useSelector((state: RootState) => state.auth);
    const { formatMoney, defaultCurrencyCode } = useCurrencies();
    const [isSaving, setIsSaving] = useState(false);

    const typeOptions: { value: AdjustType; label: string }[] = [
        { value: "DEPOSIT", label: t("banking.depositOption", "Kirim (qoldiqni oshirish)") },
        { value: "WITHDRAWAL", label: t("banking.withdrawalOption", "Chiqim (qoldiqni kamaytirish)") },
    ];

    const [form, setForm] = useState({
        transactionDate: todayISO(),
        type: "DEPOSIT" as AdjustType,
        amount: "",
        remarks: "",
    });

    useEffect(() => {
        if (!isOpen) return;
        setForm({ transactionDate: todayISO(), type: "DEPOSIT", amount: "", remarks: "" });
    }, [isOpen, bankAccount?.id]);

    if (!bankAccount) return null;

    const currency = bankAccount.currencyCode || defaultCurrencyCode;
    const current = Number(bankAccount.currentBalance ?? 0);
    const amountNum = Number(form.amount) || 0;
    const resulting = form.type === "WITHDRAWAL" ? current - amountNum : current + amountNum;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.amount || Number(form.amount) <= 0) {
            toast.warning(t("banking.invalidAmount", "Iltimos toʻgʻri summani kiriting"));
            return;
        }
        if (!form.remarks.trim()) {
            toast.warning(t("banking.invalidRemarks", "Iltimos toʻgʻrilash sababini kiriting"));
            return;
        }
        try {
            setIsSaving(true);
            await axios.post(
                Constants.CREATE_BANK_TRANSACTION_URL,
                {
                    bankAccountId: bankAccount.id,
                    transactionDate: form.transactionDate,
                    type: form.type,
                    amount: Number(form.amount),
                    remarks: form.remarks.trim(),
                },
                { headers: { Authorization: `Bearer ${token}` } },
            );
            toast.success(t("banking.adjustSuccess", "Qoldiq muvaffaqiyatli toʻgʻrilandi"));
            onSuccess?.();
            onClose();
        } catch (err) {
            const message = err instanceof AxiosError
                ? (err.response?.data as { message?: string } | undefined)?.message
                : undefined;
            toast.error(message || t("banking.adjustError", "Qoldiqni toʻgʻrilashda xatolik yuz berdi"));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t("banking.adjustBalanceTitle", "Bank Qoldigʻini Toʻgʻrilash")} size="lg">
            <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs font-sans">
                {/* Account context (read-only) */}
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs">
                    <div className="font-bold text-slate-800 capitalize">
                        {bankAccount.bankName} · <span className="font-mono">{bankAccount.accountNumber}</span>
                    </div>
                    <div className="text-slate-500 mt-1">
                        {t("banking.currentBalance", "Joriy qoldiq")}: <span className="font-bold font-mono text-teal-800">{formatMoney(current, currency)}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                        {t("banking.adjustExplanation", "Boshlangʻich qoldiqni oʻzgartirib boʻlmaydi. Qoldiqni toʻgʻrilash uchun sanasi koʻrsatilgan kirim yoki chiqim oʻtkazmasi yaratiladi va barcha tarix saqlanib qoladi.")}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                        label={t("banking.operationType", "Operatsiya turi")}
                        value={form.type}
                        onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as AdjustType }))}
                        options={typeOptions}
                    />
                    <FormField
                        label={t("common.amount", "Summa")}
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.amount}
                        onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                        placeholder="0.00"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <DateInput
                            label={t("common.date", "Sana")}
                            value={ymdStringToDate(form.transactionDate)}
                            onChange={(date) => setForm((p) => ({ ...p, transactionDate: dateToYmdString(date) }))}
                        />
                    </div>
                    <div className="flex flex-col justify-end">
                        <span className="block text-xs font-bold text-slate-700 mb-1">{t("banking.resultingBalance", "Natijaviy qoldiq")}</span>
                        <span className={`text-base font-bold font-mono ${resulting < 0 ? "text-red-600" : "text-emerald-700"}`}>
                            {formatMoney(resulting, currency)}
                        </span>
                    </div>
                </div>

                <FormField label={t("banking.reasonLabel", "Toʻgʻrilash sababi / Izoh")} required>
                    {(field) => (
                        <textarea
                            id={field.id}
                            value={form.remarks}
                            onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
                            className={fieldControlClasses()}
                            rows={2}
                            placeholder="Masalan: Boshlangʻich hisob qoldigʻini toʻgʻrilash"
                        />
                    )}
                </FormField>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button variant="white" onClick={onClose}>
                        {t("common.cancel", "Bekor qilish")}
                    </Button>
                    <SubmitButton isDisabled={isSaving} isLoading={isSaving} mode="create">
                        {isSaving ? t("common.saving", "Saqlanmoqda...") : t("banking.postAdjustment", "Toʻgʻrilashni Tasdiqlash")}
                    </SubmitButton>
                </div>
            </form>
        </Modal>
    );
};

export default AdjustBalanceModal;

