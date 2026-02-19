import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATEGORY_TAXONOMY } from "../lib/category-taxonomy";

const prisma = new PrismaClient();

function resolveSeedAdminPassword() {
  const configured = process.env.SEED_ADMIN_PASSWORD?.trim();
  if (configured) return configured;

  if (process.env.NODE_ENV === "production") {
    throw new Error("SEED_ADMIN_PASSWORD is required in production");
  }

  // Local/dev fallback only. Change immediately after first login.
  return "Admin@12345";
}

async function main() {
  const passwordHash = await bcrypt.hash(resolveSeedAdminPassword(), 12);

  await prisma.user.upsert({
    where: { email: "admin@furni.local" },
    update: {},
    create: {
      email: "admin@furni.local",
      name: "Admin",
      role: "ADMIN",
      passwordHash
    }
  });

  const categoryMap = new Map<string, { id: string }>();
  for (const category of CATEGORY_TAXONOMY) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.labels.en, description: category.descriptions.en },
      create: {
        name: category.labels.en,
        slug: category.slug,
        description: category.descriptions.en
      }
    });
    categoryMap.set(category.slug, { id: created.id });
  }

  const productGroups: Array<{
    categorySlug: string;
    names: string[];
    basePrice: number;
    images: string[];
    desc: string;
  }> = [
    {
      categorySlug: "living-room",
      names: ["Nordic Lounge Set", "Skye Media Wall Unit", "Aero Sideboard", "Mira Nest Console", "Linea Open Shelf", "Oslo Accent Table"],
      basePrice: 359,
      images: [
        "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1400&q=80"
      ],
      desc: "Living room essentials with premium finish and functional layout."
    },
    {
      categorySlug: "sofas",
      names: ["Oslo Modular Sofa", "Nordic Corner Sofa", "Bergen Velvet Sofa", "Stockholm Two-Seater", "Arctic Linen Sofa", "Fjord Chaise Sofa"],
      basePrice: 1299,
      images: [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1400&q=80"
      ],
      desc: "Premium sofa engineered for daily comfort and long-term durability."
    },
    {
      categorySlug: "armchairs",
      names: ["Helsinki Accent Chair", "Malmö Lounge Chair", "Astra Curved Armchair", "Nord Oak Armchair", "Aalto Swivel Chair", "Birka Reading Chair"],
      basePrice: 429,
      images: [
        "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1400&q=80"
      ],
      desc: "Ergonomic armchair with balanced back support and premium upholstery."
    },
    {
      categorySlug: "coffee-tables",
      names: ["Luno Oak Coffee Table", "Vega Round Coffee Table", "Sirius Marble Top Table", "Linea Minimal Coffee Table", "Norr Glass Coffee Table", "Mira Nesting Coffee Set"],
      basePrice: 299,
      images: [
        "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1616627561950-9f746e330187?auto=format&fit=crop&w=1400&q=80"
      ],
      desc: "Modern coffee table with practical storage and durable materials."
    },
    {
      categorySlug: "dining-tables",
      names: ["Aalto Dining Table", "Skye Extendable Dining Table", "Osen Walnut Dining Table", "Nordic Oak Family Table", "Arden Stone Dining Table", "Mila Compact Dining Table"],
      basePrice: 799,
      images: [
        "https://images.unsplash.com/photo-1617104678098-de229db51175?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1400&q=80"
      ],
      desc: "Dining table built for everyday family use with premium finish."
    },
    {
      categorySlug: "chairs",
      names: ["Milo Dining Chair", "Haven Stackable Chair", "Skand Wood Chair", "Linea Upholstered Chair", "Nora Dining Chair", "Vela Curved Chair"],
      basePrice: 159,
      images: [
        "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1400&q=80"
      ],
      desc: "Comfortable multipurpose chair with stable frame and supportive seat."
    },
    {
      categorySlug: "dressers",
      names: ["Nord 6-Drawer Dresser", "Elm Compact Commode", "Aria White Dresser", "Sage Oak Commode", "Bruno Wide Dresser", "Mira Bedroom Dresser"],
      basePrice: 499,
      images: [
        "https://images.unsplash.com/photo-1616593969747-4797dc75033e?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1400&q=80"
      ],
      desc: "Storage dresser with soft-close drawers and durable premium fronts."
    },
    {
      categorySlug: "wardrobes",
      names: ["Fjord Sliding Wardrobe", "Haven 3-Door Wardrobe", "Nordic Oak Wardrobe", "Linea Mirror Wardrobe", "Malm Closet Wardrobe", "Skye Compact Wardrobe"],
      basePrice: 999,
      images: [
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80"
      ],
      desc: "Wardrobe with organized internal layout for clothes and accessories."
    },
    {
      categorySlug: "office-furniture",
      names: ["Aero Office Desk", "Nord Standing Desk", "Luna Workstation Desk", "Haven File Cabinet", "Focus Office Shelf", "Mira Home Office Set"],
      basePrice: 389,
      images: [
        "https://images.unsplash.com/photo-1593642532400-2682810df593?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1486946255434-2466348c2166?auto=format&fit=crop&w=1400&q=80"
      ],
      desc: "Office furniture designed for productive routines and daily comfort."
    },
    {
      categorySlug: "tv-stands",
      names: ["Linea TV Stand", "Nord Walnut Media Unit", "Malm Floating TV Console", "Astra Compact TV Stand", "Haven Media Cabinet", "Skye Low TV Unit"],
      basePrice: 349,
      images: [
        "https://images.unsplash.com/photo-1519710884006-9ee9f8e8f456?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1400&q=80"
      ],
      desc: "Media furniture with cable organization and clean Scandinavian aesthetics."
    },
    {
      categorySlug: "decorative-items",
      names: ["Aurora Floor Lamp", "Bergen Wall Mirror", "Nord Ceramic Vase", "Luna Table Lamp", "Skye Decorative Tray", "Fjord Framed Art Set"],
      basePrice: 89,
      images: [
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1400&q=80"
      ],
      desc: "Decor accents that add warmth and identity to any interior."
    },
    {
      categorySlug: "outdoor",
      names: ["Fjord Patio Sofa", "Nord Teak Outdoor Chair", "Skye Garden Dining Set", "Mira Balcony Table", "Aero Outdoor Storage Bench", "Luna Weatherproof Lounge Chair"],
      basePrice: 279,
      images: [
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1400&q=80"
      ],
      desc: "Outdoor furniture designed for patios, balconies and garden relaxation."
    },
    {
      categorySlug: "bedroom",
      names: ["Aalto Walnut Bed", "Skye Upholstered Bed", "Nordic Queen Bed", "Mira Storage Bed", "Bergen Platform Bed", "Aria Oak Bed Frame"],
      basePrice: 899,
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1400&q=80"
      ],
      desc: "Bedroom furniture with calm visual balance and robust construction."
    }
  ];

  const seedGroups = productGroups.slice(0, 5);

  const products = seedGroups.flatMap((group) =>
    group.names.map((name, index) => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const price = group.basePrice + index * 35;
      return {
        name,
        slug,
        description: group.desc,
        price: price.toFixed(2),
        imageUrl: group.images[index % group.images.length],
        featured: index % 3 === 0,
        discountPct: index % 4 === 0 ? 10 : 0,
        stock: 6 + ((index * 3) % 19),
        categoryId: categoryMap.get(group.categorySlug)!.id
      };
    })
  );

  const seededSlugs = products.map((product) => product.slug);

  await prisma.product.deleteMany({
    where: {
      slug: {
        notIn: seededSlugs
      }
    }
  });

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
