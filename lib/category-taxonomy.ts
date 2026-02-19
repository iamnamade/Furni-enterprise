export type CategoryMeta = {
  slug: string;
  coverImage: string;
  labels: {
    en: string;
    ka: string;
    ru: string;
  };
  descriptions: {
    en: string;
    ka: string;
    ru: string;
  };
};

export const CATEGORY_TAXONOMY: CategoryMeta[] = [
  {
    slug: "living-room",
    coverImage: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1600&q=80",
    labels: { en: "Living Room", ka: "მისაღები ოთახი", ru: "Гостиная" },
    descriptions: {
      en: "Core living room furniture with a modern Scandinavian balance.",
      ka: "მისაღები ოთახის ძირითადი ავეჯი თანამედროვე სკანდინავიური ბალანსით.",
      ru: "Основная мебель для гостиной в современном скандинавском стиле."
    }
  },
  {
    slug: "sofas",
    coverImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1600&q=80",
    labels: { en: "Sofas", ka: "დივნები", ru: "Диваны" },
    descriptions: {
      en: "Comfort-first sofas for contemporary living spaces.",
      ka: "კომფორტზე ორიენტირებული დივნები თანამედროვე მისაღები ოთახისთვის.",
      ru: "Комфортные диваны для современного интерьера."
    }
  },
  {
    slug: "armchairs",
    coverImage: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1600&q=80",
    labels: { en: "Armchairs", ka: "სავარძლები", ru: "Кресла" },
    descriptions: {
      en: "Accent and lounge armchairs with ergonomic form.",
      ka: "აქცენტური და lounge ტიპის ერგონომიული სავარძლები.",
      ru: "Акцентные и lounge-кресла с эргономичной посадкой."
    }
  },
  {
    slug: "coffee-tables",
    coverImage: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1600&q=80",
    labels: { en: "Coffee Tables", ka: "ჟურნალის მაგიდები", ru: "Журнальные столики" },
    descriptions: {
      en: "Low-profile coffee tables in wood, glass and stone.",
      ka: "ხის, მინისა და ქვის დეტალებით შექმნილი ჟურნალის მაგიდები.",
      ru: "Низкие журнальные столики из дерева, стекла и камня."
    }
  },
  {
    slug: "dining-tables",
    coverImage: "https://images.unsplash.com/photo-1617104678098-de229db51175?auto=format&fit=crop&w=1600&q=80",
    labels: { en: "Dining Tables", ka: "სასადილო მაგიდები", ru: "Обеденные столы" },
    descriptions: {
      en: "Dining tables for daily family use and guests.",
      ka: "სასადილო მაგიდები ყოველდღიური საოჯახო და სტუმრების მისაღებად გამოყენებისთვის.",
      ru: "Обеденные столы для семьи и приема гостей."
    }
  },
  {
    slug: "chairs",
    coverImage: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1600&q=80",
    labels: { en: "Chairs", ka: "სკამები", ru: "Стулья" },
    descriptions: {
      en: "Dining and multipurpose chairs with durable frames.",
      ka: "სასადილო და მრავალფუნქციური სკამები გამძლე ჩარჩოთი.",
      ru: "Обеденные и универсальные стулья с прочным каркасом."
    }
  },
  {
    slug: "dressers",
    coverImage: "https://images.unsplash.com/photo-1616593969747-4797dc75033e?auto=format&fit=crop&w=1600&q=80",
    labels: { en: "Dressers", ka: "კომოდები", ru: "Комоды" },
    descriptions: {
      en: "Bedroom dressers for organized storage.",
      ka: "საძინებლის კომოდები მოწესრიგებული შენახვისთვის.",
      ru: "Комоды для аккуратного хранения в спальне."
    }
  },
  {
    slug: "wardrobes",
    coverImage: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1600&q=80",
    labels: { en: "Wardrobes", ka: "გარდერობები", ru: "Шкафы" },
    descriptions: {
      en: "Wardrobes with smart internal organization.",
      ka: "გარდერობები ჭკვიანი შიდა ორგანიზაციით.",
      ru: "Шкафы с продуманной внутренней организацией."
    }
  },
  {
    slug: "office-furniture",
    coverImage: "https://images.unsplash.com/photo-1593642532400-2682810df593?auto=format&fit=crop&w=1600&q=80",
    labels: { en: "Office Furniture", ka: "საოფისე ავეჯი", ru: "Офисная мебель" },
    descriptions: {
      en: "Workspace desks and storage for productive routines.",
      ka: "სამუშაო მაგიდები და საცავი პროდუქტიული რუტინისათვის.",
      ru: "Рабочие столы и системы хранения для продуктивной работы."
    }
  },
  {
    slug: "tv-stands",
    coverImage: "https://images.unsplash.com/photo-1519710884006-9ee9f8e8f456?auto=format&fit=crop&w=1600&q=80",
    labels: { en: "TV Stands", ka: "TV ტუმბოები", ru: "ТВ-тумбы" },
    descriptions: {
      en: "Media units and TV stands with cable management.",
      ka: "მედია-კონსოლები და TV ტუმბოები კაბელების ორგანიზაციით.",
      ru: "ТВ-тумбы и медиаконсоли с удобной организацией кабелей."
    }
  },
  {
    slug: "decorative-items",
    coverImage: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1600&q=80",
    labels: { en: "Decorative Items", ka: "დეკორი", ru: "Декор" },
    descriptions: {
      en: "Mirrors, lamps and decorative pieces to complete the room.",
      ka: "სარკეები, სანათები და დეკორი სივრცის სრულყოფისთვის.",
      ru: "Зеркала, светильники и декор для завершения интерьера."
    }
  },
  {
    slug: "outdoor",
    coverImage: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
    labels: { en: "Outdoor", ka: "გარე სივრცე", ru: "Уличная мебель" },
    descriptions: {
      en: "Weather-ready furniture designed for terraces and gardens.",
      ka: "ამინდისადმი გამძლე ავეჯი ტერასებისა და ბაღებისთვის.",
      ru: "Устойчивая к погоде мебель для террас и садов."
    }
  },
  {
    slug: "bedroom",
    coverImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
    labels: { en: "Bedroom", ka: "საძინებელი", ru: "Спальня" },
    descriptions: {
      en: "Bed frames and bedroom essentials with a calm visual language.",
      ka: "საწოლები და საძინებლის აუცილებელი ელემენტები მშვიდი ვიზუალური ენით.",
      ru: "Кровати и ключевые элементы спальни в спокойной эстетике."
    }
  }
];

export const CATEGORY_META_BY_SLUG = Object.fromEntries(CATEGORY_TAXONOMY.map((entry) => [entry.slug, entry])) as Record<string, CategoryMeta>;

export function getCategoryLabel(slug: string, locale: string, fallback: string) {
  const entry = CATEGORY_META_BY_SLUG[slug];
  if (!entry) return fallback;
  if (locale === "ka") return entry.labels.ka;
  if (locale === "ru") return entry.labels.ru;
  return entry.labels.en;
}

export function getCategoryDescription(slug: string, locale: string, fallback: string) {
  const entry = CATEGORY_META_BY_SLUG[slug];
  if (!entry) return fallback;
  if (locale === "ka") return entry.descriptions.ka;
  if (locale === "ru") return entry.descriptions.ru;
  return entry.descriptions.en;
}
