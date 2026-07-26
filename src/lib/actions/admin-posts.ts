"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  title: z.string().trim().min(2, "Vui lòng nhập tiêu đề"),
  slug: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập slug")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  author: z.string().trim().optional(),
  excerpt: z.string().trim().optional(),
  contentHtml: z.string().trim().min(1, "Vui lòng nhập nội dung"),
  coverImage: z.string().trim().optional(),
  published: z.boolean(),
  publishedAt: z.string().optional(),
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
});

export type PostInput = z.infer<typeof schema>;
export type PostResult =
  | { ok: true; id: string }
  | { ok: false; errors: Record<string, string[]> };

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

export async function createPost(input: PostInput): Promise<PostResult> {
  await requireSession();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;

  const existing = await prisma.blogPost.findUnique({ where: { slug: data.slug } });
  if (existing) return { ok: false, errors: { slug: ["Slug này đã được sử dụng"] } };

  const created = await prisma.blogPost.create({
    data: {
      title: data.title,
      slug: data.slug,
      author: data.author || null,
      excerpt: data.excerpt || null,
      contentHtml: data.contentHtml,
      coverImage: data.coverImage || null,
      published: data.published,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : data.published ? new Date() : null,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
    },
  });

  revalidatePath("/admin/bai-viet");
  revalidatePath("/tin-tuc");
  return { ok: true, id: created.id };
}

export async function updatePost(id: string, input: PostInput): Promise<PostResult> {
  await requireSession();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;

  const existing = await prisma.blogPost.findFirst({ where: { slug: data.slug, NOT: { id } } });
  if (existing) return { ok: false, errors: { slug: ["Slug này đã được sử dụng"] } };

  await prisma.blogPost.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      author: data.author || null,
      excerpt: data.excerpt || null,
      contentHtml: data.contentHtml,
      coverImage: data.coverImage || null,
      published: data.published,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : data.published ? new Date() : null,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
    },
  });

  revalidatePath("/admin/bai-viet");
  revalidatePath("/tin-tuc");
  revalidatePath(`/tin-tuc/${data.slug}`);
  return { ok: true, id };
}

export async function deletePost(id: string): Promise<{ ok: boolean }> {
  await requireSession();
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/bai-viet");
  revalidatePath("/tin-tuc");
  return { ok: true };
}
