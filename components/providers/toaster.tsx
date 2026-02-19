"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useToastStore } from "@/lib/toast-store";

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-5 z-[95] mx-auto w-full max-w-lg px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto mb-3 rounded-2xl border border-white/15 bg-[rgba(16,44,38,0.82)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.48)] backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              {toast.href ? (
                <Link href={toast.href} className="text-sm font-semibold text-white underline decoration-white/30 underline-offset-2 hover:text-brand-secondary">
                  {toast.title}
                </Link>
              ) : (
                <p className="text-sm font-semibold text-white">{toast.title}</p>
              )}
              {toast.message ? <p className="mt-1 text-xs text-white/75">{toast.message}</p> : null}
            </div>
            <button
              aria-label="Dismiss notification"
              className="rounded-full border border-white/15 p-1 text-white/70 transition hover:border-brand-secondary/60 hover:text-brand-secondary"
              onClick={() => dismiss(toast.id)}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
