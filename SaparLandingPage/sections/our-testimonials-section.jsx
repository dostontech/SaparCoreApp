'use client';

import { useRef, useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { Star, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export default function OurTestimonialsSection() {
    const { t, dictionary } = useLanguage();
    const scrollContainerRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const testimonials = dictionary?.testimonials?.items || [];

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const scrollLeft = container.scrollLeft;
        const itemWidth = container.offsetWidth * 0.85;
        const newIndex = Math.round(scrollLeft / itemWidth);
        setActiveIndex(Math.min(Math.max(newIndex, 0), testimonials.length - 1));
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
        <section id="testimonials" className="w-full py-10 md:py-16 px-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF5F2] border border-[#DCE9E5] text-[#028090] text-xs sm:text-sm font-semibold uppercase tracking-wider">
                    <Sparkles className="size-3.5 text-[#02C39A]" />
                    <span>{t('testimonials.badge')}</span>
                    <span className="text-slate-400 font-normal">|</span>
                    <span className="text-slate-500 font-normal">{t('testimonials.badgeSub')}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mt-4 tracking-tight">
                    {t('testimonials.title')}
                </h2>

                <p className="text-sm sm:text-base md:text-lg text-slate-600 mt-3 leading-relaxed">
                    {t('testimonials.description')}
                </p>
            </div>

            {/* Testimonials Container: Mobile Horizontal Carousel + Desktop Grid */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-12 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar scroll-smooth"
            >
                {testimonials.map((item, index) => (
                    <div
                        key={index}
                        className="w-[85vw] sm:w-[70vw] md:w-auto shrink-0 md:shrink snap-center group relative bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 hover:border-[#028090]/40 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                        <div>
                            {/* Stars */}
                            <div className="flex items-center gap-1 mb-4 text-[#02C39A]">
                                {[...Array(5)].map((_, rIdx) => (
                                    <Star key={rIdx} className="size-4 fill-[#02C39A] text-[#02C39A]" />
                                ))}
                            </div>

                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                                &ldquo;{item.quote}&rdquo;
                            </p>
                        </div>

                        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                            <div className="size-10 rounded-full bg-[#EAF5F2] text-[#028090] font-bold flex items-center justify-center text-sm">
                                {item.author.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">{item.author}</h4>
                                <p className="text-xs text-slate-500">{item.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile Carousel Navigation (Dots & Controls) */}
            <div className="flex md:hidden items-center justify-between mt-3 px-2">
                <div className="flex items-center gap-1.5">
                    {testimonials.map((_, dotIdx) => (
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
                        onClick={() => scrollToSlide(Math.min(testimonials.length - 1, activeIndex + 1))}
                        disabled={activeIndex === testimonials.length - 1}
                        aria-label="Next"
                        className="size-8 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                    >
                        <ChevronRight className="size-4" />
                    </button>
                </div>
            </div>
        </section>
    );
}
