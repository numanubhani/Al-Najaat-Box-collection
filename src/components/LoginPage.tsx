/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNGOStore } from '../store';
import { Heart, ShieldCheck, UserCheck, Eye, EyeOff, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, theme } = useNGOStore();
  const [email, setEmail] = useState('admin@helperngo.org');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<'Admin' | 'Collector'>('Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: 'Admin' | 'Collector') => {
    setSelectedRole(role);
    if (role === 'Admin') {
      setEmail('admin@helperngo.org');
    } else {
      setEmail('john.smith@helperngo.org');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(email, selectedRole);
      setLoading(false);
    }, 600);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200 ${
      theme === 'dark' 
        ? 'dark bg-black text-white' 
        : 'bg-zinc-50 text-zinc-900'
    }`}>
      {/* Decorative clean background patterns */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100/20 dark:bg-emerald-950/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-50/40 dark:bg-emerald-900/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-md w-full space-y-8 bg-white dark:bg-black p-8 rounded-2xl shadow-sm border border-zinc-150 dark:border-slate-800 relative z-10 transition-all">
        {/* NGO Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-450 mb-4 shadow-inner">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
            EcoGrowth Foundation
          </h2>
          <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono tracking-wide uppercase">
            Donation Box Management Network
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100/80 dark:bg-[#1A2030] rounded-xl border border-zinc-200/50 dark:border-slate-800">
          <button
            type="button"
            onClick={() => handleRoleSelect('Admin')}
            className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              selectedRole === 'Admin'
                ? 'bg-white dark:bg-[#1D2536] text-emerald-700 dark:text-emerald-400 shadow-sm border border-zinc-150 dark:border-slate-700'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-250'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Administrator
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('Collector')}
            className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              selectedRole === 'Collector'
                ? 'bg-white dark:bg-[#1D2536] text-emerald-700 dark:text-emerald-400 shadow-sm border border-zinc-150 dark:border-slate-700'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-250'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Field Collector
          </button>
        </div>

        {/* Login Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400 mb-1.5" htmlFor="email">
              Account Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-[#171E2E] border border-zinc-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-zinc-250 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-colors"
                placeholder="name@ngo.org"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400 mb-1.5" htmlFor="password">
              Secure PIN / Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-[#171E2E] border border-zinc-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-zinc-250 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center text-zinc-500 dark:text-zinc-400 select-none cursor-pointer">
              <input type="checkbox" defaultChecked className="mr-1.5 rounded text-emerald-600 border-zinc-350 dark:border-slate-800 focus:ring-emerald-500" />
              Remember this device
            </label>
            <span className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">Forgot passcode?</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm focus:outline-none shadow-sm shadow-emerald-600/10 transition-all flex items-center justify-center gap-2 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin inline-block"></span>
            ) : (
              <span>Sign In Securely</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-100 dark:border-slate-800 flex flex-col items-center gap-1">
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center">
            Authorized Personnel Access Only. Under HIPAA & Global NGO auditing guidelines.
          </p>
          <div className="bg-zinc-100 dark:bg-[#182030] px-3 py-1.5 rounded-md mt-2 text-center text-xs text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-slate-800/60">
            <span className="font-semibold block text-zinc-800 dark:text-zinc-200">Quick-Test Credentials:</span>
            <span>Email matches the active test accounts above. Any password works.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
