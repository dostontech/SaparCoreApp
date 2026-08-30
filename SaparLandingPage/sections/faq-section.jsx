'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { Minus, Plus, HelpCircle } from 'lucide-react';

export default function FaqSection() {
    const { t, dictionary } = useLanguage();
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = dictionary?.faq?.items || [];

    return (
        <section id="faq" className="w-full py-10 md:py-16 px-4 max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF5F2] border border-[#DCE9E5] text-[#028090] text-xs sm:text-sm font-semibold uppercase tracking-wider">
                    <HelpCircle className="size-3.5 text-[#02C39A]" />
                    <span>{t('faq.badge')}</span>
                    <span className="text-slate-400 font-normal">|</span>
                    <span className="text-slate-500 font-normal">{t('faq.badgeSub')}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mt-4 tracking-tight">
                    {t('faq.title')}
                </h2>

                <p className="text-sm sm:text-base md:text-lg text-slate-600 mt-3 leading-relaxed">
                    {t('faq.description')}
                </p>
            </div>

            {/* Accordion list */}
            <div className="mt-8 sm:mt-12 space-y-3 sm:space-y-4">
                {faqs.map((faq, index) => {
                    const isOpen = openIndex === index;
                    return (
                        <div
                            key={index}
                            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                                isOpen
                                    ? 'bg-white border-[#028090]/40 shadow-md'
                                    : 'bg-white/80 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <button
                                onClick={() => setOpenIndex(isOpen ? null : index)}
                                className="w-full p-4 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                            >
                                <span className="text-sm sm:text-base font-bold text-slate-900">
                                    {faq.question}
                                </span>
                                <div
                                    className={`size-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                        isOpen
                                            ? 'bg-[#0B2B33] text-[#02C39A]'
                                            : 'bg-slate-100 text-slate-500'
                                    }`}
                                >
                                    {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                                </div>
                            </button>

                            {isOpen && (
                                <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
