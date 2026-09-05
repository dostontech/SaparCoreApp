'use client';

import { useEffect } from 'react';

export default function AdminPage() {
  useEffect(() => {
    const targetUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard`
      : 'https://app.sapar.uz/admin/dashboard';
    window.location.replace(targetUrl);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0B2B33', color: '#fff', fontFamily: 'sans-serif' }}>
      <p>SAPAR ERP boshqaruv paneliga yoʻnaltirilmoqda...</p>
    </div>
  );
}
