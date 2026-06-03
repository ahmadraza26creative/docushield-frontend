import React, { useEffect, useRef, useState } from 'react';
import { Bell, LogOut, Menu, Search, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../ui/Badge';
import { ThemeToggle } from '../ui/ThemeToggle';

export const Navbar = ({ onMenuToggle }) => {
  const { user, logout, pendingShares, pendingShareCount } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleVariant = (role) => {
    if (role === 'admin') return 'admin';
    if (role === 'editor') return 'editor';
    return 'viewer';
  };

  const notifications = (pendingShares || []).map((invite) => ({
    id: invite.id,
    title: invite.title,
    detail: `Shared by ${invite.shared_by_email || invite.owner_email}`,
    time: invite.created_at ? new Date(invite.created_at).toLocaleString() : 'Just now'
  }));

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md dark:border-[#2a2f3a] dark:bg-[#12151b]/90 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-[#171a21] dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
          onClick={onMenuToggle}
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>

        <div className="relative hidden w-full max-w-sm sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search documents, shares, alerts..."
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:bg-white dark:border-slate-700 dark:bg-[#171a21] dark:text-slate-100 dark:focus:border-slate-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:border-slate-700 dark:bg-[#171a21] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Open notifications"
          >
            <Bell size={16} />
            {pendingShareCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {pendingShareCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-[#2a2f3a] dark:bg-[#171a21]">
              <div className="border-b border-slate-200 px-4 py-3 dark:border-[#2a2f3a]">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Notifications</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{notifications.length} pending item{notifications.length === 1 ? '' : 's'}</p>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length > 0 ? notifications.map((item) => (
                  <div key={item.id} className="border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/45">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{item.time}</p>
                  </div>
                )) : (
                  <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No pending notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-[#171a21] dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-[11px] font-bold text-white dark:bg-white dark:text-slate-950">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="hidden max-w-32 truncate text-sm font-medium sm:block">{user?.full_name || user?.email}</span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-[#2a2f3a] dark:bg-[#171a21]">
              <div className="px-3 py-2">
                <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{user?.full_name || 'DocuShield User'}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                <div className="mt-2">
                  <Badge variant={getRoleVariant(user?.role)}>{user?.role}</Badge>
                </div>
              </div>
              <button
                onClick={logout}
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
