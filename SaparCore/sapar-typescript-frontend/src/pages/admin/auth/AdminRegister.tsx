import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Building2,
  Phone,
  CheckCircle2,
  Loader2Icon,
  ShieldCheck,
  TrendingUp,
  Boxes,
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import Constants from "@constants/api";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@store/index";
import { initializeAuth } from "@store/auth/authSlice";
import { useSetupStatus } from "@context/SetupStatusContext";
import { SaparLogo } from "@components/common/SaparLogo";

export const AdminRegister: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { setStatus } = useSetupStatus();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "+998",
    companyName: "",
    subdomain: "",
    couponCode: "",
    country: "Oʻzbekiston",
    currency: "UZS (soʻm)",
    taxRegime: "QQS 12%",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubdomainManual, setIsSubdomainManual] = useState(false);
  const [selectedLang, setSelectedLang] = useState<"uz" | "ru" | "en">("uz");

  // Helper to slugify company name into a subdomain
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/['ʻʼ`]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-generate subdomain from company name unless user explicitly typed their own subdomain
      if (name === "companyName" && !isSubdomainManual) {
        updated.subdomain = slugify(value);
      }
      return updated;
    });

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSubdomainManual(true);
    const cleaned = slugify(e.target.value);
    setFormData((prev) => ({ ...prev, subdomain: cleaned }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email kiritish majburiy";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Notoʻgʻri email formati";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Parol kiritish majburiy";
    } else if (formData.password.length < 6) {
      newErrors.password = "Parol kamida 6 belgidan iborat boʻlishi kerak";
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Korxona nomi majburiy";
    }

    if (!formData.phone.trim() || formData.phone === "+998") {
      newErrors.phone = "Telefon raqami majburiy";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        companyName: formData.companyName.trim(),
        subdomain: formData.subdomain || slugify(formData.companyName),
        firstName: formData.companyName.trim(),
        lastName: "",
      };

      const response = await axios.post(Constants.REGISTER_URL, payload);
      const { token, user } = response.data;

      Cookies.set("authToken", token, {
        secure: window.location.protocol === "https:",
        sameSite: "Strict",
        expires: 7,
      });
      Cookies.set("authUser", JSON.stringify(user), {
        secure: window.location.protocol === "https:",
        sameSite: "Strict",
        expires: 7,
      });

      dispatch(initializeAuth());

      sessionStorage.setItem(
        "setupStatus",
        JSON.stringify({ new_register: false, company_settings: false })
      );
      setStatus({ new_register: false, company_settings: false });

      toast.success("Muvaffaqiyatli roʻyxatdan oʻtdingiz!");
      navigate("/admin");
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        "Roʻyxatdan oʻtishda xatolik yuz berdi.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-900 font-sans text-slate-800">
      {/* ========================================================================= */}
      {/* LEFT SIDE: HERO BANNER & VALUE PROPOSITION                                */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 flex-col justify-between p-12 text-white">
        {/* Background Ambient Glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center">
          <SaparLogo variant="white" className="h-9 w-auto" />
        </div>

        {/* Center Pitch */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/60 border border-teal-500/30 text-teal-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            Oʻzbekiston va Markaziy Osiyo standarti
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Biznesingizni yagona aqlli bulutli platformada boshqaring.
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            E-Faktura, milliy hisoblar rejasi (BHMS), QQS 12%, xaridlar, savdo va FIFO
            ombor tizimi — barchasi bir joyda, ortiqcha integratsiyalarsiz.
          </p>

          <div className="space-y-3.5 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
              </div>
              <span className="text-xs text-slate-200 font-medium">
                E-IMZO & E-Faktura milliy elektron imzo bilan toʻliq himoyalangan
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-teal-400" />
              </div>
              <span className="text-xs text-slate-200 font-medium">
                Moliyaviy hisobotlar: 1-shakl Balans, 2-shakl P&L va Oborotka
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                <Boxes className="w-4 h-4 text-teal-400" />
              </div>
              <span className="text-xs text-slate-200 font-medium">
                Koʻp omborli qoldiqlar va FIFO tannarx nazorati
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-6">
          <span>© 2026 SAPAR ERP Technologies.</span>
          <span>14 kunlik bepul sinov muddati</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT SIDE: REGISTRATION FORM                                             */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-between overflow-y-auto px-6 sm:px-12 py-8 min-h-screen">
        {/* Top bar: Brand & Language Switcher */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 lg:hidden">
            <SaparLogo variant="dark" className="h-7 w-auto" />
          </div>

          <div className="ml-auto flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedLang("uz")}
              className={`px-2.5 py-1 rounded-lg transition ${selectedLang === "uz" ? "bg-white text-teal-900 shadow-2xs" : "text-slate-500"
                }`}
            >
              UZ
            </button>
            <button
              type="button"
              onClick={() => setSelectedLang("ru")}
              className={`px-2.5 py-1 rounded-lg transition ${selectedLang === "ru" ? "bg-white text-teal-900 shadow-2xs" : "text-slate-500"
                }`}
            >
              RU
            </button>
            <button
              type="button"
              onClick={() => setSelectedLang("en")}
              className={`px-2.5 py-1 rounded-lg transition ${selectedLang === "en" ? "bg-white text-teal-900 shadow-2xs" : "text-slate-500"
                }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Center: Sign-up Form */}
        <div className="max-w-md w-full mx-auto my-6 space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Roʻyxatdan oʻtish
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              14 kunlik bepul sinov muddatini boshlang. Karta talab qilinmaydi.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Work Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ishchi Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="masalan: ceo@korxona.uz yoki ism@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition"
                />
              </div>
              {formErrors.email && (
                <p className="text-rose-500 text-[11px] mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* 2. Choose Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Parol tanlang <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Kamida 6 belgi"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-rose-500 text-[11px] mt-1">{formErrors.password}</p>
              )}
            </div>

            {/* 3. Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Telefon raqamingiz <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+998 90 123 45 67"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition"
                />
              </div>
              {formErrors.phone && (
                <p className="text-rose-500 text-[11px] mt-1">{formErrors.phone}</p>
              )}
            </div>

            {/* 4. Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Korxona / Kompaniya nomi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="masalan: Akfa Media MChJ / Sapar Trade Enterprise"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition"
                />
              </div>
              {formErrors.companyName && (
                <p className="text-rose-500 text-[11px] mt-1">{formErrors.companyName}</p>
              )}
            </div>

            {/* 5. Default Settings Summary Box (Matching reference screenshot) */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1.5 leading-tight">
              <div className="flex items-center justify-between">
                <span>
                  Mamlakat: <strong className="text-slate-800">{formData.country}</strong>
                </span>
                <span className="text-teal-700 font-semibold cursor-pointer">Standart</span>
              </div>
              <div className="flex items-center justify-between">
                <span>
                  Asosiy valyuta: <strong className="text-slate-800">{formData.currency}</strong>
                </span>
                <span className="text-teal-700 font-semibold cursor-pointer">Standart</span>
              </div>
              <div className="flex items-center justify-between">
                <span>
                  Soliq rejasi: <strong className="text-slate-800">{formData.taxRegime}</strong>
                </span>
                <span className="text-teal-700 font-semibold cursor-pointer">Standart</span>
              </div>
              <div className="flex items-center justify-between">
                <span>
                  Hisoblar rejasi: <strong className="text-slate-800">BHMS (Milliy standart)</strong>
                </span>
              </div>
            </div>

            {/* 6. Subdomain / Workspace URL picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ish maydoni manzili (SAPAR URL) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-teal-600 focus-within:bg-white transition text-xs">
                <span className="px-3 py-2.5 text-slate-400 bg-slate-100/70 border-r border-slate-200 font-mono">
                  https://
                </span>
                <input
                  type="text"
                  name="subdomain"
                  value={formData.subdomain}
                  onChange={handleSubdomainChange}
                  placeholder="kompaniya-nomi"
                  className="flex-1 px-3 py-2.5 bg-transparent text-xs text-slate-800 font-mono focus:outline-none placeholder-slate-400"
                />
                <span className="px-3 py-2.5 text-slate-500 bg-slate-100/70 border-l border-slate-200 font-mono">
                  .sapar.uz
                </span>
              </div>
            </div>

            {/* 7. Discount / Coupon Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Promokod / Hamkorlik kodi <span className="text-slate-400 font-normal">(Ixtiyoriy)</span>
              </label>
              <input
                type="text"
                name="couponCode"
                value={formData.couponCode}
                onChange={handleChange}
                placeholder="Ixtiyoriy"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition"
              />
            </div>

            {/* 8. SSL & Encryption Badge */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Maʼlumotlar 256-bitli SSL shifrlash orqali himoyalanadi</span>
            </div>

            {/* Terms notice */}
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Roʻyxatdan oʻtish orqali siz{" "}
              <a href="#" className="text-teal-700 underline">
                Foydalanish shartlari
              </a>{" "}
              va{" "}
              <a href="#" className="text-teal-700 underline">
                Maxfiylik siyosati
              </a>
              ga rozilik bildirasiz.
            </p>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSaving}
              className={`w-full py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-900/10 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${isSaving ? "opacity-60 cursor-not-allowed" : ""
                }`}
            >
              {isSaving ? (
                <>
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  <span>Hisob yaratilmoqda...</span>
                </>
              ) : (
                <span>Sinov muddatini boshlash (Start Free Trial)</span>
              )}
            </button>
          </form>

          {/* Already have account? Log in */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-600">
              Hisobingiz bormi?{" "}
              <Link to="/admin/login" className="font-bold text-teal-700 hover:underline">
                Tizimga kirish
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="text-center text-[11px] text-slate-400">
          © 2026 SAPAR ERP. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
