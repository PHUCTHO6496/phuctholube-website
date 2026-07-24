import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("services");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ServicesPage() {
  const t = await getTranslations("services");

  const coreServices = t.raw("coreServices") as {
    title: string;
    description: string;
    benefits: string;
  }[];
  const additionalServices = t.raw("additionalServices") as {
    title: string;
    description: string;
  }[];
  const processSteps = t.raw("processSteps") as {
    step: string;
    title: string;
    description: string;
  }[];
  const commitmentItems = t.raw("commitmentItems") as string[];

  return (
    <div>
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold sm:text-4xl">{t("title")}</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300">{t("intro")}</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">{t("coreServicesTitle")}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("coreServicesSubtitle")}</p>
          <div className="mt-8 space-y-6">
            {coreServices.map((s) => (
              <div key={s.title} className="rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {s.description}
                </p>
                <p className="mt-3 text-sm">
                  <span className="font-semibold text-slate-900">
                    {t("benefitsLabel")}{" "}
                  </span>
                  <span className="text-slate-600">{s.benefits}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">{t("additionalServicesTitle")}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("additionalServicesSubtitle")}</p>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {additionalServices.map((s) => (
              <div key={s.title} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">{t("processTitle")}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("processSubtitle")}</p>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((s) => (
              <div key={s.step}>
                <div className="text-3xl font-extrabold text-amber-500">{s.step}</div>
                <h3 className="mt-2 text-base font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">{t("commitmentSectionTitle")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {t("commitmentSectionText")}
          </p>
          <ul className="mt-6 space-y-2 text-left">
            {commitmentItems.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-200">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/lien-he"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
          >
            {t("contactCta")}
          </Link>
        </div>
      </section>
    </div>
  );
}
