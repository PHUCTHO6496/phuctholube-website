import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Wrench,
  Warehouse,
  BadgePercent,
  Quote,
} from "lucide-react";
import { BRANDS, SITE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/site/ProductCard";
import { getSiteSettings } from "@/lib/settings";
import { formatPhoneDisplay } from "@/lib/format";
import { productCardSelect, localizeProductCard } from "@/lib/product-card-data";
import { localized } from "@/lib/localized";

const TRUST_ICONS = [ShieldCheck, Wrench, Warehouse, BadgePercent];

export default async function Home() {
  const [settings, t, tMeta, tBrands, locale] = await Promise.all([
    getSiteSettings(),
    getTranslations("home"),
    getTranslations("meta"),
    getTranslations("brands"),
    getLocale(),
  ]);

  const homeStats = [
    {
      value: settings.statYearsValue,
      label: localized(locale, settings.statYearsLabel, settings.statYearsLabelEn),
    },
    {
      value: settings.statVolumeValue,
      label: localized(locale, settings.statVolumeLabel, settings.statVolumeLabelEn),
    },
    {
      value: settings.statQualityValue,
      label: localized(locale, settings.statQualityLabel, settings.statQualityLabelEn),
    },
  ];

  const highlights = t.raw("highlights") as string[];
  const trustValues = t.raw("trustValues") as { title: string; description: string }[];
  const homeServices = t.raw("homeServices") as { title: string; description: string }[];
  const testimonials = t.raw("testimonials") as { quote: string; name: string; role: string }[];
  const serviceAreas = t.raw("serviceAreas") as string[];
  const homeServiceHrefs = ["/dich-vu", "/dich-vu", "/dich-vu"];

  const featuredProductsRaw = await prisma.product.findMany({
    where: { published: true, featured: true },
    orderBy: { sortOrder: "asc" },
    take: 8,
    select: productCardSelect,
  });
  const featuredProducts = featuredProductsRaw.map((p) => localizeProductCard(p, locale));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
              {SITE.fullName}
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              {tMeta("tagline")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300">
              {t("heroIntro1", { foundedYear: SITE.foundedYear, name: SITE.name })}
            </p>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-300">
              {t("heroIntro2")}
            </p>

            <ul className="mt-6 space-y-2">
              {highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-slate-200">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                  {h}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/san-pham"
                className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
              >
                {t("viewProducts")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/lien-he"
                className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {t("contactCta")}
              </Link>
            </div>
          </div>

          <div className="relative hidden aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 lg:flex">
            {settings.heroImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.heroImageUrl}
                alt={SITE.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm text-slate-400">
                {t("heroImagePlaceholder")}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            {t("whyUsTitle", { name: SITE.name })}
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {homeStats.map((stat) => (
              <div key={stat.value} className="text-center">
                <div className="text-4xl font-extrabold text-blue-900 sm:text-5xl">
                  {stat.value}
                </div>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-slate-600">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {t("brandsTitle")}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {t("brandsSubtitle", { name: SITE.name })}
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                href={`/san-pham/thuong-hieu/${brand.slug}`}
                className="group rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-lg"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-2xl font-extrabold text-blue-900">
                  {brand.name.charAt(0)}
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-blue-900">
                  {brand.name}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                  {tBrands(brand.slug)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-900">
                  {t("viewBrandProducts", { brand: brand.name })}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {settings.galleryImages.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {t("galleryTitle")}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {t("gallerySubtitle", { name: SITE.name })}
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {settings.galleryImages.map((url, i) => (
                <div
                  key={url}
                  className="aspect-square overflow-hidden rounded-lg bg-slate-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${SITE.name} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {t("featuredTitle")}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                {t("featuredSubtitle", { name: SITE.name })}
              </p>
            </div>
            <Link
              href="/san-pham"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-900 hover:text-amber-600"
            >
              {t("viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {t("whyChooseTitle", { name: SITE.name })}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{t("whyChooseSubtitle")}</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trustValues.map((value, i) => {
              const Icon = TRUST_ICONS[i];
              return (
                <div
                  key={value.title}
                  className="rounded-xl border border-slate-200 p-6"
                >
                  <Icon className="h-9 w-9 text-amber-500" />
                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {t("servicesTitle")}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{t("servicesSubtitle")}</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {homeServices.map((s, i) => (
              <div
                key={s.title}
                className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
              >
                <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {s.description}
                </p>
                <Link
                  href={homeServiceHrefs[i]}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-900 hover:text-amber-600"
                >
                  {t("learnMore")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {t("testimonialsTitle")}
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.name}
                className="rounded-xl bg-slate-50 p-6 ring-1 ring-slate-200"
              >
                <Quote className="h-6 w-6 text-amber-500" />
                <blockquote className="mt-3 text-sm leading-relaxed text-slate-700">
                  {testimonial.quote}
                </blockquote>
                <figcaption className="mt-4">
                  <p className="text-sm font-bold text-slate-900">{testimonial.name}</p>
                  <p className="text-xs text-slate-500">{testimonial.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Service areas */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">{t("serviceAreasTitle")}</h2>
            <p className="mt-2 text-sm text-slate-300">{t("serviceAreasSubtitle")}</p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {serviceAreas.map((area) => (
              <span
                key={area}
                className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-slate-200"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            {t("contactTitle")}
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <MapPin className="h-8 w-8 text-amber-500" />
              <p className="mt-3 text-sm font-semibold text-slate-900">{t("address")}</p>
              <p className="mt-1 text-sm text-slate-600">{settings.address}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Phone className="h-8 w-8 text-amber-500" />
              <p className="mt-3 text-sm font-semibold text-slate-900">{t("phone")}</p>
              <a
                href={`tel:${settings.phone}`}
                className="mt-1 text-sm text-slate-600 hover:text-blue-900"
              >
                {formatPhoneDisplay(settings.phone)}
              </a>
            </div>
            <div className="flex flex-col items-center text-center">
              <Mail className="h-8 w-8 text-amber-500" />
              <p className="mt-3 text-sm font-semibold text-slate-900">{t("email")}</p>
              <a
                href={`mailto:${settings.email}`}
                className="mt-1 text-sm text-slate-600 hover:text-blue-900"
              >
                {settings.email}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
