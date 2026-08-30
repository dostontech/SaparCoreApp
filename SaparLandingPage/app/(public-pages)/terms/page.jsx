'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, CheckCircle2, FileCheck } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export default function TermsPage() {
    const { t, language } = useLanguage();

    const titles = {
        oz: 'Фойдаланиш шартлари',
        uz: 'Foydalanish shartlari',
        ru: 'Условия использования',
        en: 'Terms of Use',
    };

    const subtitles = {
        oz: 'SAPAR ERP платформасидан фойдаланиш бўйича асосий қоидалар ва шартлар.',
        uz: 'SAPAR ERP platformasidan foydalanish bo‘yicha asosiy qoidalar va shartlar.',
        ru: 'Основные правила и условия использования платформы SAPAR ERP.',
        en: 'Terms and conditions for utilizing the SAPAR ERP business platform.',
    };

    return (
        <main className="min-h-screen bg-slate-50 text-slate-800 py-16 px-4 md:px-12 lg:px-24">
            <div className="max-w-3xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#028090] hover:text-[#0B2B33] mb-8 transition-colors"
                >
                    <ArrowLeft className="size-4" />
                    <span>{t('about.backToHome') || 'Asosiy sahifaga qaytish'}</span>
                </Link>

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200/80">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-2xl bg-[#028090]/10 text-[#028090]">
                            <FileCheck className="size-6" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#028090]">
                            SAPAR Digital
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#0B2B33] mb-4">
                        {titles[language] || titles.oz}
                    </h1>

                    <p className="text-slate-600 mb-8 leading-relaxed">
                        {subtitles[language] || subtitles.oz}
                    </p>

                    <div className="space-y-6 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-6">
                        <section>
                            <h2 className="text-base font-bold text-[#0B2B33] mb-2 flex items-center gap-2">
                                <CheckCircle2 className="size-4 text-[#028090]" />
                                1. Xizmatdan foydalanish huquqi
                            </h2>
                            <p>
                                SAPAR ERP dasturiy taʼminoti O‘zbekiston Respublikasi yuridik shaxslari va yakka tartibdagi tadbirkorlariga korxona resurslarini boshqarish va hisobotlarni shakllantirish uchun taqdim etiladi.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-bold text-[#0B2B33] mb-2 flex items-center gap-2">
                                <ShieldAlert className="size-4 text-[#028090]" />
                                2. Xavfsizlik va masʼuliyat
                            </h2>
                            <p>
                                Foydalanuvchi o‘z hisob maʼlumotlari va E-IMZO elektron kalitlarining maxfiyligini saqlash uchun javobgardir.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
