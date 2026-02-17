import { ReactNode } from "react";
import { requireUser } from "@/lib/auth-guard";
import { AccountNav } from "@/components/account/account-nav";

export default async function AccountLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  await requireUser(params.locale);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <AccountNav locale={params.locale} />
      <section className="min-w-0">{children}</section>
    </div>
  );
}
