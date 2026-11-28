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

// Trailing grade token: ISO VG / NLGI number ("46", "1.5") or SAE grade ("15W-40", "10W").
const GRADE_TOKEN = /^(\d+(?:\.\d+)?|\d{1,2}W(?:-?\d{2,3})?)$/i;

/**
 * Product line a grade belongs to, so the other grades can be linked:
 * "Shell Tellus S2 MX 46" -> "Shell Tellus S2 MX", "Shell Gadus S2 V220 2"
 * -> "Shell Gadus S2 V220". Null when the name doesn't end in a grade
 * ("Shell Rimula R3 10W CF") — better no siblings than wrong ones.
 */
export function productSeries(name: string): string | null {
  const words = splitPackaging(name).base.split(/\s+/);
  if (words.length < 3 || !GRADE_TOKEN.test(words[words.length - 1])) return null;
  return words.slice(0, -1).join(" ");
}

/**
 * Base-oil family used to keep the equivalent finder honest: a PAG gear oil
 * is not interchangeable with a mineral one of the same ISO grade (they
 * don't even mix), and a PAO synthetic is an upgrade, not an equivalent.
 */
export type BaseOilFamily = "mineral" | "synthetic" | "pag" | "water-glycol";

/** Free text from a "Loại dầu gốc" spec row (copied from the TDS). */
export function baseOilFamilyFromText(text: string | null | undefined): BaseOilFamily | null {
  if (!text) return null;
  if (/nước|water/i.test(text) && /glycol/i.test(text)) return "water-glycol";
  if (/\bPAG\b|polyalkylene|polyglycol/i.test(text)) return "pag";
  if (/\bPAO\b|polyalphaolefin|GTL|tổng hợp|synthetic/i.test(text)) return "synthetic";
  if (/khoáng|mineral/i.test(text)) return "mineral";
  return null;
}

// Lines whose base oil is common knowledge but not stated on a spec row
// (other brands have no TDS on the site; some Shell TDS don't say it).
// Only lines we're sure of — anything unlisted stays unclassified.
const BASE_OIL_BY_NAME: [RegExp, BaseOilFamily][] = [
  [/^Shell (Omala S2 GX|Turbo T |Corena S2 P|Corena S3 R|Tonna S2 M|Tellus S2 [MV]X|Tellus Zinc Free|Morlina S2|Paper Machine Oil S3 M)/i, "mineral"],
  [/^Mobil SHC/i, "synthetic"],
  // Not DTE 10 Excel: Mobil's PDS describes it as made from synthetic
  // technology base oils, so it stays unclassified rather than "mineral".
  [/^Mobilgear 600 XP|^Mobil DTE 2\d|^Mobil Rarus 4/i, "mineral"],
  [/^Castrol Alphasyn PG/i, "pag"],
  [/^Castrol (Alpha SP|Optigear BM|Hyspin AWS|Aircol PD|Perfecto T)/i, "mineral"],
  [/^Castrol Aircol SN/i, "synthetic"],
  [/^Total (Carter EP|Azolla ZS|Dacnis VS)/i, "mineral"],
];

/**
 * Base-oil family only separates industrial oils sold by ISO VG; engine and
 * gear oils sold by SAE grade are matched on the grade (their API/ACEA
 * class matters more than the base stock).
 */
export function usesBaseOilFamily(grade: string | null | undefined): boolean {
  return !!grade && /^\d+$/.test(grade.trim());
}

/** Spec row wins (it comes from the TDS); otherwise the name rules. */
export function baseOilFamily(name: string, baseOilSpec?: string | null): BaseOilFamily | null {
  const fromSpec = baseOilFamilyFromText(baseOilSpec);
  if (fromSpec) return fromSpec;
  return BASE_OIL_BY_NAME.find(([re]) => re.test(name))?.[1] ?? null;
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
