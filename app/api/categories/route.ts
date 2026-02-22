import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { cacheDel, cacheGet, cacheSet } from "@/lib/redis";
import { categorySchema } from "@/lib/validators";
import { isValidCsrfRequest } from "@/lib/csrf";
import { requireAdminApi } from "@/lib/admin-api";
import { hasJsonContentType, isPayloadTooLarge } from "@/lib/request-guard";

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
    if (!hasJsonContentType(request)) return apiError("Expected application/json", 415);
    if (isPayloadTooLarge(request, 32 * 1024)) return apiError("Payload too large", 413);

    const auth = await requireAdminApi(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Invalid input", 422);

    const category = await prisma.category.create({ data: parsed.data });
    await cacheDel("category:*");
    return Response.json(category, { status: 201 });
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}
