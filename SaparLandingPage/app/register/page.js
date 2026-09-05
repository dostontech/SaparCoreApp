'use client';

import { useEffect } from 'react';

export default function RegisterPage() {
  useEffect(() => {
    const targetUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/register`
      : 'https://app.sapar.uz/register';
    window.location.replace(targetUrl);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0B2B33', color: '#fff', fontFamily: 'sans-serif' }}>
      <p>SAPAR ERP roʻyxatdan oʻtish sahifasiga yoʻnaltirilmoqda...</p>
    </div>
  );
}
