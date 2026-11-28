import type { Metadata } from "next";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { BadgeCheck, ChevronRight, FileText } from "lucide-react";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductQuoteActions } from "@/components/site/ProductQuoteActions";
import { ProductDescription } from "@/components/site/ProductDescription";
import { JsonLd } from "@/components/site/JsonLd";
import { redirectIfMoved } from "@/lib/redirects";
import { BRANDS, SITE } from "@/lib/constants";
import { localized, localizedJson } from "@/lib/localized";
import { localeAlternates, localeUrl } from "@/lib/seo";
import { localizeSpecValue } from "@/lib/spec-text";
import { productCardSelect, localizeProductCard } from "@/lib/product-card-data";
import { documentHref } from "@/lib/documents";
import {
  baseOilFamily,
  normalizeGrade,
  productSeries,
  usesBaseOilFamily,
} from "@/lib/product-name";

const getProduct = unstable_cache(
  async (slug: string) =>
    prisma.product.findUnique({
      where: { slug, published: true },
      select: {
        id: true,
        slug: true,
        name: true,
        brand: true,
        categoryId: true,
        viscosityGrade: true,
        shortDescription: true,
        shortDescriptionEn: true,
        shortDescriptionZh: true,
        description: true,
        descriptionEn: true,
        descriptionZh: true,
        useCases: true,
        useCasesEn: true,
        useCasesZh: true,
        applicationTags: true,
        applicationTagsEn: true,
        applicationTagsZh: true,
        tdsUrl: true,
        msdsUrl: true,
        category: true,
        specs: { orderBy: { sortOrder: "asc" } },
        // Packaging names only: prices stay off the public site.
        variants: { orderBy: { sortOrder: "asc" }, select: { packaging: true } },
        industries: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    }),
  ["product-detail"],
  { tags: ["products"], revalidate: 300 }
);

/** Every product in the category, for same-line grades, equivalents and fallbacks. */
const getCategoryPeers = unstable_cache(
  async (categoryId: string) =>
    prisma.product.findMany({
      where: { published: true, categoryId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        ...productCardSelect,
        viscosityGrade: true,
        specs: { where: { label: "Loại dầu gốc" }, take: 1, select: { value: true } },
      },
    }),
  ["product-category-peers"],
  { tags: ["products"], revalidate: 300 }
);

const BRAND_NAMES: string[] = BRANDS.map((b) => b.name);
const ISO_VG = /^\d+$/;

function gradeValue(name: string) {
  const n = Number(name.split(/\s+/).pop());
  return Number.isNaN(n) ? Infinity : n;
}

/** Product short descriptions are phrases; drop a trailing full stop before reusing one. */
const phrase = (s: string) => s.trim().replace(/[.。]$/, "");

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
    ? localized(locale, product.category.name, product.category.nameEn, product.category.nameZh)
    : t("defaultCategory");
  // "ISO VG 46" is how buyers search for industrial oils; SAE/NLGI grades
  // are already part of the product name.
  const grade = product.viscosityGrade?.trim();
  const isoVg = grade && ISO_VG.test(grade) ? ` ISO VG ${grade}` : "";
  const shortDescription = localized(
    locale,
    product.shortDescription,
    product.shortDescriptionEn,
    product.shortDescriptionZh
  );
  const packagings = product.variants.map((v) => v.packaging);
  const zh = locale === "zh";
  const description = [
    t("metaIntro", { name: product.name, category: categoryName, grade: isoVg }),
    shortDescription ? t("metaUse", { uses: phrase(shortDescription) }) : null,
    packagings.length > 0
      ? t("metaPackaging", { packaging: packagings.join(zh ? "、" : ", ") })
      : null,
    t("metaTail", { phone: SITE.phoneDisplay }),
  ]
    .filter(Boolean)
    .join(zh ? "" : " ");

  return {
    title: `${product.name} - ${categoryName}${isoVg}`,
    description,
    // A product whose detailed description isn't translated yet would show
    // it in another language, so that copy stays out of the index.
    ...localeAlternates(locale, `/san-pham/${product.slug}`, {
      en: !product.description || !!product.descriptionEn,
      zh: !product.description || !!product.descriptionZh,
    }),
  };
}

