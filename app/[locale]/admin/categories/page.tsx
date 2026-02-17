import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/category-manager";
import { getTranslations } from "next-intl/server";

export default async function AdminCategoriesPage() {
  const tAdmin = await getTranslations("admin");
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const initialCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description
  }));

  return (
    <div className="space-y-4">
      <h1 className="section-title">{tAdmin("categories")}</h1>
      <CategoryManager initialCategories={initialCategories} />
    </div>
  );
}
