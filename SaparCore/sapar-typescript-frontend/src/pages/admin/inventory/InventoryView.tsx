import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileDownIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import Constants from "@constants/api";
import type { RootState } from "@store/index";
import type { InventoryHistoryData } from "@models/inventory";
import { PageHeader } from "@/context/PageHeaderContext";
import { Badge, Button, Card } from "@components/ui";
import LoaderSpinner from "@components/admin/LoaderSpinner";
import NoRecords from "@components/admin/NoRecords";
import useDateFormatter from "@hooks/useDateFormatter";
import { useCurrencies } from "@hooks/useCurrencies";

// Friendly source label — distinguishes sales return from purchase return
const getRefTypeLabel = (
    ref: string | null | undefined,
    notes: string | null | undefined,
    t: (key: string, fallback: string) => string
): string => {
    switch (ref) {
        case "purchase": return t("inventory.typePurchase", "Xarid (Kirim)");
        case "invoice": return t("inventory.typeSale", "Sotuv (Chiqim)");
        case "sales_return": return t("inventory.typeSalesReturn", "Mijozdan qaytish");
        case "purchase_return": return t("inventory.typePurchaseReturn", "Taʼminotchiga qaytarish");
        case "return_": return t("inventory.typeReturn", "Qaytarish");
        case "adjustment": return t("inventory.typeAdjustment", "Tuzatish / Inventarizatsiya");
        default: return ref || notes || "—";
    }
};

const getAdjustmentDisplay = (adj: number) => {
    if (adj > 0) return <span className="text-success font-semibold">+{adj}</span>;
    if (adj < 0) return <span className="text-danger font-semibold">{adj}</span>;
    return "—";
};

