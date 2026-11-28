// Shared by server code and the equivalent finder (client), so no
// server-only imports here.

/**
 * Comparable form of a viscosity grade: SAE multigrades are stored both as
 * "15W40" and "15W-40", and spacing/case varies between entries.
 */
export function normalizeGrade(grade: string | null | undefined): string | null {
  if (!grade) return null;
  const g = grade.trim().toUpperCase().replace(/\s+/g, " ");
  if (!g) return null;
  return g.replace(/^(\d{1,2})W-?(\d{2,3})$/, "$1W-$2");
}

/** "TELLUS S2 MX 68 (209L)" / "Shell Tellus S2 MX 68 (209L)" -> "TELLUS S2 MX 68" */
export function productBaseName(name: string): string {
  return name
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/^shell\s+/i, "")
    .trim();
}

const PACKAGING_SUFFIX = /\s*\((\d+(?:[.,]\d+)?\s*(?:L|KG))\)\s*$/i;

/** "TELLUS S2 MX 68 (209L)" -> { base: "TELLUS S2 MX 68", packaging: "209L" } */
export function splitPackaging(name: string): { base: string; packaging: string | null } {
  const m = name.match(PACKAGING_SUFFIX);
  if (!m) return { base: name.trim(), packaging: null };
  return {
    base: name.replace(PACKAGING_SUFFIX, "").trim(),
    packaging: m[1].toUpperCase().replace(/\s+/g, ""),
  };
}

/**
 * Catalogue-style name for a product coming from a price list in capitals:
 * "TELLUS S2 MX 68" + "Shell" -> "Shell Tellus S2 MX 68". Words of 4+
 * capital letters are series names; shorter tokens (MX, GXV, ATF) are codes
 * and stay as they are.
 */
export function tidyProductName(name: string, brand?: string | null): string {
  const words = name
    .trim()
    .split(/\s+/)
    .map((w) => {
      if (/^\d{1,2}W-?\d{2,3}$/i.test(w)) return w.toUpperCase().replace(/^(\d+)W-?(\d+)$/, "$1W-$2");
      if (/^\p{Lu}{4,}$/u.test(w)) return w[0] + w.slice(1).toLowerCase();
      return w;
    });
  const tidy = words.join(" ");
  if (brand && !tidy.toLowerCase().startsWith(brand.toLowerCase() + " ")) return `${brand} ${tidy}`;
  return tidy;
}

/**
 * When several listings share a base name (20L and 209L of one grade, or a
 * duplicate entry), the one to treat as the main listing.
 */
export function listingPreference(name: string): number {
  if (/^shell\s/i.test(name)) return 0;
  if (/209L/i.test(name)) return 1;
  return 2;
}
