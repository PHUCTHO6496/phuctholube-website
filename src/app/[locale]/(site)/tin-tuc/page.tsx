import type { Metadata } from "next";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("blog")]);
  return {
    title: t("title"),
    description: t("description"),
    // Blog posts are Vietnamese-only.
    ...localeAlternates(locale, "/tin-tuc", false),
  };
}

// publishedAt comes back as an ISO string (not a Date) once it has round-tripped
// through unstable_cache's JSON serialization, so accept both.
function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
}

const getPublishedPosts = unstable_cache(
  async () =>
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        author: true,
        publishedAt: true,
        coverImage: true,
      },
    }),
  ["published-posts"],
  { tags: ["posts"], revalidate: 300 }
);

export default async function BlogListPage() {
  const [posts, t] = await Promise.all([getPublishedPosts(), getTranslations("blog")]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold text-slate-900">{t("title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("description")}</p>
        {t("vietnameseOnly") && (
          <p className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t("vietnameseOnly")}
          </p>
        )}
      </div>

      <p className="mt-6 text-sm text-slate-500">{t("showing", { count: posts.length })}</p>

      <div lang="vi" className="mt-6 divide-y divide-slate-200">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/tin-tuc/${post.slug}`}
            className="flex gap-5 py-6 first:pt-0"
          >
            {post.coverImage && (
              <div className="relative hidden aspect-[16/9] w-48 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:block">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="192px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-slate-900 transition-colors hover:text-blue-900">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {post.excerpt}
                </p>
              )}
              <p className="mt-3 text-xs text-slate-500">
                {post.author}
                {post.publishedAt ? ` · ${formatDate(post.publishedAt)}` : ""}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
