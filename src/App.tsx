/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NGOStoreProvider, useNGOStore } from './store';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import BoxManagement from './components/BoxManagement';
import QRManager from './components/QRManager';
import CollectorManagement from './components/CollectorManagement';
import CollectionRecords from './components/CollectionRecords';
import ReportsModule from './components/ReportsModule';
import RegulatoryList from './components/RegulatoryList';
import CollectorView from './components/CollectorView';
import PWAPrompt from './components/PWAPrompt';
import {
  Bell,
  LogOut,
  MapPin,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  UserCheck,
  LayoutDashboard,
  Box,
  QrCode,
  Users,
  History,
  FileCheck,
  ClipboardList,
  ChevronDown,
  Coins,
  Sun,
  Moon
} from 'lucide-react';

function NGOAppContent() {
  const {
    role,
    setRole,
    isLoggedIn,
    logout,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    theme,
    toggleTheme
  } = useNGOStore();

  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<
    'dashboard' | 'boxes' | 'customers' | 'collectors' | 'records' | 'reports' | 'compliance'
  >('dashboard');

  // Notification dropdown state
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 flex flex-col font-sans selection:bg-sky-100 dark:selection:bg-sky-950 select-none ${
      theme === 'dark' 
        ? 'dark bg-black text-white' 
        : 'bg-[#F8FAFC] text-slate-900'
    }`}>

      {/* RENDER VIEW: COLLECTOR PORTAL DASHBOARD */}
      {role === 'Collector' ? (
        <div className="flex-grow flex flex-col bg-slate-50 dark:bg-black transition-colors duration-200">
          <CollectorView />
        </div>
      ) : (
        /* RENDER VIEW: ADMINISTRATOR ENTERPRISE COMPASS PORTAL */
        <div className="flex-grow flex flex-col md:flex-row relative z-10">
          
          {/* Backdrop overlay for mobile navigation menu */}
          {isAdminMenuOpen && (
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-45 md:hidden"
              onClick={() => setIsAdminMenuOpen(false)}
            />
          )}

          {/* Sidebar Drawer Container */}
          <aside className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#121826] text-slate-700 dark:text-zinc-300 border-r border-slate-200 dark:border-slate-800 shrink-0 flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0
            ${isAdminMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div>
              {/* App Meta Headers */}
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
                {/* Mobile Menu Close Icon */}
                <button
                  onClick={() => setIsAdminMenuOpen(false)}
                  className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-400 dark:text-zinc-500 md:hidden cursor-pointer"
                  title="Close Navigation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation lists sidebar */}
              <nav className="p-4 space-y-1">
                {(
                  [
                    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                    { id: 'boxes', label: 'Add Donor', icon: Box },
                    { id: 'collectors', label: 'Collector', icon: UserCheck },
                    { id: 'records', label: 'Report and ledger', icon: History },
                    { id: 'compliance', label: 'Complain and new box issue', icon: ClipboardList },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeAdminTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveAdminTab(tab.id);
                        setIsAdminMenuOpen(false); // Auto-close drawer on mobile selection
                      }}
                      className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wide text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-sky-50 dark:bg-sky-950/45 text-sky-700 dark:text-sky-400 font-bold shadow-sm'
                          : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-sky-600' : 'text-slate-400 dark:text-zinc-500'}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Logout drawer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#111622] flex items-center justify-between text-xs text-slate-500 dark:text-zinc-450">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 font-semibold text-slate-700 dark:text-zinc-200 flex items-center justify-center text-[10px] font-mono border border-slate-300/40 dark:border-slate-700/60">
                  AD
                </div>
                <div>
                  <span className="block text-slate-800 dark:text-zinc-100 font-bold text-xs leading-none">Amna Khan</span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono block mt-0.5">head@ecogrowth.org</span>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="p-1 px-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-zinc-450 hover:text-rose-600 dark:hover:text-rose-500 rounded-md transition cursor-pointer"
                title="Sign Out Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </aside>

          {/* Core admin details workspace */}
          <div className="flex-grow flex flex-col overflow-hidden">
            
            {/* Header top taskbar with Notification bell dropdown */}
            <header className="p-4 bg-white dark:bg-[#121826] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between relative z-40 transition-colors duration-200">
              <div className="flex items-center gap-2">
                {/* Menu open trigger for mobile sidebar drawer */}
                <button
                  onClick={() => setIsAdminMenuOpen(true)}
                  className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-zinc-400 md:hidden cursor-pointer"
                  title="Open Navigation"
                >
                  <Menu className="w-4.5 h-4.5" />
                </button>
                <span className="text-xs bg-slate-50 dark:bg-slate-800 uppercase font-mono border border-slate-200 dark:border-slate-705 py-1 px-2.5 rounded-lg text-slate-500 dark:text-zinc-400 font-bold hidden sm:inline-block">
                  NGO Node Status: Operational
                </span>
                <span className="text-xs bg-slate-50 dark:bg-slate-800 uppercase font-mono border border-slate-200 dark:border-slate-705 py-1 px-2.5 rounded-lg text-slate-500 dark:text-zinc-400 font-bold sm:hidden inline-block text-[10px]">
                  Operational
                </span>
              </div>
              
              <div className="flex items-center gap-3 relative">
                {/* Theme Selector Trigger */}
                <button
                  onClick={toggleTheme}
                  className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-700 dark:hover:text-sky-400 hover:border-sky-500 dark:hover:border-sky-500 transition text-slate-500 dark:text-zinc-400 select-none cursor-pointer"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4.5 h-4.5 text-amber-500 animate-pulse-slow" />
                  ) : (
                    <Moon className="w-4.5 h-4.5 text-slate-650" />
                  )}
                </button>

                {/* 1. Notification trigger Bell Icon */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-700 dark:hover:text-sky-400 hover:border-sky-500 dark:hover:border-sky-550 transition text-slate-500 dark:text-zinc-400 select-none cursor-pointer"
                    title="System Notifications"
                  >
                    <Bell className="w-4.5 h-4.5" />
                    {unreadNotifs.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#121826] animate-pulse"></span>
                    )}
                  </button>
 
                  {/* 2. Notification dropdown floating card */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-3 w-85 bg-white dark:bg-[#0F172A] border border-zinc-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-left text-zinc-850 dark:text-zinc-100">
                      <div className="p-4 border-b border-zinc-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs tracking-wider uppercase text-slate-700 dark:text-zinc-200">Alert Center</span>
                          {unreadNotifs.length > 0 && (
                            <span className="bg-rose-500 text-white text-[10px] font-mono font-bold px-1.5 py-0.25 rounded-md">
                              {unreadNotifs.length} New
                            </span>
                          )}
                        </div>
                        {unreadNotifs.length > 0 && (
                          <button
                            onClick={markAllNotificationsRead}
                            className="text-[10px] text-sky-655 dark:text-sky-400 hover:underline font-bold transition-all cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
 
                      <div className="divide-y divide-zinc-100 dark:divide-slate-800/80 max-h-[340px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-zinc-400 dark:text-zinc-500 text-xs text-center">
                             <Bell className="w-6 h-6 mx-auto mb-2 text-zinc-300" />
                             <p className="font-semibold text-zinc-600">Zero active alerts</p>
                             <p className="text-[10px] text-zinc-400 mt-0.5">Everything is current and clear.</p>
                          </div>
                        ) : (
                          notifications.map((notif) => {
                            const isUnread = !notif.read;
                            return (
                              <div
                                key={notif.id}
                                onClick={() => markNotificationRead(notif.id)}
                                className={`p-4 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/25 cursor-pointer transition-colors relative flex gap-3 ${
                                  isUnread ? 'bg-sky-500/[0.03]' : ''
                                }`}
                              >
                                {isUnread && (
                                  <span className="absolute top-4 left-1.5 w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                                )}
                                
                                <div className="flex-grow space-y-1 select-none">
                                  <div className="flex items-start justify-between">
                                    <span className={`font-bold text-slate-850 dark:text-zinc-150 leading-tight block ${isUnread ? 'font-extrabold text-slate-900' : ''}`}>
                                      {notif.title}
                                    </span>
                                    <span className="text-[9px] text-zinc-450 dark:text-zinc-500 font-mono font-bold shrink-0 ml-1.5 whitespace-nowrap">
                                      {notif.time}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-zinc-500 dark:text-zinc-405 leading-relaxed font-semibold">
                                    {notif.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
 
                {/* 3. Operational Profile */}
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block leading-tight">Amna Khan</span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">Head Auditor Node</span>
                </div>
              </div>
            </header>

            {/* Core container views router switcher */}
            <main className="p-6 md:p-8 flex-grow overflow-y-auto max-h-[calc(100vh-140px)]">
              {activeAdminTab === 'dashboard' && <AdminDashboard />}
              {activeAdminTab === 'boxes' && <BoxManagement />}
              {activeAdminTab === 'collectors' && <CollectorManagement />}
              {activeAdminTab === 'records' && <ReportsModule defaultTab="ledger" />}
              {activeAdminTab === 'compliance' && <RegulatoryList />}
            </main>

          </div>
        </div>
      )}
      <PWAPrompt />
    </div>
  );
}

export default function App() {
  return (
    <NGOStoreProvider>
      <NGOAppContent />
    </NGOStoreProvider>
  );
}
