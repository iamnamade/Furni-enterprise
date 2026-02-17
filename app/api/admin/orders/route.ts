import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { requireAdminApi } from "@/lib/admin-api";

export async function GET(request: Request) {
  try {
    const auth = await requireAdminApi(request);
    if (auth.error) return auth.error;

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, name: true } },
        orderItems: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true }
            }
          }
        }
      }
    });

    return Response.json(orders);
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}
