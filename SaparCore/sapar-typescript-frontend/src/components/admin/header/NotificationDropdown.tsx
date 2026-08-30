import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  FileCheck2,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  path: string;
  read: boolean;
}

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'E-Faktura imzolandi',
      message: '№ INV-2025-001 hisob-faktura mijoz tomonidan E-IMZO bilan tasdiqlandi.',
      time: '10 daqiqa oldin',
      type: 'success',
      path: '/admin/e-documents',
      read: false,
    },
    {
      id: '2',
      title: 'Kam qolgan tovarlar',
      message: 'Omborda "Premium Coffee Beans" qoldigʻi minimal chegaradan kamaydi.',
      time: '1 soat oldin',
      type: 'warning',
      path: '/admin/inventory',
      read: false,
    },
    {
      id: '3',
      title: 'Yangi xarid buyurtmasi',
      message: 'Yetkazib beruvchiga № PO-2025-042 buyurtma muvaffaqiyatli joʻnatildi.',
      time: '3 soat oldin',
      type: 'info',
      path: '/admin/purchase-orders',
      read: true,
    },
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSelect = (notif: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setIsOpen(false);
    navigate(notif.path);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 transition border border-slate-200/80 shadow-2xs cursor-pointer"
        title="Bildirishnomalar"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150 z-50">
          <div className="px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Bildirishnomalar
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-full border border-rose-200">
                  {unreadCount} yangi
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold cursor-pointer"
              >
                Barchasini oʻqilgan qilish
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Bell className="w-6 h-6 mx-auto mb-1 opacity-40" />
                <p className="text-xs">Hozircha yangi bildirishnomalar yoʻq</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleSelect(n)}
                  className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3 ${
                    !n.read ? 'bg-teal-50/30' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {n.type === 'success' && (
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                    )}
                    {n.type === 'warning' && (
                      <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    )}
                    {n.type === 'info' && (
                      <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-200">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold truncate ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> {n.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 bg-slate-50/50 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/admin/activity-log');
              }}
              className="w-full py-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Barcha harakatlar jurnali</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
