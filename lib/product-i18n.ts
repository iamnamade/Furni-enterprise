import en from "@/messages/en.json";
import ka from "@/messages/ka.json";
import ru from "@/messages/ru.json";

type Locale = "en" | "ka" | "ru";

type CatalogNode = {
  categories?: Record<string, { name?: string; description?: string }>;
  products?: Record<string, { name?: string; description?: string }>;
};

const MESSAGES_BY_LOCALE = { en, ka, ru } as const;

function resolveLocale(locale: string): Locale {
  if (locale === "ka" || locale === "ru") return locale;
  return "en";
}

function getCatalog(locale: string): CatalogNode {
  const key = resolveLocale(locale);
  return (MESSAGES_BY_LOCALE[key] as { catalog?: CatalogNode }).catalog || {};
}

export function localizeProductName(slug: string, fallback: string, locale: string) {
  return getCatalog(locale).products?.[slug]?.name || fallback;
}

export function localizeProductDescription(slug: string, fallback: string, locale: string) {
  return getCatalog(locale).products?.[slug]?.description || fallback;
}

export function localizeCategoryName(slug: string, fallback: string, locale: string) {
  return getCatalog(locale).categories?.[slug]?.name || fallback;
}

export function localizeCategoryDescription(slug: string, fallback: string, locale: string) {
  return getCatalog(locale).categories?.[slug]?.description || fallback;
}
