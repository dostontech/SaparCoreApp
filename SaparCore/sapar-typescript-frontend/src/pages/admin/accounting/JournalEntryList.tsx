import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { CirclePlusIcon, Eye, Trash2Icon, RotateCcw, Scale } from "lucide-react";

import type { RootState } from "@store/index";
import Constants from "@constants/api";
import Table from "@components/admin/Table";
import TableRow from "@components/admin/TableRow";
import type { Action } from "@components/admin/tableActions";
import PaginationWrapper from "@components/admin/PaginationWrapper";
import ActiveFilterBanner, { type ActiveFilter } from "@components/admin/ActiveFilterBanner";
import LoaderSpinner from "@components/admin/LoaderSpinner";
import NoRecords from "@components/admin/NoRecords";
import DeleteConfirmationModal from "@components/admin/DeleteConfirmationModal";
import ExportButton from "@components/admin/ExportButton";
import { Button, Badge } from "@components/ui";
import useDateFormatter from "@hooks/useDateFormatter";
import { PageHeader } from "@/context/PageHeaderContext";
import type { JournalEntryRow } from "@models/accounting";

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const formatNumber = (n: number): string =>
    Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const JournalEntryList: React.FC = () => {
    const { formatDate } = useDateFormatter();
    const [searchParams, setSearchParams] = useSearchParams();
    const { token } = useSelector((state: RootState) => state.auth);
    const [entries, setEntries] = useState<JournalEntryRow[]>([]);
    const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(false);
    const [viewing, setViewing] = useState<JournalEntryRow | null>(null);
    const [viewingDetail, setViewingDetail] = useState<any>(null);
    const [deleteItem, setDeleteItem] = useState<JournalEntryRow | null>(null);
    const [reverseItem, setReverseItem] = useState<JournalEntryRow | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReversing, setIsReversing] = useState(false);

    const limit = Number(searchParams.get("limit") || 10);
    const page = Number(searchParams.get("page") || 1);
    const fromDate = searchParams.get("from") || "";
    const toDate = searchParams.get("to") || "";
    const accountId = searchParams.get("accountId") || "";
    const drillParams: Record<string, string> = {
        ...(fromDate ? { from: fromDate } : {}),
        ...(toDate ? { to: toDate } : {}),
        ...(accountId ? { accountId } : {}),
    };
    const activeFilters: ActiveFilter[] = [
        ...(fromDate ? [{ label: "Boshlanish sanasi", value: fromDate }] : []),
        ...(toDate ? [{ label: "Tugash sanasi", value: toDate }] : []),
        ...(accountId ? [{ label: "Hisob", value: "Tanlangan hisob" }] : []),
    ];
    const clearDrillFilters = () => setSearchParams({});

    const fetchEntries = async () => {
        try {
            setIsLoading(true);
            const resp = await axios.get(Constants.GET_JOURNAL_ENTRIES_URL, {
                params: { page, limit, ...drillParams },
                headers: { Authorization: `Bearer ${token}` },
            });
            setEntries(resp.data?.data?.journalEntries ?? []);
            setPagination(resp.data?.data?.pagination ?? { total: 0, page: 1, limit: 10, totalPages: 1 });
        } catch (err) {
            console.error("Failed to fetch journal entries:", err);
            toast.error("Buxgalteriya provodkalarini yuklashda xatolik yuz berdi");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, fromDate, toDate, accountId]);

    const handleView = async (row: JournalEntryRow) => {
        setViewing(row);
        setViewingDetail(null);
        try {
            const resp = await axios.get(`${Constants.GET_JOURNAL_ENTRY_URL}/${row.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setViewingDetail(resp.data?.data?.journalEntry ?? null);
        } catch (err) {
            console.error("Failed to fetch journal entry:", err);
            toast.error("Provodka tafsilotlarini yuklashda xatolik");
        }
    };

    const handleReverse = async () => {
        if (!reverseItem) return;
        try {
            setIsReversing(true);
            const resp = await axios.post(
                `${Constants.REVERSE_JOURNAL_ENTRY_URL}/${reverseItem.id}/reverse`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(resp.data?.message ?? "Storno provodkasi muvaffaqiyatli yaratildi");
            setReverseItem(null);
            await fetchEntries();
        } catch (err) {
            console.error("Reverse failed:", err);
            toast.error("Storno qilishda xatolik yuz berdi");
        } finally {
            setIsReversing(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteItem) return;
        try {
            setIsDeleting(true);
            await axios.delete(`${Constants.DELETE_JOURNAL_ENTRY_URL}/${deleteItem.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Provodka oʻchirildi");
            setDeleteItem(null);
            await fetchEntries();
        } catch (err) {
            console.error("Delete failed:", err);
            toast.error("Provodkani oʻchirishda xatolik yuz berdi");
        } finally {
            setIsDeleting(false);
        }
    };

    const tableActions: Action<JournalEntryRow>[] = [
        { label: "Koʻrish", icon: <Eye size={14} />, onClick: (row: JournalEntryRow) => { void handleView(row); } },
        {
            label: "Storno (Teskari provodka)",
            icon: <RotateCcw size={14} className="text-amber-600" />,
            onClick: (row: JournalEntryRow) => setReverseItem(row),
        },
        { label: "Oʻchirish", icon: <Trash2Icon size={14} />, primary: true, variant: "danger", onClick: (row: JournalEntryRow) => setDeleteItem(row) },
    ];

    const handlePageLengthChange = (newLimit: number) => {
        setSearchParams({ limit: String(newLimit), page: "1", ...drillParams });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams({ limit: String(limit), page: String(newPage), ...drillParams });
    };

    const headers = ["#", "Hujjat №", "Sana", "Mazmuni", "Jami Debet (UZS)", "Jami Kredit (UZS)", "Qatorlar", "Amallar"];
    const from = (pagination.page - 1) * pagination.limit + 1;
    const to = Math.min(pagination.page * pagination.limit, pagination.total);

    return (
        <div className="space-y-4">
            <PageHeader title="Jurnallar va Buxgalteriya Provodkalari">
                <div className="flex items-center gap-2">
                    <ExportButton
                        url={Constants.EXPORT_JOURNAL_ENTRIES_URL}
                        filename="journal-entries.csv"
                    />
                    <Link
                        to="/admin/accounting/journal-entries/new"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm"
                    >
                        <CirclePlusIcon size={15} /> Yangi Provodka
                    </Link>
                </div>
            </PageHeader>

            <ActiveFilterBanner filters={activeFilters} onClear={clearDrillFilters} />

            <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                <div className="text-xs text-gray-500 pl-2">
                    Jami provodkalar soni: <span className="font-bold text-gray-800">{pagination.total}</span>
                </div>
                <select
                    value={limit}
                    onChange={(e) => handlePageLengthChange(Number(e.target.value))}
                    className="border border-gray-200 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                    {[10, 25, 50, 100].map((num) => (
                        <option key={num} value={num}>{num} ta / sahifa</option>
                    ))}
                </select>
            </div>

            <Table headers={headers}>
                {!isLoading && entries.map((row, idx) => (
                    <TableRow
                        key={row.id}
                        index={(page - 1) * limit + idx + 1}
                        row={row}
                        columns={[
                            <span className="font-mono font-bold text-teal-800 text-xs">{row.entryNumber ?? "—"}</span>,
                            formatDate(row.entryDate),
                            <div className="max-w-[300px] truncate text-gray-800 text-xs font-medium">
                                {row.description ?? "—"}
                            </div>,
                            <span className="font-mono font-semibold text-gray-900 text-xs">{formatNumber(row.totalDebit)}</span>,
                            <span className="font-mono font-semibold text-gray-900 text-xs">{formatNumber(row.totalCredit)}</span>,
                            <Badge color="gray">{row.lineCount} ta</Badge>,
                        ]}
                        actions={tableActions}
                        onRowClick={(item) => { void handleView(item); }}
                    />
                ))}
                {!isLoading && entries.length === 0 && (
                    <NoRecords colSpan={8} message="Hech qanday provodka mavjud emas." />
                )}
                {isLoading && (
                    <tr>
                        <td className="text-center py-6" colSpan={8}><LoaderSpinner /></td>
                    </tr>
                )}
            </Table>

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

            {/* View Details Modal */}
            {viewing && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b pb-3 mb-4">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Scale size={18} className="text-teal-600" />
                                Provodka #{viewing.entryNumber}
                            </h3>
                            <button onClick={() => setViewing(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
                        </div>
                        {!viewingDetail && (
                            <div className="py-8 text-center"><LoaderSpinner /></div>
                        )}
                        {viewingDetail && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                    <div><span className="text-gray-400">Sana:</span> <span className="font-semibold text-gray-800">{formatDate(viewingDetail.entryDate)}</span></div>
                                    <div><span className="text-gray-400">Asos / Reference:</span> <span className="font-mono font-semibold text-gray-800">{viewingDetail.reference ?? "—"}</span></div>
                                    <div className="col-span-2"><span className="text-gray-400">Mazmuni:</span> <span className="font-medium text-gray-800">{viewingDetail.description ?? "—"}</span></div>
                                </div>
                                <div className="rounded-xl border border-gray-200 overflow-hidden">
                                    <table className="w-full text-xs border-collapse">
                                        <thead className="bg-slate-100 text-gray-700 font-semibold border-b border-gray-200">
                                            <tr>
                                                <th className="text-left px-3 py-2">Hisob (Account)</th>
                                                <th className="text-right px-3 py-2">Debit</th>
                                                <th className="text-right px-3 py-2">Credit</th>
                                                <th className="text-left px-3 py-2">Tavsif</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {(viewingDetail.lines ?? []).map((l: any) => (
                                                <tr key={l.id} className="hover:bg-slate-50">
                                                    <td className="px-3 py-2 font-mono">
                                                        <span className="font-bold text-teal-800">{l.account?.code}</span> – {l.account?.name}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-mono font-semibold text-gray-900">
                                                        {Number(l.debit ?? 0) > 0 ? Number(l.debit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-mono font-semibold text-gray-900">
                                                        {Number(l.credit ?? 0) > 0 ? Number(l.credit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-600">{l.description ?? "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end gap-2 mt-5 pt-3 border-t">
                            <Button variant="white" size="sm" onClick={() => setViewing(null)}>Yopish</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reverse (Storno) Confirmation Modal */}
            {reverseItem && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 space-y-4">
                        <div className="flex items-center gap-3 text-amber-600">
                            <RotateCcw size={22} />
                            <h3 className="text-base font-bold text-gray-900">Storno (Teskari Provodka)</h3>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Haqiqatan ham <strong className="text-gray-900">{reverseItem.entryNumber}</strong> provodkasini storno qilmoqchimisiz?
                            Tizim barcha Debit va Kredit hisoblarini almashtirib avtomatik teskari provodka yaratadi.
                        </p>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="white" size="sm" onClick={() => setReverseItem(null)} disabled={isReversing}>
                                Bekor qilish
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleReverse}
                                disabled={isReversing}
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                {isReversing ? "Storno qilinmoqda…" : "Ha, Storno qilish"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title="Provodkani oʻchirish"
                message={`Haqiqatan ham ${deleteItem?.entryNumber ?? "ushbu provodkani"} oʻchirmoqchimisiz?`}
            />
        </div>
    );
};

export default JournalEntryList;
