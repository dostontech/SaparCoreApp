import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { Building, Scale } from "lucide-react";

import type { RootState } from "@store/index";
import Constants from "@constants/api";
import { Button, Badge } from "@components/ui";
import { PageHeader } from "@/context/PageHeaderContext";
import DateInput from "@components/admin/DateInput";
import LoaderSpinner from "@components/admin/LoaderSpinner";
import { ymdStringToDate, dateToYmdString } from "@utils/converters";
import useDateFormatter from "@hooks/useDateFormatter";

interface ContactSummary {
    contact: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
        taxNumber?: string;
        type: string;
    };
    receivableBalance: number;
    payableBalance: number;
    maxSettlableAmount: number;
    isEligibleForContra: boolean;
    unpaidInvoicesCount: number;
    unpaidExpensesCount: number;
}

interface OpenInvoice {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
}

interface OpenExpense {
    id: string;
    expenseNumber: string;
    expenseDate: string;
    amount: number;
    paidAmount: number;
    remainingAmount: number;
    category?: { name: string };
}

const today = (): string => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const formatNumber = (n: number): string =>
    Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CreateContra: React.FC = () => {
    const navigate = useNavigate();
    const { formatDate } = useDateFormatter();
    const { token } = useSelector((state: RootState) => state.auth);

    const [contacts, setContacts] = useState<ContactSummary[]>([]);
    const [selectedContactId, setSelectedContactId] = useState<string>("");
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [contraDate, setContraDate] = useState<string>(today());
    const [settlementAmount, setSettlementAmount] = useState<string>("");
    const [remarks, setRemarks] = useState<string>("");

    const [invoices, setInvoices] = useState<OpenInvoice[]>([]);
    const [expenses, setExpenses] = useState<OpenExpense[]>([]);
    const [totalReceivable, setTotalReceivable] = useState(0);
    const [totalPayable, setTotalPayable] = useState(0);
    const [maxSettlable, setMaxSettlable] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // Fetch eligible contacts
    useEffect(() => {
        (async () => {
            try {
                const resp = await axios.get(Constants.FETCH_CONTRA_CONTACTS_URL, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setContacts(resp.data?.data?.contacts ?? []);
            } catch (err) {
                console.error("Failed to fetch contra contacts:", err);
                toast.error("Hamkorlar roʻyxatini yuklashda xatolik yuz berdi");
            }
        })();
    }, [token]);

    // When contact changes, load invoice & bill details
    useEffect(() => {
        if (!selectedContactId) {
            setInvoices([]);
            setExpenses([]);
            setTotalReceivable(0);
            setTotalPayable(0);
            setMaxSettlable(0);
            setSettlementAmount("");
            return;
        }

        (async () => {
            try {
                setLoadingDetails(true);
                const resp = await axios.get(`${Constants.FETCH_CONTRA_CONTACT_DETAILS_URL}/${selectedContactId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const d = resp.data?.data;
                setInvoices(d?.invoices ?? []);
                setExpenses(d?.expenses ?? []);
                setTotalReceivable(d?.totalReceivable ?? 0);
                setTotalPayable(d?.totalPayable ?? 0);
                setMaxSettlable(d?.maxSettlable ?? 0);
                setSettlementAmount(String(d?.maxSettlable ?? 0));
            } catch (err) {
                console.error("Failed to load contact details:", err);
                toast.error("Tanlangan hamkorning hisob-fakturalari va xaridlarini yuklashda xatolik");
            } finally {
                setLoadingDetails(false);
            }
        })();
    }, [selectedContactId, token]);

    const numAmount = parseFloat(settlementAmount) || 0;
    const isValidAmount = numAmount > 0 && numAmount <= (maxSettlable || 1000000000000);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedContactId || !isValidAmount) {
            toast.error("Iltimos, toʻgʻri hamkor va qoplanadigan summani kiriting");
            return;
        }

        try {
            setSubmitting(true);

            // Calculate FIFO allocation for invoices
            let remainingInv = numAmount;
            const invoiceAllocations = [];
            for (const inv of invoices) {
                if (remainingInv <= 0) break;
                const alloc = Math.min(remainingInv, inv.remainingAmount);
                invoiceAllocations.push({ invoiceId: inv.id, amount: alloc });
                remainingInv -= alloc;
            }

            // Calculate FIFO allocation for expenses
            let remainingExp = numAmount;
            const expenseAllocations = [];
            for (const exp of expenses) {
                if (remainingExp <= 0) break;
                const alloc = Math.min(remainingExp, exp.remainingAmount);
                expenseAllocations.push({ expenseId: exp.id, amount: alloc });
                remainingExp -= alloc;
            }

            const payload = {
                contactId: selectedContactId,
                date: contraDate,
                amount: numAmount,
                remarks: remarks || undefined,
                invoiceAllocations,
                expenseAllocations,
            };

            const resp = await axios.post(Constants.CREATE_CONTRA_URL, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success(resp.data?.message ?? "Oʻzaro hisob-kitob (Vzaimozachet) muvaffaqiyatli amalga oshirildi!");
            navigate("/admin/accounting/contras");
        } catch (err) {
            const msg = axios.isAxiosError(err)
                ? (err.response?.data as { message?: string } | undefined)?.message
                : null;
            console.error("Contra failed:", err);
            toast.error(msg ?? "Vzaimozachetni amalga oshirishda xatolik yuz berdi");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-5">
            <PageHeader title="Yangi Oʻzaro Hisob-kitob (Vzaimozachet)">
                <div className="flex items-center gap-2">
                    <Button variant="white" size="sm" onClick={() => navigate("/admin/accounting/contras")}>
                        Bekor qilish
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={!isValidAmount || submitting}
                    >
                        {submitting ? "Oʻtkazilmoqda…" : "Oʻzaro Hisob-kitobni Tasdiqlash"}
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left Column: Form Parameters */}
                <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm h-fit">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                        <Building size={16} className="text-teal-600" />
                        1. Hamkor va Parametrlar
                    </h3>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Kontragent (Hamkor) *</label>
                        <select
                            value={selectedContactId}
                            onChange={(e) => setSelectedContactId(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 bg-white"
                            required
                        >
                            <option value="">— Kontragentni tanlang —</option>
                            {contacts.map((c) => (
                                <option key={c.contact.id} value={c.contact.id}>
                                    {c.contact.name} {c.contact.taxNumber ? `(STIR: ${c.contact.taxNumber})` : ""}
                                    {c.isEligibleForContra ? " ⚡ Qoplash mumkin" : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <DateInput
                            label="Operatsiya Sanasi *"
                            isRequired
                            value={ymdStringToDate(contraDate)}
                            onChange={(date) => setContraDate(dateToYmdString(date))}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Qoplanadigan Summa (soʻm) *</label>
                        <input
                            type="number"
                            step="0.01"
                            min="1"
                            value={settlementAmount}
                            onChange={(e) => setSettlementAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono font-bold text-teal-900 focus:ring-2 focus:ring-teal-500"
                            required
                        />
                        {maxSettlable > 0 && (
                            <div className="flex justify-between items-center mt-1 text-[11px] text-gray-500">
                                <span>Maksimal qoplash mumkin:</span>
                                <button
                                    type="button"
                                    onClick={() => setSettlementAmount(String(maxSettlable))}
                                    className="font-bold text-teal-600 hover:underline cursor-pointer"
                                >
                                    {formatNumber(maxSettlable)} soʻm
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Izoh / Asos (Remarks)</label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500"
                            rows={3}
                            placeholder="Oʻzaro hisob-kitob dalolatnomasi asosida hisobdan chiqarildi..."
                        />
                    </div>

                    {/* Provodka preview */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                        <div className="font-semibold text-gray-700 flex items-center gap-1.5">
                            <Scale size={13} className="text-teal-600" />
                            Generatsiya qilinadigan provodka:
                        </div>
                        <div className="font-mono text-[11px] text-gray-800 bg-white p-2 rounded border border-gray-100 space-y-1">
                            <div className="text-emerald-700 font-semibold">
                                Debit 6010 (Majburiyat kamayishi): {formatNumber(numAmount)} UZS
                            </div>
                            <div className="text-blue-700 font-semibold">
                                Credit 4010 (Talab kamayishi): {formatNumber(numAmount)} UZS
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Comparative Tables */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Summary Balance Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <span className="text-xs text-gray-500 block mb-1">Mijoz sifatida qarzi (Debitorlik / 4010):</span>
                            <span className="text-base font-bold font-mono text-blue-700">{formatNumber(totalReceivable)} soʻm</span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <span className="text-xs text-gray-500 block mb-1">Yetkazib beruvchi qarzi (Kreditorlik / 6010):</span>
                            <span className="text-base font-bold font-mono text-purple-700">{formatNumber(totalPayable)} soʻm</span>
                        </div>
                        <div className="bg-gradient-to-br from-teal-500 to-teal-700 text-white p-4 rounded-2xl shadow-sm">
                            <span className="text-xs text-teal-100 block mb-1">Oʻzaro Qoplanadigan Summa:</span>
                            <span className="text-lg font-black font-mono">{formatNumber(maxSettlable)} soʻm</span>
                        </div>
                    </div>

                    {loadingDetails && (
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
                            <LoaderSpinner />
                            <span className="text-xs text-gray-500 block mt-2">Hujjatlar yuklanmoqda...</span>
                        </div>
                    )}

                    {!loadingDetails && selectedContactId && (
                        <div className="space-y-4">
                            {/* Open Invoices Table */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
                                <h4 className="text-xs font-bold text-gray-800 flex items-center justify-between">
                                    <span>📄 Toʻlanmagan Hisob-fakturalar (Sales Invoices / Debitorlik)</span>
                                    <Badge color="info">{invoices.length} ta</Badge>
                                </h4>
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <table className="w-full text-xs border-collapse">
                                        <thead className="bg-slate-50 text-gray-700 font-semibold border-b">
                                            <tr>
                                                <th className="text-left px-3 py-2">Faktura #</th>
                                                <th className="text-left px-3 py-2">Sana</th>
                                                <th className="text-right px-3 py-2">Jami Summa</th>
                                                <th className="text-right px-3 py-2">Qoldiq Qarz</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {invoices.map((inv) => (
                                                <tr key={inv.id} className="hover:bg-slate-50">
                                                    <td className="px-3 py-2 font-mono font-bold text-teal-800">{inv.invoiceNumber}</td>
                                                    <td className="px-3 py-2">{formatDate(inv.invoiceDate)}</td>
                                                    <td className="px-3 py-2 text-right font-mono">{formatNumber(inv.totalAmount)}</td>
                                                    <td className="px-3 py-2 text-right font-mono font-bold text-blue-700">{formatNumber(inv.remainingAmount)}</td>
                                                </tr>
                                            ))}
                                            {invoices.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-4 text-gray-400">Ochiq hisob-fakturalar mavjud emas</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Open Expenses/Bills Table */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
                                <h4 className="text-xs font-bold text-gray-800 flex items-center justify-between">
                                    <span>📦 Toʻlanmagan Xaridlar va Xarajatlar (Purchase Bills / Kreditorlik)</span>
                                    <Badge color="warning">{expenses.length} ta</Badge>
                                </h4>
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <table className="w-full text-xs border-collapse">
                                        <thead className="bg-slate-50 text-gray-700 font-semibold border-b">
                                            <tr>
                                                <th className="text-left px-3 py-2">Xarid #</th>
                                                <th className="text-left px-3 py-2">Sana</th>
                                                <th className="text-left px-3 py-2">Kategoriya</th>
                                                <th className="text-right px-3 py-2">Jami Summa</th>
                                                <th className="text-right px-3 py-2">Qoldiq Qarz</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {expenses.map((exp) => (
                                                <tr key={exp.id} className="hover:bg-slate-50">
                                                    <td className="px-3 py-2 font-mono font-bold text-purple-800">{exp.expenseNumber}</td>
                                                    <td className="px-3 py-2">{formatDate(exp.expenseDate)}</td>
                                                    <td className="px-3 py-2 text-gray-600">{exp.category?.name ?? "Umumiy"}</td>
                                                    <td className="px-3 py-2 text-right font-mono">{formatNumber(exp.amount)}</td>
                                                    <td className="px-3 py-2 text-right font-mono font-bold text-purple-700">{formatNumber(exp.remainingAmount)}</td>
                                                </tr>
                                            ))}
                                            {expenses.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-4 text-gray-400">Ochiq xaridlar mavjud emas</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateContra;
