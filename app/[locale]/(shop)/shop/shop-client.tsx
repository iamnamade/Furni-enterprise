'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { ProductCard } from '@/components/shop/product-card';
import { Input } from '@/components/ui/input';

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
  discountPct: number;
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
  const t = useTranslations('shop');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedCategory = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const min = searchParams.get('min') || '0';
  const max = searchParams.get('max') || '5000';
  const exact = searchParams.get('exact') || '';
  const discount = searchParams.get('discount') || 'all';
  const page = Math.max(1, Number(searchParams.get('page') || 1));

  const [draftSearch, setDraftSearch] = useState(search);
  const [draftCategory, setDraftCategory] = useState(selectedCategory);
  const [draftSort, setDraftSort] = useState(sort);
  const [draftMin, setDraftMin] = useState(min);
  const [draftMax, setDraftMax] = useState(max);
  const [draftExact, setDraftExact] = useState(exact);
  const [draftDiscount, setDraftDiscount] = useState(discount);

  useEffect(() => {
    setDraftSearch(search);
    setDraftCategory(selectedCategory);
    setDraftSort(sort);
    setDraftMin(min);
    setDraftMax(max);
    setDraftExact(exact);
    setDraftDiscount(discount);
  }, [discount, exact, max, min, search, selectedCategory, sort]);

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    if (!Object.keys(next).includes('page')) {
      params.set('page', '1');
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function applyFilters() {
    updateParams({
      search: draftSearch.trim(),
      category: draftCategory,
      sort: draftSort,
      min: draftMin,
      max: draftMax,
      exact: draftExact,
      discount: draftDiscount
    });
  }

  function resetFilters() {
    updateParams({
      search: '',
      category: '',
      sort: 'newest',
      min: '0',
      max: '5000',
      exact: '',
      discount: 'all',
      page: '1'
    });
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const minValue = Number(min || 0);
    const maxValue = Number(max || 5000);
    const exactValue = Number(exact || 0);
    const hasExact = Number.isFinite(exactValue) && exactValue > 0;
    const discountedOnly = discount === 'discounted';

    let list = products.filter((product) => {
      const inCategory = selectedCategory ? product.category?.slug === selectedCategory : true;
      const inRange = product.price >= minValue && product.price <= maxValue;
      const inExact = hasExact ? Math.abs(product.price - exactValue) < 0.005 : true;
      const inSearch = query ? product.name.toLowerCase().includes(query) : true;
      const inDiscount = discountedOnly ? product.discountPct > 0 : true;
      return inCategory && inRange && inExact && inSearch && inDiscount;
    });

    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'newest') list = [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    return list;
  }, [discount, exact, max, min, products, search, selectedCategory, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className='space-y-7'>
      <div className='glass-panel p-4 sm:p-5'>
        <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-6'>
          <Input
            aria-label={t('searchProducts')}
            placeholder={t('searchProducts')}
            value={draftSearch}
            onChange={(event) => setDraftSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') applyFilters();
            }}
          />
          <select
            aria-label={t('allCategories')}
            className='h-11 rounded-full border border-[color:var(--control-border)] bg-[color:var(--surface)] px-4 text-sm text-[color:var(--foreground)]'
            value={draftCategory}
            onChange={(event) => setDraftCategory(event.target.value)}
          >
            <option value=''>{t('allCategories')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug} className='bg-[color:var(--background)] text-[color:var(--foreground)]'>
                {category.name}
              </option>
            ))}
          </select>
          <select
            aria-label={t('newest')}
            className='h-11 rounded-full border border-[color:var(--control-border)] bg-[color:var(--surface)] px-4 text-sm text-[color:var(--foreground)]'
            value={draftSort}
            onChange={(event) => setDraftSort(event.target.value)}
          >
            <option value='newest' className='bg-[color:var(--background)] text-[color:var(--foreground)]'>
              {t('newest')}
            </option>
            <option value='price-asc' className='bg-[color:var(--background)] text-[color:var(--foreground)]'>
              {t('priceAsc')}
            </option>
            <option value='price-desc' className='bg-[color:var(--background)] text-[color:var(--foreground)]'>
              {t('priceDesc')}
            </option>
          </select>
          <Input aria-label={t('minPrice')} type='number' min={0} placeholder={t('minPrice')} value={draftMin} onChange={(event) => setDraftMin(event.target.value)} />
          <Input aria-label={t('maxPrice')} type='number' min={0} placeholder={t('maxPrice')} value={draftMax} onChange={(event) => setDraftMax(event.target.value)} />
          <Input aria-label={t('exactPrice')} type='number' min={0} placeholder={t('exactPrice')} value={draftExact} onChange={(event) => setDraftExact(event.target.value)} />
          <select
            aria-label={t('discountFilter')}
            className='h-11 rounded-full border border-[color:var(--control-border)] bg-[color:var(--surface)] px-4 text-sm text-[color:var(--foreground)]'
            value={draftDiscount}
            onChange={(event) => setDraftDiscount(event.target.value)}
          >
            <option value='all' className='bg-[color:var(--background)] text-[color:var(--foreground)]'>
              {t('allItems')}
            </option>
            <option value='discounted' className='bg-[color:var(--background)] text-[color:var(--foreground)]'>
              {t('discountedOnly')}
            </option>
          </select>
          <button
            type='button'
            onClick={applyFilters}
            className='h-11 rounded-full bg-[color:var(--button-primary-bg)] px-4 text-sm font-semibold text-[color:var(--button-primary-fg)] transition hover:opacity-95'
          >
            {t('applyFilters')}
          </button>
          <button
            type='button'
            onClick={resetFilters}
            className='h-11 rounded-full border border-[color:var(--control-border)] bg-[color:var(--surface)] px-4 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--accent)]'
          >
            {t('resetFilters')}
          </button>
        </div>
      </div>

      <div className='flex items-center justify-between'>
        <p className='text-sm text-white/80'>{t('productsFound', { count: filtered.length })}</p>
        {isPending ? (
          <p className='inline-flex items-center gap-2 text-sm text-brand-secondary'>
            <Loader2 className='h-4 w-4 animate-spin' /> {t('updating')}
          </p>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <div className='glass-panel py-14 text-center'>
          <h2 className='text-xl font-semibold'>{t('noProducts')}</h2>
          <p className='mt-2 text-sm text-white/80'>{t('adjustFilters')}</p>
        </div>
      ) : (
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {visible.map((product) => (
            <ProductCard key={product.id} locale={locale} product={product} />
          ))}
        </div>
      )}

      <div className='flex items-center justify-center gap-2'>
        <button
          type='button'
          onClick={() => updateParams({ page: String(Math.max(1, safePage - 1)) })}
          disabled={safePage <= 1}
          className='rounded-full border border-white/20 px-4 py-2 text-sm transition hover:border-brand-secondary/65 disabled:opacity-50'
        >
          {t('previous')}
        </button>
        <span className='text-sm text-white/75'>
          {safePage} / {totalPages}
        </span>
        <button
          type='button'
          onClick={() => updateParams({ page: String(Math.min(totalPages, safePage + 1)) })}
          disabled={safePage >= totalPages}
          className='rounded-full border border-white/20 px-4 py-2 text-sm transition hover:border-brand-secondary/65 disabled:opacity-50'
        >
          {t('next')}
        </button>
      </div>
    </div>
  );
}
