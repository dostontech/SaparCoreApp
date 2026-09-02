import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
    Home,
    ShoppingCart,
    Receipt,
    Package,
    LandmarkIcon,
    BookOpen,
    BarChart2,
    Target,
    Users,
    Briefcase,
    Headphones,
    Settings,
    Search,
    Star,
    Sparkles,
    PanelLeftClose,
    PanelLeftOpen,
    DollarSign,
    FileCheck2,
    LogOut,
    UserCircle2,
    Building,
    ChevronRight,
} from "lucide-react";
import type { RootState, AppDispatch } from "@store/index";
import { logout } from "@store/auth/authSlice";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@components/ui/Accordion";
import { SimpleTooltip } from "@components/ui/Tooltip";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@components/ui/DropdownMenu";

export interface NavSubItem {
    title: string;
    to: string;
    badge?: string;
    exact?: boolean;
}

export interface NavModule {
    id: string;
    title: string;
    icon: React.ReactNode;
    defaultRoute: string;
    badge?: string;
    items: NavSubItem[];
}

export interface NavDomainGroup {
    id: string;
    title: string;
    icon: React.ReactNode;
    modules: NavModule[];
}

interface UnifiedSidebarProps {
    isOpen?: boolean;
}

const DEFAULT_PINNED_ROUTES: string[] = [
    "/admin",
    "/admin/pos",
    "/admin/invoices",
    "/admin/inventory",
    "/admin/banking",
];

