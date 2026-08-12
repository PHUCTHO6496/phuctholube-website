import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/site/ProductCard";
import { localized } from "@/lib/localized";
import { productCardSelect, localizeProductCard } from "@/lib/product-card-data";

async function getIndustry(slug: string) {
  return prisma.industry.findUnique({ where: { slug } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [industry, locale, t] = await Promise.all([
    getIndustry(slug),
    getLocale(),
    getTranslations("industryDetail"),
  ]);
  if (!industry) return {};
  const name = localized(locale, industry.name, industry.nameEn);
  return {
    title: name,
    description:
      localized(locale, industry.description, industry.descriptionEn) ??
      t("defaultDescription", { name }),
  };
}

export async function generateStaticParams() {
  const industries = await prisma.industry.findMany({ select: { slug: true } });
  return industries.map((i) => ({ slug: i.slug }));
}

export default async function IndustryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [industry, locale, t] = await Promise.all([
    getIndustry(slug),
    getLocale(),
    getTranslations("industryDetail"),
  ]);
  if (!industry) notFound();

  const name = localized(locale, industry.name, industry.nameEn);
  const description = localized(locale, industry.description, industry.descriptionEn);

  const productsRaw = await prisma.product.findMany({
    where: { published: true, industries: { some: { slug } } },
    orderBy: { sortOrder: "asc" },
    select: productCardSelect,
  });
  const products = productsRaw.map((p) => localizeProductCard(p, locale));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link href="/linh-vuc-hoat-dong" className="hover:text-blue-900">
          {t("breadcrumbIndustries")}
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
        {products.length > 0
          ? t("matchingProducts", { count: products.length })
          : t("noProducts")}
      </p>

      {products.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
          {t("contactPrompt", { name: name.toLowerCase() })}
          <div className="mt-4">
            <Link
              href="/lien-he"
              className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
            >
              {t("contactCta")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
