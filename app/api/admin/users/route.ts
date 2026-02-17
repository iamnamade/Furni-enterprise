import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { requireAdminApi } from "@/lib/admin-api";

export async function GET(request: Request) {
  try {
    const auth = await requireAdminApi(request);
    if (auth.error) return auth.error;

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return Response.json(users);
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}
