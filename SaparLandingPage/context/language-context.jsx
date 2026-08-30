
'use client';
// i18n language hook for SAPAR Landing Page
import { useTranslation } from 'react-i18next';

// Define supported languages metadata
export const languages = [
  { code: 'oz', name: "Ўзбек", flag: '🇺🇿', label: "Ўзбек", script: null },
  { code: 'uz', name: "Oʻzbek", flag: '🇺🇿', label: "Oʻzbek", script: null },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', label: 'Русский', script: null },
  { code: 'en', name: 'English', flag: '🇬🇧', label: 'English', script: null },
];

export const defaultLanguage = 'oz';

export function useLanguage() {
  const { i18n, t } = useTranslation();
  const setLanguage = (lang) => {
    if (!languages.find((l) => l.code === lang)) return;
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem('sapar_lang', lang);
    } catch (e) { }
  };
  const language = i18n.language || defaultLanguage;
  const dictionary = i18n.getResourceBundle(i18n.language) || {}; // get translation objects for current language
  return { language, setLanguage, languages, t, dictionary };
}
