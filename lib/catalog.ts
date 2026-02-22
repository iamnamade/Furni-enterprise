import { Category, Product } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

type ProductWithCategory = Pick<Product, "id" | "slug" | "name" | "price" | "imageUrl" | "discountPct" | "createdAt"> & {
  category: Pick<Category, "id" | "name" | "slug">;
};

type FeaturedProduct = Pick<Product, "id" | "slug" | "name" | "price" | "imageUrl" | "discountPct">;

export const DEFAULT_CATALOG_LIMIT = 30;
export const MAX_CATALOG_LIMIT = 300;

async function withRouteCache<T>(
  keyParts: string[],
  revalidate: number,
  query: () => Promise<T>
): Promise<T> {
  const cachedQuery = unstable_cache(query, keyParts, { revalidate });
  return cachedQuery();
}

export async function getAllProducts(limit = DEFAULT_CATALOG_LIMIT): Promise<ProductWithCategory[]> {
  const safeLimit = Math.max(1, Math.min(limit, MAX_CATALOG_LIMIT));

  try {
    return await withRouteCache(
      ["catalog", "products", "all", String(safeLimit)],
      300,
      async () =>
        prisma.product.findMany({
          select: {
            id: true,
            slug: true,
            name: true,
            price: true,
            imageUrl: true,
            discountPct: true,
            createdAt: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          take: safeLimit
        })
    );
  } catch {
    return [];
  }
}

export async function getFeaturedProducts(limit = 6): Promise<FeaturedProduct[]> {
  const safeLimit = Math.max(1, Math.min(limit, 12));

  try {
    return await withRouteCache(
      ["catalog", "products", "featured", String(safeLimit)],
      300,
      async () =>
        prisma.product.findMany({
          where: { featured: true },
          select: {
            id: true,
            slug: true,
            name: true,
            price: true,
            imageUrl: true,
            discountPct: true
          },
          orderBy: { createdAt: "desc" },
          take: safeLimit
        })
    );
  } catch {
    return [];
  }
}

export async function getNewestProducts(limit = 8): Promise<FeaturedProduct[]> {
  const safeLimit = Math.max(1, Math.min(limit, MAX_CATALOG_LIMIT));

  try {
    return await withRouteCache(
      ["catalog", "products", "newest", String(safeLimit)],
      300,
      async () =>
        prisma.product.findMany({
          select: {
            id: true,
            slug: true,
            name: true,
            price: true,
            imageUrl: true,
            discountPct: true
          },
          orderBy: { createdAt: "desc" },
          take: safeLimit
        })
    );
  } catch {
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    return await withRouteCache(["catalog", "categories", "all"], 600, async () =>
      prisma.category.findMany({ orderBy: { name: "asc" } })
    );
  } catch {
    return [];
  }
}
