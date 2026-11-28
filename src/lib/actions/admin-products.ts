"use server";

import { z } from "zod";
import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { recordMove } from "@/lib/redirects";

const variantSchema = z.object({
  id: z.string().optional(),
  packaging: z.string().trim().min(1, "Vui lòng nhập quy cách"),
  price: z.number().int().nonnegative().nullable(),
});

const productSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập tên sản phẩm"),
  slug: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập slug")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  brand: z.string().trim().optional(),
  price: z.number().nullable().optional(),
  tdsUrl: z.string().trim().optional(),
  msdsUrl: z.string().trim().optional(),
  viscosityGrade: z.string().trim().optional(),
  shortDescription: z.string().trim().optional(),
  shortDescriptionEn: z.string().trim().optional(),
  description: z.string().trim().optional(),
  descriptionEn: z.string().trim().optional(),
  useCases: z.array(z.string()),
  useCasesEn: z.array(z.string()),
  applicationTags: z.array(z.string()),
  applicationTagsEn: z.array(z.string()),
  featured: z.boolean(),
  published: z.boolean(),
  categoryId: z.string().nullable().optional(),
  industryIds: z.array(z.string()),
  images: z.array(z.object({ url: z.string(), alt: z.string().optional() })),
  specs: z.array(z.object({ label: z.string(), labelEn: z.string().optional(), value: z.string() })),
  variants: z.array(variantSchema).refine(
    (variants) => new Set(variants.map((v) => v.packaging.toUpperCase())).size === variants.length,
    "Mỗi quy cách chỉ được nhập một lần"
  ),
});

export type ProductInput = z.infer<typeof productSchema>;

export type ProductActionResult =
  | { ok: true; id: string }
  | { ok: false; errors: Record<string, string[]> };

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

export async function createProduct(input: ProductInput): Promise<ProductActionResult> {
  await requireSession();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;

  const existingSlug = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (existingSlug) return { ok: false, errors: { slug: ["Slug này đã được sử dụng"] } };

  const created = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      brand: data.brand || null,
      // With packagings, prices live on each variant.
        price: data.variants.length > 0 ? null : (data.price ?? null),
      tdsUrl: data.tdsUrl || null,
      msdsUrl: data.msdsUrl || null,
      viscosityGrade: data.viscosityGrade || null,
      shortDescription: data.shortDescription || null,
      shortDescriptionEn: data.shortDescriptionEn || null,
      description: data.description || null,
      descriptionEn: data.descriptionEn || null,
      useCases: data.useCases,
      useCasesEn: data.useCasesEn,
      applicationTags: data.applicationTags,
      applicationTagsEn: data.applicationTagsEn,
      featured: data.featured,
      published: data.published,
      categoryId: data.categoryId || null,
      industries: { connect: data.industryIds.map((id) => ({ id })) },
      images: {
        create: data.images.map((img, i) => ({
          url: img.url,
          alt: img.alt || null,
          sortOrder: i,
        })),
      },
      specs: {
        create: data.specs.map((s, i) => ({
          label: s.label,
          labelEn: s.labelEn || null,
          value: s.value,
          sortOrder: i,
        })),
      },
      variants: {
        create: data.variants.map((v, i) => ({
          packaging: v.packaging,
          price: v.price,
          sortOrder: i,
        })),
      },
    },
  });

  updateTag("products");
  revalidatePath("/admin/san-pham");
  revalidatePath("/san-pham");
  revalidatePath("/");
  return { ok: true, id: created.id };
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<ProductActionResult> {
  await requireSession();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;

  const existingSlug = await prisma.product.findFirst({
    where: { slug: data.slug, NOT: { id } },
  });
  if (existingSlug) return { ok: false, errors: { slug: ["Slug này đã được sử dụng"] } };

  const previous = await prisma.product.findUnique({ where: { id }, select: { slug: true } });
  if (!previous) return { ok: false, errors: { name: ["Sản phẩm không còn tồn tại"] } };

  // Variants are updated in place (not recreated) so the stock and legacy
  // slug the agent API keeps in sync survive an edit in the admin.
  const keptIds = data.variants.flatMap((v) => (v.id ? [v.id] : []));

  await prisma.$transaction([
    prisma.productVariant.deleteMany({ where: { productId: id, id: { notIn: keptIds } } }),
    ...data.variants.map((v, i) =>
      v.id
        ? prisma.productVariant.update({
            where: { id: v.id, productId: id },
            data: { packaging: v.packaging, price: v.price, sortOrder: i },
          })
        : prisma.productVariant.create({
            data: { productId: id, packaging: v.packaging, price: v.price, sortOrder: i },
          })
    ),
    prisma.productImage.deleteMany({ where: { productId: id } }),
    prisma.productSpec.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        brand: data.brand || null,
        // With packagings, prices live on each variant.
        price: data.variants.length > 0 ? null : (data.price ?? null),
        tdsUrl: data.tdsUrl || null,
        msdsUrl: data.msdsUrl || null,
      viscosityGrade: data.viscosityGrade || null,
        shortDescription: data.shortDescription || null,
        shortDescriptionEn: data.shortDescriptionEn || null,
        description: data.description || null,
        descriptionEn: data.descriptionEn || null,
        useCases: data.useCases,
        useCasesEn: data.useCasesEn,
        applicationTags: data.applicationTags,
        applicationTagsEn: data.applicationTagsEn,
        featured: data.featured,
        published: data.published,
        categoryId: data.categoryId || null,
        industries: { set: data.industryIds.map((industryId) => ({ id: industryId })) },
        images: {
          create: data.images.map((img, i) => ({
            url: img.url,
            alt: img.alt || null,
            sortOrder: i,
          })),
        },
        specs: {
          create: data.specs.map((s, i) => ({
            label: s.label,
            labelEn: s.labelEn || null,
            value: s.value,
            sortOrder: i,
          })),
        },
      },
    }),
  ]);

  if (previous.slug !== data.slug) {
    // Keep the old URL working (links, search results, quote emails).
    await recordMove(prisma, `/san-pham/${previous.slug}`, `/san-pham/${data.slug}`);
    updateTag("redirects");
  }

  updateTag("products");
  revalidatePath("/admin/san-pham");
  revalidatePath(`/san-pham/${data.slug}`);
  revalidatePath("/san-pham");
  return { ok: true, id };
}

export async function deleteProduct(id: string): Promise<{ ok: boolean }> {
  await requireSession();
  await prisma.product.delete({ where: { id } });
  updateTag("products");
  revalidatePath("/admin/san-pham");
  revalidatePath("/san-pham");
  revalidatePath("/");
  return { ok: true };
}
