import React from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useNGOStore } from '../store';

const toneStyles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
  info: 'border-sky-200 bg-sky-50 text-sky-900',
} as const;

const toneIcons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const;

export default function ToastViewport() {
  const { toasts, dismissToast } = useNGOStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[80] w-full max-w-sm space-y-2">
      {toasts.map((toast) => {
        const Icon = toneIcons[toast.variant];
        return (
          <div
            key={toast.id}
            className={`rounded-xl border px-3 py-2 shadow-md transition-all ${toneStyles[toast.variant]}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-2">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold">{toast.title}</p>
                {toast.message ? <p className="mt-0.5 text-[11px] opacity-90">{toast.message}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded p-0.5 hover:bg-black/5"
                aria-label="Dismiss toast"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
