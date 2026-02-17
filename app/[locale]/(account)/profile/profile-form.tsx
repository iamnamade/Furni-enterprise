"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currency } from "@/lib/utils";
import { useToastStore } from "@/lib/toast-store";

type ProfileFormProps = {
  locale: string;
  initial: {
    userId: string;
    name: string;
    email: string;
    totalSpent: number;
    orders: Array<{
      id: string;
      createdAt: string;
      totalAmount: number;
      status: string;
      items: string[];
    }>;
  };
};

export function ProfileForm({ initial, locale }: ProfileFormProps) {
  const t = useTranslations("account");
  const tr = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
  const pushToast = useToastStore((state) => state.push);
  const [name, setName] = useState(initial.name);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [wallet] = useState(0);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  async function onSave() {
    setLoading(true);
    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    setLoading(false);

    if (!response.ok) {
      pushToast({ title: tr("saveFailed", "Save failed"), message: tr("saveFailedMessage", "Could not update profile.") });
      return;
    }

    pushToast({ title: tr("profileUpdated", "Profile updated") });
  }

  async function onSavePassword() {
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      pushToast({ title: tr("passwordMismatch", "New passwords do not match") });
      return;
    }
    setPasswordLoading(true);
    const response = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
    });
    setPasswordLoading(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      pushToast({ title: tr("passwordChangeFailed", "Password change failed"), message: data?.message || tr("saveFailedMessage", "Could not update profile.") });
      return;
    }
    setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    pushToast({ title: tr("passwordChanged", "Password updated") });
  }

  return (
    <div className="space-y-5">
      <div className="surface-card space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-white/70">{t("profile")}</p>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder={tr("name", "Name")} />
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-white/70">{tr("email", "Email")}</p>
            <Input value={initial.email} disabled />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/70">{t("totalSpent")}</p>
            <p className="mt-1 text-lg font-semibold text-brand-secondary">{currency(initial.totalSpent)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/70">{tr("wallet", "Wallet")}</p>
            <p className="mt-1 text-lg font-semibold text-brand-secondary">{currency(wallet)}</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onSave} disabled={loading}>
            {loading ? tr("saving", "Saving...") : tr("saveProfile", "Save profile")}
          </Button>
        </div>
      </div>

      <div className="surface-card space-y-4 p-6">
        <h2 className="text-lg font-semibold">{tr("addressManagement", "Address management")}</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Input value={address} onChange={(event) => setAddress(event.target.value)} placeholder={tr("address", "Address")} />
          <Input value={city} onChange={(event) => setCity(event.target.value)} placeholder={tr("city", "City")} />
          <Input value={zip} onChange={(event) => setZip(event.target.value)} placeholder={tr("zip", "Zip")} />
        </div>
        <div className="flex justify-end">
          <Button variant="secondary">{tr("saveAddress", "Save address")}</Button>
        </div>
      </div>

      <div className="surface-card space-y-4 p-6">
        <h2 className="text-lg font-semibold">{tr("changePassword", "Change password")}</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            type="password"
            placeholder={tr("currentPassword", "Current password")}
            value={passwordForm.currentPassword}
            onChange={(event) => setPasswordForm((state) => ({ ...state, currentPassword: event.target.value }))}
          />
          <Input
            type="password"
            placeholder={tr("newPassword", "New password")}
            value={passwordForm.newPassword}
            onChange={(event) => setPasswordForm((state) => ({ ...state, newPassword: event.target.value }))}
          />
          <Input
            type="password"
            placeholder={tr("confirmNewPassword", "Confirm new password")}
            value={passwordForm.confirmNewPassword}
            onChange={(event) => setPasswordForm((state) => ({ ...state, confirmNewPassword: event.target.value }))}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={onSavePassword} disabled={passwordLoading}>
            {passwordLoading ? tr("saving", "Saving...") : tr("savePassword", "Save password")}
          </Button>
        </div>
      </div>

      <div className="surface-card space-y-4 p-6">
        <h2 className="text-lg font-semibold">{t("orders")}</h2>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-white/5 text-left">
              <tr>
                <th className="px-4 py-3">{tr("orderId", "Order ID")}</th>
                <th className="px-4 py-3">{tr("date", "Date")}</th>
                <th className="px-4 py-3">{tr("itemsLabel", "Items")}</th>
                <th className="px-4 py-3">{tr("totalLabel", "Total")}</th>
                <th className="px-4 py-3">{tr("status", "Status")}</th>
              </tr>
            </thead>
            <tbody>
              {initial.orders.map((order) => (
                <tr key={order.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-medium">#{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{order.items.join(", ")}</td>
                  <td className="px-4 py-3">{currency(order.totalAmount)}</td>
                  <td className="px-4 py-3">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="surface-card flex flex-wrap items-center justify-between gap-3 p-6">
        <Link href={`/${locale}/shop`} className="link-underline text-sm text-brand-secondary">
          {tr("wishlist", "Wishlist/Favorites")}
        </Link>
        <Button variant="danger" onClick={() => signOut({ callbackUrl: `/${locale}` })}>
          {t("logout")}
        </Button>
      </div>
    </div>
  );
}
