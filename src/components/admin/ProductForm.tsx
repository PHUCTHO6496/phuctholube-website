"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createProduct, updateProduct, type ProductInput } from "@/lib/actions/admin-products";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { DocumentUploadField } from "@/components/admin/DocumentUploadField";

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

export type ProductFormInitialData = {
  id?: string;
  name: string;
  slug: string;
  brand: string;
  price: string;
  tdsUrl: string;
  msdsUrl: string;
  viscosityGrade: string;
  shortDescription: string;
  description: string;
  useCases: string;
  applicationTags: string;
  featured: boolean;
  published: boolean;
  categoryId: string;
  industryIds: string[];
  images: { url: string; alt: string }[];
  specs: { label: string; value: string }[];
};

const EMPTY_FORM: ProductFormInitialData = {
  name: "",
  slug: "",
  brand: "",
  price: "",
  tdsUrl: "",
  msdsUrl: "",
  viscosityGrade: "",
  shortDescription: "",
  description: "",
  useCases: "",
  applicationTags: "",
  featured: false,
  published: true,
  categoryId: "",
  industryIds: [],
  images: [],
  specs: [],
};

export function ProductForm({
  categories,
  industries,
  initialData,
}: {
  categories: { id: string; name: string }[];
  industries: { id: string; name: string }[];
  initialData?: ProductFormInitialData;
}) {
  const router = useRouter();
  const isEdit = !!initialData?.id;
  const [form, setForm] = useState<ProductFormInitialData>(initialData ?? EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

  function updateField<K extends keyof ProductFormInitialData>(
    key: K,
    value: ProductFormInitialData[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleNameChange(value: string) {
    updateField("name", value);
    if (!slugTouched) {
      updateField("slug", slugify(value));
    }
  }

  function toggleIndustry(id: string) {
    setForm((f) => ({
      ...f,
      industryIds: f.industryIds.includes(id)
        ? f.industryIds.filter((i) => i !== id)
        : [...f.industryIds, id],
    }));
  }

  function updateSpec(index: number, patch: Partial<{ label: string; value: string }>) {
    setForm((f) => ({
      ...f,
      specs: f.specs.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  }

  function addSpec() {
    setForm((f) => ({ ...f, specs: [...f.specs, { label: "", value: "" }] }));
  }

  function removeSpec(index: number) {
    setForm((f) => ({ ...f, specs: f.specs.filter((_, i) => i !== index) }));
  }

  function addImage(url: string) {
    setForm((f) => ({ ...f, images: [...f.images, { url, alt: "" }] }));
  }

  function removeImage(index: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setPending(true);

    const input: ProductInput = {
      name: form.name,
      slug: form.slug,
      brand: form.brand || undefined,
      price: form.price ? Number(form.price) : null,
      tdsUrl: form.tdsUrl || undefined,
      msdsUrl: form.msdsUrl || undefined,
      viscosityGrade: form.viscosityGrade || undefined,
      shortDescription: form.shortDescription || undefined,
      description: form.description || undefined,
      useCases: form.useCases.split("\n").map((s) => s.trim()).filter(Boolean),
      applicationTags: form.applicationTags.split("\n").map((s) => s.trim()).filter(Boolean),
      featured: form.featured,
      published: form.published,
      categoryId: form.categoryId || null,
      industryIds: form.industryIds,
      images: form.images.filter((img) => img.url),
      specs: form.specs.filter((s) => s.label && s.value),
    };

    const result = isEdit
      ? await updateProduct(initialData!.id!, input)
      : await createProduct(input);

    setPending(false);

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    router.push("/admin/san-pham");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Thông tin cơ bản
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Tên sản phẩm *</label>
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
            <label className="block text-sm font-medium text-slate-700">Thương hiệu</label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => updateField("brand", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Giá (VNĐ)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Cấp độ nhớt (vd: 46, 220, 15W-40)
            </label>
            <input
              type="text"
              value={form.viscosityGrade}
              onChange={(e) => updateField("viscosityGrade", e.target.value)}
              placeholder="46"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">
              Dùng để gợi ý sản phẩm tương đương giữa các thương hiệu.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Danh mục</label>
            <select
              value={form.categoryId}
              onChange={(e) => updateField("categoryId", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-6 pt-6">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => updateField("featured", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Sản phẩm nổi bật
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => updateField("published", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Xuất bản
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Mô tả</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Mô tả ngắn</label>
            <textarea
              value={form.shortDescription}
              onChange={(e) => updateField("shortDescription", e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Mô tả chi tiết</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Ứng dụng (mỗi dòng một mục)
            </label>
            <textarea
              value={form.useCases}
              onChange={(e) => updateField("useCases", e.target.value)}
              rows={3}
              placeholder={"Hệ thống thủy lực máy xúc\nMáy ép"}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Tag ngành áp dụng (mỗi dòng một mục)
            </label>
            <textarea
              value={form.applicationTags}
              onChange={(e) => updateField("applicationTags", e.target.value)}
              rows={3}
              placeholder={"Công nghiệp nặng\nXây dựng"}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Lĩnh vực hoạt động liên quan
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {industries.map((ind) => (
            <label
              key={ind.id}
              className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={form.industryIds.includes(ind.id)}
                onChange={() => toggleIndustry(ind.id)}
                className="h-4 w-4 rounded border-slate-300"
              />
              {ind.name}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Thông số kỹ thuật
          </h2>
          <button
            type="button"
            onClick={addSpec}
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-900 hover:text-amber-600"
          >
            <Plus className="h-4 w-4" /> Thêm thông số
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {form.specs.map((spec, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Tên thông số (vd: Độ nhớt)"
                value={spec.label}
                onChange={(e) => updateSpec(i, { label: e.target.value })}
                className="w-1/3 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Giá trị (vd: SAE 46)"
                value={spec.value}
                onChange={(e) => updateSpec(i, { value: e.target.value })}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeSpec(i)}
                className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {form.specs.length === 0 && (
            <p className="text-sm text-slate-400">Chưa có thông số nào.</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Hình ảnh sản phẩm
          </h2>
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          {form.images.map((img, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="h-24 w-24 rounded-lg object-cover ring-1 ring-slate-200"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-slate-500 shadow ring-1 ring-slate-200 hover:text-red-600"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <ImageUploadField label="Thêm ảnh mới" value="" onChange={(url) => addImage(url)} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Tài liệu kỹ thuật (PDF)
        </h2>
        <div className="mt-4 space-y-4">
          <DocumentUploadField
            label="Bảng thông số kỹ thuật (TDS)"
            value={form.tdsUrl}
            onChange={(url) => updateField("tdsUrl", url)}
          />
          <DocumentUploadField
            label="Bảng chỉ dẫn an toàn (MSDS)"
            value={form.msdsUrl}
            onChange={(url) => updateField("msdsUrl", url)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
        >
          {pending ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo sản phẩm"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/san-pham")}
          className="rounded-md border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
