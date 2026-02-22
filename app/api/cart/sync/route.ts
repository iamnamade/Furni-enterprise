import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { z } from "zod";
import { isValidCsrfRequest } from "@/lib/csrf";
import { applyRateLimitByKey } from "@/lib/rate-limit";
import { getClientIp, hasJsonContentType, isPayloadTooLarge } from "@/lib/request-guard";

const cartSyncSchema = z.array(
  z.object({
    productId: z.string().cuid(),
    quantity: z.number().int().min(1).max(99)
  })
).max(100);

export async function POST(request: Request) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);
    if (!hasJsonContentType(request)) return apiError("Expected application/json", 415);
    if (isPayloadTooLarge(request, 128 * 1024)) return apiError("Payload too large", 413);

    const ip = getClientIp(request);
    const rate = await applyRateLimitByKey(`cart-sync:${ip}`, 60, 60);
    if (!rate.success) return apiError("Too many requests", 429);

    const session = await getServerSession(authOptions);
    if (!session?.user) return apiError("Unauthorized", 401);

    const body = await request.json();
    const parsed = cartSyncSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Invalid input", 422);

    const deduped = new Map<string, number>();
    for (const item of parsed.data) {
      const currentQty = deduped.get(item.productId) ?? 0;
      deduped.set(item.productId, Math.min(99, currentQty + item.quantity));
    }

    const items = Array.from(deduped.entries()).map(([productId, quantity]) => ({
      productId,
      quantity
    }));

    if (items.length > 0) {
      const validProductCount = await prisma.product.count({
        where: { id: { in: items.map((item) => item.productId) } }
      });
      if (validProductCount !== items.length) {
        return apiError("Cart contains invalid products", 422);
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { userId: session.user.id } });
      if (items.length > 0) {
        await tx.cartItem.createMany({
          data: items.map((item) => ({
            userId: session.user.id,
            productId: item.productId,
            quantity: item.quantity
          }))
        });
      }
    });

    return Response.json({ success: true });
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}
