import { prisma } from "@/lib/prisma";

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  let products: Array<{ slug: string; updatedAt: Date }> = [];
  try {
    products = await prisma.product.findMany({ select: { slug: true, updatedAt: true } });
  } catch (error) {
    console.error("sitemap: failed to load products from database", error);
  }

  const staticRoutes = ["", "/shop", "/about", "/contact"];
  const locales = ["en", "ka", "ru"];

  const staticEntries = locales.flatMap((locale) =>
    staticRoutes.map((route) => ({
      url: `${base}/${locale}${route}`,
      lastModified: new Date()
    }))
  );

  const productEntries = locales.flatMap((locale) =>
    products.map((product) => ({
      url: `${base}/${locale}/product/${product.slug}`,
      lastModified: product.updatedAt
    }))
  );

  return [...staticEntries, ...productEntries];
}
