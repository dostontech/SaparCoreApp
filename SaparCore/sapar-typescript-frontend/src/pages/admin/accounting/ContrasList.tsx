import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { CirclePlusIcon, Eye, ArrowLeftRight, CheckCircle2 } from "lucide-react";

import type { RootState } from "@store/index";
import Constants from "@constants/api";
import Table from "@components/admin/Table";
import TableRow from "@components/admin/TableRow";
import type { Action } from "@components/admin/tableActions";
import PaginationWrapper from "@components/admin/PaginationWrapper";
import LoaderSpinner from "@components/admin/LoaderSpinner";
import NoRecords from "@components/admin/NoRecords";
import { Button } from "@components/ui";
import useDateFormatter from "@hooks/useDateFormatter";
import { PageHeader } from "@/context/PageHeaderContext";

interface ContraItem {
    id: string;
    contraNumber: string;
    reference?: string;
    date: string;
    description: string;
    amount: number;
    lines: any[];
    status: string;
}

const formatNumber = (n: number): string =>
    Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ContrasList: React.FC = () => {
    const { formatDate } = useDateFormatter();
    const { token } = useSelector((state: RootState) => state.auth);
    const [contras, setContras] = useState<ContraItem[]>([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(false);
    const [viewing, setViewing] = useState<ContraItem | null>(null);

    const fetchContras = async () => {
        try {
            setIsLoading(true);
            const resp = await axios.get(Constants.FETCH_CONTRAS_URL, {
                params: { page: pagination.page, limit: pagination.limit },
                headers: { Authorization: `Bearer ${token}` },
            });
            setContras(resp.data?.data?.contras ?? []);
            setPagination(resp.data?.data?.pagination ?? { total: 0, page: 1, limit: 10, totalPages: 1 });
        } catch (err) {
            console.error("Failed to fetch contras:", err);
            toast.error("Oʻzaro hisob-kitoblar (Contras) roʻyxatini yuklashda xatolik");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContras();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, pagination.limit]);

    const tableActions: Action<ContraItem>[] = [
        {
            label: "Koʻrish",
            icon: <Eye size={14} />,
            onClick: (row: ContraItem) => setViewing(row),
        },
    ];

    const headers = ["#", "Hujjat №", "Sana", "Mazmuni", "Qoplangan Summa (UZS)", "Holati", "Amallar"];

    return (
        <div className="space-y-4">
            <PageHeader title="Oʻzaro Hisob-kitoblar (Vzaimozachet)">
                <div className="flex items-center gap-2">
                    <Link
                        to="/admin/accounting/contras/new"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm"
                    >
                        <CirclePlusIcon size={15} /> Yangi Oʻzaro Hisob-kitob
                    </Link>
                </div>
            </PageHeader>

            {/* Info alert */}
            <div className="bg-teal-50/80 border border-teal-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-teal-900">
                <ArrowLeftRight size={20} className="text-teal-600 shrink-0 mt-0.5" />
                <div>
                    <strong className="font-semibold block mb-0.5">Oʻzaro hisob-kitoblarni hisobga olish (Взаимозачет) mexanizmi:</strong>
                    Bir vaqtning oʻzida ham mijoz (debitorlik - 4010), ham yetkazib beruvchi (kreditorlik - 6010) boʻlgan hamkorlarning toʻlanmagan hisob-fakturalari va xaridlarini bir-biriga qoplash orqali toʻlovsiz hisob-kitob qilinadi hamda tegishli buxgalteriya provodkasi avtomatik oʻtkaziladi.
                </div>
            </div>

            <Table headers={headers}>
                {!isLoading && contras.map((row, idx) => (
                    <TableRow
                        key={row.id}
                        index={(pagination.page - 1) * pagination.limit + idx + 1}
                        row={row}
                        columns={[
                            <span className="font-mono font-bold text-teal-800 text-xs">{row.contraNumber}</span>,
                            formatDate(row.date),
                            <div className="max-w-[320px] truncate text-gray-800 text-xs font-medium">
                                {row.description}
                            </div>,
                            <span className="font-mono font-bold text-emerald-700 text-xs">
                                {formatNumber(row.amount)} soʻm
                            </span>,
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                                <CheckCircle2 size={11} /> Oʻtkazilgan
                            </span>,
                        ]}
                        actions={tableActions}
                        onRowClick={(item) => setViewing(item)}
                    />
                ))}
                {!isLoading && contras.length === 0 && (
                    <NoRecords colSpan={7} message="Hozircha oʻzaro hisob-kitob (vzaimozachet) operatsiyalari amalga oshirilmagan." />
                )}
                {isLoading && (
                    <tr>
                        <td className="text-center py-6" colSpan={7}><LoaderSpinner /></td>
                    </tr>
                )}
            </Table>

            <PaginationWrapper
                count={pagination.totalPages}
                page={pagination.page}
                from={(pagination.page - 1) * pagination.limit + 1}
                to={Math.min(pagination.page * pagination.limit, pagination.total)}
                total={pagination.total}
                onChange={(_, newPage) => setPagination((p) => ({ ...p, page: newPage }))}
                paginationVariant="outlined"
                paginationShape="rounded"
            />

            {/* Contra View Modal */}
            {viewing && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-gray-100 space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <ArrowLeftRight size={18} className="text-teal-600" />
                                Vzaimozachet #{viewing.contraNumber}
                            </h3>
                            <button onClick={() => setViewing(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
                        </div>
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Sana:</span>
                                <span className="font-semibold text-gray-800">{formatDate(viewing.date)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Qoplangan Summa:</span>
                                <span className="font-mono font-bold text-emerald-700 text-sm">{formatNumber(viewing.amount)} soʻm</span>
                            </div>
                            <div className="border-t pt-2">
                                <span className="text-gray-500 block mb-0.5">Mazmuni:</span>
                                <span className="font-medium text-gray-900">{viewing.description}</span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <Button variant="white" size="sm" onClick={() => setViewing(null)}>Yopish</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContrasList;
