import Link from "next/link";
import { Headphones, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCategories, getFeaturedProducts, getNewestProducts } from "@/lib/catalog";
import { ProductCardStatic } from "@/components/shop/product-card-static";
import { Reveal } from "@/components/shop/reveal";
import { TestimonialCarousel } from "@/components/shop/testimonial-carousel";
import { getDiscountView } from "@/lib/pricing";

export const revalidate = 120;

export default async function HomePage({ params }: { params: { locale: string } }) {
  const [t, tProduct, featured, newestProducts, categories] = await Promise.all([
    getTranslations("home"),
    getTranslations("product"),
    getFeaturedProducts(8),
    getNewestProducts(8),
    getCategories()
  ]);
  const displayProducts = (featured.length ? featured : newestProducts).slice(0, 8);

  const featuredCards = displayProducts.map((product) => {
    const discountView = getDiscountView(Number(product.price), product.discountPct);
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: discountView.price,
      originalPrice: discountView.originalPrice,
      discountLabel: discountView.discountLabel,
      imageUrl: product.imageUrl
    };
  });

  const saleSource = newestProducts.length ? newestProducts : displayProducts;
  const saleProducts = saleSource.slice(0, 4).map((product, idx) => {
    const discounts = [20, 35, 15, 25];
    const discount = discounts[idx % discounts.length];
    const originalPrice = Number(product.price);
    const discounted = Number((originalPrice * (1 - discount / 100)).toFixed(2));

    return {
      ...product,
      price: discounted,
      originalPrice,
      discountLabel: `-${discount}%`
    };
  });

  const assuranceItems = [
    {
      icon: Truck,
      title: t("assuranceShippingTitle"),
      description: t("assuranceShippingDesc")
    },
    {
      icon: RotateCcw,
      title: t("assuranceReturnTitle"),
      description: t("assuranceReturnDesc")
    },
    {
      icon: ShieldCheck,
      title: t("assuranceQualityTitle"),
      description: t("assuranceQualityDesc")
    },
    {
      icon: Headphones,
      title: t("assuranceSupportTitle"),
      description: t("assuranceSupportDesc")
    }
  ];

  return (
    <div className="space-y-20 pb-14">
      <Reveal>
        <section className="lux-hero-glow relative overflow-hidden rounded-[2rem] border bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02))] px-6 py-14 text-center shadow-[0_30px_80px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.5)] sm:px-10 md:py-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(200,169,126,0.22),transparent_34%),radial-gradient(circle_at_86%_22%,rgba(255,255,255,0.10),transparent_36%)] dark:bg-[radial-gradient(circle_at_20%_8%,rgba(247,231,206,0.22),transparent_34%),radial-gradient(circle_at_86%_22%,rgba(255,255,255,0.09),transparent_36%)]" />
          <p className="relative text-xs uppercase tracking-[0.24em] text-muted">{t("kicker")}</p>
          <h1 className="relative mx-auto mt-5 max-w-5xl text-5xl font-extrabold tracking-[-0.045em] text-[color:var(--foreground)] sm:text-6xl lg:text-7xl">
            {t("title")}
          </h1>
          <p className="relative mx-auto mt-5 max-w-2xl text-base font-medium text-muted sm:text-lg">{t("subtitle")}</p>

          <div className="relative mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href={`/${params.locale}/shop`}
              className="rounded-full bg-[color:var(--button-primary-bg)] px-7 py-3 text-sm font-semibold text-[color:var(--button-primary-fg)] shadow-[0_14px_40px_rgba(16,44,38,0.24)] transition duration-300 hover:scale-[1.02]"
            >
              {t("shopCollection")}
            </Link>
            <Link
              href={`/${params.locale}/about`}
              className="rounded-full border px-7 py-3 text-sm font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            >
              {t("learnMore")}
            </Link>
          </div>

          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted">
            <span className="inline-flex items-center gap-1 text-accent">
              <Star className="h-3.5 w-3.5 fill-current" /> {t("rating")}
            </span>
            <span>{t("customers")}</span>
            <span>{t("trusted")}</span>
          </div>

          <div className="relative mt-10 flex justify-center">
            <div className="scroll-indicator" aria-hidden="true" />
          </div>
        </section>
      </Reveal>

      <div className="section-divider" />

      <Reveal delay={0.05}>
        <section className="space-y-7">
          <div className="flex items-center justify-between">
            <h2 className="section-title">{t("featuredTitle")}</h2>
            <Link href={`/${params.locale}/shop`} className="link-underline text-sm text-muted hover:text-accent">
              {t("viewAll")}
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCards.map((product) => (
              <ProductCardStatic key={product.id} locale={params.locale} product={product} detailsLabel={tProduct("details")} />
            ))}
          </div>
        </section>
      </Reveal>

      <div className="section-divider" />

      <Reveal delay={0.07}>
        <section className="space-y-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="section-title">{t("onSaleTitle")}</h2>
              <p className="mt-2 text-sm text-muted">{t("onSaleSubtitle")}</p>
            </div>
            <Link href={`/${params.locale}/shop`} className="link-underline text-sm text-muted hover:text-accent">
              {t("viewDeals")}
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {saleProducts.map((product) => (
              <ProductCardStatic key={`${product.id}-sale`} locale={params.locale} product={product} detailsLabel={tProduct("details")} />
            ))}
          </div>
        </section>
      </Reveal>

      <div className="section-divider" />

      <Reveal delay={0.08}>
        <section className="space-y-7">
          <h2 className="section-title">{t("browseByCategory")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/${params.locale}/shop?category=${category.slug}`}
                className="group rounded-2xl border bg-[color:var(--surface)] p-6 transition duration-300 hover:-translate-y-1.5 hover:border-[color:var(--accent)] hover:shadow-[0_20px_60px_rgba(16,44,38,0.18)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                style={{ transitionDelay: `${Math.min(index * 40, 160)}ms` }}
              >
                <p className="font-semibold text-[color:var(--foreground)]">{category.name}</p>
                <p className="mt-2 text-sm text-muted">{t("categoryDesc")}</p>
                <p className="mt-5 text-xs uppercase tracking-wide text-accent">{t("shopNow")}</p>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>

      <div className="section-divider" />

      <Reveal delay={0.1}>
        <section className="glass-panel grid gap-8 p-8 sm:grid-cols-[1.4fr_1fr] sm:p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">{t("promotionKicker")}</p>
            <h3 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-[color:var(--foreground)]">{t("promotionTitle")}</h3>
            <p className="mt-3 text-sm font-medium text-muted">{t("promotionSubtitle")}</p>
          </div>
          <div className="flex items-center justify-start sm:justify-end">
            <Link
              href={`/${params.locale}/shop?sort=newest`}
              className="rounded-full bg-[color:var(--button-primary-bg)] px-6 py-3 text-sm font-semibold text-[color:var(--button-primary-fg)] shadow-[0_12px_40px_rgba(16,44,38,0.18)] transition duration-300 hover:scale-[1.02]"
            >
              {t("exploreOffers")}
            </Link>
          </div>
        </section>
      </Reveal>

      <div className="section-divider" />

      <Reveal delay={0.11}>
        <section className="relative overflow-hidden rounded-[1.8rem] border bg-[linear-gradient(135deg,#f7e7ce,#f4dfbe)] p-5 shadow-[0_24px_60px_rgba(16,44,38,0.22)] sm:p-7 dark:bg-[linear-gradient(135deg,rgba(16,44,38,0.96),rgba(16,44,38,0.88))] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_6%,rgba(255,255,255,0.42),transparent_35%),radial-gradient(circle_at_90%_90%,rgba(200,169,126,0.26),transparent_38%)] dark:bg-[radial-gradient(circle_at_14%_6%,rgba(200,169,126,0.18),transparent_35%),radial-gradient(circle_at_90%_90%,rgba(255,255,255,0.08),transparent_38%)]" />
          <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {assuranceItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="group rounded-2xl border border-[rgba(16,44,38,0.16)] bg-white/58 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:bg-white/78 dark:border-white/15 dark:bg-[rgba(10,28,24,0.5)] dark:hover:bg-[rgba(10,28,24,0.64)]"
                  style={{ transitionDelay: `${Math.min(index * 50, 180)}ms` }}
                >
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--accent)]/45 bg-[color:var(--accent)]/14 text-[color:var(--accent)]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-[#102c26] dark:text-[#f7e7ce]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[rgba(16,44,38,0.88)] dark:text-[rgba(247,231,206,0.88)]">{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>
      </Reveal>

      <div className="section-divider" />

      <Reveal delay={0.12}>
        <section className="space-y-6">
          <h2 className="section-title">{t("testimonialsTitle")}</h2>
          <TestimonialCarousel />
        </section>
      </Reveal>

      <div className="section-divider" />

      <Reveal delay={0.14}>
        <section className="glass-panel light-decor-surface p-8 text-center sm:p-10">
          <div className="pointer-events-none absolute -left-14 -top-16 h-44 w-44 rounded-full bg-white/45 blur-3xl dark:bg-brand-secondary/10" />
          <div className="pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-[#c8a97e]/35 blur-3xl dark:bg-white/10" />
          <h2 className="section-title relative">{t("newsletterTitle")}</h2>
          <p className="relative mx-auto mt-3 max-w-2xl text-sm text-muted">{t("newsletterSubtitle")}</p>
          <form className="relative mx-auto mt-6 flex max-w-md gap-2 rounded-full border bg-[color:var(--surface)]/90 p-2 backdrop-blur-2xl" aria-label={t("newsletterTitle")}>
            <input
              required
              type="email"
              aria-label="Email address"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-11 flex-1 rounded-full bg-transparent px-4 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-[color:var(--button-primary-bg)] px-6 text-sm font-semibold text-[color:var(--button-primary-fg)] shadow-[0_10px_30px_rgba(16,44,38,0.18)] transition hover:scale-[1.02]"
            >
              {t("subscribe")}
            </button>
          </form>
        </section>
      </Reveal>
    </div>
  );
}
