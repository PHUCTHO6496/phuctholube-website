import type { Metadata } from "next";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db";

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

export const metadata: Metadata = {
  title: "Tin tức và bài viết",
  description:
    "Cập nhật thông tin mới nhất về dầu nhớt công nghiệp, hướng dẫn sử dụng và kiến thức chuyên ngành.",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN").format(date);
}

export default async function BlogListPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Tin tức và bài viết
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Cập nhật thông tin mới nhất về dầu nhớt công nghiệp, hướng dẫn sử
          dụng và kiến thức chuyên ngành.
        </p>
      </div>

      <p className="mt-6 text-sm text-slate-500">
        Hiển thị {posts.length} bài viết
      </p>

      <div className="mt-6 divide-y divide-slate-200">
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
