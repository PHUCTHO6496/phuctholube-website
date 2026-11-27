import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { listingPreference, productBaseName } from "@/lib/product-name";

// Links the first mention of each product in a blog post to its product
// page at render time, so the existing posts (written by the content agent
// without any links) pass authority to the pages that sell.

type LinkTarget = { pattern: RegExp; href: string };

const MAX_LINKS_PER_POST = 8;
// Never nest links, and keep headings/code as written.
const SKIP_TAGS = new Set(["a", "button", "code", "pre", "script", "style", "h1", "h2", "h3", "h4", "h5", "h6"]);

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Posts spell the same code several ways ("R4X"/"R4 X", "15W40"/"15W-40",
// "P100"/"P 100"), so every letter/digit boundary may carry a space or dash.
function namePattern(base: string) {
  const parts = base
    .split(/[\s-]+/)
    .flatMap((token) => token.match(/\p{L}+|\d+(?:\.\d+)?|[^\p{L}\d]+/gu) ?? []);
  const body = parts.map(escapeRegExp).join("[\\s-]?");
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:Shell\\s+)?${body}(?![\\p{L}\\p{N}]|[.,]\\d)`, "iu");
}

const getLinkTargets = unstable_cache(
  async () => {
    const products = await prisma.product.findMany({
      where: { published: true },
      select: { name: true, slug: true },
    });

    const byBase = new Map<string, { name: string; slug: string }>();
    for (const p of products) {
      const base = productBaseName(p.name);
      // Too generic to match safely (e.g. a bare series name).
      if (base.length < 6 || !/\d/.test(base)) continue;
      const key = base.toLowerCase().replace(/[\s-]+/g, "");
      const current = byBase.get(key);
      if (!current || listingPreference(p.name) < listingPreference(current.name)) {
        byBase.set(key, p);
      }
    }

    // Longest first so "Tellus Zinc Free S3 VX 46" wins over shorter names.
    return Array.from(byBase.values())
      .map((p) => ({ base: productBaseName(p.name), href: `/san-pham/${p.slug}` }))
      .sort((a, b) => b.base.length - a.base.length);
  },
  ["blog-product-link-targets"],
  { tags: ["products"], revalidate: 300 }
);

type Segment = { text: string; linked: boolean };

function linkInText(text: string, targets: LinkTarget[], used: Set<string>, budget: { left: number }) {
  let segments: Segment[] = [{ text, linked: false }];

  for (const target of targets) {
    if (budget.left <= 0) break;
    if (used.has(target.href)) continue;

    const next: Segment[] = [];
    let done = false;
    for (const seg of segments) {
      const match = !done && !seg.linked ? target.pattern.exec(seg.text) : null;
      if (!match) {
        next.push(seg);
        continue;
      }
      const start = match.index;
      const end = start + match[0].length;
      next.push({ text: seg.text.slice(0, start), linked: false });
      next.push({ text: `<a href="${target.href}">${match[0]}</a>`, linked: true });
      next.push({ text: seg.text.slice(end), linked: false });
      used.add(target.href);
      budget.left -= 1;
      done = true;
    }
    segments = next;
  }

  return segments.map((s) => s.text).join("");
}

export async function linkProductMentions(html: string): Promise<string> {
  const raw = await getLinkTargets();
  const targets: LinkTarget[] = raw.map((t) => ({ pattern: namePattern(t.base), href: t.href }));

  // Links the post already has count against the budget and aren't repeated.
  const used = new Set<string>();
  for (const m of html.matchAll(/href="(?:https?:\/\/[^"/]+)?(\/san-pham\/[^"#?]+)"/g)) used.add(m[1]);
  const budget = { left: MAX_LINKS_PER_POST - used.size };
  if (budget.left <= 0) return html;

  let skipDepth = 0;
  return html
    .split(/(<[^>]+>)/)
    .map((piece) => {
      if (piece.startsWith("<")) {
        const tag = /^<(\/?)([a-zA-Z0-9]+)/.exec(piece);
        if (tag && SKIP_TAGS.has(tag[2].toLowerCase()) && !piece.endsWith("/>")) {
          skipDepth = Math.max(0, skipDepth + (tag[1] ? -1 : 1));
        }
        return piece;
      }
      if (skipDepth > 0 || !piece.trim() || budget.left <= 0) return piece;
      return linkInText(piece, targets, used, budget);
    })
    .join("");
}
