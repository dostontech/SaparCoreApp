import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Scale,
    Users,
    ShieldCheck,
    PieChart,
    ArrowUpRight,
    Search,
} from "lucide-react";
import { PageHeader } from "@/context/PageHeaderContext";

interface ReportItem {
    title: string;
    titleUz: string;
    description: string;
    href: string;
    badge?: string;
    isUzNational?: boolean;
}

interface ReportCategory {
    id: string;
    title: string;
    icon: React.ReactNode;
    color: string;
    reports: ReportItem[];
}

const REPORT_CATEGORIES: ReportCategory[] = [
    {
        id: "financial",
        title: "Davlat va Moliyaviy Hisobotlar (BHMS)",
        icon: <Scale className="text-teal-600" size={20} />,
        color: "teal",
        reports: [
            {
                title: "1-shakl Buxgalteriya Balansi",
                titleUz: "Buxgalteriya balansi — 1-shakl",
                description: "Korxonaning maʼlum sanadagi aktivlari, majburiyatlari va xususiy kapitali holati.",
                href: "/admin/accounting/reports/balance-sheet",
                isUzNational: true,
                badge: "1-shakl",
            },
            {
                title: "2-shakl Moliyaviy Natijalar (P&L)",
                titleUz: "Moliyaviy natijalar toʻgʻrisida hisobot — 2-shakl",
                description: "Sof tushum, sotilgan mahsulot tannarxi, davr xarajatlari va sof foyda hisob-kitobi.",
                href: "/admin/accounting/reports/profit-loss",
                isUzNational: true,
                badge: "2-shakl",
            },
            {
                title: "Oʻzbekiston 1/2-Shakl Davlat Hisobotlari",
                titleUz: "Davlat moliyaviy hisobotlari (BHMS)",
                description: "Yillik va choraklik Davlat soliq va statistika organlariga topshiriladigan rasmiy shakllar.",
                href: "/admin/accounting/reports/uz-financial-statements",
                isUzNational: true,
                badge: "Milliy BHMS",
            },
            {
                title: "Aylanma Vedomost (Oborotka)",
                titleUz: "Buxgalteriya aylanma vedomosti",
                description: "Barcha buxgalteriya hisoblari boʻyicha boshlangʻich, davriy aylanma va yakuniy qoldiqlar.",
                href: "/admin/accounting/reports/trial-balance",
            },
            {
                title: "Bosh Kitob (Barcha Hisoblar)",
                titleUz: "Bosh kitob jurnali",
                description: "Hisoblar kesimida barcha provodkalar va operatsiyalarning toʻliq xronologiyasi.",
                href: "/admin/accounting/reports/general-ledger",
            },
            {
                title: "Pul Mablagʻlari Oqimi (Cash Flow)",
                titleUz: "Pul mablagʻlari oqimi",
                description: "Operatsion, investitsion va moliyaviy faoliyatdan tushgan hamda sarflangan pul oqimlari.",
                href: "/admin/accounting/reports/cash-flow-forecast",
            },
        ],
    },
    {
        id: "tax",
        title: "Davlat Soliq Qoʻmitasi (Soliq.uz)",
        icon: <ShieldCheck className="text-emerald-600" size={20} />,
        color: "emerald",
        reports: [
            {
                title: "QQS 12% Hisob-kitobi (Form 10006_29)",
                titleUz: "Qoʻshilgan qiymat soligʻi hisoboti",
                description: "12% QQS boʻyicha oylik hisob-kitob, hisoblangan va hisobga olinadigan QQS summalari.",
                href: "/admin/accounting/reports/soliq-qqs",
                isUzNational: true,
                badge: "Soliq.uz",
            },
            {
                title: "JShODS va Ijtimoiy Soliq (Form 11101_14)",
                titleUz: "Jismoniy shaxslardan olinadigan daromad soligʻi",
                description: "12% JShODS, 12% Ijtimoiy soliq va 0.1% ShJBPH (INPS) oylik soliq deklaratsiyasi.",
                href: "/admin/accounting/reports/soliq-jshods",
                isUzNational: true,
                badge: "Soliq.uz",
            },
            {
                title: "Aylanmadan Olinadigan Soliq 4% (Form 10104_18)",
                titleUz: "Aylanmadan soliq hisoboti",
                description: "Kichik biznes uchun 4% soddalashtirilgan aylanma soligʻi choraklik hisob-kitobi.",
                href: "/admin/accounting/reports/soliq-aylanma",
                isUzNational: true,
                badge: "Soliq.uz",
            },
            {
                title: "Topshirilgan Soliq Deklaratsiyalari Arxiv",
                titleUz: "Topshirilgan soliq hisobotlari",
                description: "Davlat Soliq Qoʻmitasiga taqdim etilgan barcha deklaratsiyalar va toʻlovlar holati.",
                href: "/admin/accounting/tax-returns",
            },
        ],
    },
    {
        id: "receivables_payables",
        title: "Qarzdorlik va Kontragentlar Tahlili",
        icon: <Users className="text-blue-600" size={20} />,
        color: "blue",
        reports: [
            {
                title: "Debitorlik Qarzdorlik Tahlili (Mijozlar Qarzi)",
                titleUz: "Mijozlar qarzdorligi tahlili",
                description: "Mijozlarning toʻlov muddati oʻtgan qarzlari: 1-30, 31-60, 61-90 va 90+ kunlik guruhlar.",
                href: "/admin/accounting/reports/ar-aging",
            },
            {
                title: "Kreditorlik Qarzdorlik Tahlili (Yetkazib Beruvchilar)",
                titleUz: "Yetkazib beruvchilarga toʻlov muddati",
                description: "Yetkazib beruvchilar oldidagi toʻlanishi kutilayotgan va muddati oʻtgan qarzlar.",
                href: "/admin/accounting/reports/ap-aging",
            },
            {
                title: "Oʻzaro Hisob-kitoblar (Vzaimozachet)",
                titleUz: "Vzaimozachet operatsiyalari",
                description: "Mijoz va yetkazib beruvchi sifatidagi oʻzaro toʻlovsiz qoplangan summalar jurnali.",
                href: "/admin/accounting/contras",
                badge: "Yangi",
            },
            {
                title: "Solishtirma Dalolatnoma (Akt Sverki)",
                titleUz: "Akt sverki generatori",
                description: "Kontragent bilan hisob-kitoblar solishtirmasi va E-IMZO orqali imzolash.",
                href: "/admin/e-documents",
            },
        ],
    },
    {
        id: "management",
        title: "Boshqaruv va Rentabellik Hisobotlari",
        icon: <PieChart className="text-purple-600" size={20} />,
        color: "purple",
        reports: [
            {
                title: "Asosiy Vositalar Reestri va Eskirish",
                titleUz: "Asosiy vositalar va amortizatsiya",
                description: "Korxona asosiy vositalari, qoldiq qiymati va oylik amortizatsiya hisob-kitobi.",
                href: "/admin/accounting/fixed-assets",
            },
            {
                title: "Byudjet Ijrosi Tahlili",
                titleUz: "Byudjet va fakt taqqoslashi",
                description: "Rejalashtirilgan byudjet limitlari va haqiqiy buxgalteriya xarajatlari oʻrtasidagi farq.",
                href: "/admin/accounting/reports/budget-variance",
            },
            {
                title: "Xarajatlar Markazlari P&L",
                titleUz: "Departamentlar rentabelligi",
                description: "Filiallar va xarajat markazlari boʻyicha daromad va xarajatlar taqsimoti.",
                href: "/admin/accounting/reports/pnl-by-cost-center",
            },
            {
                title: "Loyihalar Moliyaviy Natijasi",
                titleUz: "Loyihalar boʻyicha P&L",
                description: "Alohida mijoz loyihalari boʻyicha olingan daromad, xarajat va sof marja.",
                href: "/admin/accounting/reports/pnl-by-project",
            },
        ],
    },
];

