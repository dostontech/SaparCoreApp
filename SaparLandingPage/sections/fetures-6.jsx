'use client';
import {
    LayoutGrid,
    UsersRound,
    Calculator,
    FileSignature,
    Package,
    ShoppingCart,
    KanbanSquare,
    Headset,
} from 'lucide-react';

const features = [
    {
        icon: LayoutGrid,
        title: 'CRM va savdo',
        desc: "Lidlar bo'yicha voronka, bitim kuzatuvi va mijozlar bazasi — bitta joyda.",
        cta: "Batafsil",
        href: '/crm',
    },
    {
        icon: UsersRound,
        title: 'HR va ish haqi',
        desc: "Xodimlar bazasi, davomat va ish haqi hisob-kitobini avtomatlashtiring.",
        cta: "Batafsil",
        href: '/hr',
    },
    {
        icon: Calculator,
        title: 'Buxgalteriya va moliya',
        desc: "Hisobvaraqlar rejasi, xarajatlar va moliyaviy hisobotlar — real vaqtda.",
        cta: "Batafsil",
        href: '/accounting',
    },
    {
        icon: FileSignature,
        title: 'EDO va soliq hujjatlari',
        desc: "Hisob-faktura va shartnomalarni platforma ichida yarating, E-IMZO bilan imzolang.",
        cta: "Batafsil",
        href: '/edo',
    },
    {
        icon: Package,
        title: 'Ombor boshqaruvi',
        desc: "Mahsulot katalogi va zaxiralarni bir joydan nazorat qiling.",
        cta: "Batafsil",
        href: '/inventory',
    },
    {
        icon: ShoppingCart,
        title: 'Savdo va POS',
        desc: "Kassa terminali, chek va qaytarishlar — do'kon va ofis bir tizimda.",
        cta: "Batafsil",
        href: '/pos',
    },
    {
        icon: KanbanSquare,
        title: 'Loyihalar boshqaruvi',
        desc: "Kanban doskalari va vaqt kuzatuvi bilan jamoangizni muvofiqlashtiring.",
        cta: "Batafsil",
        href: '/projects',
    },
    {
        icon: Headset,
        title: 'Mijozlarga xizmat',
        desc: "Murojaatlar va bilimlar bazasi orqali mijozlaringizga tezroq javob bering.",
        cta: "Batafsil",
        href: '/support',
    },
];

export default function Features6() {
    return (
        <div className="w-full py-20 px-6 flex flex-col items-center">
            <div className="text-center mx-auto">
                <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-50 text-base text-slate-800">
                    Imkoniyatlar
                </span>
                <h1 className="text-4xl md:text-5xl font-medium text-slate-900 mt-6">
                    8 modul. Bitta platforma.
                </h1>
                <p className="text-sm md:text-base text-slate-600 mt-3 max-w-[530px] mx-auto">
                    Buxgalteriya, EDO, HR, CRM va boshqa barcha jarayonlaringiz — endi bitta tizimda, ortiqcha dasturlarsiz.
                </p>
            </div>

            {/* Features Grid */}
            <div className="w-full max-w-6xl mx-auto mt-16 relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-x border-slate-100 divide-y md:divide-x md:divide-y-0 divide-slate-100">

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-px bg-linear-to-r from-slate-50 via-slate-200 to-slate-50"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-px bg-linear-to-r from-slate-50 via-slate-200 to-slate-50"></div>

                {features.map(({ icon: Icon, title, desc, cta, href }) => (
                    <div
                        key={title}
                        className="flex flex-col items-start px-6 py-8 hover:bg-slate-50 transition-colors"
                    >
                        <div className="size-13 flex items-center justify-center border border-slate-200 rounded-lg mb-11">
                            <Icon size={22} stroke="#314158" strokeWidth={2} />
                        </div>
                        <h3 className="text-base font-medium text-slate-800">{title}</h3>
                        <p className="text-sm text-slate-600 mt-2.5">{desc}</p>
                        <a
                            href={href}
                            className="mt-8 flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 transition-colors group"
                        >
                            {cta}
                            <svg
                                className="transition-transform group-hover:translate-x-0.5"
                                xmlns="http://www.w3.org/2000/svg"
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                            </svg>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}