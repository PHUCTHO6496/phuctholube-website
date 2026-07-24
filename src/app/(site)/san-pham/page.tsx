import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { BRANDS } from "@/lib/constants";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductFilterBar } from "@/components/site/ProductFilterBar";

export const metadata: Metadata = {
  title: "Sản phẩm dầu nhớt công nghiệp",
  description:
    "Danh mục đầy đủ các sản phẩm dầu nhớt công nghiệp Phúc Thọ: dầu thủy lực, dầu động cơ, dầu bánh răng, mỡ bôi trơn chính hãng Shell, Mobil, Total, Castrol.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const categorySlug = typeof params.category === "string" ? params.category : "";
  const brand = typeof params.brand === "string" ? params.brand : "";
  const q = typeof params.q === "string" ? params.q.trim().toLocaleLowerCase("vi") : "";

  const [categories, brandRows, products] = await Promise.all([
    prisma.productCategory.findMany({
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true },
    }),
    prisma.product.findMany({
      distinct: ["brand"],
      where: { brand: { not: null } },
      select: { brand: true },
      orderBy: { brand: "asc" },
    }),
    prisma.product.findMany({
      where: {
        published: true,
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        ...(brand ? { brand } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        brand: true,
        price: true,
        shortDescription: true,
        category: { select: { name: true } },
        images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
      },
    }),
  ]);

  const filtered = q
    ? products.filter((p) =>
        `${p.name} ${p.shortDescription ?? ""}`.toLocaleLowerCase("vi").includes(q)
      )
    : products;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Sản phẩm dầu nhớt công nghiệp
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Dầu nhớt công nghiệp chất lượng cao cho mọi ngành nghề. 100% chính
          hãng Shell, Mobil, Total, Castrol — được kiểm định và bảo quản
          nghiêm ngặt.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {BRANDS.map((b) => (
          <Link
            key={b.slug}
            href={`/san-pham/thuong-hieu/${b.slug}`}
            className="rounded-full bg-blue-900 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-950"
          >
            {b.name}
          </Link>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/san-pham/danh-muc/${c.slug}`}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-blue-900 hover:text-blue-900"
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <ProductFilterBar
          categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
          brands={brandRows
            .filter((b): b is { brand: string } => !!b.brand)
            .map((b) => ({ value: b.brand, label: b.brand }))}
        />
      </div>

      <p className="mt-6 text-sm text-slate-500">
        Hiển thị {filtered.length} sản phẩm
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
          Không tìm thấy sản phẩm phù hợp. Vui lòng thử từ khóa hoặc bộ lọc
          khác.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
