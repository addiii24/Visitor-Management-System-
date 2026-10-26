import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield, User, LayoutDashboard, UserPlus, ClipboardList,
  LogOut, Bell, Menu, X, ChevronDown, Settings, FileText,
  CheckSquare, BarChart2, BookOpen, Clock, Building2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCompanySettings } from '../services/storage';

function NavItem({ to, icon: Icon, label, onClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(to + '/');
  const handleClick = () => { if (to) navigate(to); if (onClick) onClick(); };
  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
        active
          ? 'bg-white/20 text-white shadow-sm'
          : 'text-blue-100 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

const ROLE_NAV = {
  guard: [
    { to: '/guard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/guard/register', icon: UserPlus, label: 'Register Visitor' },
    { to: '/guard/visitors', icon: ClipboardList, label: 'Visitor List' },
    { to: '/guard/checkin', icon: CheckSquare, label: 'Check In / Out' },
  ],
  planthead: [
    { to: '/planthead', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/planthead/requests', icon: ClipboardList, label: 'Pending Requests' },
    { to: '/planthead/approved', icon: CheckSquare, label: 'Approved' },
    { to: '/planthead/all', icon: FileText, label: 'All Requests' },
  ],
  admin: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/visitors', icon: ClipboardList, label: 'Visitor Records' },
    { to: '/admin/reports', icon: BarChart2, label: 'Reports' },
    { to: '/admin/audit', icon: BookOpen, label: 'Audit Logs' },
    { to: '/admin/settings', icon: Settings, label: 'Company Settings' },
  ],
};

const ROLE_ICONS = { guard: Shield, planthead: Building2, admin: User };

export default function Layout({ children }) {
  const { currentUser, notifications, unreadCount, logout, readAllNotifications } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const settings = getCompanySettings();
  const navItems = ROLE_NAV[currentUser?.role] || [];
  const RoleIcon = ROLE_ICONS[currentUser?.role] || User;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function handleNotifOpen() {
    setNotifOpen(!notifOpen);
    if (!notifOpen) readAllNotifications();
    setProfileOpen(false);
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#1e3a5f] flex flex-col transition-transform duration-300
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo & Company */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">ABC</span>
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm leading-tight truncate">{settings.companyName}</p>
              <p className="text-blue-300 text-xs truncate">{settings.plantName}</p>
            </div>
          </div>
          <div className="mt-3 px-1">
            <p className="text-blue-200 text-xs font-medium tracking-wide uppercase">{settings.appName}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} onClick={() => setSidebarOpen(false)} />
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <RoleIcon className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">{currentUser?.name}</p>
              <p className="text-blue-300 text-xs truncate">{currentUser?.roleLabel}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-2 px-3 py-2 text-sm text-red-300 hover:text-white hover:bg-red-600/30 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-800 hidden sm:block">{settings.gateName}</p>
              <p className="text-xs text-slate-500 hidden sm:block">{settings.companyAddress}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Clock */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-600 font-medium" id="live-clock">
                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={handleNotifOpen}
                className="relative p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-slate-200">
                    <p className="text-sm font-semibold text-slate-800">Notifications</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-8">No notifications</p>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div key={n.id} className={`px-4 py-3 border-b border-slate-100 last:border-0 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                          <p className="text-sm font-medium text-slate-800">{n.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 bg-[#1e3a5f] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-slate-800 leading-tight">{currentUser?.name}</p>
                  <p className="text-xs text-slate-500">{currentUser?.roleLabel}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-slate-200">
                    <p className="text-sm font-medium text-slate-800">{currentUser?.name}</p>
                    <p className="text-xs text-slate-500">{currentUser?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
