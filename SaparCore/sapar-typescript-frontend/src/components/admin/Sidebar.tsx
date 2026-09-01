import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
    Home,
    ShoppingCart,
    Receipt,
    ShoppingBag,
    Package,
    LandmarkIcon,
    BookOpen,
    BarChart2,
    Target,
    Users,
    Briefcase,
    Headphones,
    Settings,
    Eye,
    EyeOff,
    SlidersHorizontal,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@store/index";
import { Button } from "@components/ui";
import { PrimaryRail, type PrimaryModuleKey } from "./sidebar/PrimaryRail";
import { SecondarySubMenuPanel, type ModuleSubMenuConfig } from "./sidebar/SecondarySubMenuPanel";

// Module visibility keys for customization
export interface ModuleVisibility {
    pos: boolean;
    crm: boolean;
    sales: boolean;
    purchases: boolean;
    inventory: boolean;
    banking: boolean;
    accounting: boolean;
    reports: boolean;
    projects: boolean;
    payroll: boolean;
    helpdesk: boolean;
    settings: boolean;
}

const DEFAULT_MODULE_VISIBILITY: ModuleVisibility = {
    pos: true,
    crm: true,
    sales: true,
    purchases: true,
    inventory: true,
    banking: true,
    accounting: true,
    reports: true,
    projects: true,
    payroll: true,
    helpdesk: true,
    settings: true,
};

export function detectModuleFromPath(pathname: string): PrimaryModuleKey {
    const clean = pathname.toLowerCase();
    if (clean === "/admin" || clean === "/admin/" || clean.startsWith("/admin/business-loans")) {
        return "dashboard";
    }
    if (clean.startsWith("/admin/pos") || clean.startsWith("/admin/dashboard/pos")) {
        return "pos";
    }
    if (
        clean.startsWith("/admin/invoices") ||
        clean.startsWith("/admin/e-documents") ||
        clean.startsWith("/admin/quotations") ||
        clean.startsWith("/admin/recurring-invoices") ||
        clean.startsWith("/admin/credit-notes") ||
        clean.startsWith("/admin/delivery-challans") ||
        clean.startsWith("/admin/dashboard/sales")
    ) {
        return "sales";
    }
    if (
        clean.startsWith("/admin/expenses") ||
        clean.startsWith("/admin/purchases") ||
        clean.startsWith("/admin/purchase-orders") ||
        clean.startsWith("/admin/debit-notes") ||
        clean.startsWith("/admin/suppliers") ||
        clean.startsWith("/admin/supplier-balances") ||
        clean.startsWith("/admin/dashboard/procurement")
    ) {
        return "purchases";
    }
    if (
        clean.startsWith("/admin/products") ||
        clean.startsWith("/admin/inventory") ||
        clean.startsWith("/admin/categories") ||
        clean.startsWith("/admin/brands") ||
        clean.startsWith("/admin/units") ||
        clean.startsWith("/admin/dashboard/inventory")
    ) {
        return "inventory";
    }
    if (
        clean.startsWith("/admin/banking") ||
        clean.startsWith("/admin/petty-cash") ||
        clean.startsWith("/admin/my-money")
    ) {
        return "banking";
    }
    if (
        clean.startsWith("/admin/accounting/reports") ||
        clean.startsWith("/admin/accounting/tax-returns")
    ) {
        return "reports";
    }
    if (
        clean.startsWith("/admin/accounting") ||
        clean.startsWith("/admin/dashboard/finance")
    ) {
        return "accounting";
    }
    if (
        clean.startsWith("/admin/crm") ||
        clean.startsWith("/admin/contacts") ||
        clean.startsWith("/admin/dashboard/crm")
    ) {
        return "crm";
    }
    if (
        clean.startsWith("/admin/payroll") ||
        clean.startsWith("/admin/time-tracking") ||
        clean.startsWith("/admin/leave") ||
        clean.startsWith("/admin/dashboard/hrm")
    ) {
        return "payroll";
    }
    if (
        clean.startsWith("/admin/projects") ||
        clean.startsWith("/admin/dashboard/projects")
    ) {
        return "projects";
    }
    if (
        clean.startsWith("/admin/helpdesk") ||
        clean.startsWith("/admin/dashboard/support")
    ) {
        return "support";
    }
    if (
        clean.startsWith("/admin/settings") ||
        clean.startsWith("/admin/users") ||
        clean.startsWith("/admin/roles") ||
        clean.startsWith("/admin/activity-log") ||
        clean.startsWith("/admin/saas")
    ) {
        return "settings";
    }
    return "dashboard";
}

