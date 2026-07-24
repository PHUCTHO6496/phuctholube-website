import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ChevronRight, FileText } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatVND } from "@/lib/format";
import { ProductCard } from "@/components/site/ProductCard";
import { AddToQuoteButton } from "@/components/site/AddToQuoteButton";
import { JsonLd } from "@/components/site/JsonLd";
import { SITE_URL } from "@/lib/constants";
import { localized, localizedJson } from "@/lib/localized";
import { productCardSelect, localizeProductCard } from "@/lib/product-card-data";

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug, published: true },
    include: {
      category: true,
      specs: { orderBy: { sortOrder: "asc" } },
      industries: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [product, locale, t] = await Promise.all([
    getProduct(slug),
    getLocale(),
    getTranslations("productDetail"),
  ]);
  if (!product) return {};
  const categoryName = product.category
    ? localized(locale, product.category.name, product.category.nameEn)
    : t("defaultCategory");
  return {
    title: `${product.name} - ${categoryName}`,
    description:
      localized(locale, product.shortDescription, product.shortDescriptionEn) ??
      localized(locale, product.description, product.descriptionEn) ??
      undefined,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, locale, t, tProductCard] = await Promise.all([
    getProduct(slug),
    getLocale(),
    getTranslations("productDetail"),
    getTranslations("productCard"),
  ]);
  if (!product) notFound();

  const shortDescription = localized(
    locale,
    product.shortDescription,
    product.shortDescriptionEn
  );
  const description = localized(locale, product.description, product.descriptionEn);
  const categoryName = product.category
    ? localized(locale, product.category.name, product.category.nameEn)
    : t("defaultCategory");

  const useCasesVi = Array.isArray(product.useCases) ? (product.useCases as string[]) : [];
  const useCasesEn = Array.isArray(product.useCasesEn)
    ? (product.useCasesEn as string[])
    : [];
  const useCases = localizedJson(locale, useCasesVi, useCasesEn);

  const applicationTagsVi = Array.isArray(product.applicationTags)
    ? (product.applicationTags as string[])
    : [];
  const applicationTagsEn = Array.isArray(product.applicationTagsEn)
    ? (product.applicationTagsEn as string[])
    : [];
  const applicationTags = localizedJson(locale, applicationTagsVi, applicationTagsEn);

  const relatedRaw = product.categoryId
    ? await prisma.product.findMany({
        where: {
          published: true,
          categoryId: product.categoryId,
          id: { not: product.id },
        },
        take: 4,
        select: productCardSelect,
      })
    : [];
  const related = relatedRaw.map((p) => localizeProductCard(p, locale));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: shortDescription ?? description ?? undefined,
          brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
          category: categoryName,
          url: `${SITE_URL}/san-pham/${product.slug}`,
          offers: {
            "@type": "Offer",
            url: `${SITE_URL}/san-pham/${product.slug}`,
            priceCurrency: "VND",
            price: product.price ?? undefined,
            availability: "https://schema.org/InStock",
          },
        }}
      />
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link href="/san-pham" className="hover:text-blue-900">
          {t("breadcrumbProducts")}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-700">{product.name}</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-sm text-slate-400">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0].url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            tProductCard("imagePlaceholder")
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">
              {categoryName}
            </span>
            {product.brand && (
              <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-900">
                {product.brand}
              </span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            {product.name}
          </h1>
          <p className="mt-3 text-2xl font-bold text-blue-900">
            {formatVND(product.price)}
          </p>
          {shortDescription && (
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {shortDescription}
            </p>
          )}

          {applicationTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {applicationTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <AddToQuoteButton product={product} variant="filled" />
            <a
              href="tel:0786060496"
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              {t("callCta")}
            </a>
            <Link
              href="/bao-gia"
              className="text-sm font-semibold text-blue-900 hover:text-amber-600"
            >
              {t("viewQuoteCart")}
            </Link>
          </div>

          {useCases.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {t("applications")}
              </h2>
              <ul className="mt-3 space-y-2">
                {useCases.map((u) => (
                  <li key={u} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.specs.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {t("specifications")}
              </h2>
              <dl className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200">
                {product.specs.map((spec) => (
                  <div
                    key={spec.id}
                    className="flex justify-between gap-4 px-4 py-2.5 text-sm"
                  >
                    <dt className="text-slate-500">
                      {localized(locale, spec.label, spec.labelEn)}
                    </dt>
                    <dd className="font-medium text-slate-900">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {(product.tdsUrl || product.msdsUrl) && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {t("technicalDocuments")}
              </h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {product.tdsUrl && (
                  <a
                    href={product.tdsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-900 hover:text-blue-900"
                  >
                    <FileText className="h-4 w-4" />
                    {t("tds")}
                  </a>
                )}
                {product.msdsUrl && (
                  <a
                    href={product.msdsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-900 hover:text-blue-900"
                  >
                    <FileText className="h-4 w-4" />
                    {t("msds")}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {description && (
        <div className="mt-12 max-w-3xl border-t border-slate-200 pt-8">
          <h2 className="text-lg font-bold text-slate-900">{t("detailedDescription")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-14 border-t border-slate-200 pt-10">
          <h2 className="text-xl font-bold text-slate-900">{t("relatedProducts")}</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
