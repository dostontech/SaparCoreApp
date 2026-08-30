'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/language-context';
import { Cookie, ShieldCheck, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function CookieConsentBanner() {
    const { t, language } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        // Check if consent has already been given or declined
        const consent = localStorage.getItem('sapar_cookie_consent');
        if (!consent) {
            // Small delay for smooth entry animation
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, []);

    const sendConsentEvent = async (status) => {
        try {
            await fetch('/api/consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    consent: status,
                    language: language,
                    path: window.location.pathname,
                    timestamp: new Date().toISOString(),
                }),
            });
        } catch (e) {
            // Silently ignore network errors
        }
    };

    const handleAccept = () => {
        localStorage.setItem('sapar_cookie_consent', 'accepted');
        sendConsentEvent('accepted');
        setIsClosing(true);
        setTimeout(() => setIsVisible(false), 350);
    };

    const handleDecline = () => {
        localStorage.setItem('sapar_cookie_consent', 'declined');
        sendConsentEvent('declined');
        setIsClosing(true);
        setTimeout(() => setIsVisible(false), 350);
    };

    if (!isVisible) return null;

    return (
        <aside
            aria-label="Cookie Preferences"
            className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] transition-all duration-350 ease-out transform ${
                isClosing ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'
            }`}
        >
            <div className="relative overflow-hidden rounded-2xl bg-[#0B2B33]/95 backdrop-blur-xl border border-white/15 p-5 text-white shadow-2xl shadow-black/40 ring-1 ring-white/10">
                {/* Background decorative glow */}
                <div className="absolute -top-12 -right-12 h-28 w-28 rounded-full bg-[#028090]/25 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-[#02C39A]/20 blur-xl pointer-events-none" />

                {/* Close Button */}
                <button
                    onClick={handleDecline}
                    aria-label="Close cookie banner"
                    className="absolute top-3.5 right-3.5 p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <X className="size-4" />
                </button>

                {/* Header with Icon */}
                <div className="flex items-center gap-3 mb-2.5">
                    <div className="flex items-center justify-center size-9 rounded-xl bg-gradient-to-br from-[#028090] to-[#02C39A] text-white shadow-md shadow-[#028090]/30 shrink-0">
                        <Cookie className="size-4.5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white tracking-tight">
                            {t('cookie.title') || 'Cookie fayllari'}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-[#02C39A]">
                            <ShieldCheck className="size-3" />
                            <span>100% xavfsiz & shifrlangan</span>
                        </div>
                    </div>
                </div>

                {/* Message Body */}
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {t('cookie.message') ||
                        'Biz sayt ishlashini yaxshilash, tahlil va tajribangizni oshirish uchun cookie fayllaridan foydalanamiz.'}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2.5 pt-1 border-t border-white/10">
                    <Link
                        href="/privacy"
                        className="text-[11px] text-white/60 hover:text-[#02C39A] underline-offset-2 hover:underline transition-colors"
                    >
                        {t('cookie.privacyPolicy') || t('footer.privacyPolicy') || 'Maxfiylik siyosati'}
                    </Link>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDecline}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors active:scale-95"
                        >
                            {t('cookie.decline') || 'Rad etish'}
                        </button>
                        <button
                            onClick={handleAccept}
                            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#028090] to-[#02C39A] hover:brightness-110 transition shadow-sm shadow-[#028090]/30 active:scale-95 flex items-center gap-1"
                        >
                            <span>{t('cookie.accept') || 'Qabul qilish'}</span>
                            <ChevronRight className="size-3" />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
