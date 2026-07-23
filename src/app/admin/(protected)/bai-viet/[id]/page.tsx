import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BlogPostForm, type BlogPostFormData } from "@/components/admin/BlogPostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  const initialData: BlogPostFormData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    author: post.author ?? "",
    excerpt: post.excerpt ?? "",
    contentHtml: post.contentHtml,
    coverImage: post.coverImage ?? "",
    published: post.published,
    publishedAt: post.publishedAt
      ? post.publishedAt.toISOString().slice(0, 10)
      : "",
    seoTitle: post.seoTitle ?? "",
    seoDescription: post.seoDescription ?? "",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Sửa bài viết</h1>
      <div className="mt-6">
        <BlogPostForm initialData={initialData} />
      </div>
    </div>
  );
}
