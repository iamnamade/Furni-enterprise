"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/lib/zustand-cart";
import { useEffect } from "react";

export default function ConfirmationPage({ params }: { params: { locale: string } }) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const clear = useCartStore((state) => state.clear);

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="surface-card mx-auto max-w-xl space-y-4 p-6 text-center">
      <h1 className="text-3xl font-semibold">Order confirmed</h1>
      <p className="text-sm text-muted">Payment succeeded and your order is now being processed.</p>
      {orderId ? <p className="text-xs text-muted">Order ID: {orderId}</p> : null}
      <div className="flex justify-center gap-3">
        <Link className="rounded-full border border-brand-primary/20 px-5 py-2 text-sm" href={`/${params.locale}/orders`}>
          View orders
        </Link>
        <Link className="rounded-full bg-brand-primary px-5 py-2 text-sm text-white" href={`/${params.locale}/shop`}>
          Continue shopping
        </Link>
      </div>
    </div>
  );
}