"use client";

import { FormEvent, useMemo, useState } from "react";
import { useToastStore } from "@/lib/toast-store";
import { cn } from "@/lib/utils";

type NewsletterSubscribeFormProps = {
  locale: string;
  formLabel: string;
  submitLabel: string;
  placeholder?: string;
  variant?: "hero" | "footer";
  className?: string;
};

type LocaleCopy = {
  sending: string;
  successTitle: string;
  successMessage: string;
  failedTitle: string;
  fallbackError: string;
};

const uiText: Record<"en" | "ka" | "ru", LocaleCopy> = {
  en: {
    sending: "Sending...",
    successTitle: "Subscribed",
    successMessage: "Your request was sent successfully.",
    failedTitle: "Subscription failed",
    fallbackError: "Could not send your request. Please try again."
  },
  ka: {
    sending: "იგზავნება...",
    successTitle: "გამოწერა მიღებულია",
    successMessage: "მოთხოვნა წარმატებით გაიგზავნა.",
    failedTitle: "გამოწერა ვერ შესრულდა",
    fallbackError: "ახლა ვერ მოხერხდა გაგზავნა. სცადე მოგვიანებით."
  },
  ru: {
    sending: "Отправка...",
    successTitle: "Подписка оформлена",
    successMessage: "Ваша заявка успешно отправлена.",
    failedTitle: "Не удалось подписаться",
    fallbackError: "Сейчас не удалось отправить заявку. Попробуйте позже."
  }
};

function normalizeLocale(locale: string): "en" | "ka" | "ru" {
  if (locale === "ka" || locale === "ru" || locale === "en") return locale;
  return "en";
}

export function NewsletterSubscribeForm({
  locale,
  formLabel,
  submitLabel,
  placeholder = "you@example.com",
  variant = "hero",
  className
}: NewsletterSubscribeFormProps) {
  const pushToast = useToastStore((state) => state.push);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const text = useMemo(() => uiText[normalizeLocale(locale)], [locale]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          locale
        })
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        const message = data?.message || text.fallbackError;
        setError(message);
        pushToast({ title: text.failedTitle, message });
        return;
      }

      setEmail("");
      pushToast({ title: text.successTitle, message: data?.message || text.successMessage });
    } catch {
      setError(text.fallbackError);
      pushToast({ title: text.failedTitle, message: text.fallbackError });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <form
        onSubmit={handleSubmit}
        className={cn(
          variant === "hero"
            ? "relative mx-auto mt-6 flex max-w-md gap-2 rounded-full border bg-[color:var(--surface)]/90 p-2 backdrop-blur-2xl"
            : "flex gap-2 rounded-2xl border border-[color:var(--footer-border)] bg-[color:var(--surface)] p-2 backdrop-blur-xl"
        )}
        aria-label={formLabel}
      >
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={placeholder}
          aria-label="Email address"
          className={cn(
            variant === "hero"
              ? "h-11 flex-1 rounded-full bg-transparent px-4 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:outline-none"
              : "h-11 w-full rounded-full border-0 bg-transparent px-4 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:outline-none"
          )}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "inline-flex min-h-10 items-center justify-center rounded-full font-semibold transition disabled:pointer-events-none disabled:opacity-55",
            variant === "hero"
              ? "bg-[color:var(--button-primary-bg)] px-6 text-sm text-[color:var(--button-primary-fg)] shadow-[0_10px_30px_rgba(16,44,38,0.18)] hover:scale-[1.02]"
              : "bg-[color:var(--button-primary-bg)] px-5 text-sm text-[color:var(--button-primary-fg)] shadow-[0_12px_34px_rgba(16,44,38,0.18)] hover:-translate-y-0.5"
          )}
        >
          {isSubmitting ? text.sending : submitLabel}
        </button>
      </form>

      {error ? (
        <p
          className={cn(
            "text-xs",
            variant === "hero" ? "mx-auto max-w-md text-left text-red-700" : "text-red-500"
          )}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
