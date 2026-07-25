import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import { isAuthorizedAgent, unauthorizedResponse } from "@/lib/agent-auth";

// Sanity check against gross pricing mistakes (typos, decimal errors) coming
// from an automated caller. Legitimate large price changes still go through
// the admin panel, which has no such limit.
const MAX_PRICE_CHANGE_RATIO = 0.3;

const agentProductUpdateSchema = z.object({
  slug: z.string().trim().min(1, "Vui lòng cung cấp slug sản phẩm cần cập nhật"),
  price: z.number().int().nonnegative().nullable().optional(),
  shortDescription: z.string().trim().optional(),
  description: z.string().trim().optional(),
  viscosityGrade: z.string().trim().optional(),
  tdsUrl: z.string().trim().optional(),
  msdsUrl: z.string().trim().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  images: z
    .array(
      z.object({
        url: z.string().trim().min(1),
        alt: z.string().trim().optional(),
      })
    )
    .optional(),
});

export async function GET(request: NextRequest) {
  if (!isAuthorizedAgent(request)) return unauthorizedResponse();

  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      price: true,
      viscosityGrade: true,
      published: true,
      featured: true,
      updatedAt: true,
      category: { select: { name: true } },
    },
  });

  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedAgent(request)) return unauthorizedResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body phải là JSON hợp lệ" }, { status: 400 });
  }

  const parsed = agentProductUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const data = parsed.data;

  const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (!existing) {
    return NextResponse.json(
      { error: `Không tìm thấy sản phẩm với slug "${data.slug}". API này chỉ cập nhật sản phẩm đã có sẵn.` },
      { status: 404 }
    );
  }

  if (data.price !== undefined && data.price !== null && existing.price) {
    const changeRatio = Math.abs(data.price - existing.price) / existing.price;
    if (changeRatio > MAX_PRICE_CHANGE_RATIO) {
      return NextResponse.json(
        {
          error: `Giá mới (${data.price}) chênh lệch ${Math.round(changeRatio * 100)}% so với giá hiện tại (${existing.price}), vượt giới hạn ${MAX_PRICE_CHANGE_RATIO * 100}% cho mỗi lần cập nhật qua agent. Nếu đây là thay đổi có chủ đích, vui lòng cập nhật thủ công qua trang quản trị.`,
          currentPrice: existing.price,
          requestedPrice: data.price,
        },
        { status: 422 }
      );
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.price !== undefined) updateData.price = data.price;
  if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription || null;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.viscosityGrade !== undefined) updateData.viscosityGrade = data.viscosityGrade || null;
  if (data.tdsUrl !== undefined) updateData.tdsUrl = data.tdsUrl || null;
  if (data.msdsUrl !== undefined) updateData.msdsUrl = data.msdsUrl || null;
  if (data.featured !== undefined) updateData.featured = data.featured;
  if (data.published !== undefined) updateData.published = data.published;

  if (data.images !== undefined) {
    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId: existing.id } }),
      prisma.product.update({
        where: { id: existing.id },
        data: {
          ...updateData,
          images: {
            create: data.images.map((img, i) => ({
              url: img.url,
              alt: img.alt || null,
              sortOrder: i,
            })),
          },
        },
      }),
    ]);
  } else if (Object.keys(updateData).length > 0) {
    await prisma.product.update({ where: { id: existing.id }, data: updateData });
  }

  revalidatePath("/admin/san-pham");
  revalidatePath(`/san-pham/${existing.slug}`);
  revalidatePath("/san-pham");
  revalidatePath("/");

  return NextResponse.json({
    ok: true,
    id: existing.id,
    slug: existing.slug,
    url: `${SITE_URL}/san-pham/${existing.slug}`,
  });
}
