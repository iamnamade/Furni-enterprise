"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { getRecaptchaToken } from "@/lib/recaptcha-client";

const schema = z.object({
  password: z
    .string()
    .min(8, "Minimum 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, "Use uppercase, lowercase, number and special character")
});

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage({ params }: { params: { locale: string } }) {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" }
  });

  const passwordValue = watch("password");

  async function onSubmit(values: FormValues) {
    setServerError("");
    const token = searchParams.get("token");
    if (!token) {
      setServerError(t("resetFailed"));
      return;
    }

    const captchaToken = await getRecaptchaToken("reset_password");
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: values.password, captchaToken })
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      setServerError(data?.message || t("resetFailed"));
      return;
    }

    setSuccess(true);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="surface-card w-full space-y-4 p-6"
    >
      <h1 className="text-center text-2xl font-semibold">{t("resetTitle")}</h1>

      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={t("password")}
            {...register("password")}
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <PasswordStrength password={passwordValue || ""} />
        {errors.password ? <p className="text-xs text-red-700">{errors.password.message}</p> : null}
        {serverError ? <p className="text-sm text-red-700">{serverError}</p> : null}
        {success ? <p className="text-sm text-emerald-700">{t("resetSuccess")}</p> : null}

        <Button className="w-full" type="submit" disabled={isSubmitting || success}>
          {isSubmitting ? "..." : t("resetTitle")}
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

