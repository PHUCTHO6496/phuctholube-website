import type { Metadata } from "next";

/**
 * Canonical URL and hreflang alternates for a page served at `path` (vi,
 * no prefix) and `/en{path}` (en). Relative URLs resolve against
 * `metadataBase` (SITE_URL) set in the root layout.
 *
 * Pass `hasEnglish: false` when the English URL would only repeat the
 * Vietnamese content (untranslated product, blog post): that copy is kept
 * out of the index and not advertised as an alternate, so Google doesn't
 * see ~100 near-duplicate pages.
 */
export function localeAlternates(
  locale: string,
  path: string,
  hasEnglish = true
): Pick<Metadata, "alternates" | "robots"> {
  const vi = path === "" ? "/" : path;
  const en = vi === "/" ? "/en" : `/en${vi}`;

  if (locale === "en" && !hasEnglish) {
    return { alternates: { canonical: en }, robots: { index: false, follow: true } };
  }

  return {
    alternates: {
      canonical: locale === "en" ? en : vi,
      ...(hasEnglish ? { languages: { vi, en, "x-default": vi } } : {}),
    },
  };
}
