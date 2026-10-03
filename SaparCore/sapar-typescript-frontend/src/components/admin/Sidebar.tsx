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
import { UnifiedSidebar } from "./sidebar/UnifiedSidebar";

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
    if (clean.startsWith("/admin/design-system") || clean.startsWith("/design-system")) {
        return "design_system";
    }
    if (clean === "/admin" || clean === "/admin/" || clean === "" || clean === "/" || clean.startsWith("/admin/business-loans") || clean.startsWith("/business-loans")) {
        return "dashboard";
    }
    if (clean.startsWith("/pos") || clean.startsWith("/admin/pos") || clean.startsWith("/admin/dashboard/pos")) {
        return "pos";
    }
    if (
        clean.startsWith("/sales") ||
        clean.startsWith("/invoices") ||
        clean.startsWith("/e-documents") ||
        clean.startsWith("/quotations") ||
        clean.startsWith("/recurring-invoices") ||
        clean.startsWith("/credit-notes") ||
        clean.startsWith("/delivery-challans") ||
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
        clean.startsWith("/expenses") ||
        clean.startsWith("/purchases") ||
        clean.startsWith("/purchase-orders") ||
        clean.startsWith("/debit-notes") ||
        clean.startsWith("/suppliers") ||
        clean.startsWith("/supplier-balances") ||
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
        clean.startsWith("/products") ||
        clean.startsWith("/inventory") ||
        clean.startsWith("/categories") ||
        clean.startsWith("/brands") ||
        clean.startsWith("/units") ||
        clean.startsWith("/warehouses") ||
        clean.startsWith("/admin/products") ||
        clean.startsWith("/admin/inventory") ||
        clean.startsWith("/admin/categories") ||
        clean.startsWith("/admin/brands") ||
        clean.startsWith("/admin/units") ||
        clean.startsWith("/admin/warehouses") ||
        clean.startsWith("/admin/dashboard/inventory")
    ) {
        return "inventory";
    }
    if (
        clean.startsWith("/banking") ||
        clean.startsWith("/petty-cash") ||
        clean.startsWith("/my-money") ||
        clean.startsWith("/admin/banking") ||
        clean.startsWith("/admin/petty-cash") ||
        clean.startsWith("/admin/my-money")
    ) {
        return "banking";
    }
    if (
        clean.startsWith("/reports") ||
        clean.startsWith("/accounting/reports") ||
        clean.startsWith("/accounting/tax-returns") ||
        clean.startsWith("/admin/accounting/reports") ||
        clean.startsWith("/admin/accounting/tax-returns")
    ) {
        return "reports";
    }
    if (
        clean.startsWith("/accounting") ||
        clean.startsWith("/admin/accounting") ||
        clean.startsWith("/admin/dashboard/finance")
    ) {
        return "accounting";
    }
    if (
        clean.startsWith("/crm") ||
        clean.startsWith("/contacts") ||
        clean.startsWith("/deals") ||
        clean.startsWith("/admin/crm") ||
        clean.startsWith("/admin/contacts") ||
        clean.startsWith("/admin/dashboard/crm")
    ) {
        return "crm";
    }
    if (
        clean.startsWith("/payroll") ||
        clean.startsWith("/time-tracking") ||
        clean.startsWith("/leave") ||
        clean.startsWith("/admin/payroll") ||
        clean.startsWith("/admin/time-tracking") ||
        clean.startsWith("/admin/leave") ||
        clean.startsWith("/admin/dashboard/hrm")
    ) {
        return "payroll";
    }
    if (
        clean.startsWith("/projects") ||
        clean.startsWith("/admin/projects") ||
        clean.startsWith("/admin/dashboard/projects")
    ) {
        return "projects";
    }
    if (
        clean.startsWith("/helpdesk") ||
        clean.startsWith("/admin/helpdesk") ||
        clean.startsWith("/admin/dashboard/support")
    ) {
        return "support";
    }
    if (
        clean.startsWith("/settings") ||
        clean.startsWith("/users") ||
        clean.startsWith("/roles") ||
        clean.startsWith("/activity-log") ||
        clean.startsWith("/saas") ||
        clean.startsWith("/branches") ||
        clean.startsWith("/admin/settings") ||
        clean.startsWith("/admin/users") ||
        clean.startsWith("/admin/roles") ||
        clean.startsWith("/admin/activity-log") ||
        clean.startsWith("/admin/saas") ||
        clean.startsWith("/admin/branches")
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
            const result: any = {};
            Object.keys(DEFAULT_MODULE_VISIBILITY).forEach((k) => {
                result[k] = Boolean(parsed[k]);
            });
            return result as ModuleVisibility;
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
                    setVisibility(() => {
                        const result: any = {};
                        Object.keys(DEFAULT_MODULE_VISIBILITY).forEach((k) => {
                            result[k] = Boolean(serverModules[k]);
                        });
                        localStorage.setItem("sapar_sidebar_modules", JSON.stringify(result));
                        return result;
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

    const isSuperAdmin = user?.user_type === 1 || user?.email?.toLowerCase().includes("admin");

    // Construct SubMenu configuration for all 13 primary modules
    const moduleConfigs: Record<PrimaryModuleKey, ModuleSubMenuConfig> = useMemo(() => ({
        dashboard: {
            key: "dashboard",
            title: isSuperAdmin ? t("nav.saasClients", "👑 SaaS Mijozlar") : t("nav.mainDashboard", "Asosiy ERP Paneli"),
            badge: isSuperAdmin ? "SaaS" : "ERP",
            icon: <Home size={16} />,
            quickAction: {
                title: t("nav.getFinancedAction", "Moliyalashtirish"),
                to: "/business-loans",
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
                            to: "/business-loans",
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
                to: "/pos",
            },
            groups: [
                {
                    groupTitle: t("workspace.pos", "POS Kassa"),
                    items: [
                        {
                            title: t("nav.posTerminal", "Kassa Terminali (Touch)"),
                            to: "/pos",
                            slug: "invoices",
                        },
                        {
                            title: t("nav.posShifts", "Kassa Smenalari & X/Z"),
                            to: "/pos/shifts",
                            slug: "invoices",
                        },
                        {
                            title: t("nav.posDashboard", "POS Monitoring"),
                            to: "/dashboard/pos",
                            slug: "invoices",
                        },
                    ],
                },
                {
                    groupTitle: t("nav.posGoods", "Tovarlar & Narxlar"),
                    items: [
                        {
                            title: t("nav.items", "Tovar & Narxlar Roʻyxati"),
                            to: "/products",
                            addPath: "/products/new",
                            slug: "product-services",
                        },
                        {
                            title: t("nav.categories", "Tovar Kategoriyalari"),
                            to: "/categories",
                            slug: "product-services",
                        },
                    ],
                },
                {
                    groupTitle: t("nav.posStaff", "Kassirlar & Sozlamalar"),
                    items: [
                        {
                            title: t("nav.attendance", "Kassirlar Davomati"),
                            to: "/payroll/tabel",
                            slug: "manage-users",
                        },
                        {
                            title: t("nav.companySettings", "Kassa Sozlamalari"),
                            to: "/settings/company-settings",
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
                to: "/invoices/create-invoice",
            },
            groups: [
                {
                    groupTitle: t("nav.sales", "Savdo Hujjatlari"),
                    items: [
                        {
                            title: t("nav.invoices", "Hisob-fakturalar"),
                            to: "/invoices",
                            addPath: "/invoices/create-invoice",
                            slug: "invoices",
                        },
                        {
                            title: t("nav.eDocuments", "E-Faktura (Didox & Soliq)"),
                            to: "/e-documents",
                            slug: "invoices",
                            badge: "EDI",
                        },
                        {
                            title: t("nav.quotations", "Tijorat Takliflari (KP)"),
                            to: "/quotations",
                            addPath: "/quotations/new",
                            slug: "quotations",
                        },
                        {
                            title: t("nav.recurringInvoices", "Davriy Fakturalar"),
                            to: "/recurring-invoices",
                            slug: "recurring-invoices",
                        },
                        {
                            title: t("nav.creditNotes", "Kredit-Notalar"),
                            to: "/credit-notes",
                            addPath: "/credit-notes/new",
                            slug: "credit-notes",
                        },
                        {
                            title: t("nav.deliveryChallans", "Yuk Xatlari (TTN)"),
                            to: "/delivery-challans",
                            addPath: "/delivery-challans/new",
                            slug: "delivery-challans",
                        },
                        {
                            title: t("nav.contacts", "Mijozlar & Kontragentlar"),
                            to: "/contacts",
                            addPath: "/contacts/new",
                            slug: "contacts",
                        },
                        {
                            title: t("nav.salesDashboard", "Savdo Hisobotlari & Tahlil"),
                            to: "/dashboard/sales",
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
                to: "/expenses/new",
            },
            groups: [
                {
                    groupTitle: t("nav.purchases", "Xarid Operatsiyalari"),
                    items: [
                        {
                            title: t("nav.procurementDashboard", "Xaridlar Boshqaruv Paneli"),
                            to: "/dashboard/procurement",
                            slug: "purchases",
                        },
                        {
                            title: t("nav.expenses", "Xarid Fakturalari & Xarajatlar"),
                            to: "/expenses",
                            addPath: "/expenses/new",
                            slug: "expenses",
                        },
                        {
                            title: t("nav.purchaseOrders", "Xarid Buyurtmalari (PO)"),
                            to: "/purchase-orders",
                            addPath: "/purchase-orders/new",
                            slug: "purchase-orders",
                        },
                        {
                            title: t("nav.debitNotes", "Debet-Notalar"),
                            to: "/debit-notes",
                            addPath: "/debit-notes/new",
                            slug: "debit-notes",
                        },
                        {
                            title: t("nav.suppliers", "Yetkazib Beruvchilar"),
                            to: "/suppliers",
                            addPath: "/suppliers/new",
                            slug: "suppliers",
                        },
                        {
                            title: t("nav.supplierBalances", "Yetkazib Beruvchilar Balansi"),
                            to: "/supplier-balances",
                            slug: "purchase-list",
                        },
                        {
                            title: t("nav.supplierPayments", "Yetkazib Beruvchilarga Toʻlov"),
                            to: "/purchases/supplier-payments",
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
                to: "/products/new",
            },
            groups: [
                {
                    groupTitle: t("nav.inventory", "Ombor va Qoldiqlar"),
                    items: [
                        {
                            title: t("nav.inventoryDashboard", "Ombor Boshqaruv Paneli"),
                            to: "/dashboard/inventory",
                            slug: "products",
                        },
                        {
                            title: t("nav.products", "Tovarlar va Xizmatlar"),
                            to: "/products",
                            addPath: "/products/new",
                            slug: "product-services",
                        },
                        {
                            title: t("nav.stock", "Ombor Qoldiqlari"),
                            to: "/inventory",
                            exact: true,
                            slug: "inventory",
                        },
                        {
                            title: t("nav.costLayers", "FIFO Tannarx Qatlamlari"),
                            to: "/inventory/cost-layers",
                            slug: "inventory",
                        },
                        {
                            title: t("nav.deliveryChallans", "Yetkazib Berish (TTN)"),
                            to: "/delivery-challans",
                            addPath: "/delivery-challans/new",
                            slug: "invoices",
                        },
                    ],
                },
                {
                    groupTitle: t("nav.categories", "Katalog & Parametrlar"),
                    items: [
                        {
                            title: t("nav.categories", "Tovar Kategoriyalari"),
                            to: "/categories",
                            slug: "product-services",
                        },
                        {
                            title: t("nav.brands", "Brendlar"),
                            to: "/brands",
                            slug: "product-services",
                        },
                        {
                            title: t("nav.units", "Oʻlchov Birliklari"),
                            to: "/units",
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
                to: "/banking",
            },
            groups: [
                {
                    groupTitle: t("nav.bankingGroup", "Pul Mablagʻlari"),
                    items: [
                        {
                            title: t("nav.bankAccounts", "Bank Hisoblari"),
                            to: "/banking",
                            exact: true,
                            slug: "banking",
                        },
                        {
                            title: t("nav.bankTransactions", "Bank Tranzaksiyalari (Vipiska)"),
                            to: "/banking/transactions",
                            slug: "bank-transactions",
                        },
                        {
                            title: t("nav.bankReconciliation", "Bank Akt Sverka"),
                            to: "/banking/reconciliation",
                            slug: "bank-transactions",
                        },
                        {
                            title: t("nav.pettyCash", "Kassa (Petty Cash / Naqd)"),
                            to: "/petty-cash",
                            slug: "petty-cash",
                        },
                        {
                            title: t("nav.myMoney", "Pul Oqimi (Cash Flow)"),
                            to: "/my-money",
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
                to: "/accounting/journal-entries/create",
            },
            groups: [
                {
                    groupTitle: t("nav.accounting", "Buxgalteriya Hisobi"),
                    items: [
                        {
                            title: t("nav.bhmsChartOfAccounts", "21-son BHMS Standarti"),
                            to: "/accounting/bhms-chart-of-accounts",
                            slug: "chart-of-accounts",
                        },
                        {
                            title: t("nav.chartOfAccounts", "Hisoblar Rejasi (COA)"),
                            to: "/accounting/chart-of-accounts",
                            slug: "chart-of-accounts",
                        },
                        {
                            title: t("nav.journalEntries", "Bosh Kitob & Provodkalar"),
                            to: "/accounting/journal-entries",
                            addPath: "/accounting/journal-entries/new",
                            slug: "journal-entries",
                        },
                        {
                            title: t("nav.contras", "Oʻzaro Hisob-kitob (Contras)"),
                            to: "/accounting/contras",
                            addPath: "/accounting/contras/new",
                            slug: "journal-entries",
                        },
                        {
                            title: t("nav.fixedAssets", "Asosiy Vositalar va Eskirish"),
                            to: "/accounting/fixed-assets",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.budgets", "Byudjetlar"),
                            to: "/accounting/budgets",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.costCenters", "Xarajat Markazlari"),
                            to: "/accounting/cost-centers",
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
                            to: "/accounting/reports",
                            exact: true,
                            slug: "accounting",
                        },
                        {
                            title: t("nav.balanceSheet", "Buxgalteriya Balansi (1-shakl)"),
                            to: "/accounting/reports/balance-sheet",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.profitLoss", "Moliyaviy Natijalar (2-shakl)"),
                            to: "/accounting/reports/profit-loss",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.uzFinancialReports", "1/2-Shakl Davlat Hisobotlari"),
                            to: "/accounting/reports/uz-financial-statements",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.trialBalance", "Aylanma Vedomost (Oborotka)"),
                            to: "/accounting/reports/trial-balance",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.generalLedger", "Bosh Kitob"),
                            to: "/accounting/reports/general-ledger",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.soliqQqs", "Soliq QQS 12% Deklaratsiyasi"),
                            to: "/accounting/reports/soliq-qqs",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.soliqJshods", "Soliq JShODS & Ijtimoiy Soliq"),
                            to: "/accounting/reports/soliq-jshods",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.soliqAylanma", "Soliq Aylanma Soligʻi 4%"),
                            to: "/accounting/reports/soliq-aylanma",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.arAging", "Debitorlik Qarzdorlik Tahlili"),
                            to: "/accounting/reports/ar-aging",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.apAging", "Kreditorlik Qarzdorlik Tahlili"),
                            to: "/accounting/reports/ap-aging",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.eDocuments", "E-Hujjatlar & Akt Sverki"),
                            to: "/e-documents",
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
                to: "/contacts/new",
            },
            groups: [
                {
                    groupTitle: t("workspace.crm", "Mijozlar & Quvur"),
                    items: [
                        {
                            title: t("nav.crmDashboard", "CRM Boshqaruv Paneli"),
                            to: "/dashboard/crm",
                            slug: "contacts",
                        },
                        {
                            title: t("nav.crmPipeline", "Bitimlar Quvuri (Kanban)"),
                            to: "/crm/pipeline",
                            slug: "contacts",
                        },
                        {
                            title: t("nav.contacts", "Mijozlar & Kontragentlar"),
                            to: "/contacts",
                            addPath: "/contacts/new",
                            slug: "contacts",
                        },
                        {
                            title: t("nav.quotations", "Tijorat Takliflari (KP)"),
                            to: "/quotations",
                            addPath: "/quotations/new",
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
                to: "/payroll/employees/new",
            },
            groups: [
                {
                    groupTitle: t("workspace.hrm", "Xodimlar & Oylik"),
                    items: [
                        {
                            title: t("nav.hrmDashboard", "HRM Boshqaruv Paneli"),
                            to: "/dashboard/hrm",
                            slug: "manage-users",
                        },
                        {
                            title: t("nav.employees", "Xodimlar Roʻyxati"),
                            to: "/payroll/employees",
                            addPath: "/payroll/employees/new",
                            slug: "manage-users",
                        },
                        {
                            title: t("nav.payrollProfiles", "Xodimlar & Maosh Profillari"),
                            to: "/payroll/profiles",
                            slug: "payroll",
                        },
                        {
                            title: t("nav.payRuns", "Oylik Hisob-kitob (Pay Runs)"),
                            to: "/payroll/runs",
                            slug: "payroll",
                        },
                        {
                            title: t("nav.attendanceTabel", "Ish Vaqti Hisobi (Tabel)"),
                            to: "/payroll/tabel",
                            slug: "payroll",
                        },
                        {
                            title: t("nav.timeTracking", "Vaqt Hisobi (Timesheet)"),
                            to: "/time-tracking/my-timesheet",
                            slug: "time-tracking",
                        },
                        {
                            title: t("nav.leaves", "Taʼtillar & Ruxsatnomalar"),
                            to: "/leave/my-leave",
                            slug: "time-tracking",
                        },
                        {
                            title: t("nav.roles", "Rollar & Ruxsatlar"),
                            to: "/roles",
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
                            to: "/dashboard/projects",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.projects", "Loyihalar Doskasi (Kanban)"),
                            to: "/accounting/projects",
                            slug: "accounting",
                        },
                        {
                            title: t("nav.timesheet", "Vaqt Hisobi (Timesheet)"),
                            to: "/payroll/tabel",
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
                            to: "/dashboard/support",
                            slug: "contacts",
                        },
                        {
                            title: t("nav.helpdesk", "Murojaatlar & Tiketlar"),
                            to: "/helpdesk",
                            slug: "contacts",
                        },
                        {
                            title: t("nav.activityLog", "Audit Jurnali"),
                            to: "/activity-log",
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
                            to: "/saas/clients",
                            slug: "manage-users",
                        },
                        {
                            title: t("nav.users", "Foydalanuvchilar"),
                            to: "/users",
                            slug: "manage-users",
                        },
                        {
                            title: t("nav.roles", "Rollar va Ruxsatlar"),
                            to: "/roles",
                            slug: "manage-users",
                        },
                        {
                            title: t("nav.activityLog", "Audit Jurnali"),
                            to: "/activity-log",
                            slug: "activity-log",
                        },
                    ],
                },
                {
                    groupTitle: t("nav.settings", "Tizim Parametrlari"),
                    items: [
                        {
                            title: t("nav.ediSettings", "E-IMZO & E-Faktura sozlamalari"),
                            to: "/settings/edi-settings",
                            slug: "settings",
                        },
                        {
                            title: t("nav.paymentGateways", "Toʻlov tizimlari"),
                            to: "/settings/uz-gateways",
                            slug: "settings",
                        },
                        {
                            title: t("nav.subscriptionPlans", "Obuna va Tariflar"),
                            to: "/settings/subscription-plans",
                            slug: "settings",
                        },
                        {
                            title: t("nav.companySettings", "Korxona rekvizitlari"),
                            to: "/settings/company-settings",
                            slug: "settings",
                        },
                        {
                            title: t("nav.localization", "Valyuta va Lokalizatsiya"),
                            to: "/settings/localization",
                            slug: "settings",
                        },
                        {
                            title: t("nav.banking", "Bank hisoblari"),
                            to: "/settings/bank-accounts",
                            slug: "settings",
                        },
                        {
                            title: t("nav.translations", "Tarjimalar va Matnlar"),
                            to: "/settings/translations",
                            slug: "settings",
                        },
                    ],
                },
            ],
        },
    }), [t]);

    const activeConfig = moduleConfigs[activeModule] || moduleConfigs.dashboard;

    return (
        <UnifiedSidebar isOpen={isOpen} />
    );
};

export default Sidebar;
