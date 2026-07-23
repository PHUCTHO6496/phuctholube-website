"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

export async function updateQuoteStatus(id: string, status: string) {
  await requireSession();
  await prisma.quoteRequest.update({ where: { id }, data: { status } });
  revalidatePath("/admin/yeu-cau-bao-gia");
  revalidatePath(`/admin/yeu-cau-bao-gia/${id}`);
  return { ok: true };
}
