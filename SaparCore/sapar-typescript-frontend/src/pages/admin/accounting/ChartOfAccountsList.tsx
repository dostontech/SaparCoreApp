import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import {
    CirclePlusIcon,
    Edit,
    Trash2Icon,
    Search,
    BookOpen,
    ShieldCheck,
    Layers,
    Building2,
} from "lucide-react";

import type { RootState } from "@store/index";
import Constants from "@constants/api";
import Table from "@components/admin/Table";
import TableRow from "@components/admin/TableRow";
import LoaderSpinner from "@components/admin/LoaderSpinner";
import NoRecords from "@components/admin/NoRecords";
import DeleteConfirmationModal from "@components/admin/DeleteConfirmationModal";
import ExportButton from "@components/admin/ExportButton";
import { Button, Badge, type BadgeColor } from "@components/ui";
import { PageHeader } from "@/context/PageHeaderContext";
import type { Account, AccountType } from "@models/accounting";

const ACCOUNT_CATEGORIES = [
    { id: "ALL", label: "Barcha hisoblar" },
    { id: "ASSET", label: "Aktivlar" },
    { id: "LIABILITY", label: "Majburiyatlar" },
    { id: "EQUITY", label: "Kapital" },
    { id: "INCOME", label: "Daromadlar" },
    { id: "EXPENSE", label: "Xarajatlar" },
] as const;

const typeBadgeColor = (t: AccountType): BadgeColor => {
    switch (t) {
        case "ASSET": return "info";
        case "LIABILITY": return "danger";
        case "EQUITY": return "primary";
        case "INCOME": return "success";
        case "EXPENSE": return "warning";
        default: return "gray";
    }
};

const getSystemTag = (code: string, name: string): string | null => {
    const c = code.trim();
    const n = name.toLowerCase();
    if (c.startsWith("10") || c.startsWith("50") || c.startsWith("51") || n.includes("cash") || n.includes("bank") || n.includes("kassa")) {
        return "Bank va Kassa";
    }
    if (c.startsWith("40") || n.includes("receivable") || n.includes("xaridor") || n.includes("debitor")) {
        return "Debitorlik qarzi";
    }
    if (c.startsWith("60") || n.includes("payable") || n.includes("yetkazib") || n.includes("kreditor")) {
        return "Kreditorlik qarzi";
    }
    if (c.startsWith("64") || n.includes("tax") || n.includes("soliq") || n.includes("qqs")) {
        return "Toʻlanadigan soliqlar";
    }
    if (c.startsWith("87") || c.startsWith("99") || n.includes("retained") || n.includes("foyda") || n.includes("daromad")) {
        return "Taqsimlanmagan foyda";
    }
    if (c.startsWith("01") || n.includes("fixed") || n.includes("asosiy")) {
        return "Asosiy vositalar";
    }
    return null;
};

interface FormState {
    code: string;
    name: string;
    accountType: AccountType;
    parentId: string;
    description: string;
}

const emptyForm: FormState = { code: "", name: "", accountType: "ASSET", parentId: "", description: "" };

