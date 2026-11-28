import "server-only";
import { unstable_cache } from "next/cache";
import { permanentRedirect } from "next/navigation";
import { prisma } from "@/lib/db";

const getRedirectTarget = unstable_cache(
  async (fromPath: string) => {
    const found = await prisma.redirect.findUnique({
      where: { fromPath },
      select: { toPath: true },
    });
    return found?.toPath ?? null;
  },
  ["redirect-target"],
  { tags: ["redirects"], revalidate: 300 }
);

/**
 * Sends a permanent (308) redirect when `path` (without locale prefix, e.g.
 * "/san-pham/old-slug") has moved — merged into another product, renamed —
 * so old links and search results keep working. Returns normally when there
 * is nothing to redirect; the caller then shows its 404.
 */
export async function redirectIfMoved(locale: string, path: string) {
  const target = await getRedirectTarget(path);
  if (target) permanentRedirect(locale === "en" ? `/en${target}` : target);
}

type RedirectWriter = {
  redirect: {
    upsert: typeof prisma.redirect.upsert;
    updateMany: typeof prisma.redirect.updateMany;
    deleteMany: typeof prisma.redirect.deleteMany;
  };
};

/**
 * Records that `fromPath` now lives at `toPath`, rewriting older redirects
 * that pointed at `fromPath` so visitors never go through a chain, and
 * dropping any redirect away from `toPath` (something lives there now).
 */
export async function recordMove(db: RedirectWriter, fromPath: string, toPath: string) {
  if (fromPath === toPath) return;
  await db.redirect.deleteMany({ where: { fromPath: toPath } });
  await db.redirect.updateMany({ where: { toPath: fromPath }, data: { toPath } });
  await db.redirect.upsert({
    where: { fromPath },
    create: { fromPath, toPath },
    update: { toPath },
  });
}
