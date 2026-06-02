/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNGOStore } from '../store';
import { Heart, Eye, EyeOff, Lock, Mail, Phone, User, CheckCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, registerUser, theme } = useNGOStore();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login Form State
  const [email, setEmail] = useState('Admin@gmail.com');
  const [password, setPassword] = useState('password123');
  
  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  
  // Common UI State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone) {
      setErrorMsg('Please populate all fields first.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await registerUser(regName, regEmail, regPhone, 'Collector');
      setSuccessMsg('Registration requested successfully! Contact admin to approve your access request.');
      
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setEmail(regEmail);
      setActiveTab('login');
      setSuccessMsg('Account registered. Pending admin approval.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200 ${
      theme === 'dark' 
        ? 'dark bg-black text-white' 
        : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      {/* Visual background accents */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-sky-200/20 dark:bg-sky-950/20 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-100/30 dark:bg-emerald-900/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-md w-full space-y-6 bg-white dark:bg-[#0F172A] p-8 rounded-2xl shadow-sm border border-zinc-150 dark:border-slate-800/80 relative z-10 transition-all">
        {/* Logo and Headings */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-600 text-white mb-3.5 shadow-md">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 font-sans">
            Al-Najaat Foundation
          </h2>
          <p className="mt-1 text-xs text-slate-400 dark:text-zinc-450 font-semibold tracking-wider uppercase font-mono">
            Social Care Foundation Ledger
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-[#1E293B] rounded-lg border border-slate-200/40 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white dark:bg-[#0F172A] text-sky-700 dark:text-sky-455 shadow-xs border border-slate-200/50 dark:border-slate-800'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-850 dark:hover:text-zinc-200'
            }`}
          >
            Sign In Account
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white dark:bg-[#0F172A] text-sky-700 dark:text-sky-455 shadow-xs border border-slate-200/50 dark:border-slate-800'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-850 dark:hover:text-zinc-200'
            }`}
          >
            Request Register
          </button>
        </div>

        {/* Action notices values */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-150 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 text-xs rounded-lg text-center font-medium">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-450 text-xs rounded-lg text-center font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-600 block mx-auto mb-1" />
            {successMsg}
          </div>
        )}

        {/* Form view 1: Login Tab */}
        {activeTab === 'login' ? (
          <div>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1" htmlFor="email">
                  Account Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50/80 dark:bg-[#1E293B]/55 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1" htmlFor="password">
                  Security Code PIN
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-9 pr-9 py-2 bg-slate-50/80 dark:bg-[#1E293B]/55 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-650"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <label className="flex items-center text-slate-500 dark:text-zinc-400 font-medium select-none cursor-pointer">
                  <input type="checkbox" defaultChecked className="mr-1.5 rounded text-sky-600 border-slate-300 focus:ring-sky-500" />
                  Remember credentials
                </label>
                <span className="text-sky-650 dark:text-sky-400 font-bold hover:underline cursor-pointer">Audit help?</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-75"
              >
                {loading ? (
                  <span className="w-4.5 h-4.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                ) : (
                  <span>Sign In Securely</span>
                )}
              </button>
            </form>

            <div className="mt-5.5 pt-4.5 border-t border-slate-100 dark:border-slate-800/80 text-center text-[10.5px] text-zinc-500 font-medium">
              Use your real account credentials managed in backend.
            </div>
          </div>
        ) : (
          /* Form view 2: Register Tab */
          <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-250">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1" htmlFor="regName">
                Collector / Staff Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="regName"
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 bg-slate-50/80 dark:bg-[#1E293B]/55 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  placeholder="e.g. Sajid Khan"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1" htmlFor="regEmail">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="regEmail"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 bg-slate-50/80 dark:bg-[#1E293B]/55 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  placeholder="e.g. sajid@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1" htmlFor="regPhone">
                Contact Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  id="regPhone"
                  type="text"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 bg-slate-50/80 dark:bg-[#1E293B]/55 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  placeholder="e.g. +92 (315) 987-6543"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 mt-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <span className="w-4.5 h-4.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              ) : (
                <span>Request Account Placement</span>
              )}
            </button>
          </form>
        )}

        <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col items-center gap-1">
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 text-center uppercase font-mono font-bold tracking-wide">
            Secure Access
          </span>
          <div className="w-full text-[10px] text-zinc-500 bg-slate-50 dark:bg-[#1E293B]/40 p-2.5 rounded-md border border-slate-200/40 dark:border-slate-800 space-y-1">
            <p className="text-[9px] text-zinc-400 mt-1 leading-normal italic text-center">
              Accounts are authenticated against backend credentials. New registrations require admin approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
