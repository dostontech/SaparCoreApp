import { useState, useMemo, useEffect } from "react";
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { MdSecurity } from "react-icons/md";

import {
    Home,
    ChevronDown,
    Box,
    Settings,
    ShoppingBag,
    BarChart2,
    Plus,
    LandmarkIcon,
    BookOpen,
    Receipt,
    SlidersHorizontal,
    Eye,
    EyeOff,
    Calculator,
    Target,
    Briefcase,
    Users,
    Headphones,
    Store,
    TrendingUp,
    Clock,
    ShieldCheck,
    Truck,
    Sparkles,
    ArrowLeft,
    Building2,
    ShoppingCart,
    Package,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@store/index";
import type {
    NavCollapsibleItem,
    NavItemType,
    NavLinkItem,
} from "@models/sidebar";
import type { PermissionSet } from "@/types/permissions";
import BottomBar from "./layouts/BottomBar";
import { Button } from "@components/ui";
import { LanguageSwitcher } from "./header/LanguageSwitcher";
import { SaparLogo } from "../common/SaparLogo";

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

export type WorkspaceMode =
    | "all"
    | "pos"
    | "hrm"
    | "inventory"
    | "crm"
    | "finance"
    | "sales"
    | "purchases"
    | "projects"
    | "support";

export interface WorkspaceModeOption {
    id: WorkspaceMode;
    titleUz: string;
    titleRu: string;
    badge: string;
    icon: React.ReactNode;
    defaultRoute: string;
}

export const WORKSPACE_MODES: WorkspaceModeOption[] = [
    { id: "all", titleUz: "Barcha Modullar (ERP)", titleRu: "Все Модули (ERP)", badge: "Toʻliq", icon: <Building2 size={16} className="text-teal-600" />, defaultRoute: "/admin" },
    { id: "pos", titleUz: "POS Kassa Maydoni", titleRu: "Рабочее место POS", badge: "Kassa", icon: <ShoppingCart size={16} className="text-emerald-600" />, defaultRoute: "/admin/dashboard/pos" },
    { id: "inventory", titleUz: "Ombor & Tovar", titleRu: "Склад & Товары", badge: "Sklad", icon: <Package size={16} className="text-amber-600" />, defaultRoute: "/admin/dashboard/inventory" },
    { id: "sales", titleUz: "Savdo & Fakturalar", titleRu: "Продажи & ЭСФ", badge: "Faktura", icon: <TrendingUp size={16} className="text-teal-600" />, defaultRoute: "/admin/dashboard/sales" },
    { id: "crm", titleUz: "CRM & Bitimlar", titleRu: "CRM & Сделки", badge: "Quvur", icon: <Target size={16} className="text-indigo-600" />, defaultRoute: "/admin/dashboard/crm" },
    { id: "finance", titleUz: "Moliya & Buxgalteriya", titleRu: "Финансы & Бухгалтерия", badge: "BHMS 21", icon: <LandmarkIcon size={16} className="text-emerald-600" />, defaultRoute: "/admin/dashboard/finance" },
    { id: "purchases", titleUz: "Xaridlar & Taʼminot", titleRu: "Закупки & Снабжение", badge: "Xarid", icon: <ShoppingBag size={16} className="text-purple-600" />, defaultRoute: "/admin/dashboard/procurement" },
    { id: "hrm", titleUz: "HRM & Xodimlar", titleRu: "HRM & Кадры", badge: "Tabel", icon: <Users size={16} className="text-teal-600" />, defaultRoute: "/admin/dashboard/hrm" },
    { id: "projects", titleUz: "Loyihalar & Vazifalar", titleRu: "Проекты & Задачи", badge: "Kanban", icon: <Briefcase size={16} className="text-blue-600" />, defaultRoute: "/admin/dashboard/projects" },
    { id: "support", titleUz: "Mijozlar Yordami", titleRu: "Техподдержка SLA", badge: "Helpdesk", icon: <Headphones size={16} className="text-teal-600" />, defaultRoute: "/admin/dashboard/support" },
];

// --- Navigation Data Structure ---
const getNavItems = (visibility: ModuleVisibility, t: any, mode: WorkspaceMode = "all"): NavItemType[] => {
    // =========================================================================
    // FOCUSED WORKSPACE: POS ONLY
    // =========================================================================
    if (mode === "pos") {
        return [
            { type: "header", title: t("nav.posWorkspace", "POS Kassa Ish Maydoni"), slug: "invoices" },
            {
                type: "link",
                to: "/admin/dashboard/pos",
                icon: <Calculator size={16} />,
                title: t("nav.posDashboard", "POS Boshqaruv Paneli"),
                slug: "invoices",
            },
            {
                type: "link",
                to: "/admin/pos",
                icon: <Store size={16} />,
                title: t("nav.posTerminal", "Kassa Terminali (Touch)"),
                slug: "invoices",
            },
            {
                type: "link",
                to: "/admin/pos/shifts",
                icon: <Receipt size={16} />,
                title: t("nav.posShifts", "Kassa Smenalari & X/Z"),
                slug: "invoices",
            },
            { type: "header", title: t("nav.posGoods", "Tovarlar & Narxlar"), slug: "product-services" },
            {
                type: "link",
                to: "/admin/products",
                icon: <Box size={16} />,
                title: t("nav.items", "Tovar & Narxlar Roʻyxati"),
                slug: "product-services",
                addPath: "/admin/products/new",
            },
            {
                type: "link",
                to: "/admin/categories",
                icon: <SlidersHorizontal size={16} />,
                title: t("nav.categories", "Tovar Kategoriyalari"),
                slug: "product-services",
            },
            { type: "header", title: t("nav.posStaff", "Kassirlar & Sozlamalar"), slug: "settings" },
            {
                type: "link",
                to: "/admin/payroll/tabel",
                icon: <Users size={16} />,
                title: t("nav.attendance", "Kassirlar Davomati"),
                slug: "manage-users",
            },
            {
                type: "link",
                to: "/admin/settings/company-settings",
                icon: <Settings size={16} />,
                title: t("nav.companySettings", "Kassa Sozlamalari"),
                slug: "settings",
            },
            { type: "header", title: t("nav.switchView", "Boshqaruv"), slug: "dashboard" },
            {
                type: "link",
                to: "/admin",
                icon: <ArrowLeft size={16} />,
                title: t("nav.backToAll", "Barcha Modullarga Qaytish"),
                slug: "dashboard",
            },
        ];
    }

    // =========================================================================
    // FOCUSED WORKSPACE: INVENTORY ONLY
    // =========================================================================
    if (mode === "inventory") {
        return [
            { type: "header", title: t("nav.inventoryWorkspace", "Ombor & Sklad Ish Maydoni"), slug: "products" },
            {
                type: "link",
                to: "/admin/dashboard/inventory",
                icon: <Package size={16} />,
                title: t("nav.inventoryDashboard", "Ombor Boshqaruv Paneli"),
                slug: "products",
            },
            {
                type: "link",
                to: "/admin/products",
                icon: <Box size={16} />,
                title: t("nav.items", "Tovar va Xizmatlar"),
                slug: "product-services",
                addPath: "/admin/products/new",
            },
            {
                type: "link",
                to: "/admin/inventory",
                icon: <Box size={16} />,
                title: t("nav.inventoryStock", "Ombor Qoldiqlari"),
                slug: "inventory",
            },
            {
                type: "link",
                to: "/admin/inventory/cost-layers",
                icon: <TrendingUp size={16} />,
                title: t("nav.costLayers", "FIFO Tannarx Qatlamlari"),
                slug: "inventory",
            },
            {
                type: "link",
                to: "/admin/delivery-challans",
                icon: <Truck size={16} />,
                title: t("nav.deliveryChallans", "Yetkazib Berish Yukxatlari"),
                slug: "invoices",
            },
            {
                type: "link",
                to: "/admin/categories",
                icon: <SlidersHorizontal size={16} />,
                title: t("nav.categories", "Tovar Kategoriyalari"),
                slug: "product-services",
            },
            {
                type: "link",
                to: "/admin/brands",
                icon: <Box size={16} />,
                title: t("nav.brands", "Brendlar"),
                slug: "product-services",
            },
            {
                type: "link",
                to: "/admin/units",
                icon: <Box size={16} />,
                title: t("nav.units", "Oʻlchov Birliklari"),
                slug: "product-services",
            },
            { type: "header", title: t("nav.switchView", "Boshqaruv"), slug: "dashboard" },
            {
                type: "link",
                to: "/admin",
                icon: <ArrowLeft size={16} />,
                title: t("nav.backToAll", "Barcha Modullarga Qaytish"),
                slug: "dashboard",
            },
        ];
    }

    // =========================================================================
    // FOCUSED WORKSPACE: HRM ONLY
    // =========================================================================
    if (mode === "hrm") {
        return [
            { type: "header", title: t("nav.hrmWorkspace", "HRM & Xodimlar Maydoni"), slug: "manage-users" },
            {
                type: "link",
                to: "/admin/dashboard/hrm",
                icon: <Users size={16} />,
                title: t("nav.hrmDashboard", "HRM Boshqaruv Paneli"),
                slug: "manage-users",
            },
            {
                type: "link",
                to: "/admin/payroll/employees",
                icon: <Users size={16} />,
                title: t("nav.employees", "Xodimlar Roʻyxati"),
                slug: "manage-users",
                addPath: "/admin/payroll/employees/new",
            },
            {
                type: "link",
                to: "/admin/payroll/tabel",
                icon: <Clock size={16} />,
                title: t("nav.attendance", "Davomat & Tabel"),
                slug: "manage-users",
            },
            {
                type: "link",
                to: "/admin/payroll",
                icon: <Receipt size={16} />,
                title: t("nav.payroll", "Oylik Maosh (Payroll)"),
                slug: "manage-users",
            },
            {
                type: "link",
                to: "/admin/roles",
                icon: <MdSecurity size={16} />,
                title: t("nav.roles", "Rollar & Ruxsatlar"),
                slug: "manage-users",
            },
            { type: "header", title: t("nav.switchView", "Boshqaruv"), slug: "dashboard" },
            {
                type: "link",
                to: "/admin",
                icon: <ArrowLeft size={16} />,
                title: t("nav.backToAll", "Barcha Modullarga Qaytish"),
                slug: "dashboard",
            },
        ];
    }

    // =========================================================================
    // FOCUSED WORKSPACE: CRM ONLY
    // =========================================================================
    if (mode === "crm") {
        return [
            { type: "header", title: t("nav.crmWorkspace", "CRM & Bitimlar Quvuri"), slug: "contacts" },
            {
                type: "link",
                to: "/admin/dashboard/crm",
                icon: <Target size={16} />,
                title: t("nav.crmDashboard", "CRM Boshqaruv Paneli"),
                slug: "contacts",
            },
            {
                type: "link",
                to: "/admin/crm/pipeline",
                icon: <Target size={16} />,
                title: t("nav.crmPipeline", "Bitimlar Quvuri (Kanban)"),
                slug: "contacts",
            },
            {
                type: "link",
                to: "/admin/contacts",
                icon: <Users size={16} />,
                title: t("nav.contacts", "Mijozlar & Kontragentlar"),
                slug: "contacts",
                addPath: "/admin/contacts/new",
            },
            {
                type: "link",
                to: "/admin/quotations",
                icon: <Receipt size={16} />,
                title: t("nav.quotations", "Tijorat Takliflari (KP)"),
                slug: "quotations",
                addPath: "/admin/quotations/new",
            },
            { type: "header", title: t("nav.switchView", "Boshqaruv"), slug: "dashboard" },
            {
                type: "link",
                to: "/admin",
                icon: <ArrowLeft size={16} />,
                title: t("nav.backToAll", "Barcha Modullarga Qaytish"),
                slug: "dashboard",
            },
        ];
    }

    // =========================================================================
    // FOCUSED WORKSPACE: FINANCE ONLY
    // =========================================================================
    if (mode === "finance") {
        return [
            { type: "header", title: t("nav.financeWorkspace", "Moliya & Buxgalteriya"), slug: "accounting" },
            {
                type: "link",
                to: "/admin/dashboard/finance",
                icon: <LandmarkIcon size={16} />,
                title: t("nav.financeDashboard", "Moliya Boshqaruv Paneli"),
                slug: "accounting",
            },
            {
                type: "link",
                to: "/admin/accounting/bhms-chart-of-accounts",
                icon: <BookOpen size={16} />,
                title: t("nav.chartOfAccounts", "21-son BHMS Hisoblar Rejasi"),
                slug: "accounting",
            },
            {
                type: "link",
                to: "/admin/accounting/journal-entries",
                icon: <BookOpen size={16} />,
                title: t("nav.journalEntries", "Bosh Kitob & Provodkalar"),
                slug: "accounting",
                addPath: "/admin/accounting/journal-entries/create",
            },
            {
                type: "link",
                to: "/admin/accounting/reports/trial-balance",
                icon: <BarChart2 size={16} />,
                title: t("nav.trialBalance", "Aylanma Vedomost (Oborotka)"),
                slug: "accounting",
            },
            {
                type: "link",
                to: "/admin/accounting/reports/uz-financial-statements",
                icon: <BarChart2 size={16} />,
                title: t("nav.financialStatements", "1/2-Shakl Davlat Hisobotlari"),
                slug: "accounting",
            },
            {
                type: "link",
                to: "/admin/accounting/tax-returns",
                icon: <ShieldCheck size={16} />,
                title: t("nav.taxReturns", "Soliq Deklaratsiyalari"),
                slug: "accounting",
            },
            {
                type: "link",
                to: "/admin/settings/bank-accounts",
                icon: <LandmarkIcon size={16} />,
                title: t("nav.bankAccounts", "Bank Hisoblari & Kassa"),
                slug: "finance-settings",
            },
            { type: "header", title: t("nav.switchView", "Boshqaruv"), slug: "dashboard" },
            {
                type: "link",
                to: "/admin",
                icon: <ArrowLeft size={16} />,
                title: t("nav.backToAll", "Barcha Modullarga Qaytish"),
                slug: "dashboard",
            },
        ];
    }

    // =========================================================================
    // FOCUSED WORKSPACE: SALES ONLY
    // =========================================================================
    if (mode === "sales") {
        return [
            { type: "header", title: t("nav.salesWorkspace", "Savdo & Fakturalar"), slug: "invoices" },
            {
                type: "link",
                to: "/admin/dashboard/sales",
                icon: <BarChart2 size={16} />,
                title: t("nav.salesDashboard", "Savdo Boshqaruv Paneli"),
                slug: "invoices",
            },
            {
                type: "link",
                to: "/admin/invoices",
                icon: <Receipt size={16} />,
                title: t("nav.invoices", "Hisob-fakturalar"),
                slug: "invoices",
                addPath: "/admin/invoices/create-invoice",
            },
            {
                type: "link",
                to: "/admin/e-documents",
                icon: <Receipt size={16} />,
                title: t("nav.eDocuments", "E-Faktura (Didox & Soliq)"),
                slug: "invoices",
            },
            {
                type: "link",
                to: "/admin/quotations",
                icon: <Receipt size={16} />,
                title: t("nav.quotations", "Tijorat Takliflari"),
                slug: "quotations",
            },
            {
                type: "link",
                to: "/admin/delivery-challans",
                icon: <Truck size={16} />,
                title: t("nav.deliveryChallans", "Yetkazib Berish (TTN)"),
                slug: "invoices",
            },
            {
                type: "link",
                to: "/admin/recurring-invoices",
                icon: <Receipt size={16} />,
                title: t("nav.recurringInvoices", "Takroriy Fakturalar"),
                slug: "invoices",
            },
            {
                type: "link",
                to: "/admin/credit-notes",
                icon: <Receipt size={16} />,
                title: t("nav.creditNotes", "Kredit-Notalar"),
                slug: "credit-notes",
            },
            { type: "header", title: t("nav.switchView", "Boshqaruv"), slug: "dashboard" },
            {
                type: "link",
                to: "/admin",
                icon: <ArrowLeft size={16} />,
                title: t("nav.backToAll", "Barcha Modullarga Qaytish"),
                slug: "dashboard",
            },
        ];
    }

    // =========================================================================
    // FOCUSED WORKSPACE: PURCHASES ONLY
    // =========================================================================
    if (mode === "purchases") {
        return [
            { type: "header", title: t("nav.purchasesWorkspace", "Xaridlar & Taʼminot"), slug: "purchases" },
            {
                type: "link",
                to: "/admin/dashboard/procurement",
                icon: <ShoppingBag size={16} />,
                title: t("nav.procurementDashboard", "Xaridlar Boshqaruv Paneli"),
                slug: "purchases",
            },
            {
                type: "link",
                to: "/admin/purchase-orders",
                icon: <ShoppingBag size={16} />,
                title: t("nav.purchaseOrders", "Xarid Buyurtmalari (PO)"),
                slug: "purchases",
                addPath: "/admin/purchases/orders/new",
            },
            {
                type: "link",
                to: "/admin/purchases",
                icon: <ShoppingBag size={16} />,
                title: t("nav.purchases", "Xarid Fakturalari"),
                slug: "purchases",
                addPath: "/admin/purchases/new",
            },
            {
                type: "link",
                to: "/admin/purchases/supplier-payments",
                icon: <Receipt size={16} />,
                title: t("nav.supplierPayments", "Taʼminotchilarga Toʻlovlar"),
                slug: "purchases",
            },
            {
                type: "link",
                to: "/admin/purchases/supplier-balances",
                icon: <BarChart2 size={16} />,
                title: t("nav.supplierBalances", "Taʼminotchi Qarzlari"),
                slug: "purchases",
            },
            {
                type: "link",
                to: "/admin/purchases/debit-notes",
                icon: <Receipt size={16} />,
                title: t("nav.debitNotes", "Debet-Notalar"),
                slug: "purchases",
            },
            { type: "header", title: t("nav.switchView", "Boshqaruv"), slug: "dashboard" },
            {
                type: "link",
                to: "/admin",
                icon: <ArrowLeft size={16} />,
                title: t("nav.backToAll", "Barcha Modullarga Qaytish"),
                slug: "dashboard",
            },
        ];
    }

    // =========================================================================
    // FOCUSED WORKSPACE: PROJECTS ONLY
    // =========================================================================
    if (mode === "projects") {
        return [
            { type: "header", title: t("nav.projectsWorkspace", "Loyihalar & Vazifalar"), slug: "dashboard" },
            {
                type: "link",
                to: "/admin/dashboard/projects",
                icon: <Briefcase size={16} />,
                title: t("nav.projectsDashboard", "Loyihalar Boshqaruv Paneli"),
                slug: "dashboard",
            },
            {
                type: "link",
                to: "/admin/projects",
                icon: <Briefcase size={16} />,
                title: t("nav.projects", "Loyihalar Doskasi (Kanban)"),
                slug: "dashboard",
            },
            {
                type: "link",
                to: "/admin/payroll/tabel",
                icon: <Clock size={16} />,
                title: t("nav.timesheet", "Vaqt Hisobi (Timesheet)"),
                slug: "manage-users",
            },
            { type: "header", title: t("nav.switchView", "Boshqaruv"), slug: "dashboard" },
            {
                type: "link",
                to: "/admin",
                icon: <ArrowLeft size={16} />,
                title: t("nav.backToAll", "Barcha Modullarga Qaytish"),
                slug: "dashboard",
            },
        ];
    }

    // =========================================================================
    // FOCUSED WORKSPACE: SUPPORT ONLY
    // =========================================================================
    if (mode === "support") {
        return [
            { type: "header", title: t("nav.supportWorkspace", "Qoʻllab-quvvatlash"), slug: "dashboard" },
            {
                type: "link",
                to: "/admin/dashboard/support",
                icon: <Headphones size={16} />,
                title: t("nav.supportDashboard", "Yordam Boshqaruv Paneli"),
                slug: "dashboard",
            },
            {
                type: "link",
                to: "/admin/helpdesk",
                icon: <Headphones size={16} />,
                title: t("nav.helpdesk", "Murojaatlar & Tiketlar"),
                slug: "dashboard",
            },
            {
                type: "link",
                to: "/admin/activity-log",
                icon: <Receipt size={16} />,
                title: t("nav.activityLog", "Audit Jurnali"),
                slug: "manage-users",
            },
            { type: "header", title: t("nav.switchView", "Boshqaruv"), slug: "dashboard" },
            {
                type: "link",
                to: "/admin",
                icon: <ArrowLeft size={16} />,
                title: t("nav.backToAll", "Barcha Modullarga Qaytish"),
                slug: "dashboard",
            },
        ];
    }

    // =========================================================================
    // DEFAULT: ALL ERP MODULES (Full View)
    // =========================================================================
    const items: NavItemType[] = [
        // =========================================================================
        // 1. ASOSIY (Core Dashboard & Module Dashboards Dropdown)
        // =========================================================================
        { type: "header", title: t("common.main", "Boshqaruv"), slug: "dashboard" },
        {
            type: "link" as const,
            to: "/admin/business-loans",
            icon: <Sparkles size={16} className="text-amber-500" />,
            title: t("nav.businessLoans", "Biznes Krediti (Bank Finanslash)"),
            slug: "dashboard",
        },
        {
            type: "collapsible" as const,
            id: "dashboards",
            icon: <Home size={16} />,
            title: t("nav.dashboards", "Boshqaruv Panellari"),
            slug: "dashboard",
            children: [
                {
                    type: "link" as const,
                    to: "/admin",
                    title: t("nav.mainDashboard", "Asosiy ERP Paneli"),
                    slug: "dashboard",
                },
                ...(visibility.pos
                    ? [
                          {
                              type: "link" as const,
                              to: "/admin/dashboard/pos",
                              title: t("nav.posDashboard", "POS & Kassa"),
                              slug: "invoices",
                          },
                      ]
                    : []),
                ...(visibility.sales
                    ? [
                          {
                              type: "link" as const,
                              to: "/admin/dashboard/sales",
                              title: t("nav.salesDashboard", "Savdo & Tushum"),
                              slug: "invoices",
                          },
                      ]
                    : []),
                ...(visibility.accounting
                    ? [
                          {
                              type: "link" as const,
                              to: "/admin/dashboard/finance",
                              title: t("nav.financeDashboard", "Moliya & Buxgalteriya"),
                              slug: "accounting",
                          },
                      ]
                    : []),
                ...(visibility.inventory
                    ? [
                          {
                              type: "link" as const,
                              to: "/admin/dashboard/inventory",
                              title: t("nav.inventoryDashboard", "Ombor & Sklad"),
                              slug: "products",
                          },
                      ]
                    : []),
                ...(visibility.crm
                    ? [
                          {
                              type: "link" as const,
                              to: "/admin/dashboard/crm",
                              title: t("nav.crmDashboard", "CRM & Bitimlar"),
                              slug: "contacts",
                          },
                      ]
                    : []),
                ...(visibility.purchases
                    ? [
                          {
                              type: "link" as const,
                              to: "/admin/dashboard/procurement",
                              title: t("nav.procurementDashboard", "Xaridlar & Taʼminot"),
                              slug: "purchases",
                          },
                      ]
                    : []),
                ...(visibility.projects
                    ? [
                          {
                              type: "link" as const,
                              to: "/admin/dashboard/projects",
                              title: t("nav.projectsDashboard", "Loyihalar & Vazifalar"),
                              slug: "dashboard",
                          },
                      ]
                    : []),
                ...(visibility.payroll
                    ? [
                          {
                              type: "link" as const,
                              to: "/admin/dashboard/hrm",
                              title: t("nav.hrmDashboard", "HRM & Xodimlar"),
                              slug: "manage-users",
                          },
                      ]
                    : []),
                ...(visibility.helpdesk
                    ? [
                          {
                              type: "link" as const,
                              to: "/admin/dashboard/support",
                              title: t("nav.supportDashboard", "Mijozlar Yordami"),
                              slug: "dashboard",
                          },
                      ]
                    : []),
            ],
        },



        // =========================================================================
        // 2. POS KASSA TERMINALI (Retail & Restaurant POS)
        // =========================================================================
        ...(visibility.pos
            ? [
                  {
                      type: "collapsible" as const,
                      id: "pos",
                      icon: <Calculator size={16} />,
                      title: t("nav.pos", "POS Kassa Terminali"),
                      slug: "invoices",
                      children: [
                          {
                              type: "link" as const,
                              to: "/admin/pos",
                              title: t("nav.posTerminal", "Kassa Terminali"),
                              slug: "invoices",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/pos/shifts",
                              title: t("nav.posShifts", "Kassa Smenalari & X/Z"),
                              slug: "invoices",
                          },
                      ],
                  },
              ]
            : []),

        // =========================================================================
        // 3. CRM & SAVDO QUVURI (CRM Pipeline)
        // =========================================================================
        ...(visibility.crm
            ? [
                  {
                      type: "collapsible" as const,
                      id: "crm",
                      icon: <Target size={16} />,
                      title: t("nav.crm", "CRM & Savdo Quvuri"),
                      slug: "contacts",
                      children: [
                          {
                              type: "link" as const,
                              to: "/admin/crm/pipeline",
                              title: t("nav.crmPipeline", "Bitimlar Quvuri (Kanban)"),
                              slug: "contacts",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/contacts",
                              title: t("nav.contacts", "Mijozlar & Kontragentlar"),
                              slug: "contacts",
                              addPath: "/admin/contacts/new",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/quotations",
                              title: t("nav.quotations", "Tijorat takliflari"),
                              slug: "quotations",
                              addPath: "/admin/quotations/new",
                          },
                      ],
                  },
              ]
            : []),

        // =========================================================================
        // 4. SAVDO (Sales & Invoices)
        // =========================================================================
        ...(visibility.sales
            ? [
                  {
                      type: "collapsible" as const,
                      id: "sales",
                      icon: <Receipt size={16} />,
                      title: t("nav.sales", "Savdo & Fakturalar"),
                      slug: "sales",
                      children: [
                          {
                              type: "link" as const,
                              to: "/admin/invoices",
                              title: t("nav.invoices", "Hisob-fakturalar"),
                              slug: "invoices",
                              addPath: "/admin/invoices/create-invoice",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/recurring-invoices",
                              title: t("nav.recurringInvoices", "Davriy fakturalar"),
                              slug: "recurring-invoices",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/quotations",
                              title: t("nav.quotations", "Tijorat takliflari"),
                              slug: "quotations",
                              addPath: "/admin/quotations/new",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/credit-notes",
                              title: t("nav.creditNotes", "Kredit-notalar"),
                              slug: "credit-notes",
                              addPath: "/admin/credit-notes/new",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/delivery-challans",
                              title: t("nav.deliveryChallans", "Yuk xatlari (TTN)"),
                              slug: "delivery-challans",
                              addPath: "/admin/delivery-challans/new",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/contacts",
                              title: t("nav.contacts", "Mijozlar & Kontragentlar"),
                              slug: "contacts",
                              addPath: "/admin/contacts/new",
                          },
                      ],
                  },
              ]
            : []),

        // =========================================================================
        // 5. XARIDLAR (Purchases & Bills)
        // =========================================================================
        ...(visibility.purchases
            ? [
                  {
                      type: "collapsible" as const,
                      id: "purchases",
                      icon: <ShoppingBag size={16} />,
                      title: t("nav.purchases", "Xaridlar"),
                      slug: "purchases",
                      children: [
                          {
                              type: "link" as const,
                              to: "/admin/expenses",
                              title: t("nav.expenses", "Xarid fakturalari & Xarajatlar"),
                              slug: "expenses",
                              addPath: "/admin/expenses/new",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/purchase-orders",
                              title: t("nav.purchaseOrders", "Xarid buyurtmalari"),
                              slug: "purchase-orders",
                              addPath: "/admin/purchase-orders/new",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/debit-notes",
                              title: t("nav.debitNotes", "Debet-notalar"),
                              slug: "debit-notes",
                              addPath: "/admin/debit-notes/new",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/suppliers",
                              title: t("nav.suppliers", "Yetkazib beruvchilar"),
                              slug: "suppliers",
                              addPath: "/admin/suppliers/new",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/supplier-balances",
                              title: t("nav.supplierBalances", "Yetkazib beruvchilar balansi"),
                              slug: "purchase-list",
                          },
                      ],
                  },
              ]
            : []),

        // =========================================================================
        // 6. OMBOR VA TOVARLAR (Inventory & Stock)
        // =========================================================================
        ...(visibility.inventory
            ? [
                  {
                      type: "collapsible" as const,
                      id: "products-inventory",
                      icon: <Box size={16} />,
                      title: t("nav.inventory", "Ombor & Tovarlar"),
                      slug: "product-services",
                      children: [
                          {
                              type: "link" as const,
                              to: "/admin/products",
                              title: t("nav.products", "Tovarlar va Xizmatlar"),
                              slug: "product-services",
                              addPath: "/admin/products/new",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/inventory",
                              title: t("nav.stock", "Ombor qoldiqlari"),
                              slug: "inventory",
                              exact: true,
                          },
                          {
                              type: "link" as const,
                              to: "/admin/inventory/cost-layers",
                              title: t("nav.stock", "FIFO Tannarx qatlamlari"),
                              slug: "inventory",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/categories",
                              title: t("nav.categories", "Kategoriyalar"),
                              slug: "product-services",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/units",
                              title: t("nav.units", "Oʻlchov birliklari"),
                              slug: "product-services",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/brands",
                              title: t("nav.products", "Brendlar"),
                              slug: "product-services",
                          },
                      ],
                  },
              ]
            : []),

        // =========================================================================
        // 7. BANK VA KASSA (Bank & Cash)
        // =========================================================================
        ...(visibility.banking
            ? [
                  {
                      type: "collapsible" as const,
                      id: "banking-finance",
                      icon: <LandmarkIcon size={16} />,
                      title: t("nav.banking", "Bank va Kassa"),
                      slug: "banking",
                      children: [
                          {
                              type: "link" as const,
                              to: "/admin/banking",
                              title: t("nav.banking", "Bank hisoblari"),
                              slug: "banking",
                              exact: true,
                          },
                          {
                              type: "link" as const,
                              to: "/admin/banking/transactions",
                              title: t("nav.banking", "Bank Tranzaksiyalari"),
                              slug: "bank-transactions",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/banking/reconciliation",
                              title: t("nav.banking", "Bank akt sverka"),
                              slug: "bank-transactions",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/petty-cash",
                              title: t("nav.pettyCash", "Kassa (Naqd pul)"),
                              slug: "petty-cash",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/my-money",
                              title: t("nav.myMoney", "Pul oqimi (Money Flow)"),
                              slug: "my-money",
                          },
                      ],
                  },
              ]
            : []),

        // =========================================================================
        // 8. LOYIHALAR VA VAZIFALAR (Projects Workspace)
        // =========================================================================
        ...(visibility.projects
            ? [
                  {
                      type: "collapsible" as const,
                      id: "projects",
                      icon: <Briefcase size={16} />,
                      title: t("nav.projects", "Loyihalar & Ish Maydoni"),
                      slug: "accounting",
                      children: [
                          {
                              type: "link" as const,
                              to: "/admin/accounting/projects",
                              title: t("nav.projects", "Loyihalar Taxtasi"),
                              slug: "accounting",
                          },
                      ],
                  },
              ]
            : []),

        // =========================================================================
        // 9. HRM VA OYLIK ISH HAQI (HRM & Payroll)
        // =========================================================================
        ...(visibility.payroll
            ? [
                  {
                      type: "collapsible" as const,
                      id: "payroll",
                      icon: <Users size={16} />,
                      title: t("nav.payroll", "HRM & Oylik Maosh"),
                      slug: "payroll",
                      children: [
                          {
                              type: "link" as const,
                              to: "/admin/payroll/profiles",
                              title: t("nav.payrollProfiles", "Xodimlar & Maosh profillari"),
                              slug: "payroll",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/payroll/runs",
                              title: t("nav.payRuns", "Oylik hisob-kitob (Pay Runs)"),
                              slug: "payroll",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/payroll/tabel",
                              title: t("nav.attendanceTabel", "Ish vaqti hisobi (Tabel)"),
                              slug: "payroll",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/time-tracking/my-timesheet",
                              title: t("nav.timeTracking", "Vaqt hisobi (Timesheet)"),
                              slug: "time-tracking",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/leave/my-leave",
                              title: t("nav.leaves", "Taʼtillar & Ruxsatnomalar"),
                              slug: "time-tracking",
                          },
                      ],
                  },
              ]
            : []),

        // =========================================================================
        // 10. BUXGALTERIYA (Accounting & Ledger)
        // =========================================================================
        ...(visibility.accounting
            ? [
                  {
                      type: "collapsible" as const,
                      id: "accounting",
                      icon: <BookOpen size={16} />,
                      title: t("nav.accounting", "Buxgalteriya"),
                      slug: "accounting",
                      children: [
                          {
                              type: "link" as const,
                              to: "/admin/accounting/chart-of-accounts",
                              title: t("nav.chartOfAccounts", "Hisoblar rejasi (COA)"),
                              slug: "chart-of-accounts",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/accounting/bhms-chart-of-accounts",
                              title: t("nav.bhmsChartOfAccounts", "21-son BHMS Standarti"),
                              slug: "chart-of-accounts",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/accounting/journal-entries",
                              title: t("nav.journalEntries", "Jurnallar & Provodkalar"),
                              slug: "journal-entries",
                              addPath: "/admin/accounting/journal-entries/new",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/accounting/contras",
                              title: t("nav.contras", "Oʻzaro hisob-kitob (Contras)"),
                              slug: "journal-entries",
                              addPath: "/admin/accounting/contras/new",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/accounting/fixed-assets",
                              title: t("nav.fixedAssets", "Asosiy vositalar va eskirish"),
                              slug: "accounting",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/accounting/budgets",
                              title: t("nav.budgets", "Byudjetlar"),
                              slug: "accounting",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/accounting/cost-centers",
                              title: t("nav.costCenters", "Xarajat markazlari"),
                              slug: "accounting",
                          },
                      ],
                  },
              ]
            : []),

        // =========================================================================
        // 11. MOLIYAVIY VA DAVLAT HISOBOTLARI (Reports Hub)
        // =========================================================================
        ...(visibility.reports
            ? [
                  {
                      type: "collapsible" as const,
                      id: "financial-reports",
                      icon: <BarChart2 size={16} />,
                      title: t("nav.financialReports", "Moliyaviy Hisobotlar"),
                      slug: "accounting",
                      children: [
                          {
                              type: "link" as const,
                              to: "/admin/accounting/reports",
                              title: t("nav.allFinancialReports", "Barcha Hisobotlar (Hub)"),
                              slug: "accounting",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/accounting/reports/balance-sheet",
                              title: t("nav.balanceSheet", "Buxgalteriya balansi (1-shakl)"),
                              slug: "accounting",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/accounting/reports/profit-loss",
                              title: t("nav.profitLoss", "Moliyaviy natijalar (2-shakl)"),
                              slug: "accounting",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/accounting/reports/uz-financial-statements",
                              title: t("nav.uzFinancialReports", "1/2-Shakl Davlat Hisobotlari"),
                              slug: "accounting",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/accounting/reports/trial-balance",
                              title: t("nav.trialBalance", "Aylanma vedomost (Oborotka)"),
                              slug: "accounting",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/accounting/reports/general-ledger",
                              title: t("nav.financialReports", "Bosh kitob"),
                              slug: "accounting",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/accounting/reports/soliq-qqs",
                              title: t("nav.soliqQqs", "Soliq QQS 12% Deklaratsiyasi"),
                              slug: "accounting",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/accounting/reports/soliq-jshods",
                              title: t("nav.soliqJshods", "Soliq JShODS & Ijtimoiy Soliq"),
                              slug: "accounting",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/accounting/reports/soliq-aylanma",
                              title: t("nav.soliqAylanma", "Soliq Aylanma Soligʻi 4%"),
                              slug: "accounting",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/accounting/reports/ar-aging",
                              title: t("nav.financialReports", "Debitorlik qarzdorlik tahlili"),
                              slug: "accounting",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/accounting/reports/ap-aging",
                              title: t("nav.financialReports", "Kreditorlik qarzdorlik tahlili"),
                              slug: "accounting",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/e-documents",
                              title: t("nav.eDocuments", "E-Hujjatlar & Akt Sverki"),
                              slug: "invoices",
                          },
                      ],
                  },
              ]
            : []),

        // =========================================================================
        // 12. MIJOZLAR YORDAM MARKAZI (Helpdesk & Support)
        // =========================================================================
        ...(visibility.helpdesk
            ? [
                  {
                      type: "collapsible" as const,
                      id: "helpdesk",
                      icon: <Headphones size={16} />,
                      title: t("nav.helpdesk", "Yordam Markazi (Helpdesk)"),
                      slug: "contacts",
                      children: [
                          {
                              type: "link" as const,
                              to: "/admin/helpdesk/tickets",
                              title: t("nav.supportTickets", "Murojaatlar & Tiketlar"),
                              slug: "contacts",
                          },
                      ],
                  },
              ]
            : []),

        // =========================================================================
        // 13. SOZLAMALAR VA MAʼMURIYAT (Settings & Admin)
        // =========================================================================
        { type: "header", title: t("nav.settings", "Sozlamalar va Maʼmuriyat"), slug: "settings" },
        {
            type: "collapsible",
            id: "users-roles",
            icon: <MdSecurity size={16} />,
            title: t("nav.users", "Maʼmuriyat & Rollar"),
            slug: "manage-users",
            children: [
                {
                    type: "link",
                    to: "/admin/saas/clients",
                    title: t("nav.saasClients", "👑 SaaS Mijozlar (Tenants)"),
                    slug: "manage-users",
                },
                {
                    type: "link",
                    to: "/admin/users",
                    title: t("nav.users", "Foydalanuvchilar"),
                    slug: "manage-users",
                },
                {
                    type: "link",
                    to: "/admin/roles",
                    title: t("nav.roles", "Rollar va Ruxsatlar"),
                    slug: "manage-users",
                },
                {
                    type: "link",
                    to: "/admin/activity-log",
                    title: t("nav.activityLog", "Audit jurnali"),
                    slug: "activity-log",
                },

            ],
        },
        ...(visibility.settings
            ? [
                  {
                      type: "collapsible" as const,
                      id: "settings",
                      icon: <Settings size={16} />,
                      title: t("nav.settings", "Tizim Sozlamalari"),
                      slug: "settings",
                      children: [
                          {
                              type: "link" as const,
                              to: "/admin/settings/edi-settings",
                              title: t("nav.ediSettings", "E-IMZO & E-Faktura sozlamalari"),
                              slug: "settings",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/settings/uz-gateways",
                              title: t("nav.paymentGateways", "Toʻlov tizimlari"),
                              slug: "settings",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/settings/subscription-plans",
                              title: t("nav.subscriptionPlans", "Obuna va Tariflar"),
                              slug: "settings",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/settings/company-settings",
                              title: t("nav.companySettings", "Korxona rekvizitlari"),
                              slug: "settings",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/settings/localization",
                              title: t("nav.localization", "Valyuta va Lokalizatsiya"),
                              slug: "settings",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/settings/bank-accounts",
                              title: t("nav.banking", "Bank hisoblari"),
                              slug: "settings",
                          },
                          {
                              type: "link" as const,
                              to: "/admin/settings/translations",
                              title: t("nav.translations", "Tarjimalar va Matnlar"),
                              slug: "settings",
                          },
                      ],
                  },
              ]
            : []),
    ];

    return items;
};


// --- Helper Functions ---
function canView(
    slug: string,
    permissions: PermissionSet[],
    user: any
): boolean {
    if (user?.user_type === 1) return true;
    const p = permissions.find((perm) => perm.moduleSlug === slug);
    return p ? p.view : true;
}

function resolveSidebarPath(pathname: string): string {
    if (
        pathname.startsWith("/admin/invoices/create-invoice") ||
        pathname.startsWith("/admin/invoices/edit/") ||
        pathname.startsWith("/admin/view-invoice/")
    ) {
        return "/admin/invoices";
    }
    if (
        pathname.startsWith("/admin/contacts/new") ||
        pathname.startsWith("/admin/contacts/edit/") ||
        pathname.startsWith("/admin/contacts/")
    ) {
        return "/admin/contacts";
    }
    return pathname;
}

const findActiveMenuPath = (
    items: NavItemType[],
    pathname: string
): string[] => {
    for (const item of items) {
        if (item.type === "link") {
            const isMatch = item.exact
                ? pathname === item.to
                : pathname === item.to || pathname.startsWith(`${item.to}/`);
            if (isMatch) return [item.to];
        } else if (item.type === "collapsible") {
            const childPath = findActiveMenuPath(item.children, pathname);
            if (childPath.length > 0) return [item.id, ...childPath];
        }
    }
    return [];
};

const findPathToId = (
    items: NavItemType[],
    targetId: string,
    currentPath: string[] = []
): string[] => {
    for (const item of items) {
        if (item.type === "collapsible") {
            const newPath = [...currentPath, item.id];
            if (item.id === targetId) return newPath;
            const foundPath = findPathToId(item.children, targetId, newPath);
            if (foundPath.length > 0) return foundPath;
        }
    }
    return [];
};

// --- NavItem Component ---
interface NavItemProps {
    item: NavLinkItem;
    isSidebarOpen: boolean;
    permissions: PermissionSet[];
    user: any;
}

const NavItem: React.FC<NavItemProps> = ({
    item,
    isSidebarOpen,
    permissions,
    user,
}) => {
    const { pathname } = useLocation();
    const isMainActive = item.exact
        ? pathname === item.to
        : pathname === item.to || pathname.startsWith(`${item.to}/`);
    const isAddActive = item.addPath ? pathname === item.addPath : false;

    if (!canView(item.slug, permissions, user)) return null;

    return (
        <div className="flex items-center group relative mb-0.5">
            <NavLink
                to={item.to}
                end={item.exact}
                onClick={() => {
                    if (item.to === "/admin" || item.to === "/admin/" || item.to === "/admin/dashboard") {
                        localStorage.setItem("sapar_workspace_mode", "all");
                        window.dispatchEvent(new CustomEvent("sapar-workspace-change", { detail: "all" }));
                    }
                }}
                className={({ isActive }) =>
                    `flex items-center w-full px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-150 ${
                        isActive || isMainActive
                            ? "bg-teal-700 text-white shadow-xs font-bold"
                            : "text-slate-700 hover:bg-slate-200/70 hover:text-slate-900"
                    }`
                }
            >
                {item.icon && (
                    <span className="shrink-0">{item.icon}</span>
                )}
                <span
                    className={`ml-2.5 transition-opacity duration-200 whitespace-nowrap truncate ${
                        isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                >
                    {item.title}
                </span>
            </NavLink>

            {item.addPath && isSidebarOpen && (
                <Link
                    to={item.addPath}
                    className={`absolute right-1 p-1 rounded-lg transition-colors ${
                        isAddActive
                            ? "bg-teal-800 text-white"
                            : "text-slate-400 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                >
                    <Plus size={13} />
                </Link>
            )}
        </div>
    );
};

// --- CollapsibleNavItem Component ---
interface CollapsibleNavItemProps {
    item: NavCollapsibleItem;
    isSidebarOpen: boolean;
    openMenus: Record<string, boolean>;
    activePath: string[];
    onToggle: (id: string) => void;
    level?: number;
    permissions: PermissionSet[];
    user: any;
}

const CollapsibleNavItem: React.FC<CollapsibleNavItemProps> = ({
    item,
    isSidebarOpen,
    openMenus,
    activePath,
    onToggle,
    permissions,
    user,
}) => {
    const isSubMenuOpen = !!openMenus[item.id];
    const isParentOfActive = activePath.includes(item.id);

    return (
        <div className="mb-0.5">
            <button
                type="button"
                onClick={() => onToggle(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-150 ${
                    isParentOfActive
                        ? "bg-slate-200/80 text-teal-900 font-bold"
                        : "text-slate-700 hover:bg-slate-200/60 hover:text-slate-900"
                }`}
            >
                <div className="flex items-center truncate">
                    {item.icon && <span className="shrink-0">{item.icon}</span>}
                    <span
                        className={`ml-2.5 transition-opacity duration-200 whitespace-nowrap truncate ${
                            isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                    >
                        {item.title}
                    </span>
                </div>
                {isSidebarOpen && (
                    <ChevronDown
                        size={14}
                        className={`text-slate-400 transform transition-transform duration-200 ${
                            isSubMenuOpen ? "rotate-180 text-teal-700" : ""
                        }`}
                    />
                )}
            </button>

            {isSubMenuOpen && isSidebarOpen && (
                <div className="pl-3.5 mt-0.5 space-y-0.5 border-l-2 border-slate-200 ml-3">
                    {item.children.map((child) => (
                        child.type === "link" ? (
                            <NavItem
                                key={child.to}
                                item={child}
                                isSidebarOpen={isSidebarOpen}
                                permissions={permissions}
                                user={user}
                            />
                        ) : null
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main Sidebar Component ---
interface SidebarProps {
    isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const { pathname } = useLocation();
    const { user } = useSelector((state: RootState) => state.auth);
    const { data: systemSettings } = useSelector(
        (state: RootState) => state.systemSettings
    );
    const permissions = systemSettings?.permissions || [];

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

    // Sync customized active modules from server for current business
    useEffect(() => {
        axios.get('/api/admin/saas/my-modules')
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

    const navigate = useNavigate();
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
    const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>(() => {
        try {
            const saved = localStorage.getItem("sapar_workspace_mode");
            if (saved && WORKSPACE_MODES.some((m) => m.id === saved)) {
                return saved as WorkspaceMode;
            }
            return "all";
        } catch {
            return "all";
        }
    });

    const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);

    useEffect(() => {
        const handleWorkspaceChange = (e: any) => {
            if (e.detail && WORKSPACE_MODES.some((m) => m.id === e.detail)) {
                setWorkspaceMode(e.detail);
            }
        };
        window.addEventListener("sapar-workspace-change", handleWorkspaceChange);
        return () => window.removeEventListener("sapar-workspace-change", handleWorkspaceChange);
    }, []);

    // If navigating to main dashboard/admin, automatically show all modules
    useEffect(() => {
        if (pathname === "/admin" || pathname === "/admin/" || pathname === "/admin/dashboard" || pathname === "/dashboard") {
            if (workspaceMode !== "all") {
                setWorkspaceMode("all");
                localStorage.setItem("sapar_workspace_mode", "all");
            }
        }
    }, [pathname, workspaceMode]);

    const handleSelectWorkspaceMode = (mode: WorkspaceMode, defaultRoute?: string) => {
        setWorkspaceMode(mode);
        localStorage.setItem("sapar_workspace_mode", mode);
        window.dispatchEvent(new CustomEvent("sapar-workspace-change", { detail: mode }));
        setIsWorkspaceDropdownOpen(false);
        if (defaultRoute) {
            navigate(defaultRoute);
        }
    };

    const toggleModule = (key: keyof ModuleVisibility) => {
        const next = { ...visibility, [key]: !visibility[key] };
        setVisibility(next);
        localStorage.setItem("sapar_sidebar_modules", JSON.stringify(next));
    };

    const { t } = useTranslation();
    const navItems = useMemo(
        () => getNavItems(visibility, t, workspaceMode),
        [visibility, t, workspaceMode]
    );

    const activeWorkspaceOption =
        WORKSPACE_MODES.find((m) => m.id === workspaceMode) || WORKSPACE_MODES[0];


    const activePath = useMemo(
        () => findActiveMenuPath(navItems, resolveSidebarPath(pathname)),
        [pathname, navItems]
    );
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const newOpenState: Record<string, boolean> = {};
        activePath.forEach((id) => {
            newOpenState[id] = true;
        });
        setOpenMenus(newOpenState);
    }, [activePath]);

    const handleToggle = (id: string) => {
        setOpenMenus((prev) => {
            const isCurrentlyOpen = !!prev[id];
            if (isCurrentlyOpen) {
                const path = findPathToId(navItems, id);
                const parentPath = path.slice(0, -1);
                const newOpenState: Record<string, boolean> = {};
                parentPath.forEach((pathId) => {
                    newOpenState[pathId] = true;
                });
                return newOpenState;
            } else {
                const pathToOpen = findPathToId(navItems, id);
                const newOpenState: Record<string, boolean> = {};
                pathToOpen.forEach((pathId) => {
                    newOpenState[pathId] = true;
                });
                return newOpenState;
            }
        });
    };

    const filterNavItems = useMemo(() => {
        function filter(items: NavItemType[]): NavItemType[] {
            return items
                .map((item) => {
                    if (item.type === "header") return item;
                    if (!canView(item.slug, permissions, user)) return null;
                    if (item.type === "collapsible") {
                        const visibleChildren = filter(item.children);
                        if (visibleChildren.length > 0) {
                            return { ...item, children: visibleChildren as NavLinkItem[] };
                        }
                        return null;
                    }
                    return item;
                })
                .filter(Boolean) as NavItemType[];
        }
        return filter(navItems);
    }, [permissions, user, navItems]);

    return (
        <>
            <aside
                className={`bg-slate-50 text-slate-900 flex flex-col h-screen transition-all duration-300 ease-in-out z-20 border-r border-slate-200 ${
                    isOpen ? "w-64" : "w-20"
                }`}
            >
                {/* Header Logo */}
                <div className="px-4 flex items-center h-14 border-b border-slate-200/60 bg-white/50">
                    <Link
                        to="/admin"
                        className="flex items-center gap-2.5 overflow-hidden transition-all duration-200"
                        title="SAPAR ERP"
                    >
                        {isOpen ? (
                            <SaparLogo variant="dark" className="h-7 w-auto" />
                        ) : (
                            <div className="flex items-center justify-center w-full">
                                <svg
                                    width="26"
                                    height="28"
                                    viewBox="0 0 41 45"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="shrink-0"
                                >
                                    <path
                                        d="M0.571411 14.4812V25.6239L7.62723 21.7237V14.8521L18.3063 8.90914L11.4419 4.82776L3.89365 8.95446C1.84171 10.0763 0.571411 12.1895 0.571411 14.4812Z"
                                        fill="#02C39A"
                                    />
                                    <path
                                        d="M41 30.0855V18.9429L33.9442 22.843V29.7146L23.2651 35.6576L30.1295 39.739L37.6778 35.6123C39.7298 34.4904 41 32.3772 41 30.0855Z"
                                        fill="#028090"
                                    />
                                    <path
                                        d="M40.6892 14.0206L40.8093 15.6004L33.7535 19.3148V14.8575L13.7302 4.08136L20.5946 0L37.3268 8.93073C39.2607 9.96294 40.5263 11.8787 40.6892 14.0206Z"
                                        fill="#0B2B33"
                                    />
                                    <path
                                        d="M0.12016 30.925L0 29.3451L7.05584 25.6307V30.088L27.0791 40.8642L20.2147 44.9456L3.48254 36.0148C1.54864 34.9826 0.283068 33.0668 0.12016 30.925Z"
                                        fill="#0B2B33"
                                    />
                                </svg>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Workspace Mode Selector */}
                {isOpen ? (
                    <div className="px-3 pt-3 pb-1">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
                                className="w-full flex items-center justify-between p-2 rounded-2xl bg-white hover:bg-slate-100/90 border border-slate-200/90 text-slate-800 text-xs font-bold transition-all shadow-2xs group"
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <span className="text-base leading-none">{activeWorkspaceOption.icon}</span>
                                    <div className="text-left truncate">
                                        <div className="text-[11px] font-black text-slate-900 leading-tight truncate">
                                            {activeWorkspaceOption.titleUz}
                                        </div>
                                        <div className="text-[9px] text-teal-700 font-semibold">
                                            {workspaceMode === "all" ? "Barcha ERP Modullari" : "Faqat shu modul koʻrinadi"}
                                        </div>
                                    </div>
                                </div>
                                <ChevronDown
                                    size={14}
                                    className={`text-slate-400 shrink-0 transition-transform ${
                                        isWorkspaceDropdownOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {/* Dropdown menu */}
                            {isWorkspaceDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsWorkspaceDropdownOpen(false)}
                                    />
                                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-1.5 space-y-0.5 animate-in zoom-in-95 duration-100 max-h-80 overflow-y-auto">
                                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                                            <span>Ish Maydonini Tanlang</span>
                                            <Sparkles size={11} className="text-teal-600" />
                                        </div>
                                        {WORKSPACE_MODES.map((m) => {
                                            const isSelected = workspaceMode === m.id;
                                            return (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    onClick={() => handleSelectWorkspaceMode(m.id, m.defaultRoute)}
                                                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all text-left ${
                                                        isSelected
                                                            ? "bg-teal-50 text-teal-900 border border-teal-200"
                                                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 truncate">
                                                        <span>{m.icon}</span>
                                                        <span className="truncate">{m.titleUz}</span>
                                                    </div>
                                                    <span
                                                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold shrink-0 ${
                                                            isSelected
                                                                ? "bg-teal-600 text-white"
                                                                : "bg-slate-100 text-slate-500"
                                                        }`}
                                                    >
                                                        {m.badge}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="pt-2 px-2 flex justify-center">
                        <button
                            type="button"
                            title={activeWorkspaceOption.titleUz}
                            onClick={() => setIsWorkspaceDropdownOpen(true)}
                            className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-lg flex items-center justify-center shadow-2xs hover:bg-slate-100 transition-colors"
                        >
                            {activeWorkspaceOption.icon}
                        </button>
                    </div>
                )}

                {/* Navigation Items List */}
                <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">

                    {filterNavItems.map((item, index) => {
                        switch (item.type) {
                            case "header":
                                return (
                                    <p
                                        key={index}
                                        className={`${
                                            index > 0 ? "mt-4 pt-2" : ""
                                        } mb-1 px-2 text-[10px] font-bold text-slate-400 uppercase ${
                                            index > 0 ? "border-t border-slate-200" : ""
                                        } tracking-wider transition-opacity duration-300 ease-in-out ${
                                            isOpen ? "opacity-100" : "hidden"
                                        }`}
                                    >
                                        {item.title}
                                    </p>
                                );
                            case "link":
                                return (
                                    <NavItem
                                        key={item.to}
                                        item={item}
                                        isSidebarOpen={isOpen}
                                        permissions={permissions}
                                        user={user}
                                    />
                                );
                            case "collapsible":
                                return (
                                    <CollapsibleNavItem
                                        key={item.id}
                                        item={item}
                                        isSidebarOpen={isOpen}
                                        openMenus={openMenus}
                                        activePath={activePath}
                                        onToggle={handleToggle}
                                        level={1}
                                        permissions={permissions}
                                        user={user}
                                    />
                                );
                            default:
                                return null;
                        }
                    })}

                    {/* Customize Modules Button */}
                    {isOpen && (
                        <div className="pt-4 border-t border-slate-200 mt-4">
                            <button
                                type="button"
                                onClick={() => setIsCustomizeModalOpen(true)}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 transition border border-teal-200"
                            >
                                <span className="flex items-center gap-2">
                                    <SlidersHorizontal size={14} className="text-teal-700" />
                                    Menyuni Moslashtirish
                                </span>
                                <span className="text-[10px] font-normal text-teal-600 bg-white px-1.5 py-0.5 rounded-full border border-teal-200">
                                    Filter
                                </span>
                            </button>
                        </div>
                    )}
                </nav>

                {/* Side Navigation Language Switcher */}
                <div className="px-3 py-2 border-t border-slate-200/80 bg-slate-50/50">
                    <LanguageSwitcher variant="sidebar" isSidebarOpen={isOpen} />
                </div>

                {isOpen && <BottomBar />}
            </aside>

            {/* Modal: Customize Sidebar & Modules Visibility */}
            {isCustomizeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-lg border border-slate-200 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="w-5 h-5 text-teal-700" />
                                <h3 className="text-base font-bold text-slate-900">
                                    Menyu Modullarini Moslashtirish
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
                                className="text-xs text-slate-600"
                            >
                                Hammasini Yoqish
                            </Button>
                        </div>

                        <p className="text-xs text-slate-500">
                            Korxonangiz faoliyatiga mos menyu modullarini tanlang yoki keraksizlarini yashiring:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto p-1">
                            {[
                                { key: "pos", label: "🛒 POS Kassa Terminali", desc: "Chakana savdo va chek chiqarish" },
                                { key: "crm", label: "💼 CRM & Bitimlar Quvuri", desc: "Mijozlar quvuri va savdo bitimlari" },
                                { key: "sales", label: "🧾 Savdo & Hisob-fakturalar", desc: "Fakturalar, TTN va takliflar" },
                                { key: "purchases", label: "🛍️ Xaridlar & Buyurtmalar", desc: "Taʼminotchilar va xaridlar" },
                                { key: "inventory", label: "📦 Ombor & Tovarlar", desc: "Qoldiqlar, FIFO tannarx va tovarlar" },
                                { key: "banking", label: "🏦 Bank va Kassa (Cash)", desc: "Hisoblar, naqd pul va xarajatlar" },
                                { key: "accounting", label: "📖 Buxgalteriya & Provodkalar", desc: "Hisoblar rejasi va jurnallar" },
                                { key: "reports", label: "📊 Moliyaviy Hisobotlar", desc: "P&L, Balans va aylanma vedomost" },
                                { key: "projects", label: "📁 Loyihalar Ish Maydoni", desc: "Vazifalar Kanban va rentabellik" },
                                { key: "payroll", label: "👥 HRM & Ish Haqi", desc: "Oylik tabel va maosh hisoblash" },
                                { key: "helpdesk", label: "🎧 Yordam Markazi (Helpdesk)", desc: "Mijozlar murojaatlari va xizmat" },
                                { key: "settings", label: "⚙️ Tizim Sozlamalari", desc: "E-IMZO, Payme, Click va rekvizitlar" },
                            ].map((m) => {
                                const isVisible = visibility[m.key as keyof ModuleVisibility];
                                return (
                                    <button
                                        key={m.key}
                                        type="button"
                                        onClick={() => toggleModule(m.key as keyof ModuleVisibility)}
                                        className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
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
                                className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6"
                            >
                                Saqlash va Yopish
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
