'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/language-context';
import {
    LayoutDashboard,
    Users,
    Calculator,
    UserCheck,
    FileSignature,
    CheckCircle2,
    Clock,
    Send,
    Sparkles,
    Download,
    Eye,
    ArrowUpRight,
} from 'lucide-react';

export default function DemoPreviewSection() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('edo');

    const tabs = [
        { id: 'dashboard', label: t('demoPreview.tabs.dashboard', 'Boshqaruv paneli'), icon: LayoutDashboard },
        { id: 'crm', label: t('demoPreview.tabs.crm', 'CRM'), icon: Users },
        { id: 'accounting', label: t('demoPreview.tabs.accounting', 'Buxgalteriya'), icon: Calculator },
        { id: 'hr', label: t('demoPreview.tabs.hr', 'HR'), icon: UserCheck },
        { id: 'edo', label: t('demoPreview.tabs.edo', 'EDO'), icon: FileSignature },
    ];

    return (
        <section id="demo-preview" className="w-full py-10 md:py-16 px-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF5F2] border border-[#DCE9E5] text-[#028090] text-xs sm:text-sm font-semibold uppercase tracking-wider">
                    <Sparkles className="size-3.5 text-[#02C39A]" />
                    <span>{t('demoPreview.badge')}</span>
                    <span className="text-slate-400 font-normal">|</span>
                    <span className="text-slate-500 font-normal">{t('demoPreview.badgeSub')}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mt-4 tracking-tight">
                    {t('demoPreview.title')}
                </h2>

                <p className="text-sm sm:text-base md:text-lg text-slate-600 mt-3 leading-relaxed">
                    {t('demoPreview.description')}
                </p>
            </div>

            {/* Tab Navigation Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer ${isActive
                                    ? 'bg-[#0B2B33] text-white shadow-lg shadow-[#0B2B33]/15 scale-[1.02]'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <Icon className={`size-3.5 sm:size-4 ${isActive ? 'text-[#02C39A]' : 'text-slate-400'}`} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Preview Window Mockup */}
            <div className="mt-6 sm:mt-8 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden transition-all">
                {/* Browser/Window Chrome Bar */}
                <div className="bg-[#F8FAFC] px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-rose-400" />
                        <div className="size-3 rounded-full bg-amber-400" />
                        <div className="size-3 rounded-full bg-emerald-400" />
                        <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline">
                            app.sapar.uz / {activeTab}
                        </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{t('common.previewMockup')}</span>
                    </div>
                </div>

                {/* Window Body Content based on Tab */}
                <div className="p-6 md:p-8 min-h-[380px] bg-slate-50/50">
                    {/* EDO Tab */}
                    {activeTab === 'edo' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <FileSignature className="size-5 text-[#028090]" />
                                        {t('demoPreview.edoTitle')}
                                    </h3>
                                    <p className="text-xs md:text-sm text-slate-500 mt-1">
                                        {t('demoPreview.edoSubtitle')}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <a
                                        href="#contact"
                                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#028090] text-white hover:bg-[#10404B] transition flex items-center gap-1.5"
                                    >
                                        <FileSignature className="size-3.5" />
                                        {t('demoPreview.edoNewDoc')}
                                    </a>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                                        <tr>
                                            <th className="px-5 py-3.5">ID</th>
                                            <th className="px-5 py-3.5">Type</th>
                                            <th className="px-5 py-3.5">Partner</th>
                                            <th className="px-5 py-3.5">Amount</th>
                                            <th className="px-5 py-3.5">Status</th>
                                            <th className="px-5 py-3.5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        <tr className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-4 font-mono font-semibold text-[#0B2B33]">
                                                DOC-0091
                                            </td>
                                            <td className="px-5 py-4 font-medium text-slate-800">
                                                Contract / Shartnoma
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                ООО &quot;Tashkent Trade&quot;
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-slate-900">
                                                48,500,000 UZS
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                                                    E-IMZO ✓
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition">
                                                    <Download className="size-4" />
                                                </button>
                                            </td>
                                        </tr>

                                        <tr className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-4 font-mono font-semibold text-[#0B2B33]">
                                                DOC-0092
                                            </td>
                                            <td className="px-5 py-4 font-medium text-slate-800">
                                                Power of Attorney / Ishonchnoma
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                MChJ &quot;Grand Stroy&quot;
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-slate-500">
                                                —
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                    <Clock className="size-3.5 text-amber-600" />
                                                    Pending / Kutilmoqda
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition">
                                                    <Eye className="size-4" />
                                                </button>
                                            </td>
                                        </tr>

                                        <tr className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-4 font-mono font-semibold text-[#0B2B33]">
                                                DOC-0093
                                            </td>
                                            <td className="px-5 py-4 font-medium text-slate-800">
                                                Invoice / Hisob-faktura
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                YaTT Karimov A.
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-slate-900">
                                                12,400,000 UZS
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                    <Send className="size-3.5 text-blue-600" />
                                                    my3soliq.uz ✓
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition">
                                                    <Download className="size-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                                    <span className="text-xs font-medium text-slate-500">Revenue / Oylik tushum</span>
                                    <div className="text-2xl font-bold text-slate-900 mt-2">142,800,000 UZS</div>
                                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                                        <ArrowUpRight className="size-3.5" /> +18.4%
                                    </span>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                                    <span className="text-xs font-medium text-slate-500">Active Leads / Lidlar</span>
                                    <div className="text-2xl font-bold text-slate-900 mt-2">84</div>
                                    <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-1">
                                        Pipeline CRM
                                    </span>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                                    <span className="text-xs font-medium text-slate-500">Attendance / Davomat</span>
                                    <div className="text-2xl font-bold text-slate-900 mt-2">96.8%</div>
                                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                                        GPS Check-in
                                    </span>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                                    <span className="text-xs font-medium text-slate-500">Signed E-IMZO</span>
                                    <div className="text-2xl font-bold text-slate-900 mt-2">32 docs</div>
                                    <span className="text-xs font-semibold text-teal-600 flex items-center gap-1 mt-1">
                                        Didox / Soliq sync
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CRM Tab */}
                    {activeTab === 'crm' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900">{t('demoPreview.crmTitle')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-slate-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-slate-700 uppercase">New Leads</span>
                                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">12</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                                            <div className="font-semibold text-slate-800">Agro Export MChJ</div>
                                            <div className="text-slate-500 mt-1">24,000,000 UZS · Accounting Tier</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-slate-700 uppercase">Negotiations</span>
                                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">5</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                                            <div className="font-semibold text-slate-800">Navoi Logistic Hub</div>
                                            <div className="text-slate-500 mt-1">65,000,000 UZS · Enterprise Module</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-slate-700 uppercase">Contract Stage</span>
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">3</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                                            <div className="font-semibold text-slate-800">Orient Group Retail</div>
                                            <div className="text-slate-500 mt-1">110,000,000 UZS · POS + Inventory</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Accounting Tab */}
                    {activeTab === 'accounting' && (
                        <div className="space-y-4">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">{t('demoPreview.accountingTitle')}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                                        <span className="text-xs font-medium text-emerald-700">Bank Balance</span>
                                        <div className="text-xl font-bold text-emerald-900 mt-1">284,500,000 UZS</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
                                        <span className="text-xs font-medium text-rose-700">Receivables</span>
                                        <div className="text-xl font-bold text-rose-900 mt-1">36,200,000 UZS</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                                        <span className="text-xs font-medium text-blue-700">1C Synchronization</span>
                                        <div className="text-xl font-bold text-blue-900 mt-1">Connected ✓</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* HR Tab */}
                    {activeTab === 'hr' && (
                        <div className="space-y-4">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 mb-3">{t('demoPreview.hrTitle')}</h3>
                                <p className="text-sm text-slate-600 mb-4">{t('demoPreview.hrSubtitle')}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold text-slate-800">Alisher Zokirov</div>
                                            <div className="text-xs text-slate-500">Chief Accountant · 09:02 Check-in</div>
                                        </div>
                                        <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold">Present</span>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold text-slate-800">Madina Karimova</div>
                                            <div className="text-xs text-slate-500">Sales Manager · 08:55 Check-in</div>
                                        </div>
                                        <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold">Present</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
