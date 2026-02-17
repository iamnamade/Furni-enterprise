"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToastStore } from "@/lib/toast-store";
import { productSchema } from "@/lib/validators";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  featured: boolean;
  discountPct: number;
  stock: number;
  categoryId: string;
  categoryName: string;
};

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  imageUrl: "",
  featured: false,
  discountPct: "",
  stock: "",
  categoryId: ""
};

const CATEGORY_NAMES = {
  "living-room": { en: "Living Room", ka: "მისაღები ოთახი", ru: "Гостиная" },
  bedroom: { en: "Bedroom", ka: "საძინებელი", ru: "Спальня" },
  "soft-furniture": { en: "Soft Furniture", ka: "რბილი ავეჯი", ru: "Мягкая мебель" },
  "chairs-armchairs": { en: "Chairs & Armchairs", ka: "სკამები და სავარძლები", ru: "Стулья и кресла" },
  "dining-room": { en: "Dining Room", ka: "სასადილო", ru: "Столовая" },
  discounts: { en: "Discounts", ka: "ფასდაკლებები", ru: "Скидки" },
  outdoor: { en: "Outdoor", ka: "გარე", ru: "Улица" },
  "home-office": { en: "Home Office", ka: "ოფისი", ru: "Домашний офис" },
  beds: { en: "Beds", ka: "საწოლები", ru: "Кровати" },
  tables: { en: "Tables", ka: "მაგიდები", ru: "Столы" }
} as const;

function normalizeImageUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProductManager({
  initialProducts,
  categories
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const tAdmin = useTranslations("adminProducts");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const locale = pathname?.split("/").filter(Boolean)[0] || "en";
  const pick = (en: string, ka: string, ru: string) => (locale === "ka" ? ka : locale === "ru" ? ru : en);
  const tr = (key: string, fallback: string) => (tAdmin.has(key) ? tAdmin(key) : fallback);
  const localizedCategoryName = (slug: string, fallback: string) => {
    const entry = CATEGORY_NAMES[slug as keyof typeof CATEGORY_NAMES];
    if (!entry) return fallback;
    return locale === "ka" ? entry.ka : locale === "ru" ? entry.ru : entry.en;
  };
  const pushToast = useToastStore((state) => state.push);
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const filtered = useMemo(
    () => products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase())),
    [products, query]
  );

  function openCreate() {
    setEditingId(null);
    setForm({ ...defaultForm, categoryId: categories[0]?.id || "" });
    setOpenForm(true);
  }

  function openEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: String(product.price),
      imageUrl: product.imageUrl,
      featured: product.featured,
      discountPct: String(product.discountPct),
      stock: String(product.stock),
      categoryId: product.categoryId
    });
    setOpenForm(true);
  }

  async function submitForm() {
    setLoading(true);
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: Number(form.price),
      imageUrl: normalizeImageUrl(form.imageUrl),
      featured: form.featured,
      discountPct: Number(form.discountPct || 0),
      stock: Number(form.stock),
      categoryId: form.categoryId
    };
    const parsed = editingId ? productSchema.partial().safeParse(payload) : productSchema.safeParse(payload);
    if (!parsed.success) {
      pushToast({ title: tr("validationFailed", "Validation failed"), message: parsed.error.issues[0]?.message || tr("checkRequired", "Check required fields.") });
      setLoading(false);
      return;
    }

    const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
    const method = editingId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      pushToast({ title: tr("saveFailed", "Save failed"), message: data?.message || tr("checkRequired", "Check required fields.") });
      setLoading(false);
      return;
    }

    const product = (await response.json()) as {
      id: string;
      name: string;
      slug: string;
      description: string;
      price: number;
      imageUrl: string;
      featured: boolean;
      discountPct: number;
      stock: number;
      categoryId: string;
    };

    const category = categories.find((entry) => entry.id === product.categoryId);
    const categoryName = category ? localizedCategoryName(category.slug, category.name) : "Unknown";
    const next: Product = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      imageUrl: product.imageUrl,
      featured: product.featured,
      discountPct: product.discountPct,
      stock: product.stock,
      categoryId: product.categoryId,
      categoryName
    };

    setProducts((state) => {
      if (editingId) return state.map((entry) => (entry.id === editingId ? next : entry));
      return [next, ...state];
    });

    if (!editingId && product.slug !== payload.slug) {
      pushToast({
        title: tr("created", "Product created"),
        message: pick(
          `Slug was already used. Saved as "${product.slug}".`,
          `Slug უკვე გამოყენებული იყო. შეინახა როგორც "${product.slug}".`,
          `Slug уже был занят. Сохранено как "${product.slug}".`
        )
      });
    }

    setOpenForm(false);
    setLoading(false);
    pushToast({ title: editingId ? tr("updated", "Product updated") : tr("created", "Product created") });
  }

  async function uploadImage(file: File) {
    setLoading(true);
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Image read failed"));
      reader.readAsDataURL(file);
    });

    const response = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: base64, folder: "furni/products" })
    });

    setLoading(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      pushToast({
        title: tr("uploadFailed", "Upload failed"),
        message: data?.message || tr("tryAnotherImage", "Try another image.")
      });
      return;
    }

    const data = (await response.json()) as { url?: string; secure_url?: string; secureUrl?: string };
    const nextUrl = data.url || data.secure_url || data.secureUrl || "";
    if (!nextUrl) {
      pushToast({ title: tr("uploadFailed", "Upload failed"), message: "Upload succeeded but no image URL was returned." });
      return;
    }
    setForm((state) => ({ ...state, imageUrl: nextUrl }));
    pushToast({ title: tr("imageUploaded", "Image uploaded") });
  }

  async function deleteProduct() {
    if (!deletingId) return;
    setLoading(true);

    const response = await fetch(`/api/admin/products/${deletingId}`, { method: "DELETE" });
    if (!response.ok) {
      pushToast({ title: tr("deleteFailed", "Delete failed"), message: tr("pleaseTryAgain", "Please try again.") });
      setLoading(false);
      return;
    }

    setProducts((state) => state.filter((entry) => entry.id !== deletingId));
    setOpenDelete(false);
    setDeletingId(null);
    setLoading(false);
    pushToast({ title: tr("deleted", "Product deleted") });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input placeholder={tr("search", pick("Search products", "პროდუქტების ძებნა", "Поиск товаров"))} className="max-w-sm" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Button onClick={openCreate}>{tr("create", pick("Create product", "პროდუქტის დამატება", "Создать товар"))}</Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-brand-primary/15">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-brand-primary/8 text-left">
            <tr>
              <th className="px-4 py-3">{tr("table.name", pick("Name", "სახელი", "Название"))}</th>
              <th className="px-4 py-3">{tr("table.category", pick("Category", "კატეგორია", "Категория"))}</th>
              <th className="px-4 py-3">{tr("table.price", pick("Price", "ფასი", "Цена"))}</th>
              <th className="px-4 py-3">{tr("table.discount", pick("Discount", "ფასდაკლება", "Скидка"))}</th>
              <th className="px-4 py-3">{tr("table.stock", pick("Stock", "მარაგი", "Остаток"))}</th>
              <th className="px-4 py-3">{tr("table.actions", pick("Actions", "ქმედებები", "Действия"))}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-t border-brand-primary/10">
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3">
                  {localizedCategoryName(categories.find((entry) => entry.id === product.categoryId)?.slug || "", product.categoryName)}
                </td>
                <td className="px-4 py-3">${product.price.toFixed(2)}</td>
                <td className="px-4 py-3">{product.discountPct}%</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => openEdit(product)}>
                      {tr("edit", pick("Edit", "რედაქტირება", "Редактировать"))}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setDeletingId(product.id);
                        setOpenDelete(true);
                      }}
                    >
                      {tCommon("remove")}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={openForm}
        title={editingId ? tr("editProduct", pick("Edit product", "პროდუქტის რედაქტირება", "Редактировать товар")) : tr("createProduct", pick("Create product", "პროდუქტის დამატება", "Создать товар"))}
        onClose={() => setOpenForm(false)}
        closeLabel={tr("close", "Close")}
        variant="bottom-sheet"
      >
        <div className="space-y-3">
          <Input
            placeholder={tr("fields.name", "Name")}
            className="border-0 bg-[#F5F5F5] text-[#102c26] placeholder:text-[#567267]"
            value={form.name}
            onChange={(event) =>
              setForm((state) => {
                const name = event.target.value;
                const autoSlug = !state.slug.trim() || state.slug === slugify(state.name) ? slugify(name) : state.slug;
                return { ...state, name, slug: autoSlug };
              })
            }
          />
          <Input
            placeholder={tr("fields.slug", "Slug")}
            className="border-0 bg-[#F5F5F5] text-[#102c26] placeholder:text-[#567267]"
            value={form.slug}
            onChange={(event) => setForm((state) => ({ ...state, slug: event.target.value }))}
          />
          <Input
            placeholder={tr("fields.description", "Description")}
            className="border-0 bg-[#F5F5F5] text-[#102c26] placeholder:text-[#567267]"
            value={form.description}
            onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder={tr("fields.price", "Price")}
              type="number"
              className="border-0 bg-[#F5F5F5] text-[#102c26] placeholder:text-[#567267]"
              value={form.price}
              onChange={(event) => setForm((state) => ({ ...state, price: event.target.value }))}
            />
            <Input
              placeholder={tr("fields.discount", "Discount %")}
              type="number"
              className="border-0 bg-[#F5F5F5] text-[#102c26] placeholder:text-[#567267]"
              value={form.discountPct}
              onChange={(event) => setForm((state) => ({ ...state, discountPct: event.target.value }))}
            />
          </div>
          <Input
            placeholder={tr("fields.stock", "Stock")}
            type="number"
            className="border-0 bg-[#F5F5F5] text-[#102c26] placeholder:text-[#567267]"
            value={form.stock}
            onChange={(event) => setForm((state) => ({ ...state, stock: event.target.value }))}
          />
          <Input
            placeholder={tr("fields.imageUrl", "Image URL")}
            className="border-0 bg-[#F5F5F5] text-[#102c26] placeholder:text-[#567267]"
            value={form.imageUrl}
            onChange={(event) => setForm((state) => ({ ...state, imageUrl: event.target.value }))}
            onBlur={(event) => setForm((state) => ({ ...state, imageUrl: normalizeImageUrl(event.target.value) }))}
          />
          {form.imageUrl ? (
            <div className="overflow-hidden rounded-xl border border-white/20">
              <Image src={form.imageUrl} alt="Preview" width={640} height={360} className="h-32 w-full object-cover" />
            </div>
          ) : null}
          <div className="space-y-2 rounded-xl border border-white/10 p-3">
            <p className="text-xs text-white/70">{tr("orUploadImage", "Or upload image")}</p>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadImage(file);
              }}
              className="block w-full text-sm text-white/80 file:mr-3 file:rounded-full file:border-0 file:bg-brand-secondary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-primary"
            />
          </div>
          <select
            className="h-11 w-full rounded-2xl border border-brand-primary/20 bg-[color:var(--surface)] px-3 text-sm"
            value={form.categoryId}
            onChange={(event) => setForm((state) => ({ ...state, categoryId: event.target.value }))}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {localizedCategoryName(category.slug, category.name)}
              </option>
            ))}
          </select>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => setForm((state) => ({ ...state, featured: event.target.checked }))}
            />
            {tr("fields.featured", "Featured")}
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpenForm(false)}>
              {tr("cancel", "Cancel")}
            </Button>
            <Button onClick={submitForm} disabled={loading}>
              {loading ? tr("saving", "Saving...") : tr("save", "Save")}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={openDelete} title={tr("deleteProduct", "Delete product")} onClose={() => setOpenDelete(false)} closeLabel={tr("close", "Close")}>
        <p className="text-sm text-muted">{tr("cannotUndo", "This action cannot be undone.")}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpenDelete(false)}>
            {tr("cancel", "Cancel")}
          </Button>
          <Button variant="danger" onClick={deleteProduct} disabled={loading}>
            {loading ? tr("deleting", "Deleting...") : tCommon("remove")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
