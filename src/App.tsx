/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navigate, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { NGOStoreProvider, useNGOStore } from './store';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import BoxManagement from './components/BoxManagement';
import CollectorManagement from './components/CollectorManagement';
import CollectionRecords from './components/CollectionRecords';
import ReportsModule from './components/ReportsModule';
import RegulatoryList from './components/RegulatoryList';
import CollectorView from './components/CollectorView';
import PWAPrompt from './components/PWAPrompt';
import { Bell, LogOut, Menu, X, UserCheck, LayoutDashboard, Box, History, ClipboardList, Sun, Moon } from 'lucide-react';

function AdminLayout() {
  const { logout, notifications, markNotificationRead, markAllNotificationsRead, theme, toggleTheme } = useNGOStore();
  const location = useLocation();
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadNotifs = notifications.filter((n) => !n.read);

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/boxes', label: 'Add Donor', icon: Box },
    { to: '/admin/collectors', label: 'Collector', icon: UserCheck },
    { to: '/admin/records', label: 'Report and ledger', icon: History },
    { to: '/admin/compliance', label: 'Complain and new box issue', icon: ClipboardList },
  ] as const;

  return (
    <div className={`min-h-screen transition-colors duration-200 flex flex-col font-sans selection:bg-sky-100 dark:selection:bg-sky-950 select-none ${theme === 'dark' ? 'dark bg-black text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>
      <div className="flex-grow flex flex-col md:flex-row relative z-10">
        {isAdminMenuOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-45 md:hidden" onClick={() => setIsAdminMenuOpen(false)} />}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#121826] text-slate-700 dark:text-zinc-300 border-r border-slate-200 dark:border-slate-800 shrink-0 flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${isAdminMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div>
            <div className="p-6 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center text-white shadow-md font-bold">
                  <Box className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-slate-800 dark:text-zinc-100 tracking-tight leading-none font-sans">Al-Najaat</h3>
                  <span className="text-[10px] font-mono tracking-wider text-sky-600 dark:text-sky-400 font-semibold mt-1 block uppercase font-bold">Social Care Foundation</span>
                </div>
              </div>
              <button onClick={() => setIsAdminMenuOpen(false)} className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-400 dark:text-zinc-500 md:hidden cursor-pointer" title="Close Navigation">
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <NavLink key={item.to} to={item.to} onClick={() => setIsAdminMenuOpen(false)} className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wide text-left transition-all cursor-pointer ${isActive ? 'bg-sky-50 dark:bg-sky-950/45 text-sky-700 dark:text-sky-400 font-bold shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-zinc-200'}`}>
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-sky-600' : 'text-slate-400 dark:text-zinc-500'}`} />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#111622] flex items-center justify-between text-xs text-slate-500 dark:text-zinc-450">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 font-semibold text-slate-700 dark:text-zinc-200 flex items-center justify-center text-[10px] font-mono border border-slate-300/40 dark:border-slate-700/60">AD</div>
              <div>
                <span className="block text-slate-800 dark:text-zinc-100 font-bold text-xs leading-none">Amna Khan</span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono block mt-0.5">head@ecogrowth.org</span>
              </div>
            </div>
            <button onClick={logout} className="p-1 px-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-zinc-450 hover:text-rose-600 dark:hover:text-rose-500 rounded-md transition cursor-pointer" title="Sign Out Session">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>
        <div className="flex-grow flex flex-col overflow-hidden">
          <header className="p-4 bg-white dark:bg-[#121826] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between relative z-40 transition-colors duration-200">
            <div className="flex items-center gap-2">
              <button onClick={() => setIsAdminMenuOpen(true)} className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-zinc-400 md:hidden cursor-pointer" title="Open Navigation">
                <Menu className="w-4.5 h-4.5" />
              </button>
              <span className="text-xs bg-slate-50 dark:bg-slate-800 uppercase font-mono border border-slate-200 dark:border-slate-705 py-1 px-2.5 rounded-lg text-slate-500 dark:text-zinc-400 font-bold hidden sm:inline-block">NGO Node Status: Operational</span>
            </div>
            <div className="flex items-center gap-3 relative">
              <button onClick={toggleTheme} className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-700 dark:hover:text-sky-400 hover:border-sky-500 dark:hover:border-sky-500 transition text-slate-500 dark:text-zinc-400 select-none cursor-pointer" title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5 text-slate-650" />}
              </button>
              <div className="relative">
                <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-700 dark:hover:text-sky-400 hover:border-sky-500 dark:hover:border-sky-550 transition text-slate-500 dark:text-zinc-400 select-none cursor-pointer" title="System Notifications">
                  <Bell className="w-4.5 h-4.5" />
                  {unreadNotifs.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#121826]"></span>}
                </button>
                {isNotifOpen && (
                  <div className="absolute right-0 mt-3 w-85 bg-white dark:bg-[#0F172A] border border-zinc-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                      <span className="font-extrabold text-xs tracking-wider uppercase text-slate-700 dark:text-zinc-200">Alert Center</span>
                      {unreadNotifs.length > 0 && <button onClick={markAllNotificationsRead} className="text-[10px] text-sky-655 dark:text-sky-400 hover:underline font-bold transition-all cursor-pointer">Mark all read</button>}
                    </div>
                    <div className="divide-y divide-zinc-100 dark:divide-slate-800/80 max-h-[340px] overflow-y-auto">
                      {notifications.map((notif) => (
                        <div key={notif.id} onClick={() => markNotificationRead(notif.id)} className="p-4 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/25 cursor-pointer transition-colors">
                          <div className="flex items-start justify-between">
                            <span className="font-bold text-slate-850 dark:text-zinc-150">{notif.title}</span>
                            <span className="text-[9px] text-zinc-450 dark:text-zinc-500 font-mono font-bold">{notif.time}</span>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-405 leading-relaxed font-semibold">{notif.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
          <main className="p-6 md:p-8 flex-grow overflow-y-auto max-h-[calc(100vh-140px)]">
            <Outlet />
          </main>
        </div>
      </div>
      <PWAPrompt />
    </div>
  );
}

function NGOAppContent() {
  const { role, isLoggedIn } = useNGOStore();
  const location = useLocation();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (role === 'Collector') {
    if (!location.pathname.startsWith('/collector')) return <Navigate to="/collector" replace />;
    return (
      <>
        <CollectorView />
        <PWAPrompt />
      </>
    );
  }
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="boxes" element={<BoxManagement />} />
        <Route path="collectors" element={<CollectorManagement />} />
        <Route path="collections" element={<CollectionRecords />} />
        <Route path="reports" element={<ReportsModule defaultTab="report" />} />
        <Route path="records" element={<ReportsModule defaultTab="ledger" />} />
        <Route path="compliance" element={<RegulatoryList />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

function AppRoutes() {
  const { isLoggedIn, role } = useNGOStore();
  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to={role === 'Collector' ? '/collector' : '/admin/dashboard'} replace /> : <LoginPage />} />
      <Route path="/collector" element={isLoggedIn && role === 'Collector' ? <><CollectorView /><PWAPrompt /></> : <Navigate to="/login" replace />} />
      <Route path="/*" element={<NGOAppContent />} />
    </Routes>
  );
}

export default function App() {
  return (
    <NGOStoreProvider>
      <AppRoutes />
    </NGOStoreProvider>
  );
}
