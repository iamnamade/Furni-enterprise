"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Star, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/zustand-cart";
import { useToastStore } from "@/lib/toast-store";
import { ProductCard } from "@/components/shop/product-card";

type ProductClientProps = {
  locale: string;
  product: {
    productId: string;
    slug: string;
    name: string;
    imageUrl: string;
    price: number;
    originalPrice?: number;
    discountPct?: number;
    stock: number;
    category: string;
    categorySlug: string;
    description: string;
  };
  gallery: string[];
  relatedProducts: Array<{
    id: string;
    slug: string;
    name: string;
    price: number;
    originalPrice?: number;
    discountLabel?: string;
    imageUrl: string;
  }>;
};

export default function ProductClient({ locale, product, gallery, relatedProducts }: ProductClientProps) {
  const tProduct = useTranslations("product");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const addItem = useCartStore((state) => state.addItem);
  const pushToast = useToastStore((state) => state.push);
  const [activeImage, setActiveImage] = useState(gallery[0] || product.imageUrl);
  const [quantity, setQuantity] = useState(1);
  const [accordion, setAccordion] = useState<"details" | "materials" | "shipping">("details");
  const images = useMemo(() => Array.from(new Set([product.imageUrl, ...gallery])), [gallery, product.imageUrl]);

  const strings = {
    freeDelivery: tProduct("freeDelivery"),
    ratingLabel: tProduct("ratingLabel"),
    detailsTitle: tProduct("detailsTitle"),
    detailsText: tProduct("detailsText"),
    materialsTitle: tProduct("materialsTitle"),
    materialsText: tProduct("materialsText"),
    shippingTitle: tProduct("shippingTitle"),
    shippingText: tProduct("shippingText"),
    qualityNote: tProduct("qualityNote")
  };

  function addToCart() {
    for (let i = 0; i < quantity; i += 1) {
      addItem({
        productId: product.productId,
        name: product.name,
        imageUrl: product.imageUrl,
        price: product.price
      });
    }
    pushToast({ title: tProduct("addedToCart"), message: `${quantity} x ${product.name}`, href: `/${locale}/cart` });
  }

  return (
    <div className="space-y-14 pb-24">
      <nav aria-label="Breadcrumb" className="text-sm text-[color:var(--muted)]">
        <ol className="flex items-center gap-2">
          <li>
            <Link href={`/${locale}`} className="hover:text-[color:var(--foreground)]">
              {tNav("home")}
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/${locale}/shop`} className="hover:text-[color:var(--foreground)]">
              {tNav("shop")}
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/${locale}/category/${product.categorySlug}`} className="hover:text-[color:var(--foreground)]">
              {product.category}
            </Link>
          </li>
          <li>/</li>
          <li className="text-brand-secondary">{product.name}</li>
        </ol>
      </nav>

      <article className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-[color:var(--control-border)] bg-[color:var(--surface)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0.6, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.45 }}
                transition={{ duration: 0.28 }}
              >
                <Image
                  src={activeImage}
                  alt={product.name}
                  width={1100}
                  height={960}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="h-[420px] w-full object-cover transition duration-700 hover:scale-105 sm:h-[540px]"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {images.map((image) => (
              <button
                key={image}
                type="button"
                className={`overflow-hidden rounded-xl border transition ${
                  image === activeImage ? "border-brand-secondary" : "border-[color:var(--control-border)] hover:border-brand-secondary/50"
                }`}
                onClick={() => setActiveImage(image)}
              >
                <Image src={image} alt={`${product.name} view`} width={240} height={240} sizes="80px" className="h-20 w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-secondary/45 bg-brand-secondary/15 px-3 py-1 text-xs font-medium text-brand-secondary shadow-[0_8px_30px_rgba(13,83,66,0.22)]">
            <Truck className="h-3.5 w-3.5" />
            {strings.freeDelivery}
          </span>
          <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--muted)]">{product.category}</p>
          <h1 className="text-4xl font-bold tracking-[-0.04em] sm:text-5xl">{product.name}</h1>
          <div className="flex items-center gap-1 text-brand-secondary">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
            <span className="ml-1 text-sm text-[color:var(--muted)]">{strings.ratingLabel}</span>
          </div>
          <p className="text-sm leading-7 text-[color:var(--muted)]">{product.description}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-semibold text-brand-secondary">${product.price.toFixed(2)}</p>
            {product.originalPrice ? <p className="text-sm text-[color:var(--muted)] line-through">${product.originalPrice.toFixed(2)}</p> : null}
            {product.discountPct && product.discountPct > 0 ? (
              <span className="rounded-full bg-[#b23a2f] px-2 py-0.5 text-xs font-semibold text-white">-{product.discountPct}%</span>
            ) : null}
          </div>
          <p className={`text-sm ${product.stock > 0 ? "text-brand-secondary" : "text-red-300"}`}>
            {product.stock > 0 ? tProduct("inStock", { count: product.stock }) : tProduct("outOfStock")}
          </p>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-[color:var(--control-border)] bg-[color:var(--surface)]">
              <button type="button" aria-label={tCommon("decreaseQuantity")} className="h-10 w-10" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                -
              </button>
              <span className="w-9 text-center text-sm font-medium">{quantity}</span>
              <button
                type="button"
                aria-label={tCommon("increaseQuantity")}
                className="h-10 w-10"
                onClick={() => setQuantity((value) => Math.min(Math.max(product.stock, 1), value + 1))}
              >
                +
              </button>
            </div>
            <Button disabled={product.stock <= 0} onClick={addToCart}>
              {tProduct("addToCart")}
            </Button>
          </div>

          <div className="space-y-2 pt-2">
            {[
              {
                key: "details",
                icon: ShieldCheck,
                title: strings.detailsTitle,
                text: strings.detailsText
              },
              {
                key: "materials",
                icon: Star,
                title: strings.materialsTitle,
                text: strings.materialsText
              },
              {
                key: "shipping",
                icon: Truck,
                title: strings.shippingTitle,
                text: strings.shippingText
              }
            ].map((item) => {
              const isOpen = accordion === item.key;
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="rounded-2xl border border-[color:var(--control-border)] bg-white/75 shadow-[0_16px_34px_rgba(16,44,38,0.12)] backdrop-blur-md dark:bg-[color:var(--surface)] dark:shadow-none"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                    onClick={() => setAccordion(item.key as "details" | "materials" | "shipping")}
                  >
                    <span className="inline-flex items-center gap-2 font-medium">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-secondary/15 text-brand-secondary">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      {item.title}
                    </span>
                    <span className="text-brand-secondary">{isOpen ? "-" : "+"}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden px-4 pb-4 text-sm text-[color:var(--muted)]"
                      >
                        {item.text}
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-brand-secondary/45 bg-brand-secondary/10 p-3 text-sm text-brand-secondary shadow-[0_18px_40px_rgba(13,83,66,0.18)] backdrop-blur-md">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
              <p>{strings.qualityNote}</p>
            </div>
          </div>
        </div>
      </article>

      <section className="space-y-5">
        <h2 className="section-title">{tProduct("relatedProducts")}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {relatedProducts.map((related) => (
            <ProductCard key={related.id} locale={locale} product={related} />
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--control-border)] bg-[color:var(--nav-bg)] p-3 backdrop-blur-xl lg:hidden">
        <Button className="w-full" disabled={product.stock <= 0} onClick={addToCart}>
          {tProduct("addToCart")} • ${product.price.toFixed(2)}
        </Button>
      </div>
    </div>
  );
}


