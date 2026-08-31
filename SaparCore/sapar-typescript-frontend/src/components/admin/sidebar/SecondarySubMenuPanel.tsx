import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Plus,
    Search,
    X,
    Pin,
    PinOff,
    Sparkles,
} from "lucide-react";
import type { PermissionSet } from "@/types/permissions";
import type { PrimaryModuleKey } from "./PrimaryRail";

export interface SubMenuItem {
    title: string;
    to: string;
    exact?: boolean;
    addPath?: string;
    icon?: React.ReactNode;
    slug?: string;
    badge?: string;
}

export interface SubMenuGroup {
    groupTitle?: string;
    items: SubMenuItem[];
}

export interface ModuleSubMenuConfig {
    key: PrimaryModuleKey;
    title: string;
    badge?: string;
    icon?: React.ReactNode;
    quickAction?: {
        title: string;
        to: string;
    };
    groups: SubMenuGroup[];
}

interface SecondarySubMenuPanelProps {
    config: ModuleSubMenuConfig;
    isOpen: boolean;
    isPinned: boolean;
    onTogglePin: () => void;
    permissions: PermissionSet[];
    user: any;
    onCloseOnMobile?: () => void;
}

function resolvePath(pathname: string): string {
    const clean = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

    if (
        clean.startsWith("/admin/invoices/create-invoice") ||
        clean.startsWith("/admin/invoices/edit/") ||
        clean.startsWith("/admin/view-invoice/")
    ) {
        return "/admin/invoices";
    }
    if (
        clean.startsWith("/admin/contacts/new") ||
        clean.startsWith("/admin/contacts/edit/") ||
        /^\/admin\/contacts\/[^/]+$/.test(clean)
    ) {
        return "/admin/contacts";
    }
    if (
        clean.startsWith("/admin/products/new") ||
        clean.startsWith("/admin/products/edit/") ||
        /^\/admin\/products\/[^/]+$/.test(clean)
    ) {
        return "/admin/products";
    }
    if (
        clean.startsWith("/admin/purchases/orders/new") ||
        clean.startsWith("/admin/purchase-orders/new") ||
        clean.startsWith("/admin/purchase-orders/edit/")
    ) {
        return "/admin/purchase-orders";
    }
    if (
        clean.startsWith("/admin/purchases/new") ||
        clean.startsWith("/admin/expenses/new") ||
        clean.startsWith("/admin/expenses/edit/")
    ) {
        return "/admin/expenses";
    }
    if (
        clean.startsWith("/admin/quotations/new") ||
        clean.startsWith("/admin/quotations/edit/")
    ) {
        return "/admin/quotations";
    }
    if (
        clean.startsWith("/admin/credit-notes/new") ||
        clean.startsWith("/admin/credit-notes/edit/")
    ) {
        return "/admin/credit-notes";
    }
    if (
        clean.startsWith("/admin/debit-notes/new") ||
        clean.startsWith("/admin/debit-notes/edit/")
    ) {
        return "/admin/debit-notes";
    }
    if (
        clean.startsWith("/admin/delivery-challans/new") ||
        clean.startsWith("/admin/delivery-challans/edit/")
    ) {
        return "/admin/delivery-challans";
    }
    if (
        clean.startsWith("/admin/payroll/employees/new") ||
        clean.startsWith("/admin/payroll/employees/edit/")
    ) {
        return "/admin/payroll/employees";
    }
    if (
        clean.startsWith("/admin/accounting/journal-entries/new") ||
        clean.startsWith("/admin/accounting/journal-entries/create") ||
        clean.startsWith("/admin/accounting/journal-entries/edit/")
    ) {
        return "/admin/accounting/journal-entries";
    }
    if (
        clean.startsWith("/admin/accounting/contras/new") ||
        clean.startsWith("/admin/accounting/contras/edit/")
    ) {
        return "/admin/accounting/contras";
    }
    return clean;
}

const isRouteActive = (itemTo: string, currentPath: string, exact?: boolean): boolean => {
    const resolved = resolvePath(currentPath);
    if (itemTo === "/admin" || itemTo === "/admin/" || itemTo === "/admin/dashboard") {
        return resolved === "/admin" || resolved === "/admin/" || resolved === "/admin/dashboard";
    }
    if (exact) {
        return resolved === itemTo;
    }
    return resolved === itemTo || resolved.startsWith(`${itemTo}/`);
};

function canViewItem(slug: string | undefined, permissions: PermissionSet[], user: any): boolean {
    if (!slug) return true;
    if (user?.user_type === 1) return true;
    const p = permissions.find((perm) => perm.moduleSlug === slug);
    return p ? p.view : true;
}

