import { prisma } from "@/lib/prisma";
import { apiError, parseError } from "@/lib/errors";
import { productSchema } from "@/lib/validators";
import { requireAdminApi } from "@/lib/admin-api";
import { isValidCsrfRequest } from "@/lib/csrf";
import { cacheDel } from "@/lib/redis";
import { Prisma } from "@prisma/client";

function baseSlug(slug: string) {
  return slug.replace(/-\d+$/, "");
}

async function createProductWithUniqueSlug(data: Prisma.ProductUncheckedCreateInput) {
  let attempt = 1;
  let nextSlug = data.slug;
  const slugRoot = baseSlug(data.slug);

  while (attempt <= 50) {
    try {
      return await prisma.product.create({
        data: {
          ...data,
          slug: nextSlug
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        Array.isArray(error.meta?.target) &&
        error.meta?.target.includes("slug")
      ) {
        attempt += 1;
        nextSlug = `${slugRoot}-${attempt}`;
        continue;
      }
      throw error;
    }
  }

  throw new Error("Could not generate unique slug");
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdminApi(request);
    if (auth.error) return auth.error;

    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" }
    });

    return Response.json(products);
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}

export async function POST(request: Request) {
  try {
    if (!isValidCsrfRequest(request)) return apiError("Invalid CSRF origin", 403);

    const auth = await requireAdminApi(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Invalid input", 422);

    const product = await createProductWithUniqueSlug(parsed.data);
    await cacheDel("products:*");
    await cacheDel("featured:*");
    await cacheDel("category:*");

    return Response.json(product, { status: 201 });
  } catch (error) {
    return apiError(parseError(error), 500);
  }
}
