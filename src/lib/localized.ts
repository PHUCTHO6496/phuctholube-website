/**
 * Picks the variant of a field for the current locale. Vietnamese is the
 * source language and always filled in; English and Chinese are optional.
 * A Chinese page without a Chinese translation shows the English text if
 * there is one (more readable for most Chinese visitors than Vietnamese),
 * otherwise the Vietnamese. Keeps the site usable for any product/category/
 * industry an owner adds without immediately translating it.
 */
export function localized<T extends string | null>(
  locale: string,
  vi: T,
  en: string | null | undefined,
  zh?: string | null
): T {
  if (locale === "en") return en ? (en as T) : vi;
  if (locale === "zh") return (zh || en || vi) as T;
  return vi;
}

/** Same fallback order as `localized`, for JSON list fields (use cases, tags). */
export function localizedJson<T>(locale: string, vi: T, en: T, zh?: T): T {
  if (locale === "en") return en || vi;
  if (locale === "zh") return zh || en || vi;
  return vi;
}

/**
 * Working-hours values are free text (e.g. "7:30 - 17:00"), which reads fine
 * in any language, except for the literal "Đóng cửa" (Closed) some days use
 * instead of a time range.
 */
export function localizedHours(locale: string, value: string): string {
  if (value.trim() !== "Đóng cửa") return value;
  if (locale === "en") return "Closed";
  if (locale === "zh") return "休息";
  return value;
}
