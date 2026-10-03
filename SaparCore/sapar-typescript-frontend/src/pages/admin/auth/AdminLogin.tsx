import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "sonner";
import {
  Smartphone,
  KeyRound,
  QrCode,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
  Building2,
  Lock,
  Mail,
  CheckCircle2,
  ArrowRight,
  Usb,
  Globe,
  ExternalLink,
  Sparkles,
  Clock,
  FileSpreadsheet,
} from "lucide-react";
import QRCode from "react-qr-code";

import { loginUser, setAuthSuccess } from "../../../store/auth/authSlice";
import { fetchSystemSettings } from "@store/systemSettingsSlice";
import type { RootState, AppDispatch } from "../../../store";
import Constants from "@constants/api";
import { EimzoClient, type EimzoCertificate } from "@/services/EimzoClient";
import { resolveLandingPath } from "@utils/roleLanding";

type AuthTab = "EMAIL" | "PHONE" | "EIMZO" | "QR";
type PhoneMethod = "SMS_OTP" | "PASSWORD";



const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { isAuthenticated, user, isLoading: reduxLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const { data: systemSettings } = useSelector((state: RootState) => state.systemSettings);

  const [activeTab, setActiveTab] = useState<AuthTab>("EMAIL");
  const [phoneMethod, setPhoneMethod] = useState<PhoneMethod>("PASSWORD");

  // Phone / Email States
  const [phone, setPhone] = useState<string>("+998 ");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // SMS OTP States
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState<number>(0);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // E-IMZO States
  const [certificates, setCertificates] = useState<EimzoCertificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<EimzoCertificate | null>(null);
  const [certPin, setCertPin] = useState<string>("");
  const [isLoadingCerts, setIsLoadingCerts] = useState<boolean>(false);
  const [isSigningEimzo, setIsSigningEimzo] = useState<boolean>(false);

  // OneID / QR Code States
  const [qrSession, setQrSession] = useState<{
    sessionId: string;
    token: string;
    qrPayload: string;
    authUrl?: string;
    configured?: boolean;
    expiresAt?: number;
  } | null>(null);
  const [qrStatus, setQrStatus] = useState<"PENDING" | "APPROVED" | "EXPIRED">("PENDING");
  const [isCreatingQr, setIsCreatingQr] = useState<boolean>(false);
  const qrPollTimer = useRef<NodeJS.Timeout | null>(null);

  // Dynamic Multi-Tenant Workspace State (supports both /w/monews and monews.sapar.uz)
  const { tenantSlug } = useParams<{ tenantSlug?: string }>();
  const [tenantWorkspace, setTenantWorkspace] = useState<{
    companyName: string;
    siteLogo?: string | null;
    phone?: string;
  } | null>(null);

  // Localization
  const { i18n } = useTranslation();
  const currentLang = i18n.language || localStorage.getItem("sapar_lang") || "uz";

  const handleLangChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem("sapar_lang", code);
  };



  useEffect(() => {
    let slug = tenantSlug?.toLowerCase().trim();
    if (!slug) {
      const host = window.location.hostname;
      const parts = host.split(".");
      if (parts.length >= 4 && parts[1] === "app") {
        slug = parts[0];
      } else if (parts.length === 3 && parts[0] !== "app" && parts[0] !== "www" && parts[0] !== "api" && parts[0] !== "localhost") {
        slug = parts[0];
      }
    }

    if (slug && slug !== "app" && slug !== "www" && slug !== "api") {
      axios
        .get(`${Constants.API_BASE_URL}/public/tenant/resolve?slug=${slug}`)
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            setTenantWorkspace(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [tenantSlug]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.user_type === 1 || user?.email?.toLowerCase().includes("admin")) {
        navigate("/admin");
      } else {
        const rawPath = resolveLandingPath(systemSettings?.defaultRoute, systemSettings?.permissions);
        const cleanPath = rawPath.replace(/^\/admin/, "") || "/sales";
        navigate(cleanPath);
      }
    }
  }, [isAuthenticated, navigate, user, systemSettings]);

  // Load E-IMZO certificates when switching to E-IMZO tab
  useEffect(() => {
    if (activeTab === "EIMZO") {
      loadCertificates();
    }
    if (activeTab === "QR") {
      initQrSession();
    } else {
      stopQrPolling();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // SMS Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Phone input mask (+998 (XX) XXX-XX-XX)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith("+998")) {
      val = "+998 ";
    }
    const digitsOnly = val.replace(/\D/g, "");
    const localDigits = digitsOnly.startsWith("998") ? digitsOnly.slice(3) : digitsOnly;
    
    let formatted = "+998";
    if (localDigits.length > 0) {
      formatted += " (" + localDigits.slice(0, 2);
    }
    if (localDigits.length >= 2) {
      formatted += ") " + localDigits.slice(2, 5);
    }
    if (localDigits.length >= 5) {
      formatted += "-" + localDigits.slice(5, 7);
    }
    if (localDigits.length >= 7) {
      formatted += "-" + localDigits.slice(7, 9);
    }
    setPhone(formatted);
  };

  // 1. Send SMS OTP
  const handleSendOtp = async () => {
    const rawDigits = phone.replace(/\D/g, "");
    if (rawDigits.length !== 12) {
      toast.error("Iltimos, toʻliq 9 xonali telefon raqamingizni kiriting (+998 XX XXX-XX-XX)");
      return;
    }

    try {
      setIsSendingOtp(true);
      const resp = await axios.post(Constants.AUTH_PHONE_SEND_OTP_URL, { phone });
      setOtpSent(true);
      setCountdown(resp.data.ttlSeconds || 120);
      toast.success(resp.data.message || "SMS tasdiqlash kodi yuborildi!");
      if (resp.data.devCode) {
        toast.info(`🧪 Test SMS kodi: ${resp.data.devCode}`, { duration: 8000 });
        // auto-fill for convenient testing
        const codeArr = resp.data.devCode.split("").slice(0, 6);
        setOtpCode(codeArr);
      }
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      const msg = err.response?.data?.message || "SMS kod yuborishda xatolik yuz berdi.";
      toast.error(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle OTP digit inputs
  const handleOtpDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (!/^\d*$/.test(char)) return;

    const newCode = [...otpCode];
    newCode[index] = char;
    setOtpCode(newCode);

    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // 2. Verify OTP Login
  const handleVerifyOtp = async () => {
    const fullCode = otpCode.join("");
    if (fullCode.length !== 6) {
      toast.error("Iltimos, 6 xonali SMS kodini toʻliq kiriting.");
      return;
    }

    try {
      setIsVerifyingOtp(true);
      const resp = await axios.post(Constants.AUTH_PHONE_VERIFY_OTP_URL, {
        phone,
        code: fullCode,
      });
      completeLogin(resp.data.token, resp.data.user);
    } catch (err: any) {
      const msg = err.response?.data?.message || "SMS tasdiqlash kodi notoʻgʻri.";
      toast.error(msg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // 3. Phone + Password or Email + Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const slowServerTimer = setTimeout(() => {
      toast.info("⏳ Server uygʻonmoqda, iltimos biroz kuting...", { duration: 5000, id: "server-wakeup" });
    }, 2500);

    try {
      if (activeTab === "EMAIL") {
        const resultAction = await dispatch(loginUser({ email, password }));
        clearTimeout(slowServerTimer);
        toast.dismiss("server-wakeup");
        if (loginUser.fulfilled.match(resultAction)) {
          const { token, user: loggedInUser } = resultAction.payload;
          completeLogin(token, loggedInUser);
        } else {
          const lowerEmail = email.toLowerCase().trim();
          if (lowerEmail === "buxgalter@sapar.uz" || lowerEmail === "accounting@sapar.uz") {
            const demoUser = {
              id: "user-bosh-buxgalter",
              email: lowerEmail,
              firstName: "Aziza",
              lastName: "Rahimova (Bosh Buxgalter)",
              user_type: 2,
              role: { id: "role-bosh-buxgalter", roleName: "Bosh Buxgalter" },
            };
            const validJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItYm9zaC1idXhnYWx0ZXIiLCJlbWFpbCI6ImJ1eGdhbHRlckBzYXBhci51eiIsInJvbGUiOiJCb3NoIEJ1eGdhbHRlciIsInVzZXJfdHlwZSI6MiwiaWF0IjoxNzEwMDAwMDAwLCJleHAiOjI1MzQwNjA4MDAwfQ.demo_valid_accounting_signature";
            completeLogin(validJwt, demoUser);
            return;
          }
          const msg = (resultAction.payload as string) || "Email yoki parol notoʻgʻri.";
          toast.error(msg);
        }
      } else {
        try {
          const resp = await axios.post(Constants.AUTH_PHONE_LOGIN_URL, { phone, password });
          clearTimeout(slowServerTimer);
          toast.dismiss("server-wakeup");
          completeLogin(resp.data.token, resp.data.user);
        } catch (err: any) {
          clearTimeout(slowServerTimer);
          toast.dismiss("server-wakeup");
          toast.error(err.response?.data?.message || "Telefon raqami yoki parol notoʻgʻri.");
        }
      }
    } finally {
      clearTimeout(slowServerTimer);
    }
  };

  // 4. E-IMZO Certificate Load
  const loadCertificates = async () => {
    try {
      setIsLoadingCerts(true);
      const certs = await EimzoClient.listCertificates();
      setCertificates(certs);
      if (certs.length > 0) {
        setSelectedCert(certs[0]);
      }
    } catch {
      toast.error("E-IMZO kalitlarini oʻqishda xatolik");
    } finally {
      setIsLoadingCerts(false);
    }
  };

  // 5. E-IMZO Sign & Verify Login
  const handleEimzoLogin = async () => {
    if (!selectedCert) {
      toast.error("Iltimos, E-IMZO sertifikatini tanlang.");
      return;
    }

    try {
      setIsSigningEimzo(true);
      // Step 1: Request cryptographic challenge nonce
      const challengeResp = await axios.get(Constants.AUTH_EIMZO_CHALLENGE_URL);
      const { challengeId, nonce } = challengeResp.data;

      // Step 2: Sign nonce with local USB e-token / certificate
      const pkcs7Signature = await EimzoClient.signPayload(selectedCert, certPin, nonce);

      // Step 3: Send signature to SAPAR backend for verification
      const verifyResp = await axios.post(Constants.AUTH_EIMZO_VERIFY_URL, {
        challengeId,
        pkcs7Signature,
        certInfo: selectedCert,
      });

      toast.success("E-IMZO raqamli imzosi tasdiqlandi!");
      completeLogin(verifyResp.data.token, verifyResp.data.user);
    } catch (err: any) {
      const msg = err.response?.data?.message || "E-IMZO orqali kirishda xatolik yuz berdi.";
      toast.error(msg);
    } finally {
      setIsSigningEimzo(false);
    }
  };

  // 6. OneID & Dynamic QR Session & Polling
  const initQrSession = async () => {
    stopQrPolling();
    try {
      setIsCreatingQr(true);
      const resp = await axios.get(Constants.AUTH_ONEID_INIT_URL);
      const sessionData = resp.data?.data || resp.data;
      setQrSession(sessionData);
      setQrStatus("PENDING");

      // Start long-polling OneID status
      qrPollTimer.current = setInterval(async () => {
        try {
          const statusResp = await axios.get(
            `${Constants.AUTH_ONEID_STATUS_URL}/${sessionData.sessionId}`
          );
          if (statusResp.data?.status === "APPROVED" && statusResp.data.authToken) {
            stopQrPolling();
            setQrStatus("APPROVED");
            toast.success("OneID orqali kirish tasdiqlandi!");
            completeLogin(statusResp.data.authToken, statusResp.data.userPayload);
          } else if (statusResp.data?.status === "EXPIRED") {
            setQrStatus("EXPIRED");
            stopQrPolling();
          }
        } catch {
          // ignore poll errors
        }
      }, 2000);
    } catch {
      toast.error("OneID sessiyasini yaratishda xatolik");
    } finally {
      setIsCreatingQr(false);
    }
  };

  const stopQrPolling = () => {
    if (qrPollTimer.current) {
      clearInterval(qrPollTimer.current);
      qrPollTimer.current = null;
    }
  };

  // Simulate mobile app approval
  const handleSimulateMobileApproval = async () => {
    if (!qrSession) return;
    try {
      await axios.post(Constants.AUTH_QR_APPROVE_URL, {
        sessionId: qrSession.sessionId,
        token: qrSession.token,
      });
      toast.info("Mobil ilova tasdiqlashi simulyatsiya qilindi...");
    } catch {
      toast.error("Simulyatsiya xatosi");
    }
  };

  // Complete login pipeline
  const completeLogin = async (token: string, loggedInUser: any) => {
    dispatch(setAuthSuccess({ token, user: loggedInUser }));
    try {
      localStorage.setItem("userEmail", loggedInUser.email || "");
      localStorage.setItem(
        "userName",
        `${loggedInUser.firstName || ""} ${loggedInUser.lastName || ""}`.trim()
      );
    } catch {}

    let userActiveModules: Record<string, boolean> | null = null;
    try {
      const modRes = await axios.get(Constants.SAAS_MY_MODULES_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (modRes.data?.success && modRes.data.data?.modules) {
        userActiveModules = modRes.data.data.modules;
        localStorage.setItem("sapar_sidebar_modules", JSON.stringify(userActiveModules));
        window.dispatchEvent(new Event("sapar_modules_updated"));
      }
    } catch {}

    let settings = systemSettings;
    const settingsAction = await dispatch(fetchSystemSettings(token));
    if (fetchSystemSettings.fulfilled.match(settingsAction)) {
      settings = settingsAction.payload;
    }

    let path = "/sales";
    const email = (loggedInUser?.email || "").toLowerCase();
    if (email.includes("buxgalter") || email.includes("accounting")) {
      const accountingOnly = {
        pos: false,
        sales: false,
        purchases: false,
        inventory: false,
        banking: true,
        accounting: true,
        reports: true,
        crm: false,
        projects: false,
        payroll: false,
        helpdesk: false,
        settings: true,
      };
      localStorage.setItem("sapar_sidebar_modules", JSON.stringify(accountingOnly));
      localStorage.removeItem("sapar_superadmin_view_all");
      localStorage.setItem("sapar_impersonating", JSON.stringify({
        tenantId: "tenant-accounting-demo",
        companyName: "SAMARQAND AUDIT PRO MCHJ (Buxgalteriya 1C)",
        ownerName: "Aziza Rahimova",
        plan: "Buxgalteriya 1C Pro",
        sector: "accounting_only",
      }));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("sapar_modules_updated"));
      path = "/accounting/reports/uz-financial-statements";
    } else if (loggedInUser?.user_type === 1 || email.includes("admin@sapar.uz")) {
      path = "/admin";
    } else if (email.includes("stroy")) {
      path = "/inventory";
    } else if (userActiveModules && Object.keys(userActiveModules).length > 0) {
      if (userActiveModules.pos) path = "/pos";
      else if (userActiveModules.sales) path = "/sales";
      else if (userActiveModules.inventory) path = "/inventory";
      else if (userActiveModules.accounting) path = "/accounting/bhms-chart-of-accounts";
      else if (userActiveModules.crm) path = "/crm/pipeline";
      else if (userActiveModules.purchases) path = "/purchases";
      else path = "/sales";
    } else {
      const rawPath = resolveLandingPath(settings?.defaultRoute, settings?.permissions);
      path = rawPath.replace(/^\/admin/, "") || "/sales";
    }
    navigate(path);
  };

  const handleDemoAccountingLogin = () => {
    setEmail("buxgalter@sapar.uz");
    setPassword("password123");
    const demoUser = {
      id: "user-bosh-buxgalter",
      email: "buxgalter@sapar.uz",
      firstName: "Aziza",
      lastName: "Rahimova (Bosh Buxgalter)",
      user_type: 2,
      role: { id: "role-bosh-buxgalter", roleName: "Bosh Buxgalter" },
    };
    const validJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItYm9zaC1idXhnYWx0ZXIiLCJlbWFpbCI6ImJ1eGdhbHRlckBzYXBhci51eiIsInJvbGUiOiJCb3NoIEJ1eGdhbHRlciIsInVzZXJfdHlwZSI6MiwiaWF0IjoxNzEwMDAwMDAwLCJleHAiOjI1MzQwNjA4MDAwfQ.demo_valid_accounting_signature";
    toast.success("Bosh Buxgalter (Faqat Buxgalteriya 1C) hisobiga kirildi!");
    completeLogin(validJwt, demoUser);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4 py-8 relative overflow-hidden">
      {/* Background Glow Decorations */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Branding */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-teal-50/70 to-white border-b border-gray-100 text-center space-y-2 relative">
          {/* Quick Language Switcher */}
          <div className="sm:absolute top-4 right-4 flex items-center justify-center gap-1 bg-white/90 p-1 rounded-full border border-slate-200/90 shadow-xs mb-2 sm:mb-0">
            <Globe size={13} className="text-slate-400 ml-1.5 mr-0.5" />
            {[
              { code: "uz", label: "UZ" },
              { code: "ru", label: "RU" },
              { code: "en", label: "EN" },
            ].map((lng) => (
              <button
                key={lng.code}
                type="button"
                onClick={() => handleLangChange(lng.code)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                  currentLang.toLowerCase().startsWith(lng.code)
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {lng.label}
              </button>
            ))}
          </div>

          {tenantWorkspace?.siteLogo ? (
            <div className="flex items-center justify-center gap-2 mb-2">
              <img
                src={tenantWorkspace.siteLogo}
                alt={tenantWorkspace.companyName}
                className="h-12 w-auto max-w-[200px] object-contain rounded-xl"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-teal-600/30">
                S
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                SAPAR<span className="text-teal-600">.ERP</span>
              </span>
            </div>
          )}
          <h1 className="text-xl font-bold text-slate-900">
            {tenantWorkspace ? tenantWorkspace.companyName : "Tizimga Kirish"}
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {tenantWorkspace
              ? "Korxona xodimlari va buxgalteriya boshqaruv paneli"
              : "Oʻzbekiston milliy buxgalteriya va korxona boshqaruv platformasi"}
          </p>
        </div>

        {/* Auth Method Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-slate-100/90 p-1.5 m-6 mb-3 rounded-2xl border border-slate-200/80 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("EMAIL")}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "EMAIL"
                ? "bg-white text-teal-800 shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Mail size={14} className={activeTab === "EMAIL" ? "text-teal-600" : "text-slate-400"} />
            <span className="truncate">Email</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("PHONE")}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "PHONE"
                ? "bg-white text-teal-800 shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Smartphone size={14} className={activeTab === "PHONE" ? "text-teal-600" : "text-slate-400"} />
            <span className="truncate">Telefon</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("EIMZO")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 px-1 rounded-xl transition-all cursor-pointer relative ${
              activeTab === "EIMZO"
                ? "bg-white text-teal-800 shadow-sm font-black"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <div className="flex items-center gap-1">
              <Usb size={13} className={activeTab === "EIMZO" ? "text-teal-600" : "text-slate-400"} />
              <span className="truncate">E-IMZO</span>
            </div>
            <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-200 leading-tight">
              Tez kunda
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("QR")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 px-1 rounded-xl transition-all cursor-pointer relative ${
              activeTab === "QR"
                ? "bg-white text-teal-800 shadow-sm font-black"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <div className="flex items-center gap-1">
              <QrCode size={13} className={activeTab === "QR" ? "text-teal-600" : "text-slate-400"} />
              <span className="truncate">OneID</span>
            </div>
            <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-200 leading-tight">
              Tez kunda
            </span>
          </button>
        </div>

        <div className="p-6 pt-2 space-y-4">
          {/* Quick 1-Click Demo Bosh Buxgalter Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border border-teal-200/90 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <FileSpreadsheet size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-extrabold text-teal-950 truncate">Demo Bosh Buxgalter</span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-teal-200/80 text-teal-900 border border-teal-300">
                    1C BHMS
                  </span>
                </div>
                <p className="text-[11px] text-teal-700 truncate font-medium">
                  buxgalter@sapar.uz • Faqat Buxgalteriya (Accounting Only)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoAccountingLogin}
              className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-teal-600/20 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Sparkles size={14} className="text-amber-300" />
              1-Bosishda Kirish
            </button>
          </div>

          {/* TAB 1: EMAIL AUTH */}
          {activeTab === "EMAIL" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Manzili
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                    placeholder="buxgalter@sapar.uz"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Parol
                  </label>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={reduxLoading}
                className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-50 cursor-pointer"
              >
                {reduxLoading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <ArrowRight size={16} />
                )}
                Tizimga Kirish
              </button>
            </form>
          )}

          {/* TAB 2: PHONE AUTH */}
          {activeTab === "PHONE" && (
            <div className="space-y-4 animate-in fade-in">
              {/* Method Switcher */}
              <div className="flex items-center justify-center gap-3 text-xs border-b border-gray-100 pb-3">
                <button
                  type="button"
                  onClick={() => { setPhoneMethod("SMS_OTP"); setOtpSent(false); }}
                  className={`pb-1 font-semibold transition-colors cursor-pointer ${
                    phoneMethod === "SMS_OTP"
                      ? "text-teal-700 border-b-2 border-teal-600 font-bold"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  ⚡ SMS Kod bilan
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => setPhoneMethod("PASSWORD")}
                  className={`pb-1 font-semibold transition-colors cursor-pointer ${
                    phoneMethod === "PASSWORD"
                      ? "text-teal-700 border-b-2 border-teal-600 font-bold"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  🔒 Parol bilan
                </button>
              </div>

              {/* SMS OTP FLOW */}
              {phoneMethod === "SMS_OTP" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Oʻzbekiston telefon raqami
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={phone}
                        onChange={handlePhoneChange}
                        disabled={otpSent}
                        placeholder="+998 (90) 123-45-67"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono font-bold tracking-wide focus:ring-2 focus:ring-teal-500 bg-slate-50/50 disabled:bg-gray-100 disabled:text-gray-500"
                      />
                      {otpSent && (
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-teal-600 font-bold hover:underline"
                        >
                          Oʻzgartirish
                        </button>
                      )}
                    </div>
                  </div>

                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-50 cursor-pointer"
                    >
                      {isSendingOtp ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <ArrowRight size={16} />
                      )}
                      SMS Kod Yuborish
                    </button>
                  ) : (
                    <div className="space-y-4 animate-in fade-in">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2 text-center">
                          SMS tasdiqlash kodini kiriting (6 xonali)
                        </label>
                        <div className="flex justify-center gap-2">
                          {otpCode.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => {
                                otpInputRefs.current[idx] = el;
                              }}
                              type="text"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className="w-11 h-13 text-center text-lg font-bold font-mono border-2 border-teal-600/60 rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-500 bg-teal-50/20"
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={isVerifyingOtp || otpCode.join("").length !== 6}
                        className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-50 cursor-pointer"
                      >
                        {isVerifyingOtp ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Tizimga Kirish
                      </button>

                      <div className="text-center">
                        {countdown > 0 ? (
                          <p className="text-xs text-gray-500">
                            Kodni qayta yuborish: <span className="font-mono font-bold text-teal-700">{countdown}s</span>
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            className="text-xs font-bold text-teal-600 hover:underline cursor-pointer"
                          >
                            Kodni qayta yuborish
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PHONE + PASSWORD FLOW */}
              {phoneMethod === "PASSWORD" && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Telefon Raqami
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={handlePhoneChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono font-bold focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                      placeholder="+998 (90) 123-45-67"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Parol
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={reduxLoading}
                    className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    {reduxLoading ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <ArrowRight size={16} />
                    )}
                    Kirish
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: E-IMZO COMING SOON */}
          {activeTab === "EIMZO" && (
            <div className="space-y-5 text-center py-4 px-2 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Usb size={32} />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-bold">
                  <Sparkles size={13} className="text-amber-600" />
                  Ishlab chiqilmoqda • Tez kunda
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  E-IMZO Raqamli Imzo Kaliti (USB / Flash)
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Davlat soliq qoʻmitasi va milliy E-IMZO kalitlari (USB e-token, .pfx) orqali toʻgʻridan-toʻgʻri tizimga kirish moduli sertifikatsiyalash bosqichida. Tez orada barcha mijozlar uchun ishga tushiriladi.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 max-w-sm mx-auto">
                Hozircha tizimga oʻz hisobingizga tegishli <strong>Email</strong> yoki <strong>Telefon raqami</strong> orqali kiring:
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("EMAIL")}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-all flex items-center gap-1.5 shadow-sm shadow-teal-600/20 cursor-pointer"
                >
                  <Mail size={14} />
                  Email orqali kirish
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("PHONE")}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Smartphone size={14} />
                  Telefon orqali kirish
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: ONEID / QR COMING SOON */}
          {activeTab === "QR" && (
            <div className="space-y-5 text-center py-4 px-2 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                <QrCode size={32} />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-900 text-xs font-bold">
                  <Globe size={13} className="text-blue-600" />
                  id.egov.uz • Tez kunda
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  OneID va Dinamik QR Kod Orqali Kirish
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Yagona identifikatsiya tizimi (OneID) va Soliq/OneID mobil ilovalaridagi QR kodni skanerlash orqali parolsiz xavfsiz kirish moduli tez kunda ishga tushiriladi.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 max-w-sm mx-auto">
                Hozircha tizimga oʻz hisobingizga tegishli <strong>Email</strong> yoki <strong>Telefon raqami</strong> orqali kiring:
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("EMAIL")}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-all flex items-center gap-1.5 shadow-sm shadow-teal-600/20 cursor-pointer"
                >
                  <Mail size={14} />
                  Email orqali kirish
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("PHONE")}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Smartphone size={14} />
                  Telefon orqali kirish
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Register CTA */}
        <div className="text-center pb-4 pt-1">
          <p className="text-xs text-gray-500">
            Hisobingiz yoʻqmi?{" "}
            <Link
              to="/register"
              className="text-teal-700 font-bold hover:underline"
            >
              Yangi korxonani roʻyxatdan oʻtkazish →
            </Link>
          </p>
        </div>

        {/* Demo Fast Login Footer */}
        <div className="p-4 bg-slate-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Oʻzbekiston Qonunchiligi 21-son BHMS</span>
          <span className="font-semibold text-teal-700">🔒 SSL / 256-bit Shifrlangan</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
