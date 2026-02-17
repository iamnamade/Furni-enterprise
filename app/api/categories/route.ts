import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { cacheDel, cacheGet, cacheSet } from "@/lib/redis";
import { categorySchema } from "@/lib/validators";
import { isValidCsrfRequest } from "@/lib/csrf";

const CATEGORY_CACHE_KEY = "category:all";

export async function GET() {
  try {
    const cached = await cacheGet(CATEGORY_CACHE_KEY);
    if (cached) return Response.json({ source: "cache", data: cached });

    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" }
    });

    await cacheSet(CATEGORY_CACHE_KEY, categories, 600);
    return Response.json({ source: "db", data: categories });
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}

export async function POST(request: Request) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);

    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.message, 422);

    const category = await prisma.category.create({ data: parsed.data });
    await cacheDel("category:*");
    return Response.json(category, { status: 201 });
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}
