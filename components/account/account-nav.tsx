"use client";

import Link from "next/link";
import { LogOut, Package, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

export function AccountNav({ locale }: { locale: string }) {
  const t = useTranslations("account");

  return (
    <aside className="surface-card h-fit space-y-3 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/70">{t("dashboard")}</p>
      <nav className="space-y-2">
        <Link href={`/${locale}/profile`} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/10">
          <User className="h-4 w-4 text-brand-secondary" />
          {t("profile")}
        </Link>
        <Link href={`/${locale}/orders`} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/10">
          <Package className="h-4 w-4 text-brand-secondary" />
          {t("orders")}
        </Link>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/10"
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
        >
          <LogOut className="h-4 w-4 text-brand-secondary" />
          {t("logout")}
        </button>
      </nav>
    </aside>
  );
}
