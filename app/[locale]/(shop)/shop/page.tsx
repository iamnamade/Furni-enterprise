import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MAX_CATALOG_LIMIT, getAllProducts, getCategories } from "@/lib/catalog";
import { ProductCard } from "@/components/shop/product-card";
import { localizeCategoryName, localizeProductName } from "@/lib/product-i18n";
import { getDiscountView } from "@/lib/pricing";

export const revalidate = 120;

const PAGE_SIZE = 9;

type SortValue = "newest" | "price-asc" | "price-desc";
type DiscountValue = "all" | "discounted";

type ShopSearchParams = {
  category?: string | string[];
  search?: string | string[];
  sort?: string | string[];
  min?: string | string[];
  max?: string | string[];
  exact?: string | string[];
  discount?: string | string[];
  page?: string | string[];
};

function toSingle(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

function toNumber(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildPageQuery(searchParams: ShopSearchParams, nextPage: number) {
  const params = new URLSearchParams();

  const entries: Array<[keyof ShopSearchParams, string]> = [
    ["category", toSingle(searchParams.category)],
    ["search", toSingle(searchParams.search)],
    ["sort", toSingle(searchParams.sort)],
    ["min", toSingle(searchParams.min)],
    ["max", toSingle(searchParams.max)],
    ["exact", toSingle(searchParams.exact)],
    ["discount", toSingle(searchParams.discount)]
  ];

  for (const [key, value] of entries) {
    const normalized = value.trim();
    if (!normalized) continue;
    params.set(key, normalized);
  }

  if (nextPage > 1) {
    params.set("page", String(nextPage));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export default async function ShopPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams: ShopSearchParams;
}) {
  const [tShop, products, categories] = await Promise.all([
    getTranslations("shop"),
    getAllProducts(MAX_CATALOG_LIMIT),
    getCategories()
  ]);

  const selectedCategory = toSingle(searchParams.category).trim();
  const search = toSingle(searchParams.search).trim().toLowerCase();
  const sortParam = toSingle(searchParams.sort);
  const sort: SortValue = sortParam === "price-asc" || sortParam === "price-desc" || sortParam === "newest" ? sortParam : "newest";
  const min = Math.max(0, toNumber(toSingle(searchParams.min), 0));
  const max = Math.max(min, toNumber(toSingle(searchParams.max), 5000));
  const exact = Math.max(0, toNumber(toSingle(searchParams.exact), 0));
  const hasExact = exact > 0;
  const discount: DiscountValue = toSingle(searchParams.discount) === "discounted" ? "discounted" : "all";
  const page = Math.max(1, Math.floor(toNumber(toSingle(searchParams.page), 1)));

  const cards = products.map((product) => {
    const basePrice = Number(product.price);
    const discountView = getDiscountView(basePrice, product.discountPct);

    return {
      id: product.id,
      slug: product.slug,
      name: localizeProductName(product.slug, product.name, params.locale),
      price: discountView.price,
      originalPrice: discountView.originalPrice,
      discountLabel: discountView.discountLabel,
      discountPct: discountView.discountPct,
      imageUrl: product.imageUrl,
      category: {
        id: product.category.id,
        name: localizeCategoryName(product.category.slug, product.category.name, params.locale),
        slug: product.category.slug
      },
      createdAt: product.createdAt.toISOString()
    };
  });

  const categoryList = categories.map((category) => ({
    id: category.id,
    name: localizeCategoryName(category.slug, category.name, params.locale),
    slug: category.slug
  }));

  let filtered = cards.filter((product) => {
    const inCategory = selectedCategory ? product.category.slug === selectedCategory : true;
    const inRange = product.price >= min && product.price <= max;
    const inExact = hasExact ? Math.abs(product.price - exact) < 0.005 : true;
    const inSearch = search ? product.name.toLowerCase().includes(search) : true;
    const inDiscount = discount === "discounted" ? product.discountPct > 0 : true;
    return inCategory && inRange && inExact && inSearch && inDiscount;
  });

  if (sort === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sort === "newest") filtered = [...filtered].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const prevPage = Math.max(1, safePage - 1);
  const nextPage = Math.min(totalPages, safePage + 1);
  const prevDisabled = safePage <= 1;
  const nextDisabled = safePage >= totalPages;

  return (
    <div className="space-y-7">
      <div className="glass-panel p-4 sm:p-5">
        <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-6" method="get">
          <input
            aria-label={tShop("searchProducts")}
            placeholder={tShop("searchProducts")}
            name="search"
            defaultValue={toSingle(searchParams.search)}
            className="h-11 rounded-full border border-[color:var(--control-border)] bg-[color:var(--surface)] px-4 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
          />

          <select
            aria-label={tShop("allCategories")}
            name="category"
            defaultValue={selectedCategory}
            className="h-11 rounded-full border border-[color:var(--control-border)] bg-[color:var(--surface)] px-4 text-sm text-[color:var(--foreground)]"
          >
            <option value="">{tShop("allCategories")}</option>
            {categoryList.map((category) => (
              <option key={category.id} value={category.slug} className="bg-[color:var(--background)] text-[color:var(--foreground)]">
                {category.name}
              </option>
            ))}
          </select>

          <select
            aria-label={tShop("newest")}
            name="sort"
            defaultValue={sort}
            className="h-11 rounded-full border border-[color:var(--control-border)] bg-[color:var(--surface)] px-4 text-sm text-[color:var(--foreground)]"
          >
            <option value="newest" className="bg-[color:var(--background)] text-[color:var(--foreground)]">
              {tShop("newest")}
            </option>
            <option value="price-asc" className="bg-[color:var(--background)] text-[color:var(--foreground)]">
              {tShop("priceAsc")}
            </option>
            <option value="price-desc" className="bg-[color:var(--background)] text-[color:var(--foreground)]">
              {tShop("priceDesc")}
            </option>
          </select>

          <input
            aria-label={tShop("minPrice")}
            type="number"
            min={0}
            placeholder={tShop("minPrice")}
            name="min"
            defaultValue={toSingle(searchParams.min) || "0"}
            className="h-11 rounded-full border border-[color:var(--control-border)] bg-[color:var(--surface)] px-4 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
          />

          <input
            aria-label={tShop("maxPrice")}
            type="number"
            min={0}
            placeholder={tShop("maxPrice")}
            name="max"
            defaultValue={toSingle(searchParams.max) || "5000"}
            className="h-11 rounded-full border border-[color:var(--control-border)] bg-[color:var(--surface)] px-4 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
          />

          <input
            aria-label={tShop("exactPrice")}
            type="number"
            min={0}
            placeholder={tShop("exactPrice")}
            name="exact"
            defaultValue={toSingle(searchParams.exact)}
            className="h-11 rounded-full border border-[color:var(--control-border)] bg-[color:var(--surface)] px-4 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
          />

          <select
            aria-label={tShop("discountFilter")}
            name="discount"
            defaultValue={discount}
            className="h-11 rounded-full border border-[color:var(--control-border)] bg-[color:var(--surface)] px-4 text-sm text-[color:var(--foreground)]"
          >
            <option value="all" className="bg-[color:var(--background)] text-[color:var(--foreground)]">
              {tShop("allItems")}
            </option>
            <option value="discounted" className="bg-[color:var(--background)] text-[color:var(--foreground)]">
              {tShop("discountedOnly")}
            </option>
          </select>

          <button
            type="submit"
            className="h-11 rounded-full bg-[color:var(--button-primary-bg)] px-4 text-sm font-semibold text-[color:var(--button-primary-fg)] transition hover:opacity-95"
          >
            {tShop("applyFilters")}
          </button>

          <Link
            href={`/${params.locale}/shop`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--control-border)] bg-[color:var(--surface)] px-4 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--accent)]"
          >
            {tShop("resetFilters")}
          </Link>
        </form>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[color:var(--muted)]">{tShop("productsFound", { count: filtered.length })}</p>
      </div>

      {visible.length === 0 ? (
        <div className="glass-panel py-14 text-center">
          <h2 className="text-xl font-semibold">{tShop("noProducts")}</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">{tShop("adjustFilters")}</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <ProductCard key={product.id} locale={params.locale} product={product} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-2">
        <Link
          href={`/${params.locale}/shop${buildPageQuery(searchParams, prevPage)}`}
          aria-disabled={prevDisabled}
          className={`rounded-full border border-[color:var(--control-border)] px-4 py-2 text-sm transition hover:border-[color:var(--accent)] ${
            prevDisabled ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {tShop("previous")}
        </Link>
        <span className="text-sm text-[color:var(--muted)]">
          {safePage} / {totalPages}
        </span>
        <Link
          href={`/${params.locale}/shop${buildPageQuery(searchParams, nextPage)}`}
          aria-disabled={nextDisabled}
          className={`rounded-full border border-[color:var(--control-border)] px-4 py-2 text-sm transition hover:border-[color:var(--accent)] ${
            nextDisabled ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {tShop("next")}
        </Link>
      </div>
    </div>
  );
}
