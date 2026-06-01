/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNGOStore } from '../store';
import { Heart, ShieldCheck, UserCheck, Eye, EyeOff, Lock, Mail, Phone, User, CheckCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, registerUser, registrations, theme } = useNGOStore();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login Form State
  const [email, setEmail] = useState('Admin@gmail.com');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<'Admin' | 'Collector'>('Admin');
  
  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<'Admin' | 'Collector'>('Collector');
  
  // Common UI State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleSelect = (role: 'Admin' | 'Collector') => {
    setSelectedRole(role);
    if (role === 'Admin') {
      setEmail('Admin@gmail.com');
    } else {
      setEmail('naib@gmail.com');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase();
      
      // 1. Check direct dummy matches
      if (normalizedEmail === 'admin@gmail.com') {
        login(email, 'Admin');
        setLoading(false);
        return;
      }
      if (normalizedEmail === 'naib@gmail.com') {
        login(email, 'Collector');
        setLoading(false);
        return;
      }

      // 2. Otherwise check if they are in approved registrations
      const matchedReg = registrations.find(r => r.email.trim().toLowerCase() === normalizedEmail);
      if (matchedReg) {
        if (matchedReg.status === 'Approved') {
          login(matchedReg.email, matchedReg.role);
        } else if (matchedReg.status === 'Pending') {
          setErrorMsg('Your registration request is still pending admin approval. Please wait.');
        } else {
          setErrorMsg('Your registration request was rejected.');
        }
        setLoading(false);
        return;
      }

      // 3. To make it extremely friction-free for other emails entered during testing:
      // Let's support arbitrary logins but with matching roles or alert testing notice
      login(email, selectedRole);
      setLoading(false);
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone) {
      setErrorMsg('Please populate all fields first.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      registerUser(regName, regEmail, regPhone, regRole);
      setSuccessMsg(`Registration requested successfully! Contact Admin (${regRole}) to approve your access request.`);
      
      // Reset forms
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setLoading(false);
      
      // Toggle back to login tab with the registered email prefilled
      setTimeout(() => {
        setEmail(regEmail);
        setSelectedRole(regRole);
        setActiveTab('login');
        setSuccessMsg(`Account registered. Pending Admin approval in the database!`);
      }, 2000);
    }, 850);
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
            EcoGrowth Foundation
          </h2>
          <p className="mt-1 text-xs text-slate-400 dark:text-zinc-450 font-semibold tracking-wider uppercase font-mono">
            Smart Donation Box Ledger
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
                ? 'bg-white dark:bg-[#0F172A] text-sky-700 dark:text-sky-450 shadow-xs border border-slate-200/50 dark:border-slate-800'
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
                ? 'bg-white dark:bg-[#0F172A] text-sky-700 dark:text-sky-450 shadow-xs border border-slate-200/50 dark:border-slate-800'
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
            {/* Quick prefill selectors */}
            <div className="mb-4">
              <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono font-bold mb-2">
                Simulate Direct Roles
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('Admin')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 border rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    selectedRole === 'Admin'
                      ? 'border-sky-500 bg-sky-500/5 text-sky-700 dark:text-sky-450 font-bold'
                      : 'border-slate-205 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1E293B]/40 text-slate-500 dark:text-zinc-450 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Prefill
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('Collector')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 border rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    selectedRole === 'Collector'
                      ? 'border-sky-500 bg-sky-500/5 text-sky-700 dark:text-sky-450 font-bold'
                      : 'border-slate-205 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1E293B]/40 text-slate-500 dark:text-zinc-450 hover:bg-slate-100'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Collector Prefill
                </button>
              </div>
            </div>

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

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                Requested Role Status
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setRegRole('Collector')}
                  className={`py-2 px-3 border rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    regRole === 'Collector'
                      ? 'border-sky-500 bg-sky-500/5 text-sky-700 dark:text-sky-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Collector
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('Admin')}
                  className={`py-2 px-3 border rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    regRole === 'Admin'
                      ? 'border-sky-500 bg-sky-500/5 text-sky-700 dark:text-sky-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Staff
                </button>
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

        {/* Demo audit hints */}
        <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col items-center gap-1">
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 text-center uppercase font-mono font-bold tracking-wide">
            Test Credentials Setup
          </span>
          <div className="w-full text-[10px] text-zinc-500 bg-slate-50 dark:bg-[#1E293B]/40 p-2.5 rounded-md border border-slate-200/40 dark:border-slate-800 space-y-1">
            <div className="flex justify-between items-center text-[11px] text-slate-650 dark:text-zinc-330">
              <span>Admin Profile:</span>
              <span className="font-mono font-bold text-sky-650 dark:text-sky-400">Admin@gmail.com</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-650 dark:text-zinc-330">
              <span>Collector:</span>
              <span className="font-mono font-bold text-sky-650 dark:text-sky-400">naib@gmail.com</span>
            </div>
            <p className="text-[9px] text-zinc-400 mt-1 leading-normal italic text-center">
              * Any password/PIN is accepted in sandbox routing. Registered users waiting approval must be approved by the Auditor!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
