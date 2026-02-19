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

type CheckoutForm = {
  shippingName: string;
  shippingEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  shippingZip: string;
};

export default function CheckoutPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const { items } = useCartStore();
  const pushToast = useToastStore((state) => state.push);
  const [serverError, setServerError] = useState("");
  const tr = (en: string, ka: string, ru: string) => (params.locale === "ka" ? ka : params.locale === "ru" ? ru : en);
  const checkoutFormSchema = z.object({
    shippingName: z.string().min(2, tr("Enter your full name", "შეიყვანე სრული სახელი", "Введите полное имя")),
    shippingEmail: z.string().email(tr("Enter a valid email", "შეიყვანე სწორი ელფოსტა", "Введите корректный email")),
    shippingAddress: z.string().min(5, tr("Enter shipping address", "შეიყვანე მისამართი", "Введите адрес доставки")),
    shippingCity: z.string().min(2, tr("Enter city", "შეიყვანე ქალაქი", "Введите город")),
    shippingCountry: z.string().min(2, tr("Enter country", "შეიყვანე ქვეყანა", "Введите страну")),
    shippingZip: z.string().min(2, tr("Enter ZIP / postal code", "შეიყვანე ინდექსი", "Введите индекс"))
  });

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
      const message = data?.message || tr("Failed to create checkout session.", "გადახდის სესიის შექმნა ვერ შესრულდა.", "Не удалось создать сессию оплаты.");
      setServerError(message);
      pushToast({ title: tr("Checkout failed", "გადახდა ვერ შესრულდა", "Ошибка оформления"), message });
      return;
    }

    const data = (await response.json()) as { url?: string };
    if (data?.url) {
      pushToast({ title: tr("Redirecting to Stripe", "Stripe-ზე გადამისამართება", "Переход на Stripe") });
      router.push(data.url);
    }
  }

  if (items.length === 0) {
    return (
      <div className="surface-card mx-auto max-w-xl space-y-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="text-sm text-muted">{tr("Your cart is empty.", "თქვენი კალათა ცარიელია.", "Ваша корзина пуста.")}</p>
        <Button onClick={() => router.push(`/${params.locale}/shop`)}>{tr("Back to shop", "დაბრუნება მაღაზიაში", "Назад в магазин")}</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <form onSubmit={handleSubmit(onSubmit)} className="surface-card space-y-4 p-6">
        <h1 className="text-2xl font-semibold">{tr("Shipping details", "მიწოდების დეტალები", "Детали доставки")}</h1>
        <div className="grid gap-3">
          <Input placeholder={tr("Full name", "სრული სახელი", "Полное имя")} {...register("shippingName")} aria-invalid={!!errors.shippingName} />
          {errors.shippingName ? <p className="text-xs text-red-700">{errors.shippingName.message}</p> : null}

          <Input placeholder={tr("Email", "ელფოსტა", "Email")} type="email" {...register("shippingEmail")} aria-invalid={!!errors.shippingEmail} />
          {errors.shippingEmail ? <p className="text-xs text-red-700">{errors.shippingEmail.message}</p> : null}

          <Input placeholder={tr("Address", "მისამართი", "Адрес")} {...register("shippingAddress")} aria-invalid={!!errors.shippingAddress} />
          {errors.shippingAddress ? <p className="text-xs text-red-700">{errors.shippingAddress.message}</p> : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Input placeholder={tr("City", "ქალაქი", "Город")} {...register("shippingCity")} aria-invalid={!!errors.shippingCity} />
              {errors.shippingCity ? <p className="mt-1 text-xs text-red-700">{errors.shippingCity.message}</p> : null}
            </div>
            <div>
              <Input placeholder={tr("Country", "ქვეყანა", "Страна")} {...register("shippingCountry")} aria-invalid={!!errors.shippingCountry} />
              {errors.shippingCountry ? <p className="mt-1 text-xs text-red-700">{errors.shippingCountry.message}</p> : null}
            </div>
            <div>
              <Input placeholder={tr("ZIP", "ინდექსი", "Индекс")} {...register("shippingZip")} aria-invalid={!!errors.shippingZip} />
              {errors.shippingZip ? <p className="mt-1 text-xs text-red-700">{errors.shippingZip.message}</p> : null}
            </div>
          </div>
        </div>

        {serverError ? <p className="text-sm text-red-700">{serverError}</p> : null}
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? tr("Redirecting...", "გადამისამართება...", "Переход...") : tr("Proceed to Stripe", "Stripe-ზე გაგრძელება", "Перейти к Stripe")}
        </Button>
      </form>

      <aside className="surface-card h-fit space-y-3 p-5">
        <h2 className="text-lg font-semibold">{tr("Order summary", "შეკვეთის შეჯამება", "Сводка заказа")}</h2>
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
            <span>{tr("Total", "ჯამი", "Итого")}</span>
            <span>{currency(subtotal)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
