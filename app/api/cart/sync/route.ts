import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { z } from "zod";
import { isValidCsrfRequest } from "@/lib/csrf";
import { applyRateLimitByKey } from "@/lib/rate-limit";

const cartSyncSchema = z.array(
  z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive()
  })
);

export async function POST(request: Request) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);

    const ip = (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown")
      .split(",")[0]
      .trim();
    const rate = await applyRateLimitByKey(`cart-sync:${ip}`, 60, 60);
    if (!rate.success) return apiError("Too many requests", 429);

    const session = await getServerSession(authOptions);
    if (!session?.user) return apiError("Unauthorized", 401);

    const body = await request.json();
    const parsed = cartSyncSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.message, 422);

    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { userId: session.user.id } });
      if (parsed.data.length > 0) {
        await tx.cartItem.createMany({
          data: parsed.data.map((item) => ({
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
