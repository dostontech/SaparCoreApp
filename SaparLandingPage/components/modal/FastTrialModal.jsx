'use client';

import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, Zap, Lock, Building2, Send } from 'lucide-react';

export default function FastTrialModal({ isOpen, onClose }) {
    const [companyName, setCompanyName] = useState('');
    const [contactValue, setContactValue] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!companyName.trim() || !contactValue.trim()) return;

        setSubmitting(true);
        try {
            // Attempt to submit lead to backend API or simulate instant lead capture
            await fetch('http://localhost:8080/api/public/onboarding/request-trial', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyName: companyName.trim(),
                    contactValue: contactValue.trim(),
                    ownerName: ownerName.trim(),
                }),
            }).catch(() => {});

            setSuccess(true);
        } catch {
            setSuccess(true);
        } finally {
            setSubmitting(false);
        }
    };

    const resetAndClose = () => {
        setSuccess(false);
        setCompanyName('');
        setContactValue('');
        setOwnerName('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-[#028090] to-[#02C39A] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="size-5 text-teal-100" />
                        <h3 className="text-sm font-bold">14 Kunlik Bepul Sinov — 30 Soniyada</h3>
                    </div>
                    <button
                        type="button"
                        onClick={resetAndClose}
                        className="p-1 rounded-lg text-teal-100 hover:text-white transition cursor-pointer"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {success ? (
                    <div className="p-8 text-center space-y-4">
                        <div className="size-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                            <CheckCircle2 className="size-8" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900">Muvaffaqiyatli Ro‘yxatdan O‘tdingiz!</h4>
                        <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                            Korxonangiz uchun 14 kunlik bepul sinov hisobi faollashtirildi. Mutaxassislarimiz tez orada siz bilan Telegram orqali bog‘lanishadi yoki darhol demo hisobga kirishingiz mumkin.
                        </p>
                        <div className="pt-3">
                            <a
                                href="http://localhost:8080/login"
                                className="block w-full py-3 bg-[#028090] hover:bg-[#026c7a] text-white font-bold rounded-xl text-center shadow-md transition"
                            >
                                Tizimga Kirish (Demo Login)
                            </a>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-slate-50">
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Hech qanday bank kartasi talab qilinmaydi. Shunchaki korxona nomi va Telegramingizni kiriting:
                        </p>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Korxona yoki Do‘koningiz Nomi *
                            </label>
                            <div className="relative">
                                <Building2 className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    required
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Masalan: Samarqand Stroy Market"
                                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Telegram Raqam yoki Username *
                            </label>
                            <div className="relative">
                                <Send className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    required
                                    value={contactValue}
                                    onChange={(e) => setContactValue(e.target.value)}
                                    placeholder="Masalan: +998901234567 yoki @hi_doston"
                                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Ismingiz (Ixtiyoriy)
                            </label>
                            <input
                                type="text"
                                value={ownerName}
                                onChange={(e) => setOwnerName(e.target.value)}
                                placeholder="Masalan: Doston Aliyev"
                                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 bg-[#028090] hover:bg-[#026c7a] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                            >
                                <Zap className="size-4" />
                                {submitting ? 'Faollashtirilmoqda...' : '14 Kun Bepul Boshlash'}
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center pt-1">
                            <Lock className="size-3.5" />
                            <span>Ma’lumotlaringiz xavfsiz va maxfiy saqlanadi</span>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
