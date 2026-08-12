import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { BRANDS } from "@/lib/constants";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductFilterBar } from "@/components/site/ProductFilterBar";
import { productCardSelect, localizeProductCard } from "@/lib/product-card-data";

const getCategoriesList = unstable_cache(
  async () =>
    prisma.productCategory.findMany({
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true },
    }),
  ["products-page-categories"],
  { tags: ["categories"], revalidate: 300 }
);

const getDistinctBrands = unstable_cache(
  async () =>
    prisma.product.findMany({
      distinct: ["brand"],
      where: { brand: { not: null } },
      select: { brand: true },
      orderBy: { brand: "asc" },
    }),
  ["products-page-brands"],
  { tags: ["products"], revalidate: 300 }
);

const getFilteredProducts = unstable_cache(
  async (categorySlug: string, brand: string) =>
    prisma.product.findMany({
      where: {
        published: true,
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        ...(brand ? { brand } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: productCardSelect,
    }),
  ["products-page-filtered"],
  { tags: ["products"], revalidate: 300 }
);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("productsPage");
  return {
    title: t("title"),
    description: t("metaDescription"),
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [t, locale] = await Promise.all([
    getTranslations("productsPage"),
    getLocale(),
  ]);

  const params = await searchParams;
  const categorySlug = typeof params.category === "string" ? params.category : "";
  const brand = typeof params.brand === "string" ? params.brand : "";
  const q = typeof params.q === "string" ? params.q.trim().toLocaleLowerCase(locale) : "";

  const [categories, brandRows, products] = await Promise.all([
    getCategoriesList(),
    getDistinctBrands(),
    getFilteredProducts(categorySlug, brand),
  ]);

  const filtered = (
    q
      ? products.filter((p) =>
          `${p.name} ${p.shortDescription ?? ""}`.toLocaleLowerCase(locale).includes(q)
        )
      : products
  ).map((p) => localizeProductCard(p, locale));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold text-slate-900">{t("title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {t("description")}
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
        {t("showingCount", { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
          {t("noResults")}
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
