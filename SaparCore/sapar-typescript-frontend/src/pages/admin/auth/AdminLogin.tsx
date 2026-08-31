import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
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
} from "lucide-react";

import { loginUser, setAuthSuccess } from "../../../store/auth/authSlice";
import { fetchSystemSettings } from "@store/systemSettingsSlice";
import type { RootState, AppDispatch } from "../../../store";
import Constants from "@constants/api";
import { EimzoClient, type EimzoCertificate } from "@/services/EimzoClient";
import { resolveLandingPath } from "@utils/roleLanding";

type AuthTab = "PHONE" | "EIMZO" | "QR";
type PhoneMethod = "SMS_OTP" | "PASSWORD" | "EMAIL";

const DEMO_EMAIL = "buxgalter@sapar.uz";
const DEMO_PASSWORD = "password123";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { isAuthenticated, user, isLoading: reduxLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const { data: systemSettings } = useSelector((state: RootState) => state.systemSettings);

  const [activeTab, setActiveTab] = useState<AuthTab>("PHONE");
  const [phoneMethod, setPhoneMethod] = useState<PhoneMethod>("EMAIL");

  // Phone / Email States
  const [phone, setPhone] = useState<string>("+998 ");
  const [email, setEmail] = useState<string>(DEMO_EMAIL);
  const [password, setPassword] = useState<string>(DEMO_PASSWORD);
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

  // QR Code States
  const [qrSession, setQrSession] = useState<{ sessionId: string; token: string; qrPayload: string } | null>(null);
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
        .get(`${Constants.API_URL}/public/tenant/resolve?slug=${slug}`)
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
      const path =
        user?.user_type === 1
          ? "/admin/dashboard"
          : resolveLandingPath(systemSettings?.defaultRoute, systemSettings?.permissions);
      navigate(path);
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
    if (phoneMethod === "EMAIL") {
      const resultAction = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(resultAction)) {
        const { token, user: loggedInUser } = resultAction.payload;
        completeLogin(token, loggedInUser);
      } else {
        toast.error("Email yoki parol notoʻgʻri.");
      }
    } else {
      try {
        const resp = await axios.post(Constants.AUTH_PHONE_LOGIN_URL, { phone, password });
        completeLogin(resp.data.token, resp.data.user);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Telefon raqami yoki parol notoʻgʻri.");
      }
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

  // 6. Dynamic QR Session & Polling
  const initQrSession = async () => {
    stopQrPolling();
    try {
      setIsCreatingQr(true);
      const resp = await axios.post(Constants.AUTH_QR_SESSION_URL);
      setQrSession(resp.data);
      setQrStatus("PENDING");

      // Start long-polling
      qrPollTimer.current = setInterval(async () => {
        try {
          const statusResp = await axios.get(`${Constants.AUTH_QR_STATUS_URL}/${resp.data.sessionId}`);
          if (statusResp.data?.status === "APPROVED" && statusResp.data.authToken) {
            stopQrPolling();
            setQrStatus("APPROVED");
            toast.success("Mobil ilovada kirish tasdiqlandi!");
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
      toast.error("QR sessiyasini yaratishda xatolik");
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
    let settings = systemSettings;
    const settingsAction = await dispatch(fetchSystemSettings(token));
    if (fetchSystemSettings.fulfilled.match(settingsAction)) {
      settings = settingsAction.payload;
    }

    const path =
      loggedInUser?.user_type === 1
        ? "/admin/dashboard"
        : resolveLandingPath(settings?.defaultRoute, settings?.permissions);
    navigate(path);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4 py-8 relative overflow-hidden">
      {/* Background Glow Decorations */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Branding */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-teal-50/70 to-white border-b border-gray-100 text-center space-y-2">
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
        <div className="grid grid-cols-3 bg-slate-100/80 p-1.5 m-6 mb-4 rounded-2xl border border-slate-200/80 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("PHONE")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all ${
              activeTab === "PHONE"
                ? "bg-white text-teal-800 shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Smartphone size={15} className={activeTab === "PHONE" ? "text-teal-600" : ""} />
            Telefon
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("EIMZO")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all ${
              activeTab === "EIMZO"
                ? "bg-white text-teal-800 shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Usb size={15} className={activeTab === "EIMZO" ? "text-teal-600" : ""} />
            E-IMZO (USB)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("QR")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all ${
              activeTab === "QR"
                ? "bg-white text-teal-800 shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <QrCode size={15} className={activeTab === "QR" ? "text-teal-600" : ""} />
            Mobil QR
          </button>
        </div>

        <div className="p-6 pt-2 space-y-5">
          {/* TAB 1: PHONE / EMAIL AUTH */}
          {activeTab === "PHONE" && (
            <div className="space-y-4">
              {/* Method Switcher */}
              <div className="flex items-center justify-center gap-3 text-xs border-b border-gray-100 pb-3">
                <button
                  type="button"
                  onClick={() => { setPhoneMethod("SMS_OTP"); setOtpSent(false); }}
                  className={`pb-1 font-semibold transition-colors ${
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
                  className={`pb-1 font-semibold transition-colors ${
                    phoneMethod === "PASSWORD"
                      ? "text-teal-700 border-b-2 border-teal-600 font-bold"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  🔒 Parol bilan
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => setPhoneMethod("EMAIL")}
                  className={`pb-1 font-semibold transition-colors ${
                    phoneMethod === "EMAIL"
                      ? "text-teal-700 border-b-2 border-teal-600 font-bold"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  ✉️ Email bilan
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
                      className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-50"
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
                        className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-50"
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
                            className="text-xs font-bold text-teal-600 hover:underline"
                          >
                            Kodni qayta yuborish
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PASSWORD / EMAIL FLOW */}
              {(phoneMethod === "PASSWORD" || phoneMethod === "EMAIL") && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  {phoneMethod === "EMAIL" ? (
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
                  ) : (
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
                  )}

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
                    className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-50"
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

          {/* TAB 2: E-IMZO (USB FLASH / E-TOKEN) */}
          {activeTab === "EIMZO" && (
            <div className="space-y-4">
              <div className="bg-teal-50/80 border border-teal-200 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-teal-900">
                <ShieldCheck size={18} className="text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block mb-0.5">E-IMZO Raqamli Imzo Kaliti (USB / Flash):</strong>
                  Kompyuteringizga ulangan USB e-Kalit yoki .pfx faylini tanlang va 1 bosishda xavfsiz tizimga kiring.
                </div>
              </div>

              {isLoadingCerts ? (
                <div className="py-8 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
                  <RefreshCw size={20} className="animate-spin text-teal-600" />
                  E-IMZO kalitlari qidirilmoqda…
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-gray-700">
                        Topilgan Sertifikatlar ({certificates.length})
                      </label>
                      <button
                        type="button"
                        onClick={loadCertificates}
                        className="text-[11px] text-teal-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <RefreshCw size={11} /> Yangilash
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {certificates.map((cert) => {
                        const isSelected = selectedCert?.serialNumber === cert.serialNumber;
                        return (
                          <div
                            key={cert.serialNumber}
                            onClick={() => setSelectedCert(cert)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? "bg-teal-50 border-teal-600 ring-2 ring-teal-500/20"
                                : "bg-white border-gray-200 hover:border-teal-300"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-slate-900 block line-clamp-1">
                                  {cert.commonName}
                                </span>
                                {cert.organization && (
                                  <span className="text-[11px] text-teal-800 font-semibold block flex items-center gap-1">
                                    <Building2 size={11} /> {cert.organization}
                                  </span>
                                )}
                                <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
                                  <span>STIR: <strong>{cert.tin}</strong></span>
                                  {cert.pinfl && <span>JShShIR: <strong>{cert.pinfl}</strong></span>}
                                </div>
                              </div>
                              <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-100 text-teal-800">
                                {cert.type === "USB_TOKEN" ? "USB Kalit" : ".PFX Flash"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Kalit Paroli (Ixtiyoriy)
                    </label>
                    <input
                      type="password"
                      value={certPin}
                      onChange={(e) => setCertPin(e.target.value)}
                      placeholder="e-Kalit PIN-kodi (agar oʻrnatilgan boʻlsa)"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleEimzoLogin}
                    disabled={isSigningEimzo || !selectedCert}
                    className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-50"
                  >
                    {isSigningEimzo ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <KeyRound size={16} />
                    )}
                    E-IMZO Bilan Kirish
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DYNAMIC QR CODE AUTH */}
          {activeTab === "QR" && (
            <div className="space-y-4 text-center">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-900">
                  E-IMZO Mobil Ilova Orqali Kirish
                </h3>
                <p className="text-xs text-gray-500">
                  Telefoningizdagi <strong>E-IMZO</strong> yoki <strong>Soliq</strong> ilovasini ochib, QR-kodni skanerlang
                </p>
              </div>

              <div className="flex justify-center p-4 bg-slate-50 rounded-2xl border border-gray-200 w-fit mx-auto shadow-inner relative">
                {isCreatingQr ? (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <RefreshCw size={24} className="animate-spin text-teal-600" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Visual QR Code Generator Simulation */}
                    <div className="w-48 h-48 bg-white p-2 rounded-xl border border-gray-200 flex flex-col items-center justify-center shadow-xs">
                      <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-slate-900 rounded-lg">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-xs transition-opacity duration-700 ${
                              (i % 2 === 0 || i % 5 === 0) ? "bg-teal-400" : "bg-white"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono block">
                      Sessiya: {qrSession?.sessionId.slice(0, 8)}...
                    </span>
                  </div>
                )}
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                {qrStatus === "PENDING" && <RefreshCw size={13} className="animate-spin text-teal-600" />}
                {qrStatus === "APPROVED" && <CheckCircle2 size={13} className="text-emerald-600" />}
                {qrStatus === "PENDING" && "Mobil ilovada tasdiqlash kutilmoqda…"}
                {qrStatus === "APPROVED" && "Kirish tasdiqlandi!"}
                {qrStatus === "EXPIRED" && "Sessiya muddati tugadi. Yangilang."}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSimulateMobileApproval}
                  className="text-xs text-teal-600 font-bold hover:underline bg-teal-50/80 px-3 py-1 rounded-lg border border-teal-100"
                >
                  ⚡ Telefon tasdiqlashini sinash (Desktop test)
                </button>
              </div>
            </div>
          )}
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