// Spec rows are entered in Vietnamese; these common labels don't need a
// per-product English translation.
const SPEC_LABELS_EN: Record<string, string> = {
  "Thương hiệu": "Brand",
  "Quy cách": "Packaging",
};
const SPEC_LABELS_ZH: Record<string, string> = {
  "Thương hiệu": "品牌",
  "Quy cách": "包装规格",
};

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
  if (!product) {
    // Listings merged in the 20L/209L consolidation keep their old URLs.
    await redirectIfMoved(locale, `/san-pham/${slug}`);
    notFound();
  }

  const packagings = product.variants.map((v) => v.packaging);
  const specRows = [
    ...product.specs
      // A free-text "Quy cách" row is superseded by the packaging variants.
      .filter((s) => packagings.length === 0 || s.label !== "Quy cách")
      .map((s) => ({
      key: s.id,
      label: localized(
        locale,
        s.label,
        s.labelEn ?? SPEC_LABELS_EN[s.label],
        s.labelZh ?? SPEC_LABELS_ZH[s.label]
      ),
      value: localizeSpecValue(s.value, locale),
    })),
    ...(packagings.length > 0
      ? [{ key: "packaging", label: t("packaging"), value: packagings.join(" · ") }]
      : []),
  ];

  const shortDescription = localized(
    locale,
    product.shortDescription,
    product.shortDescriptionEn,
    product.shortDescriptionZh
  );
  const description = localized(
    locale,
    product.description,
    product.descriptionEn,
    product.descriptionZh
  );
  const categoryName = product.category
    ? localized(locale, product.category.name, product.category.nameEn, product.category.nameZh)
    : t("defaultCategory");

  const list = (v: unknown) => (Array.isArray(v) && v.length > 0 ? (v as string[]) : null);
  const useCases =
    localizedJson(locale, list(product.useCases), list(product.useCasesEn), list(product.useCasesZh)) ??
    [];
  const applicationTags =
    localizedJson(
      locale,
      list(product.applicationTags),
      list(product.applicationTagsEn),
      list(product.applicationTagsZh)
    ) ?? [];

  // Other grades of the same line, and other brands' products of the same
  // grade and base oil — the same matching as /tra-cuu-tuong-duong, except
  // that an unclassified base oil never counts as a match here.
  const peers = product.categoryId ? await getCategoryPeers(product.categoryId) : [];
  const series = productSeries(product.name);
  const siblings = series
    ? peers
        .filter(
          (p) => p.id !== product.id && p.brand === product.brand && productSeries(p.name) === series
        )
        .sort((a, b) => gradeValue(a.name) - gradeValue(b.name))
    : [];
  const grade = normalizeGrade(product.viscosityGrade);
  const family = usesBaseOilFamily(grade)
    ? baseOilFamily(product.name, product.specs.find((s) => s.label === "Loại dầu gốc")?.value)
    : undefined;
  const equivalents =
    grade && product.brand && BRAND_NAMES.includes(product.brand) && family !== null
      ? peers.filter(
          (p) =>
            p.brand &&
            p.brand !== product.brand &&
            BRAND_NAMES.includes(p.brand) &&
            normalizeGrade(p.viscosityGrade) === grade &&
            (family === undefined || baseOilFamily(p.name, p.specs[0]?.value) === family)
        )
      : [];
  const shown = new Set([product.id, ...siblings.map((p) => p.id)]);
  const cards = (equivalents.length > 0 ? equivalents : peers.filter((p) => !shown.has(p.id)))
    .slice(0, 4)
    // Only card fields go on to the card (and its client "add to quote" button).
    .map((p) =>
      localizeProductCard(
        {
          id: p.id,
          slug: p.slug,
          name: p.name,
          brand: p.brand,
          shortDescription: p.shortDescription,
          shortDescriptionEn: p.shortDescriptionEn,
          shortDescriptionZh: p.shortDescriptionZh,
          category: p.category,
          images: p.images,
          variants: p.variants,
        },
        locale
      )
    );

  const productPath = `/san-pham/${product.slug}`;
  const isShell = product.brand === "Shell";
  const trustItems = [
    ...(isShell ? [{ text: t("trustShell"), href: "/ve-chung-toi#shell" }] : []),
    { text: t("trustGenuine") },
    { text: t("trustInvoice") },
    { text: t("trustDelivery"), href: "/chinh-sach/giao-hang" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: shortDescription ?? description ?? undefined,
          image: product.images[0]?.url,
          brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
          category: categoryName,
          url: localeUrl(locale, productPath),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { name: t("breadcrumbHome"), item: localeUrl(locale, "/") },
            { name: t("breadcrumbProducts"), item: localeUrl(locale, "/san-pham") },
            ...(product.category
              ? [
                  {
                    name: categoryName,
                    item: localeUrl(locale, `/san-pham/danh-muc/${product.category.slug}`),
                  },
                ]
              : []),
            { name: product.name, item: localeUrl(locale, productPath) },
          ].map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })),
        }}
      />
      <nav className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
        <Link href="/" className="hover:text-blue-900">
          {t("breadcrumbHome")}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/san-pham" className="hover:text-blue-900">
          {t("breadcrumbProducts")}
        </Link>
        <ChevronRight className="h-4 w-4" />
        {product.category && (
          <>
            <Link
              href={`/san-pham/danh-muc/${product.category.slug}`}
              className="hover:text-blue-900"
            >
              {categoryName}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-slate-700">{product.name}</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-sm text-slate-400">
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              className="object-cover"
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

          <ProductQuoteActions
            product={{ id: product.id, slug: product.slug, name: product.name, brand: product.brand }}
            packagings={packagings}
          >
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
          </ProductQuoteActions>

          <ul className="mt-6 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
            {trustItems.map((item) => (
              <li key={item.text} className="flex items-start gap-2 text-sm text-slate-700">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {item.href ? (
                  <Link href={item.href} className="hover:text-blue-900 hover:underline">
                    {item.text}
                  </Link>
                ) : (
                  item.text
                )}
              </li>
            ))}
          </ul>

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

          {siblings.length > 0 && series && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {t("sameSeries", { series })}
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {siblings.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/san-pham/${p.slug}`}
                      className="inline-block rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-blue-900 hover:text-blue-900"
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {specRows.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {t("specifications")}
              </h2>
              <dl className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200">
                {specRows.map((spec) => {
                  // Lists (approvals, standards) are "a; b; c" — show them as
                  // chips under the label instead of squeezing the label.
                  const items = spec.value.split(/;\s+/);
                  return items.length > 2 ? (
                    <div key={spec.key} className="px-4 py-2.5 text-sm">
                      <dt className="text-slate-500">{spec.label}</dt>
                      <dd className="mt-2">
                        <ul className="flex flex-wrap gap-1.5">
                          {items.map((item) => (
                            <li
                              key={item}
                              className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  ) : (
                    <div key={spec.key} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                      <dt className="max-w-[55%] shrink-0 text-slate-500">{spec.label}</dt>
                      <dd className="min-w-0 text-right font-medium text-slate-900">{spec.value}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          )}

          {(product.tdsUrl || product.msdsUrl) && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {t("technicalDocuments")}
              </h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {(
                  [
                    ["tds", product.tdsUrl],
                    ["msds", product.msdsUrl],
                  ] as const
                ).map(([kind, url]) =>
                  url ? (
                    <a
                      key={kind}
                      href={documentHref(kind, product.slug, url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-start gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-900 hover:text-blue-900"
                    >
                      <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        {t(kind)}
                        <span className="block text-xs font-normal text-slate-500">
                          {t("documentFile", { name: product.name })}
                        </span>
                      </span>
                    </a>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {description && (
        <div className="mt-12 max-w-3xl border-t border-slate-200 pt-8">
          <h2 className="text-lg font-bold text-slate-900">{t("detailedDescription")}</h2>
          <ProductDescription text={description} />
        </div>
      )}

      {cards.length > 0 && (
        <div className="mt-14 border-t border-slate-200 pt-10">
          <h2 className="text-xl font-bold text-slate-900">
            {equivalents.length > 0 ? t("equivalents") : t("relatedProducts")}
          </h2>
          {equivalents.length > 0 && (
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              {t("equivalentsNote")}{" "}
              <Link
                href="/tra-cuu-tuong-duong"
                className="font-semibold text-blue-900 hover:text-amber-600"
              >
                {t("equivalentsLink")}
              </Link>
            </p>
          )}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
