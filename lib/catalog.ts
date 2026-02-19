import { Category, Product } from "@prisma/client";
import { prisma } from "./prisma";
import { cacheGet, cacheSet } from "./redis";

type ProductWithCategory = Pick<Product, "id" | "slug" | "name" | "price" | "imageUrl" | "discountPct" | "createdAt"> & {
  category: Pick<Category, "id" | "name" | "slug">;
};

type FeaturedProduct = Pick<Product, "id" | "slug" | "name" | "price" | "imageUrl" | "discountPct">;

export const DEFAULT_CATALOG_LIMIT = 30;
export const MAX_CATALOG_LIMIT = 300;

export async function getAllProducts(limit = DEFAULT_CATALOG_LIMIT): Promise<ProductWithCategory[]> {
  const safeLimit = Math.max(1, Math.min(limit, MAX_CATALOG_LIMIT));
  const key = `products:list:${safeLimit}`;
  const cached = await cacheGet<ProductWithCategory[]>(key);
  if (cached) return cached;

  try {
    const products = await prisma.product.findMany({
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
    });

    await cacheSet(key, products, 300);
    return products;
  } catch {
    return [];
  }
}

export async function getFeaturedProducts(limit = 6): Promise<FeaturedProduct[]> {
  const safeLimit = Math.max(1, Math.min(limit, 12));
  const key = `featured:list:${safeLimit}`;
  const cached = await cacheGet<FeaturedProduct[]>(key);
  if (cached) return cached;

  try {
    const products = await prisma.product.findMany({
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
    });

    await cacheSet(key, products, 300);
    return products;
  } catch {
    return [];
  }
}

export async function getNewestProducts(limit = 8): Promise<FeaturedProduct[]> {
  const safeLimit = Math.max(1, Math.min(limit, MAX_CATALOG_LIMIT));
  const key = `products:newest:${safeLimit}`;
  const cached = await cacheGet<FeaturedProduct[]>(key);
  if (cached) return cached;

  try {
    const products = await prisma.product.findMany({
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
    });

    await cacheSet(key, products, 300);
    return products;
  } catch {
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  const key = "category:all";
  const cached = await cacheGet<Category[]>(key);
  if (cached) return cached;

  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    await cacheSet(key, categories, 600);
    return categories;
  } catch {
    return [];
  }
}
