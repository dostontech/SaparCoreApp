"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import LanguageSwitcher from '@/components/language-switcher';
import Image from 'next/image'

import {
    ChevronDown,
    Menu,
    X,
    Users,
    Calculator,
    Package,
    ShoppingCart,
    UserRound,
    Store,
    BriefcaseBusiness,
    Headphones,
    Factory,
    Building2,
    Utensils,
    ShoppingBag,
} from 'lucide-react';

export default function HeroSection() {
    const { t, dictionary } = useLanguage();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [openDropdown, setOpenDropdown] = React.useState(null);
    const [mobileAccordion, setMobileAccordion] = React.useState(null);

    React.useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    const productLinks = [
        {
            key: 'crm',
            name: t('hero.productsList.crm.name', 'CRM'),
            href: '#crm',
            icon: Users,
            description: t('hero.productsList.crm.desc', 'Mijozlar va savdolarni boshqaring'),
        },
        {
            key: 'accounting',
            name: t('hero.productsList.accounting.name', 'Buxgalteriya'),
            href: '#accounting',
            icon: Calculator,
            description: t('hero.productsList.accounting.desc', 'Hisob-kitob va moliyani boshqaring'),
        },
        {
            key: 'inventory',
            name: t('hero.productsList.inventory.name', 'Ombor'),
            href: '#inventory',
            icon: Package,
            description: t('hero.productsList.inventory.desc', 'Qoldiq va harakatni real vaqtda kuzating'),
        },
        {
            key: 'sales',
            name: t('hero.productsList.sales.name', 'Savdo'),
            href: '#sales',
            icon: ShoppingCart,
            description: t('hero.productsList.sales.desc', 'Buyurtmadan to‘lovgacha yagona jarayon'),
        },
        {
            key: 'hrm',
            name: t('hero.productsList.hrm.name', 'HRM'),
            href: '#hrm',
            icon: UserRound,
            description: t('hero.productsList.hrm.desc', 'Xodimlar va ish jarayonlarini boshqaring'),
        },
        {
            key: 'pos',
            name: t('hero.productsList.pos.name', 'POS'),
            href: '#pos',
            icon: Store,
            description: t('hero.productsList.pos.desc', 'Do‘kon va filiallar uchun savdo'),
        },
        {
            key: 'purchases',
            name: t('hero.productsList.purchases.name', 'Xaridlar'),
            href: '#purchases',
            icon: ShoppingBag,
            description: t('hero.productsList.purchases.desc', 'Yetkazib beruvchilar va xaridlar'),
        },
        {
            key: 'projects',
            name: t('hero.productsList.projects.name', 'Loyihalar'),
            href: '#projects',
            icon: BriefcaseBusiness,
            description: t('hero.productsList.projects.desc', 'Vazifalar, jamoa va loyihalarni boshqaring'),
        },
        {
            key: 'support',
            name: t('hero.productsList.support.name', 'Mijozlarni qo‘llab-quvvatlash'),
            href: '#support',
            icon: Headphones,
            description: t('hero.productsList.support.desc', 'Murojaatlar va mijozlar bilan aloqa'),
        },
    ];

    const solutionLinks = [
        {
            key: 'retail',
            name: t('hero.solutionsList.retail.name', 'Chakana savdo'),
            href: '#retail',
            icon: Store,
            description: t('hero.solutionsList.retail.desc', 'POS, ombor va filiallarni birlashtiring'),
        },
        {
            key: 'wholesale',
            name: t('hero.solutionsList.wholesale.name', 'Ulgurji savdo'),
            href: '#wholesale',
            icon: ShoppingBag,
            description: t('hero.solutionsList.wholesale.desc', 'Savdo, xarid va logistika nazorati'),
        },
        {
            key: 'manufacturing',
            name: t('hero.solutionsList.manufacturing.name', 'Ishlab chiqarish'),
            href: '#manufacturing',
            icon: Factory,
            description: t('hero.solutionsList.manufacturing.desc', 'Xomashyo, ishlab chiqarish va tannarx'),
        },
        {
            key: 'services',
            name: t('hero.solutionsList.services.name', 'Xizmat ko‘rsatish'),
            href: '#services',
            icon: BriefcaseBusiness,
            description: t('hero.solutionsList.services.desc', 'CRM, loyihalar va hisob-kitob bir joyda'),
        },
        {
            key: 'construction',
            name: t('hero.solutionsList.construction.name', 'Qurilish'),
            href: '#construction',
            icon: Building2,
            description: t('hero.solutionsList.construction.desc', 'Loyiha, xarid va hujjatlarni boshqaring'),
        },
        {
            key: 'hospitality',
            name: t('hero.solutionsList.hospitality.name', 'Restoran va kafe'),
            href: '#hospitality',
            icon: Utensils,
            description: t('hero.solutionsList.hospitality.desc', 'POS, ombor va moliyani birlashtiring'),
        },
    ];

    const tags = dictionary?.hero?.tags || ['Buxgalteriya', 'Savdo', 'HR', 'CRM', 'Ombor', 'Soliq', 'EDO'];

    return (
        <>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap');
                    @import url('https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap');
                    *{font-family: "Geist", sans-serif; }
                    h1{font-family: "Urbanist", sans-serif; }

                    @keyframes shine {
                        0% { background-position: 200% center; }
                        100% { background-position: -200% center; }
                    }
                    .shine-text {
                        background-size: 200% auto;
                        animation: shine 4s linear infinite;
                    }
                `}
            </style>
            <header className="w-full border-b border-dashed border-zinc-200 relative z-20">
                <div className="px-4 md:px-12 lg:px-20 xl:px-28 w-full mx-auto">
                    <nav className="relative flex items-center justify-between border-x border-dashed border-zinc-200 p-3 md:py-3.5 md:px-6 w-full bg-white">

                        {/* Intersection boxes perfectly centered at the border cutting points */}
                        <div className="absolute -bottom-1.5 translate-y-[1.5px] -left-1.5 size-3 bg-white border border-zinc-200 rounded-xs z-30"></div>
                        <div className="absolute -bottom-1.5 translate-y-[1.5px] -right-1.5 size-3 bg-white border border-zinc-200 rounded-xs z-30"></div>

                        <Link href="/" className="shrink-0">
                            <svg className="h-8 w-auto md:h-9" shapeRendering="geometricPrecision" viewBox="0 0 174 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_902_12)">
                                    <path d="M0.571411 14.4812V25.6239L7.62723 21.7237V14.8521L18.3063 8.90914L11.4419 4.82776L3.89365 8.95446C1.84171 10.0763 0.571411 12.1895 0.571411 14.4812Z" fill="#0B2B33" />
                                    <path d="M41 30.0855V18.9429L33.9442 22.843V29.7146L23.2651 35.6576L30.1295 39.739L37.6778 35.6123C39.7298 34.4904 41 32.3772 41 30.0855Z" fill="#0B2B33" />
                                    <path d="M40.6892 14.0206L40.8093 15.6004L33.7535 19.3148V14.8575L13.7302 4.08136L20.5946 0L37.3268 8.93073C39.2607 9.96294 40.5263 11.8787 40.6892 14.0206Z" fill="#0B2B33" />
                                    <path d="M0.12016 30.925L0 29.3451L7.05584 25.6307V30.088L27.0791 40.8642L20.2147 44.9456L3.48254 36.0148C1.54864 34.9826 0.283068 33.0668 0.12016 30.925Z" fill="#0B2B33" />
                                </g>
                                <path d="M65.4542 18.2756C65.3406 17.1297 64.8529 16.2396 63.9911 15.6051C63.1294 14.9706 61.9599 14.6534 60.4826 14.6534C59.4788 14.6534 58.6313 14.7955 57.94 15.0795C57.2487 15.3542 56.7184 15.7377 56.3491 16.2301C55.9892 16.7225 55.8093 17.2812 55.8093 17.9062C55.7904 18.4271 55.8993 18.8816 56.136 19.2699C56.3822 19.6581 56.7184 19.9943 57.1445 20.2784C57.5707 20.553 58.0631 20.7945 58.6218 21.0028C59.1805 21.2017 59.7771 21.3722 60.4116 21.5142L63.0252 22.1392C64.2942 22.4233 65.4589 22.8021 66.5195 23.2756C67.5801 23.7491 68.4987 24.3314 69.2752 25.0227C70.0517 25.714 70.6531 26.5284 71.0792 27.4659C71.5148 28.4034 71.7373 29.4782 71.7468 30.6903C71.7373 32.4706 71.2828 34.0142 70.3832 35.321C69.493 36.6184 68.2051 37.6269 66.5195 38.3466C64.8434 39.0568 62.8216 39.4119 60.4542 39.4119C58.1057 39.4119 56.0603 39.0521 54.3178 38.3324C52.5849 37.6127 51.2307 36.5473 50.2553 35.1364C49.2894 33.7159 48.7828 31.9593 48.7354 29.8665H54.6871C54.7534 30.8419 55.0328 31.6562 55.5252 32.3097C56.0271 32.9536 56.6947 33.4413 57.5281 33.7727C58.3709 34.0947 59.3226 34.2557 60.3832 34.2557C61.4248 34.2557 62.3292 34.1042 63.0962 33.8011C63.8728 33.4981 64.4741 33.0767 64.9002 32.5369C65.3264 31.9972 65.5394 31.3769 65.5394 30.6761C65.5394 30.0227 65.3453 29.4735 64.957 29.0284C64.5782 28.5833 64.0195 28.2045 63.2809 27.892C62.5517 27.5795 61.6568 27.2955 60.5962 27.0398L57.4286 26.2443C54.976 25.6477 53.0394 24.715 51.619 23.446C50.1985 22.1771 49.493 20.4678 49.5025 18.3182C49.493 16.5568 49.9618 15.018 50.9087 13.7017C51.8652 12.3854 53.1767 11.358 54.8434 10.6193C56.5101 9.88068 58.404 9.51136 60.5252 9.51136C62.6843 9.51136 64.5688 9.88068 66.1786 10.6193C67.7979 11.358 69.0574 12.3854 69.957 13.7017C70.8567 15.018 71.3207 16.5426 71.3491 18.2756H65.4542ZM81.9918 39.4119C80.5998 39.4119 79.3593 39.1705 78.2702 38.6875C77.1812 38.1951 76.3195 37.4706 75.685 36.5142C75.06 35.5483 74.7475 34.3456 74.7475 32.9062C74.7475 31.6941 74.9701 30.6761 75.4151 29.8523C75.8602 29.0284 76.4663 28.3655 77.2333 27.8636C78.0004 27.3617 78.8716 26.983 79.8469 26.7273C80.8318 26.4716 81.864 26.2917 82.9435 26.1875C84.2125 26.0549 85.2352 25.9318 86.0117 25.8182C86.7882 25.6951 87.3517 25.5152 87.7021 25.2784C88.0524 25.0417 88.2276 24.6913 88.2276 24.2273V24.142C88.2276 23.2424 87.9435 22.5464 87.3754 22.054C86.8166 21.5616 86.0212 21.3153 84.989 21.3153C83.9 21.3153 83.0335 21.5568 82.3896 22.0398C81.7456 22.5133 81.3195 23.1098 81.1112 23.8295L75.5146 23.375C75.7987 22.0492 76.3574 20.9034 77.1907 19.9375C78.024 18.9621 79.0988 18.214 80.4151 17.6932C81.7409 17.1629 83.275 16.8977 85.0174 16.8977C86.2295 16.8977 87.3896 17.0398 88.4975 17.3239C89.6149 17.608 90.6045 18.0483 91.4663 18.6449C92.3375 19.2415 93.024 20.0085 93.5259 20.946C94.0278 21.8741 94.2788 22.9867 94.2788 24.2841V39H88.5401V35.9744H88.3697C88.0193 36.6562 87.5505 37.2576 86.9634 37.7784C86.3763 38.2898 85.6708 38.6922 84.8469 38.9858C84.0231 39.2699 83.0714 39.4119 81.9918 39.4119ZM83.7248 35.2358C84.6149 35.2358 85.4009 35.0606 86.0827 34.7102C86.7646 34.3504 87.2996 33.8674 87.6879 33.2614C88.0761 32.6553 88.2702 31.9687 88.2702 31.2017V28.8864C88.0808 29.0095 87.8204 29.1231 87.489 29.2273C87.167 29.322 86.8024 29.4119 86.3952 29.4972C85.988 29.5729 85.5808 29.6439 85.1737 29.7102C84.7665 29.767 84.3971 29.8191 84.0657 29.8665C83.3555 29.9706 82.7352 30.1364 82.2049 30.3636C81.6746 30.5909 81.2627 30.8987 80.9691 31.2869C80.6755 31.6657 80.5288 32.1392 80.5288 32.7074C80.5288 33.5312 80.8271 34.161 81.4237 34.5966C82.0297 35.0227 82.7968 35.2358 83.7248 35.2358ZM98.9734 47.1818V17.1818H104.939V20.8466H105.209C105.474 20.2595 105.858 19.6629 106.36 19.0568C106.871 18.4413 107.534 17.9299 108.348 17.5227C109.172 17.1061 110.195 16.8977 111.417 16.8977C113.007 16.8977 114.475 17.3144 115.82 18.1477C117.165 18.9716 118.239 20.2169 119.044 21.8835C119.849 23.5407 120.252 25.6193 120.252 28.1193C120.252 30.553 119.859 32.608 119.073 34.2841C118.296 35.9508 117.236 37.215 115.891 38.0767C114.556 38.929 113.06 39.3551 111.402 39.3551C110.228 39.3551 109.229 39.161 108.405 38.7727C107.591 38.3845 106.923 37.8968 106.402 37.3097C105.882 36.7131 105.484 36.1117 105.209 35.5057H105.025V47.1818H98.9734ZM104.897 28.0909C104.897 29.3883 105.077 30.5199 105.436 31.4858C105.796 32.4517 106.317 33.2045 106.999 33.7443C107.681 34.2746 108.509 34.5398 109.485 34.5398C110.47 34.5398 111.303 34.2699 111.985 33.7301C112.667 33.1809 113.183 32.4233 113.533 31.4574C113.893 30.482 114.073 29.3598 114.073 28.0909C114.073 26.8314 113.898 25.7235 113.547 24.767C113.197 23.8106 112.681 23.0625 111.999 22.5227C111.317 21.983 110.479 21.7131 109.485 21.7131C108.5 21.7131 107.667 21.9735 106.985 22.4943C106.312 23.0152 105.796 23.7538 105.436 24.7102C105.077 25.6667 104.897 26.7936 104.897 28.0909ZM130.507 39.4119C129.115 39.4119 127.875 39.1705 126.786 38.6875C125.697 38.1951 124.835 37.4706 124.201 36.5142C123.576 35.5483 123.263 34.3456 123.263 32.9062C123.263 31.6941 123.486 30.6761 123.931 29.8523C124.376 29.0284 124.982 28.3655 125.749 27.8636C126.516 27.3617 127.387 26.983 128.363 26.7273C129.347 26.4716 130.38 26.2917 131.459 26.1875C132.728 26.0549 133.751 25.9318 134.527 25.8182C135.304 25.6951 135.867 25.5152 136.218 25.2784C136.568 25.0417 136.743 24.6913 136.743 24.2273V24.142C136.743 23.2424 136.459 22.5464 135.891 22.054C135.332 21.5616 134.537 21.3153 133.505 21.3153C132.416 21.3153 131.549 21.5568 130.905 22.0398C130.261 22.5133 129.835 23.1098 129.627 23.8295L124.03 23.375C124.314 22.0492 124.873 20.9034 125.706 19.9375C126.54 18.9621 127.614 18.214 128.931 17.6932C130.257 17.1629 131.791 16.8977 133.533 16.8977C134.745 16.8977 135.905 17.0398 137.013 17.3239C138.131 17.608 139.12 18.0483 139.982 18.6449C140.853 19.2415 141.54 20.0085 142.042 20.946C142.543 21.8741 142.794 22.9867 142.794 24.2841V39H137.056V35.9744H136.885C136.535 36.6562 136.066 37.2576 135.479 37.7784C134.892 38.2898 134.186 38.6922 133.363 38.9858C132.539 39.2699 131.587 39.4119 130.507 39.4119ZM132.24 35.2358C133.131 35.2358 133.917 35.0606 134.598 34.7102C135.28 34.3504 135.815 33.8674 136.203 33.2614C136.592 32.6553 136.786 31.9687 136.786 31.2017V28.8864C136.596 29.0095 136.336 29.1231 136.005 29.2273C135.683 29.322 135.318 29.4119 134.911 29.4972C134.504 29.5729 134.096 29.6439 133.689 29.7102C133.282 29.767 132.913 29.8191 132.581 29.8665C131.871 29.9706 131.251 30.1364 130.721 30.3636C130.19 30.5909 129.778 30.8987 129.485 31.2869C129.191 31.6657 129.044 32.1392 129.044 32.7074C129.044 33.5312 129.343 34.161 129.939 34.5966C130.545 35.0227 131.312 35.2358 132.24 35.2358ZM147.489 39V17.1818H153.355V20.9886H153.583C153.98 19.6345 154.648 18.6117 155.586 17.9205C156.523 17.2197 157.603 16.8693 158.824 16.8693C159.127 16.8693 159.454 16.8883 159.804 16.9261C160.155 16.964 160.462 17.0161 160.728 17.0824V22.4517C160.444 22.3665 160.051 22.2907 159.549 22.2244C159.047 22.1581 158.587 22.125 158.171 22.125C157.281 22.125 156.485 22.3191 155.784 22.7074C155.093 23.0862 154.544 23.6165 154.137 24.2983C153.739 24.9801 153.54 25.7661 153.54 26.6562V39H147.489Z" fill="#0B2B33" />
                                <path d="M164.893 39.3693C163.956 39.3693 163.151 39.0379 162.478 38.375C161.815 37.7027 161.484 36.8977 161.484 35.9602C161.484 35.0322 161.815 34.2367 162.478 33.5739C163.151 32.911 163.956 32.5795 164.893 32.5795C165.802 32.5795 166.598 32.911 167.279 33.5739C167.961 34.2367 168.302 35.0322 168.302 35.9602C168.302 36.5852 168.141 37.1581 167.819 37.679C167.507 38.1903 167.095 38.6023 166.583 38.9148C166.072 39.2178 165.509 39.3693 164.893 39.3693Z" fill="#02C39A" />
                                <defs>
                                    <clipPath id="clip0_902_12">
                                        <rect width="41" height="45" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                        </Link>

                        {/* DESKTOP MENU */}
                        <div id="menu" className="hidden lg:flex items-center gap-7 xl:gap-9 text-sm font-medium">
                            {/* MAHSULOTLAR */}
                            <div
                                className="group relative"
                                onMouseEnter={() => setOpenDropdown('products')}
                                onMouseLeave={() => setOpenDropdown(null)}
                            >
                                <button
                                    className="flex items-center gap-1 text-zinc-800 hover:text-[#028090] transition cursor-pointer"
                                    onClick={() =>
                                        setOpenDropdown(
                                            openDropdown === 'products' ? null : 'products'
                                        )
                                    }
                                >
                                    {t('nav.products')}
                                    <ChevronDown
                                        className={`size-4 transition-transform ${openDropdown === 'products' ? 'rotate-180 text-[#028090]' : ''
                                            }`}
                                    />
                                </button>

                                <div
                                    className={`
                                        absolute left-1/2 top-7 z-50
                                        w-[620px] -translate-x-1/2
                                        rounded-2xl border border-zinc-200
                                        bg-white p-3 shadow-2xl
                                        transition-all duration-200
                                        ${openDropdown === 'products'
                                            ? 'visible translate-y-0 opacity-100'
                                            : 'invisible -translate-y-2 opacity-0'
                                        }
                                    `}
                                >
                                    <div className="px-3 py-2 border-b border-zinc-100 mb-1">
                                        <p className="font-bold text-zinc-900">
                                            {t('nav.productsSubtitle')}
                                        </p>
                                        <p className="mt-0.5 text-xs text-zinc-500">
                                            {t('nav.productsDesc')}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-1">
                                        {productLinks.map((item) => {
                                            const Icon = item.icon;

                                            return (
                                                <Link
                                                    key={item.key}
                                                    href={item.href}
                                                    onClick={() => setOpenDropdown(null)}
                                                    className="group/item flex gap-3 rounded-xl p-2.5 transition hover:bg-zinc-50"
                                                >
                                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0B2B33] group-hover/item:bg-[#028090] transition-colors">
                                                        <Icon className="size-4 text-white" />
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-xs sm:text-sm text-zinc-900 group-hover/item:text-[#028090] transition-colors">
                                                            {item.name}
                                                        </p>

                                                        <p className="mt-0.5 text-xs leading-4 text-zinc-500">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* YECHIMLAR */}
                            <div
                                className="group relative"
                                onMouseEnter={() => setOpenDropdown('solutions')}
                                onMouseLeave={() => setOpenDropdown(null)}
                            >
                                <button
                                    className="flex items-center gap-1 text-zinc-800 hover:text-[#028090] transition cursor-pointer"
                                    onClick={() =>
                                        setOpenDropdown(
                                            openDropdown === 'solutions' ? null : 'solutions'
                                        )
                                    }
                                >
                                    {t('nav.solutions')}
                                    <ChevronDown
                                        className={`size-4 transition-transform ${openDropdown === 'solutions' ? 'rotate-180 text-[#028090]' : ''
                                            }`}
                                    />
                                </button>

                                <div
                                    className={`
                                        absolute left-1/2 top-7 z-50
                                        w-[560px] -translate-x-1/2
                                        rounded-2xl border border-zinc-200
                                        bg-white p-3 shadow-2xl
                                        transition-all duration-200
                                        ${openDropdown === 'solutions'
                                            ? 'visible translate-y-0 opacity-100'
                                            : 'invisible -translate-y-2 opacity-0'
                                        }
                                    `}
                                >
                                    <div className="px-3 py-2 border-b border-zinc-100 mb-1">
                                        <p className="font-bold text-zinc-900">
                                            {t('nav.solutionsSubtitle')}
                                        </p>
                                        <p className="mt-0.5 text-xs text-zinc-500">
                                            {t('nav.solutionsDesc')}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-1">
                                        {solutionLinks.map((item) => {
                                            const Icon = item.icon;

                                            return (
                                                <Link
                                                    key={item.key}
                                                    href={item.href}
                                                    onClick={() => setOpenDropdown(null)}
                                                    className="flex gap-3 rounded-xl p-2.5 transition hover:bg-zinc-50 group/sol"
                                                >
                                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 group-hover/sol:bg-[#EAF5F2] transition-colors">
                                                        <Icon className="size-4 text-[#0B2B33] group-hover/sol:text-[#028090]" />
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-xs sm:text-sm text-zinc-900 group-hover/sol:text-[#028090] transition-colors">
                                                            {item.name}
                                                        </p>

                                                        <p className="mt-0.5 text-xs leading-4 text-zinc-500">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="#modules"
                                className="text-zinc-800 hover:text-[#028090] transition"
                            >
                                {t('nav.modules')}
                            </Link>

                            <Link
                                href="#uzbekistan"
                                className="text-zinc-800 hover:text-[#028090] transition"
                            >
                                {t('nav.forUzbekistan')}
                            </Link>

                            <Link
                                href="#pricing"
                                className="text-zinc-800 hover:text-[#028090] transition"
                            >
                                {t('nav.pricing')}
                            </Link>

                            <Link
                                href="#team"
                                className="text-zinc-800 hover:text-[#028090] transition"
                            >
                                {t('nav.team')}
                            </Link>

                            <Link
                                href="/about"
                                className="text-zinc-800 hover:text-[#028090] transition"
                            >
                                {t('nav.about')}
                            </Link>
                        </div>

                        {/* Right controls: Language Switcher + CTA */}
                        <div className="hidden md:flex items-center gap-3">
                            <LanguageSwitcher />

                            <a
                                href="#contact"
                                className="bg-[#0B2B33] hover:bg-[#153d45] px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white transition cursor-pointer shadow-xs active:scale-95"
                            >
                                {t('common.contactUs')}
                            </a>
                        </div>

                        {/* Mobile Menu & Language Trigger */}
                        <div className="flex md:hidden items-center gap-2">
                            <LanguageSwitcher />
                            <button
                                id="open-menu"
                                onClick={() => setMobileOpen(true)}
                                aria-label={t('nav.menu')}
                                className="bg-zinc-900 hover:bg-zinc-800 text-white p-2 rounded-xl font-medium transition cursor-pointer"
                            >
                                <Menu className="size-5" />
                            </button>
                        </div>
                    </nav>
                </div>

                {/* MOBILE OVERLAY */}
                <div
                    onClick={() => setMobileOpen(false)}
                    className={`
                        md:hidden fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-[2px]
                        transition-opacity duration-300
                        ${mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
                    `}
                />

                {/* MOBILE SLIDE-IN PANEL */}
                <div
                    className={`
                        md:hidden fixed top-0 right-0 z-50 h-screen w-[85vw] max-w-sm
                        bg-white shadow-2xl flex flex-col
                        transition-transform duration-300 ease-out
                        ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}
                    `}
                >
                    <div className="flex items-center justify-between p-4 border-b border-zinc-200">
                        <Link href="/" onClick={() => setMobileOpen(false)}>
                            <svg className="h-7 w-auto" shapeRendering="geometricPrecision" viewBox="0 0 174 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_mobile_logo)">
                                    <path d="M0.571411 14.4812V25.6239L7.62723 21.7237V14.8521L18.3063 8.90914L11.4419 4.82776L3.89365 8.95446C1.84171 10.0763 0.571411 12.1895 0.571411 14.4812Z" fill="#0B2B33" />
                                    <path d="M41 30.0855V18.9429L33.9442 22.843V29.7146L23.2651 35.6576L30.1295 39.739L37.6778 35.6123C39.7298 34.4904 41 32.3772 41 30.0855Z" fill="#0B2B33" />
                                    <path d="M40.6892 14.0206L40.8093 15.6004L33.7535 19.3148V14.8575L13.7302 4.08136L20.5946 0L37.3268 8.93073C39.2607 9.96294 40.5263 11.8787 40.6892 14.0206Z" fill="#0B2B33" />
                                    <path d="M0.12016 30.925L0 29.3451L7.05584 25.6307V30.088L27.0791 40.8642L20.2147 44.9456L3.48254 36.0148C1.54864 34.9826 0.283068 33.0668 0.12016 30.925Z" fill="#0B2B33" />
                                </g>
                                <path d="M65.4542 18.2756C65.3406 17.1297 64.8529 16.2396 63.9911 15.6051C63.1294 14.9706 61.9599 14.6534 60.4826 14.6534C59.4788 14.6534 58.6313 14.7955 57.94 15.0795C57.2487 15.3542 56.7184 15.7377 56.3491 16.2301C55.9892 16.7225 55.8093 17.2812 55.8093 17.9062C55.7904 18.4271 55.8993 18.8816 56.136 19.2699C56.3822 19.6581 56.7184 19.9943 57.1445 20.2784C57.5707 20.553 58.0631 20.7945 58.6218 21.0028C59.1805 21.2017 59.7771 21.3722 60.4116 21.5142L63.0252 22.1392C64.2942 22.4233 65.4589 22.8021 66.5195 23.2756C67.5801 23.7491 68.4987 24.3314 69.2752 25.0227C70.0517 25.714 70.6531 26.5284 71.0792 27.4659C71.5148 28.4034 71.7373 29.4782 71.7468 30.6903C71.7373 32.4706 71.2828 34.0142 70.3832 35.321C69.493 36.6184 68.2051 37.6269 66.5195 38.3466C64.8434 39.0568 62.8216 39.4119 60.4542 39.4119C58.1057 39.4119 56.0603 39.0521 54.3178 38.3324C52.5849 37.6127 51.2307 36.5473 50.2553 35.1364C49.2894 33.7159 48.7828 31.9593 48.7354 29.8665H54.6871C54.7534 30.8419 55.0328 31.6562 55.5252 32.3097C56.0271 32.9536 56.6947 33.4413 57.5281 33.7727C58.3709 34.0947 59.3226 34.2557 60.3832 34.2557C61.4248 34.2557 62.3292 34.1042 63.0962 33.8011C63.8728 33.4981 64.4741 33.0767 64.9002 32.5369C65.3264 31.9972 65.5394 31.3769 65.5394 30.6761C65.5394 30.0227 65.3453 29.4735 64.957 29.0284C64.5782 28.5833 64.0195 28.2045 63.2809 27.892C62.5517 27.5795 61.6568 27.2955 60.5962 27.0398L57.4286 26.2443C54.976 25.6477 53.0394 24.715 51.619 23.446C50.1985 22.1771 49.493 20.4678 49.5025 18.3182C49.493 16.5568 49.9618 15.018 50.9087 13.7017C51.8652 12.3854 53.1767 11.358 54.8434 10.6193C56.5101 9.88068 58.404 9.51136 60.5252 9.51136C62.6843 9.51136 64.5688 9.88068 66.1786 10.6193C67.7979 11.358 69.0574 12.3854 69.957 13.7017C70.8567 15.018 71.3207 16.5426 71.3491 18.2756H65.4542ZM81.9918 39.4119C80.5998 39.4119 79.3593 39.1705 78.2702 38.6875C77.1812 38.1951 76.3195 37.4706 75.685 36.5142C75.06 35.5483 74.7475 34.3456 74.7475 32.9062C74.7475 31.6941 74.9701 30.6761 75.4151 29.8523C75.8602 29.0284 76.4663 28.3655 77.2333 27.8636C78.0004 27.3617 78.8716 26.983 79.8469 26.7273C80.8318 26.4716 81.864 26.2917 82.9435 26.1875C84.2125 26.0549 85.2352 25.9318 86.0117 25.8182C86.7882 25.6951 87.3517 25.5152 87.7021 25.2784C88.0524 25.0417 88.2276 24.6913 88.2276 24.2273V24.142C88.2276 23.2424 87.9435 22.5464 87.3754 22.054C86.8166 21.5616 86.0212 21.3153 84.989 21.3153C83.9 21.3153 83.0335 21.5568 82.3896 22.0398C81.7456 22.5133 81.3195 23.1098 81.1112 23.8295L75.5146 23.375C75.7987 22.0492 76.3574 20.9034 77.1907 19.9375C78.024 18.9621 79.0988 18.214 80.4151 17.6932C81.7409 17.1629 83.275 16.8977 85.0174 16.8977C86.2295 16.8977 87.3896 17.0398 88.4975 17.3239C89.6149 17.608 90.6045 18.0483 91.4663 18.6449C92.3375 19.2415 93.024 20.0085 93.5259 20.946C94.0278 21.8741 94.2788 22.9867 94.2788 24.2841V39H88.5401V35.9744H88.3697C88.0193 36.6562 87.5505 37.2576 86.9634 37.7784C86.3763 38.2898 85.6708 38.6922 84.8469 38.9858C84.0231 39.2699 83.0714 39.4119 81.9918 39.4119ZM83.7248 35.2358C84.6149 35.2358 85.4009 35.0606 86.0827 34.7102C86.7646 34.3504 87.2996 33.8674 87.6879 33.2614C88.0761 32.6553 88.2702 31.9687 88.2702 31.2017V28.8864C88.0808 29.0095 87.8204 29.1231 87.489 29.2273C87.167 29.322 86.8024 29.4119 86.3952 29.4972C85.988 29.5729 85.5808 29.6439 85.1737 29.7102C84.7665 29.767 84.3971 29.8191 84.0657 29.8665C83.3555 29.9706 82.7352 30.1364 82.2049 30.3636C81.6746 30.5909 81.2627 30.8987 80.9691 31.2869C80.6755 31.6657 80.5288 32.1392 80.5288 32.7074C80.5288 33.5312 80.8271 34.161 81.4237 34.5966C82.0297 35.0227 82.7968 35.2358 83.7248 35.2358ZM98.9734 47.1818V17.1818H104.939V20.8466H105.209C105.474 20.2595 105.858 19.6629 106.36 19.0568C106.871 18.4413 107.534 17.9299 108.348 17.5227C109.172 17.1061 110.195 16.8977 111.417 16.8977C113.007 16.8977 114.475 17.3144 115.82 18.1477C117.165 18.9716 118.239 20.2169 119.044 21.8835C119.849 23.5407 120.252 25.6193 120.252 28.1193C120.252 30.553 119.859 32.608 119.073 34.2841C118.296 35.9508 117.236 37.215 115.891 38.0767C114.556 38.929 113.06 39.3551 111.402 39.3551C110.228 39.3551 109.229 39.161 108.405 38.7727C107.591 38.3845 106.923 37.8968 106.402 37.3097C105.882 36.7131 105.484 36.1117 105.209 35.5057H105.025V47.1818H98.9734ZM104.897 28.0909C104.897 29.3883 105.077 30.5199 105.436 31.4858C105.796 32.4517 106.317 33.2045 106.999 33.7443C107.681 34.2746 108.509 34.5398 109.485 34.5398C110.47 34.5398 111.303 34.2699 111.985 33.7301C112.667 33.1809 113.183 32.4233 113.533 31.4574C113.893 30.482 114.073 29.3598 114.073 28.0909C114.073 26.8314 113.898 25.7235 113.547 24.767C113.197 23.8106 112.681 23.0625 111.999 22.5227C111.317 21.983 110.479 21.7131 109.485 21.7131C108.5 21.7131 107.667 21.9735 106.985 22.4943C106.312 23.0152 105.796 23.7538 105.436 24.7102C105.077 25.6667 104.897 26.7936 104.897 28.0909ZM130.507 39.4119C129.115 39.4119 127.875 39.1705 126.786 38.6875C125.697 38.1951 124.835 37.4706 124.201 36.5142C123.576 35.5483 123.263 34.3456 123.263 32.9062C123.263 31.6941 123.486 30.6761 123.931 29.8523C124.376 29.0284 124.982 28.3655 125.749 27.8636C126.516 27.3617 127.387 26.983 128.363 26.7273C129.347 26.4716 130.38 26.2917 131.459 26.1875C132.728 26.0549 133.751 25.9318 134.527 25.8182C135.304 25.6951 135.867 25.5152 136.218 25.2784C136.568 25.0417 136.743 24.6913 136.743 24.2273V24.142C136.743 23.2424 136.459 22.5464 135.891 22.054C135.332 21.5616 134.537 21.3153 133.505 21.3153C132.416 21.3153 131.549 21.5568 130.905 22.0398C130.261 22.5133 129.835 23.1098 129.627 23.8295L124.03 23.375C124.314 22.0492 124.873 20.9034 125.706 19.9375C126.54 18.9621 127.614 18.214 128.931 17.6932C130.257 17.1629 131.791 16.8977 133.533 16.8977C134.745 16.8977 135.905 17.0398 137.013 17.3239C138.131 17.608 139.12 18.0483 139.982 18.6449C140.853 19.2415 141.54 20.0085 142.042 20.946C142.543 21.8741 142.794 22.9867 142.794 24.2841V39H137.056V35.9744H136.885C136.535 36.6562 136.066 37.2576 135.479 37.7784C134.892 38.2898 134.186 38.6922 133.363 38.9858C132.539 39.2699 131.587 39.4119 130.507 39.4119ZM132.24 35.2358C133.131 35.2358 133.917 35.0606 134.598 34.7102C135.28 34.3504 135.815 33.8674 136.203 33.2614C136.592 32.6553 136.786 31.9687 136.786 31.2017V28.8864C136.596 29.0095 136.336 29.1231 136.005 29.2273C135.683 29.322 135.318 29.4119 134.911 29.4972C134.504 29.5729 134.096 29.6439 133.689 29.7102C133.282 29.767 132.913 29.8191 132.581 29.8665C131.871 29.9706 131.251 30.1364 130.721 30.3636C130.19 30.5909 129.778 30.8987 129.485 31.2869C129.191 31.6657 129.044 32.1392 129.044 32.7074C129.044 33.5312 129.343 34.161 129.939 34.5966C130.545 35.0227 131.312 35.2358 132.24 35.2358ZM147.489 39V17.1818H153.355V20.9886H153.583C153.98 19.6345 154.648 18.6117 155.586 17.9205C156.523 17.2197 157.603 16.8693 158.824 16.8693C159.127 16.8693 159.454 16.8883 159.804 16.9261C160.155 16.964 160.462 17.0161 160.728 17.0824V22.4517C160.444 22.3665 160.051 22.2907 159.549 22.2244C159.047 22.1581 158.587 22.125 158.171 22.125C157.281 22.125 156.485 22.3191 155.784 22.7074C155.093 23.0862 154.544 23.6165 154.137 24.2983C153.739 24.9801 153.54 25.7661 153.54 26.6562V39H147.489Z" fill="#0B2B33" />
                                <path d="M164.893 39.3693C163.956 39.3693 163.151 39.0379 162.478 38.375C161.815 37.7027 161.484 36.8977 161.484 35.9602C161.484 35.0322 161.815 34.2367 162.478 33.5739C163.151 32.911 163.956 32.5795 164.893 32.5795C165.802 32.5795 166.598 32.911 167.279 33.5739C167.961 34.2367 168.302 35.0322 168.302 35.9602C168.302 36.5852 168.141 37.1581 167.819 37.679C167.507 38.1903 167.095 38.6023 166.583 38.9148C166.072 39.2178 165.509 39.3693 164.893 39.3693Z" fill="#02C39A" />
                                <defs>
                                    <clipPath id="clip0_mobile_logo">
                                        <rect width="41" height="45" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                        </Link>
                        <button
                            onClick={() => setMobileOpen(false)}
                            aria-label={t('nav.close')}
                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 p-2 rounded-xl transition cursor-pointer"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Language Selector for Mobile Drawer */}
                    <div className="p-3 border-b border-zinc-100 bg-zinc-50/50">
                        <LanguageSwitcher variant="mobile-inline" />
                    </div>

                    <div className="flex-1 overflow-y-auto px-2 py-3">
                        {/* MAHSULOTLAR ACCORDION */}
                        <div className="border-b border-zinc-100">
                            <button
                                onClick={() =>
                                    setMobileAccordion(
                                        mobileAccordion === 'products' ? null : 'products'
                                    )
                                }
                                className="flex w-full items-center justify-between px-3 py-3 text-sm font-semibold text-zinc-800"
                            >
                                {t('nav.products')}
                                <ChevronDown
                                    className={`size-4 transition-transform ${mobileAccordion === 'products' ? 'rotate-180 text-[#028090]' : ''
                                        }`}
                                />
                            </button>

                            <div
                                className={`
                                    grid transition-all duration-300 ease-in-out
                                    ${mobileAccordion === 'products' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
                                `}
                            >
                                <div className="overflow-hidden">
                                    <div className="flex flex-col gap-1 pb-3">
                                        {productLinks.map((item) => {
                                            const Icon = item.icon;

                                            return (
                                                <Link
                                                    key={item.key}
                                                    href={item.href}
                                                    onClick={() => setMobileOpen(false)}
                                                    className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-zinc-50"
                                                >
                                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0B2B33]">
                                                        <Icon className="size-4 text-white" />
                                                    </div>
                                                    <p className="text-xs sm:text-sm font-medium text-zinc-800">{item.name}</p>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* YECHIMLAR ACCORDION */}
                        <div className="border-b border-zinc-100">
                            <button
                                onClick={() =>
                                    setMobileAccordion(
                                        mobileAccordion === 'solutions' ? null : 'solutions'
                                    )
                                }
                                className="flex w-full items-center justify-between px-3 py-3 text-sm font-semibold text-zinc-800"
                            >
                                {t('nav.solutions')}
                                <ChevronDown
                                    className={`size-4 transition-transform ${mobileAccordion === 'solutions' ? 'rotate-180 text-[#028090]' : ''
                                        }`}
                                />
                            </button>

                            <div
                                className={`
                                    grid transition-all duration-300 ease-in-out
                                    ${mobileAccordion === 'solutions' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
                                `}
                            >
                                <div className="overflow-hidden">
                                    <div className="flex flex-col gap-1 pb-3">
                                        {solutionLinks.map((item) => {
                                            const Icon = item.icon;

                                            return (
                                                <Link
                                                    key={item.key}
                                                    href={item.href}
                                                    onClick={() => setMobileOpen(false)}
                                                    className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-zinc-50"
                                                >
                                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                                                        <Icon className="size-4 text-[#0B2B33]" />
                                                    </div>
                                                    <p className="text-xs sm:text-sm font-medium text-zinc-800">{item.name}</p>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="#modules"
                            onClick={() => setMobileOpen(false)}
                            className="block px-3 py-3 text-sm font-medium text-zinc-800 border-b border-zinc-100"
                        >
                            {t('nav.modules')}
                        </Link>

                        <Link
                            href="#uzbekistan"
                            onClick={() => setMobileOpen(false)}
                            className="block px-3 py-3 text-sm font-medium text-zinc-800 border-b border-zinc-100"
                        >
                            {t('nav.forUzbekistan')}
                        </Link>

                        <Link
                            href="#pricing"
                            onClick={() => setMobileOpen(false)}
                            className="block px-3 py-3 text-sm font-medium text-zinc-800 border-b border-zinc-100"
                        >
                            {t('nav.pricing')}
                        </Link>

                        <Link
                            href="#team"
                            onClick={() => setMobileOpen(false)}
                            className="block px-3 py-3 text-sm font-medium text-zinc-800 border-b border-zinc-100"
                        >
                            {t('nav.team')}
                        </Link>

                        <Link
                            href="/about"
                            onClick={() => setMobileOpen(false)}
                            className="block px-3 py-3 text-sm font-medium text-zinc-800 border-b border-zinc-100"
                        >
                            {t('nav.about')}
                        </Link>
                    </div>

                    <div className="sticky bottom-0 mt-auto bg-white p-4 border-t border-zinc-200">
                        <a
                            href="#contact"
                            onClick={() => setMobileOpen(false)}
                            className="w-full inline-flex items-center justify-center bg-[#0B2B33] hover:bg-[#153d45] px-6 py-3 rounded-2xl text-sm font-bold text-white transition cursor-pointer"
                        >
                            {t('common.contactUs')}
                        </a>
                    </div>
                </div>
            </header>

            <main className="w-full flex-1 pb-10 md:pb-14">
                <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto">
                    <div className="w-full flex flex-col items-center border-x border-dashed border-zinc-200/80 relative">

                        <div className="flex flex-wrap items-center justify-center gap-2 pl-2.5 pr-4 py-1.5 mt-8 sm:mt-12 rounded-full border border-zinc-300 bg-white/80">
                            <div className="relative flex size-3.5 items-center justify-center">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-[#02C39A] opacity-75 animate-ping duration-300"></span>
                                <span className="relative inline-flex size-2 rounded-full bg-[#02C39A]"></span>
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-zinc-700 tracking-wider">{t('hero.badge')}</p>
                        </div>

                        <h1 className="text-3xl sm:text-5xl lg:text-6xl leading-[1.2] text-center font-bold tracking-tight text-zinc-950 max-w-4xl mt-5 mx-auto px-2">
                            {t('hero.titlePrefix')}{' '}
                            <span className="shine-text text-transparent bg-clip-text bg-gradient-to-r from-[#0B2B33] via-[#02C39A] to-[#0B2B33]">
                                {t('hero.titleHighlight')}
                            </span>
                        </h1>

                        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mt-5 mx-auto px-2">
                            {tags.map((label) => (
                                <span
                                    key={label}
                                    className="rounded-full border border-[#02C39A]/30 bg-[#02C39A]/10 px-3.5 py-1 text-xs sm:text-sm font-semibold text-[#0B2B33]"
                                >
                                    {label}
                                </span>
                            ))}
                        </div>

                        <p className="text-sm sm:text-base leading-relaxed text-center font-normal max-w-xl mt-4 mx-auto px-4 text-zinc-600">
                            {t('hero.description')}
                        </p>

                        <div className='flex gap-4 mt-6'>
                            <a
                                href="#contact"
                                className="group flex items-center gap-2 bg-[#02C39A] hover:bg-[#00b890] px-6 py-3 text-sm font-bold text-[#062E2A] rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-100 cursor-pointer shadow-[0_8px_24px_-8px_rgba(2,195,154,0.6)]"
                            >
                                <span>{t('hero.ctaDemo')}</span>
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m5.833 14.164 8.334-8.333M5.833 5.83h8.334v8.334" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </a>
                        </div>

                        <div className="relative w-full mt-10 px-2 sm:px-4">
                            <div className="absolute inset-x-0 top-4 mx-auto h-48 max-w-2xl bg-[#02C39A]/20 blur-[90px] -z-10"></div>
                            <Image
                                src="/assets/banner.png"
                                alt="dashboard"
                                width={1200}
                                height={460}
                                className="max-h-60 sm:max-h-80 md:max-h-[460px] object-cover object-top w-full max-w-5xl mx-auto border border-zinc-200/90 rounded-2xl shadow-[0_20px_50px_-20px_rgba(11,43,51,0.25)]"
                                priority
                            />                        </div>

                    </div>
                </div>
            </main>
        </>
    );
}
