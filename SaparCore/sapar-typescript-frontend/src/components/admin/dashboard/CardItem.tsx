import type { ReactNode } from "react";

interface CardItemProps {
    icon: ReactNode;
    label: string;
    value: string | number;
    color: string;
}

export function CardItem({ icon, label, value, color }: CardItemProps) {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
        purple: {
            bg: "bg-teal-50",
            border: "border-teal-200/80",
            text: "text-teal-700",
        },
        green: {
            bg: "bg-emerald-50",
            border: "border-emerald-200/80",
            text: "text-emerald-700",
        },
        blue: {
            bg: "bg-sky-50",
            border: "border-sky-200/80",
            text: "text-sky-700",
        },
        yellow: {
            bg: "bg-amber-50",
            border: "border-amber-200/80",
            text: "text-amber-700",
        },
        red: {
            bg: "bg-rose-50",
            border: "border-rose-200/80",
            text: "text-rose-700",
        },
        gray: {
            bg: "bg-slate-50",
            border: "border-slate-200/80",
            text: "text-slate-700",
        },
        indigo: {
            bg: "bg-indigo-50",
            border: "border-indigo-200/80",
            text: "text-indigo-700",
        },
    };

    const scheme = colors[color] || colors.purple;

    return (
        <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors">
            <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 shadow-2xs ${scheme.bg} ${scheme.border} ${scheme.text}`}
            >
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs text-slate-500 font-medium truncate">{label}</p>
                <p className="text-sm font-bold text-slate-900 font-mono tracking-tight truncate">{value}</p>
            </div>
        </div>
    );
}

export default CardItem;
