"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "@/lib/motion";
import { Heart, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/utils";

type MiniCartOverlayProps = {
  open: boolean;
  locale: string;
  items: Array<{
    productId: string;
    name: string;
    imageUrl: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  title: string;
  emptyLabel: string;
  subtotalLabel: string;
  checkoutLabel: string;
  viewCartLabel: string;
  decreaseLabel: string;
  increaseLabel: string;
  removeLabel: string;
  continueShoppingLabel: string;
  favoritesLabel: string;
  onClose: () => void;
  onRemove: (productId: string) => void;
  onUpdateQty: (productId: string, quantity: number) => void;
};

export function MiniCartOverlay({
  open,
  locale,
  items,
  subtotal,
  title,
  emptyLabel,
  subtotalLabel,
  checkoutLabel,
  viewCartLabel,
  decreaseLabel,
  increaseLabel,
  removeLabel,
  continueShoppingLabel,
  favoritesLabel,
  onClose,
  onRemove,
  onUpdateQty
}: MiniCartOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!mounted) return null;

  const overlay = (
    <AnimatePresence initial={false} mode="wait">
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close mini cart overlay"
            className="fixed inset-0 z-[180] bg-[color:var(--cart-scrim)] backdrop-blur-[1.5px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "104%", opacity: 0.98 }}
            animate={{ x: 0 }}
            exit={{ x: "104%", opacity: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 34, mass: 0.9 }}
            className="fixed inset-y-0 right-0 z-[190] flex w-[92vw] max-w-[620px] flex-col overflow-hidden border-l border-[color:var(--cart-panel-border)] bg-[color:var(--cart-panel-bg)] text-[color:var(--cart-panel-fg)] shadow-[var(--cart-shadow)] will-change-transform sm:w-[430px] md:w-[500px] lg:w-[560px] xl:w-[620px]"
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="flex items-center justify-between border-b border-[color:var(--cart-panel-border)] px-6 py-5 lg:px-8">
              <h2 className="text-lg font-semibold tracking-[0.01em]">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[color:var(--cart-control-border)] bg-[color:var(--cart-control-bg)] p-1.5 transition hover:bg-[color:var(--control-hover)]"
                aria-label="Close mini cart"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[color:var(--cart-list-bg)] px-6 py-5 lg:px-8">
              {items.length === 0 ? (
                <div className="space-y-4 rounded-2xl border border-[color:var(--cart-item-border)] bg-[color:var(--cart-item-bg)] p-5">
                  <p className="text-base font-semibold">{emptyLabel}</p>
                  <Link href={`/${locale}/shop`} onClick={onClose} className="block">
                    <Button className="h-11 w-full">{continueShoppingLabel}</Button>
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.productId}
                    className="group grid grid-cols-[100px_1fr_auto] items-center gap-4 rounded-2xl border border-[color:var(--cart-item-border)] bg-[color:var(--cart-item-bg)] p-4"
                  >
                    <div className="overflow-hidden rounded-xl">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={100}
                        height={100}
                        sizes="100px"
                        className="h-[100px] w-[100px] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="line-clamp-2 text-base font-bold">{item.name}</p>
                      <p className="mt-1 text-lg font-semibold text-[color:var(--cart-price)]">{currency(item.price)}</p>
                      <div className="mt-3 inline-flex items-center justify-center rounded-full border border-[color:var(--cart-control-border)] bg-[color:var(--cart-control-bg)]">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
                          className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-[color:var(--control-hover)]"
                          aria-label={decreaseLabel}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-9 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
                          className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-[color:var(--control-hover)]"
                          aria-label={increaseLabel}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="text-xs font-medium text-[color:var(--cart-muted)] transition hover:text-[color:var(--cart-panel-fg)]"
                      onClick={() => onRemove(item.productId)}
                      aria-label={removeLabel}
                    >
                      {removeLabel}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="sticky bottom-0 space-y-3 border-t border-[color:var(--cart-panel-border)] bg-[color:var(--cart-footer-bg)] px-6 py-5 backdrop-blur-md lg:px-8">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[color:var(--cart-muted)]">{subtotalLabel}</span>
                <span className="text-xl font-semibold text-[color:var(--cart-price)]">{currency(subtotal)}</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Link href={`/${locale}/cart`} onClick={onClose} className="block">
                  <Button
                    variant="secondary"
                    className="h-11 w-full border border-[color:var(--cart-control-border)] bg-[color:var(--cart-control-bg)] text-[color:var(--cart-panel-fg)] hover:bg-[color:var(--control-hover)]"
                  >
                    {viewCartLabel}
                  </Button>
                </Link>
                <Link href={`/${locale}/checkout`} onClick={onClose} className="block">
                  <Button className="h-11 w-full">{checkoutLabel}</Button>
                </Link>
                <Link href={`/${locale}/favorites`} onClick={onClose} className="block">
                  <Button
                    variant="secondary"
                    className="h-11 w-full border border-[color:var(--cart-control-border)] bg-[color:var(--cart-control-bg)] text-[color:var(--cart-panel-fg)] hover:bg-[color:var(--control-hover)]"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    {favoritesLabel}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );

  return createPortal(overlay, document.body);
}
