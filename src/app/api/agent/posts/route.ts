import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";
import { isAuthorizedAgent, unauthorizedResponse } from "@/lib/agent-auth";

const agentPostSchema = z.object({
  title: z.string().trim().min(2, "Vui lòng nhập tiêu đề"),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang")
    .optional(),
  author: z.string().trim().optional(),
  excerpt: z.string().trim().optional(),
  contentHtml: z.string().trim().min(1, "Vui lòng nhập nội dung"),
  coverImage: z.string().trim().optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().optional(),
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
});

export async function GET(request: NextRequest) {
  if (!isAuthorizedAgent(request)) return unauthorizedResponse();

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      published: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedAgent(request)) return unauthorizedResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body phải là JSON hợp lệ" }, { status: 400 });
  }

  const parsed = agentPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const slug = data.slug ?? slugify(data.title);
  if (slug.length < 2) {
    return NextResponse.json(
      { error: "Không tạo được slug hợp lệ từ tiêu đề, vui lòng cung cấp slug." },
      { status: 422 }
    );
  }

  const published = data.published ?? true;

  const post = await prisma.blogPost.upsert({
    where: { slug },
    create: {
      title: data.title,
      slug,
      author: data.author || null,
      excerpt: data.excerpt || null,
      contentHtml: data.contentHtml,
      coverImage: data.coverImage || null,
      published,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : published ? new Date() : null,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
    },
    update: {
      title: data.title,
      author: data.author || null,
      excerpt: data.excerpt || null,
      contentHtml: data.contentHtml,
      coverImage: data.coverImage || null,
      published,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : published ? new Date() : null,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
    },
  });

  revalidatePath("/tin-tuc");
  revalidatePath(`/tin-tuc/${post.slug}`);
  revalidatePath("/admin/bai-viet");

  return NextResponse.json({
    ok: true,
    id: post.id,
    slug: post.slug,
    url: `${SITE_URL}/tin-tuc/${post.slug}`,
  });
}