const InventoryView: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useSelector((state: RootState) => state.auth);
    const { formatDateTime } = useDateFormatter();
    const { formatMoney } = useCurrencies();

    const [data, setData] = useState<InventoryHistoryData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [notFound, setNotFound] = useState<boolean>(false);

    const fetchHistory = useCallback(async (inventoryId: string) => {
        try {
            setIsLoading(true);
            setNotFound(false);
            const activeToken = token || localStorage.getItem("token") || localStorage.getItem("authToken") || "";
            const response = await axios.get(
                `${Constants.FETCH_INVENTORY_HISTORY_URL}/${inventoryId}`,
                { headers: { Authorization: `Bearer ${activeToken}` } },
            );
            setData(response.data.data);
        } catch (error) {
            console.error("Error fetching inventory history:", error);
            setNotFound(true);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (id) fetchHistory(id);
    }, [id, fetchHistory]);

    const handleDownloadPDF = useCallback(() => {
        if (!data) return;
        const doc = new jsPDF();
        const rawName = data.productId?.name ?? "";
        const productName = rawName ? rawName[0].toUpperCase() + rawName.slice(1) : "";
        doc.text(`${t("inventory.title", "Ombor qoldiqlari")} - ${productName}`, 14, 10);
        autoTable(doc, {
            head: [[
                t("inventory.date", "Sana"),
                t("common.type", "Turi"),
                t("inventory.adjustment", "Oʻzgarish"),
                t("inventory.stockAfter", "Keyingi qoldiq"),
                t("common.notes", "Izohlar")
            ]],
            body: data.history.map((h) => {
                const adj = Number(h.adjustment ?? 0);
                const stockAfter = Number(h.quantity ?? 0) + adj;
                return [
                    formatDateTime(h.createdAt),
                    getRefTypeLabel(h.referenceType, h.notes, t),
                    adj > 0 ? `+${adj}` : adj || "—",
                    stockAfter,
                    h.notes || "—",
                ];
            }),
        });
        doc.save(`Ombor_${data.productId?.code || "Tarix"}.pdf`);
    }, [data, formatDateTime, t]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoaderSpinner />
            </div>
        );
    }

    if (notFound || !data) {
        return (
            <div className="space-y-4">
                <PageHeader title={t("inventory.title", "Ombor qoldiqlari")}>
                    <Button variant="white" onClick={() => navigate("/admin/inventory")}>
                        {t("common.back", "Orqaga")}
                    </Button>
                </PageHeader>
                <Card>
                    <div className="py-10 text-center text-gray-500">
                        {t("inventory.itemNotFound", "Ombor tovari topilmadi.")}
                    </div>
                </Card>
            </div>
        );
    }

    // Default to UZS (so'm) if currency code is not explicitly set
    const currency = data.currencyCode || data.productId?.currencyCode || "UZS";
    const current = Number(data.currentQuantity ?? 0);
    const qtyOnHand = data.quantityOnHand != null ? Number(data.quantityOnHand) : null;
    const avgCost = data.avgCost != null ? Number(data.avgCost) : null;
    const alertQty = data.alertQuantity != null ? Number(data.alertQuantity) : null;
    const stockForValue = qtyOnHand != null ? qtyOnHand : current;
    const stockValue = avgCost != null ? stockForValue * avgCost : null;
    const isLowStock = alertQty != null && current <= alertQty;

    const detail = (label: string, value: React.ReactNode) => (
        <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
            <div className="text-sm font-semibold text-gray-950">{value}</div>
        </div>
    );

    return (
        <div className="space-y-4">
            <PageHeader
                title={
                    <span className="inline-flex items-baseline gap-2">
                        <span className="capitalize">{data.productId?.name || t("inventory.product", "Mahsulot")}</span>
                        {data.productId?.code && (
                            <span className="text-sm font-normal text-gray-500">{data.productId.code}</span>
                        )}
                    </span>
                }
            >
                <Button
                    variant="white"
                    onClick={handleDownloadPDF}
                    leftIcon={<FileDownIcon size={14} />}
                >
                    {t("inventory.downloadPdf", "PDF yuklab olish")}
                </Button>
                <Button variant="white" onClick={() => navigate("/admin/inventory")}>
                    {t("common.back", "Orqaga")}
                </Button>
            </PageHeader>

            {/* Details Card */}
            <Card title={t("inventory.stockDetails", "Ombor tafsilotlari")}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {detail(t("inventory.product", "Mahsulot"), data.productId?.name || "—")}
                    {detail(t("inventory.code", "Mahsulot kodi"), data.productId?.code || "—")}
                    {detail(
                        t("inventory.currentStock", "Joriy qoldiq"),
                        <span className="inline-flex items-center gap-2">
                            {qtyOnHand != null ? qtyOnHand : current}
                            {isLowStock && (
                                <Badge color="danger" variant="soft">
                                    {t("inventory.lowStock", "Kam qolgan")}
                                </Badge>
                            )}
                        </span>,
                    )}
                    {detail(t("inventory.valuationMethod", "Baholash usuli"), data.valuationMethod || "WAC")}
                    {detail(t("inventory.averageCost", "Oʻrtacha tannarx"), avgCost != null ? formatMoney(avgCost, currency) : "—")}
                    {detail(t("inventory.stockValue", "Ombor zaxirasi qiymati"), stockValue != null ? formatMoney(stockValue, currency) : "—")}
                    {detail(t("inventory.alertQty", "Ogohlantirish miqdori"), alertQty != null ? alertQty : "—")}
                    {detail(t("inventory.unit", "Oʻlchov birligi"), data.productId?.unitName || "—")}
                </div>
            </Card>

            {/* Activity History Card */}
            <Card title={t("inventory.activityHistory", "Harakatlar tarixi")} padded={false}>
                <div className="overflow-x-auto border border-border rounded-control">
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-gray-100 text-xs uppercase text-body">
                            <tr>
                                <th className="px-4 py-3 text-left border-b border-border">{t("inventory.date", "Sana")}</th>
                                <th className="px-4 py-3 text-left border-b border-border">{t("common.type", "Turi")}</th>
                                <th className="px-4 py-3 text-center border-b border-border">{t("inventory.adjustment", "Oʻzgarish")}</th>
                                <th className="px-4 py-3 text-center border-b border-border">{t("inventory.stockAfter", "Keyingi qoldiq")}</th>
                                <th className="px-4 py-3 text-left border-b border-border">{t("common.notes", "Izohlar")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.history.length === 0 ? (
                                <NoRecords colSpan={5} message={t("inventory.noHistory", "Harakatlar tarixi topilmadi.")} />
                            ) : (
                                data.history.map((h) => {
                                    const adj = Number(h.adjustment ?? 0);
                                    const stockAfter = Number(h.quantity ?? 0) + adj;
                                    return (
                                        <tr key={h.id} className="border-b border-border hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-600">{formatDateTime(h.createdAt)}</td>
                                            <td className="px-4 py-3 text-gray-600 capitalize">{getRefTypeLabel(h.referenceType, h.notes, t)}</td>
                                            <td className="px-4 py-3 text-center">{getAdjustmentDisplay(adj)}</td>
                                            <td className="px-4 py-3 text-gray-950 font-medium text-center">{stockAfter}</td>
                                            <td className="px-4 py-3 text-gray-600">{h.notes || "—"}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default InventoryView;
