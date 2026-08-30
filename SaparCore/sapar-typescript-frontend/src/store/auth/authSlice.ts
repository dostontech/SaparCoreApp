import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
import Constants from "../../constants/api";
import { isTokenExpired } from "../../utils/auth";

export interface AuthState {
    isAuthenticated: boolean;
    user: any;
    token: string | null;
    isLoading: boolean;
    error: string | null;
}

// initial state
const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: "",
    isLoading: false,
    error: null,
};

// --- LOGIN ASYNC ACTION ---
export const loginUser = createAsyncThunk(
    "auth/login",
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post(Constants.LOGIN_URL, {
                email: credentials.email,
                password: credentials.password,
            });

            const { token, user } = response.data;

            // Store in cookies (30 days expiry, Lax sameSite) and localStorage
            const cookieOpts = {
                secure: window.location.protocol === "https:",
                sameSite: "Lax" as const,
                expires: 30,
            };
            Cookies.set("authToken", token, cookieOpts);
            Cookies.set("authUser", JSON.stringify(user), cookieOpts);
            try {
                localStorage.setItem("authToken", token);
                localStorage.setItem("authUser", JSON.stringify(user));
            } catch (e) {
                console.warn("localStorage setItem failed", e);
            }

            return { token, user };
        } catch (error: any) {
            let errorMessage = "Login failed. Please try again.";
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data.message || error.response.statusText;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            return rejectWithValue(errorMessage);
        }
    }
);

// --- SLICE ---
export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.error = null;

            // Clear cookies & storage
            Cookies.remove("authToken");
            Cookies.remove("authUser");
            Cookies.remove("systemSettings");

            sessionStorage.removeItem("setupStatus");
            try {
                localStorage.removeItem("authToken");
                localStorage.removeItem("authUser");
            } catch {}
        },
        updateUser: (state, action: PayloadAction<Record<string, any>>) => {
            if (!state.user) return;
            state.user = { ...state.user, ...action.payload };
            const cookieOpts = {
                secure: window.location.protocol === "https:",
                sameSite: "Lax" as const,
                expires: 30,
            };
            Cookies.set("authUser", JSON.stringify(state.user), cookieOpts);
            try {
                localStorage.setItem("authUser", JSON.stringify(state.user));
            } catch {}
        },
        initializeAuth: (state) => {
            // Read from cookies with localStorage fallback
            const token = Cookies.get("authToken") || localStorage.getItem("authToken");
            const rawUser = Cookies.get("authUser") || localStorage.getItem("authUser");

            if (token && rawUser) {
                if (isTokenExpired(token)) {
                    state.isAuthenticated = false;
                    state.user = null;
                    state.token = "";
                    Cookies.remove("authToken");
                    Cookies.remove("authUser");
                    try {
                        localStorage.removeItem("authToken");
                        localStorage.removeItem("authUser");
                    } catch {}
                    return;
                }
                try {
                    state.token = token;
                    state.user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
                    state.isAuthenticated = true;
                } catch (e) {
                    console.error("Failed to parse user data", e);
                    state.isAuthenticated = false;
                    state.user = null;
                    state.token = "";
                }
            }
        },
        setAuthSuccess: (state, action: PayloadAction<{ token: string; user: any }>) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.error = null;

            const cookieOpts = {
                secure: window.location.protocol === "https:",
                sameSite: "Lax" as const,
                expires: 30,
            };
            Cookies.set("authToken", action.payload.token, cookieOpts);
            Cookies.set("authUser", JSON.stringify(action.payload.user), cookieOpts);
            try {
                localStorage.setItem("authToken", action.payload.token);
                localStorage.setItem("authUser", JSON.stringify(action.payload.user));
            } catch (e) {}
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ token: string; user: any }>) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = action.payload || "Login failed.";
            });
    },
});

// export actions
export const { logout, initializeAuth, updateUser, setAuthSuccess } = authSlice.actions;

// export reducer
export default authSlice.reducer;
