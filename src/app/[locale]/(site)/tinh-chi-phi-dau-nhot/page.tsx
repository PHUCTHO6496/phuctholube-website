import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { CostCalculator, type CalculatorProduct } from "@/components/site/CostCalculator";
import { isEquipmentKind, KIND_CATEGORY, kindForCategory, type EquipmentKind } from "@/lib/cost-calculator";
import { localeAlternates } from "@/lib/seo";
import { localizeSpecValue } from "@/lib/spec-text";

const getCalculatorProducts = unstable_cache(
  async () =>
    prisma.product.findMany({
      where: { published: true, category: { slug: { in: Object.values(KIND_CATEGORY) } } },
      orderBy: [{ brand: "asc" }, { name: "asc" }],
      // Names only: prices stay off the public site.
      select: {
        slug: true,
        name: true,
        category: { select: { slug: true } },
        specs: { where: { label: "Chu kỳ thay dầu (theo TDS)" }, take: 1, select: { value: true } },
      },
    }),
  ["cost-calculator-products"],
  { tags: ["products"], revalidate: 300 }
);

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("costCalculator"), getLocale()]);
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    ...localeAlternates(locale, "/tinh-chi-phi-dau-nhot"),
  };
}

export default async function CostCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ loai?: string; sp?: string }>;
}) {
  const [t, locale, params, rows] = await Promise.all([
    getTranslations("costCalculator"),
    getLocale(),
    searchParams,
    getCalculatorProducts(),
  ]);

  const products: CalculatorProduct[] = rows.flatMap((p) => {
    const kind = kindForCategory(p.category?.slug);
    if (!kind) return [];
    const tds = p.specs[0]?.value;
    return [{ slug: p.slug, name: p.name, kind, tdsInterval: tds ? localizeSpecValue(tds, locale) : null }];
  });

  // Linked from product pages as ?loai=compressor&sp=<slug>: open that tab with
  // the product preselected as the alternative.
  const linked = products.find((p) => p.slug === params.sp);
  const initialKind: EquipmentKind = linked?.kind ?? (isEquipmentKind(params.loai) ? params.loai : "compressor");

  return (
    <div>
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold sm:text-4xl">{t("title")}</h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300">{t("intro")}</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <CostCalculator products={products} initialKind={initialKind} initialProposed={linked?.slug} />

        <section className="mt-12 max-w-3xl border-t border-slate-200 pt-8">
          <h2 className="text-lg font-bold text-slate-900">{t("howTitle")}</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
            {(t.raw("how") as string[]).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
