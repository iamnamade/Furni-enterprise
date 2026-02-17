import { prisma } from "@/lib/prisma";
import { OrderManager } from "@/components/admin/order-manager";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, email: true, name: true } },
      orderItems: {
        include: {
          product: { select: { id: true, name: true, imageUrl: true } }
        }
      }
    }
  });

  const initialOrders = orders.map((order) => ({
    id: order.id,
    status: order.status,
    totalAmount: Number(order.totalAmount),
    createdAt: order.createdAt.toISOString(),
    user: order.user,
    orderItems: order.orderItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      product: item.product
    }))
  }));

  return (
    <div className="space-y-4">
      <h1 className="section-title">Orders</h1>
      <OrderManager initialOrders={initialOrders} />
    </div>
  );
}