interface SidebarProps {
    isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true }) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useSelector((state: RootState) => state.auth);
    const { data: systemSettings } = useSelector(
        (state: RootState) => state.systemSettings
    );
    const permissions = systemSettings?.permissions || [];

    // The module corresponding to the active browser route URL
    const routeModule = useMemo(() => detectModuleFromPath(pathname), [pathname]);

    // Active inspected module in Tier 2 (defaults to routeModule, can be toggled without navigating)
    const [activeModule, setActiveModule] = useState<PrimaryModuleKey>(routeModule);

    // Secondary panel pin state (Tier 2 visibility)
    const [isPinned, setIsPinned] = useState<boolean>(() => {
        const saved = localStorage.getItem("sapar_dual_sidebar_pinned");
        return saved !== null ? saved === "true" : true;
    });

    const [isSecondaryOpen, setIsSecondaryOpen] = useState<boolean>(isPinned);
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

    // Primary Rail expanded state (can open to show full names or collapse to icon rail)
    const [isPrimaryExpanded, setIsPrimaryExpanded] = useState<boolean>(() => {
        const saved = localStorage.getItem("sapar_primary_rail_expanded");
        return saved !== null ? saved === "true" : true;
    });

    useEffect(() => {
        if (typeof isOpen === "boolean") {
            setIsPrimaryExpanded(isOpen);
        }
    }, [isOpen]);

    const handleTogglePrimaryExpand = useCallback(() => {
        setIsPrimaryExpanded((prev) => {
            const next = !prev;
            localStorage.setItem("sapar_primary_rail_expanded", String(next));
            return next;
        });
    }, []);

    // Module Visibility & Customization
    const [visibility, setVisibility] = useState<ModuleVisibility>(() => {
        try {
            const saved = localStorage.getItem("sapar_sidebar_modules");
            if (!saved) return DEFAULT_MODULE_VISIBILITY;
            const parsed = JSON.parse(saved);
            return { ...DEFAULT_MODULE_VISIBILITY, ...parsed };
        } catch {
            return DEFAULT_MODULE_VISIBILITY;
        }
    });

    // Sync customized active modules from server
    useEffect(() => {
        axios.get("/api/admin/saas/my-modules")
            .then((res) => {
                if (res.data?.success && res.data?.data?.modules) {
                    const serverModules = res.data.data.modules;
                    setVisibility((prev) => {
                        const merged = { ...prev, ...serverModules };
                        localStorage.setItem("sapar_sidebar_modules", JSON.stringify(merged));
                        return merged;
                    });
                }
            })
            .catch(() => {});
    }, []);

    // Sync active inspected module whenever the browser route URL changes (e.g. clicked a link in Tier 2)
    useEffect(() => {
        setActiveModule(routeModule);
        if (isPinned) {
            setIsSecondaryOpen(true);
        }
    }, [pathname, routeModule, isPinned]);

    // When clicking an icon in Tier 1: switch submenu and navigate to the module's primary workspace page
    const handleSelectModule = useCallback((moduleKey: PrimaryModuleKey, defaultRoute?: string) => {
        setActiveModule(moduleKey);
        setIsSecondaryOpen(true);
        if (defaultRoute && pathname !== defaultRoute) {
            navigate(defaultRoute);
        }
    }, [pathname, navigate]);

    // Toggle Pin state for Secondary Panel
    const handleTogglePin = useCallback(() => {
        setIsPinned((prev) => {
            const next = !prev;
            localStorage.setItem("sapar_dual_sidebar_pinned", String(next));
            setIsSecondaryOpen(next);
            return next;
        });
    }, []);

    const toggleModuleVisibility = (key: keyof ModuleVisibility) => {
        const next = { ...visibility, [key]: !visibility[key] };
        setVisibility(next);
        localStorage.setItem("sapar_sidebar_modules", JSON.stringify(next));
    };

    // Construct SubMenu configuration for all 13 primary modules
    const moduleConfigs: Record<PrimaryModuleKey, ModuleSubMenuConfig> = useMemo(() => ({
        dashboard: {
            key: "dashboard",
            title: t("nav.mainDashboard", "Asosiy ERP Paneli"),
            badge: "ERP",
            icon: <Home size={16} />,
            quickAction: {
                title: t("nav.getFinancedAction", "Moliyalashtirish"),
                to: "/admin/business-loans",
            },
            groups: [
                {
                    groupTitle: t("common.main", "Boshqaruv"),
                    items: [
                        {
                            title: t("nav.mainDashboard", "Asosiy ERP Paneli"),
                            to: "/admin",
                            exact: true,
                            slug: "dashboard",
                        },
                        {
                            title: t("nav.businessFinancing", "Biznesingizni moliyalashtiring"),
                            to: "/admin/business-loans",
                            slug: "dashboard",
                        },
                    ],
                },
            ],
        },

        pos: {
            key: "pos",
            title: t("workspace.pos", "POS Kassa Terminali"),
            badge: "POS",
            icon: <ShoppingCart size={16} />,
            quickAction: {
                title: t("nav.posTerminal", "Kassa Terminali"),
                to: "/admin/pos",
            },
            groups: [
                {
                    groupTitle: t("workspace.pos", "POS Kassa"),
                    items: [
                        {
                            title: t("nav.posTerminal", "Kassa Terminali (Touch)"),
                            to: "/admin/pos",
                            slug: "invoices",
                        },
                        {
                            title: t("nav.posShifts", "Kassa Smenalari & X/Z"),
                            to: "/admin/pos/shifts",
                            slug: "invoices",
                        },
                        {
                            title: t("nav.posDashboard", "POS Monitoring"),
                            to: "/admin/dashboard/pos",
                            slug: "invoices",
                        },
                    ],
                },
                {
                    groupTitle: t("nav.posGoods", "Tovarlar & Narxlar"),
                    items: [
                        {
                            title: t("nav.items", "Tovar & Narxlar Roʻyxati"),
                            to: "/admin/products",
                            addPath: "/admin/products/new",
                            slug: "product-services",
                        },
                        {
                            title: t("nav.categories", "Tovar Kategoriyalari"),
                            to: "/admin/categories",
                            slug: "product-services",
                        },
                    ],
                },
                {
                    groupTitle: t("nav.posStaff", "Kassirlar & Sozlamalar"),
                    items: [
                        {
                            title: t("nav.attendance", "Kassirlar Davomati"),
                            to: "/admin/payroll/tabel",
                            slug: "manage-users",
                        },
                        {
                            title: t("nav.companySettings", "Kassa Sozlamalari"),
                            to: "/admin/settings/company-settings",
                            slug: "settings",
                        },
                    ],
                },
            ],
        },

        sales: {
            key: "sales",
            title: t("workspace.sales", "Savdo & Fakturalar"),
            badge: "Faktura",
            icon: <Receipt size={16} />,
            quickAction: {
                title: t("nav.createInvoice", "Yangi Faktura"),
                to: "/admin/invoices/create-invoice",
            },
            groups: [
                {
                    groupTitle: t("nav.sales", "Savdo Hujjatlari"),
                    items: [
                        {
                            title: t("nav.invoices", "Hisob-fakturalar"),
                            to: "/admin/invoices",
                            addPath: "/admin/invoices/create-invoice",
                            slug: "invoices",
                        },
                        {
                            title: t("nav.eDocuments", "E-Faktura (Didox & Soliq)"),
                            to: "/admin/e-documents",
                            slug: "invoices",
                            badge: "EDI",
                        },
                        {
                            title: t("nav.quotations", "Tijorat Takliflari (KP)"),
                            to: "/admin/quotations",
                            addPath: "/admin/quotations/new",
                            slug: "quotations",
                        },
                        {
                            title: t("nav.recurringInvoices", "Davriy Fakturalar"),
                            to: "/admin/recurring-invoices",
                            slug: "recurring-invoices",
                        },
                        {
                            title: t("nav.creditNotes", "Kredit-Notalar"),
                            to: "/admin/credit-notes",
                            addPath: "/admin/credit-notes/new",
                            slug: "credit-notes",
                        },
                        {
                            title: t("nav.deliveryChallans", "Yuk Xatlari (TTN)"),
                            to: "/admin/delivery-challans",
                            addPath: "/admin/delivery-challans/new",
                            slug: "delivery-challans",
                        },
                        {
                            title: t("nav.contacts", "Mijozlar & Kontragentlar"),
                            to: "/admin/contacts",
                            addPath: "/admin/contacts/new",
                            slug: "contacts",
                        },
                        {
                            title: t("nav.salesDashboard", "Savdo Hisobotlari & Tahlil"),
                            to: "/admin/dashboard/sales",
                            slug: "sales",
                        },
                    ],
                },
            ],
        },

        purchases: {
            key: "purchases",
            title: t("workspace.purchases", "Xaridlar & Taʼminot"),
            badge: "Xarid",
            icon: <ShoppingBag size={16} />,
            quickAction: {
                title: t("nav.createExpense", "Yangi Xarid"),
                to: "/admin/expenses/new",
            },
            groups: [
                {
                    groupTitle: t("nav.purchases", "Xarid Operatsiyalari"),
                    items: [
                        {
                            title: t("nav.procurementDashboard", "Xaridlar Boshqaruv Paneli"),
                            to: "/admin/dashboard/procurement",
                            slug: "purchases",
                        },
                        {
                            title: t("nav.expenses", "Xarid Fakturalari & Xarajatlar"),
                            to: "/admin/expenses",
                            addPath: "/admin/expenses/new",
                            slug: "expenses",
                        },
                        {
                            title: t("nav.purchaseOrders", "Xarid Buyurtmalari (PO)"),
                            to: "/admin/purchase-orders",
                            addPath: "/admin/purchase-orders/new",
                            slug: "purchase-orders",
                        },
                        {
                            title: t("nav.debitNotes", "Debet-Notalar"),
                            to: "/admin/debit-notes",
                            addPath: "/admin/debit-notes/new",
                            slug: "debit-notes",
                        },
                        {
                            title: t("nav.suppliers", "Yetkazib Beruvchilar"),
                            to: "/admin/suppliers",
                            addPath: "/admin/suppliers/new",
                            slug: "suppliers",
                        },
                        {
                            title: t("nav.supplierBalances", "Yetkazib Beruvchilar Balansi"),
                            to: "/admin/supplier-balances",
                            slug: "purchase-list",
                        },
                        {
                            title: t("nav.supplierPayments", "Yetkazib Beruvchilarga Toʻlov"),
                            to: "/admin/purchases/supplier-payments",
                            slug: "purchases",
                        },
                    ],
                },
            ],
        },

        inventory: {
            key: "inventory",
            title: t("workspace.inventory", "Ombor & Tovarlar"),
            badge: "Sklad",
            icon: <Package size={16} />,
            quickAction: {
                title: t("nav.createProduct", "Yangi Tovar"),
                to: "/admin/products/new",
            },
            groups: [
                {
                    groupTitle: t("nav.inventory", "Ombor va Qoldiqlar"),
                    items: [
                        {
                            title: t("nav.inventoryDashboard", "Ombor Boshqaruv Paneli"),
                            to: "/admin/dashboard/inventory",
                            slug: "products",
                        },
                        {
                            title: t("nav.products", "Tovarlar va Xizmatlar"),
                            to: "/admin/products",
                            addPath: "/admin/products/new",
                            slug: "product-services",
                        },
                        {
                            title: t("nav.stock", "Ombor Qoldiqlari"),
                            to: "/admin/inventory",
                            exact: true,
                            slug: "inventory",
                        },
                        {
                            title: t("nav.costLayers", "FIFO Tannarx Qatlamlari"),
                            to: "/admin/inventory/cost-layers",
                            slug: "inventory",
                        },
                        {
                            title: t("nav.deliveryChallans", "Yetkazib Berish (TTN)"),
                            to: "/admin/delivery-challans",
                            addPath: "/admin/delivery-challans/new",
                            slug: "invoices",
                        },
                    ],
                },
                {
                    groupTitle: t("nav.categories", "Katalog & Parametrlar"),
                    items: [
                        {
                            title: t("nav.categories", "Tovar Kategoriyalari"),
                            to: "/admin/categories",
                            slug: "product-services",
                        },
                        {
                            title: t("nav.brands", "Brendlar"),
                            to: "/admin/brands",
                            slug: "product-services",
                        },
                        {
                            title: t("nav.units", "Oʻlchov Birliklari"),
                            to: "/admin/units",
                            slug: "product-services",
                        },
                    ],
                },
            ],
        },

        banking: {
            key: "banking",
            title: t("nav.bankingGroup", "Bank & Kassa"),
            badge: "Bank",
            icon: <LandmarkIcon size={16} />,
            quickAction: {
                title: t("nav.bankAccounts", "Bank Hisoblari"),
                to: "/admin/banking",
            },
            groups: [
                {
                    groupTitle: t("nav.bankingGroup", "Pul Mablagʻlari"),
                    items: [
                        {
                            title: t("nav.bankAccounts", "Bank Hisoblari"),
                            to: "/admin/banking",
                            exact: true,
                            slug: "banking",
                        },
                        {
                            title: t("nav.bankTransactions", "Bank Tranzaksiyalari (Vipiska)"),
                            to: "/admin/banking/transactions",
                            slug: "bank-transactions",
                        },
                        {
                            title: t("nav.bankReconciliation", "Bank Akt Sverka"),
                            to: "/admin/banking/reconciliation",
                            slug: "bank-transactions",
                        },
                        {
                            title: t("nav.pettyCash", "Kassa (Petty Cash / Naqd)"),
                            to: "/admin/petty-cash",
                            slug: "petty-cash",
                        },
                        {
                            title: t("nav.myMoney", "Pul Oqimi (Cash Flow)"),
                            to: "/admin/my-money",
                            slug: "my-money",
                        },
                    ],
                },
            ],
        },

        accounting: {
            key: "accounting",
            title: t("nav.accounting", "Buxgalteriya"),
            badge: "BHMS",
            icon: <BookOpen size={16} />,
            quickAction: {
                title: t("nav.createJournal", "Yangi Provodka"),
                to: "/admin/accounting/journal-entries/create",
            },
            groups: [
                {
                    groupTitle: t("nav.accounting", "Buxgalteriya Hisobi"),
                    items: [
                        {
                            title: t("nav.bhmsChartOfAccounts", "21-son BHMS Standarti"),
                            to: "/admin/accounting/bhms-chart-of-accounts",
                            slug: "chart-of-accounts",
                        },
                        {
                            title: t("nav.chartOfAccounts", "Hisoblar Rejasi (COA)"),
                            to: "/admin/accounting/chart-of-accounts",
                            slug: "chart-of-accounts",
                        },
                        {
                            title: t("nav.journalEntries", "Bosh Kitob & Provodkalar"),
                            to: "/admin/accounting/journal-entries",
                            addPath: "/admin/accounting/journal-entries/new",
                            slug: "journal-entries",
                        },
                        {
                            title: t("nav.contras", "Oʻzaro Hisob-kitob (Contras)"),
                            to: "/admin/accounting/contras",
                            addPath: "/admin/accounting/contras/new",
                            slug: "journal-entries",
                        },
                        {
                            title: t("nav.fixedAssets", "Asosiy Vositalar va Eskirish"),
                            to: "/admin/accounting/fixed-assets",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.budgets", "Byudjetlar"),
                            to: "/admin/accounting/budgets",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.costCenters", "Xarajat Markazlari"),
                            to: "/admin/accounting/cost-centers",
                            slug: "accounting",
                        },
                    ],
                },
            ],
        },

        reports: {
            key: "reports",
            title: t("nav.financialReports", "Moliyaviy Hisobotlar"),
            badge: "1/2",
            icon: <BarChart2 size={16} />,
            groups: [
                {
                    groupTitle: t("nav.financialReports", "Davlat va Moliyaviy Hisobotlar"),
                    items: [
                        {
                            title: t("nav.allFinancialReports", "Barcha Hisobotlar (Hub)"),
                            to: "/admin/accounting/reports",
                            exact: true,
                            slug: "accounting",
                        },
                        {
                            title: t("nav.balanceSheet", "Buxgalteriya Balansi (1-shakl)"),
                            to: "/admin/accounting/reports/balance-sheet",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.profitLoss", "Moliyaviy Natijalar (2-shakl)"),
                            to: "/admin/accounting/reports/profit-loss",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.uzFinancialReports", "1/2-Shakl Davlat Hisobotlari"),
                            to: "/admin/accounting/reports/uz-financial-statements",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.trialBalance", "Aylanma Vedomost (Oborotka)"),
                            to: "/admin/accounting/reports/trial-balance",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.generalLedger", "Bosh Kitob"),
                            to: "/admin/accounting/reports/general-ledger",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.soliqQqs", "Soliq QQS 12% Deklaratsiyasi"),
                            to: "/admin/accounting/reports/soliq-qqs",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.soliqJshods", "Soliq JShODS & Ijtimoiy Soliq"),
                            to: "/admin/accounting/reports/soliq-jshods",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.soliqAylanma", "Soliq Aylanma Soligʻi 4%"),
                            to: "/admin/accounting/reports/soliq-aylanma",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.arAging", "Debitorlik Qarzdorlik Tahlili"),
                            to: "/admin/accounting/reports/ar-aging",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.apAging", "Kreditorlik Qarzdorlik Tahlili"),
                            to: "/admin/accounting/reports/ap-aging",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.eDocuments", "E-Hujjatlar & Akt Sverki"),
                            to: "/admin/e-documents",
                            slug: "invoices",
                        },
                    ],
                },
            ],
        },

        crm: {
            key: "crm",
            title: t("workspace.crm", "CRM & Bitimlar"),
            badge: "CRM",
            icon: <Target size={16} />,
            quickAction: {
                title: t("nav.createContact", "Yangi Kontakt"),
                to: "/admin/contacts/new",
            },
            groups: [
                {
                    groupTitle: t("workspace.crm", "Mijozlar & Quvur"),
                    items: [
                        {
                            title: t("nav.crmDashboard", "CRM Boshqaruv Paneli"),
                            to: "/admin/dashboard/crm",
                            slug: "contacts",
                        },
                        {
                            title: t("nav.crmPipeline", "Bitimlar Quvuri (Kanban)"),
                            to: "/admin/crm/pipeline",
                            slug: "contacts",
                        },
                        {
                            title: t("nav.contacts", "Mijozlar & Kontragentlar"),
                            to: "/admin/contacts",
                            addPath: "/admin/contacts/new",
                            slug: "contacts",
                        },
                        {
                            title: t("nav.quotations", "Tijorat Takliflari (KP)"),
                            to: "/admin/quotations",
                            addPath: "/admin/quotations/new",
                            slug: "quotations",
                        },
                    ],
                },
            ],
        },

        payroll: {
            key: "payroll",
            title: t("workspace.hrm", "HRM & Oylik Maosh"),
            badge: "Tabel",
            icon: <Users size={16} />,
            quickAction: {
                title: t("nav.createEmployee", "Yangi Xodim"),
                to: "/admin/payroll/employees/new",
            },
            groups: [
                {
                    groupTitle: t("workspace.hrm", "Xodimlar & Oylik"),
                    items: [
                        {
                            title: t("nav.hrmDashboard", "HRM Boshqaruv Paneli"),
                            to: "/admin/dashboard/hrm",
                            slug: "manage-users",
                        },
                        {
                            title: t("nav.employees", "Xodimlar Roʻyxati"),
                            to: "/admin/payroll/employees",
                            addPath: "/admin/payroll/employees/new",
                            slug: "manage-users",
                        },
                        {
                            title: t("nav.payrollProfiles", "Xodimlar & Maosh Profillari"),
                            to: "/admin/payroll/profiles",
                            slug: "payroll",
                        },
                        {
                            title: t("nav.payRuns", "Oylik Hisob-kitob (Pay Runs)"),
                            to: "/admin/payroll/runs",
                            slug: "payroll",
                        },
                        {
                            title: t("nav.attendanceTabel", "Ish Vaqti Hisobi (Tabel)"),
                            to: "/admin/payroll/tabel",
                            slug: "payroll",
                        },
                        {
                            title: t("nav.timeTracking", "Vaqt Hisobi (Timesheet)"),
                            to: "/admin/time-tracking/my-timesheet",
                            slug: "time-tracking",
                        },
                        {
                            title: t("nav.leaves", "Taʼtillar & Ruxsatnomalar"),
                            to: "/admin/leave/my-leave",
                            slug: "time-tracking",
                        },
                        {
                            title: t("nav.roles", "Rollar & Ruxsatlar"),
                            to: "/admin/roles",
                            slug: "manage-users",
                        },
                    ],
                },
            ],
        },

        projects: {
            key: "projects",
            title: t("workspace.projects", "Loyihalar & Vazifalar"),
            badge: "Kanban",
            icon: <Briefcase size={16} />,
            groups: [
                {
                    groupTitle: t("workspace.projects", "Loyihalar"),
                    items: [
                        {
                            title: t("nav.projectsDashboard", "Loyihalar Boshqaruv Paneli"),
                            to: "/admin/dashboard/projects",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.projects", "Loyihalar Doskasi (Kanban)"),
                            to: "/admin/accounting/projects",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.timesheet", "Vaqt Hisobi (Timesheet)"),
                            to: "/admin/payroll/tabel",
                            slug: "manage-users",
                        },
                    ],
                },
            ],
        },

        support: {
            key: "support",
            title: t("workspace.support", "Yordam Markazi"),
            badge: "Help",
            icon: <Headphones size={16} />,
            groups: [
                {
                    groupTitle: t("workspace.support", "Mijozlar Murojaatlari"),
                    items: [
                        {
                            title: t("nav.supportDashboard", "Yordam Boshqaruv Paneli"),
                            to: "/admin/dashboard/support",
                            slug: "contacts",
                        },
                        {
                            title: t("nav.helpdesk", "Murojaatlar & Tiketlar"),
                            to: "/admin/helpdesk",
                            slug: "contacts",
                        },
                        {
                            title: t("nav.activityLog", "Audit Jurnali"),
                            to: "/admin/activity-log",
                            slug: "manage-users",
                        },
                    ],
                },
            ],
        },

        settings: {
            key: "settings",
            title: t("nav.settings", "Tizim Sozlamalari"),
            badge: "⚙️",
            icon: <Settings size={16} />,
            groups: [
                {
                    groupTitle: t("nav.users", "Maʼmuriyat & Rollar"),
                    items: [
                        {
                            title: t("nav.saasClients", "👑 SaaS Mijozlar (Tenants)"),
                            to: "/admin/saas/clients",
                            slug: "manage-users",
                        },
                        {
                            title: t("nav.users", "Foydalanuvchilar"),
                            to: "/admin/users",
                            slug: "manage-users",
                        },
                        {
                            title: t("nav.roles", "Rollar va Ruxsatlar"),
                            to: "/admin/roles",
                            slug: "manage-users",
                        },
                        {
                            title: t("nav.activityLog", "Audit Jurnali"),
                            to: "/admin/activity-log",
                            slug: "activity-log",
                        },
                    ],
                },
                {
                    groupTitle: t("nav.settings", "Tizim Parametrlari"),
                    items: [
                        {
                            title: t("nav.ediSettings", "E-IMZO & E-Faktura sozlamalari"),
                            to: "/admin/settings/edi-settings",
                            slug: "settings",
                        },
                        {
                            title: t("nav.paymentGateways", "Toʻlov tizimlari"),
                            to: "/admin/settings/uz-gateways",
                            slug: "settings",
                        },
                        {
                            title: t("nav.subscriptionPlans", "Obuna va Tariflar"),
                            to: "/admin/settings/subscription-plans",
                            slug: "settings",
                        },
                        {
                            title: t("nav.companySettings", "Korxona rekvizitlari"),
                            to: "/admin/settings/company-settings",
                            slug: "settings",
                        },
                        {
                            title: t("nav.localization", "Valyuta va Lokalizatsiya"),
                            to: "/admin/settings/localization",
                            slug: "settings",
                        },
                        {
                            title: t("nav.banking", "Bank hisoblari"),
                            to: "/admin/settings/bank-accounts",
                            slug: "settings",
                        },
                        {
                            title: t("nav.translations", "Tarjimalar va Matnlar"),
                            to: "/admin/settings/translations",
                            slug: "settings",
                        },
                    ],
                },
            ],
        },
    }), [t]);

    const activeConfig = moduleConfigs[activeModule] || moduleConfigs.dashboard;

    return (
        <>
            <div className="flex h-screen shrink-0 relative">
                {/* TIER 1: Bubble Primary Global Icon Rail (Expandable) */}
                <PrimaryRail
                    activeModule={activeModule}
                    routeModule={routeModule}
                    onSelectModule={handleSelectModule}
                    isPinned={isPinned}
                    onTogglePin={handleTogglePin}
                    onOpenCustomizeModal={() => setIsCustomizeModalOpen(true)}
                    isExpanded={isPrimaryExpanded}
                    onToggleExpand={handleTogglePrimaryExpand}
                />

                {/* TIER 2: Contextual Bubble Secondary Submenu Panel */}
                <SecondarySubMenuPanel
                    config={activeConfig}
                    isOpen={isSecondaryOpen && isOpen}
                    isPinned={isPinned}
                    onTogglePin={handleTogglePin}
                    permissions={permissions}
                    user={user}
                />
            </div>

            {/* Modal: Customize Modules Visibility */}
            {isCustomizeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-lg border border-slate-200 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="w-5 h-5 text-teal-700" />
                                <h3 className="text-base font-bold text-slate-900">
                                    {t("nav.customizeMenuTitle", "Menyu Modullarini Moslashtirish")}
                                </h3>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setVisibility(DEFAULT_MODULE_VISIBILITY);
                                    localStorage.setItem(
                                        "sapar_sidebar_modules",
                                        JSON.stringify(DEFAULT_MODULE_VISIBILITY)
                                    );
                                }}
                                className="text-xs text-slate-600 cursor-pointer"
                            >
                                {t("nav.enableAll", "Hammasini Yoqish")}
                            </Button>
                        </div>

                        <p className="text-xs text-slate-500">
                            {t("nav.customizeMenuDesc", "Korxonangiz faoliyatiga mos menyu modullarini tanlang yoki keraksizlarini yashiring:")}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto p-1">
                            {[
                                { key: "pos", label: `🛒 ${t("workspace.pos", "POS Kassa")}`, desc: t("workspace.posDesc", "Chakana savdo va chek chiqarish") },
                                { key: "crm", label: `💼 ${t("workspace.crm", "CRM & Bitimlar")}`, desc: t("workspace.crmDesc", "Mijozlar quvuri va savdo bitimlari") },
                                { key: "sales", label: `🧾 ${t("workspace.sales", "Savdo & Fakturalar")}`, desc: t("workspace.salesDesc", "Fakturalar, TTN va takliflar") },
                                { key: "purchases", label: `🛍️ ${t("workspace.purchases", "Xaridlar & Taʼminot")}`, desc: t("workspace.purchasesDesc", "Taʼminotchilar va xaridlar") },
                                { key: "inventory", label: `📦 ${t("workspace.inventory", "Ombor & Tovar")}`, desc: t("workspace.inventoryDesc", "Qoldiqlar, FIFO tannarx va tovarlar") },
                                { key: "banking", label: `🏦 ${t("nav.bankingGroup", "Bank & Kassa")}`, desc: t("workspace.financeDesc", "Hisoblar, naqd pul va xarajatlar") },
                                { key: "accounting", label: `📖 ${t("nav.accounting", "Buxgalteriya")}`, desc: t("nav.chartOfAccounts", "Hisoblar rejasi va jurnallar") },
                                { key: "reports", label: `📊 ${t("nav.financialReports", "Moliyaviy Hisobotlar")}`, desc: t("nav.allFinancialReports", "P&L, Balans va aylanma vedomost") },
                                { key: "projects", label: `📁 ${t("workspace.projects", "Loyihalar & Vazifalar")}`, desc: t("workspace.projectsDesc", "Vazifalar Kanban va rentabellik") },
                                { key: "payroll", label: `👥 ${t("workspace.hrm", "HRM & Xodimlar")}`, desc: t("workspace.hrmDesc", "Oylik tabel va maosh hisoblash") },
                                { key: "helpdesk", label: `🎧 ${t("workspace.support", "Mijozlar Yordami")}`, desc: t("workspace.supportDesc", "Mijozlar murojaatlari va xizmat") },
                                { key: "settings", label: `⚙️ ${t("nav.settings", "Tizim Sozlamalari")}`, desc: t("nav.companySettings", "E-IMZO, Payme, Click va rekvizitlar") },
                            ].map((m) => {
                                const isVisible = visibility[m.key as keyof ModuleVisibility];
                                return (
                                    <button
                                        key={m.key}
                                        type="button"
                                        onClick={() => toggleModuleVisibility(m.key as keyof ModuleVisibility)}
                                        className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                                            isVisible
                                                ? "bg-teal-50/70 border-teal-300 shadow-xs"
                                                : "bg-slate-50 border-slate-200 opacity-60"
                                        }`}
                                    >
                                        <div className="space-y-0.5">
                                            <h4 className="text-xs font-bold text-slate-900">{m.label}</h4>
                                            <p className="text-[10px] text-slate-500">{m.desc}</p>
                                        </div>
                                        <div
                                            className={`p-1.5 rounded-xl ${
                                                isVisible
                                                    ? "bg-teal-700 text-white"
                                                    : "bg-slate-200 text-slate-400"
                                            }`}
                                        >
                                            {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex justify-end pt-3 border-t">
                            <Button
                                onClick={() => setIsCustomizeModalOpen(false)}
                                className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 cursor-pointer"
                            >
                                {t("nav.saveAndClose", "Saqlash va Yopish")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
