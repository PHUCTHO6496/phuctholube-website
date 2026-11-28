import { prisma } from "@/lib/db";
import { DOCUMENT_KINDS, isProxiableDocument, type DocumentKind } from "@/lib/documents";

/**
 * /tai-lieu/tds/shell-tellus-s2-mx-46.pdf -> the product's TDS PDF, streamed
 * from Blob storage so the document is indexed under this domain. Responses
 * are cached at the CDN; a replaced PDF shows up within a day.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kind: string; file: string }> }
) {
  const { kind, file } = await params;
  const slug = file.toLowerCase().endsWith(".pdf") ? file.slice(0, -4) : null;
  if (!slug || !DOCUMENT_KINDS.includes(kind as DocumentKind)) return notFound();

  const product = await prisma.product.findUnique({
    where: { slug },
    select: { published: true, tdsUrl: true, msdsUrl: true },
  });
  const source = product?.published ? (kind === "tds" ? product.tdsUrl : product.msdsUrl) : null;
  if (!isProxiableDocument(source)) return notFound();

  const upstream = await fetch(source);
  if (!upstream.ok || !upstream.body) return notFound();

  const headers = new Headers({
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename="${kind}-${slug}.pdf"`,
    "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
  });
  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);
  return new Response(upstream.body, { headers });
}

function notFound() {
  return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
}
