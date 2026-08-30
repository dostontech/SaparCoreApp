'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import {
    Users,
    ShieldCheck,
    Landmark,
    Code,
    Calculator,
    FileSpreadsheet,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
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

export default function MeetOurTeamSection() {
    const { t, dictionary } = useLanguage();
    const scrollContainerRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const teamMembers = dictionary?.meetOurTeam?.members || [];

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const scrollLeft = container.scrollLeft;
        const itemWidth = container.offsetWidth * 0.85;
        const newIndex = Math.round(scrollLeft / itemWidth);
        setActiveIndex(Math.min(Math.max(newIndex, 0), teamMembers.length - 1));
    };

    const scrollToSlide = (index) => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const cards = container.children;
        if (cards[index]) {
            cards[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            setActiveIndex(index);
        }
    };

    return (
        <section id="team" className="w-full py-10 md:py-16 px-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF5F2] border border-[#DCE9E5] text-[#028090] text-xs sm:text-sm font-semibold uppercase tracking-wider">
                    <Users className="size-3.5 text-[#02C39A]" />
                    <span>{t('meetOurTeam.badge')}</span>
                    <span className="text-slate-400 font-normal">|</span>
                    <span className="text-slate-500 font-normal">{t('meetOurTeam.badgeSub')}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mt-4 tracking-tight">
                    {t('meetOurTeam.title')}
                </h2>

                <p className="text-sm sm:text-base md:text-lg text-slate-600 mt-3 leading-relaxed">
                    {t('meetOurTeam.description')}
                </p>
            </div>

            {/* Team Container: Mobile Horizontal Carousel + Desktop Grid */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar scroll-smooth"
            >
                {teamMembers.map((member, index) => {
                    const Icon = memberIcons[index] || Landmark;
                    const image = memberImages[index] || '/assets/doston.png';
                    const tg = memberTelegrams[index] || memberTelegrams[0];

                    return (
                        <div
                            key={index}
                            className="w-[85vw] sm:w-[70vw] md:w-auto shrink-0 md:shrink snap-center group bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 hover:border-[#028090]/40 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                {/* Avatar */}
                                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-200/60 group-hover:border-[#028090]/30 transition-colors">
                                    <Image
                                        src={image}
                                        alt={member.name}
                                        fill
                                        sizes="(max-width: 768px) 85vw, (max-width: 1200px) 50vw, 25vw"
                                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-3 right-3 size-8.5 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-[#028090] shadow-sm">
                                        <Icon className="size-4" />
                                    </div>
                                </div>

                                <div className="inline-block px-2.5 py-0.5 rounded-md bg-[#EAF5F2] text-[#028090] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                                    {member.role}
                                </div>

                                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#028090] transition-colors">
                                    {member.name}
                                </h3>

                                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                    {member.subtitle}
                                </p>

                                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                                    {member.bio}
                                </p>
                            </div>

                            {/* Bottom: Telegram link & tags */}
                            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                                <a
                                    href={tg.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-[#EAF5F2] hover:bg-[#028090] text-[#028090] hover:text-white transition-all text-xs font-semibold group/tg"
                                >
                                    <Send className="size-3.5 transition-transform group-hover/tg:translate-x-0.5" />
                                    <span>{t('meetOurTeam.contactViaTg')}</span>
                                </a>

                                <div className="flex flex-wrap gap-1">
                                    {member.strengths?.slice(0, 3).map((st, stIdx) => (
                                        <span
                                            key={stIdx}
                                            className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-medium text-slate-600"
                                        >
                                            {st}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Mobile Carousel Navigation (Dots & Controls) */}
            <div className="flex md:hidden items-center justify-between mt-3 px-2">
                <div className="flex items-center gap-1.5">
                    {teamMembers.map((_, dotIdx) => (
                        <button
                            key={dotIdx}
                            onClick={() => scrollToSlide(dotIdx)}
                            aria-label={`Slide ${dotIdx + 1}`}
                            className={`h-2 rounded-full transition-all duration-300 ${activeIndex === dotIdx
                                    ? 'w-6 bg-[#028090]'
                                    : 'w-2 bg-slate-300'
                                }`}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => scrollToSlide(Math.max(0, activeIndex - 1))}
                        disabled={activeIndex === 0}
                        aria-label="Previous"
                        className="size-8 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                    >
                        <ChevronLeft className="size-4" />
                    </button>
                    <button
                        onClick={() => scrollToSlide(Math.min(teamMembers.length - 1, activeIndex + 1))}
                        disabled={activeIndex === teamMembers.length - 1}
                        aria-label="Next"
                        className="size-8 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                    >
                        <ChevronRight className="size-4" />
                    </button>
                </div>
            </div>

            {/* Combined Positioning Pitch Banner */}
            <div className="mt-8 sm:mt-12 rounded-3xl bg-gradient-to-br from-[#0B2B33] to-[#10404B] text-white p-6 sm:p-8 md:p-10 border border-[#02C39A]/20 shadow-xl">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#02C39A] text-xs font-bold tracking-wide backdrop-blur-xs mb-3">
                            <ShieldCheck className="size-4" />
                            {t('meetOurTeam.whyUsBadge')}
                        </div>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
                            {t('meetOurTeam.whyUsTitle')}
                        </h3>
                        <p className="mt-2.5 text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
                            {t('meetOurTeam.whyUsDesc')}
                        </p>
                    </div>

                    <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <Link
                            href="/about"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-[#02C39A] text-[#0B2B33] hover:bg-white transition-all shadow-lg shadow-[#02C39A]/20"
                        >
                            <span>{t('common.viewAbout')}</span>
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
