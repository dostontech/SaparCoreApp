import Banner from '@/components/banner';
import Footer from '@/components/footer';

export const metadata = {
    title: 'Sapar — O‘zbekiston Biznesi Uchun Yagona ERP Platforma',
    description: 'Buxgalteriya, EDO, Soliq hisobotlari, CRM, HR va Bank integratsiyasi bitta tizimda. O‘zbekiston me’yorlari va E-IMZO ga to‘liq integratsiyalangan.',
    keywords: [
        'Sapar',
        'Sapar',
        'ERP O‘zbekiston',
        'Buxgalteriya dasturi',
        'EDO integratsiyasi',
        'Didox',
        'Faktura.uz',
        'CRM tizimi',
        'HR va ish haqi',
        'E-IMZO imzolash',
        'Soliq hisoboti my3soliq',
    ],
    authors: [{ name: 'Sapar Jamoasi' }],
    creator: 'Sapar',
    appleWebApp: {
        title: 'Sapar',
        statusBarStyle: 'default',
        capable: true,
    },
    openGraph: {
        title: 'Sapar — Bitta platforma, barcha dasturlar o‘rniga',
        description: 'Buxgalteriya, EDO, Soliq, HR, CRM va Bank oqimlari — yagona unifikatsiyalangan milliy platformada.',
        type: 'website',
        locale: 'uz_UZ',
        siteName: 'Sapar',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Sapar — O‘zbekiston Biznesi Uchun Yagona ERP Platforma',
        description: 'Buxgalteriya, EDO, Soliq, HR, CRM va Bank oqimlari bitta tizimda.',
    },
};

export default function Layout({ children }) {
    return (
        <>
            <Banner />
            {children}
            <Footer />
        </>
    );
}
