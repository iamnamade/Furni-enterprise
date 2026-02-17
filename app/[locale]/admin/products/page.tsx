import { prisma } from "@/lib/prisma";
import { ProductManager } from "@/components/admin/product-manager";
import { getTranslations } from "next-intl/server";

export default async function AdminProductsPage() {
  const tAdmin = await getTranslations("admin");
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } })
  ]);

  const initialProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    imageUrl: product.imageUrl,
    featured: product.featured,
    discountPct: product.discountPct,
    stock: product.stock,
    categoryId: product.categoryId,
    categoryName: product.category.name
  }));

  const categoryList = categories.map((category) => ({ id: category.id, name: category.name, slug: category.slug }));

  return (
    <div className="space-y-4">
      <h1 className="section-title">{tAdmin("products")}</h1>
      <ProductManager initialProducts={initialProducts} categories={categoryList} />
    </div>
  );
}
