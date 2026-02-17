import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";
import { getTranslations } from "next-intl/server";

export default async function ProfilePage({ params }: { params: { locale: string } }) {
  const t = await getTranslations("account");
  const user = await requireUser(params.locale);

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      orders: {
        select: {
          id: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          orderItems: {
            select: {
              quantity: true,
              product: { select: { name: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!profile) return null;

  const totalSpent = profile.orders.reduce((acc, order) => acc + Number(order.totalAmount), 0);

  return (
    <div className="space-y-5">
      <h1 className="section-title">{t("profile")}</h1>
      <ProfileForm
        locale={params.locale}
        initial={{
          userId: profile.id,
          name: profile.name || "",
          email: profile.email,
          totalSpent,
          orders: profile.orders.map((order) => ({
            id: order.id,
            createdAt: order.createdAt.toISOString(),
            totalAmount: Number(order.totalAmount),
            status: order.status,
            items: order.orderItems.map((item) => `${item.quantity}x ${item.product.name}`)
          }))
        }}
      />
    </div>
  );
}
