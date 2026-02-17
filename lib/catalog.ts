import { Category, Product } from "@prisma/client";
import { prisma } from "./prisma";
import { cacheGet, cacheSet } from "./redis";

type ProductWithCategory = Product & {
  category: Category;
};

export async function getAllProducts(): Promise<ProductWithCategory[]> {
  const key = "products:all";
  const cached = await cacheGet<ProductWithCategory[]>(key);
  if (cached) return cached;

  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" }
    });

    await cacheSet(key, products, 300);
    return products;
  } catch {
    return [];
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const key = "featured:all";
  const cached = await cacheGet<Product[]>(key);
  if (cached) return cached;

  try {
    const products = await prisma.product.findMany({
      where: { featured: true },
      orderBy: { createdAt: "desc" },
      take: 6
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
