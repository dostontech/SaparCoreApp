'use client';
import { Inter } from 'next/font/google';
import './globals.css';
import LenisScroll from '@/components/lenis-scroll';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { useLanguage } from '@/context/language-context';
import CookieConsentBanner from '@/components/CookieConsent';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default function RootLayout({ children }) {
  // Sync HTML lang attribute with i18next language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language]);

  const { t } = useLanguage();

  return (
    <html lang={i18n.language} className={inter.variable}>
      <head>
        <title>{t('meta.title') || 'SAPAR — O‘zbekiston bizneslari uchun yagona ERP platformasi'}</title>
        <meta name="description" content={t('meta.description') || 'Buxgalteriya, savdo, CRM, HR, ombor va EDO bitta tizimda.'} />
        <meta name="keywords" content={t('meta.keywords') || 'ERP Uzbekistan, buxgalteriya dasturi, E-IMZO, soliq hisoboti, Didox, Faktura'} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* Open Graph */}
        <meta property="og:title" content={t('meta.title') || 'SAPAR — O‘zbekiston bizneslari uchun yagona ERP platformasi'} />
        <meta property="og:description" content={t('meta.description') || 'Buxgalteriya, savdo, CRM, HR, ombor va EDO bitta tizimda.'} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sapar.uz" />
        <meta property="og:image" content="https://sapar.uz/assets/logo.svg" />
        <meta property="og:site_name" content="SAPAR ERP" />
        <meta property="og:locale" content="uz_UZ" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('meta.title') || 'SAPAR'} />
        <meta name="twitter:description" content={t('meta.description') || 'Buxgalteriya, savdo, CRM, HR, ombor va EDO bitta tizimda.'} />
        <meta name="twitter:image" content="https://sapar.uz/assets/logo.svg" />

        <link rel="canonical" href="https://sapar.uz" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'SAPAR ERP',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Cloud / Web',
              offers: {
                '@type': 'Offer',
                price: '450000',
                priceCurrency: 'UZS',
              },
              description:
                t('meta.description') ||
                'ERP operating system built specifically for businesses in Uzbekistan.',
              url: 'https://sapar.uz',
              author: {
                '@type': 'Organization',
                name: 'SAPAR DIGITAL MChJ',
                url: 'https://sapar.uz',
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <LenisScroll />
        <CookieConsentBanner />
        <I18nextProvider i18n={i18n}>
          {children}
        </I18nextProvider>
      </body>
    </html>
  );
}

