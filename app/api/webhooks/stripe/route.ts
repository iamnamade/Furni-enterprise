import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendOrderEmail } from "@/lib/email";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Missing webhook signature", { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const existing = await prisma.webhookEvent.findUnique({
    where: { eventId: event.id }
  });

  if (existing) {
    return new Response("Event already processed", { status: 200 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const order = await prisma.order.update({
          where: { id: orderId },
          data: { status: "PAID" },
          include: {
            orderItems: {
              include: { product: true }
            }
          }
        });

        await prisma.cartItem.deleteMany({ where: { userId: order.userId } });

        await sendOrderEmail({
          to: order.shippingEmail,
          orderId: order.id,
          total: order.totalAmount.toString(),
          shippingInfo: `${order.shippingName}\n${order.shippingAddress}\n${order.shippingCity}, ${order.shippingZip}\n${order.shippingCountry}`,
          items: order.orderItems.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price.toString()
          }))
        });
      }
    }

    await prisma.webhookEvent.create({
      data: {
        eventId: event.id,
        type: event.type
      }
    });

    return new Response("ok", { status: 200 });
  } catch {
    return new Response("Webhook handler error", { status: 500 });
  }
}
