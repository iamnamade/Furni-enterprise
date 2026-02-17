import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { currency } from "@/lib/utils";

export default async function OrderHistoryPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations("account");
  const tr = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
  const user = await requireUser(params.locale);
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { orderItems: true },
    orderBy: { createdAt: "desc" }
  });
  const totalSpent = orders.reduce((acc, order) => acc + Number(order.totalAmount), 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface-card p-4">
          <p className="text-xs uppercase tracking-wide text-white/70">{t("orders")}</p>
          <p className="mt-1 text-2xl font-semibold text-brand-secondary">{orders.length}</p>
        </div>
        <div className="surface-card p-4 sm:col-span-2">
          <p className="text-xs uppercase tracking-wide text-white/70">{t("totalSpent")}</p>
          <p className="mt-1 text-2xl font-semibold text-brand-secondary">{currency(totalSpent)}</p>
        </div>
      </div>
      <h1 className="section-title">{t("orders")}</h1>
      <div className="overflow-hidden rounded-2xl border border-brand-primary/15">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-brand-primary/8 text-left">
            <tr>
              <th className="px-4 py-3">{tr("orderId", "Order")}</th>
              <th className="px-4 py-3">{tr("itemsLabel", "Items")}</th>
              <th className="px-4 py-3">{tr("status", "Status")}</th>
              <th className="px-4 py-3">{tr("totalLabel", "Total")}</th>
              <th className="px-4 py-3">{tr("date", "Date")}</th>
              <th className="px-4 py-3">{t("details")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-brand-primary/10">
                <td className="px-4 py-3 font-medium">#{order.id.slice(0, 8)}</td>
                <td className="px-4 py-3">{order.orderItems.length}</td>
                <td className="px-4 py-3">{order.status}</td>
                <td className="px-4 py-3">{currency(order.totalAmount.toString())}</td>
                <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Link href={`/${params.locale}/orders/${order.id}`} className="link-underline text-brand-secondary">
                    {t("details")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
