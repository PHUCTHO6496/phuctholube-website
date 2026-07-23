"use client";

import { useMemo, useState } from "react";
import { AlertCircle, ArrowRight, Search } from "lucide-react";
import { formatVND } from "@/lib/format";
import { AddToQuoteButton } from "@/components/site/AddToQuoteButton";
import Link from "next/link";

export type EquivalentProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  price: number | null;
  shortDescription: string | null;
  categoryId: string | null;
  categoryName: string;
  viscosityGrade: string | null;
};

export function EquivalentFinder({ products }: { products: EquivalentProduct[] }) {
  const [selectedId, setSelectedId] = useState("");

  const byCategory = useMemo(() => {
    const map = new Map<string, EquivalentProduct[]>();
    for (const p of products) {
      const list = map.get(p.categoryName) ?? [];
      list.push(p);
      map.set(p.categoryName, list);
    }
    return Array.from(map.entries());
  }, [products]);

  const selected = products.find((p) => p.id === selectedId) ?? null;

  const equivalents = useMemo(() => {
    if (!selected || !selected.viscosityGrade) return [];
    return products.filter(
      (p) =>
        p.id !== selected.id &&
        p.categoryId === selected.categoryId &&
        p.viscosityGrade === selected.viscosityGrade &&
        p.brand !== selected.brand
    );
  }, [products, selected]);

  const equivalentsByBrand = useMemo(() => {
    const map = new Map<string, EquivalentProduct[]>();
    for (const p of equivalents) {
      const key = p.brand ?? "Khác";
      const list = map.get(key) ?? [];
      list.push(p);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [equivalents]);

  return (
    <div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <label className="block text-sm font-medium text-slate-700">
          Chọn sản phẩm bạn đang dùng
        </label>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-md border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none"
          >
            <option value="">-- Chọn sản phẩm --</option>
            {byCategory.map(([categoryName, items]) => (
              <optgroup key={categoryName} label={categoryName}>
                {items.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.brand ? `${p.brand} — ` : ""}
                    {p.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {selected && (
        <div className="mt-8">
          {!selected.viscosityGrade ? (
            <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                Sản phẩm này chưa có thông tin cấp độ nhớt để so sánh tự động.
                Vui lòng liên hệ đội ngũ kỹ thuật để được tư vấn sản phẩm
                tương đương.
                <div className="mt-3">
                  <Link
                    href="/lien-he"
                    className="inline-flex items-center gap-1 font-semibold text-blue-900 hover:text-amber-600"
                  >
                    Liên hệ tư vấn
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ) : equivalents.length === 0 ? (
            <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              Chưa tìm thấy sản phẩm tương đương từ hãng khác trong danh mục
              này (cấp độ nhớt {selected.viscosityGrade}).
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500">
                Gợi ý {equivalents.length} sản phẩm tương đương — cùng danh
                mục <strong>{selected.categoryName}</strong>, cấp độ nhớt{" "}
                <strong>{selected.viscosityGrade}</strong>
              </p>
              <div className="mt-4 space-y-8">
                {equivalentsByBrand.map(([brand, items]) => (
                  <div key={brand}>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      {brand}
                    </h3>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-xl border border-slate-200 p-5"
                        >
                          <Link href={`/san-pham/${p.slug}`} className="block">
                            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                              {p.categoryName}
                            </p>
                            <h4 className="mt-1 text-base font-bold text-slate-900 hover:text-blue-900">
                              {p.name}
                            </h4>
                            {p.shortDescription && (
                              <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                                {p.shortDescription}
                              </p>
                            )}
                            <p className="mt-3 text-sm font-bold text-blue-900">
                              {formatVND(p.price)}
                            </p>
                          </Link>
                          <AddToQuoteButton product={p} className="mt-4" fullWidth />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <p className="mt-10 border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-400">
        * Kết quả gợi ý dựa trên cùng danh mục sản phẩm và cấp độ nhớt tương
        tự, chỉ mang tính tham khảo ban đầu — không phải xác nhận thay thế
        chính thức. Vui lòng liên hệ đội ngũ kỹ thuật Phúc Thọ để được tư vấn
        và xác nhận trước khi thay đổi sản phẩm đang sử dụng.
      </p>
    </div>
  );
}
