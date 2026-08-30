'use client';

import { ArrowRightIcon } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export default function Banner() {
    const { t } = useLanguage();

    return (
        <div className="flex w-full flex-wrap items-center justify-center bg-gradient-to-b from-[#028090] to-[#026b76] py-2 px-3 text-center text-xs sm:text-sm font-medium text-white">
            <p>{t('banner.text')}</p>
            <a
                href="#contact"
                className="ml-2 sm:ml-3 inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-bold text-[#028090] transition hover:bg-slate-100 active:scale-95 shrink-0 my-0.5"
            >
                {t('banner.button')}
                <ArrowRightIcon className="size-3" />
            </a>
        </div>
    );
}

