"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

export async function updateContactStatus(id: string, status: string) {
  await requireSession();
  await prisma.contactMessage.update({ where: { id }, data: { status } });
  revalidatePath("/admin/lien-he");
  return { ok: true };
}
