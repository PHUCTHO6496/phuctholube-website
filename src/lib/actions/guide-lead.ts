"use server";

import { createHash } from "crypto";
import { z } from "zod";
import { after } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { sendOwnerNotification, escapeHtml } from "@/lib/email";
import { sendGuideEmail } from "@/lib/guide-email";
import { SITE_URL } from "@/lib/constants";

const MAX_PER_IP_PER_HOUR = 5;
const RESEND_WINDOW_MS = 24 * 60 * 60 * 1000;

const guideSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập họ tên")
    .max(100, "Họ tên quá dài"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(200, "Email quá dài")
    .email("Email không hợp lệ"),
  phone: z
    .string()
    .trim()
    .refine((v) => /^\d{9,13}$/.test(v.replace(/[\s.\-()+]/g, "")), "Số điện thoại không hợp lệ"),
  company: z.string().trim().max(150, "Tên công ty quá dài").optional(),
  consent: z.literal("on", { message: "Vui lòng đồng ý để chúng tôi gửi cẩm nang" }),
});

type GuideValues = {
  name: string;
  email: string;
  phone: string;
  company: string;
  consent: boolean;
};

export type GuideFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  email?: string;
  errors?: Record<string, string[] | undefined>;
  values?: GuideValues;
};

async function getIpHash() {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "";
  if (!ip) return null;
  return createHash("sha256")
    .update(`${ip}:${process.env.AUTH_SECRET ?? ""}`)
    .digest("hex")
    .slice(0, 32);
}

export async function requestGuide(
  _prevState: GuideFormState,
  formData: FormData
): Promise<GuideFormState> {
  const values: GuideValues = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    company: String(formData.get("company") ?? ""),
    consent: formData.get("consent") === "on",
  };

  // Honeypot: real visitors never see this field. Pretend success so bots
  // don't learn to skip it.
  if (String(formData.get("website") ?? "").trim()) {
    return { status: "success", email: values.email };
  }

  const parsed = guideSchema.safeParse({
    ...values,
    consent: values.consent ? "on" : undefined,
  });
  if (!parsed.success) {
    return { status: "error", errors: parsed.error.flatten().fieldErrors, values };
  }
  const { name, email, phone } = parsed.data;
  const company = parsed.data.company || null;

  const settings = await getSiteSettings();
  if (!settings.leadGuidePdfUrl) {
    return {
      status: "error",
      message: "Cẩm nang hiện đang được cập nhật. Vui lòng quay lại sau.",
      values,
    };
  }

  const ipHash = await getIpHash();
  if (ipHash) {
    const recent = await prisma.guideLead.count({
      where: { ipHash, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    });
    if (recent >= MAX_PER_IP_PER_HOUR) {
      return {
        status: "error",
        message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.",
        values,
      };
    }
  }

  // Same address already received the guide recently — don't email it again
  // (stops the form being used to spam someone else's inbox).
  const alreadySent = await prisma.guideLead.findFirst({
    where: {
      email,
      emailStatus: "sent",
      createdAt: { gte: new Date(Date.now() - RESEND_WINDOW_MS) },
    },
    select: { id: true },
  });
  if (alreadySent) {
    return {
      status: "success",
      email,
      message: `Cẩm nang đã được gửi tới ${email} trước đó. Vui lòng kiểm tra hộp thư (kể cả mục Spam hoặc Quảng cáo).`,
    };
  }

  const lead = await prisma.guideLead.create({
    data: { name, email, phone, company, ipHash },
    select: { id: true },
  });

  const sent = await sendGuideEmail({
    to: email,
    name,
    company,
    pdfUrl: settings.leadGuidePdfUrl,
    contact: {
      phone: settings.phone,
      email: settings.email,
      zaloUrl: settings.zaloUrl,
      address: settings.address,
    },
  });

  await prisma.guideLead.update({
    where: { id: lead.id },
    data: sent
      ? { emailStatus: "sent", emailSentAt: new Date() }
      : { emailStatus: "failed" },
  });

  after(() =>
    sendOwnerNotification(
      `🎁 Khách nhận cẩm nang: ${name}${company ? ` (${company})` : ""}`,
      `<h2>Khách để lại thông tin nhận cẩm nang dầu nhớt</h2>
       <p><strong>Họ tên:</strong> ${escapeHtml(name)}</p>
       ${company ? `<p><strong>Công ty:</strong> ${escapeHtml(company)}</p>` : ""}
       <p><strong>Điện thoại:</strong> ${escapeHtml(phone)}</p>
       <p><strong>Email:</strong> ${escapeHtml(email)}</p>
       <p><strong>Gửi cẩm nang:</strong> ${
         sent
           ? "✅ Đã gửi thành công"
           : "❌ Gửi thất bại — vui lòng gửi tay hoặc liên hệ khách"
       }</p>
       <p><a href="${SITE_URL}/admin/cam-nang">Xem danh sách trong trang quản trị</a></p>`
    )
  );

  if (!sent) {
    return {
      status: "success",
      email,
      message:
        "Cảm ơn bạn! Hệ thống gửi email đang bận — nhân viên Phúc Thọ sẽ gửi cẩm nang và liên hệ bạn trong thời gian sớm nhất.",
    };
  }

  return { status: "success", email };
}
