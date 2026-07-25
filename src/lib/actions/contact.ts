"use server";

import { z } from "zod";
import { after } from "next/server";
import { prisma } from "@/lib/db";
import { sendOwnerNotification, escapeHtml } from "@/lib/email";
import { SITE_URL } from "@/lib/constants";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập họ tên"),
  phone: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .email("Email không hợp lệ")
    .optional()
    .or(z.literal("")),
  message: z.string().trim().min(5, "Vui lòng nhập nội dung liên hệ"),
});

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      message: parsed.data.message,
    },
  });

  after(() =>
    sendOwnerNotification(
      `🔔 Liên hệ mới từ ${parsed.data.name}`,
      `<h2>Liên hệ mới từ website</h2>
       <p><strong>Họ tên:</strong> ${escapeHtml(parsed.data.name)}</p>
       ${parsed.data.phone ? `<p><strong>Điện thoại:</strong> ${escapeHtml(parsed.data.phone)}</p>` : ""}
       ${parsed.data.email ? `<p><strong>Email:</strong> ${escapeHtml(parsed.data.email)}</p>` : ""}
       <p><strong>Nội dung:</strong></p>
       <p>${escapeHtml(parsed.data.message)}</p>
       <p><a href="${SITE_URL}/admin/lien-he">Xem trong trang quản trị</a></p>`
    )
  );

  return {
    status: "success",
    message: "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.",
  };
}
