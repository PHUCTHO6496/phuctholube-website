/**
 * Returns the English variant of a field when on the English locale and a
 * translation exists, otherwise falls back to the Vietnamese (default) value.
 * Keeps the site usable for any product/category/industry an owner adds
 * without immediately filling in the English fields.
 */
export function localized<T extends string | null>(
  locale: string,
  vi: T,
  en: string | null | undefined
): T {
  return locale === "en" && en ? (en as T) : vi;
}

export function localizedJson<T>(locale: string, vi: T, en: T): T {
  return locale === "en" && en ? en : vi;
}

/**
 * Working-hours values are free text (e.g. "7:30 - 17:00"), which reads fine
 * in either language, except for the literal "Đóng cửa" (Closed) some days
 * use instead of a time range.
 */
export function localizedHours(locale: string, value: string): string {
  if (locale === "en" && value.trim() === "Đóng cửa") return "Closed";
  return value;
}
