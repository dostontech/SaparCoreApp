import React from "react";
import { LogOut, Settings, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "@store/auth/authSlice";
import type { AppDispatch } from "@store/index";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

interface BottomBarProps {
    isSidebarOpen?: boolean;
}

const BottomBar: React.FC<BottomBarProps> = ({ isSidebarOpen = true }) => {
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();
    const { t } = useTranslation();

    return (
        <div className="px-3 py-2 bg-slate-50/90 border-t border-slate-200/80">
            <div className={`flex items-center ${isSidebarOpen ? "justify-between" : "justify-center flex-col gap-1.5"}`}>
                <button
                    type="button"
                    onClick={() => navigate("/admin/settings/profile")}
                    title={t("nav.profileSettings", "Profil sozlamalari")}
                    className="p-2 rounded-xl text-slate-600 hover:text-teal-800 hover:bg-teal-50 transition-all cursor-pointer"
                >
                    <UserCircle2 size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => navigate("/admin/settings/company-settings")}
                    title={t("nav.companySettings", "Korxona rekvizitlari")}
                    className="p-2 rounded-xl text-slate-600 hover:text-teal-800 hover:bg-teal-50 transition-all cursor-pointer"
                >
                    <Settings size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => dispatch(logout())}
                    title={t("nav.logout", "Chiqish")}
                    className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-all cursor-pointer"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </div>
    );
};

export default BottomBar;
