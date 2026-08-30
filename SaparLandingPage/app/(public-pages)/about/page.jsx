'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import LanguageSwitcher from '@/components/language-switcher';
import {
    ShieldCheck,
    Landmark,
    Code,
    Calculator,
    FileSpreadsheet,
    Sparkles,
    ArrowLeft,
    Check,
    Send,
} from 'lucide-react';

const memberIcons = [Landmark, Code, Calculator, FileSpreadsheet];
const memberImages = [
    '/assets/doston.png',
    '/assets/Zoirbek.png',
    '/assets/ulugbek.png',
    '/assets/javohir.png',
];
const memberTelegrams = [
    { url: 'https://t.me/doston_abdulboriev', handle: '@doston_abdulboriev' },
    { url: 'https://t.me/zoirbek_tukhtasinov', handle: '@zoirbek_tukhtasinov' },
    { url: 'https://t.me/ulugbek_sharofiddinov', handle: '@ulugbek_sharofiddinov' },
    { url: 'https://t.me/javoxir_qodirov', handle: '@javoxir_qodirov' },
];

export default function AboutPage() {
    const { t, dictionary } = useLanguage();

    const teamMembers = dictionary?.meetOurTeam?.members || [];
    const strengthsList = dictionary?.about?.strengthsList || [];

    return (
        <main className="min-h-screen py-10 md:py-16 px-4 max-w-7xl mx-auto">
            {/* Top Bar with Back Link & Language Switcher */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#028090] hover:text-[#0B2B33] transition"
                >
                    <ArrowLeft className="size-4" />
                    <span>{t('about.backToHome')}</span>
                </Link>

                <LanguageSwitcher />
            </div>

            {/* Page Header */}
            <div className="text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF5F2] border border-[#DCE9E5] text-[#028090] text-xs sm:text-sm font-semibold uppercase tracking-wider">
                    <Sparkles className="size-3.5 text-[#02C39A]" />
                    <span>{t('about.badge')}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 mt-4 tracking-tight leading-tight">
                    {t('about.title')}
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-slate-600 mt-3 leading-relaxed max-w-3xl mx-auto">
                    {t('about.description')}
                </p>
            </div>

            {/* Core Strengths Banner */}
            <div className="mt-10 rounded-3xl bg-gradient-to-br from-[#0B2B33] via-[#10404B] to-[#0B2B33] text-white p-6 sm:p-8 md:p-10 border border-[#02C39A]/20 shadow-xl">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#02C39A] text-xs font-bold tracking-wide mb-3">
                        <ShieldCheck className="size-4" />
                        {t('about.coreStrengths')}
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                        {t('meetOurTeam.whyUsTitle')}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 text-xs sm:text-sm">
                        {strengthsList.map((st, sIdx) => (
                            <div key={sIdx} className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                                <span className="font-bold text-[#02C39A] block mb-1">{st.title}</span>
                                <span className="text-slate-300 text-xs">{st.desc}</span>
                            </div>
                        ))}
                    </div>
                    <p className="mt-5 text-xs sm:text-sm text-slate-300 italic border-t border-white/10 pt-3.5">
                        &ldquo;{t('meetOurTeam.whyUsDesc')}&rdquo;
                    </p>
                </div>
            </div>

            {/* Team Members Detailed Profiles */}
            <div className="mt-12 space-y-6 sm:space-y-8">
                {teamMembers.map((member, idx) => {
                    const Icon = memberIcons[idx] || Landmark;
                    const image = memberImages[idx] || '/assets/doston.png';
                    const tg = memberTelegrams[idx] || memberTelegrams[0];

                    return (
                        <div
                            key={idx}
                            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start"
                        >
                            {/* Left: Photo & Quick Meta */}
                            <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
                                <div className="relative size-40 sm:size-48 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200/80 shadow-md">
                                    <Image
                                        src={image}
                                        alt={member.name}
                                        fill
                                        sizes="200px"
                                        className="object-cover object-top"
                                    />
                                </div>
                                <div className="mt-3.5">
                                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#EAF5F2] text-[#028090] text-xs font-bold uppercase tracking-wider">
                                        {member.role}
                                    </span>
                                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1.5">
                                        {member.name}
                                    </h3>
                                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                        {member.subtitle}
                                    </p>

                                    {/* Telegram button */}
                                    <a
                                        href={tg.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#028090] hover:bg-[#0B2B33] text-white transition-all text-xs font-semibold"
                                    >
                                        <Send className="size-3.5" />
                                        <span>{t('meetOurTeam.contactViaTg')}</span>
                                    </a>
                                </div>
                            </div>

                            {/* Right: Detailed Experience & Strengths */}
                            <div className="lg:col-span-8 space-y-3.5">
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        {t('common.viewAbout')}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-slate-700 mt-1.5 leading-relaxed">
                                        {member.bio}
                                    </p>
                                </div>

                                <div className="pt-2.5 border-t border-slate-100">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                        {t('about.coreStrengths')}
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {member.strengths?.map((strength, sIdx) => (
                                            <div
                                                key={sIdx}
                                                className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700"
                                            >
                                                <Check className="size-3.5 text-[#028090] shrink-0 mt-0.5" />
                                                <span>{strength}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 text-center bg-[#F4FAF8] rounded-3xl p-8 sm:p-10 border border-[#DCE9E5]">
                <h3 className="text-xl sm:text-2xl font-bold text-[#0B2B33]">
                    {t('cta.title')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto">
                    {t('cta.description')}
                </p>
                <div className="mt-5 flex items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#028090] text-white hover:bg-[#10404B] transition shadow-md"
                    >
                        {t('about.backToHome')}
                    </Link>
                </div>
            </div>
        </main>
    );
}
