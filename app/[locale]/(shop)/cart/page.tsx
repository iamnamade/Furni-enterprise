"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/zustand-cart";
import { currency } from "@/lib/utils";

const TAX_RATE = 0.08;
const SHIPPING = 24;
const DISCOUNT_THRESHOLD = 600;
const DISCOUNT_RATE = 0.12;

export default function CartPage({ params }: { params: { locale: string } }) {
  const tCart = useTranslations("cart");
  const tCommon = useTranslations("common");
  const { items, removeItem, updateQty, totalPrice } = useCartStore();

  const subtotal = totalPrice();
  const discount = subtotal >= DISCOUNT_THRESHOLD ? subtotal * DISCOUNT_RATE : 0;
  const taxableAmount = Math.max(subtotal - discount, 0);
  const tax = taxableAmount * TAX_RATE;
  const shipping = items.length ? SHIPPING : 0;
  const total = taxableAmount + tax + shipping;

  return (
    <div className="space-y-8">
      <h1 className="section-title">{tCart("title")}</h1>

      {items.length === 0 ? (
        <div className="glass-panel py-16 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--control-border)] bg-[color:var(--control-bg)]">
            <ShoppingBag className="h-6 w-6 text-[color:var(--muted)]" />
          </div>
          <h2 className="text-xl font-semibold">{tCart("emptyTitle")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--muted)]">{tCart("emptyDesc")}</p>
          <Link
            className="mt-6 inline-flex rounded-full bg-[color:var(--button-primary-bg)] px-6 py-3 text-sm font-semibold text-[color:var(--button-primary-fg)] shadow-[0_10px_28px_rgba(16,44,38,0.18)]"
            href={`/${params.locale}/shop`}
          >
            {tCart("continueShopping")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="rounded-2xl border border-[color:var(--control-border)] bg-[color:var(--surface)] p-4 backdrop-blur-xl"
                >
                  <div className="grid grid-cols-[88px_1fr_auto] gap-4">
                    <Image src={item.imageUrl} alt={item.name} width={88} height={88} className="h-[88px] w-[88px] rounded-xl object-cover" />
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-[color:var(--muted)]">{currency(item.price)}</p>
                      <div className="mt-2 inline-flex items-center rounded-full border border-[color:var(--control-border)] bg-[color:var(--control-bg)]">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center"
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          aria-label={tCommon("decreaseQuantity")}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center"
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          aria-label={tCommon("increaseQuantity")}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between gap-3">
                      <p className="font-semibold">{currency(item.price * item.quantity)}</p>
                      <Button variant="ghost" onClick={() => removeItem(item.productId)} className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]">
                        {tCommon("remove")}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <aside className="glass-panel h-fit space-y-4 p-6">
            <h2 className="text-lg font-semibold">{tCart("summary")}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[color:var(--muted)]">{tCommon("subtotal")}</span>
                <span>{currency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[color:var(--muted)]">{tCart("discount")}</span>
                <span>{discount > 0 ? `-${currency(discount)}` : currency(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[color:var(--muted)]">{tCart("tax")}</span>
                <span>{currency(tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[color:var(--muted)]">{tCart("shipping")}</span>
                <span>{currency(shipping)}</span>
              </div>
              <div className="mt-2 border-t border-[color:var(--control-border)] pt-3 text-base font-semibold">
                <div className="flex justify-between">
                  <span>{tCart("total")}</span>
                  <span>{currency(total)}</span>
                </div>
              </div>
            </div>
            <Link href={`/${params.locale}/checkout`}>
              <Button className="w-full">{tCommon("checkout")}</Button>
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

