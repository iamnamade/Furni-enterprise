import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { getTranslations } from "next-intl/server";

export default async function AccountDashboardPage({ params }: { params: { locale: string } }) {
  const user = await requireUser(params.locale);
  const t = await getTranslations("account");

  const [profile, recentOrders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, email: true, createdAt: true }
    }),
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { orderItems: true },
      take: 8
    })
  ]);

  const totalSpent = recentOrders.reduce((acc, order) => acc + Number(order.totalAmount), 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="surface-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted">{t("profile")}</p>
          <p className="mt-2 text-lg font-semibold">{profile?.name || "-"}</p>
          <p className="text-sm text-muted">{profile?.email}</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted">{t("orders")}</p>
          <p className="mt-2 text-2xl font-semibold text-brand-primary dark:text-brand-secondary">{recentOrders.length}</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted">{t("totalSpent")}</p>
          <p className="mt-2 text-2xl font-semibold text-brand-primary dark:text-brand-secondary">${totalSpent.toFixed(2)}</p>
        </div>
      </section>

      <section className="surface-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-semibold">{t("orders")}</h2>
          <Link href={`/${params.locale}/orders`} className="text-sm text-brand-secondary hover:underline">
            {t("details")}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 text-left">
              <tr>
                <th className="px-4 py-3">{t("orderId")}</th>
                <th className="px-4 py-3">{t("date")}</th>
                <th className="px-4 py-3">{t("itemsLabel")}</th>
                <th className="px-4 py-3">{t("totalLabel")}</th>
                <th className="px-4 py-3">{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    {t("noOrdersYet")}
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-t border-white/10">
                    <td className="px-4 py-3 font-medium">{order.id.slice(0, 10)}...</td>
                    <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{order.orderItems.reduce((sum, item) => sum + item.quantity, 0)}</td>
                    <td className="px-4 py-3">${Number(order.totalAmount).toFixed(2)}</td>
                    <td className="px-4 py-3">{order.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
