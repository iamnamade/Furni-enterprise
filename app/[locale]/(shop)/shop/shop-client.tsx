"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { Input } from "@/components/ui/input";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  category: Category;
  createdAt: string;
};

const PAGE_SIZE = 9;

export function ShopClient({
  locale,
  products,
  categories
}: {
  locale: string;
  products: Product[];
  categories: Category[];
}) {
  const t = useTranslations("shop");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedCategory = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "newest";
  const min = Number(searchParams.get("min") || 0);
  const max = Number(searchParams.get("max") || 5000);
  const page = Math.max(1, Number(searchParams.get("page") || 1));

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    if (!Object.keys(next).includes("page")) {
      params.set("page", "1");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = products.filter((product) => {
      const inCategory = selectedCategory ? product.category?.slug === selectedCategory : true;
      const inPrice = product.price >= min && product.price <= max;
      const inSearch = query ? product.name.toLowerCase().includes(query) : true;
      return inCategory && inPrice && inSearch;
    });

    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "newest") list = [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    return list;
  }, [max, min, products, search, selectedCategory, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-7">
      <div className="glass-panel p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <Input
            aria-label="Search products"
            placeholder={t("searchProducts")}
            value={search}
            onChange={(event) => updateParams({ search: event.target.value })}
          />
          <select
            aria-label="Category filter"
            className="h-11 rounded-full border border-white/20 bg-white/5 px-4 text-sm"
            value={selectedCategory}
            onChange={(event) => updateParams({ category: event.target.value })}
          >
            <option value="">{t("allCategories")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug} className="bg-[#102C26]">
                {category.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Sort"
            className="h-11 rounded-full border border-white/20 bg-white/5 px-4 text-sm"
            value={sort}
            onChange={(event) => updateParams({ sort: event.target.value })}
          >
            <option value="newest" className="bg-[#102C26]">{t("newest")}</option>
            <option value="price-asc" className="bg-[#102C26]">{t("priceAsc")}</option>
            <option value="price-desc" className="bg-[#102C26]">{t("priceDesc")}</option>
          </select>
          <Input aria-label={t("minPrice")} type="number" min={0} placeholder={t("minPrice")} value={min} onChange={(event) => updateParams({ min: event.target.value })} />
          <Input aria-label={t("maxPrice")} type="number" min={0} placeholder={t("maxPrice")} value={max} onChange={(event) => updateParams({ max: event.target.value })} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-white/80">{t("productsFound", { count: filtered.length })}</p>
        {isPending ? (
          <p className="inline-flex items-center gap-2 text-sm text-brand-secondary">
            <Loader2 className="h-4 w-4 animate-spin" /> Updating
          </p>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <div className="glass-panel py-14 text-center">
          <h2 className="text-xl font-semibold">{t("noProducts")}</h2>
          <p className="mt-2 text-sm text-white/80">{t("adjustFilters")}</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <ProductCard key={product.id} locale={locale} product={product} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => updateParams({ page: String(Math.max(1, safePage - 1)) })}
          disabled={safePage <= 1}
          className="rounded-full border border-white/20 px-4 py-2 text-sm transition hover:border-brand-secondary/65 disabled:opacity-50"
        >
          {t("previous")}
        </button>
        <span className="text-sm text-white/75">
          {safePage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => updateParams({ page: String(Math.min(totalPages, safePage + 1)) })}
          disabled={safePage >= totalPages}
          className="rounded-full border border-white/20 px-4 py-2 text-sm transition hover:border-brand-secondary/65 disabled:opacity-50"
        >
          {t("next")}
        </button>
      </div>
    </div>
  );
}

