'use client';

import { useLanguage } from '@/context/language-context';
import { PhoneCall, DatabaseZap, LayoutGrid, Sparkles, ArrowRight } from 'lucide-react';

const icons = [PhoneCall, DatabaseZap, LayoutGrid];

export default function HowItWorksSection() {
    const { t, dictionary } = useLanguage();

    const steps = dictionary?.howItWorks?.steps || [];

    return (
        <section id="how-it-works" className="w-full py-20 px-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF5F2] border border-[#DCE9E5] text-[#028090] text-xs md:text-sm font-semibold uppercase tracking-wider">
                    <Sparkles className="size-3.5 text-[#02C39A]" />
                    <span>{t('howItWorks.badge')}</span>
                    <span className="text-slate-400 font-normal">|</span>
                    <span className="text-slate-500 font-normal">{t('howItWorks.badgeSub')}</span>
                </div>

                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mt-5 tracking-tight">
                    {t('howItWorks.title')}
                </h2>

                <p className="text-base md:text-lg text-slate-600 mt-4 leading-relaxed">
                    {t('howItWorks.description')}
                </p>
            </div>

            {/* Steps Grid */}
            <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((item, index) => {
                    const Icon = icons[index] || PhoneCall;
                    return (
                        <div
                            key={index}
                            className="group relative bg-white rounded-3xl p-8 border border-slate-200/90 hover:border-[#028090]/40 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-4 mb-6">
                                    <div className="size-12 rounded-xl bg-[#EAF5F2] text-[#028090] flex items-center justify-center group-hover:bg-[#028090] group-hover:text-white transition-colors">
                                        <Icon className="size-6" />
                                    </div>
                                    <span className="text-3xl font-black text-slate-200 group-hover:text-[#02C39A] transition-colors font-mono">
                                        {item.step}
                                    </span>
                                </div>

                                <span className="inline-block text-xs font-bold tracking-wider text-[#028090] uppercase mb-2">
                                    {item.kicker}
                                </span>

                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#028090] transition-colors">
                                    {item.title}
                                </h3>

                                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-slate-400 group-hover:text-[#028090] transition-colors">
                                <span>{t('common.step')} {item.step}</span>
                                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
