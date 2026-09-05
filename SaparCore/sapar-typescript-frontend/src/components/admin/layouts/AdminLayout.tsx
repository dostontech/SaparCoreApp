import React, { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SaparHeader from './SaparHeader';
import SaparSidebar from '../sidebar/SaparSidebar';
import AiChatFab from '../ai/AiChatFab';
import DemoBanner from '../DemoBanner';
import { PageHeaderProvider } from '../../../context/PageHeaderContext';

interface AdminLayoutProps {
  children?: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  // Sidebar state persisted in localStorage
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return false;
      const saved = localStorage.getItem('sapar_sidebar_open');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  const { pathname } = useLocation();
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

  return (
    <PageHeaderProvider>
      <div className="flex flex-col h-screen bg-slate-50 font-sans print:block print:h-auto overflow-hidden">
        {/* Top: 1-to-1 Sapar Royal Blue Header */}
        <div className="print:hidden">
          <SaparHeader
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
          />
        </div>

        {/* Bottom: Sidebar + Content */}
        <div className="flex-1 flex overflow-hidden">
          <div className="print:hidden">
            <SaparSidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              onToggle={toggleSidebar}
            />
          </div>
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