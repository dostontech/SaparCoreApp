import React, { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import IboxHeader from './IboxHeader';
import IboxSidebar from '../sidebar/IboxSidebar';
import AiChatFab from '../ai/AiChatFab';
import DemoBanner from '../DemoBanner';
import { PageHeaderProvider } from '../../../context/PageHeaderContext';

interface AdminLayoutProps {
  children?: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const { pathname } = useLocation();
  const isSettingsPage = pathname.includes('/settings');
  const mainRef = useRef<HTMLElement>(null);

  // Scroll the main content area back to the top on every route change.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  // On smaller screens, the sidebar should be closed by default.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <PageHeaderProvider>
      <div className="flex flex-col h-screen bg-slate-50 font-sans print:block print:h-auto overflow-hidden">
        {/* Top: 1-to-1 iBox Royal Blue Header */}
        <div className="print:hidden">
          <IboxHeader
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
        </div>

        {/* Bottom: Sidebar + Content */}
        <div className="flex-1 flex overflow-hidden">
          <div className="print:hidden">
            <IboxSidebar isOpen={isSidebarOpen} />
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