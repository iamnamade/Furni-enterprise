import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { apiError, parseError } from "@/lib/errors";
import { checkoutSchema } from "@/lib/validators";
import { z } from "zod";
import { isValidCsrfRequest } from "@/lib/csrf";
import { applyRateLimitByKey } from "@/lib/rate-limit";
import { getClientIp, hasJsonContentType, isPayloadTooLarge } from "@/lib/request-guard";
import { locales } from "@/lib/i18n";

export async function POST(request: Request) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);
    if (!hasJsonContentType(request)) return apiError("Expected application/json", 415);
    if (isPayloadTooLarge(request, 256 * 1024)) return apiError("Payload too large", 413);

    const ip = getClientIp(request);
    const rate = await applyRateLimitByKey(`checkout:${ip}`, 20, 300);
    if (!rate.success) return apiError("Too many requests", 429);

    const session = await getServerSession(authOptions);
    if (!session?.user) return apiError("Unauthorized", 401);

    const body = await request.json();
    const checkoutPayloadSchema = checkoutSchema.extend({
      locale: z.enum(locales)
    });
    const parsed = checkoutPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Invalid input", 422);
    }
    const payload = parsed.data;

    const products = await prisma.product.findMany({
      where: { id: { in: payload.cartItems.map((item) => item.productId) } }
    });

    if (products.length === 0) return apiError("Cart is empty", 422);
    const productById = new Map(products.map((product) => [product.id, product]));
    if (productById.size !== new Set(payload.cartItems.map((item) => item.productId)).size) {
      return apiError("Cart contains invalid products", 422);
    }

    const lineItems = payload.cartItems.map((item) => {
      const product = productById.get(item.productId)!;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.imageUrl]
          },
          unit_amount: Math.round(Number(product.price) * 100)
        },
        quantity: item.quantity
      };
    });

    const total = payload.cartItems.reduce((acc, item) => {
      const p = productById.get(item.productId);
      return acc + Number(p?.price || 0) * item.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount: total,
        status: "PENDING",
        shippingName: payload.shippingName,
        shippingEmail: payload.shippingEmail,
        shippingAddress: payload.shippingAddress,
        shippingCity: payload.shippingCity,
        shippingCountry: payload.shippingCountry,
        shippingZip: payload.shippingZip,
        orderItems: {
          create: payload.cartItems.map((item) => {
            const product = productById.get(item.productId)!;
            return {
              productId: product.id,
              price: product.price,
              quantity: item.quantity
            };
          })
        }
      }
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${baseUrl}/${payload.locale}/order-confirmation?orderId=${order.id}`,
      cancel_url: `${baseUrl}/${payload.locale}/cart`,
      metadata: {
        orderId: order.id,
        userId: session.user.id
      }
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id }
    });

    return Response.json({ id: stripeSession.id, url: stripeSession.url });
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}
