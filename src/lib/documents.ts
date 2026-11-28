/**
 * TDS/MSDS PDFs live in the Vercel Blob store, whose URLs carry the store's
 * random hostname and a random suffix. Linking them directly makes Google
 * index (and credit) the Blob host instead of this site, so product pages
 * link to /tai-lieu/{tds|msds}/{slug}.pdf, served by
 * src/app/tai-lieu/[kind]/[file]/route.ts from the stored URL.
 */
export const DOCUMENT_KINDS = ["tds", "msds"] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

const BLOB_PDF = /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/.+\.pdf$/i;

/** Whether a stored document URL can be served under /tai-lieu. */
export function isProxiableDocument(url: string | null | undefined): url is string {
  return !!url && BLOB_PDF.test(url);
}

/** Public link for a product's document (the stored URL when it isn't ours to proxy). */
export function documentHref(kind: DocumentKind, slug: string, storedUrl: string) {
  return isProxiableDocument(storedUrl) ? `/tai-lieu/${kind}/${slug}.pdf` : storedUrl;
}
