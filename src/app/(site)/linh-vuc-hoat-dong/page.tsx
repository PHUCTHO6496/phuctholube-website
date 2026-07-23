import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Lĩnh vực hoạt động",
  description:
    "Phúc Thọ cung cấp dầu nhớt công nghiệp chất lượng cao cho nhiều ngành công nghiệp khác nhau: dầu khí, hàng hải, sản xuất, vận tải, xây dựng.",
};

export default async function IndustriesPage() {
  const industries = await prisma.industry.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  const totalProducts = await prisma.product.count({ where: { published: true } });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Lĩnh vực hoạt động
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Chúng tôi cung cấp dầu nhớt công nghiệp chất lượng cao cho nhiều
          ngành công nghiệp khác nhau, từ ô tô đến công nghiệp nặng.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((ind) => (
          <Link
            key={ind.slug}
            href={`/linh-vuc-hoat-dong/${ind.slug}`}
            className="group rounded-xl border border-slate-200 p-6 transition-shadow hover:shadow-lg"
          >
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-900">
              {ind.name}
            </h3>
            {ind.description && (
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {ind.description}
              </p>
            )}
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-900">
              Xem chi tiết
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-14 grid grid-cols-1 gap-8 border-t border-slate-200 pt-10 sm:grid-cols-3">
        <div className="text-center">
          <div className="text-4xl font-extrabold text-blue-900">
            {industries.length}+
          </div>
          <p className="mt-1 text-sm text-slate-600">Lĩnh vực hoạt động</p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-extrabold text-blue-900">
            {totalProducts}+
          </div>
          <p className="mt-1 text-sm text-slate-600">Sản phẩm chất lượng</p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-extrabold text-blue-900">30+</div>
          <p className="mt-1 text-sm text-slate-600">Năm kinh nghiệm</p>
        </div>
      </div>
    </div>
  );
}
