import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { cacheDel, cacheGet, cacheSet } from "@/lib/redis";
import { productSchema } from "@/lib/validators";
import { isValidCsrfRequest } from "@/lib/csrf";

const PRODUCT_LIST_CACHE_KEY = "products:all";

export async function GET() {
  try {
    const cached = await cacheGet(PRODUCT_LIST_CACHE_KEY);
    if (cached) {
      return Response.json({ source: "cache", data: cached });
    }

    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" }
    });

    await cacheSet(PRODUCT_LIST_CACHE_KEY, products, 300);
    return Response.json({ source: "db", data: products });
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
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.message, 422);
    }

    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        price: parsed.data.price
      }
    });

    await cacheDel("products:*");
    await cacheDel("featured:*");
    await cacheDel("category:*");

    return Response.json(product, { status: 201 });
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}
