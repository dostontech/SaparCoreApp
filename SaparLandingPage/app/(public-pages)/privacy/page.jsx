'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, FileText } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export default function PrivacyPage() {
    const { t, language } = useLanguage();

    const titles = {
        oz: 'Махфийлик сиёсати',
        uz: 'Maxfiylik siyosati',
        ru: 'Политика конфиденциальности',
        en: 'Privacy Policy',
    };

    const subtitles = {
        oz: 'SAPAR платформасида маълумотларингиз хавфсизлиги ва дахлсизлиги тўлиқ таъминланади.',
        uz: 'SAPAR platformasida ma’lumotlaringiz xavfsizligi va daxlsizligi to‘liq ta’minlanadi.',
        ru: 'Безопасность и конфиденциальность ваших данных на платформе SAPAR полностью гарантированы.',
        en: 'Your privacy and corporate data security are guaranteed on the SAPAR ERP platform.',
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
                            <ShieldCheck className="size-6" />
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
                                <Lock className="size-4 text-[#028090]" />
                                1. Ma’lumotlar himoyasi va shifrlash
                            </h2>
                            <p>
                                SAPAR ERP barcha foydalanuvchilarning korporativ, moliyaviy va shaxsiy maʼlumotlarini O‘zbekiston Respublikasi &quot;Shaxsga doir ma’lumotlar to‘g‘risida&quot;gi Qonuni talablariga muvofiq TLS 1.3 va AES-256 shifrlash protokollari asosida xavfsiz saqlaydi.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-bold text-[#0B2B33] mb-2 flex items-center gap-2">
                                <FileText className="size-4 text-[#028090]" />
                                2. Cookie fayllaridan foydalanish
                            </h2>
                            <p>
                                Platforma foydalanuvchi sessiyalarini boshqarish, xavfsizlikni taʼminlash va tahliliy sifat ko‘rsatkichlarini oshirish maqsadida cookie fayllaridan foydalanadi. Siz xohlagan paytda brauzer orqali ushbu fayllarni tozalashingiz mumkin.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-bold text-[#0B2B33] mb-2">
                                3. Aloqa va murojaatlar
                            </h2>
                            <p>
                                Maxfiylik va maʼlumotlar xavfsizligi bo‘yicha savollaringiz bo‘lsa, rasmiy Telegram yoki info@sapar.uz orqali mutaxassislarimizga murojaat qilishingiz mumkin.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
