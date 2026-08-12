"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

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
      price: data.price ?? null,
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
    },
  });

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

  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId: id } }),
    prisma.productSpec.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        brand: data.brand || null,
        price: data.price ?? null,
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

  revalidatePath("/admin/san-pham");
  revalidatePath(`/san-pham/${data.slug}`);
  revalidatePath("/san-pham");
  return { ok: true, id };
}

export async function deleteProduct(id: string): Promise<{ ok: boolean }> {
  await requireSession();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/san-pham");
  revalidatePath("/san-pham");
  revalidatePath("/");
  return { ok: true };
}
