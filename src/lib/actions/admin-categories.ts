"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập tên"),
  slug: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập slug")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  description: z.string().trim().optional(),
  image: z.string().trim().optional(),
  sortOrder: z.number(),
});

export type TaxonomyInput = z.infer<typeof schema>;
export type TaxonomyResult =
  | { ok: true; id: string }
  | { ok: false; errors: Record<string, string[]> };

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

export async function createCategory(input: TaxonomyInput): Promise<TaxonomyResult> {
  await requireSession();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  const existing = await prisma.productCategory.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { ok: false, errors: { slug: ["Slug này đã được sử dụng"] } };

  const created = await prisma.productCategory.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      image: parsed.data.image || null,
      sortOrder: parsed.data.sortOrder,
    },
  });

  revalidatePath("/admin/danh-muc");
  revalidatePath("/san-pham");
  return { ok: true, id: created.id };
}

export async function updateCategory(id: string, input: TaxonomyInput): Promise<TaxonomyResult> {
  await requireSession();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  const existing = await prisma.productCategory.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  });
  if (existing) return { ok: false, errors: { slug: ["Slug này đã được sử dụng"] } };

  await prisma.productCategory.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      image: parsed.data.image || null,
      sortOrder: parsed.data.sortOrder,
    },
  });

  revalidatePath("/admin/danh-muc");
  revalidatePath("/san-pham");
  return { ok: true, id };
}

export async function deleteCategory(id: string): Promise<{ ok: boolean }> {
  await requireSession();
  await prisma.productCategory.delete({ where: { id } });
  revalidatePath("/admin/danh-muc");
  return { ok: true };
}
