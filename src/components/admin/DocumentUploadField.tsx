"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, X } from "lucide-react";

export function DocumentUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Tải tệp lên thất bại");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Tải tệp lên thất bại");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-2 flex items-center gap-3">
        {value ? (
          <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
            <FileText className="h-4 w-4 text-blue-900" />
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="max-w-[220px] truncate hover:text-blue-900"
            >
              {value.split("/").pop()}
            </a>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-slate-400 hover:text-red-600"
              aria-label="Xóa tệp"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ) : (
          <span className="text-sm text-slate-400">Chưa có tệp</span>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
            </span>
          ) : value ? (
            "Đổi tệp"
          ) : (
            "Tải PDF lên"
          )}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
