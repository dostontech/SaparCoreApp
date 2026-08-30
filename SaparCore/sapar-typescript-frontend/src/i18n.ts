// i18n configuration for SAPAR Core
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '@/locales/en.json';
import ru from '@/locales/ru.json';
import oz from '@/locales/oz.json';
import uz from '@/locales/uz.json';

const initialLang = (typeof window !== 'undefined' && localStorage.getItem('sapar_lang')) || 'uz';

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
    lng: initialLang,
    fallbackLng: 'uz',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'sapar_lang',
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
