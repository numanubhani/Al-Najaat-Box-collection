/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Download, Monitor, Smartphone, X, Check, Share, ArrowUp } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAPrompt: React.FC = () => {
  // Save beforeinstallprompt event
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'other'>('other');

  useEffect(() => {
    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isIos) {
      setPlatform('ios');
    } else if (isAndroid) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Check if already in standalone overlay display (installed PWA)
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    // Listen to beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      
      // Auto-trigger logs
      console.log('beforeinstallprompt event triggered & captured!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen to app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('Al-Najaat app installed successfully!');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Read dismissed state from localStorage if any
    const dismissed = localStorage.getItem('pwa_prompt_dismissed') === 'true';
    if (dismissed) {
      setIsDismissed(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show native prompt
    await deferredPrompt.prompt();

    // Wait for the user response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User installation decision: ${outcome}`);

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  const handleShowPromptAgain = () => {
    setIsDismissed(false);
    localStorage.removeItem('pwa_prompt_dismissed');
  };

  // If already installed, don't show prompt. However, provide a nice indicator if dismissed or not installable
  if (isInstalled) {
    return null;
  }

  // Persistent minimized floating action button (FAB) for triggering installation at any point
  if (isDismissed || (!isInstallable && platform !== 'ios')) {
    return (
      <div className="fixed bottom-4 right-4 z-49">
        <button
          onClick={handleShowPromptAgain}
          className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-full text-xs font-bold transition shadow-lg cursor-pointer hover:scale-105 active:scale-95"
          title="Install Al-Najaat App"
        >
          <Download className="w-4 h-4 animate-bounce" />
          <span>Install App</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 left-5 right-5 md:left-auto md:right-5 md:w-96 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <button
        onClick={handleDismiss}
        className="absolute top-3.5 right-3.5 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-zinc-400 hover:text-zinc-650 cursor-pointer transition-colors"
        title="Dismiss installation banner"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-[#12221c] text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/60">
          <Download className="w-5.5 h-5.5" />
        </div>
        
        <div className="space-y-1 pr-6">
          <span className="text-[10px] uppercase font-bold tracking-widest text-sky-600 dark:text-sky-400 font-mono">
            Optimized offline client
          </span>
          <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white leading-tight">
            Install Al-Najaat App
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
            Install on your mobile or laptop for fast offline access, native task alerts, and secure biometric ledger sync.
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
        {platform === 'ios' ? (
          /* iOS Safari installation guidelines (Apple doesn't support native beforeinstallprompt prompt) */
          <div className="space-y-2.5">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-200/50 dark:border-slate-800 text-[10.5px] leading-relaxed text-zinc-650 dark:text-zinc-400">
              <span className="font-extrabold text-zinc-800 dark:text-white flex items-center gap-1 mb-1 font-sans">
                <Smartphone className="w-3.5 h-3.5 text-sky-500" />
                iOS Safari Instructions:
              </span>
              <ol className="list-decimal pl-4.5 space-y-1 font-semibold">
                <li>
                  Tap the Safari <strong>Share</strong> icon{' '}
                  <Share className="w-3 h-3 text-sky-500 inline mx-0.5" /> in the bottom toolbar.
                </li>
                <li>
                  Scroll down the share menu list and select <strong>Add to Home Screen</strong>{' '}
                  <ArrowUp className="w-3 h-3 text-emerald-500 inline mx-0.5" />.
                </li>
                <li>Tap <strong>Add</strong> in the top right to complete installation.</li>
              </ol>
            </div>
            <button
              onClick={handleDismiss}
              className="w-full py-2 bg-slate-100 hover:bg-slate-201 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          /* Chrome / Edge / Other Android & Laptop Native PWA Prompt */
          <div className="space-y-2.5">
            <div className="flex gap-2 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono font-bold tracking-wide">
              <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/60 px-2 py-0.75 rounded border border-slate-200/50 dark:border-slate-800">
                <Monitor className="w-3 h-3 text-sky-500" /> Laptop OK
              </span>
              <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/60 px-2 py-0.75 rounded border border-slate-200/50 dark:border-slate-800">
                <Smartphone className="w-3 h-3 text-emerald-500" /> Mobile OK
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2 border border-zinc-200 dark:border-slate-750 hover:bg-zinc-50 dark:hover:bg-slate-800 text-zinc-650 dark:text-zinc-400 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Maybe Later
              </button>
              <button
                onClick={handleInstallClick}
                className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-extrabold shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5 hover:scale-102"
              >
                <Download className="w-3.5 h-3.5" />
                Install Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAPrompt;