const ChartOfAccountsList: React.FC = () => {
    const navigate = useNavigate();
    const { token } = useSelector((state: RootState) => state.auth);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSeeding, setIsSeeding] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [deleteItem, setDeleteItem] = useState<Account | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");

    const fetchAccounts = async () => {
        try {
            setIsLoading(true);
            const params: Record<string, string> = {};
            if (activeTab !== "ALL") params.accountType = activeTab;
            const resp = await axios.get(Constants.GET_ACCOUNTS_URL, {
                params,
                headers: { Authorization: `Bearer ${token}` },
            });
            setAccounts(resp.data?.data?.accounts ?? []);
        } catch (err) {
            console.error("Failed to fetch accounts:", err);
            toast.error("Failed to fetch accounts");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const handleSeed = async () => {
        if (isSeeding) return;
        try {
            setIsSeeding(true);
            const resp = await axios.post(
                Constants.SEED_DEFAULT_ACCOUNTS_URL,
                {},
                { headers: { Authorization: `Bearer ${token}` } },
            );
            toast.success(resp.data?.message ?? "Seeded default chart");
            await fetchAccounts();
        } catch (err) {
            console.error("Seed failed:", err);
            toast.error("Failed to seed default chart");
        } finally {
            setIsSeeding(false);
        }
    };

    const openCreate = () => {
        setForm({
            ...emptyForm,
            accountType: (activeTab !== "ALL" ? activeTab : "ASSET") as AccountType,
        });
        setEditingId(null);
        setShowModal(true);
    };

    const openEdit = (row: Account) => {
        setForm({
            code: row.code,
            name: row.name,
            accountType: row.accountType,
            parentId: row.parentId ?? "",
            description: row.description ?? "",
        });
        setEditingId(row.id);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.code || !form.name || !form.accountType) {
            toast.error("Code, name, and type are required");
            return;
        }
        try {
            setSubmitting(true);
            const payload = {
                code: form.code,
                name: form.name,
                accountType: form.accountType,
                parentId: form.parentId || null,
                description: form.description || null,
            };
            if (editingId) {
                await axios.put(
                    `${Constants.UPDATE_ACCOUNT_URL}/${editingId}`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } },
                );
                toast.success("Account updated");
            } else {
                await axios.post(Constants.CREATE_ACCOUNT_URL, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Account created");
            }
            setShowModal(false);
            await fetchAccounts();
        } catch (err) {
            const msg = axios.isAxiosError(err)
                ? (err.response?.data as { message?: string } | undefined)?.message
                : null;
            console.error("Save failed:", err);
            toast.error(msg ?? "Failed to save account");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteItem) return;
        try {
            setIsDeleting(true);
            await axios.delete(`${Constants.DELETE_ACCOUNT_URL}/${deleteItem.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Account deleted");
            setDeleteItem(null);
            await fetchAccounts();
        } catch (err) {
            console.error("Delete failed:", err);
            toast.error("Failed to delete account");
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredAccounts = useMemo(() => {
        if (!searchQuery.trim()) return accounts;
        const q = searchQuery.toLowerCase().trim();
        return accounts.filter(
            (a) => a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || (a.description && a.description.toLowerCase().includes(q))
        );
    }, [accounts, searchQuery]);

    const tableActions = [
        {
            label: "Bosh Kitob (Ledger)",
            icon: <BookOpen size={14} className="text-teal-600" />,
            onClick: (row: Account) => navigate(`/admin/accounting/reports/general-ledger?accountId=${row.id}`),
        },
        { label: "Tahrirlash", icon: <Edit size={14} />, onClick: (row: Account) => openEdit(row) },
        { label: "Oʻchirish", icon: <Trash2Icon size={14} />, onClick: (row: Account) => setDeleteItem(row) },
    ];

    const headers = ["#", "Hisob Kodi", "Hisob Nomi", "Turi", "Tizim Tegi", "Bosh Hisob", "Amallar"];

    return (
        <div className="space-y-4">
            <PageHeader title="Hisoblar Rejasi (Chart of Accounts)">
                <div className="flex items-center gap-2">
                    <Link
                        to="/admin/accounting/bhms-chart-of-accounts"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50 text-teal-800 text-xs font-medium hover:bg-teal-100 transition-colors"
                    >
                        <Building2 size={14} /> 21-son BHMS Standarti
                    </Link>
                    <ExportButton
                        url={Constants.EXPORT_CHART_OF_ACCOUNTS_URL}
                        filename="chart-of-accounts.csv"
                    />
                    {accounts.length === 0 && !isLoading && (
                        <Button
                            variant="white"
                            onClick={handleSeed}
                            disabled={isSeeding}
                        >
                            {isSeeding ? "Yuklanmoqda…" : "Standart Hisoblarni Yuklash"}
                        </Button>
                    )}
                    <Button onClick={openCreate} leftIcon={<CirclePlusIcon size={16} />}>
                        Hisob Qoʻshish
                    </Button>

                </div>
            </PageHeader>

            {/* Quick Filter Tabs */}
            <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1 border-b md:border-b-0 border-gray-100 pb-2 md:pb-0">
                        {ACCOUNT_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    activeTab === cat.id
                                        ? "bg-teal-600 text-white shadow-sm"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative min-w-[240px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Qidirish (Kodi, nomi)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 focus:bg-white"
                        />
                    </div>
                </div>
            </div>

            <Table headers={headers}>
                {!isLoading && filteredAccounts.map((row, idx) => {
                    const isSubAccount = !!row.parentId;
                    const sysTag = getSystemTag(row.code, row.name);

                    return (
                        <TableRow
                            key={row.id}
                            index={idx + 1}
                            row={row}
                            columns={[
                                <div className={`flex items-center gap-1.5 ${isSubAccount ? "pl-4 text-gray-500 font-mono text-xs" : "font-mono font-bold text-gray-800 text-xs"}`}>
                                    {isSubAccount && <span className="text-gray-300">↳</span>}
                                    <span>{row.code}</span>
                                </div>,
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm ${isSubAccount ? "text-gray-700" : "font-semibold text-gray-900"}`}>
                                        {row.name}
                                    </span>
                                    {row.description && (
                                        <span className="text-xs text-gray-400 hidden xl:inline">({row.description})</span>
                                    )}
                                </div>,
                                <Badge color={typeBadgeColor(row.accountType)}>{row.accountType}</Badge>,
                                sysTag ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                                        <ShieldCheck size={11} className="text-teal-600" />
                                        {sysTag}
                                    </span>
                                ) : (
                                    <span className="text-gray-300 text-xs">—</span>
                                ),
                                row.parent ? (
                                    <span className="text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                                        {row.parent.code} – {row.parent.name}
                                    </span>
                                ) : (
                                    <span className="text-gray-300 text-xs">—</span>
                                ),
                            ]}
                            actions={tableActions}
                            onRowClick={(item) => openEdit(item)}
                        />
                    );
                })}
                {!isLoading && filteredAccounts.length === 0 && (
                    <NoRecords colSpan={7} message="Hech qanday hisob topilmadi. Standart hisoblar rejasini yuklash uchun 'Seed Defaults' tugmasini bosing." />
                )}
                {isLoading && (
                    <tr>
                        <td className="text-center py-6" colSpan={7}><LoaderSpinner /></td>
                    </tr>
                )}
            </Table>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-gray-100" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b pb-3 mb-4">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Layers size={18} className="text-teal-600" />
                                {editingId ? "Hisobni tahrirlash" : "Yangi Buxgalteriya Hisobi (Account)"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Hisob kodi (Code) *</label>
                                    <input
                                        type="text"
                                        value={form.code}
                                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 font-mono"
                                        placeholder="Masalan: 1010, 4010, 6010"
                                        required
                                        disabled={!!editingId}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Turi (Type) *</label>
                                    <select
                                        value={form.accountType}
                                        onChange={(e) => setForm({ ...form, accountType: e.target.value as AccountType })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                                        required
                                    >
                                        <option value="ASSET">ASSET (Aktiv)</option>
                                        <option value="LIABILITY">LIABILITY (Majburiyat)</option>
                                        <option value="EQUITY">EQUITY (Kapital)</option>
                                        <option value="INCOME">INCOME (Daromad)</option>
                                        <option value="EXPENSE">EXPENSE (Xarajat)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Hisob nomi (Name) *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                                    placeholder="Masalan: Milliy valyutadagi hisob-kitob hisobvaragʻi"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Yuqori / Asosiy Hisob (Parent Account)</label>
                                <select
                                    value={form.parentId}
                                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="">— Asosiy hisob (None) —</option>
                                    {accounts
                                        .filter((a) => a.accountType === form.accountType && a.id !== editingId)
                                        .map((a) => (
                                            <option key={a.id} value={a.id}>{a.code} – {a.name}</option>
                                        ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Izoh / Tavsif</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                                    rows={2}
                                    placeholder="Hisob haqida qoʻshimcha maʼlumot..."
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <Button variant="white" size="sm" onClick={() => setShowModal(false)}>
                                    Bekor qilish
                                </Button>
                                <Button type="submit" size="sm" disabled={submitting}>
                                    {submitting ? "Saqlanmoqda…" : "Saqlash"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title="Hisobni oʻchirish"
                message={`Haqiqatan ham ${deleteItem?.code} – ${deleteItem?.name} hisobini oʻchirmoqchimisiz?`}
            />
        </div>
    );
};

export default ChartOfAccountsList;
