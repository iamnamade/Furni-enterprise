"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/utils";
import { useCartStore } from "@/lib/zustand-cart";
import { useToastStore } from "@/lib/toast-store";
import { useFavoritesStore } from "@/lib/zustand-favorites";

type ProductCardProps = {
  locale: string;
  product: {
    id: string;
    slug: string;
    name: string;
    price: number | string;
    imageUrl: string;
    originalPrice?: number;
    discountLabel?: string;
  };
};

export function ProductCard({ locale, product }: ProductCardProps) {
  const t = useTranslations("product");
  const addItem = useCartStore((state) => state.addItem);
  const addFavorite = useFavoritesStore((state) => state.addItem);
  const isFavorite = useFavoritesStore((state) => state.hasItem(product.id));
  const pushToast = useToastStore((state) => state.push);

  function addToCart() {
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      price: Number(product.price)
    });
    pushToast({ title: t("addedToCart"), message: product.name, href: `/${locale}/cart` });
  }

  function handleFavoriteClick() {
    if (!isFavorite) {
      addFavorite({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        imageUrl: product.imageUrl,
        price: Number(product.price)
      });
      pushToast({
        title: "დაემატა ფავორიტებში",
        message: product.name,
        href: `/${locale}/favorites`
      });
      return;
    }

    pushToast({
      title: "უკვე ფავორიტებშია",
      message: product.name,
      href: `/${locale}/favorites`
    });
  }

  return (
    <>
      <article className="group overflow-hidden rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--surface)] shadow-[0_16px_34px_rgba(16,44,38,0.12)] transition duration-300 hover:-translate-y-1.5 hover:border-[color:var(--accent)] hover:shadow-[0_24px_56px_rgba(16,44,38,0.2)] dark:hover:shadow-[0_24px_56px_rgba(0,0,0,0.44)]">
        <div className="relative overflow-hidden">
          <Link href={`/${locale}/product/${product.slug}`}>
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={600}
              height={450}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              className="h-60 w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </Link>
          {product.discountLabel ? (
            <span className="absolute left-3 top-3 rounded-full bg-[#b23a2f] px-3 py-1 text-xs font-semibold text-white shadow-lg">
              {product.discountLabel}
            </span>
          ) : null}
          <div className="absolute right-3 top-3 flex flex-col gap-2">
            <button
              type="button"
              aria-label={isFavorite ? "Go to favorites" : "Add to favorites"}
              onClick={handleFavoriteClick}
              className={`rounded-full border p-2 backdrop-blur transition ${
                isFavorite
                  ? "border-[#f5e6ca] bg-[#f5e6ca] text-[#102c26]"
                  : "border-[color:var(--control-border)] bg-[color:var(--control-bg)] text-[color:var(--foreground)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
        </div>

        <div className="space-y-3 p-5">
          <h3 className="line-clamp-1 text-base font-semibold tracking-[-0.01em] text-[color:var(--foreground)]">{product.name}</h3>
          <div className="flex items-center gap-1 text-[color:var(--accent)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
            <span className="ml-1 text-xs text-[color:var(--muted)]">4.9</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold text-[color:var(--foreground)]">{currency(product.price)}</p>
            {product.originalPrice ? (
              <p className="text-sm text-[color:var(--muted)] line-through">{currency(product.originalPrice)}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button className="w-full" onClick={addToCart}>
              {t("addToCart")}
            </Button>
            <Link
              href={`/${locale}/product/${product.slug}`}
              className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] shadow-[0_10px_28px_rgba(16,44,38,0.14)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
            >
              {t("details")}
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}


