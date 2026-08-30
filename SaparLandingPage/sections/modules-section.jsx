'use client';

import { useLanguage } from '@/context/language-context';
import {
    LayoutGrid,
    UsersRound,
    Calculator,
    FileSignature,
    Package,
    ShoppingCart,
    KanbanSquare,
    Headset,
    Check,
    ArrowRight,
    Boxes,
} from 'lucide-react';

const icons = [
    LayoutGrid,
    UsersRound,
    Calculator,
    FileSignature,
    Package,
    ShoppingCart,
    KanbanSquare,
    Headset,
];

const moduleStyles = [
    {
        iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
        iconBg: 'bg-teal-50 text-teal-600 border-teal-200',
        badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
        iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
        iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
        iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
        badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
        iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-200',
        badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
    {
        iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
        iconBg: 'bg-violet-50 text-violet-600 border-violet-200',
        badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
    },
];

export default function ModulesSection() {
    const { t, dictionary } = useLanguage();

    const modules = dictionary?.modules?.list || [];

    return (
        <section id="modules" className="w-full py-10 md:py-16 px-4 max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF5F2] border border-[#DCE9E5] text-[#028090] text-xs sm:text-sm font-semibold uppercase tracking-wider">
                    <Boxes className="size-3.5 text-[#02C39A]" />
                    <span>{t('modules.badge')}</span>
                    <span className="text-slate-400 font-normal">|</span>
                    <span className="text-slate-500 font-normal">{t('modules.badgeSub')}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mt-4 tracking-tight">
                    {t('modules.title')}
                </h2>

                <p className="text-sm sm:text-base md:text-lg text-slate-600 mt-3 leading-relaxed">
                    {t('modules.description')}
                </p>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12">
                {modules.map((mod, index) => {
                    const Icon = icons[index] || LayoutGrid;
                    const style = moduleStyles[index] || moduleStyles[0];

                    return (
                        <div
                            key={index}
                            className="group relative bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-[#028090]/40 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                        >
                            {/* Top info */}
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-4">
                                    <div className={`size-11 rounded-xl flex items-center justify-center border ${style.iconBg} transition-transform duration-300 group-hover:scale-105`}>
                                        <Icon className="size-5" />
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style.badgeBg}`}>
                                        {mod.functionsCount}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#028090] transition-colors mt-2">
                                    {mod.title}
                                </h3>

                                {/* Bullet points */}
                                <ul className="mt-4 space-y-2.5">
                                    {mod.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-start gap-2 text-sm text-slate-600">
                                            <div className="size-4.5 rounded-full bg-[#EAF5F2] text-[#028090] flex items-center justify-center shrink-0 mt-0.5">
                                                <Check className="size-3 stroke-[2.5]" />
                                            </div>
                                            <span className="leading-snug">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA Link */}
                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <a
                                    href={mod.href || '#contact'}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#028090] hover:text-[#10404B] transition-colors group/link"
                                >
                                    <span>{t('modules.detailsLink')}</span>
                                    <ArrowRight className="size-3.5 transition-transform group-hover/link:translate-x-1" />
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
