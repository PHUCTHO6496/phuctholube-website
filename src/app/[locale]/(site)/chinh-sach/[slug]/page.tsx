import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SITE, localizedAddress } from "@/lib/constants";
import { formatPhoneDisplay } from "@/lib/format";
import { getSiteSettings } from "@/lib/settings";
import { POLICIES, getPolicy, type Policy } from "@/lib/policies";
import { POLICIES_EN } from "@/lib/policies-en";
import { localeAlternates } from "@/lib/seo";

export function generateStaticParams() {
  return POLICIES.map((p) => ({ slug: p.slug }));
}

const CHROME = {
  vi: {
    updated: "Cập nhật lần cuối",
    contact: "Liên hệ",
    taxCode: "Mã số thuế",
    registered: "Trụ sở",
    office: "Văn phòng",
    hotline: "Hotline",
    others: "Các chính sách khác",
    prevails: "",
  },
  en: {
    updated: "Last updated",
    contact: "Contact",
    taxCode: "Tax code",
    registered: "Registered office",
    office: "Office",
    hotline: "Phone",
    others: "Other policies",
    prevails:
      "This English version is provided for convenience. If it differs from the Vietnamese version, the Vietnamese version prevails.",
  },
};

/** The policy text for a locale: English from policies-en, Vietnamese as written. */
function contentFor(policy: Policy, locale: string) {
  const en = locale === "en" ? POLICIES_EN[policy.slug] : undefined;
  return {
    title: en ? policy.titleEn : policy.title,
    description: en?.description ?? policy.description,
    intro: en ? en.intro : policy.intro,
    sections: en?.sections ?? policy.sections,
  };
}

// "01/12/2026" -> "1 December 2026" for English readers (DD/MM is ambiguous).
function formatUpdated(date: string, locale: string) {
  if (locale !== "en") return date;
  const m = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return date;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) return {};
  const locale = await getLocale();
  const content = contentFor(policy, locale);
  return {
    title: content.title,
    description: content.description,
    ...localeAlternates(locale, `/chinh-sach/${policy.slug}`, !!POLICIES_EN[policy.slug]),
  };
}

// Values still awaiting the owner's confirmation are written as [[...]] in
// src/lib/policies.ts and highlighted here.
function Text({ children }: { children: string }) {
  return (
    <>
      {children.split(/(\[\[.+?\]\])/g).map((part, i) =>
        part.startsWith("[[") ? (
          <mark key={i} className="rounded bg-amber-100 px-1 text-amber-900">
            {part.slice(2, -2)}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) notFound();
  const [settings, locale] = await Promise.all([getSiteSettings(), getLocale()]);
  const content = contentFor(policy, locale);
  const c = locale === "en" ? CHROME.en : CHROME.vi;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-slate-900">{content.title}</h1>
      <p className="mt-2 text-sm text-slate-500">
        {c.updated}: <Text>{formatUpdated(policy.updated, locale)}</Text>
      </p>
      {c.prevails && (
        <p className="mt-4 rounded-md bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600">
          {c.prevails}
        </p>
      )}
      {content.intro && (
        <p className="mt-6 text-sm leading-relaxed text-slate-700">
          <Text>{content.intro}</Text>
        </p>
      )}

      <div className="mt-8 space-y-8">
        {content.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-bold text-slate-900">{section.heading}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700">
              {section.blocks.map((block, i) =>
                typeof block === "string" ? (
                  <p key={i}>
                    <Text>{block}</Text>
                  </p>
                ) : (
                  <ul key={i} className="list-disc space-y-1.5 pl-5">
                    {block.list.map((item) => (
                      <li key={item}>
                        <Text>{item}</Text>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          </section>
        ))}

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm leading-relaxed text-slate-700">
          <h2 className="text-lg font-bold text-slate-900">{c.contact}</h2>
          <p className="mt-3 font-semibold text-slate-900">{SITE.legalName}</p>
          <p>
            {c.taxCode}: {SITE.taxCode}
          </p>
          <p>
            {c.registered}: {localizedAddress(SITE.registeredAddress, locale)}
          </p>
          <p>
            {c.office}: {localizedAddress(settings.address, locale)}
          </p>
          <p>
            {c.hotline}:{" "}
            <a href={`tel:${settings.phone}`} className="font-semibold text-blue-900 hover:underline">
              {formatPhoneDisplay(settings.phone)}
            </a>{" "}
            · Email:{" "}
            <a href={`mailto:${settings.email}`} className="font-semibold text-blue-900 hover:underline">
              {settings.email}
            </a>
          </p>
        </section>
      </div>

      <nav className="mt-12 border-t border-slate-200 pt-6 text-sm">
        <p className="font-semibold text-slate-900">{c.others}</p>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
          {POLICIES.filter((p) => p.slug !== policy.slug).map((p) => (
            <li key={p.slug}>
              <Link href={`/chinh-sach/${p.slug}`} className="text-blue-900 hover:text-amber-600">
                {locale === "en" ? p.titleEn : p.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
