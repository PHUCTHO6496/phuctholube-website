import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SITE } from "@/lib/constants";
import { formatPhoneDisplay } from "@/lib/format";
import { getSiteSettings } from "@/lib/settings";
import { POLICIES, getPolicy } from "@/lib/policies";
import { localeAlternates } from "@/lib/seo";

export function generateStaticParams() {
  return POLICIES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) return {};
  return {
    title: policy.title,
    description: policy.description,
    // Policies are written in Vietnamese only.
    ...localeAlternates(await getLocale(), `/chinh-sach/${policy.slug}`, false),
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
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-slate-900">{policy.title}</h1>
      <p className="mt-2 text-sm text-slate-500">
        Cập nhật lần cuối: <Text>{policy.updated}</Text>
      </p>
      {policy.intro && (
        <p className="mt-6 text-sm leading-relaxed text-slate-700">
          <Text>{policy.intro}</Text>
        </p>
      )}

      <div className="mt-8 space-y-8">
        {policy.sections.map((section) => (
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
          <h2 className="text-lg font-bold text-slate-900">Liên hệ</h2>
          <p className="mt-3 font-semibold text-slate-900">{SITE.legalName}</p>
          <p>Mã số thuế: {SITE.taxCode}</p>
          <p>Trụ sở: {SITE.registeredAddress}</p>
          <p>Văn phòng: {settings.address}</p>
          <p>
            Hotline:{" "}
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
        <p className="font-semibold text-slate-900">Các chính sách khác</p>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
          {POLICIES.filter((p) => p.slug !== policy.slug).map((p) => (
            <li key={p.slug}>
              <Link href={`/chinh-sach/${p.slug}`} className="text-blue-900 hover:text-amber-600">
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
