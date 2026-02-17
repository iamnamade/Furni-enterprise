"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { evaluatePasswordStrength } from "@/lib/password-strength";

export function PasswordStrength({ password }: { password: string }) {
  const t = useTranslations("auth");
  if (!password) return null;
  const state = evaluatePasswordStrength(password);
  const width = `${Math.max(10, (state.score / 5) * 100)}%`;
  const color =
    state.label === "weak"
      ? "bg-red-500"
      : state.label === "medium"
        ? "bg-orange-400"
        : "bg-emerald-500";

  return (
    <div className="space-y-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`h-full ${color}`}
          initial={{ width: "0%" }}
          animate={{ width }}
          transition={{ duration: 0.25 }}
        />
      </div>
      <p className="text-xs text-white/75">
        {state.label === "weak" ? t("passwordWeak") : state.label === "medium" ? t("passwordMedium") : t("passwordStrong")}
      </p>
    </div>
  );
}
