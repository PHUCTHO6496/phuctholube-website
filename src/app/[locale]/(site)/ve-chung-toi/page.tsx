import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Target, Eye, Gem, HeartHandshake, Warehouse } from "lucide-react";
import { prisma } from "@/lib/db";
import { SITE } from "@/lib/constants";
import { localized } from "@/lib/localized";

const MISSION_ICONS = [Target, Eye, Gem, HeartHandshake, Warehouse];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function AboutPage() {
  const [t, locale] = await Promise.all([
    getTranslations("about"),
    getLocale(),
  ]);

  const industries = await prisma.industry.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const missionCards = t.raw("missionCards") as { title: string; description: string }[];
  const commitments = t.raw("commitments") as { title: string; description: string }[];

  return (
    <div>
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
            {t("since", { foundedYear: SITE.foundedYear })}
          </p>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            {t("title", { fullName: SITE.fullName })}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300">{t("intro")}</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {missionCards.map((card, i) => {
              const Icon = MISSION_ICONS[i];
              return (
                <div
                  key={card.title}
                  className="rounded-xl border border-slate-200 p-6"
                >
                  <Icon className="h-8 w-8 text-amber-500" />
                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">{t("journeyTitle")}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            {t("journeyDescription", { foundedYear: SITE.foundedYear, name: SITE.name })}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-2 sm:max-w-md">
            <div>
              <div className="text-4xl font-extrabold text-blue-900">
                {SITE.foundedYear}
              </div>
              <p className="mt-1 text-sm text-slate-600">{t("yearFounded")}</p>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-blue-900">1000+</div>
              <p className="mt-1 text-sm text-slate-600">{t("customersTrust")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {t("commitmentTitle", { name: SITE.name })}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{t("commitmentSubtitle")}</p>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {commitments.map((c) => (
              <div key={c.title} className="rounded-xl bg-slate-50 p-6">
                <h3 className="text-base font-bold text-slate-900">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {c.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900">{t("industriesTitle")}</h2>
            <p className="mt-2 text-sm text-slate-600">{t("industriesSubtitle")}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {industries.map((ind) => (
              <Link
                key={ind.slug}
                href={`/linh-vuc-hoat-dong/${ind.slug}`}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-900 hover:text-blue-900"
              >
                {localized(locale, ind.name, ind.nameEn)}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
