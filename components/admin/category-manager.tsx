"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToastStore } from "@/lib/toast-store";
import { categorySchema } from "@/lib/validators";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const pathname = usePathname();
  const locale = pathname?.split("/").filter(Boolean)[0] || "en";
  const pick = (en: string, ka: string, ru: string) => (locale === "ka" ? ka : locale === "ru" ? ru : en);
  const pushToast = useToastStore((state) => state.push);
  const [categories, setCategories] = useState(initialCategories);
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [loading, setLoading] = useState(false);

  function startCreate() {
    setEditingId(null);
    setForm({ name: "", slug: "", description: "" });
    setOpen(true);
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setForm({ name: category.name, slug: category.slug, description: category.description || "" });
    setOpen(true);
  }

  async function saveCategory() {
    setLoading(true);
    const parsed = categorySchema.safeParse(form);
    if (!parsed.success) {
      pushToast({ title: pick("Validation failed", "ვალიდაცია ვერ გავიდა", "Ошибка валидации"), message: parsed.error.issues[0]?.message || pick("Check category fields.", "შეამოწმე კატეგორიის ველები.", "Проверьте поля категории.") });
      setLoading(false);
      return;
    }

    const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
    const method = editingId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      pushToast({ title: pick("Save failed", "შენახვა ვერ მოხერხდა", "Сохранение не удалось"), message: pick("Check category fields.", "შეამოწმე კატეგორიის ველები.", "Проверьте поля категории.") });
      setLoading(false);
      return;
    }

    const category = (await response.json()) as Category;
    setCategories((state) => {
      if (editingId) return state.map((entry) => (entry.id === editingId ? category : entry));
      return [...state, category];
    });

    setOpen(false);
    setLoading(false);
    pushToast({ title: editingId ? pick("Category updated", "კატეგორია განახლდა", "Категория обновлена") : pick("Category created", "კატეგორია დაემატა", "Категория создана") });
  }

  async function deleteCategory() {
    if (!deletingId) return;
    const response = await fetch(`/api/categories/${deletingId}`, { method: "DELETE" });
    if (!response.ok) {
      pushToast({ title: pick("Delete failed", "წაშლა ვერ მოხერხდა", "Удалить не удалось") });
      return;
    }
    setCategories((state) => state.filter((entry) => entry.id !== deletingId));
    setOpenDelete(false);
    setDeletingId(null);
    pushToast({ title: pick("Category deleted", "კატეგორია წაიშალა", "Категория удалена") });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={startCreate}>{pick("Create category", "კატეგორიის დამატება", "Создать категорию")}</Button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-brand-primary/15">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-brand-primary/8 text-left">
            <tr>
              <th className="px-4 py-3">{pick("Name", "სახელი", "Название")}</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">{pick("Description", "აღწერა", "Описание")}</th>
              <th className="px-4 py-3">{pick("Actions", "ქმედებები", "Действия")}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-brand-primary/10">
                <td className="px-4 py-3">{category.name}</td>
                <td className="px-4 py-3">{category.slug}</td>
                <td className="px-4 py-3">{category.description || "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => startEdit(category)}>
                      {pick("Edit", "რედაქტირება", "Редактировать")}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setDeletingId(category.id);
                        setOpenDelete(true);
                      }}
                    >
                      {pick("Delete", "წაშლა", "Удалить")}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} title={editingId ? pick("Edit category", "კატეგორიის რედაქტირება", "Редактировать категорию") : pick("Create category", "კატეგორიის დამატება", "Создать категорию")} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <Input placeholder={pick("Name", "სახელი", "Название")} value={form.name} onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))} />
          <Input placeholder="Slug" value={form.slug} onChange={(event) => setForm((state) => ({ ...state, slug: event.target.value }))} />
          <Input
            placeholder={pick("Description", "აღწერა", "Описание")}
            value={form.description}
            onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {pick("Cancel", "გაუქმება", "Отмена")}
            </Button>
            <Button onClick={saveCategory} disabled={loading}>
              {loading ? pick("Saving...", "ინახება...", "Сохранение...") : pick("Save", "შენახვა", "Сохранить")}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={openDelete} title={pick("Delete category", "კატეგორიის წაშლა", "Удалить категорию")} onClose={() => setOpenDelete(false)}>
        <p className="text-sm text-muted">{pick("This action cannot be undone.", "ეს ქმედება შეუქცევადია.", "Это действие нельзя отменить.")}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpenDelete(false)}>
            {pick("Cancel", "გაუქმება", "Отмена")}
          </Button>
          <Button variant="danger" onClick={deleteCategory}>
            {pick("Delete", "წაშლა", "Удалить")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
