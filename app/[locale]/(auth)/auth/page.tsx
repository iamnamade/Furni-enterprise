"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Input } from "@/components/ui/input";
import { getRecaptchaToken } from "@/lib/recaptcha-client";

export default function AuthEntryPage({ params }: { params: { locale: string } }) {
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });

  async function submitLogin() {
    setLoading(true);
    setError("");
    const captchaToken = await getRecaptchaToken("login");
    const result = await signIn("credentials", {
      email: loginForm.email,
      password: loginForm.password,
      captchaToken,
      redirect: false,
      callbackUrl: `/${params.locale}/account`
    });
    setLoading(false);
    if (result?.error) {
      setError(tAuth("invalidCredentials"));
      return;
    }
    window.location.assign(result?.url || `/${params.locale}/account`);
  }

  async function submitRegister() {
    setLoading(true);
    setError("");
    const captchaToken = await getRecaptchaToken("register");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...registerForm, locale: params.locale, captchaToken })
    });
    setLoading(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(data?.message || tAuth("failedRegister"));
      return;
    }
    setTab("login");
    setLoginForm({ email: registerForm.email, password: registerForm.password });
  }

  return (
    <div className="surface-card w-full max-w-lg space-y-5 p-8">
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
          <Input type="email" placeholder={tAuth("email")} value={loginForm.email} onChange={(event) => setLoginForm((s) => ({ ...s, email: event.target.value }))} />
          <div className="relative">
            <Input
              type={showLoginPassword ? "text" : "password"}
              placeholder={tAuth("password")}
              value={loginForm.password}
              onChange={(event) => setLoginForm((s) => ({ ...s, password: event.target.value }))}
              className="pr-12"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
              onClick={() => setShowLoginPassword((value) => !value)}
              aria-label={showLoginPassword ? "Hide password" : "Show password"}
            >
              {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex justify-end">
            <Link className="text-xs text-muted hover:underline" href={`/${params.locale}/forgot-password`}>
              {tAuth("forgotPassword")}
            </Link>
          </div>
          <Button className="w-full" disabled={loading} onClick={submitLogin}>
            {loading ? tCommon("loading") : tAuth("login")}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Input placeholder={tAuth("fullName")} value={registerForm.name} onChange={(event) => setRegisterForm((s) => ({ ...s, name: event.target.value }))} />
          <Input type="email" placeholder={tAuth("email")} value={registerForm.email} onChange={(event) => setRegisterForm((s) => ({ ...s, email: event.target.value }))} />
          <div className="relative">
            <Input
              type={showRegisterPassword ? "text" : "password"}
              placeholder={tAuth("password")}
              value={registerForm.password}
              onChange={(event) => setRegisterForm((s) => ({ ...s, password: event.target.value }))}
              className="pr-12"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
              onClick={() => setShowRegisterPassword((value) => !value)}
              aria-label={showRegisterPassword ? "Hide password" : "Show password"}
            >
              {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrength password={registerForm.password} />
          <Button className="w-full" disabled={loading} onClick={submitRegister}>
            {loading ? tCommon("loading") : tAuth("registerTitle")}
          </Button>
        </div>
      )}

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
