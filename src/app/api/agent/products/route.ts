import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import { isAuthorizedAgent, unauthorizedResponse } from "@/lib/agent-auth";
import { slugify } from "@/lib/utils";
import { splitPackaging, tidyProductName } from "@/lib/product-name";

// Sanity check against gross pricing mistakes (typos, decimal errors) coming
// from an automated caller. Legitimate large price changes still go through
// the admin panel, which has no such limit. Does not apply to brand-new
// products, since there is no prior price to compare against.
const MAX_PRICE_CHANGE_RATIO = 0.3;

const agentProductSchema = z.strictObject({
  slug: z
    .string()
    .trim()
    .min(1, "Vui lòng cung cấp slug sản phẩm")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  name: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  price: z.number().int().nonnegative().nullable().optional(),
  stock: z.number().int().nonnegative().nullable().optional(),
  category: z.object({ name: z.string().trim().min(1) }).optional(),
  shortDescription: z.string().trim().optional(),
  description: z.string().trim().optional(),
  viscosityGrade: z.string().trim().optional(),
  // Which packaging price/stock refer to, for products sold in several
  // (xô 20L, phuy 209L). Also read from a "(209L)" suffix in `name`.
  packaging: z.string().trim().min(1).optional(),
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
      stock: true,
      viscosityGrade: true,
      published: true,
      featured: true,
      updatedAt: true,
      category: { select: { name: true } },
      // One page per grade: each packaging has its own price/stock.
      // legacySlug is the slug the packaging had as a separate listing and
      // still works for price/stock updates.
      variants: {
        orderBy: { sortOrder: "asc" },
        select: { packaging: true, price: true, stock: true, legacySlug: true },
      },
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

  const parsed = agentProductSchema.safeParse(body);
  if (!parsed.success) {
    const { formErrors, fieldErrors } = parsed.error.flatten();
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: fieldErrors, issues: formErrors },
      { status: 422 }
    );
  }
  const data = parsed.data;

  const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (existing) return updateProduct(existing, data);

  // Slug of a packaging that used to be its own listing (before 20L/209L
  // were merged into one page): update that packaging.
  const variant = await prisma.productVariant.findUnique({
    where: { legacySlug: data.slug },
    include: { product: { select: { id: true, slug: true } } },
  });
  if (variant) return updateVariant(variant, data);

  // Renamed/merged product: follow the redirect instead of re-creating it.
  const moved = await prisma.redirect.findUnique({ where: { fromPath: `/san-pham/${data.slug}` } });
  const movedSlug = moved?.toPath.match(/^\/san-pham\/([^/]+)$/)?.[1];
  if (movedSlug) {
    const target = await prisma.product.findUnique({ where: { slug: movedSlug } });
    if (target) return updateProduct(target, data);
  }

  return createProduct(data);
}

function revalidateProduct(slug: string) {
  revalidateTag("products", "seconds");
  revalidatePath("/admin/san-pham");
  revalidatePath(`/san-pham/${slug}`);
  revalidatePath("/san-pham");
  revalidatePath("/");
}

function priceChangeError(current: number | null, requested: number | null | undefined) {
  if (requested === undefined || requested === null || !current) return null;
  const changeRatio = Math.abs(requested - current) / current;
  if (changeRatio <= MAX_PRICE_CHANGE_RATIO) return null;
  return NextResponse.json(
    {
      error: `Giá mới (${requested}) chênh lệch ${Math.round(changeRatio * 100)}% so với giá hiện tại (${current}), vượt giới hạn ${MAX_PRICE_CHANGE_RATIO * 100}% cho mỗi lần cập nhật qua agent. Nếu đây là thay đổi có chủ đích, vui lòng cập nhật thủ công qua trang quản trị.`,
      currentPrice: current,
      requestedPrice: requested,
    },
    { status: 409 }
  );
}

// Only price and stock belong to a packaging; everything else describes the
// product page shared by all packagings and must be sent with its slug.
const VARIANT_FIELDS = new Set(["slug", "price", "stock", "packaging"]);

