import { getAllProducts, getCategories } from "@/lib/catalog";
import { ShopClient } from "./shop-client";

export const revalidate = 120;

export default async function ShopPage({ params }: { params: { locale: string } }) {
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);

  const cards = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: Number(product.price),
    imageUrl: product.imageUrl,
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug
    },
    createdAt: product.createdAt.toISOString()
  }));

  const categoryList = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug
  }));

  return <ShopClient locale={params.locale} products={cards} categories={categoryList} />;
}