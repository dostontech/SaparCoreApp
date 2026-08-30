// i18n initialization for SAPAR Landing Page
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { en } from '@/locales/en';
import { ru } from '@/locales/ru';
import { oz } from '@/locales/oz';
import { uz } from '@/locales/uz';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      oz: { translation: oz },
      uz: { translation: uz },
    },
    fallbackLng: 'oz',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'sapar_lang',
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