export const SecondarySubMenuPanel: React.FC<SecondarySubMenuPanelProps> = ({
    config,
    isOpen,
    isPinned,
    onTogglePin,
    permissions,
    user,
    onCloseOnMobile,
}) => {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const [searchQuery, setSearchQuery] = useState("");

    // Filter sub-menu items by permissions and search query
    const filteredGroups = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return config.groups
            .map((group) => {
                const visibleItems = group.items.filter((item) => {
                    if (!canViewItem(item.slug, permissions, user)) return false;
                    if (!query) return true;
                    return (
                        item.title.toLowerCase().includes(query) ||
                        item.to.toLowerCase().includes(query)
                    );
                });
                return {
                    ...group,
                    items: visibleItems,
                };
            })
            .filter((group) => group.items.length > 0);
    }, [config, permissions, user, searchQuery]);

    if (!isOpen) return null;

    return (
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 select-none z-20 shadow-xs animate-in slide-in-from-left-2 duration-150">
            {/* Top Module Bar: Exactly h-16 (64px) to align seamlessly with AdminHeader and PrimaryRail */}
            <div className="h-16 px-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200/70 shrink-0 shadow-2xs">
                        {config.icon}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h2 className="text-xs font-black text-slate-900 truncate tracking-tight uppercase">
                            {config.title}
                        </h2>
                        <span className="text-[10px] text-slate-400 font-medium -mt-0.5 truncate">
                            {t("common.navigation", "Boʻlim menyusi")}
                        </span>
                    </div>
                </div>
                {config.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                        {config.badge}
                    </span>
                )}
            </div>

            {/* Quick Action & In-Module Search Filter sub-section */}
            <div className="p-3 border-b border-slate-100 bg-white shrink-0 space-y-2">
                {/* Quick Action Button Pill */}
                {config.quickAction && (
                    <Link
                        to={config.quickAction.to}
                        onClick={onCloseOnMobile}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer transform active:scale-98"
                    >
                        <Plus size={14} className="stroke-[2.5]" />
                        <span>{config.quickAction.title}</span>
                    </Link>
                )}

                {/* In-Module Bubble Search Filter */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("nav.searchMenu", "Boʻlimdan qidirish...")}
                        className="w-full pl-8 pr-7 py-1.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-600 transition shadow-2xs font-medium"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
            </div>

            {/* Middle: Bubble Submenu Items List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
                {filteredGroups.length === 0 ? (
                    <div className="text-center py-8 px-2 space-y-2">
                        <p className="text-xs text-slate-500 font-semibold">
                            {t("nav.searchNoResults", "Hech narsa topilmadi")}
                        </p>
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="text-xs text-teal-700 font-bold hover:underline cursor-pointer"
                            >
                                {t("nav.clearSearch", "Tozalash")}
                            </button>
                        )}
                    </div>
                ) : (
                    filteredGroups.map((group, gIdx) => (
                        <div key={gIdx} className="space-y-1">
                            {group.groupTitle && (
                                <div className="px-3 pt-1.5 pb-1 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                                    {group.groupTitle}
                                </div>
                            )}
                            {group.items.map((item) => {
                                const isActive = isRouteActive(item.to, pathname, item.exact);
                                const isAddActive = item.addPath ? pathname === item.addPath : false;

                                return (
                                    <div key={item.to} className="flex items-center group relative mb-0.5">
                                        <Link
                                            to={item.to}
                                            onClick={onCloseOnMobile}
                                            className={`flex items-center justify-between w-full px-3.5 py-2 text-xs rounded-2xl transition-all duration-150 relative cursor-pointer ${
                                                isActive
                                                    ? "bg-gradient-to-r from-teal-700 to-teal-800 text-white font-bold shadow-sm shadow-teal-900/20"
                                                    : "text-slate-700 hover:bg-teal-50/70 hover:text-teal-950 font-semibold"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                {item.icon && (
                                                    <span className={`shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-teal-700"}`}>
                                                        {item.icon}
                                                    </span>
                                                )}
                                                <span className="truncate">{item.title}</span>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {item.badge && (
                                                    <span
                                                        className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold ${
                                                            isActive
                                                                ? "bg-teal-900 text-teal-100"
                                                                : "bg-slate-100 text-slate-600"
                                                        }`}
                                                    >
                                                        {item.badge}
                                                    </span>
                                                )}
                                                {isActive && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-2xs" />
                                                )}
                                            </div>
                                        </Link>

                                        {item.addPath && (
                                            <Link
                                                to={item.addPath}
                                                onClick={onCloseOnMobile}
                                                title={t("nav.addNew", "Yangi qoʻshish")}
                                                className={`absolute right-1 p-1 rounded-lg transition-colors cursor-pointer ${
                                                    isAddActive
                                                        ? "bg-teal-900 text-white"
                                                        : "text-slate-400 hover:bg-teal-100 hover:text-teal-900"
                                                }`}
                                            >
                                                <Plus size={13} />
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
            </div>

            {/* Bottom: Pin / Float Bubble Status Bar */}
            <div className="p-2.5 border-t border-slate-100 bg-slate-50/70 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <Sparkles size={13} className="text-teal-600" />
                    <span>{isPinned ? t("nav.pinned", "Mahkamlangan") : t("nav.unpinSidebar", "Yashirish")}</span>
                </div>
                <button
                    type="button"
                    onClick={onTogglePin}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-teal-800 hover:bg-teal-50 transition cursor-pointer"
                    title={isPinned ? t("nav.unpinSidebar", "Panelni yashirish") : t("nav.pinSidebar", "Panelni mahkamlash")}
                >
                    {isPinned ? <Pin size={14} className="rotate-45 text-teal-700" /> : <PinOff size={14} />}
                </button>
            </div>
        </div>
    );
};

export default SecondarySubMenuPanel;
