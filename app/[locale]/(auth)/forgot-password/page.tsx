"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRecaptchaToken } from "@/lib/recaptcha-client";

const schema = z.object({
  email: z.string().email("Enter a valid email")
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage({ params }: { params: { locale: string } }) {
  const t = useTranslations("auth");
  const [serverMessage, setServerMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" }
  });

  async function onSubmit(values: FormValues) {
    setServerMessage("");
    const captchaToken = await getRecaptchaToken("forgot_password");
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, locale: params.locale, captchaToken })
    });
    const data = (await response.json().catch(() => null)) as { message?: string } | null;
    setServerMessage(data?.message || t("sendReset"));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="surface-card w-full space-y-4 p-6"
    >
      <h1 className="text-center text-2xl font-semibold">{t("forgotTitle")}</h1>

      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <Input placeholder={t("email")} type="email" {...register("email")} aria-invalid={!!errors.email} />
        {errors.email ? <p className="text-xs text-red-700">{errors.email.message}</p> : null}

        {serverMessage ? <p className="text-sm text-emerald-700">{serverMessage}</p> : null}
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "..." : t("sendReset")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        <Link className="underline" href={`/${params.locale}/login`}>
          {t("backToLogin")}
        </Link>
      </p>
    </motion.div>
  );
}
