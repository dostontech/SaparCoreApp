'use client';

import { useEffect } from 'react';

export default function LoginPage() {
  useEffect(() => {
    const targetUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
      : 'https://app.sapar.uz/login';
    window.location.replace(targetUrl);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0B2B33', color: '#fff', fontFamily: 'sans-serif' }}>
      <p>SAPAR ERP tizimiga yoʻnaltirilmoqda...</p>
    </div>
  );
}
