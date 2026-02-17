import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { currency } from "@/lib/utils";

export default async function OrderDetailsPage({
  params
}: {
  params: { locale: string; id: string };
}) {
  const user = await requireUser(params.locale);

  const order = await prisma.order.findFirst({
    where: {
      id: params.id,
      userId: user.id
    },
    include: {
      orderItems: {
        include: { product: true }
      }
    }
  });

  if (!order) notFound();

  return (
    <div className="space-y-4">
      <h1 className="section-title">Order #{order.id.slice(0, 8)}</h1>
      <div className="surface-card space-y-3 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <p className="text-sm text-white/80">Status: <span className="text-brand-secondary">{order.status}</span></p>
          <p className="text-sm text-white/80">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
          <p className="text-sm text-white/80">Total: {currency(order.totalAmount.toString())}</p>
        </div>
        <div className="space-y-2 border-t border-white/10 pt-3">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span>{item.product.name} x {item.quantity}</span>
              <span className="text-brand-secondary">{currency((Number(item.price) * item.quantity).toString())}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
