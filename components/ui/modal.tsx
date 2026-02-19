"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  closeLabel?: string;
  variant?: "center" | "bottom-sheet";
};

export function Modal({ open, title, onClose, children, closeLabel = "Close", variant = "center" }: ModalProps) {
  const isSheet = variant === "bottom-sheet";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-[260] bg-[color:var(--overlay-scrim)] backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className={isSheet ? "" : "fixed inset-0 z-[270] grid place-items-center p-4"}>
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className={
                isSheet
                  ? "fixed inset-x-0 bottom-0 z-[270] mx-auto flex w-full max-w-3xl flex-col rounded-t-3xl border border-white/10 bg-[#2C4A3E] px-5 pb-6 pt-4 text-[#f5f5f5] shadow-2xl max-h-[50vh]"
                  : "glass-panel w-full max-w-2xl overflow-hidden p-5 sm:p-6"
              }
              initial={isSheet ? { opacity: 0.8, y: "100%" } : { opacity: 0, y: 12, scale: 0.98 }}
              animate={isSheet ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 }}
              exit={isSheet ? { opacity: 0.8, y: "100%" } : { opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-[-0.02em]">{title}</h2>
                <button
                  type="button"
                  className="rounded-full border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-3 py-1 text-sm hover:bg-[color:var(--control-hover)]"
                  onClick={onClose}
                >
                  {closeLabel}
                </button>
              </div>
              <div className={isSheet ? "min-h-0 overflow-y-auto pr-1" : "max-h-[82svh] overflow-y-auto pr-1"}>{children}</div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

