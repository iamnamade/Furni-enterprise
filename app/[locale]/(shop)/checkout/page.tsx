"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/zustand-cart";
import { currency } from "@/lib/utils";
import { useToastStore } from "@/lib/toast-store";

const checkoutFormSchema = z.object({
  shippingName: z.string().min(2, "Enter your full name"),
  shippingEmail: z.string().email("Enter a valid email"),
  shippingAddress: z.string().min(5, "Enter shipping address"),
  shippingCity: z.string().min(2, "Enter city"),
  shippingCountry: z.string().min(2, "Enter country"),
  shippingZip: z.string().min(2, "Enter ZIP / postal code")
});

type CheckoutForm = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const { items } = useCartStore();
  const pushToast = useToastStore((state) => state.push);
  const [serverError, setServerError] = useState("");

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      shippingName: "",
      shippingEmail: "",
      shippingAddress: "",
      shippingCity: "",
      shippingCountry: "",
      shippingZip: ""
    }
  });

  async function onSubmit(values: CheckoutForm) {
    setServerError("");
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        locale: params.locale,
        cartItems: items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
      })
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      const message = data?.message || "Failed to create checkout session.";
      setServerError(message);
      pushToast({ title: "Checkout failed", message });
      return;
    }

    const data = (await response.json()) as { url?: string };
    if (data?.url) {
      pushToast({ title: "Redirecting to Stripe" });
      router.push(data.url);
    }
  }

  if (items.length === 0) {
    return (
      <div className="surface-card mx-auto max-w-xl space-y-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="text-sm text-muted">Your cart is empty.</p>
        <Button onClick={() => router.push(`/${params.locale}/shop`)}>Back to shop</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <form onSubmit={handleSubmit(onSubmit)} className="surface-card space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Shipping details</h1>
        <div className="grid gap-3">
          <Input placeholder="Full name" {...register("shippingName")} aria-invalid={!!errors.shippingName} />
          {errors.shippingName ? <p className="text-xs text-red-700">{errors.shippingName.message}</p> : null}

          <Input placeholder="Email" type="email" {...register("shippingEmail")} aria-invalid={!!errors.shippingEmail} />
          {errors.shippingEmail ? <p className="text-xs text-red-700">{errors.shippingEmail.message}</p> : null}

          <Input placeholder="Address" {...register("shippingAddress")} aria-invalid={!!errors.shippingAddress} />
          {errors.shippingAddress ? <p className="text-xs text-red-700">{errors.shippingAddress.message}</p> : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Input placeholder="City" {...register("shippingCity")} aria-invalid={!!errors.shippingCity} />
              {errors.shippingCity ? <p className="mt-1 text-xs text-red-700">{errors.shippingCity.message}</p> : null}
            </div>
            <div>
              <Input placeholder="Country" {...register("shippingCountry")} aria-invalid={!!errors.shippingCountry} />
              {errors.shippingCountry ? <p className="mt-1 text-xs text-red-700">{errors.shippingCountry.message}</p> : null}
            </div>
            <div>
              <Input placeholder="ZIP" {...register("shippingZip")} aria-invalid={!!errors.shippingZip} />
              {errors.shippingZip ? <p className="mt-1 text-xs text-red-700">{errors.shippingZip.message}</p> : null}
            </div>
          </div>
        </div>

        {serverError ? <p className="text-sm text-red-700">{serverError}</p> : null}
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Redirecting..." : "Proceed to Stripe"}
        </Button>
      </form>

      <aside className="surface-card h-fit space-y-3 p-5">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.productId} className="flex items-center justify-between gap-2">
              <span className="line-clamp-1 text-muted">{item.name} x {item.quantity}</span>
              <span>{currency(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-brand-primary/15 pt-3 text-sm">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{currency(subtotal)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}