import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { slugify } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";
import { isAuthorizedAgent, unauthorizedResponse } from "@/lib/agent-auth";

const agentPostSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang")
    .optional(),
  title: z.string().trim().min(2, "Vui lòng nhập tiêu đề").optional(),
  author: z.string().trim().optional(),
  excerpt: z.string().trim().optional(),
  contentHtml: z.string().trim().min(1, "Vui lòng nhập nội dung").optional(),
  coverImage: z.string().trim().optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().optional(),
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
});

type AgentPostInput = z.infer<typeof agentPostSchema>;

// The agent used to start a fresh URL for every rewrite of a topic
// ("...-26112026", "...-v2"), leaving several posts competing for the same
// search. A new post must have a stable slug; to revise a topic, POST again
// with the existing post's slug (that updates it in place).
const DATED_SLUG = /-(\d{8}|v\d+)$/;

// The site speaks for Phúc Thọ only. Võ Lan is a separate company (a reseller
// of Phúc Thọ), so posts must not send visitors there or sign as its team.
const FOREIGN_BRAND = /(?<!\p{L})v[õo]\s*lan(?!\p{L})/iu;

// The agent has invented contact addresses before (sales@phuctholube.com
// doesn't exist), so any email in a post must be the one in site settings.
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

function contentIssues(data: AgentPostInput, siteEmail: string): string[] {
  const fields = { title: data.title, author: data.author, excerpt: data.excerpt, contentHtml: data.contentHtml, seoTitle: data.seoTitle, seoDescription: data.seoDescription };
  const issues: string[] = [];
  for (const [field, value] of Object.entries(fields)) {
    if (!value) continue;
    if (FOREIGN_BRAND.test(value.normalize("NFC"))) {
      issues.push(`${field}: không được nhắc "Võ Lan" — website này đứng tên Dầu Nhớt Phúc Thọ (Công ty TNHH Thương Mại Phúc Thọ).`);
    }
    const foreignEmails = (value.match(EMAIL) ?? []).filter(
      (email) => email.toLowerCase() !== siteEmail.toLowerCase()
    );
    if (foreignEmails.length > 0) {
      issues.push(`${field}: email ${[...new Set(foreignEmails)].join(", ")} không phải email của website — chỉ dùng ${siteEmail}.`);
    }
  }
  return issues;
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedAgent(request)) return unauthorizedResponse();

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
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

  const slug = data.slug ?? (data.title ? slugify(data.title) : null);
  if (!slug || slug.length < 2) {
    return NextResponse.json(
      { error: "Cần cung cấp slug (bắt buộc nếu không kèm title để tự sinh slug)." },
      { status: 422 }
    );
  }

  const settings = await getSiteSettings();
  const issues = contentIssues(data, settings.email);
  if (issues.length > 0) {
    return NextResponse.json({ error: "Nội dung không hợp lệ", details: issues }, { status: 422 });
  }

  const existing = await prisma.blogPost.findUnique({ where: { slug } });

  if (!existing) {
    if (DATED_SLUG.test(slug)) {
      return NextResponse.json(
        {
          error:
            "Slug bài mới không được kết thúc bằng ngày (-ddmmyyyy) hoặc phiên bản (-v2). Dùng slug ổn định theo chủ đề; nếu chủ đề đã có bài, hãy gửi lại với slug của bài đó để cập nhật thay vì tạo bài mới (xem GET /api/agent/posts).",
        },
        { status: 422 }
      );
    }
    return createPost(slug, data);
  }
  return updatePost(existing, data);
}

async function createPost(slug: string, data: AgentPostInput) {
  if (!data.title || !data.contentHtml) {
    const missing = [!data.title && "title", !data.contentHtml && "contentHtml"].filter(Boolean);
    return NextResponse.json(
      { error: `Thiếu trường bắt buộc để tạo bài viết mới: ${missing.join(", ")}` },
      { status: 422 }
    );
  }

  const published = data.published ?? true;
  const created = await prisma.blogPost.create({
    data: {
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
  });

  revalidateTag("posts", "seconds");
  revalidatePath("/tin-tuc");
  revalidatePath(`/tin-tuc/${created.slug}`);
  revalidatePath("/admin/bai-viet");

  return NextResponse.json(
    { ok: true, id: created.id, slug: created.slug, url: `${SITE_URL}/tin-tuc/${created.slug}` },
    { status: 201 }
  );
}

async function updatePost(existing: { id: string; slug: string }, data: AgentPostInput) {
  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.author !== undefined) updateData.author = data.author || null;
  if (data.excerpt !== undefined) updateData.excerpt = data.excerpt || null;
  if (data.contentHtml !== undefined) updateData.contentHtml = data.contentHtml;
  if (data.coverImage !== undefined) updateData.coverImage = data.coverImage || null;
  if (data.published !== undefined) updateData.published = data.published;
  if (data.publishedAt !== undefined) {
    updateData.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
  }
  if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle || null;
  if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription || null;

  if (Object.keys(updateData).length > 0) {
    await prisma.blogPost.update({ where: { id: existing.id }, data: updateData });
  }

  revalidateTag("posts", "seconds");
  revalidatePath("/tin-tuc");
  revalidatePath(`/tin-tuc/${existing.slug}`);
  revalidatePath("/admin/bai-viet");

  return NextResponse.json({
    ok: true,
    id: existing.id,
    slug: existing.slug,
    url: `${SITE_URL}/tin-tuc/${existing.slug}`,
  });
}
