'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/language-context';
import { ChevronDown, Check } from 'lucide-react';

export default function LanguageSwitcher({ variant = 'desktop' }) {
    const { language, setLanguage, languages } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentLangObj = languages.find((l) => l.code === language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    if (variant === 'mobile-inline') {
        return (
            <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-zinc-100 rounded-2xl w-full">
                {languages.map((lang) => {
                    const isActive = language === lang.code;
                    return (
                        <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={`py-2 px-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-between gap-1.5 ${isActive
                                ? 'bg-[#0B2B33] text-white shadow-xs'
                                : 'bg-white/80 text-zinc-700 hover:bg-white hover:text-zinc-900'
                                }`}
                        >
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm">{lang.flag}</span>
                                <span>{lang.name}</span>
                            </div>
                            {lang.script && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-[#02C39A]' : 'bg-zinc-200/60 text-zinc-500'
                                    }`}>
                                    {lang.script}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="true"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200/90 rounded-xl transition-all duration-200 cursor-pointer shadow-2xs hover:border-zinc-300"
            >
                <span className="text-base leading-none">{currentLangObj.flag}</span>
                <span className="font-bold tracking-wide text-zinc-900">{currentLangObj.label}</span>
                {currentLangObj.script && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 font-medium">
                        {currentLangObj.script}
                    </span>
                )}
                <ChevronDown
                    className={`size-3.5 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-zinc-700' : ''
                        }`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1.5 w-52 rounded-2xl bg-white p-1.5 shadow-2xl border border-zinc-200 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Tilni tanlang / Язык / Language
                    </div> */}
                    <div className="space-y-0.5 mt-0.5">
                        {languages.map((lang) => {
                            const isActive = language === lang.code;
                            return (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setLanguage(lang.code);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-xl transition-all ${isActive
                                        ? 'bg-[#EAF5F2] text-[#028090] font-bold'
                                        : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-base leading-none">{lang.flag}</span>
                                        <span>{lang.name}</span>
                                        {lang.script && (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${isActive ? 'bg-[#028090]/15 text-[#028090]' : 'bg-zinc-100 text-zinc-500'
                                                }`}>
                                                {lang.script}
                                            </span>
                                        )}
                                    </div>
                                    {isActive && <Check className="size-4 text-[#028090] stroke-[2.5]" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
