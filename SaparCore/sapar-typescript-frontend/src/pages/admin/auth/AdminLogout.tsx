import { logout } from "@store/auth/authSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const AdminLogout: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(logout());
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch {}
        navigate("/login", { replace: true });
    }, [dispatch, navigate]);

    return null;
};

export default AdminLogout;