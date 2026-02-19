import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductClient from "./product-client";
import { localizeCategoryName, localizeProductDescription, localizeProductName } from "@/lib/product-i18n";
import { getDiscountView } from "@/lib/pricing";

type Props = {
  params: { slug: string; locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) return {};
  const localizedName = localizeProductName(product.slug, product.name, params.locale);
  const localizedDescription = localizeProductDescription(product.slug, product.description, params.locale);

  return {
    title: localizedName,
    description: localizedDescription,
    openGraph: {
      title: localizedName,
      description: localizedDescription,
      images: [product.imageUrl],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: localizedName,
      description: localizedDescription,
      images: [product.imageUrl]
    }
  };
}

export default async function ProductDetailsPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true }
  });

  if (!product) notFound();

  const relatedRaw = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id }
    },
    orderBy: { createdAt: "desc" },
    take: 3
  });

  const relatedProducts = relatedRaw.map((item) => ({
    ...getDiscountView(Number(item.price), item.discountPct),
    id: item.id,
    slug: item.slug,
    name: localizeProductName(item.slug, item.name, params.locale),
    imageUrl: item.imageUrl
  }));

  const gallery = [product.imageUrl];

  const localizedName = localizeProductName(product.slug, product.name, params.locale);
  const localizedDescription = localizeProductDescription(product.slug, product.description, params.locale);
  const localizedCategory = localizeCategoryName(product.category.slug, product.category.name, params.locale);
  const discountView = getDiscountView(Number(product.price), product.discountPct);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: localizedName,
    image: [product.imageUrl],
    description: localizedDescription,
    brand: "Furni Enterprise",
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: discountView.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };
  const safeJsonLd = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <>
      <ProductClient
        locale={params.locale}
        product={{
          productId: product.id,
          name: localizedName,
          slug: product.slug,
          imageUrl: product.imageUrl,
          price: discountView.price,
          originalPrice: discountView.originalPrice,
          discountPct: discountView.discountPct,
          stock: product.stock,
          category: localizedCategory,
          categorySlug: product.category.slug,
          description: localizedDescription
        }}
        gallery={gallery}
        relatedProducts={relatedProducts}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd }} />
    </>
  );
}
