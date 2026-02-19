"use client";

import { useState } from "react";
import { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useToastStore } from "@/lib/toast-store";
import { currency } from "@/lib/utils";

type AdminOrder = {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      imageUrl: string;
    };
  }>;
};

const ORDER_STATUSES: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"];

export function OrderManager({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const pushToast = useToastStore((state) => state.push);
  const [orders, setOrders] = useState(initialOrders);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function updateStatus(orderId: string, status: OrderStatus) {
    setLoadingId(orderId);
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    setLoadingId(null);
    if (!response.ok) {
      pushToast({ title: "Update failed", message: "Could not change order status." });
      return;
    }

    setOrders((state) => state.map((order) => (order.id === orderId ? { ...order, status } : order)));
    pushToast({ title: "Order updated", message: `Status changed to ${status}.` });
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-brand-primary/15">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead className="bg-brand-primary/8 text-left">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-brand-primary/10 align-top">
                <td className="px-4 py-3 font-medium">#{order.id.slice(0, 8)}</td>
                <td className="px-4 py-3">
                  <p>{order.user.name || "-"}</p>
                  <p className="text-xs text-muted">{order.user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    {order.orderItems.map((item) => (
                      <p key={item.id} className="text-xs">
                        {item.quantity} x {item.product.name}
                      </p>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">{currency(order.totalAmount)}</td>
                <td className="px-4 py-3">
                  <select
                    className="h-10 rounded-xl border border-brand-primary/20 bg-[color:var(--surface)] px-3 text-xs"
                    value={order.status}
                    onChange={(event) => updateStatus(order.id, event.target.value as OrderStatus)}
                    disabled={loadingId === order.id}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-muted">{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex">
        <Button variant="secondary" onClick={() => location.reload()} className="w-full sm:ml-auto sm:w-auto">
          Refresh
        </Button>
      </div>
    </div>
  );
}
