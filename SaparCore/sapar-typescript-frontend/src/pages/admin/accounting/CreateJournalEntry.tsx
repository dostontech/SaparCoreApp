import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Trash2, Scale, RefreshCw } from "lucide-react";

import type { RootState } from "@store/index";
import Constants from "@constants/api";
import type { Account } from "@models/accounting";
import { Button, Badge } from "@components/ui";
import { PageHeader } from "@/context/PageHeaderContext";
import DateInput from "@components/admin/DateInput";
import { ymdStringToDate, dateToYmdString } from "@utils/converters";

interface LineDraft {
    accountId: string;
    debit: string;
    credit: string;
    description: string;
}

interface ContactOption {
    id: string;
    name: string;
    type?: string;
    taxNumber?: string;
}

const emptyLine = (): LineDraft => ({ accountId: "", debit: "", credit: "", description: "" });

const today = (): string => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const CURRENCIES = [
    { code: "UZS", symbol: "soʻm", rate: 1 },
    { code: "USD", symbol: "$", rate: 12850 },
    { code: "EUR", symbol: "€", rate: 13900 },
    { code: "RUB", symbol: "₽", rate: 140 },
];

const CreateJournalEntry: React.FC = () => {
    const navigate = useNavigate();
    const { token } = useSelector((state: RootState) => state.auth);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [contacts, setContacts] = useState<ContactOption[]>([]);
    const [selectedContactId, setSelectedContactId] = useState<string>("");
    const [entryDate, setEntryDate] = useState<string>(today());
    const [description, setDescription] = useState<string>("");
    const [reference, setReference] = useState<string>("");
    const [currencyCode, setCurrencyCode] = useState<string>("UZS");
    const [exchangeRate, setExchangeRate] = useState<string>("1");
    const [lines, setLines] = useState<LineDraft[]>([emptyLine(), emptyLine()]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const [accResp, contResp] = await Promise.all([
                    axios.get(Constants.GET_ACCOUNTS_URL, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(Constants.GET_CUSTOMERS_WITH_SEARCH_URL, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { data: { customers: [] } } })),
                ]);
                setAccounts(accResp.data?.data?.accounts ?? []);
                setContacts(contResp.data?.data?.customers ?? contResp.data?.data ?? []);
            } catch (err) {
                console.error("Failed to load accounting data:", err);
                toast.error("Hisoblar maʼlumotlarini yuklashda xatolik yuz berdi");
            }
        })();
    }, [token]);

    const handleCurrencyChange = (curr: string) => {
        setCurrencyCode(curr);
        const found = CURRENCIES.find((c) => c.code === curr);
        if (found) {
            setExchangeRate(String(found.rate));
        }
    };

    const totalDebit = useMemo(() => lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0), [lines]);
    const totalCredit = useMemo(() => lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0), [lines]);
    const difference = Math.abs(totalDebit - totalCredit);
    const isBalanced = difference < 0.01 && totalDebit > 0;
    const hasMinLines = lines.length >= 2;
    const allAccountsSelected = lines.every((l) => !!l.accountId);
    const canSave = isBalanced && hasMinLines && allAccountsSelected && !submitting;

    const updateLine = (idx: number, patch: Partial<LineDraft>) => {
        setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
    };

    const addLine = () => setLines((prev) => [...prev, emptyLine()]);

    const removeLine = (idx: number) => {
        setLines((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== idx)));
    };

    // Auto-balance helper
    const autoBalanceLastLine = () => {
        if (lines.length < 2) return;
        const lastIdx = lines.length - 1;
        const otherDebit = lines.slice(0, lastIdx).reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
        const otherCredit = lines.slice(0, lastIdx).reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);

        if (otherDebit > otherCredit) {
            updateLine(lastIdx, { credit: (otherDebit - otherCredit).toFixed(2), debit: "" });
            toast.info(`Balanslandi: Kreditga ${(otherDebit - otherCredit).toFixed(2)} qoʻshildi`);
        } else if (otherCredit > otherDebit) {
            updateLine(lastIdx, { debit: (otherCredit - otherDebit).toFixed(2), credit: "" });
            toast.info(`Balanslandi: Debitga ${(otherCredit - otherDebit).toFixed(2)} qoʻshildi`);
        }
    };

    const handleSave = async () => {
        if (!canSave) return;
        try {
            setSubmitting(true);
            const contactObj = contacts.find((c) => c.id === selectedContactId);
            const finalDesc = selectedContactId && contactObj
                ? `${description ? description + " — " : ""}[Kontragent: ${contactObj.name}]`
                : description;

            const payload = {
                entryDate,
                description: finalDesc || null,
                reference: reference || null,
                currencyCode: currencyCode !== "UZS" ? currencyCode : null,
                exchangeRate: currencyCode !== "UZS" ? parseFloat(exchangeRate) || 1 : 1,
                lines: lines.map((l) => ({
                    accountId: l.accountId,
                    debit: parseFloat(l.debit) || 0,
                    credit: parseFloat(l.credit) || 0,
                    description: l.description || null,
                })),
            };
            await axios.post(Constants.CREATE_JOURNAL_ENTRY_URL, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Buxgalteriya provodkasi (Journal Entry) muvaffaqiyatli saqlandi");
            navigate("/admin/accounting/journal-entries");
        } catch (err) {
            const msg = axios.isAxiosError(err)
                ? (err.response?.data as { message?: string } | undefined)?.message
                : null;
            console.error("Save failed:", err);
            toast.error(msg ?? "Provodkani saqlashda xatolik yuz berdi");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-5">
            <PageHeader title="Yangi Buxgalteriya Provodkasi">
                <div className="flex items-center gap-2">
                    <Button variant="white" size="sm" onClick={() => navigate("/admin/accounting/journal-entries")}>
                        Bekor qilish
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={!canSave}
                    >
                        {submitting ? "Saqlanmoqda…" : "Provodkani Oʻtkazish"}
                    </Button>
                </div>
            </PageHeader>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b border-gray-100">
                    <div>
                        <DateInput
                            label="Sana"
                            isRequired
                            value={ymdStringToDate(entryDate)}
                            onChange={(date) => setEntryDate(dateToYmdString(date))}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Kontragent / Hamkor</label>
                        <select
                            value={selectedContactId}
                            onChange={(e) => setSelectedContactId(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 bg-white"
                        >
                            <option value="">— Ixtiyoriy (Tanlanmagan) —</option>
                            {contacts.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} {c.taxNumber ? `(STIR: ${c.taxNumber})` : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Hujjat raqami / Asos</label>
                        <input
                            type="text"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 font-mono"
                            placeholder="Masalan: SH-2026/01, FAK-884"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Valyuta</label>
                            <select
                                value={currencyCode}
                                onChange={(e) => handleCurrencyChange(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm font-semibold text-teal-800 bg-teal-50 border-teal-200"
                            >
                                {CURRENCIES.map((c) => (
                                    <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Kurs (UZS)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={exchangeRate}
                                onChange={(e) => setExchangeRate(e.target.value)}
                                disabled={currencyCode === "UZS"}
                                className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm text-right font-mono disabled:bg-gray-100 disabled:text-gray-400"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-4">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Operatsiya Mazmuni</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                            placeholder="Masalan: Korxona hisob raqamidan yetkazib beruvchiga toʻlov oʻtkazildi..."
                        />
                    </div>
                </div>

                <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Scale size={16} className="text-teal-600" />
                            Debet va Kredit Yozuvlari Jadvali
                        </h2>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="white"
                                onClick={autoBalanceLastLine}
                                leftIcon={<RefreshCw size={13} />}
                                disabled={isBalanced}
                            >
                                Avtomatik Balanslash
                            </Button>
                            <Button size="sm" onClick={addLine} leftIcon={<Plus size={14} />}>
                                Qator qoʻshish
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-slate-50 text-xs font-semibold text-gray-700 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-3 py-2.5 min-w-[280px]">Buxgalteriya Hisobi (Kod va Nomi)</th>
                                    <th className="text-right px-3 py-2.5 w-40">Debet ({currencyCode})</th>
                                    <th className="text-right px-3 py-2.5 w-40">Kredit ({currencyCode})</th>
                                    <th className="text-left px-3 py-2.5 min-w-[200px]">Qator izohi</th>
                                    <th className="w-12 text-center px-2 py-2.5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lines.map((line, idx) => (
                                    <tr key={idx} className="hover:bg-teal-50/20 transition-colors">
                                        <td className="p-2">
                                            <select
                                                value={line.accountId}
                                                onChange={(e) => updateLine(idx, { accountId: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-teal-500 bg-white"
                                            >
                                                <option value="">— Hisobni tanlang —</option>
                                                {accounts.map((a) => (
                                                    <option key={a.id} value={a.id}>
                                                        {a.code} – {a.name} [{a.accountType}]
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={line.debit}
                                                onChange={(e) => updateLine(idx, { debit: e.target.value, credit: e.target.value ? "" : line.credit })}
                                                placeholder="0.00"
                                                className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-right font-semibold text-gray-900 focus:ring-2 focus:ring-teal-500"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={line.credit}
                                                onChange={(e) => updateLine(idx, { credit: e.target.value, debit: e.target.value ? "" : line.debit })}
                                                placeholder="0.00"
                                                className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-right font-semibold text-gray-900 focus:ring-2 focus:ring-teal-500"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="text"
                                                value={line.description}
                                                onChange={(e) => updateLine(idx, { description: e.target.value })}
                                                placeholder="Operatsiya tafsiloti..."
                                                className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:ring-2 focus:ring-teal-500"
                                            />
                                        </td>
                                        <td className="p-2 text-center">
                                            <button
                                                type="button"
                                                disabled={lines.length <= 2}
                                                onClick={() => removeLine(idx)}
                                                className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-300 transition-colors"
                                                title={lines.length <= 2 ? "Kamida 2 ta qator boʻlishi shart" : "Qatorni oʻchirish"}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-100 font-semibold border-t-2 border-slate-300">
                                    <td className="px-3 py-3 text-right text-xs uppercase tracking-wider text-gray-600">Jami (Totals):</td>
                                    <td className="px-3 py-3 text-right font-mono text-sm text-gray-900">
                                        {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-3 py-3 text-right font-mono text-sm text-gray-900">
                                        {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-3 py-3" colSpan={2}>
                                        <div className="flex items-center gap-2">
                                            <Badge color={isBalanced ? "success" : "danger"}>
                                                {isBalanced ? "✓ Balanslangan (Teng)" : `⚠️ Balanslanmagan (Farq: ${difference.toFixed(2)})`}
                                            </Badge>
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                        * Oʻzbekiston milliy buxgalteriya qonunchiligi (BHMS) boʻyicha jami Debit va jami Kredit summalari qatʼiy teng boʻlishi lozim.
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="white"
                            onClick={() => navigate("/admin/accounting/journal-entries")}
                        >
                            Bekor qilish
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!canSave}
                        >
                            {submitting ? "Saqlanmoqda…" : "Provodkani Tasdiqlash va Saqlash"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateJournalEntry;
