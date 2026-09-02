import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
    Pin,
    PinOff,
    LogOut,
    UserCircle2,
    SlidersHorizontal,
    Globe,
    Check,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronRight,
    Sparkles,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@store/index";
import { logout } from "@store/auth/authSlice";
import { LANGUAGES } from "../header/LanguageSwitcher";

export type PrimaryModuleKey =
    | "dashboard"
    | "pos"
    | "sales"
    | "purchases"
    | "inventory"
    | "banking"
    | "accounting"
    | "reports"
    | "crm"
    | "payroll"
    | "projects"
    | "support"
    | "settings"
    | "design_system";

export interface PrimaryModuleItem {
    key: PrimaryModuleKey;
    title: string;
    badge?: string;
    icon: React.ReactNode;
    defaultRoute: string;
    slug: string;
}

interface PrimaryRailProps {
    activeModule: PrimaryModuleKey;
    routeModule: PrimaryModuleKey;
    onSelectModule: (moduleKey: PrimaryModuleKey, defaultRoute?: string) => void;
    isPinned: boolean;
    onTogglePin: () => void;
    onOpenCustomizeModal: () => void;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
}

export const PrimaryRail: React.FC<PrimaryRailProps> = ({
    activeModule,
    routeModule,
    onSelectModule,
    isPinned,
    onTogglePin,
    onOpenCustomizeModal,
    isExpanded: controlledExpanded,
    onToggleExpand,
}) => {
    const { t, i18n } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

    const [internalExpanded, setInternalExpanded] = useState<boolean>(() => {
        const saved = localStorage.getItem("sapar_primary_rail_expanded");
        return saved !== null ? saved === "true" : true;
    });

    const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

    const handleToggleExpand = () => {
        if (onToggleExpand) {
            onToggleExpand();
        } else {
            const next = !internalExpanded;
            setInternalExpanded(next);
            localStorage.setItem("sapar_primary_rail_expanded", String(next));
        }
    };

    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const currentLangCode = i18n.language || localStorage.getItem("sapar_lang") || "uz";
    const currentLang =
        LANGUAGES.find((l) => l.code === currentLangCode) ||
        LANGUAGES.find((l) => currentLangCode.startsWith(l.code)) ||
        LANGUAGES[0];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(e.target as Node)) {
                setIsLangOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const primaryModules: PrimaryModuleItem[] = [
        {
            key: "dashboard",
            title: t("nav.dashboard", "Boshqaruv Paneli"),
            icon: <Home size={19} />,
            defaultRoute: "/admin",
            slug: "dashboard",
        },
        {
            key: "pos",
            title: t("nav.pos", "POS Kassa Terminali"),
            badge: "⚡",
            icon: <ShoppingCart size={19} />,
            defaultRoute: "/admin/pos",
            slug: "pos",
        },
        {
            key: "sales",
            title: t("nav.sales", "Savdo & Fakturalar"),
            badge: "TTN",
            icon: <Receipt size={19} />,
            defaultRoute: "/admin/invoices",
            slug: "invoices",
        },
        {
            key: "purchases",
            title: t("nav.purchases", "Xaridlar & Taʼminot"),
            badge: "PO",
            icon: <ShoppingBag size={19} />,
            defaultRoute: "/admin/purchases",
            slug: "purchases",
        },
        {
            key: "inventory",
            title: t("nav.inventory", "Ombor va Tovarlar"),
            badge: "FIFO",
            icon: <Package size={19} />,
            defaultRoute: "/admin/inventory",
            slug: "inventory",
        },
        {
            key: "banking",
            title: t("nav.bankingGroup", "Bank & Kassa"),
            badge: "🏦",
            icon: <LandmarkIcon size={19} />,
            defaultRoute: "/admin/banking",
            slug: "banking",
        },
        {
            key: "accounting",
            title: t("nav.accounting", "Buxgalteriya (BHMS 21)"),
            badge: "21",
            icon: <BookOpen size={19} />,
            defaultRoute: "/admin/accounting/chart-of-accounts",
            slug: "accounting",
        },
        {
            key: "reports",
            title: t("nav.financialReports", "Moliyaviy Hisobotlar"),
            badge: "1/2",
            icon: <BarChart2 size={19} />,
            defaultRoute: "/admin/accounting/reports",
            slug: "accounting_reports",
        },
        {
            key: "crm",
            title: t("workspace.crm", "CRM & Bitimlar"),
            badge: "CRM",
            icon: <Target size={19} />,
            defaultRoute: "/admin/crm/deals",
            slug: "crm",
        },
        {
            key: "payroll",
            title: t("workspace.hrm", "HRM & Xodimlar"),
            badge: "12%",
            icon: <Users size={19} />,
            defaultRoute: "/admin/payroll/tabel",
            slug: "payroll",
        },
        {
            key: "projects",
            title: t("workspace.projects", "Loyihalar & Vazifalar"),
            icon: <Briefcase size={19} />,
            defaultRoute: "/admin/projects",
            slug: "projects",
        },
        {
            key: "support",
            title: t("workspace.support", "Mijozlar Yordami"),
            icon: <Headphones size={19} />,
            defaultRoute: "/admin/helpdesk",
            slug: "helpdesk",
        },
        {
            key: "settings",
            title: t("nav.settings", "Tizim Sozlamalari"),
            badge: "⚙️",
            icon: <Settings size={19} />,
            defaultRoute: "/admin/settings/company-settings",
            slug: "settings",
        },
        {
            key: "design_system",
            title: "UI Design System",
            badge: "RADIX",
            icon: <Sparkles size={19} className="text-purple-400" />,
            defaultRoute: "/admin/design-system",
            slug: "design_system",
        },
    ];

    const saparEmblemSvg = (
        <svg
            width="24"
            height="26"
            viewBox="0 0 41 45"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-200 group-hover:scale-110 shrink-0"
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
                fill="#F1F5F9"
            />
            <path
                d="M0.12016 30.925L0 29.3451L7.05584 25.6307V30.088L27.0791 40.8642L20.2147 44.9456L3.48254 36.0148C1.54864 34.9826 0.283068 33.0668 0.12016 30.925Z"
                fill="#F1F5F9"
            />
        </svg>
    );

    return (
        <aside
            className={`${
                isExpanded ? "w-60" : "w-[72px]"
            } bg-[#0B2B33] text-slate-300 flex flex-col h-screen shrink-0 border-r border-[#071F24] select-none z-30 justify-between transition-all duration-300 ease-in-out`}
        >
            {/* Top: Branding & Collapse/Expand Button (h-16 / 64px to align with AdminHeader and SecondarySubMenuPanel) */}
            {isExpanded ? (
                <div className="h-16 flex items-center justify-between px-3.5 w-full shrink-0 border-b border-teal-950/80 bg-[#0B2B33]">
                    <Link
                        to="/admin"
                        onClick={() => onSelectModule("dashboard")}
                        className="flex items-center gap-2.5 group cursor-pointer min-w-0"
                        title="SAPAR ERP — Asosiy Boshqaruv Paneli"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-teal-500/10 hover:bg-teal-500/25 border border-teal-400/30 flex items-center justify-center transition-all group-hover:scale-105 shadow-xs shrink-0">
                            {saparEmblemSvg}
                        </div>
                        <div className="flex flex-col truncate">
                            <div className="flex items-center gap-1.5">
                                <span className="text-base font-black text-white tracking-wide">SAPAR</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                                    ERP
                                </span>
                            </div>
                            <span className="text-[10px] text-teal-400/80 font-medium -mt-0.5 tracking-wider truncate">
                                Oʻzbekiston
                            </span>
                        </div>
                    </Link>
                    <button
                        type="button"
                        onClick={handleToggleExpand}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer shrink-0"
                        title="Menyuni yigʻish (Collapse)"
                    >
                        <PanelLeftClose size={17} />
                    </button>
                </div>
            ) : (
                <div className="h-16 flex items-center justify-between px-2.5 w-full shrink-0 border-b border-teal-950/80 bg-[#0B2B33]">
                    <Link
                        to="/admin"
                        onClick={() => onSelectModule("dashboard")}
                        className="w-10 h-10 rounded-2xl bg-teal-500/10 hover:bg-teal-500/25 border border-teal-400/30 flex items-center justify-center transition-all group shadow-sm cursor-pointer"
                        title="SAPAR ERP — Asosiy Boshqaruv Paneli"
                    >
                        {saparEmblemSvg}
                    </Link>
                    <button
                        type="button"
                        onClick={handleToggleExpand}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-teal-300 hover:bg-slate-800/80 transition cursor-pointer border border-slate-700/40"
                        title="Menyuni kengaytirish (Open Sidebar)"
                    >
                        <PanelLeftOpen size={14} />
                    </button>
                </div>
            )}

            {/* Middle: Department Items Navigation */}
            <div className={`flex-1 w-full overflow-y-auto overflow-x-hidden py-3 px-2 space-y-1.5 scrollbar-none flex flex-col ${
                isExpanded ? "items-stretch" : "items-center"
            }`}>
                {primaryModules.map((item) => {
                    const isInspected = activeModule === item.key;
                    const isCurrentRoute = routeModule === item.key;

                    if (isExpanded) {
                        return (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => onSelectModule(item.key, item.defaultRoute)}
                                className={`w-full px-3 py-2.5 rounded-2xl flex items-center justify-between transition-all duration-200 cursor-pointer ${
                                    isInspected
                                        ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md shadow-teal-950/60 ring-1 ring-teal-400/40 font-bold"
                                        : isCurrentRoute
                                        ? "bg-teal-950/90 text-teal-300 border border-teal-800/60 hover:bg-teal-900/60 font-semibold"
                                        : "text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium"
                                }`}
                            >
                                <div className="flex items-center min-w-0">
                                    <span className={`shrink-0 ${
                                        isInspected
                                            ? "text-white"
                                            : isCurrentRoute
                                            ? "text-teal-300"
                                            : "text-slate-400"
                                    }`}>
                                        {item.icon}
                                    </span>
                                    <span className="ml-2.5 text-xs truncate">
                                        {item.title}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                    {item.badge && (
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold border ${
                                            isInspected
                                                ? "bg-teal-800/80 text-teal-100 border-teal-500/40"
                                                : "bg-teal-500/20 text-teal-300 border-teal-500/30"
                                        }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                    {isCurrentRoute && !isInspected && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    )}
                                </div>
                            </button>
                        );
                    }

                    // Collapsed View (Icon only with Tooltip)
                    return (
                        <div key={item.key} className="relative group w-full flex justify-center">
                            <button
                                type="button"
                                onClick={() => onSelectModule(item.key, item.defaultRoute)}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 relative cursor-pointer ${
                                    isInspected
                                        ? "bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg shadow-teal-950/60 ring-2 ring-teal-400/50 scale-105"
                                        : isCurrentRoute
                                        ? "bg-teal-950/80 text-teal-300 border border-teal-800/60 hover:bg-teal-900/60"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                                }`}
                                aria-label={item.title}
                            >
                                <span className={`transition-transform duration-150 ${isInspected ? "scale-105" : "group-hover:scale-110"}`}>
                                    {item.icon}
                                </span>

                                {/* Active route indicator dot */}
                                {isCurrentRoute && !isInspected && (
                                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                )}

                                {/* Selected bubble indicator glow */}
                                {isInspected && (
                                    <span className="absolute -left-2 top-2.5 bottom-2.5 w-1.5 rounded-r-full bg-emerald-400 shadow-sm" />
                                )}
                            </button>

                            {/* Floating Bubble Tooltip */}
                            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                                <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-2xl shadow-2xl border border-slate-700/80 whitespace-nowrap flex items-center gap-2">
                                    <span>{item.title}</span>
                                    {item.badge && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Controls: Language Switcher, Profile, Pin Toggle, Customize */}
            <div className={`w-full flex flex-col pt-2.5 border-t border-teal-900/50 shrink-0 gap-1.5 ${
                isExpanded ? "px-2.5 items-stretch" : "items-center"
            }`}>
                {/* Customize Menu Button */}
                {isExpanded ? (
                    <button
                        type="button"
                        onClick={onOpenCustomizeModal}
                        className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs text-slate-400 hover:text-teal-200 hover:bg-slate-800/80 transition-all cursor-pointer font-medium"
                    >
                        <SlidersHorizontal size={15} className="shrink-0" />
                        <span className="truncate">{t("nav.customizeMenu", "Menyuni Moslashtirish")}</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onOpenCustomizeModal}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-teal-300 hover:bg-slate-800/80 transition-all cursor-pointer"
                        title={t("nav.customizeMenu", "Menyuni Moslashtirish")}
                    >
                        <SlidersHorizontal size={16} />
                    </button>
                )}

                {/* Language Switcher Bubble Popover */}
                <div className="relative" ref={langRef}>
                    {isExpanded ? (
                        <button
                            type="button"
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-xs bg-teal-950/70 hover:bg-teal-900 text-teal-300 border border-teal-800/60 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-2 truncate">
                                <Globe size={14} className="shrink-0 text-teal-400" />
                                <span className="truncate">{currentLang.name}</span>
                            </div>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-teal-900/90 text-teal-200 shrink-0">
                                {currentLang.codeBadge}
                            </span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black bg-teal-950/70 hover:bg-teal-900 text-teal-300 border border-teal-800/60 transition-all cursor-pointer shadow-2xs"
                            title="Tilni oʻzgartirish"
                        >
                            {currentLang.codeBadge}
                        </button>
                    )}

                    {isLangOpen && (
                        <div className="absolute left-full ml-3 bottom-0 w-52 bg-white rounded-3xl shadow-2xl border border-slate-200 divide-y divide-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                            <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <Globe className="w-3.5 h-3.5 text-teal-700" />
                                <span>Til / Language / Язык</span>
                            </div>
                            <div className="py-1">
                                {LANGUAGES.map((lang) => {
                                    const isSelected =
                                        currentLang.code === lang.code || currentLangCode.startsWith(lang.code);
                                    return (
                                        <button
                                            key={lang.code}
                                            type="button"
                                            onClick={() => {
                                                i18n.changeLanguage(lang.code);
                                                localStorage.setItem("sapar_lang", lang.code);
                                                setIsLangOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition text-left cursor-pointer ${
                                                isSelected
                                                    ? "bg-teal-50 text-teal-950 font-black"
                                                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                                    {lang.codeBadge}
                                                </span>
                                                <span>{lang.name}</span>
                                            </div>
                                            {isSelected && <Check className="w-3.5 h-3.5 text-teal-700" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Avatar Popover */}
                <div className="relative" ref={profileRef}>
                    {isExpanded ? (
                        <button
                            type="button"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="w-full px-2.5 py-2 rounded-2xl flex items-center justify-between bg-slate-900/60 hover:bg-slate-800/80 border border-teal-900/40 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-400 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
                                    {user?.firstName ? user.firstName[0].toUpperCase() : "A"}
                                </div>
                                <div className="flex flex-col text-left truncate">
                                    <span className="text-xs font-bold text-white truncate">
                                        {user?.firstName ? `${user.firstName} ${user?.lastName || ""}` : "Admin"}
                                    </span>
                                    <span className="text-[10px] text-slate-400 truncate">
                                        {user?.email || "admin@sapar.uz"}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight size={14} className="text-slate-500 shrink-0" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-400 text-white flex items-center justify-center text-xs font-black shadow-md border-2 border-[#0B2B33] hover:ring-2 hover:ring-teal-400 transition-all cursor-pointer"
                            title={user?.firstName || "Foydalanuvchi"}
                        >
                            {user?.firstName ? user.firstName[0].toUpperCase() : "A"}
                        </button>
                    )}

                    {isProfileOpen && (
                        <div className="absolute left-full ml-3 bottom-0 w-56 bg-white rounded-3xl shadow-2xl border border-slate-200 divide-y divide-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                            <div className="px-4 py-3 bg-slate-50">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                    {user?.firstName ? `${user.firstName} ${user?.lastName || ""}` : "Admin"}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                    {user?.email || "admin@sapar.uz"}
                                </p>
                            </div>
                            <div className="py-1">
                                <Link
                                    to="/admin/settings/profile"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-900 transition-colors"
                                >
                                    <UserCircle2 className="w-3.5 h-3.5 mr-2.5 text-slate-400" />
                                    {t("nav.profileSettings", "Profil sozlamalari")}
                                </Link>
                                <Link
                                    to="/admin/settings/company-settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-900 transition-colors"
                                >
                                    <Settings className="w-3.5 h-3.5 mr-2.5 text-slate-400" />
                                    {t("nav.companySettings", "Korxona sozlamalari")}
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => dispatch(logout())}
                                    className="w-full flex items-center px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                                >
                                    <LogOut className="w-3.5 h-3.5 mr-2.5 text-rose-500" />
                                    {t("nav.logout", "Chiqish")}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Secondary Sidebar Pin/Collapse Bubble Toggle */}
                {isExpanded ? (
                    <button
                        type="button"
                        onClick={onTogglePin}
                        className={`w-full px-3 py-1.5 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                            isPinned
                                ? "bg-teal-500/20 text-teal-300 hover:bg-teal-500/30"
                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                        }`}
                    >
                        <span className="truncate">
                            {isPinned ? t("nav.pinned", "2-panel mahkamlangan") : t("nav.pinSidebar", "2-panelni mahkamlash")}
                        </span>
                        {isPinned ? <Pin size={13} className="rotate-45 text-teal-400 shrink-0" /> : <PinOff size={13} className="shrink-0" />}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onTogglePin}
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs transition-all cursor-pointer ${
                            isPinned
                                ? "bg-teal-500/20 text-teal-300 hover:bg-teal-500/30"
                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                        }`}
                        title={isPinned ? t("nav.unpinSidebar", "Panelni yashirish") : t("nav.pinSidebar", "Panelni mahkamlash")}
                    >
                        {isPinned ? <Pin size={14} className="rotate-45 text-teal-400" /> : <PinOff size={14} />}
                    </button>
                )}
            </div>
        </aside>
    );
};

export default PrimaryRail;
