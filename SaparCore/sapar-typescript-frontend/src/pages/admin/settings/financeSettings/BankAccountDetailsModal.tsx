import React from "react";
import Modal from "@components/admin/Modal";
import { useTranslation } from "react-i18next";
import type { BankAccount } from "@models/bank-account";
import useDateFormatter from "@hooks/useDateFormatter";
import { useSelector } from "react-redux";
import type { RootState } from "@store/index";
import { useCurrencies } from "@hooks/useCurrencies";
import { getBankCodeType } from "@constants/bankCodeTypes";
import { CreditCard } from "lucide-react";
import { Badge, Button } from "@components/ui";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    bankAccount: BankAccount & { asOnDate?: string };
}

const BankAccountDetailsModal: React.FC<Props> = ({ isOpen, onClose, bankAccount }) => {
    if (!bankAccount) return null;

    const { t } = useTranslation();
    const { data: systemSettings } = useSelector((state: RootState) => state.systemSettings);
    const { formatMoney, defaultCurrencyCode } = useCurrencies();
    const { formatDate } = useDateFormatter();
    const dateFormat = systemSettings?.dateFormat.format || "DD-MM-YYYY";
    const accountCurrency = bankAccount.currencyCode || defaultCurrencyCode;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t("banking.overviewTitle", "Bank Hisobi Tafsilotlari")}>
            <div className="bg-surface border border-border rounded-card">
                {/* --- Header --- */}
                <div className="px-6 py-4 border-b border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-heading">
                                {bankAccount.accountHoldername}
                            </h2>
                            <p className="text-sm text-body mt-1 font-medium">
                                {bankAccount.bankName}
                            </p>
                        </div>
                        <Badge color={bankAccount.status ? "success" : "danger"} variant="solid">
                            {bankAccount.status ? t("common.active", "Faol") : t("common.inactive", "Nofaol")}
                        </Badge>
                    </div>
                </div>

                {/* --- Balance Card --- */}
                <div className="p-6">
                    <div className="relative p-5 bg-surface border border-border rounded-card shadow-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-body">
                                    {t("banking.currentBalance", "Joriy Qoldiq")}
                                </p>
                                <p className={`text-3xl font-bold tracking-tight mt-1 font-mono ${bankAccount.currentBalance >= 0
                                    ? "text-heading"
                                    : "text-danger"
                                    }`}
                                >
                                    {formatMoney(bankAccount.currentBalance || 0, accountCurrency)}
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-teal-600 text-white">
                                <CreditCard size={24} />
                            </div>
                        </div>
                        {bankAccount.asOnDate && (
                            <p className="text-xs text-body mt-3 font-medium">
                                {formatDate(bankAccount.asOnDate, dateFormat)} {t("banking.asOnDate", "holatiga koʻra")}
                            </p>
                        )}
                    </div>
                </div>

                {/* --- Account Info Section --- */}
                <div className="px-6 pb-6">
                    <h3 className="text-lg font-semibold text-heading mb-4">{t("banking.accountDetailsHeader", "Hisob Maʼlumotlari")}</h3>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div className="col-span-1">
                            <dt className="text-xs uppercase tracking-wider font-medium text-body">{t("banking.accountNumber", "Hisob Raqami")}</dt>
                            <dd className="text-sm font-mono text-heading mt-1">{bankAccount.accountNumber}</dd>
                        </div>
                        <div className="col-span-1">
                            <dt className="text-xs uppercase tracking-wider font-medium text-body">{getBankCodeType(bankAccount.bankCodeType).label}</dt>
                            <dd className="text-sm font-mono text-heading mt-1">{bankAccount.IFSCCode}</dd>
                        </div>
                        <div className="col-span-1">
                            <dt className="text-xs uppercase tracking-wider font-medium text-body">{t("banking.accountType", "Hisob Turi")}</dt>
                            <dd className="text-sm capitalize text-heading mt-1">{bankAccount.accountType}</dd>
                        </div>
                        <div className="col-span-1">
                            <dt className="text-xs uppercase tracking-wider font-medium text-body">{t("banking.branchName", "Filial / MFO Nomi")}</dt>
                            <dd className="text-sm text-heading mt-1">{bankAccount.branchName}</dd>
                        </div>
                        <div className="col-span-2 border-t border-border my-2"></div>
                        <div className="col-span-1">
                            <dt className="text-xs uppercase tracking-wider font-medium text-body">{t("banking.currency", "Valyuta")}</dt>
                            <dd className="text-sm text-heading mt-1 font-mono font-semibold">{accountCurrency}</dd>
                        </div>
                        <div className="col-span-1">
                            <dt className="text-xs uppercase tracking-wider font-medium text-body">{t("banking.openingBalance", "Boshlangʻich Qoldiq")}</dt>
                            <dd className="text-sm text-heading mt-1 font-mono font-semibold">{formatMoney(bankAccount.openingBalance || 0, accountCurrency)}</dd>
                        </div>
                        <div className="col-span-1">
                            <dt className="text-xs uppercase tracking-wider font-medium text-body">{t("banking.createdOn", "Yaratilgan Sana")}</dt>
                            <dd className="text-sm text-heading mt-1 font-mono">{formatDate(bankAccount.createdAt, dateFormat)}</dd>
                        </div>
                    </dl>
                </div>

                {/* --- Footer --- */}
                <div className="px-6 py-4 flex justify-end">
                    <Button variant="primary" onClick={onClose}>
                        {t("common.close", "Yopish")}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default BankAccountDetailsModal;