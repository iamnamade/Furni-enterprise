"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/utils";
import { useCartStore } from "@/lib/zustand-cart";
import { useFavoritesStore } from "@/lib/zustand-favorites";
import { useToastStore } from "@/lib/toast-store";

export default function FavoritesPage({ params }: { params: { locale: string } }) {
  const tProduct = useTranslations("product");
  const tNav = useTranslations("nav");
  const items = useFavoritesStore((state) => state.items);
  const removeItem = useFavoritesStore((state) => state.removeItem);
  const addCartItem = useCartStore((state) => state.addItem);
  const pushToast = useToastStore((state) => state.push);

  function addToCart(item: (typeof items)[number]) {
    addCartItem({
      productId: item.productId,
      name: item.name,
      imageUrl: item.imageUrl,
      price: item.price
    });
    pushToast({ title: tProduct("addedToCart"), message: item.name, href: `/${params.locale}/cart` });
  }

  return (
    <div className="space-y-6">
      <div className="surface-card flex items-center justify-between p-5">
        <h1 className="inline-flex items-center gap-2 text-2xl font-semibold">
          <Heart className="h-5 w-5 text-brand-secondary" />
          {tNav.has("favorites") ? tNav("favorites") : "Favorites"}
        </h1>
        <p className="text-sm text-[color:var(--muted)]">{items.length}</p>
      </div>

      {items.length === 0 ? (
        <div className="surface-card space-y-4 p-6 text-center">
          <p className="text-[color:var(--muted)]">{tNav.has("emptyFavorites") ? tNav("emptyFavorites") : "No favorites yet."}</p>
          <Link href={`/${params.locale}/shop`}>
            <Button>{tNav("shopNowCta")}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.productId} className="surface-card overflow-hidden">
              <Link href={`/${params.locale}/product/${item.slug}`}>
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={600}
                  height={420}
                  sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="h-52 w-full object-cover"
                />
              </Link>
              <div className="space-y-3 p-4">
                <h2 className="line-clamp-1 text-base font-semibold">{item.name}</h2>
                <p className="text-lg font-semibold">{currency(item.price)}</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button className="col-span-2" onClick={() => addToCart(item)}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {tProduct("addToCart")}
                  </Button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    aria-label="Remove from favorites"
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-[color:var(--control-border)] bg-[color:var(--control-bg)] text-[color:var(--foreground)] transition hover:border-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

