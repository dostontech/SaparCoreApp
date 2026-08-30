import { Route, Routes } from "react-router-dom";
import AdminRoute from "./AdminRoute";
import AdminLogin from "@pages/admin/auth/AdminLogin";
import AdminRegister from "@pages/admin/auth/AdminRegister";
import SetupOrganizationInfo from "@pages/admin/auth/SetupOrganizationInfo";
import SsoLanding from "@pages/admin/auth/SsoLanding";
import PublicInvoiceViewer from "@pages/public/PublicInvoiceViewer";
import PublicQuotationViewer from "@pages/public/PublicQuotationViewer";
import PublicDocumentSigner from "@pages/public/PublicDocumentSigner";
import OnboardingWizardPage from "@pages/admin/onboarding/OnboardingWizardPage";
import SaparLandingPage from "@pages/public/SaparLandingPage";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/landing" element={<SaparLandingPage />} />
            <Route path="/home" element={<SaparLandingPage />} />
            <Route path="/onboarding" element={<OnboardingWizardPage />} />
            <Route path="/register" element={<AdminRegister />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/w/:tenantSlug" element={<AdminLogin />} />
            <Route path="/w/:tenantSlug/login" element={<AdminLogin />} />
            <Route path="/setup" element={<SetupOrganizationInfo />} />
            <Route path="/sso" element={<SsoLanding />} />
            <Route path="/invoice/:token" element={<PublicInvoiceViewer />} />
            <Route path="/quotation/:token" element={<PublicQuotationViewer />} />
            <Route path="/public/sign-document/:id" element={<PublicDocumentSigner />} />
            <Route path="/public/verify-document/:id" element={<PublicDocumentSigner />} />
            <Route
                path="/documentation"
                element={
                    <iframe
                        src="/documentation/index.html"
                        style={{ width: "100%", height: "100vh", border: "none" }}
                        title="Documentation"
                    />
                }
            />
            <Route
                path="/documentation/mobile"
                element={
                    <iframe
                        src="/documentation/mobile/index.html"
                        style={{ width: "100%", height: "100vh", border: "none" }}
                        title="Mobile Documentation"
                    />
                }
            />
            <Route
                path="/landing"
                element={
                    <iframe
                        src="/landing/index.html"
                        style={{ width: "100%", height: "100vh", border: "none" }}
                        title="Landing"
                    />
                }
            />
            <Route path="/admin/*" element={<AdminRoute />} />
            <Route path="/*" element={<AdminRoute />} />
        </Routes>
    );
};

export default AppRoutes;
