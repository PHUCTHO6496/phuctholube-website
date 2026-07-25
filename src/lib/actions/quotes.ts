"use server";

import { z } from "zod";
import { after } from "next/server";
import { prisma } from "@/lib/db";
import { sendOwnerNotification, escapeHtml } from "@/lib/email";
import { SITE_URL } from "@/lib/constants";

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

  after(() =>
    sendOwnerNotification(
      `🔔 Yêu cầu báo giá mới từ ${rest.companyName}`,
      `<h2>Yêu cầu báo giá mới</h2>
       <p><strong>Công ty:</strong> ${escapeHtml(rest.companyName)}</p>
       <p><strong>Người liên hệ:</strong> ${escapeHtml(rest.contactName)}</p>
       <p><strong>Điện thoại:</strong> ${escapeHtml(rest.phone)}</p>
       ${email ? `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` : ""}
       ${address ? `<p><strong>Địa chỉ:</strong> ${escapeHtml(address)}</p>` : ""}
       ${note ? `<p><strong>Ghi chú:</strong> ${escapeHtml(note)}</p>` : ""}
       <h3>Sản phẩm yêu cầu báo giá</h3>
       <ul>${items
         .map((i) => `<li>${escapeHtml(i.productName)} — SL: ${escapeHtml(i.quantity)}</li>`)
         .join("")}</ul>
       <p><a href="${SITE_URL}/admin/yeu-cau-bao-gia/${created.id}">Xem chi tiết trong trang quản trị</a></p>`
    )
  );

  return { ok: true, id: created.id };
}
