import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { localized } from "@/lib/localized";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("industriesPage");
  return {
    title: t("title"),
    description: t("metaDescription"),
  };
}

export default async function IndustriesPage() {
  const [t, locale] = await Promise.all([
    getTranslations("industriesPage"),
    getLocale(),
  ]);

  const industries = await prisma.industry.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  const totalProducts = await prisma.product.count({ where: { published: true } });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold text-slate-900">{t("title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {t("description")}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((ind) => (
          <Link
            key={ind.slug}
            href={`/linh-vuc-hoat-dong/${ind.slug}`}
            className="group rounded-xl border border-slate-200 p-6 transition-shadow hover:shadow-lg"
          >
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-900">
              {localized(locale, ind.name, ind.nameEn)}
            </h3>
            {ind.description && (
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {localized(locale, ind.description, ind.descriptionEn)}
              </p>
            )}
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-900">
              {t("viewDetail")}
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-14 grid grid-cols-1 gap-8 border-t border-slate-200 pt-10 sm:grid-cols-3">
        <div className="text-center">
          <div className="text-4xl font-extrabold text-blue-900">
            {industries.length}+
          </div>
          <p className="mt-1 text-sm text-slate-600">{t("statIndustries")}</p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-extrabold text-blue-900">
            {totalProducts}+
          </div>
          <p className="mt-1 text-sm text-slate-600">{t("statProducts")}</p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-extrabold text-blue-900">30+</div>
          <p className="mt-1 text-sm text-slate-600">{t("statYears")}</p>
        </div>
      </div>
    </div>
  );
}