export const UnifiedSidebar: React.FC<UnifiedSidebarProps> = ({
    isOpen = true,
}) => {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const dispatch: AppDispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

    // Collapsed icon-only mode toggle (persisted)
    const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
        return localStorage.getItem("sapar_sidebar_collapsed") === "true";
    });

    const toggleCollapse = () => {
        setIsCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem("sapar_sidebar_collapsed", String(next));
            return next;
        });
    };

    // Pinned Favorites (persisted)
    const [pinnedRoutes, setPinnedRoutes] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem("sapar_pinned_favorites");
            return saved ? JSON.parse(saved) : DEFAULT_PINNED_ROUTES;
        } catch {
            return DEFAULT_PINNED_ROUTES;
        }
    });

    const togglePin = (to: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setPinnedRoutes((prev) => {
            const next = prev.includes(to)
                ? prev.filter((r) => r !== to)
                : [...prev, to];
            localStorage.setItem("sapar_pinned_favorites", JSON.stringify(next));
            return next;
        });
    };

    // Live menu search query
    const [searchQuery, setSearchQuery] = useState("");

    // 4 Core Business Domains definition
    const domainGroups: NavDomainGroup[] = useMemo(
        () => [
            {
                id: "operations",
                title: "Operatsiyalar",
                icon: <ShoppingCart size={15} className="text-teal-400" />,
                modules: [
                    {
                        id: "pos",
                        title: t("workspace.pos", "POS Kassa Terminali"),
                        icon: <ShoppingCart size={16} />,
                        defaultRoute: "/admin/pos",
                        badge: "⚡",
                        items: [
                            { title: t("nav.posTerminal", "Kassa Terminali"), to: "/admin/pos", exact: true },
                            { title: "Smenalar va X/Z hisobot", to: "/admin/pos/shifts" },
                            { title: "Kassirlar jurnali", to: "/admin/pos/cashiers" },
                        ],
                    },
                    {
                        id: "sales",
                        title: t("nav.sales", "Savdo & Fakturalar"),
                        icon: <Receipt size={16} />,
                        defaultRoute: "/admin/invoices",
                        badge: "TTN",
                        items: [
                            { title: t("nav.invoices", "Hisob-fakturalar"), to: "/admin/invoices" },
                            { title: t("nav.quotations", "Tijorat takliflari"), to: "/admin/quotations" },
                            { title: t("nav.deliveryChallans", "Yuk xatlari (TTN)"), to: "/admin/delivery-challans" },
                            { title: t("nav.creditNotes", "Kredit-notalar"), to: "/admin/credit-notes" },
                            { title: t("nav.recurringInvoices", "Davriy fakturalar"), to: "/admin/recurring-invoices" },
                        ],
                    },
                    {
                        id: "purchases",
                        title: t("nav.purchases", "Xaridlar & Taʼminot"),
                        icon: <DollarSign size={16} />,
                        defaultRoute: "/admin/purchases",
                        items: [
                            { title: t("nav.purchases", "Xarid fakturalari"), to: "/admin/purchases" },
                            { title: t("nav.purchaseOrders", "Xarid buyurtmalari"), to: "/admin/purchase-orders" },
                            { title: t("nav.supplierBalances", "Yetkazib beruvchilar balansi"), to: "/admin/supplier-balances" },
                            { title: t("nav.supplierPayments", "Yetkazib beruvchilarga toʻlov"), to: "/admin/supplier-payments" },
                            { title: t("nav.debitNotes", "Debet-notalar"), to: "/admin/debit-notes" },
                        ],
                    },
                ],
            },
            {
                id: "finance",
                title: "Moliya & Soliq",
                icon: <LandmarkIcon size={15} className="text-emerald-400" />,
                modules: [
                    {
                        id: "accounting",
                        title: t("nav.accounting", "Buxgalteriya & Provodkalar"),
                        icon: <BookOpen size={16} />,
                        defaultRoute: "/admin/accounting/chart-of-accounts",
                        items: [
                            { title: t("nav.chartOfAccounts", "Hisoblar rejasi"), to: "/admin/accounting/chart-of-accounts" },
                            { title: t("nav.journalEntries", "Bosh kitob & Provodkalar"), to: "/admin/accounting/journal-entries" },
                            { title: "Valyuta kurslari & Qayta baholash", to: "/admin/accounting/forex" },
                        ],
                    },
                    {
                        id: "banking",
                        title: t("nav.bankingGroup", "Bank & Kassa"),
                        icon: <LandmarkIcon size={16} />,
                        defaultRoute: "/admin/banking",
                        items: [
                            { title: "Bank hisoblari & Kassa", to: "/admin/banking" },
                            { title: "1C:ClientBank import", to: "/admin/banking/bank-statement-parser" },
                            { title: "Xarajatlar & Cheklar", to: "/admin/expenses" },
                        ],
                    },
                    {
                        id: "e-documents",
                        title: "Soliq & E-Faktura (Didox)",
                        icon: <FileCheck2 size={16} />,
                        defaultRoute: "/admin/e-documents",
                        badge: "QQS 12%",
                        items: [
                            { title: "E-Faktura & Soliq EDI", to: "/admin/e-documents" },
                            { title: "QQS va Soliq deklaratsiyalari", to: "/admin/accounting/tax-returns" },
                            { title: "Akt sverki (Taqqoslash)", to: "/admin/e-documents/reconciliation" },
                            { title: "Ishonchnomalar (Doverennost)", to: "/admin/e-documents/power-of-attorney" },
                        ],
                    },
                ],
            },
            {
                id: "resources",
                title: "Ombor & Jamoa",
                icon: <Package size={15} className="text-cyan-400" />,
                modules: [
                    {
                        id: "inventory",
                        title: t("workspace.inventory", "Ombor & Tovarlar"),
                        icon: <Package size={16} />,
                        defaultRoute: "/admin/inventory",
                        items: [
                            { title: "Ombor qoldiqlari", to: "/admin/inventory" },
                            { title: "Tovarlar va Xizmatlar", to: "/admin/products" },
                            { title: "Omborlararo koʻchirish", to: "/admin/inventory/transfers" },
                            { title: "Inventarizatsiya & Hisobdan chiqarish", to: "/admin/inventory/audits" },
                            { title: "Kategoriyalar va Brendlar", to: "/admin/categories" },
                        ],
                    },
                    {
                        id: "crm",
                        title: t("workspace.crm", "CRM & Bitimlar"),
                        icon: <Target size={16} />,
                        defaultRoute: "/admin/crm/deals",
                        items: [
                            { title: "Mijozlar & Kontaktlar", to: "/admin/contacts" },
                            { title: "Bitimlar (Kanban)", to: "/admin/crm/deals" },
                            { title: "Kompaniyalar katalogi", to: "/admin/crm/companies" },
                        ],
                    },
                    {
                        id: "hrm",
                        title: t("workspace.hrm", "HRM & Xodimlar"),
                        icon: <Users size={16} />,
                        defaultRoute: "/admin/payroll/tabel",
                        items: [
                            { title: "Xodimlar tabeli", to: "/admin/payroll/tabel" },
                            { title: "Ish haqi & Maoshlar", to: "/admin/payroll/salaries" },
                            { title: "Taʼtillar & Ruxsatlar", to: "/admin/payroll/leaves" },
                        ],
                    },
                    {
                        id: "projects",
                        title: t("workspace.projects", "Loyihalar & Vazifalar"),
                        icon: <Briefcase size={16} />,
                        defaultRoute: "/admin/projects",
                        items: [
                            { title: "Barcha loyihalar", to: "/admin/projects" },
                            { title: "Vazifalar doskasi", to: "/admin/projects/tasks" },
                        ],
                    },
                ],
            },
            {
                id: "management",
                title: "Boshqaruv & Tizim",
                icon: <BarChart2 size={15} className="text-amber-400" />,
                modules: [
                    {
                        id: "reports",
                        title: t("nav.financialReports", "Moliyaviy Hisobotlar"),
                        icon: <BarChart2 size={16} />,
                        defaultRoute: "/admin/accounting/reports",
                        items: [
                            { title: "Barcha moliyaviy hisobotlar", to: "/admin/accounting/reports" },
                            { title: "Foyda va zararlar (2-shakl)", to: "/admin/accounting/reports/profit-and-loss" },
                            { title: "Buxgalteriya balansi (1-shakl)", to: "/admin/accounting/reports/balance-sheet" },
                            { title: "Aylanma vedomost (Oborotka)", to: "/admin/accounting/reports/trial-balance" },
                        ],
                    },
                    {
                        id: "support",
                        title: t("workspace.support", "Mijozlar Yordami"),
                        icon: <Headphones size={16} />,
                        defaultRoute: "/admin/helpdesk",
                        items: [
                            { title: "Murojaatlar (Tiketlar)", to: "/admin/helpdesk" },
                        ],
                    },
                    {
                        id: "settings",
                        title: t("nav.settings", "Tizim Sozlamalari"),
                        icon: <Settings size={16} />,
                        defaultRoute: "/admin/settings/company-settings",
                        items: [
                            { title: "Korxona rekvizitlari", to: "/admin/settings/company-settings" },
                            { title: "E-IMZO raqamli kalit", to: "/admin/settings/e-imzo" },
                            { title: "Integratsiyalar & API", to: "/admin/settings/integrations" },
                            { title: "Foydalanuvchilar va rollar", to: "/admin/settings/users" },
                        ],
                    },
                    {
                        id: "design_system",
                        title: "UI Design System",
                        icon: <Sparkles size={16} className="text-purple-400" />,
                        defaultRoute: "/admin/design-system",
                        badge: "RADIX",
                        items: [
                            { title: "Radix UI Komponentlar", to: "/admin/design-system" },
                        ],
                    },
                ],
            },
        ],
        [t]
    );

    // Flatten all items for quick lookup and favorites
    const allItems = useMemo(() => {
        const list: { title: string; to: string; icon: React.ReactNode; domainTitle: string }[] = [
            {
                title: "Boshqaruv Paneli",
                to: "/admin",
                icon: <Home size={15} />,
                domainTitle: "Asosiy",
            },
        ];
        domainGroups.forEach((d) => {
            d.modules.forEach((m) => {
                m.items.forEach((item) => {
                    list.push({
                        title: item.title,
                        to: item.to,
                        icon: m.icon,
                        domainTitle: d.title,
                    });
                });
            });
        });
        return list;
    }, [domainGroups]);

    // Pinned favorites objects
    const favoriteItems = useMemo(() => {
        return pinnedRoutes
            .map((route) => allItems.find((item) => item.to === route))
            .filter((item): item is NonNullable<typeof item> => Boolean(item));
    }, [pinnedRoutes, allItems]);

    // Active domain detection to expand default accordion
    const activeDomainId = useMemo(() => {
        for (const group of domainGroups) {
            for (const mod of group.modules) {
                for (const item of mod.items) {
                    if (item.exact ? pathname === item.to : pathname.startsWith(item.to)) {
                        return group.id;
                    }
                }
            }
        }
        return "operations";
    }, [pathname, domainGroups]);

    // Filtered domains when search query is typed
    const filteredDomains = useMemo(() => {
        if (!searchQuery.trim()) return domainGroups;
        const q = searchQuery.toLowerCase();
        return domainGroups
            .map((group) => {
                const matchedModules = group.modules
                    .map((mod) => {
                        const matchedItems = mod.items.filter(
                            (i) => i.title.toLowerCase().includes(q) || i.to.toLowerCase().includes(q)
                        );
                        if (matchedItems.length > 0 || mod.title.toLowerCase().includes(q)) {
                            return {
                                ...mod,
                                items: matchedItems.length > 0 ? matchedItems : mod.items,
                            };
                        }
                        return null;
                    })
                    .filter((m): m is NavModule => Boolean(m));

                if (matchedModules.length > 0 || group.title.toLowerCase().includes(q)) {
                    return { ...group, modules: matchedModules };
                }
                return null;
            })
            .filter((g): g is NavDomainGroup => Boolean(g));
    }, [domainGroups, searchQuery]);

    const isRouteActive = (to: string, exact?: boolean) => {
        if (exact) return pathname === to;
        if (to === "/admin") return pathname === "/admin" || pathname === "/admin/";
        return pathname.startsWith(to);
    };

    if (!isOpen) return null;

    return (
        <aside
            className={`h-screen flex flex-col bg-[#081F26] border-r border-[#0E353F] transition-all duration-300 ease-in-out select-none shrink-0 z-40 text-slate-200 ${
                isCollapsed ? "w-[68px]" : "w-[264px]"
            }`}
        >
            {/* 1. Header: Brand Logo & Collapse Toggle */}
            <div className="h-14 px-3 flex items-center justify-between border-b border-[#0E353F] shrink-0">
                {!isCollapsed ? (
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-[#081F26] font-black text-sm shadow-md shrink-0">
                            S
                        </div>
                        <div className="flex flex-col truncate">
                            <span className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1">
                                SAPAR <span className="text-[10px] font-bold text-teal-400">ERP</span>
                            </span>
                            <span className="text-[10px] text-slate-400 truncate">
                                Central Asia v2.9
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="w-full flex justify-center">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-[#081F26] font-black text-sm shadow-md">
                            S
                        </div>
                    </div>
                )}

                {!isCollapsed && (
                    <button
                        type="button"
                        onClick={toggleCollapse}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
                        title="Panelni kichraytirish"
                    >
                        <PanelLeftClose size={16} />
                    </button>
                )}
            </div>

            {/* Collapsed Mode Expand Button */}
            {isCollapsed && (
                <div className="p-2 border-b border-[#0E353F] flex justify-center">
                    <button
                        type="button"
                        onClick={toggleCollapse}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
                        title="Panelni kengaytirish"
                    >
                        <PanelLeftOpen size={16} />
                    </button>
                </div>
            )}

            {/* 2. Search & Command Filter (Expanded mode only) */}
            {!isCollapsed && (
                <div className="p-3 pb-1 border-b border-[#0E353F]/60 shrink-0">
                    <div className="relative">
                        <Search
                            size={14}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Menyuni qidirish..."
                            className="w-full pl-8 pr-3 py-1.5 bg-[#0B2B33]/80 text-xs rounded-xl border border-[#13434E] text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 transition"
                        />
                    </div>
                </div>
            )}

            {/* 3. Scrollable Navigation List */}
            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
                {/* Section A: ⭐ Sevimlilar (Pinned Favorites) */}
                {favoriteItems.length > 0 && !searchQuery && (
                    <div className="space-y-1">
                        {!isCollapsed ? (
                            <div className="px-2 pb-1 flex items-center justify-between text-[11px] font-bold text-amber-400 tracking-wide uppercase">
                                <span className="flex items-center gap-1.5">
                                    <Star size={12} className="fill-amber-400 text-amber-400" />
                                    Sevimlilar
                                </span>
                                <span className="text-[10px] text-slate-500 lowercase font-normal">
                                    {favoriteItems.length} ta
                                </span>
                            </div>
                        ) : (
                            <div className="w-full flex justify-center pb-1">
                                <Star size={12} className="fill-amber-400 text-amber-400" />
                            </div>
                        )}

                        <div className="space-y-0.5">
                            {favoriteItems.map((fav) => {
                                const active = isRouteActive(fav.to);
                                if (isCollapsed) {
                                    return (
                                        <SimpleTooltip key={fav.to} content={fav.title} side="right">
                                            <Link
                                                to={fav.to}
                                                className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-all ${
                                                    active
                                                        ? "bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20"
                                                        : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                                                }`}
                                            >
                                                {fav.icon}
                                            </Link>
                                        </SimpleTooltip>
                                    );
                                }

                                return (
                                    <div
                                        key={fav.to}
                                        className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                            active
                                                ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                                                : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                                        }`}
                                    >
                                        <Link
                                            to={fav.to}
                                            className="flex items-center gap-2.5 flex-1 min-w-0"
                                        >
                                            <span className={active ? "text-teal-400" : "text-slate-400"}>
                                                {fav.icon}
                                            </span>
                                            <span className="truncate">{fav.title}</span>
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={(e) => togglePin(fav.to, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-amber-400 transition cursor-pointer"
                                            title="Sevimlilardan oʻchirish"
                                        >
                                            <Star size={13} className="fill-amber-400 text-amber-400" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Section B: Boshqaruv Paneli (Always accessible top item) */}
                <div className="pt-1">
                    {isCollapsed ? (
                        <SimpleTooltip content="Boshqaruv Paneli" side="right">
                            <Link
                                to="/admin"
                                className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-all ${
                                    isRouteActive("/admin", true)
                                        ? "bg-teal-500 text-slate-950 font-bold shadow-md"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                                }`}
                            >
                                <Home size={18} />
                            </Link>
                        </SimpleTooltip>
                    ) : (
                        <Link
                            to="/admin"
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                isRouteActive("/admin", true)
                                    ? "bg-gradient-to-r from-teal-500 to-teal-600 text-slate-950 shadow-sm"
                                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                            }`}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <Home size={16} />
                                <span>Boshqaruv Paneli</span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#081F26]/30 text-teal-200">
                                ERP
                            </span>
                        </Link>
                    )}
                </div>

                {/* Section C: Radix Accordion of Core Business Domains */}
                {!isCollapsed ? (
                    <Accordion
                        type="multiple"
                        defaultValue={[activeDomainId]}
                        className="space-y-2 pt-2 border-t border-[#0E353F]/60"
                    >
                        {filteredDomains.map((domain) => (
                            <AccordionItem
                                key={domain.id}
                                value={domain.id}
                                className="border-none"
                            >
                                <AccordionTrigger className="py-2 px-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all hover:no-underline [&[data-state=open]>div>svg]:text-teal-400">
                                    <div className="flex items-center gap-2 min-w-0">
                                        {domain.icon}
                                        <span className="truncate">{domain.title}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-1 pt-1 pl-2 space-y-2">
                                    {domain.modules.map((mod) => {
                                        const isModActive = mod.items.some((i) =>
                                            isRouteActive(i.to, i.exact)
                                        );

                                        return (
                                            <div key={mod.id} className="space-y-1">
                                                {/* Module Category Title */}
                                                <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400">
                                                    <span className="flex items-center gap-2">
                                                        <span className={isModActive ? "text-teal-400" : "text-slate-500"}>
                                                            {mod.icon}
                                                        </span>
                                                        <span className="truncate">{mod.title}</span>
                                                    </span>
                                                    {mod.badge && (
                                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black tracking-wider bg-teal-900/60 text-teal-300 border border-teal-800/50">
                                                            {mod.badge}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Sub-Items */}
                                                <div className="space-y-0.5 pl-5 border-l border-slate-700/60 ml-3">
                                                    {mod.items.map((sub) => {
                                                        const active = isRouteActive(sub.to, sub.exact);
                                                        const isPinned = pinnedRoutes.includes(sub.to);

                                                        return (
                                                            <div
                                                                key={sub.to}
                                                                className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                                                                    active
                                                                        ? "bg-teal-500/20 text-teal-200 font-bold border-l-2 border-teal-400"
                                                                        : "text-slate-400 hover:text-white hover:bg-slate-800/50 font-medium"
                                                                }`}
                                                            >
                                                                <Link
                                                                    to={sub.to}
                                                                    className="flex-1 truncate"
                                                                >
                                                                    {sub.title}
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => togglePin(sub.to, e)}
                                                                    className={`p-0.5 rounded transition cursor-pointer ${
                                                                        isPinned
                                                                            ? "text-amber-400 opacity-100"
                                                                            : "text-slate-600 opacity-0 group-hover:opacity-100 hover:text-amber-400"
                                                                    }`}
                                                                    title={isPinned ? "Sevimlilardan chiqarish" : "Sevimlilarga qoʻshish"}
                                                                >
                                                                    <Star
                                                                        size={12}
                                                                        className={isPinned ? "fill-amber-400" : ""}
                                                                    />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    /* Collapsed Icon-Only Domain Modules */
                    <div className="space-y-2 pt-2 border-t border-[#0E353F]/60">
                        {domainGroups.map((domain) => (
                            <div key={domain.id} className="space-y-1 pb-1">
                                {domain.modules.map((mod) => {
                                    const active = mod.items.some((i) =>
                                        isRouteActive(i.to, i.exact)
                                    );

                                    return (
                                        <SimpleTooltip
                                            key={mod.id}
                                            content={mod.title}
                                            side="right"
                                        >
                                            <Link
                                                to={mod.defaultRoute}
                                                className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-all ${
                                                    active
                                                        ? "bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20"
                                                        : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                                                }`}
                                            >
                                                {mod.icon}
                                            </Link>
                                        </SimpleTooltip>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 4. Footer: User Profile & Radix Menu */}
            <div className="p-2 border-t border-[#0E353F] shrink-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className={`w-full p-2 rounded-xl flex items-center transition cursor-pointer hover:bg-slate-800/80 ${
                                isCollapsed ? "justify-center" : "justify-between"
                            }`}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-400 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
                                    {user?.firstName ? user.firstName[0].toUpperCase() : "A"}
                                </div>
                                {!isCollapsed && (
                                    <div className="flex flex-col text-left truncate">
                                        <span className="text-xs font-bold text-white truncate">
                                            {user?.firstName ? `${user.firstName} ${user?.lastName || ""}` : "Admin"}
                                        </span>
                                        <span className="text-[10px] text-slate-400 truncate">
                                            {user?.email || "admin@sapar.uz"}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {!isCollapsed && <ChevronRight size={14} className="text-slate-500" />}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align={isCollapsed ? "start" : "end"} className="w-56 p-1">
                        <DropdownMenuLabel className="px-3 py-2">
                            <p className="text-xs font-bold text-slate-900 truncate">
                                {user?.firstName ? `${user.firstName} ${user?.lastName || ""}` : "Admin"}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {user?.email || "admin@sapar.uz"}
                            </p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link
                                to="/admin/settings/profile"
                                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900"
                            >
                                <UserCircle2 size={15} className="text-slate-400" />
                                <span>Profil sozlamalari</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link
                                to="/admin/settings/company-settings"
                                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900"
                            >
                                <Building size={15} className="text-slate-400" />
                                <span>Korxona sozlamalari</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link
                                to="/admin/design-system"
                                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-purple-700 hover:text-purple-900"
                            >
                                <Sparkles size={15} className="text-purple-600" />
                                <span>Radix UI Design System</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="danger"
                            onClick={() => dispatch(logout())}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium cursor-pointer"
                        >
                            <LogOut size={15} />
                            <span>Chiqish</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </aside>
    );
};

export default UnifiedSidebar;
