import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/site/ProductCard";

async function getCategory(slug: string) {
  return prisma.productCategory.findUnique({ where: { slug } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return {
    title: category.name,
    description:
      category.description ??
      `Danh sách sản phẩm ${category.name} chính hãng từ Phúc Thọ.`,
  };
}

export async function generateStaticParams() {
  const categories = await prisma.productCategory.findMany({
    select: { slug: true },
  });
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function ProductCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const products = await prisma.product.findMany({
    where: { published: true, categoryId: category.id },
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link href="/san-pham" className="hover:text-blue-900">
          Sản phẩm
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-700">{category.name}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
        {category.name}
      </h1>
      {category.description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          {category.description}
        </p>
      )}

      <p className="mt-6 text-sm text-slate-500">
        Hiển thị {products.length} sản phẩm
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
