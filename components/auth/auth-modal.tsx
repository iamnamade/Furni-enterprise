"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { getRecaptchaToken } from "@/lib/recaptcha-client";

type AuthModalProps = {
  open: boolean;
  locale: string;
  onClose: () => void;
};

const ERROR_MAP: Record<string, string> = {
  INVALID_CREDENTIALS: "invalidCredentials",
  TOO_MANY_REQUESTS: "tooManyRequests",
  CAPTCHA_FAILED: "captchaFailed",
  VALIDATION_FAILED: "invalidCredentials"
};

export function AuthModal({ open, locale, onClose }: AuthModalProps) {
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const pick = (en: string, ka: string, ru: string) => (locale === "ka" ? ka : locale === "ru" ? ru : en);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });

  async function handleLogin() {
    setLoading(true);
    setError("");
    const captchaToken = await getRecaptchaToken("login");

    const result = await signIn("credentials", {
      email: loginForm.email,
      password: loginForm.password,
      captchaToken,
      redirect: false,
      callbackUrl: `/${locale}/account`
    });

    setLoading(false);
    if (result?.error) {
      const key = ERROR_MAP[result.error] || "invalidCredentials";
      setError(tAuth(key));
      return;
    }

    onClose();
    window.location.assign(result?.url || `/${locale}/account`);
  }

  async function handleRegister() {
    setLoading(true);
    setError("");
    const captchaToken = await getRecaptchaToken("register");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...registerForm, locale, captchaToken })
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(data?.message || tAuth("failedRegister"));
      setLoading(false);
      return;
    }

    const loginCaptcha = await getRecaptchaToken("login");
    const loginResult = await signIn("credentials", {
      email: registerForm.email,
      password: registerForm.password,
      captchaToken: loginCaptcha,
      redirect: false,
      callbackUrl: `/${locale}/account`
    });
    setLoading(false);
    onClose();
    window.location.assign(loginResult?.url || `/${locale}/account`);
  }

  return (
    <Modal open={open} title={tab === "login" ? tAuth("loginTitle") : tAuth("registerTitle")} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] p-1">
          <button
            type="button"
            className={`rounded-xl px-3 py-2 text-sm ${tab === "login" ? "bg-[color:var(--button-primary-bg)] text-[color:var(--button-primary-fg)]" : ""}`}
            onClick={() => setTab("login")}
          >
            {tAuth("login")}
          </button>
          <button
            type="button"
            className={`rounded-xl px-3 py-2 text-sm ${tab === "register" ? "bg-[color:var(--button-primary-bg)] text-[color:var(--button-primary-fg)]" : ""}`}
            onClick={() => setTab("register")}
          >
            {tAuth("register")}
          </button>
        </div>

        {tab === "login" ? (
          <div className="space-y-3">
            <Input
              type="email"
              placeholder={tAuth("email")}
              value={loginForm.email}
              onChange={(event) => setLoginForm((state) => ({ ...state, email: event.target.value }))}
            />
            <Input
              type="password"
              placeholder={tAuth("password")}
              value={loginForm.password}
              onChange={(event) => setLoginForm((state) => ({ ...state, password: event.target.value }))}
            />
            <div className="flex justify-end">
              <Link className="text-xs text-muted hover:underline" href={`/${locale}/forgot-password`}>
                {tAuth("forgotPassword")}
              </Link>
            </div>
            <Button className="w-full" onClick={handleLogin} disabled={loading}>
              {loading ? tCommon("loading") : tAuth("login")}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              placeholder={tAuth("fullName")}
              value={registerForm.name}
              onChange={(event) => setRegisterForm((state) => ({ ...state, name: event.target.value }))}
            />
            <Input
              type="email"
              placeholder={tAuth("email")}
              value={registerForm.email}
              onChange={(event) => setRegisterForm((state) => ({ ...state, email: event.target.value }))}
            />
            <Input
              type="password"
              placeholder={tAuth("password")}
              value={registerForm.password}
              onChange={(event) => setRegisterForm((state) => ({ ...state, password: event.target.value }))}
            />
            <PasswordStrength password={registerForm.password} />
            <Button className="w-full" onClick={handleRegister} disabled={loading}>
              {loading ? tCommon("loading") : tAuth("registerTitle")}
            </Button>
          </div>
        )}

        {process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true" ? (
          <Button
            variant="secondary"
            className="w-full"
            onClick={async () => {
              await signIn("google", { callbackUrl: `/${locale}/profile` });
            }}
          >
            {pick("Continue with Google", "Google-ით გაგრძელება", "Продолжить через Google")}
          </Button>
        ) : null}

        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </div>
    </Modal>
  );
}
