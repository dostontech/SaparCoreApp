import type { ReactNode } from "react";

interface DashboardCardProps {
    title: string;
    icon: ReactNode;
    children: ReactNode;
}

export function DashboardCard({ title, icon, children }: DashboardCardProps) {
    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 space-y-3 transition-all duration-200 hover:shadow-md hover:border-teal-200">
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="p-2 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center shadow-2xs">
                    {icon}
                </span>
                <h2 className="text-sm font-bold text-slate-900">{title}</h2>
            </div>

            {/* Content Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {children}
            </div>
        </div>
    );
}

export default DashboardCard;
