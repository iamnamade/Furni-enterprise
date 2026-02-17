"use client";

import { useState } from "react";
import { z } from "zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRecaptchaToken } from "@/lib/recaptcha-client";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters")
});

type FormValues = z.infer<typeof schema>;

const ERROR_MAP: Record<string, string> = {
  INVALID_CREDENTIALS: "invalidCredentials",
  TOO_MANY_REQUESTS: "tooManyRequests",
  CAPTCHA_FAILED: "captchaFailed",
  VALIDATION_FAILED: "invalidCredentials"
};

export default function LoginPage({ params }: { params: { locale: string } }) {
  const t = useTranslations("auth");
  const pick = (en: string, ka: string, ru: string) => (params.locale === "ka" ? ka : params.locale === "ru" ? ru : en);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: FormValues) {
    setServerError("");
    const captchaToken = await getRecaptchaToken("login");

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      captchaToken,
      redirect: false
    });

    if (result?.error) {
      const key = ERROR_MAP[result.error] || "invalidCredentials";
      setServerError(t(key));
      return;
    }

    router.push(`/${params.locale}`);
    router.refresh();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="surface-card w-full space-y-4 p-6"
    >
      <h1 className="text-center text-2xl font-semibold">{t("loginTitle")}</h1>
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <Input placeholder={t("email")} type="email" {...register("email")} aria-invalid={!!errors.email} />
        {errors.email ? <p className="text-xs text-red-700">{errors.email.message}</p> : null}

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
        {errors.password ? <p className="text-xs text-red-700">{errors.password.message}</p> : null}

        <div className="flex items-center justify-between">
          <Link className="text-xs text-muted hover:underline" href={`/${params.locale}/forgot-password`}>
            {t("forgotPassword")}
          </Link>
        </div>

        {serverError ? <p className="text-sm text-red-700">{serverError}</p> : null}
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("signingIn") : t("login")}
        </Button>
      </form>

      {process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true" ? (
        <Button
          variant="secondary"
          className="w-full"
          disabled={googleLoading}
          onClick={async () => {
            setGoogleLoading(true);
            await signIn("google", { callbackUrl: `/${params.locale}` });
          }}
        >
          {pick("Continue with Google", "Google-ით გაგრძელება", "Продолжить через Google")}
        </Button>
      ) : null}

      <p className="text-center text-sm text-muted">
        {t("noAccount")}{" "}
        <Link className="underline" href={`/${params.locale}/register`}>
          {t("register")}
        </Link>
      </p>
    </motion.div>
  );
}
