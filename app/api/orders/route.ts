import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return apiError("Unauthorized", 401);

    const where = session.user.role === "ADMIN" ? {} : { userId: session.user.id };

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return Response.json(orders);
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}
