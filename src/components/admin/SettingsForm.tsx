"use client";

import { useState } from "react";
import { updateSiteSettings, type SettingsInput } from "@/lib/actions/admin-settings";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export function SettingsForm({ initialData }: { initialData: SettingsInput }) {
  const [form, setForm] = useState<SettingsInput>(initialData);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateField<K extends keyof SettingsInput>(key: K, value: SettingsInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setPending(true);
    const result = await updateSiteSettings({
      ...form,
      galleryImages: form.galleryImages.filter(Boolean),
    });
    setPending(false);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Logo
        </h2>
        <div className="mt-4">
          <ImageUploadField
            label="Logo website (hiển thị ở đầu trang và chân trang)"
            value={form.logoUrl ?? ""}
            onChange={(url) => updateField("logoUrl", url)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Ảnh trang chủ
        </h2>
        <div className="mt-4">
          <ImageUploadField
            label="Ảnh khu vực giới thiệu (banner đầu trang chủ)"
            value={form.heroImageUrl ?? ""}
            onChange={(url) => updateField("heroImageUrl", url)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Thư viện hình ảnh
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Hiển thị ở mục &quot;Thư viện hình ảnh&quot; trên trang chủ. Tối đa 8 ảnh.
        </p>
        <div className="mt-4 space-y-4">
          {form.galleryImages.map((url, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex-1">
                <ImageUploadField
                  label={`Ảnh ${i + 1}`}
                  value={url}
                  onChange={(newUrl) =>
                    updateField(
                      "galleryImages",
                      form.galleryImages.map((u, j) => (j === i ? newUrl : u))
                    )
                  }
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  updateField(
                    "galleryImages",
                    form.galleryImages.filter((_, j) => j !== i)
                  )
                }
                className="mt-6 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Xóa
              </button>
            </div>
          ))}
          {form.galleryImages.length < 8 && (
            <button
              type="button"
              onClick={() => updateField("galleryImages", [...form.galleryImages, ""])}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              + Thêm ảnh
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Số liệu trang chủ
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Số 1 (vd: 25+)</label>
            <input
              type="text"
              value={form.statYearsValue}
              onChange={(e) => updateField("statYearsValue", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Mô tả số 1</label>
            <input
              type="text"
              value={form.statYearsLabel}
              onChange={(e) => updateField("statYearsLabel", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Số 2 (vd: 1M)</label>
            <input
              type="text"
              value={form.statVolumeValue}
              onChange={(e) => updateField("statVolumeValue", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Mô tả số 2</label>
            <input
              type="text"
              value={form.statVolumeLabel}
              onChange={(e) => updateField("statVolumeLabel", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Số 3 (vd: 100%)</label>
            <input
              type="text"
              value={form.statQualityValue}
              onChange={(e) => updateField("statQualityValue", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Mô tả số 3</label>
            <input
              type="text"
              value={form.statQualityLabel}
              onChange={(e) => updateField("statQualityLabel", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Thông tin liên hệ
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Địa chỉ</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
            {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address[0]}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Số điện thoại</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email[0]}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Link Zalo</label>
            <input
              type="text"
              value={form.zaloUrl}
              onChange={(e) => updateField("zaloUrl", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Link Facebook Fanpage</label>
              <input
                type="text"
                value={form.facebookUrl ?? ""}
                onChange={(e) => updateField("facebookUrl", e.target.value)}
                placeholder="https://facebook.com/..."
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Link LinkedIn</label>
              <input
                type="text"
                value={form.linkedinUrl ?? ""}
                onChange={(e) => updateField("linkedinUrl", e.target.value)}
                placeholder="https://linkedin.com/company/..."
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Giờ làm việc
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Thứ 2 - Thứ 6</label>
            <input
              type="text"
              value={form.hoursMonFri}
              onChange={(e) => updateField("hoursMonFri", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Thứ 7</label>
            <input
              type="text"
              value={form.hoursSat}
              onChange={(e) => updateField("hoursSat", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Chủ nhật</label>
            <input
              type="text"
              value={form.hoursSun}
              onChange={(e) => updateField("hoursSun", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
        >
          {pending ? "Đang lưu..." : "Lưu cài đặt"}
        </button>
        {saved && <p className="text-sm text-green-600">Đã lưu thay đổi.</p>}
      </div>
    </form>
  );
}
