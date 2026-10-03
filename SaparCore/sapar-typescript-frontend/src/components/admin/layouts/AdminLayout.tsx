import React, { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import SaparHeader from './SaparHeader';
import SaparSidebar from '../sidebar/SaparSidebar';
import SuperAdminSidebar from '../sidebar/SuperAdminSidebar';
import AiChatFab from '../ai/AiChatFab';
import DemoBanner from '../DemoBanner';
import { PageHeaderProvider } from '../../../context/PageHeaderContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface AdminLayoutProps {
  children?: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  // Impersonation state — must be declared BEFORE showSuperAdminSidebar uses it
  const [impersonating, setImpersonating] = useState<{ companyName?: string; tenantId?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('sapar_impersonating');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Determine if viewing the SaaS platform administration panel
  const isSuperAdmin = user?.user_type === 1 || user?.email?.toLowerCase().includes('admin');
  const isSaasHubPath =
    pathname === '/admin' ||
    pathname === '/admin/' ||
    pathname.startsWith('/admin/saas') ||
    pathname === '/guide' ||
    pathname.startsWith('/admin/guide') ||
    pathname.startsWith('/admin/support') ||
    pathname === '/clients' ||
    pathname === '/plans' ||
    pathname === '/integrations' ||
    pathname === '/audit';
  const showSuperAdminSidebar = isSaasHubPath && isSuperAdmin && !impersonating;

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sapar_impersonating');
      setImpersonating(saved ? JSON.parse(saved) : null);
    } catch {
      setImpersonating(null);
    }
  }, [pathname]);

  const handleExitImpersonation = () => {
    try {
      localStorage.removeItem('sapar_impersonating');
    } catch {}
    setImpersonating(null);
    navigate('/admin');
  };

  // Sidebar state persisted in localStorage
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return false;
      const saved = localStorage.getItem('sapar_sidebar_open');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  const isSettingsPage = pathname.includes('/settings');
  const mainRef = useRef<HTMLElement>(null);

  // Toggle sidebar and persist preference
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      if (window.innerWidth >= 768) {
        try {
          localStorage.setItem('sapar_sidebar_open', String(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  // Scroll to top and auto-close drawer on mobile when navigating
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  // Only trigger resize changes when crossing the 768px breakpoint boundary
  useEffect(() => {
    let prevWidth = window.innerWidth;
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (prevWidth >= 768 && currentWidth < 768) {
        setIsSidebarOpen(false);
      } else if (prevWidth < 768 && currentWidth >= 768) {
        const saved = localStorage.getItem('sapar_sidebar_open');
        setIsSidebarOpen(saved !== null ? saved === 'true' : true);
      }
      prevWidth = currentWidth;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isPosTerminal = pathname === '/pos' || pathname === '/admin/pos';
  if (isPosTerminal) {
    return (
      <PageHeaderProvider>
        <div className="w-screen h-screen bg-slate-100 font-sans overflow-hidden flex flex-col">
          {children || <Outlet />}
        </div>
      </PageHeaderProvider>
    );
  }

  return (
    <PageHeaderProvider>
      <div className="flex h-screen bg-slate-50 font-sans print:block print:h-auto overflow-hidden">
        {/* Left: Full Height Sidebar (Full screen height from top to bottom) */}
        <div className="print:hidden h-full flex shrink-0">
          {showSuperAdminSidebar ? (
            <SuperAdminSidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              onToggle={toggleSidebar}
            />
          ) : (
            <SaparSidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              onToggle={toggleSidebar}
            />
          )}
        </div>

        {/* Right Area: Header + Impersonation Banner + Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Top: Header — logo hidden when full-height sidebar is open */}
          <div className="print:hidden shrink-0">
            <SaparHeader
              toggleSidebar={toggleSidebar}
              isSidebarOpen={isSidebarOpen}
              hideLogo={true}
              isSuperAdminMode={showSuperAdminSidebar}
            />
          </div>

          {/* Impersonation Banner: Visible only when a super-admin is viewing a tenant's workspace */}
          {impersonating && !isSaasHubPath && (
            <div className="print:hidden bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-md z-30 border-b border-amber-400/40 animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-2.5 text-xs font-semibold">
                <span className="p-1 rounded bg-black/25 text-white flex items-center justify-center">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-200" />
                </span>
                <span>
                  Siz hozir <strong className="underline underline-offset-2">«{impersonating.companyName || 'Mijoz Korxonasi'}»</strong> ishchi maydonidasiz (Super Admin Rejimi).
                </span>
              </div>
              <button
                onClick={handleExitImpersonation}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 hover:bg-slate-950 text-amber-300 hover:text-white rounded-lg transition-colors text-xs font-bold shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>👑 Super Admin Paneliga Qaytish</span>
              </button>
            </div>
          )}

          {/* Main Content */}
          <main
            ref={mainRef}
            className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-4 sm:p-5 print:overflow-visible"
          >
            {isSettingsPage && <DemoBanner />}
            {children || <Outlet />}
          </main>
        </div>

        {/* Floating co-pilot, only visible when AI is enabled */}
        <div className="print:hidden">
          <AiChatFab />
        </div>
      </div>
    </PageHeaderProvider>
  );
};

export default AdminLayout;