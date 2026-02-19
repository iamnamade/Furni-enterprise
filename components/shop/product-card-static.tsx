import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { currency } from "@/lib/utils";

type ProductCardStaticProps = {
  locale: string;
  detailsLabel: string;
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

export function ProductCardStatic({ locale, product, detailsLabel }: ProductCardStaticProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--surface)] shadow-[0_16px_34px_rgba(16,44,38,0.12)] transition duration-300 hover:-translate-y-1.5 hover:border-[color:var(--accent)] hover:shadow-[0_24px_56px_rgba(16,44,38,0.2)] dark:hover:shadow-[0_24px_56px_rgba(0,0,0,0.44)]">
      <Link href={`/${locale}/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={600}
            height={450}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            className="h-60 w-full object-cover transition duration-500 group-hover:scale-105"
          />
          {product.discountLabel ? (
            <span className="absolute left-3 top-3 rounded-full bg-[#b23a2f] px-3 py-1 text-xs font-semibold text-white shadow-lg">
              {product.discountLabel}
            </span>
          ) : null}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
        </div>
      </Link>

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
          {product.originalPrice ? <p className="text-sm text-[color:var(--muted)] line-through">{currency(product.originalPrice)}</p> : null}
        </div>
        <Link
          href={`/${locale}/product/${product.slug}`}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] shadow-[0_10px_28px_rgba(16,44,38,0.14)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
        >
          {detailsLabel}
        </Link>
      </div>
    </article>
  );
}
