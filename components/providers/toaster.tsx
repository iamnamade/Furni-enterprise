"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useToastStore } from "@/lib/toast-store";

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-5 z-[95] mx-auto w-full max-w-lg px-4">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="pointer-events-auto mb-3 rounded-2xl border border-white/15 bg-[rgba(16,44,38,0.82)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.48)] backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{toast.title}</p>
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
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

