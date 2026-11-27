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

/**
 * When several listings share a base name (20L and 209L of one grade, or a
 * duplicate entry), the one to treat as the main listing.
 */
export function listingPreference(name: string): number {
  if (/^shell\s/i.test(name)) return 0;
  if (/209L/i.test(name)) return 1;
  return 2;
}
