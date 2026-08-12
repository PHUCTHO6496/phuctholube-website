import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { EquivalentFinder, type EquivalentProduct } from "@/components/site/EquivalentFinder";
import { localized } from "@/lib/localized";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("equivalentFinder");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function EquivalentLookupPage() {
  const [t, locale] = await Promise.all([
    getTranslations("equivalentFinder"),
    getLocale(),
  ]);

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
      shortDescriptionEn: true,
      categoryId: true,
      viscosityGrade: true,
      category: { select: { name: true, nameEn: true } },
      images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
    },
  });

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
    </div>
  );
}
