"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/admin/TiptapEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { createPost, updatePost, type PostInput } from "@/lib/actions/admin-posts";

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

export type BlogPostFormData = {
  id?: string;
  title: string;
  slug: string;
  author: string;
  excerpt: string;
  contentHtml: string;
  coverImage: string;
  published: boolean;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
};

const EMPTY_FORM: BlogPostFormData = {
  title: "",
  slug: "",
  author: "",
  excerpt: "",
  contentHtml: "",
  coverImage: "",
  published: false,
  publishedAt: "",
  seoTitle: "",
  seoDescription: "",
};

export function BlogPostForm({ initialData }: { initialData?: BlogPostFormData }) {
  const router = useRouter();
  const isEdit = !!initialData?.id;
  const [form, setForm] = useState<BlogPostFormData>(initialData ?? EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

  function updateField<K extends keyof BlogPostFormData>(key: K, value: BlogPostFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleTitleChange(value: string) {
    updateField("title", value);
    if (!slugTouched) updateField("slug", slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setPending(true);

    const input: PostInput = {
      title: form.title,
      slug: form.slug,
      author: form.author || undefined,
      excerpt: form.excerpt || undefined,
      contentHtml: form.contentHtml,
      coverImage: form.coverImage || undefined,
      published: form.published,
      publishedAt: form.publishedAt || undefined,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
    };

    const result = isEdit ? await updatePost(initialData!.id!, input) : await createPost(input);
    setPending(false);

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    router.push("/admin/bai-viet");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Tiêu đề *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title[0]}</p>}
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Tác giả</label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => updateField("author", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Ngày đăng</label>
            <input
              type="date"
              value={form.publishedAt}
              onChange={(e) => updateField("publishedAt", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Tóm tắt</label>
          <textarea
            value={form.excerpt}
            onChange={(e) => updateField("excerpt", e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>
        <ImageUploadField
          label="Ảnh bìa"
          value={form.coverImage}
          onChange={(url) => updateField("coverImage", url)}
        />
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

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <label className="block text-sm font-medium text-slate-700">Nội dung *</label>
        <div className="mt-2">
          <TiptapEditor
            value={form.contentHtml}
            onChange={(html) => updateField("contentHtml", html)}
          />
        </div>
        {errors.contentHtml && (
          <p className="mt-1 text-xs text-red-600">{errors.contentHtml[0]}</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">SEO</h2>
        <div>
          <label className="block text-sm font-medium text-slate-700">SEO Title</label>
          <input
            type="text"
            value={form.seoTitle}
            onChange={(e) => updateField("seoTitle", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">SEO Description</label>
          <textarea
            value={form.seoDescription}
            onChange={(e) => updateField("seoDescription", e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
        >
          {pending ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo bài viết"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/bai-viet")}
          className="rounded-md border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
