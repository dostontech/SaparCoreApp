'use client';

import { InstagramIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { SaparLogo } from '@/components/sapar-logo';

export default function Footer() {
    const { t, dictionary } = useLanguage();

    const socialLinks = [
        { icon: TwitterIcon, href: 'https://twitter.com/sapar', label: 'Twitter' },
        { icon: InstagramIcon, href: 'https://instagram.com/sapar', label: 'Instagram' },
        { icon: YoutubeIcon, href: 'https://youtube.com/@sapar', label: 'Youtube' },
        { icon: LinkedinIcon, href: 'https://linkedin.com/company/sapar', label: 'Linkedin' },
    ];

    const solutionItems = dictionary?.footer?.solutionsItems || [];

    return (
        <>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap');
                    *{ font-family: "Geist", sans-serif; }
                `}
            </style>

            <footer className='flex flex-col justify-end bg-black pt-20 px-4 sm:px-6 lg:px-8 overflow-hidden w-full'>
                <div className='w-full max-w-7xl mx-auto'>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:flex lg:flex-wrap lg:justify-between lg:gap-x-8">

                        {/* Logo + tagline + contact */}
                        <div className="col-span-2 lg:col-span-1 lg:w-[30%] flex flex-col items-start text-left">
                            <Link href="/">
                                <SaparLogo variant="white" className="h-8 w-auto md:h-9" />
                            </Link>

                            <div className='w-full max-w-52 h-0.5 mt-8 bg-gradient-to-r from-[#24212D] to-[#24212D]/0'></div>

                            <p className='text-sm text-white/60 mt-6 max-w-[350px] leading-relaxed'>
                                {t('footer.tagline')}
                            </p>

                            <div className='flex flex-col gap-1.5 mt-6'>
                                <Link href="mailto:support@sapar.uz" className='text-sm text-white/60 hover:text-white transition-colors'>support@sapar.uz</Link>
                                <Link href="tel:+998712000000" className='text-sm text-white/60 hover:text-white transition-colors'>+998 71 200 00 00</Link>
                            </div>
                        </div>

                        {/* Kompaniya */}
                        <div className="w-full md:w-[45%] lg:w-[15%] flex flex-col items-start text-left">
                            <h3 className='text-sm text-white font-semibold'>{t('footer.company')}</h3>
                            <div className="flex flex-col gap-2.5 mt-6">
                                <Link href="/about" className='text-sm text-white/60 hover:text-white transition-colors'>{t('footer.aboutUs')}</Link>
                                <Link href="#pricing" className='text-sm text-white/60 hover:text-white transition-colors'>{t('footer.pricing')}</Link>
                                <Link href="#partnership" className='text-sm text-white/60 hover:text-white transition-colors'>{t('footer.partners')}</Link>
                                <Link href="#contact" className='text-sm text-white/60 hover:text-white transition-colors'>{t('footer.contact')}</Link>
                            </div>

                            <h3 className='text-sm text-white font-semibold mt-10'>{t('footer.help')}</h3>
                            <div className="flex flex-col gap-2.5 mt-6">
                                <Link href="#faq" className='text-sm text-white/60 hover:text-white transition-colors'>{t('footer.faq')}</Link>
                                <Link href="#contact" className='text-sm text-white/60 hover:text-white transition-colors'>{t('footer.helpCenter')}</Link>
                                <Link href="#contact" className='text-sm text-white/60 hover:text-white transition-colors'>{t('footer.support')}</Link>
                            </div>
                        </div>

                        {/* Mahsulotlar */}
                        <div className="w-full md:w-[45%] lg:w-[15%] flex flex-col items-start text-left">
                            <h3 className='text-sm text-white font-semibold'>{t('footer.products')}</h3>
                            <div className="flex flex-col gap-2.5 mt-6">
                                <Link href="#crm" className='text-sm text-white/60 hover:text-white transition-colors'>Sapar CRM</Link>
                                <Link href="#hr" className='text-sm text-white/60 hover:text-white transition-colors'>Sapar HR</Link>
                                <Link href="#accounting" className='text-sm text-white/60 hover:text-white transition-colors'>Sapar Buxgalteriya</Link>
                                <Link href="#edo" className='text-sm text-white/60 hover:text-white transition-colors'>Sapar EDO</Link>
                                <Link href="#inventory" className='text-sm text-white/60 hover:text-white transition-colors'>Sapar Ombor</Link>
                                <Link href="#pos" className='text-sm text-white/60 hover:text-white transition-colors'>Sapar POS</Link>
                                <Link href="#projects" className='text-sm text-white/60 hover:text-white transition-colors'>Sapar Loyihalar</Link>
                                <Link href="#support" className='text-sm text-white/60 hover:text-white transition-colors'>Sapar Support</Link>
                            </div>
                        </div>

                        {/* Yechimlar */}
                        <div className="w-full md:w-[45%] lg:w-[15%] flex flex-col items-start text-left">
                            <h3 className='text-sm text-white font-semibold'>{t('footer.solutions')}</h3>
                            <div className="flex flex-col gap-2.5 mt-6">
                                {solutionItems.map((item, idx) => (
                                    <Link key={idx} href="#modules" className='text-sm text-white/60 hover:text-white transition-colors'>
                                        {item}
                                    </Link>
                                ))}
                            </div>
                        </div>

                    </div>

                    <div className='w-full h-0.5 mt-16 mb-4 bg-gradient-to-r from-[#24212D]/0 via-[#24212D] to-[#24212D]/0'></div>

                    <div className="flex flex-wrap sm:flex-row items-center justify-between gap-y-4 gap-x-2 relative z-10">
                        <p className='text-xs text-white/60'>&copy; 2026 &quot;SAPAR DIGITAL&quot; MChJ. {t('common.allRightsReserved')}</p>

                        <div className="flex items-center gap-4">
                            {socialLinks.map(({ icon: Icon, href, label }) => (
                                <Link
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className='text-white/60 hover:text-white transition-colors'
                                >
                                    <Icon size={16} />
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-6 text-right">
                             <Link href="/privacy" className='text-xs text-white/60 hover:text-white transition-colors'>{t('footer.privacyPolicy')}</Link>
                             <div className='w-px h-4 bg-white/20'></div>
                             <Link href="/terms" className='text-xs text-white/60 hover:text-white transition-colors'>{t('footer.termsOfUse')}</Link>
                        </div>
                    </div>

                    <div className="w-full flex justify-center mt-6 md:mt-12 md:mb-[-0.5%]">
                        <h1 className="text-center font-extrabold tracking-tighter leading-[0.70] text-zinc-900 text-[clamp(4.5rem,19.5vw,25rem)] pointer-events-none select-none">
                            SAPAR
                        </h1>
                    </div>
                </div>
            </footer>
        </>
    );
}
