"use server";

import { z } from "zod";
import { after } from "next/server";
import { prisma } from "@/lib/db";
import { sendOwnerNotification, escapeHtml } from "@/lib/email";
import { SITE_URL } from "@/lib/constants";
import { compare, EQUIPMENT_KINDS, type EquipmentKind } from "@/lib/cost-calculator";

const num = z.coerce.number().finite().min(0).max(1e12);
const optionSchema = z.object({
  product: z.string().max(200),
  price: num,
  interval: num,
  topUp: num,
  failures: num,
  energySaving: num.max(100),
});
const inputsSchema = z.object({
  kind: z.enum(EQUIPMENT_KINDS),
  shared: z.object({
    units: num,
    usage: num,
    fill: num,
    laborRate: num,
    downtimeRate: num,
    partsPerChange: num,
    hoursPerChange: num,
    repairCost: num,
    repairHours: num,
    energyUse: num,
    energyPrice: num,
  }),
  current: optionSchema,
  proposed: optionSchema,
});
const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(200).optional(),
  phone: z.string().trim().regex(/^[0-9+\s().-]{8,20}$/),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  note: z.string().trim().max(2000).optional(),
});

export type CostEstimateState = {
  status: "idle" | "success" | "error";
  errors?: Partial<Record<"name" | "phone" | "email" | "inputs", true>>;
};

const KIND_LABEL: Record<EquipmentKind, string> = {
  compressor: "Máy nén khí",
  gearbox: "Hộp số công nghiệp",
  hydraulic: "Hệ thống thủy lực",
  grease: "Mỡ bôi trơn ổ đỡ",
  fleet: "Đội xe (dầu động cơ diesel)",
};

const vnd = (v: number) => `${Math.round(v).toLocaleString("vi-VN")} đ`;

/** Customer sends the calculator's inputs to Phúc Thọ; saved as a contact message. */
export async function submitCostEstimate(
  _prev: CostEstimateState,
  formData: FormData
): Promise<CostEstimateState> {
  // Bots fill every field, people don't see this one.
  if (formData.get("website")) return { status: "success" };

  let rawInputs: unknown;
  try {
    rawInputs = JSON.parse(String(formData.get("inputs") ?? ""));
  } catch {
    return { status: "error", errors: { inputs: true } };
  }
  const inputs = inputsSchema.safeParse(rawInputs);
  const contact = contactSchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company") || undefined,
    phone: formData.get("phone"),
    email: formData.get("email") || "",
    note: formData.get("note") || undefined,
  });
  if (!inputs.success || !contact.success) {
    const fields = contact.success ? {} : contact.error.flatten().fieldErrors;
    return {
      status: "error",
      errors: {
        ...(inputs.success ? {} : { inputs: true }),
        ...(fields.name ? { name: true } : {}),
        ...(fields.phone ? { phone: true } : {}),
        ...(fields.email ? { email: true } : {}),
      },
    };
  }

  const { kind, shared, current, proposed } = inputs.data;
  const slugs = [current.product, proposed.product].filter(Boolean);
  const names = new Map(
    (await prisma.product.findMany({ where: { slug: { in: slugs } }, select: { slug: true, name: true } })).map(
      (p) => [p.slug, p.name]
    )
  );
  const productName = (slug: string) => (slug ? (names.get(slug) ?? slug) : "(không chọn sản phẩm)");
  // Recomputed here rather than trusting numbers sent from the browser.
  const result = compare(kind, shared, current, proposed);
  const unit = kind === "fleet" ? "km" : "giờ";
  const num = (v: number) => v.toLocaleString("vi-VN");
  const fill =
    kind === "grease"
      ? `Lượng mỡ mỗi lần tra: ${num(shared.fill)} kg`
      : kind === "fleet"
        ? `Dung tích dầu động cơ: ${num(shared.fill)} lít`
        : `Lượng dầu mỗi lần thay: ${num(shared.fill)} lít`;
  const every = kind === "grease" ? "tra mỡ mỗi" : "thay mỗi";
  const c = contact.data;

  const lines = [
    `[Công cụ tính chi phí dầu nhớt] ${KIND_LABEL[kind]}`,
    c.company ? `Công ty: ${c.company}` : null,
    `Số ${kind === "fleet" ? "xe" : "thiết bị"}: ${num(shared.units)} · Vận hành: ${num(shared.usage)} ${unit}/năm · ${fill}`,
    `Hiện tại: ${productName(current.product)} · giá ${vnd(current.price)} · ${every} ${num(current.interval)} ${unit}`,
    `So sánh: ${productName(proposed.product)} · giá ${vnd(proposed.price)} · ${every} ${num(proposed.interval)} ${unit}`,
    `Tổng chi phí/năm: hiện tại ${vnd(result.currentFleet)} · so sánh ${vnd(result.proposedFleet)} · chênh lệch ${vnd(result.savingFleet)} (${result.savingPct.toFixed(1)}%)`,
    c.note ? `Ghi chú: ${c.note}` : null,
  ].filter(Boolean) as string[];

  await prisma.contactMessage.create({
    data: { name: c.name, phone: c.phone, email: c.email || null, message: lines.join("\n") },
  });

  after(() =>
    sendOwnerNotification(
      `🧮 Yêu cầu tư vấn chi phí dầu nhớt: ${c.name}`,
      `<h2>Khách gửi kết quả tính chi phí dầu nhớt</h2>
       <p><strong>Họ tên:</strong> ${escapeHtml(c.name)}<br>
       <strong>Điện thoại:</strong> ${escapeHtml(c.phone)}
       ${c.email ? `<br><strong>Email:</strong> ${escapeHtml(c.email)}` : ""}</p>
       ${lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}
       <p><a href="${SITE_URL}/admin/lien-he">Xem trong trang quản trị</a></p>`
    )
  );

  return { status: "success" };
}
