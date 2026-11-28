import type { Metadata } from "next";

/** hreflang code for each locale's URL prefix. */
const HREFLANG = { en: "en", zh: "zh-Hans" } as const;

type Translated = boolean | { en?: boolean; zh?: boolean };

/**
 * Canonical URL and hreflang alternates for a page served at `path` (vi,
 * no prefix), `/en{path}` and `/zh{path}`. Relative URLs resolve against
 * `metadataBase` (SITE_URL) set in the root layout.
 *
 * `translated` says which non-Vietnamese copies are real translations
 * (`true` = all of them). An untranslated copy would only repeat the
 * Vietnamese content (or fall back to English on /zh), so it is kept out of
 * the index and not advertised as an alternate; otherwise Google sees
 * hundreds of near-duplicate pages.
 */
export function localeAlternates(
  locale: string,
  path: string,
  translated: Translated = true
): Pick<Metadata, "alternates" | "robots"> {
  const vi = path === "" ? "/" : path;
  const url = (prefix: string) => (vi === "/" ? `/${prefix}` : `/${prefix}${vi}`);
  const has = (l: "en" | "zh") => (typeof translated === "boolean" ? translated : !!translated[l]);

  if ((locale === "en" || locale === "zh") && !has(locale)) {
    return { alternates: { canonical: url(locale) }, robots: { index: false, follow: true } };
  }

  const languages: Record<string, string> = { vi };
  for (const l of ["en", "zh"] as const) if (has(l)) languages[HREFLANG[l]] = url(l);
  const hasAlternates = Object.keys(languages).length > 1;

  return {
    alternates: {
      canonical: locale === "en" || locale === "zh" ? url(locale) : vi,
      ...(hasAlternates ? { languages: { ...languages, "x-default": vi } } : {}),
    },
  };
}
