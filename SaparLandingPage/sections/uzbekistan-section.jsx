'use client';

import { useLanguage } from '@/context/language-context';
import {
    Fingerprint,
    Landmark,
    FileText,
    Building2,
    ShieldCheck,
    CheckCircle2,
    Lock,
    Zap,
} from 'lucide-react';

const icons = [Fingerprint, Landmark, FileText, Building2];
const cardStyles = [
    {
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        iconColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        iconColor: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        iconColor: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        iconColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
];

export default function UzbekistanSection() {
    const { t, dictionary } = useLanguage();

    const items = dictionary?.uzbekistan?.items || [];

    return (
        <section id="uzbekistan" className="w-full py-10 md:py-16 px-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF5F2] border border-[#DCE9E5] text-[#028090] text-xs sm:text-sm font-semibold uppercase tracking-wider">
                    <ShieldCheck className="size-3.5 text-[#02C39A]" />
                    <span>{t('uzbekistan.badge')}</span>
                    <span className="text-slate-400 font-normal">|</span>
                    <span className="text-slate-500 font-normal">{t('uzbekistan.badgeSub')}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mt-4 tracking-tight">
                    {t('uzbekistan.title')}
                </h2>

                <p className="text-sm sm:text-base md:text-lg text-slate-600 mt-3 leading-relaxed">
                    {t('uzbekistan.description')}
                </p>
            </div>

            {/* 4 Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12">
                {items.map((item, idx) => {
                    const Icon = icons[idx] || Fingerprint;
                    const style = cardStyles[idx] || cardStyles[0];

                    return (
                        <div
                            key={idx}
                            className="group relative bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 hover:border-[#028090]/40 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                        >
                            {/* Card Content */}
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
                                    <div className={`size-11 sm:size-12 rounded-xl flex items-center justify-center border ${style.iconColor} group-hover:scale-105 transition-transform`}>
                                        <Icon className="size-5 sm:size-6" />
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style.badgeColor}`}>
                                        {item.tag}
                                    </span>
                                </div>

                                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#028090] transition-colors">
                                    {item.title}
                                </h3>

                                <p className="text-xs sm:text-sm text-slate-600 mt-2 sm:mt-3 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>

                            {/* Trust Indicator */}
                            <div className="mt-5 sm:mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-500">
                                <CheckCircle2 className="size-4 text-[#02C39A] shrink-0" />
                                <span>{t('uzbekistan.trustBadge')}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Highlight Banner */}
            <div className="mt-8 sm:mt-10 rounded-2xl border border-[#DCE9E5] bg-[#F4FAF8] p-5 sm:p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3.5 sm:gap-4">
                    <div className="size-11 sm:size-12 rounded-xl bg-[#028090] text-white flex items-center justify-center shrink-0 shadow-md">
                        <Lock className="size-5 sm:size-6 text-[#02C39A]" />
                    </div>
                    <div>
                        <h4 className="text-sm sm:text-base font-bold text-[#0B2B33]">
                            {t('uzbekistan.bannerTitle')}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1">
                            {t('uzbekistan.bannerDesc')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DCE9E5] text-xs font-semibold text-[#0B2B33]">
                        <Zap className="size-3.5 text-[#02C39A]" />
                        {t('uzbekistan.bannerCert')}
                    </div>
                </div>
            </div>
        </section>
    );
}
