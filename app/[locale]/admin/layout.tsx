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
    <div className="grid gap-4 lg:gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="surface-card h-fit p-3 lg:sticky lg:top-24 lg:p-4">
        <p className="mb-3 hidden text-sm font-semibold uppercase tracking-wide text-muted lg:block">{tAdmin("panel")}</p>
        <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:block lg:space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-xl px-2 py-2 text-center text-xs leading-tight hover:bg-brand-primary/10 sm:text-sm lg:px-3 lg:text-left"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
