import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductClient from "./product-client";

type Props = {
  params: { slug: string; locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.imageUrl],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
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
    id: item.id,
    slug: item.slug,
    name: item.name,
    price: Number(item.price),
    imageUrl: item.imageUrl
  }));

  const gallery = [product.imageUrl];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [product.imageUrl],
    description: product.description,
    brand: "Furni Enterprise",
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: Number(product.price),
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
          name: product.name,
          imageUrl: product.imageUrl,
          price: Number(product.price),
          stock: product.stock,
          category: product.category.name,
          description: product.description
        }}
        gallery={gallery}
        relatedProducts={relatedProducts}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd }} />
    </>
  );
}
