"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
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
  onClose,
  onRemove,
  onUpdateQty
}: MiniCartOverlayProps) {
  const isKa = locale === "ka";
  const emptyTitle = isKa ? "თქვენი კალათა ცარიელია" : emptyLabel;
  const continueShoppingLabel = isKa ? "გააგრძელე ყიდვა" : "Continue shopping";

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close mini cart overlay"
            className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-y-0 right-0 z-[80] flex w-[88vw] flex-col overflow-hidden border-l border-[#2d4f40] bg-[#1E3A2F] text-[#f5f5ef] shadow-[0_20px_70px_rgba(0,0,0,0.4)] sm:w-[400px] md:w-[450px] lg:w-[min(40vw,550px)]"
            role="dialog"
            aria-label={title}
          >
            <div className="flex items-center justify-between border-b border-[#355648] px-6 py-5 lg:px-8">
              <h2 className="text-lg font-semibold tracking-[0.01em]">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#4b6f5e] p-1.5 transition hover:bg-white/10"
                aria-label="Close mini cart"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5 lg:px-8">
              {items.length === 0 ? (
                <div className="space-y-4 rounded-2xl border border-[#3f6151] bg-[#264538] p-5">
                  <p className="text-base font-semibold">{emptyTitle}</p>
                  <Link href={`/${locale}/shop`} onClick={onClose}>
                    <Button className="h-11 w-full bg-[#F5E6CA] text-[#1E3A2F] hover:bg-[#e9d8b7]">{continueShoppingLabel}</Button>
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.productId}
                    className="grid grid-cols-[100px_1fr_auto] items-center gap-4 rounded-2xl border border-[#3b5c4c] bg-[#254336] p-4"
                  >
                    <div className="overflow-hidden rounded-xl">
                      <Image src={item.imageUrl} alt={item.name} width={100} height={100} className="h-[100px] w-[100px] object-cover" />
                    </div>

                    <div className="min-w-0">
                      <p className="line-clamp-2 text-base font-bold">{item.name}</p>
                      <p className="mt-1 text-lg font-semibold text-[#F5E6CA]">{currency(item.price)}</p>
                      <div className="mt-3 inline-flex items-center justify-center rounded-full border border-[#577a68] bg-[#1b342b]">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
                          className="grid h-8 w-8 place-items-center"
                          aria-label={decreaseLabel}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-9 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
                          className="grid h-8 w-8 place-items-center"
                          aria-label={increaseLabel}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="text-xs font-medium opacity-80 transition hover:opacity-100"
                      onClick={() => onRemove(item.productId)}
                      aria-label={removeLabel}
                    >
                      {removeLabel}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="sticky bottom-0 space-y-3 border-t border-[#355648] bg-[#193126] px-6 py-5 lg:px-8">
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-80">{subtotalLabel}</span>
                <span className="text-xl font-semibold text-[#F5E6CA]">{currency(subtotal)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link href={`/${locale}/cart`} onClick={onClose}>
                  <Button variant="secondary" className="h-11 w-full border border-[#F5E6CA] bg-[#2d4a3e] text-[#F5E6CA] hover:bg-[#355648]">
                    {viewCartLabel}
                  </Button>
                </Link>
                <Link href={`/${locale}/checkout`} onClick={onClose}>
                  <Button className="h-11 w-full bg-[#F5E6CA] text-[#1E3A2F] hover:bg-[#e9d8b7]">{checkoutLabel}</Button>
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