async function updateVariant(
  variant: { id: string; packaging: string; price: number | null; product: { id: string; slug: string } },
  data: AgentProductInput
) {
  const rejected = priceChangeError(variant.price, data.price);
  if (rejected) return rejected;

  const updateData: { price?: number | null; stock?: number | null } = {};
  if (data.price !== undefined) updateData.price = data.price;
  if (data.stock !== undefined) updateData.stock = data.stock;
  if (Object.keys(updateData).length > 0) {
    await prisma.productVariant.update({ where: { id: variant.id }, data: updateData });
  }
  revalidateProduct(variant.product.slug);

  const ignored = Object.keys(data).filter((k) => !VARIANT_FIELDS.has(k));
  return NextResponse.json({
    ok: true,
    id: variant.product.id,
    slug: variant.product.slug,
    packaging: variant.packaging,
    url: `${SITE_URL}/san-pham/${variant.product.slug}`,
    ...(ignored.length > 0
      ? {
          ignored,
          note: `"${data.slug}" là một quy cách (${variant.packaging}) của sản phẩm "${variant.product.slug}"; chỉ cập nhật price/stock. Gửi các trường khác với slug "${variant.product.slug}".`,
        }
      : {}),
  });
}

type AgentProductInput = z.infer<typeof agentProductSchema>;

async function resolveCategoryId(
  category: AgentProductInput["category"]
): Promise<{ id: string | null } | { error: NextResponse }> {
  if (!category) return { id: null };

  const found = await prisma.productCategory.findFirst({
    where: { name: { equals: category.name, mode: "insensitive" } },
  });
  if (!found) {
    const all = await prisma.productCategory.findMany({ select: { name: true } });
    return {
      error: NextResponse.json(
        {
          error: `Không tìm thấy danh mục "${category.name}". Danh mục phải là một trong các danh mục đã có sẵn.`,
          availableCategories: all.map((c) => c.name),
        },
        { status: 422 }
      ),
    };
  }
  return { id: found.id };
}

