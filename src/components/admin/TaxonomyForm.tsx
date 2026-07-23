"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type TaxonomyFormData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: string;
};

type TaxonomyInput = {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
};

type TaxonomyResult =
  | { ok: true; id: string }
  | { ok: false; errors: Record<string, string[]> };

const EMPTY_FORM: TaxonomyFormData = {
  name: "",
  slug: "",
  description: "",
  image: "",
  sortOrder: "0",
};

export function TaxonomyForm({
  listHref,
  initialData,
  createAction,
  updateAction,
}: {
  listHref: string;
  initialData?: TaxonomyFormData;
  createAction: (input: TaxonomyInput) => Promise<TaxonomyResult>;
  updateAction: (id: string, input: TaxonomyInput) => Promise<TaxonomyResult>;
}) {
  const router = useRouter();
  const isEdit = !!initialData?.id;
  const [form, setForm] = useState<TaxonomyFormData>(initialData ?? EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

  function updateField<K extends keyof TaxonomyFormData>(key: K, value: TaxonomyFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleNameChange(value: string) {
    updateField("name", value);
    if (!slugTouched) updateField("slug", slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setPending(true);

    const input: TaxonomyInput = {
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      image: form.image || undefined,
      sortOrder: Number(form.sortOrder) || 0,
    };

    const result = isEdit ? await updateAction(initialData!.id!, input) : await createAction(input);
    setPending(false);

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    router.push(listHref);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Tên *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Slug (URL) *</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              updateField("slug", e.target.value);
            }}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
          {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Mô tả</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Thứ tự hiển thị</label>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => updateField("sortOrder", e.target.value)}
            className="mt-1 w-32 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>
        <ImageUploadField
          label="Ảnh đại diện"
          value={form.image}
          onChange={(url) => updateField("image", url)}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
        >
          {pending ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo mới"}
        </button>
        <button
          type="button"
          onClick={() => router.push(listHref)}
          className="rounded-md border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
