import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { EquivalentFinder, type EquivalentProduct } from "@/components/site/EquivalentFinder";

export const metadata: Metadata = {
  title: "Tra cứu sản phẩm tương đương",
  description:
    "Tìm sản phẩm dầu nhớt tương đương giữa các thương hiệu Shell, Mobil, Total, Castrol theo danh mục và cấp độ nhớt.",
};

export default async function EquivalentLookupPage() {
  const products = await prisma.product.findMany({
    where: { published: true },
    orderBy: [{ category: { sortOrder: "asc" } }, { brand: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      price: true,
      shortDescription: true,
      categoryId: true,
      viscosityGrade: true,
      category: { select: { name: true } },
    },
  });

  const items: EquivalentProduct[] = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    price: p.price,
    shortDescription: p.shortDescription,
    categoryId: p.categoryId,
    categoryName: p.category?.name ?? "Khác",
    viscosityGrade: p.viscosityGrade,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Tra cứu sản phẩm tương đương
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Đang dùng dầu nhớt của một hãng nhưng muốn tham khảo sản phẩm tương
          đương từ Shell, Mobil, Total hoặc Castrol? Chọn sản phẩm bên dưới để
          xem gợi ý cùng danh mục và cấp độ nhớt.
        </p>
      </div>

      <div className="mt-8">
        <EquivalentFinder products={items} />
      </div>
    </div>
  );
}
