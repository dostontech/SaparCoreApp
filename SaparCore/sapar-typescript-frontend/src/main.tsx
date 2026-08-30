/**
 * ==============================================================================================
 * SAPAR ENTERPRISE RESOURCE PLANNING (ERP) — FRONTEND WEB APPLICATION
 * ----------------------------------------------------------------------------------------------
 * Copyright (c) 2026 SAPAR ERP Technologies. All Rights Reserved.
 * Built for the Republic of Uzbekistan & Central Asia.
 *
 * PROPRIETARY & CONFIDENTIAL.
 * Protected under the Intellectual Property Laws of the Republic of Uzbekistan (Law No. ZRU-42).
 * President Tech Award 2026 Candidate: Best Enterprise Software / Digital Transformation
 * Official Website: https://sapar.uz
 * ==============================================================================================
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import Cookies from 'js-cookie';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { initializeAuth, logout } from './store/auth/authSlice';
import { isTokenExpired } from './utils/auth';
import { store } from './store';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Console Watermark & Security Notice
if (typeof window !== 'undefined') {
  console.log(
    `%c SAPAR ERP %c v2.9.0 | Built for the Republic of Uzbekistan %c\n` +
    `%c Copyright © 2026 SAPAR ERP Technologies. All Rights Reserved.\n` +
    ` Protected under Uzbekistan IP Law (ZRU-42). https://sapar.uz `,
    'background:#028090;color:#ffffff;font-size:14px;font-weight:bold;padding:4px 8px;border-radius:4px 0 0 4px;',
    'background:#0B2B33;color:#02C39A;font-size:14px;font-weight:bold;padding:4px 8px;border-radius:0 4px 4px 0;',
    '',
    'color:#64748B;font-size:11px;font-style:italic;'
  );
}

store.dispatch(initializeAuth());

// Request interceptor: automatically attach Authorization header when token is present
axios.interceptors.request.use((config) => {
  const token = Cookies.get('authToken') || localStorage.getItem('authToken');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handler: only log out if an authenticated call is rejected and token is expired
const LOGIN_PATH = '/admin/login';
const NO_REDIRECT_PATHS = [LOGIN_PATH, '/setup', '/register', '/login'];

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = Cookies.get('authToken') || localStorage.getItem('authToken');
    if (
      error?.response?.status === 401 &&
      token &&
      isTokenExpired(token) &&
      !NO_REDIRECT_PATHS.some((p) => window.location.pathname.startsWith(p))
    ) {
      store.dispatch(logout());
      window.location.assign(LOGIN_PATH);
    }
    return Promise.reject(error);
  }
);

// Proactive expiry watchdog: only logs out if the token is truly expired
const checkTokenExpiry = () => {
  const token = Cookies.get('authToken') || localStorage.getItem('authToken');
  if (token && isTokenExpired(token) && !NO_REDIRECT_PATHS.some((p) => window.location.pathname.startsWith(p))) {
    store.dispatch(logout());
    window.location.assign(LOGIN_PATH);
  }
};
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    checkTokenExpiry();
  }
});
setInterval(checkTokenExpiry, 60_000);

const queryClient = new QueryClient();
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <HelmetProvider>
            <QueryClientProvider client={queryClient}>
              <I18nextProvider i18n={i18n}>
                <App />
              </I18nextProvider>
            </QueryClientProvider>
          </HelmetProvider>
        </LocalizationProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
