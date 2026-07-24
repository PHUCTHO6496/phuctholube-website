import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { BRANDS, getBrandBySlug } from "@/lib/constants";
import { ProductCard } from "@/components/site/ProductCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) return {};
  return {
    title: `Dầu nhớt ${brand.name} chính hãng`,
    description: brand.description,
  };
}

export function generateStaticParams() {
  return BRANDS.map((b) => ({ slug: b.slug }));
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) notFound();

  const products = await prisma.product.findMany({
    where: { published: true, brand: brand.name },
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
  });

  const otherBrands = BRANDS.filter((b) => b.slug !== brand.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link href="/san-pham" className="hover:text-blue-900">
          Sản phẩm
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-700">Thương hiệu {brand.name}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50 text-xl font-extrabold text-blue-900">
          {brand.name.charAt(0)}
        </span>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Dầu nhớt {brand.name} chính hãng
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
            {brand.description}
          </p>
        </div>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Hiển thị {products.length} sản phẩm {brand.name}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      <div className="mt-14 border-t border-slate-200 pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Thương hiệu khác
        </h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {otherBrands.map((b) => (
            <Link
              key={b.slug}
              href={`/san-pham/thuong-hieu/${b.slug}`}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-900 hover:text-blue-900"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
