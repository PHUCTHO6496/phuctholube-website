import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { EquivalentFinder, type EquivalentProduct } from "@/components/site/EquivalentFinder";
import { EquivalentTable, type EquivalentSection } from "@/components/site/EquivalentTable";
import { BRANDS } from "@/lib/constants";
import { localized } from "@/lib/localized";
import { listingPreference, normalizeGrade, productBaseName } from "@/lib/product-name";
import { localeAlternates } from "@/lib/seo";

const getEquivalentFinderProducts = unstable_cache(
  async () =>
    prisma.product.findMany({
      where: { published: true },
      orderBy: [{ category: { sortOrder: "asc" } }, { brand: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        brand: true,
        price: true,
        shortDescription: true,
        shortDescriptionEn: true,
        categoryId: true,
        viscosityGrade: true,
        category: { select: { name: true, nameEn: true } },
        images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
      },
    }),
  ["equivalent-finder-products"],
  { tags: ["products"], revalidate: 300 }
);

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("equivalentFinder"), getLocale()]);
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    ...localeAlternates(locale, "/tra-cuu-tuong-duong"),
  };
}

const BRAND_NAMES: string[] = BRANDS.map((b) => b.name);

function gradeOrder(a: string, b: string) {
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  if (!Number.isNaN(na)) return -1;
  if (!Number.isNaN(nb)) return 1;
  return a.localeCompare(b, "en", { numeric: true });
}

/**
 * Category -> grade -> brand -> listings, keeping only grades that more
 * than one brand offers (otherwise there's nothing to cross-reference).
 * Packaging variants of one grade collapse into a single entry.
 */
function buildEquivalentSections(items: EquivalentProduct[]): EquivalentSection[] {
  const byCategory = new Map<string, Map<string, Map<string, Map<string, EquivalentProduct>>>>();

  for (const p of items) {
    const grade = normalizeGrade(p.viscosityGrade);
    if (!grade || !p.brand || !BRAND_NAMES.includes(p.brand)) continue;
    const grades = byCategory.get(p.categoryName) ?? new Map();
    byCategory.set(p.categoryName, grades);
    const brands = grades.get(grade) ?? new Map();
    grades.set(grade, brands);
    const listings = brands.get(p.brand) ?? new Map();
    brands.set(p.brand, listings);

    const key = productBaseName(p.name).toLowerCase().replace(/[\s-]+/g, "");
    const current = listings.get(key);
    if (!current || listingPreference(p.name) < listingPreference(current.name)) {
      listings.set(key, p);
    }
  }

  const sections: EquivalentSection[] = [];
  for (const [category, grades] of byCategory) {
    const rows = Array.from(grades.entries())
      .filter(([, brands]) => brands.size > 1)
      .sort(([a], [b]) => gradeOrder(a, b))
      .map(([grade, brands]) => ({
        grade,
        byBrand: Object.fromEntries(
          Array.from(brands.entries()).map(([brand, listings]) => [
            brand,
            Array.from(listings.values())
              .map((p) => ({ slug: p.slug, label: productBaseName(p.name) }))
              .sort((a, b) => a.label.localeCompare(b.label, "en", { numeric: true })),
          ])
        ),
      }));
    if (rows.length > 0) sections.push({ category, rows });
  }
  return sections;
}

export default async function EquivalentLookupPage() {
  const [t, locale] = await Promise.all([
    getTranslations("equivalentFinder"),
    getLocale(),
  ]);

  const products = await getEquivalentFinderProducts();

  const items: EquivalentProduct[] = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    price: p.price,
    shortDescription: localized(locale, p.shortDescription, p.shortDescriptionEn),
    categoryId: p.categoryId,
    categoryName: p.category
      ? localized(locale, p.category.name, p.category.nameEn)
      : t("otherCategory"),
    viscosityGrade: p.viscosityGrade,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold text-slate-900">{t("title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("intro")}</p>
      </div>

      <div className="mt-8">
        <EquivalentFinder products={items} />
      </div>

      <EquivalentTable
        sections={buildEquivalentSections(items)}
        brands={BRAND_NAMES}
        title={t("tableTitle")}
        intro={t("tableIntro")}
        gradeLabel={t("gradeColumn")}
      />
    </div>
  );
}
