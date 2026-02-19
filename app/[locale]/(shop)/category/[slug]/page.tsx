import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/product-card";
import { CATEGORY_META_BY_SLUG } from "@/lib/category-taxonomy";
import { localizeCategoryDescription, localizeCategoryName, localizeProductName } from "@/lib/product-i18n";
import { getDiscountView } from "@/lib/pricing";

type Props = {
  params: { locale: string; slug: string };
  searchParams: {
    search?: string;
    min?: string;
    max?: string;
    sort?: "newest" | "price-asc" | "price-desc";
  };
};

export async function generateMetadata({ params }: Omit<Props, "searchParams">): Promise<Metadata> {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!category) return {};

  const title = localizeCategoryName(category.slug, category.name, params.locale);
  const description = localizeCategoryDescription(category.slug, category.description || category.name, params.locale);

  return {
    title: `${title} | Furni Enterprise`,
    description
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [tNav, tShop] = await Promise.all([getTranslations("nav"), getTranslations("shop")]);
  const category = await prisma.category.findUnique({
    where: { slug: params.slug }
  });

  if (!category) notFound();

  const search = (searchParams.search || "").trim().toLowerCase();
  const min = Number(searchParams.min || 0);
  const max = Number(searchParams.max || 999999);
  const sort = searchParams.sort || "newest";

  const rawProducts = await prisma.product.findMany({
    where: { categoryId: category.id },
    orderBy: { createdAt: "desc" }
  });

  const products = rawProducts
    .map((product) => ({
      ...getDiscountView(Number(product.price), product.discountPct),
      id: product.id,
      slug: product.slug,
      name: localizeProductName(product.slug, product.name, params.locale),
      imageUrl: product.imageUrl,
      createdAt: product.createdAt
    }))
    .filter((product) => {
      const inSearch = search ? product.name.toLowerCase().includes(search) : true;
      const inPrice = product.price >= min && product.price <= max;
      return inSearch && inPrice;
    });

  const sorted = [...products];
  if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  if (sort === "newest") sorted.sort((a, b) => +b.createdAt - +a.createdAt);

  const title = localizeCategoryName(category.slug, category.name, params.locale);
  const description = localizeCategoryDescription(category.slug, category.description || category.name, params.locale);
  const coverImage = CATEGORY_META_BY_SLUG[category.slug]?.coverImage || "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1800&q=80";

  return (
    <div className="space-y-8">
      <nav aria-label="Breadcrumb" className="text-sm text-white/75">
        <ol className="flex items-center gap-2">
          <li>
            <Link href={`/${params.locale}`} className="hover:text-white">
              {tNav("home")}
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/${params.locale}/shop`} className="hover:text-white">
              {tNav("shop")}
            </Link>
          </li>
          <li>/</li>
          <li className="text-brand-secondary">{title}</li>
        </ol>
      </nav>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div className="relative h-[240px] w-full sm:h-[300px]">
          <Image src={coverImage} alt={title} fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#102C26] via-[#102C26]/45 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/85">{description}</p>
          </div>
        </div>
      </section>

      {sorted.length === 0 ? (
        <section className="glass-panel py-12 text-center">
          <p className="text-lg font-semibold">{tShop("noProducts")}</p>
          <p className="mt-2 text-sm text-white/75">{tShop("adjustFilters")}</p>
        </section>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((product) => (
            <ProductCard key={product.id} locale={params.locale} product={product} />
          ))}
        </section>
      )}
    </div>
  );
}
