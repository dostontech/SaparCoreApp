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
    | "settings";

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
}

export const PrimaryRail: React.FC<PrimaryRailProps> = ({
    activeModule,
    routeModule,
    onSelectModule,
    isPinned,
    onTogglePin,
    onOpenCustomizeModal,
}) => {
    const { t, i18n } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

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
            title: t("nav.mainDashboard", "Asosiy ERP"),
            badge: "ERP",
            icon: <Home size={19} />,
            defaultRoute: "/admin",
            slug: "dashboard",
        },
        {
            key: "pos",
            title: t("workspace.pos", "POS Kassa"),
            badge: "POS",
            icon: <ShoppingCart size={19} />,
            defaultRoute: "/admin/pos",
            slug: "invoices",
        },
        {
            key: "sales",
            title: t("workspace.sales", "Savdo & Fakturalar"),
            badge: "Faktura",
            icon: <Receipt size={19} />,
            defaultRoute: "/admin/invoices",
            slug: "sales",
        },
        {
            key: "purchases",
            title: t("workspace.purchases", "Xaridlar & Taʼminot"),
            badge: "Xarid",
            icon: <ShoppingBag size={19} />,
            defaultRoute: "/admin/expenses",
            slug: "purchases",
        },
        {
            key: "inventory",
            title: t("workspace.inventory", "Ombor & Tovar"),
            badge: "Sklad",
            icon: <Package size={19} />,
            defaultRoute: "/admin/products",
            slug: "product-services",
        },
        {
            key: "banking",
            title: t("nav.bankingGroup", "Bank & Kassa"),
            badge: "Bank",
            icon: <LandmarkIcon size={19} />,
            defaultRoute: "/admin/banking",
            slug: "banking",
        },
        {
            key: "accounting",
            title: t("nav.accounting", "Buxgalteriya"),
            badge: "BHMS",
            icon: <BookOpen size={19} />,
            defaultRoute: "/admin/accounting/bhms-chart-of-accounts",
            slug: "accounting",
        },
        {
            key: "reports",
            title: t("nav.financialReports", "Moliyaviy Hisobotlar"),
            badge: "1/2",
            icon: <BarChart2 size={19} />,
            defaultRoute: "/admin/accounting/reports",
            slug: "accounting",
        },
        {
            key: "crm",
            title: t("workspace.crm", "CRM & Bitimlar"),
            badge: "CRM",
            icon: <Target size={19} />,
            defaultRoute: "/admin/crm/pipeline",
            slug: "contacts",
        },
        {
            key: "payroll",
            title: t("workspace.hrm", "HRM & Oylik Maosh"),
            badge: "Tabel",
            icon: <Users size={19} />,
            defaultRoute: "/admin/payroll/profiles",
            slug: "payroll",
        },
        {
            key: "projects",
            title: t("workspace.projects", "Loyihalar & Vazifalar"),
            badge: "Kanban",
            icon: <Briefcase size={19} />,
            defaultRoute: "/admin/accounting/projects",
            slug: "accounting",
        },
        {
            key: "support",
            title: t("workspace.support", "Yordam Markazi"),
            badge: "Help",
            icon: <Headphones size={19} />,
            defaultRoute: "/admin/helpdesk",
            slug: "contacts",
        },
        {
            key: "settings",
            title: t("nav.settings", "Tizim Sozlamalari"),
            badge: "⚙️",
            icon: <Settings size={19} />,
            defaultRoute: "/admin/settings/company-settings",
            slug: "settings",
        },
    ];

    return (
        <aside className="w-[72px] bg-[#0B2B33] text-slate-300 flex flex-col h-screen shrink-0 border-r border-[#071F24] select-none z-30 justify-between items-center py-3">
            {/* Top: SAPAR Emblem Logo */}
            <div className="flex flex-col items-center w-full shrink-0">
                <Link
                    to="/admin"
                    onClick={() => onSelectModule("dashboard")}
                    className="w-11 h-11 rounded-2xl bg-teal-500/10 hover:bg-teal-500/25 border border-teal-400/30 flex items-center justify-center transition-all group shadow-sm mb-2.5 cursor-pointer"
                    title="SAPAR ERP — Asosiy Boshqaruv Paneli"
                >
                    <svg
                        width="26"
                        height="28"
                        viewBox="0 0 41 45"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="transition-transform duration-200 group-hover:scale-110"
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
                </Link>
                <div className="w-8 h-px bg-teal-900/50 mb-1" />
            </div>

            {/* Middle: Bubble Department Icons Rail */}
            <div className="flex-1 w-full overflow-y-auto overflow-x-hidden py-1 px-2 space-y-1.5 scrollbar-none flex flex-col items-center">
                {primaryModules.map((item) => {
                    const isInspected = activeModule === item.key;
                    const isCurrentRoute = routeModule === item.key;

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
            <div className="w-full flex flex-col items-center gap-2 pt-2.5 border-t border-teal-900/50 shrink-0">
                {/* Customize Menu Button */}
                <button
                    type="button"
                    onClick={onOpenCustomizeModal}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-teal-300 hover:bg-slate-800/80 transition-all cursor-pointer"
                    title={t("nav.customizeMenu", "Menyuni Moslashtirish")}
                >
                    <SlidersHorizontal size={16} />
                </button>

                {/* Language Switcher Bubble Popover */}
                <div className="relative" ref={langRef}>
                    <button
                        type="button"
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black bg-teal-950/70 hover:bg-teal-900 text-teal-300 border border-teal-800/60 transition-all cursor-pointer shadow-2xs"
                        title="Tilni oʻzgartirish"
                    >
                        {currentLang.codeBadge}
                    </button>

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
                    <button
                        type="button"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-400 text-white flex items-center justify-center text-xs font-black shadow-md border-2 border-[#0B2B33] hover:ring-2 hover:ring-teal-400 transition-all cursor-pointer"
                        title={user?.firstName || "Foydalanuvchi"}
                    >
                        {user?.firstName ? user.firstName[0].toUpperCase() : "U"}
                    </button>

                    {isProfileOpen && (
                        <div className="absolute left-full ml-3 bottom-0 w-56 bg-white rounded-3xl shadow-2xl border border-slate-200 divide-y divide-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                            <div className="px-4 py-3 bg-slate-50">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                    {user?.firstName ? `${user.firstName} ${user?.lastName || ""}` : "Foydalanuvchi"}
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
            </div>
        </aside>
    );
};

export default PrimaryRail;