const AllReportsHub: React.FC = () => {
    const [search, setSearch] = useState("");

    const filteredCategories = REPORT_CATEGORIES.map((cat) => {
        const filtered = cat.reports.filter(
            (r) =>
                r.title.toLowerCase().includes(search.toLowerCase()) ||
                r.titleUz.toLowerCase().includes(search.toLowerCase()) ||
                r.description.toLowerCase().includes(search.toLowerCase())
        );
        return { ...cat, reports: filtered };
    }).filter((cat) => cat.reports.length > 0);

    return (
        <div className="space-y-6">
            <PageHeader title="Moliyaviy va Davlat Hisobotlari Markazi">
                <div className="relative w-72">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Hisobot nomini qidirish..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 bg-white shadow-xs"
                    />
                </div>
            </PageHeader>

            {/* Hub Banner */}
            <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
                <div className="max-w-2xl relative z-10 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 backdrop-blur-xs">
                        🏛️ Oʻzbekiston Respublikasi BHMS & Soliq Standartlari
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                        Buxgalteriya, Soliq va Boshqaruv Hisobotlari
                    </h2>
                    <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed">
                        Korxonaning barcha moliyaviy hisobotlari, Davlat Soliq Qoʻmitasi (Soliq.uz) deklaratsiyalari, debitorlik/kreditorlik tahlillari va boshqaruv xulosalari bir joyda jamlangan.
                    </p>
                </div>
            </div>

            {/* Categorized Reports Sections */}
            <div className="space-y-8">
                {filteredCategories.map((cat) => (
                    <div key={cat.id} className="space-y-3">
                        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-200">
                            {cat.icon}
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                {cat.title}
                            </h3>
                            <span className="text-xs font-semibold text-gray-400">({cat.reports.length} ta hisobot)</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {cat.reports.map((report, idx) => (
                                <Link
                                    key={idx}
                                    to={report.href}
                                    className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="text-sm font-bold text-gray-900 group-hover:text-teal-700 transition-colors line-clamp-2">
                                                {report.title}
                                            </h4>
                                            {report.badge && (
                                                <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                                                    {report.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                            {report.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-50 text-xs font-semibold text-teal-600 group-hover:text-teal-800">
                                        <span>Hisobotni ochish</span>
                                        <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllReportsHub;
