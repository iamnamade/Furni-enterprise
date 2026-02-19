export function normalizeDiscountPct(value: number | null | undefined) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(90, Math.round(n)));
}

export function getDiscountedPrice(price: number, discountPct: number | null | undefined) {
  const discount = normalizeDiscountPct(discountPct);
  if (discount <= 0) return Number(price.toFixed(2));
  return Number((price * (1 - discount / 100)).toFixed(2));
}

export function getDiscountView(price: number, discountPct: number | null | undefined) {
  const discount = normalizeDiscountPct(discountPct);
  const discountedPrice = getDiscountedPrice(price, discount);
  return {
    discountPct: discount,
    price: discountedPrice,
    originalPrice: discount > 0 ? Number(price.toFixed(2)) : undefined,
    discountLabel: discount > 0 ? `${discount}% OFF` : undefined
  };
}

