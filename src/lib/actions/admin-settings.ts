"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  logoUrl: z.string().trim().optional(),
  heroImageUrl: z.string().trim().optional(),
  galleryImages: z.array(z.string().trim().min(1)).max(8),
  statYearsValue: z.string().trim().min(1),
  statYearsLabel: z.string().trim().min(1),
  statVolumeValue: z.string().trim().min(1),
  statVolumeLabel: z.string().trim().min(1),
  statQualityValue: z.string().trim().min(1),
  statQualityLabel: z.string().trim().min(1),
  address: z.string().trim().min(1, "Vui lòng nhập địa chỉ"),
  phone: z.string().trim().min(8, "Số điện thoại không hợp lệ"),
  email: z.string().trim().email("Email không hợp lệ"),
  zaloUrl: z.string().trim().min(1),
  facebookUrl: z.string().trim().optional(),
  linkedinUrl: z.string().trim().optional(),
  hoursMonFri: z.string().trim().min(1),
  hoursSat: z.string().trim().min(1),
  hoursSun: z.string().trim().min(1),
});

export type SettingsInput = z.infer<typeof schema>;
export type SettingsResult =
  | { ok: true }
  | { ok: false; errors: Record<string, string[]> };

export async function updateSiteSettings(input: SettingsInput): Promise<SettingsResult> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  const data = {
    ...parsed.data,
    logoUrl: parsed.data.logoUrl || null,
    heroImageUrl: parsed.data.heroImageUrl || null,
    facebookUrl: parsed.data.facebookUrl || null,
    linkedinUrl: parsed.data.linkedinUrl || null,
  };

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });

  revalidatePath("/", "layout");
  return { ok: true };
}
