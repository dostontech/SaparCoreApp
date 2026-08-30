import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  codeBadge: string;
}

export const LANGUAGES: LanguageOption[] = [
  {
    code: 'uz',
    name: 'Oʻzbekcha (Lotin)',
    nativeName: 'Oʻzbekcha',
    codeBadge: 'UZ',
  },
  {
    code: 'ru',
    name: 'Русский',
    nativeName: 'Русский',
    codeBadge: 'RU',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    codeBadge: 'EN',
  },
  {
    code: 'oz',
    name: 'Ўзбекча (Кирилл)',
    nativeName: 'Ўзбекча',
    codeBadge: 'ЎЗ',
  },
];

interface LanguageSwitcherProps {
  variant?: 'header' | 'sidebar';
  isSidebarOpen?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'header',
  isSidebarOpen = true,
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangCode = i18n.language || localStorage.getItem('sapar_lang') || 'uz';
  const currentLang =
    LANGUAGES.find((l) => l.code === currentLangCode) ||
    LANGUAGES.find((l) => currentLangCode.startsWith(l.code)) ||
    LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('sapar_lang', code);
    setIsOpen(false);
  };

  if (variant === 'sidebar') {
    return (
      <div className="relative w-full" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs cursor-pointer ${
            !isSidebarOpen ? 'justify-center px-2' : 'px-3'
          }`}
          title="Tilni oʻzgartirish / Сменить язык / Change language"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2 truncate">
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 shrink-0">{currentLang.codeBadge}</span>
            {isSidebarOpen && (
              <span className="truncate text-slate-800">{currentLang.nativeName}</span>
            )}
          </div>
          {isSidebarOpen && (
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-teal-700' : ''
              }`}
            />
          )}
        </button>

        {isOpen && (
          <div
            className={`absolute bottom-full mb-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200/90 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150 z-50 overflow-hidden ${
              isSidebarOpen ? 'left-0' : 'left-full ml-2 bottom-0'
            }`}
          >
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-teal-700" />
              <span>Til / Язык / Language</span>
            </div>

            <div className="py-1">
              {LANGUAGES.map((lang) => {
                const isSelected =
                  currentLang.code === lang.code || currentLangCode.startsWith(lang.code);
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition text-left cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 text-teal-900 font-extrabold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">{lang.codeBadge}</span>
                      <span>{lang.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-teal-700 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Header variant
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 transition border border-slate-200/80 shadow-2xs cursor-pointer focus:outline-none"
        title="Tilni oʻzgartirish / Сменить язык / Change language"
        aria-expanded={isOpen}
      >
        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 leading-none">{currentLang.codeBadge}</span>
        <span className="hidden sm:inline-block">{currentLang.nativeName}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/90 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150 z-50 overflow-hidden">
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-teal-700" />
              <span>Til / Язык / Language</span>
            </div>
          </div>

          <div className="py-1">
            {LANGUAGES.map((lang) => {
              const isSelected =
                currentLang.code === lang.code || currentLangCode.startsWith(lang.code);
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition text-left cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 text-teal-900'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">{lang.codeBadge}</span>
                    <span>{lang.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-teal-700 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

};

export default LanguageSwitcher;