async function createProduct(data: AgentProductInput) {
  const missing: string[] = [];
  if (!data.name) missing.push("name");
  if (data.price === undefined || data.price === null) missing.push("price");
  if (!data.brand) missing.push("brand");
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Thiếu trường bắt buộc để tạo sản phẩm mới: ${missing.join(", ")}` },
      { status: 422 }
    );
  }
  if (data.price! <= 0) {
    return NextResponse.json({ error: "Giá sản phẩm phải lớn hơn 0" }, { status: 422 });
  }

  const categoryResult = await resolveCategoryId(data.category);
  if ("error" in categoryResult) return categoryResult.error;

  const split = splitPackaging(data.name!);
  const packaging = data.packaging ?? split.packaging;
  if (packaging) return createPackaging(data, packaging, split.base, categoryResult.id);

  try {
    const created = await prisma.product.create({
      data: {
        name: data.name!,
        slug: data.slug,
        brand: data.brand!,
        price: data.price!,
        stock: data.stock ?? null,
        categoryId: categoryResult.id,
        shortDescription: data.shortDescription || null,
        description: data.description || null,
        viscosityGrade: data.viscosityGrade || null,
        tdsUrl: data.tdsUrl || null,
        msdsUrl: data.msdsUrl || null,
        featured: data.featured ?? false,
        published: data.published ?? true,
        images: data.images
          ? {
              create: data.images.map((img, i) => ({
                url: img.url,
                alt: img.alt || null,
                sortOrder: i,
              })),
            }
          : undefined,
      },
    });

    revalidateTag("products", "seconds");
    revalidatePath("/admin/san-pham");
    revalidatePath(`/san-pham/${created.slug}`);
    revalidatePath("/san-pham");
    revalidatePath("/");

    return NextResponse.json(
      { ok: true, id: created.id, slug: created.slug, url: `${SITE_URL}/san-pham/${created.slug}` },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return NextResponse.json(
        { error: `Slug "${data.slug}" đã tồn tại (trùng lặp khi tạo).` },
        { status: 409 }
      );
    }
    throw err;
  }
}

/**
 * A product sold in several packagings is one page with one variant per
 * packaging. A new packaging joins the existing page for its grade; a new
 * grade gets a page with this as its first packaging.
 */
async function createPackaging(
  data: AgentProductInput,
  packaging: string,
  baseName: string,
  categoryId: string | null
) {
  const name = tidyProductName(baseName, data.brand);
  const productSlug = slugify(name);
  const legacySlug = data.slug === productSlug ? null : data.slug;

  const parent = await prisma.product.findUnique({
    where: { slug: productSlug },
    include: { variants: { select: { packaging: true } } },
  });

  if (parent) {
    if (parent.variants.some((v) => v.packaging.toUpperCase() === packaging.toUpperCase())) {
      return NextResponse.json(
        {
          error: `Sản phẩm "${productSlug}" đã có quy cách ${packaging}. Cập nhật giá/tồn kho bằng slug "${productSlug}" kèm "packaging": "${packaging}".`,
        },
        { status: 409 }
      );
    }
    await prisma.productVariant.create({
      data: {
        productId: parent.id,
        packaging,
        price: data.price ?? null,
        stock: data.stock ?? null,
        legacySlug,
        sortOrder: parent.variants.length,
      },
    });
    revalidateProduct(parent.slug);
    return NextResponse.json(
      { ok: true, id: parent.id, slug: parent.slug, packaging, url: `${SITE_URL}/san-pham/${parent.slug}` },
      { status: 201 }
    );
  }

  const created = await prisma.product.create({
    data: {
      name,
      slug: productSlug,
      brand: data.brand!,
      categoryId,
      shortDescription: data.shortDescription || null,
      description: data.description || null,
      viscosityGrade: data.viscosityGrade || null,
      tdsUrl: data.tdsUrl || null,
      msdsUrl: data.msdsUrl || null,
      featured: data.featured ?? false,
      published: data.published ?? true,
      variants: {
        create: { packaging, price: data.price ?? null, stock: data.stock ?? null, legacySlug },
      },
      images: data.images
        ? {
            create: data.images.map((img, i) => ({ url: img.url, alt: img.alt || null, sortOrder: i })),
          }
        : undefined,
    },
  });
  revalidateProduct(created.slug);
  return NextResponse.json(
    { ok: true, id: created.id, slug: created.slug, packaging, url: `${SITE_URL}/san-pham/${created.slug}` },
    { status: 201 }
  );
}

async function updateProduct(
  existing: { id: string; slug: string; price: number | null },
  data: AgentProductInput
) {
  const variants = await prisma.productVariant.findMany({
    where: { productId: existing.id },
    orderBy: { sortOrder: "asc" },
    select: { id: true, packaging: true, price: true },
  });

  // Price and stock of a multi-packaging product belong to one packaging.
  if (variants.length > 0 && (data.price !== undefined || data.stock !== undefined)) {
    const target = data.packaging
      ? variants.find((v) => v.packaging.toUpperCase() === data.packaging!.toUpperCase())
      : variants.length === 1
        ? variants[0]
        : undefined;
    if (!target) {
      return NextResponse.json(
        {
          error: data.packaging
            ? `Sản phẩm "${existing.slug}" không có quy cách ${data.packaging}.`
            : `Sản phẩm "${existing.slug}" có nhiều quy cách; cần gửi kèm "packaging" để cập nhật giá/tồn kho.`,
          packagings: variants.map((v) => v.packaging),
        },
        { status: 422 }
      );
    }
    const rejected = priceChangeError(target.price, data.price);
    if (rejected) return rejected;
    await prisma.productVariant.update({
      where: { id: target.id },
      data: {
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.stock !== undefined ? { stock: data.stock } : {}),
      },
    });
  } else {
    const rejected = priceChangeError(existing.price, data.price);
    if (rejected) return rejected;
  }

  const updateData: Record<string, unknown> = {};
  if (variants.length === 0) {
    if (data.price !== undefined) updateData.price = data.price;
    if (data.stock !== undefined) updateData.stock = data.stock;
  }
  if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription || null;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.viscosityGrade !== undefined) updateData.viscosityGrade = data.viscosityGrade || null;
  if (data.tdsUrl !== undefined) updateData.tdsUrl = data.tdsUrl || null;
  if (data.msdsUrl !== undefined) updateData.msdsUrl = data.msdsUrl || null;
  if (data.featured !== undefined) updateData.featured = data.featured;
  if (data.published !== undefined) updateData.published = data.published;
  if (data.category) {
    const categoryResult = await resolveCategoryId(data.category);
    if ("error" in categoryResult) return categoryResult.error;
    updateData.categoryId = categoryResult.id;
  }

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

  revalidateTag("products", "seconds");
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
