'use client';

import { MenuIcon, XIcon, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { name: 'Modullar', href: '#modules' },
        { name: 'O‘zbekiston uchun', href: '#uzbekistan' },
        { name: 'Ishlashini ko‘ring', href: '#demo-preview' },
        { name: 'Narxlar', href: '#pricing' },
        { name: 'Jamoamiz', href: '#team' },
        { name: 'Pitch Deck / About', href: '/about' },
    ];

    return (
        <>
            <nav className='sticky top-0 z-50 flex w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-md md:px-12 lg:px-20'>
                <Link href='/' className="flex items-center gap-2">
                    <Image src='/assets/logo.svg' alt='Sapar Logo' className='h-8 w-auto' width={220} height={52} priority />
                </Link>

                <div className='hidden items-center space-x-6 text-slate-700 font-medium text-sm lg:flex'>
                    {links.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className='transition-colors hover:text-[#028090]'
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-3">
                    <a
                        href={process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/login` : 'http://localhost:8080/login'}
                        className='px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#028090] transition'
                    >
                        Kirish
                    </a>
                    <a
                        href={process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/register` : 'http://localhost:8080/register'}
                        className='inline-flex items-center gap-2 rounded-xl bg-[#028090] px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition hover:bg-[#0B2B33] shadow-md shadow-[#028090]/20'
                    >
                        <span>Bepul boshlash</span>
                        <ArrowRight className="size-3.5" />
                    </a>
                </div>

                <button
                    onClick={() => setIsOpen(true)}
                    aria-label="Menyu"
                    className='p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition active:scale-95 lg:hidden'
                >
                    <MenuIcon className='size-6' />
                </button>
            </nav>

            {/* Mobile Fullscreen Drawer */}
            <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#0B2B33]/95 text-white text-lg font-medium backdrop-blur-2xl transition-all duration-300 lg:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex items-center gap-2 mb-4">
                    <div className="text-2xl font-extrabold tracking-tight">Sapar<span className="text-[#02C39A]">ERP</span></div>
                </div>

                <div className="flex flex-col items-center gap-4 text-center">
                    {links.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className='block text-slate-200 transition hover:text-[#02C39A] text-base py-1'
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <a
                    href='#contact'
                    className='mt-4 rounded-xl bg-[#02C39A] px-8 py-3 font-bold text-[#0B2B33] text-sm transition hover:bg-white'
                    onClick={() => setIsOpen(false)}
                >
                    Demo olish
                </a>

                <button
                    onClick={() => setIsOpen(false)}
                    aria-label="Yopish"
                    className='absolute top-5 right-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition'
                >
                    <XIcon className="size-6" />
                </button>
            </div>
        </>
    );
}
