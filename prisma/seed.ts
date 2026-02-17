import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@12345", 12);

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

  const seedCategories = [
    {
      name: "Living Room",
      slug: "living-room",
      description: "Comfort-forward furniture for modern living rooms."
    },
    {
      name: "Bedroom",
      slug: "bedroom",
      description: "Minimal and premium bedroom essentials."
    },
    {
      name: "Soft Furniture",
      slug: "soft-furniture",
      description: "Sofas and lounge-focused soft seating."
    },
    {
      name: "Chairs & Armchairs",
      slug: "chairs-armchairs",
      description: "Accent chairs and ergonomic armchairs."
    },
    {
      name: "Dining Room",
      slug: "dining-room",
      description: "Dining furniture for family and guests."
    },
    {
      name: "Discounts",
      slug: "discounts",
      description: "Discounted and promotional products."
    },
    {
      name: "Outdoor",
      slug: "outdoor",
      description: "Weather-ready outdoor furniture."
    },
    {
      name: "Home Office",
      slug: "home-office",
      description: "Productivity-focused furniture for home workspaces."
    },
    {
      name: "Beds",
      slug: "beds",
      description: "Bed frames and bedroom bed collections."
    },
    {
      name: "Tables",
      slug: "tables",
      description: "Coffee, side, and dining tables."
    }
  ];

  const categoryMap = new Map<string, { id: string }>();
  for (const category of seedCategories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description },
      create: category
    });
    categoryMap.set(category.slug, { id: created.id });
  }

  const products = [
    {
      name: "Oslo Lounge Sofa",
      slug: "oslo-lounge-sofa",
      description: "Three-seat modular sofa with premium woven fabric.",
      price: "1499.00",
      imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
      featured: true,
      stock: 15,
      categoryId: categoryMap.get("soft-furniture")!.id
    },
    {
      name: "Aalto Walnut Bed",
      slug: "aalto-walnut-bed",
      description: "Solid walnut queen bed frame with floating silhouette.",
      price: "1199.00",
      imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
      featured: true,
      stock: 8,
      categoryId: categoryMap.get("beds")!.id
    },
    {
      name: "Helsinki Accent Chair",
      slug: "helsinki-accent-chair",
      description: "Ergonomic accent chair with curved oak armrests.",
      price: "499.00",
      imageUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
      featured: false,
      stock: 21,
      categoryId: categoryMap.get("chairs-armchairs")!.id
    }
  ];

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
