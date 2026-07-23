import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { JsonLd } from "@/components/site/JsonLd";
import { SITE_URL } from "@/lib/constants";

async function getPost(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug, published: true } });
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN").format(date);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt ?? undefined,
          image: post.coverImage ? `${SITE_URL}${post.coverImage}` : undefined,
          datePublished: post.publishedAt?.toISOString(),
          dateModified: post.updatedAt.toISOString(),
          author: post.author ? { "@type": "Person", name: post.author } : undefined,
          mainEntityOfPage: `${SITE_URL}/tin-tuc/${post.slug}`,
        }}
      />
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link href="/tin-tuc" className="hover:text-blue-900">
          Tin tức
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="line-clamp-1 text-slate-700">{post.title}</span>
      </nav>

      <h1 className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">
        {post.title}
      </h1>
      <p className="mt-3 text-sm text-slate-500">
        {post.author}
        {post.publishedAt ? ` · ${formatDate(post.publishedAt)}` : ""}
      </p>

      <div
        className="prose prose-slate mt-8 max-w-none prose-p:leading-relaxed prose-p:text-slate-700"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      <div className="mt-12 border-t border-slate-200 pt-8">
        <Link
          href="/tin-tuc"
          className="text-sm font-semibold text-blue-900 hover:text-amber-600"
        >
          ← Xem tất cả bài viết
        </Link>
      </div>
    </article>
  );
}
