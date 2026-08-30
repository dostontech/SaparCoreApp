'use client';

import { useRef, useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { Check, Sparkles, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

export default function OurPricingSection() {
    const { t, dictionary } = useLanguage();
    const [isYearly, setIsYearly] = useState(false);
    const scrollContainerRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(1); // Default to Professional on mobile

    const plans = dictionary?.pricing?.plans || [];

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const scrollLeft = container.scrollLeft;
        const itemWidth = container.offsetWidth * 0.85;
        const newIndex = Math.round(scrollLeft / itemWidth);
        setActiveIndex(Math.min(Math.max(newIndex, 0), plans.length - 1));
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
        <section id="pricing" className="w-full py-10 md:py-16 px-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF5F2] border border-[#DCE9E5] text-[#028090] text-xs sm:text-sm font-semibold uppercase tracking-wider">
                    <Sparkles className="size-3.5 text-[#02C39A]" />
                    <span>{t('pricing.badge')}</span>
                    <span className="text-slate-400 font-normal">|</span>
                    <span className="text-slate-500 font-normal">{t('pricing.badgeSub')}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mt-4 tracking-tight">
                    {t('pricing.title')}
                </h2>

                <p className="text-sm sm:text-base md:text-lg text-slate-600 mt-3 leading-relaxed">
                    {t('pricing.description')}
                </p>

                {/* Billing Toggle (Monthly / Yearly) */}
                <div className="mt-6 sm:mt-8 inline-flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button
                        onClick={() => setIsYearly(false)}
                        className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                            !isYearly
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        {t('common.monthly')}
                    </button>
                    <button
                        onClick={() => setIsYearly(true)}
                        className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                            isYearly
                                ? 'bg-[#0B2B33] text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <span>{t('common.yearly')}</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#02C39A] text-[#0B2B33] text-[11px] sm:text-xs font-bold">
                            {t('common.discount15')}
                        </span>
                    </button>
                </div>
            </div>

            {/* Pricing Cards Container: Mobile Horizontal Carousel + Desktop Grid */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex lg:grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-12 items-stretch overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 no-scrollbar scroll-smooth"
            >
                {plans.map((plan, index) => {
                    const isPopular = index === 1;
                    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
                    const hasPeriod = Boolean(plan.period);

                    return (
                        <div
                            key={index}
                            className={`w-[85vw] sm:w-[70vw] lg:w-auto shrink-0 lg:shrink snap-center relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                                isPopular
                                    ? 'bg-gradient-to-b from-[#0B2B33] to-[#10404B] text-white shadow-2xl scale-100 lg:scale-105 border-2 border-[#02C39A]/60 z-10'
                                    : 'bg-white text-slate-900 border border-slate-200/90 hover:border-[#028090]/40 shadow-xs hover:shadow-xl'
                            }`}
                        >
                            {/* Popular Ribbon / Kicker */}
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-4">
                                    <span
                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                            isPopular
                                                ? 'bg-[#02C39A] text-[#0B2B33]'
                                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}
                                    >
                                        {isPopular && <Zap className="size-3 fill-current" />}
                                        {plan.kicker}
                                    </span>
                                </div>

                                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                                    {plan.name}
                                </h3>

                                <p className={`text-xs sm:text-sm mt-2 ${isPopular ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {plan.description}
                                </p>

                                {/* Price block */}
                                <div className="mt-6 pb-6 border-b border-slate-200/20">
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                                            {price}
                                        </span>
                                        {hasPeriod && (
                                            <span className={`text-xs sm:text-sm font-medium ${isPopular ? 'text-slate-300' : 'text-slate-500'}`}>
                                                {plan.period}
                                            </span>
                                        )}
                                    </div>
                                    {isYearly && hasPeriod && (
                                        <div className="text-xs text-[#02C39A] font-semibold mt-1.5">
                                            {t('common.save15')}
                                        </div>
                                    )}
                                </div>

                                {/* Features List */}
                                <ul className="mt-6 space-y-3 sm:space-y-3.5">
                                    {plan.features?.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm">
                                            <div
                                                className={`size-4.5 sm:size-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                                    isPopular
                                                        ? 'bg-[#02C39A] text-[#0B2B33]'
                                                        : 'bg-[#EAF5F2] text-[#028090]'
                                                }`}
                                            >
                                                <Check className="size-3 stroke-[3]" />
                                            </div>
                                            <span className={`leading-snug ${isPopular ? 'text-slate-200' : 'text-slate-700'}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Button */}
                            <div className="mt-8 pt-6">
                                <a
                                    href="#contact"
                                    className={`w-full inline-flex items-center justify-center py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                                        isPopular
                                            ? 'bg-[#02C39A] text-[#0B2B33] hover:bg-[#02C39A]/90 shadow-lg shadow-[#02C39A]/20'
                                            : 'bg-slate-900 text-white hover:bg-[#028090]'
                                    }`}
                                >
                                    {plan.buttonText || t('common.getDemo')}
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Mobile Carousel Navigation (Dots & Controls) */}
            <div className="flex lg:hidden items-center justify-between mt-3 px-2">
                <div className="flex items-center gap-1.5">
                    {plans.map((_, dotIdx) => (
                        <button
                            key={dotIdx}
                            onClick={() => scrollToSlide(dotIdx)}
                            aria-label={`Slide ${dotIdx + 1}`}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                activeIndex === dotIdx
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
                        onClick={() => scrollToSlide(Math.min(plans.length - 1, activeIndex + 1))}
                        disabled={activeIndex === plans.length - 1}
                        aria-label="Next"
                        className="size-8 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                    >
                        <ChevronRight className="size-4" />
                    </button>
                </div>
            </div>

            {/* Clarification note */}
            <div className="mt-8 sm:mt-12 text-center text-xs text-slate-500">
                {t('pricing.disclaimer')}
            </div>
        </section>
    );
}
