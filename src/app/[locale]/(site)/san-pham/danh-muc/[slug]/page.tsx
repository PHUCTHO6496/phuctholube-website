import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/site/ProductCard";
import { localized } from "@/lib/localized";
import { productCardSelect, localizeProductCard } from "@/lib/product-card-data";

async function getCategory(slug: string) {
  return prisma.productCategory.findUnique({ where: { slug } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [category, locale, t] = await Promise.all([
    getCategory(slug),
    getLocale(),
    getTranslations("categoryPage"),
  ]);
  if (!category) return {};
  const name = localized(locale, category.name, category.nameEn);
  return {
    title: name,
    description:
      localized(locale, category.description, category.descriptionEn) ??
      t("defaultDescription", { name }),
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
  const [category, locale, t] = await Promise.all([
    getCategory(slug),
    getLocale(),
    getTranslations("categoryPage"),
  ]);
  if (!category) notFound();

  const name = localized(locale, category.name, category.nameEn);
  const description = localized(locale, category.description, category.descriptionEn);

  const products = await prisma.product.findMany({
    where: { published: true, categoryId: category.id },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: productCardSelect,
  });

  const localizedProducts = products.map((p) => localizeProductCard(p, locale));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link href="/san-pham" className="hover:text-blue-900">
          {t("breadcrumbProducts")}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-700">{name}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold text-slate-900">{name}</h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          {description}
        </p>
      )}

      <p className="mt-6 text-sm text-slate-500">
        {t("showingCount", { count: products.length })}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {localizedProducts.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
