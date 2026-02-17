import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Boxes, ClipboardList, Shapes, Users } from "lucide-react";

export default async function AdminPage() {
  const tAdmin = await getTranslations("admin");
  const [products, categories, orders, users] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.user.count()
  ]);

  return (
    <div className="space-y-8">
      <h1 className="section-title">{tAdmin("dashboard")}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: tAdmin("products"), value: products, icon: Boxes },
          { label: tAdmin("categories"), value: categories, icon: Shapes },
          { label: tAdmin("orders"), value: orders, icon: ClipboardList },
          { label: tAdmin("users"), value: users, icon: Users }
        ].map((stat) => {
          const Icon = stat.icon;
          return (
          <div key={stat.label} className="surface-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">{stat.label}</p>
              <Icon className="h-5 w-5 text-brand-secondary" />
            </div>
            <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
          </div>
          );
        })}
      </div>
    </div>
  );
}
