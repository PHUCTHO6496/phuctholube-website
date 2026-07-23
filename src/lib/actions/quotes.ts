"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";

const quoteItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.string().trim().min(1, "Vui lòng nhập số lượng"),
});

const quoteRequestSchema = z.object({
  companyName: z.string().trim().min(2, "Vui lòng nhập tên công ty"),
  contactName: z.string().trim().min(2, "Vui lòng nhập họ tên người liên hệ"),
  phone: z.string().trim().min(8, "Số điện thoại không hợp lệ"),
  email: z
    .string()
    .trim()
    .email("Email không hợp lệ")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().optional(),
  note: z.string().trim().optional(),
  items: z.array(quoteItemSchema).min(1, "Giỏ báo giá đang trống"),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

export type QuoteRequestResult =
  | { ok: true; id: string }
  | { ok: false; errors: Record<string, string[]> };

export async function submitQuoteRequest(
  input: QuoteRequestInput
): Promise<QuoteRequestResult> {
  const parsed = quoteRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { items, email, address, note, ...rest } = parsed.data;

  const created = await prisma.quoteRequest.create({
    data: {
      ...rest,
      email: email || null,
      address: address || null,
      note: note || null,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
        })),
      },
    },
  });

  return { ok: true, id: created.id };
}
