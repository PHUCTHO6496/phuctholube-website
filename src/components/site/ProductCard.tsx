import Link from "next/link";
import { formatVND } from "@/lib/format";
import { AddToQuoteButton } from "@/components/site/AddToQuoteButton";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  price: number | null;
  shortDescription: string | null;
  category: { name: string } | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 p-5 transition-shadow hover:shadow-lg">
      <Link href={`/san-pham/${product.slug}`} className="group flex flex-1 flex-col">
        <div className="mb-4 flex aspect-square items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
          Ảnh sản phẩm
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
            {product.category?.name ?? "Sản phẩm"}
          </p>
          {product.brand && (
            <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-900">
              {product.brand}
            </span>
          )}
        </div>
        <h3 className="mt-1 text-base font-bold text-slate-900 group-hover:text-blue-900">
          {product.name}
        </h3>
        {product.shortDescription && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
            {product.shortDescription}
          </p>
        )}
        <p className="mt-3 text-sm font-bold text-blue-900">
          {formatVND(product.price)}
        </p>
      </Link>
      <AddToQuoteButton
        product={product}
        className="mt-4"
        fullWidth
      />
    </div>
  );
}
