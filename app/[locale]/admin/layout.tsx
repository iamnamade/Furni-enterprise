import { ReactNode } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth-guard";

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export default async function AdminLayout({ children, params }: Props) {
  const tAdmin = await getTranslations("admin");
  const analyticsLabel = tAdmin.has("analytics")
    ? tAdmin("analytics")
    : params.locale === "ka"
      ? "ანალიტიკა"
      : params.locale === "ru"
        ? "Аналитика"
        : "Analytics";
  await requireAdmin(params.locale);

  const links = [
    { href: `/${params.locale}/admin`, label: tAdmin("dashboard") },
    { href: `/${params.locale}/admin/products`, label: tAdmin("products") },
    { href: `/${params.locale}/admin/analytics`, label: analyticsLabel },
    { href: `/${params.locale}/admin/orders`, label: tAdmin("orders") },
    { href: `/${params.locale}/admin/users`, label: tAdmin("users") },
    { href: `/${params.locale}/admin/categories`, label: tAdmin("categories") }
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="surface-card h-fit p-4">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{tAdmin("panel")}</p>
        <nav className="space-y-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="block rounded-xl px-3 py-2 text-sm hover:bg-brand-primary/10">
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section>{children}</section>
    </div>
  );
}
