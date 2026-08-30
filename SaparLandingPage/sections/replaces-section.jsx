'use client';

import { useLanguage } from '@/context/language-context';
import {
    Calculator,
    FileSignature,
    Landmark,
    Users,
    TrendingUp,
    Building2,
    ArrowRight,
    CheckCircle2,
    XCircle,
    Layers,
    Sparkles,
} from 'lucide-react';

const icons = [Calculator, FileSignature, Landmark, Users, TrendingUp, Building2];

export default function ReplacesSection() {
    const { t, dictionary } = useLanguage();

    const items = dictionary?.replaces?.items || [];

    return (
        <section id="replaces" className="w-full py-10 md:py-16 px-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF5F2] border border-[#DCE9E5] text-[#028090] text-xs sm:text-sm font-semibold uppercase tracking-wider">
                    <Sparkles className="size-3.5 text-[#02C39A]" />
                    <span>{t('replaces.badge')}</span>
                    <span className="text-slate-400 font-normal">|</span>
                    <span className="text-slate-500 font-normal">{t('replaces.badgeSub')}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mt-4 tracking-tight">
                    {t('replaces.title')}
                </h2>

                <p className="text-sm sm:text-base md:text-lg text-slate-600 mt-3 leading-relaxed">
                    {t('replaces.description')}
                </p>
            </div>

            {/* Grid of Replacement Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
                {items.map((item, idx) => {
                    const Icon = icons[idx] || Calculator;
                    return (
                        <div
                            key={idx}
                            className="group relative bg-white rounded-2xl p-7 border border-slate-200/80 hover:border-[#028090]/40 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                        >
                            {/* Card Top */}
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-5">
                                    <div className="size-12 rounded-xl bg-[#EAF5F2] flex items-center justify-center text-[#028090] group-hover:bg-[#028090] group-hover:text-white transition-colors duration-300">
                                        <Icon className="size-6" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400 font-mono">
                                        0{idx + 1}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#028090] transition-colors">
                                    {item.title}
                                </h3>

                                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>

                            {/* Card Bottom: Legacy replaced badges & benefit */}
                            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-3">
                                <div className="flex items-center flex-wrap gap-1.5">
                                    <span className="text-xs font-medium text-slate-400 mr-1">
                                        {t('replaces.replacesLabel')}
                                    </span>
                                    {item.replaces.map((app, appIdx) => (
                                        <span
                                            key={appIdx}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-600 border border-rose-100 line-through decoration-rose-400"
                                        >
                                            <XCircle className="size-3 text-rose-500 shrink-0" />
                                            {app}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                                    <span className="truncate">{item.highlight}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Visual Transformation Metric: 6 workflows -> 1 platform */}
            <div className="mt-8 sm:mt-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B2B33] to-[#10404B] text-white p-6 sm:p-8 md:p-10 shadow-2xl">
                {/* Background decorative glows */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#02C39A]/15 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-[#028090]/20 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 text-center lg:text-left">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#02C39A] text-xs font-semibold tracking-wide backdrop-blur-xs mb-3">
                            <Layers className="size-3.5" />
                            {t('replaces.cardBadge')}
                        </div>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
                            {t('replaces.cardTitle')}
                        </h3>
                        <p className="mt-2.5 text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
                            {t('replaces.cardDesc')}
                        </p>
                    </div>

                    {/* Counter Transformation Card */}
                    <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 bg-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 md:p-8 border border-white/15 shrink-0">
                        {/* 6 workflows */}
                        <div className="text-center">
                            <div className="text-3xl sm:text-4xl md:text-5xl font-black text-rose-300/90 tracking-tight">
                                {t('replaces.workflowsCount')}
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-slate-300 mt-1 max-w-[70px] sm:max-w-[100px] leading-tight">
                                {t('replaces.workflowsLabel')}
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="size-9 sm:size-11 rounded-full bg-[#02C39A] text-[#0B2B33] flex items-center justify-center shadow-lg shadow-[#02C39A]/20">
                                <ArrowRight className="size-4 sm:size-5" />
                            </div>
                        </div>

                        {/* 1 platform */}
                        <div className="text-center">
                            <div className="text-3xl sm:text-4xl md:text-5xl font-black text-[#02C39A] tracking-tight">
                                {t('replaces.platformCount')}
                            </div>
                            <div className="text-xs sm:text-sm font-bold text-white mt-1 max-w-[70px] sm:max-w-[100px] leading-tight">
                                {t('replaces.platformLabel')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
