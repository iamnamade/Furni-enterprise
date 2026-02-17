import { prisma } from "@/lib/prisma";

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function AdminAnalyticsPage({ params }: { params: { locale: string } }) {
  const t = {
    en: {
      title: "Analytics dashboard",
      revenue30d: "Revenue (30d)",
      orders30d: "Orders (30d)",
      storeStats: "Store stats",
      users: "Users",
      products: "Products",
      salesOverTime: "Sales over time",
      last30Days: "Last 30 days",
      topProducts: "Top products",
      product: "Product",
      unitsSold: "Units sold"
    },
    ka: {
      title: "ანალიტიკის დაფა",
      revenue30d: "შემოსავალი (30 დღე)",
      orders30d: "შეკვეთები (30 დღე)",
      storeStats: "მაღაზიის სტატისტიკა",
      users: "მომხმარებლები",
      products: "პროდუქტები",
      salesOverTime: "გაყიდვები დროში",
      last30Days: "ბოლო 30 დღე",
      topProducts: "ტოპ პროდუქტები",
      product: "პროდუქტი",
      unitsSold: "გაყიდული რაოდენობა"
    },
    ru: {
      title: "Панель аналитики",
      revenue30d: "Выручка (30 дн.)",
      orders30d: "Заказы (30 дн.)",
      storeStats: "Статистика магазина",
      users: "Пользователи",
      products: "Товары",
      salesOverTime: "Продажи по времени",
      last30Days: "Последние 30 дней",
      topProducts: "Топ товары",
      product: "Товар",
      unitsSold: "Продано"
    }
  } as const;
  const locale = params.locale === "ka" || params.locale === "ru" ? params.locale : "en";
  const dict = t[locale];
  const now = new Date();
  const from = new Date(now);
  from.setDate(now.getDate() - 30);

  const [orders, usersCount, productsCount] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: from } },
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: "asc" }
    }),
    prisma.user.count(),
    prisma.product.count()
  ]);

  const salesByDayMap = new Map<string, number>();
  for (let i = 0; i < 30; i += 1) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    salesByDayMap.set(dayKey(d), 0);
  }

  const topProductsMap = new Map<string, { name: string; qty: number }>();
  let revenue = 0;
  for (const order of orders) {
    revenue += Number(order.totalAmount);
    const key = dayKey(order.createdAt);
    salesByDayMap.set(key, (salesByDayMap.get(key) || 0) + Number(order.totalAmount));
    for (const item of order.orderItems) {
      const prev = topProductsMap.get(item.productId);
      topProductsMap.set(item.productId, {
        name: item.product.name,
        qty: (prev?.qty || 0) + item.quantity
      });
    }
  }

  const salesByDay = [...salesByDayMap.entries()].map(([date, value]) => ({ date, value }));
  const maxSales = Math.max(...salesByDay.map((entry) => entry.value), 1);
  const topProducts = [...topProductsMap.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="section-title">{dict.title}</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="surface-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted">{dict.revenue30d}</p>
          <p className="mt-2 text-3xl font-semibold">${revenue.toFixed(2)}</p>
        </article>
        <article className="surface-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted">{dict.orders30d}</p>
          <p className="mt-2 text-3xl font-semibold">{orders.length}</p>
        </article>
        <article className="surface-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted">{dict.storeStats}</p>
          <p className="mt-2 text-sm text-muted">
            {dict.users}: <span className="font-semibold text-[color:var(--foreground)]">{usersCount}</span> | {dict.products}:{" "}
            <span className="font-semibold text-[color:var(--foreground)]">{productsCount}</span>
          </p>
        </article>
      </div>

      <section className="surface-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{dict.salesOverTime}</h2>
          <p className="text-xs text-muted">{dict.last30Days}</p>
        </div>
        <div className="flex h-56 items-end gap-1 overflow-x-auto rounded-xl border border-white/10 bg-black/10 px-2 py-3">
          {salesByDay.map((entry) => (
            <div key={entry.date} className="group flex min-w-[10px] flex-1 flex-col items-center justify-end">
              <div
                className="w-full rounded-t bg-brand-secondary/75"
                style={{ height: `${Math.max(4, (entry.value / maxSales) * 180)}px` }}
                title={`${entry.date}: $${entry.value.toFixed(2)}`}
                aria-label={`${entry.date}: $${entry.value.toFixed(2)}`}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card p-5">
        <h2 className="mb-3 text-lg font-semibold">{dict.topProducts}</h2>
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-white/5 text-left">
              <tr>
                <th className="px-4 py-3">{dict.product}</th>
                <th className="px-4 py-3">{dict.unitsSold}</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product) => (
                <tr key={product.name} className="border-t border-white/10">
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">{product.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
