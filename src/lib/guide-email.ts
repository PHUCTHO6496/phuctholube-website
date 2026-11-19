import "server-only";
import { readFile } from "fs/promises";
import path from "path";
import { sendCustomerEmail, escapeHtml } from "@/lib/email";
import { formatPhoneDisplay } from "@/lib/format";
import { SITE_URL } from "@/lib/constants";
import { personalizeGuidePdf } from "@/lib/guide-pdf";

const PDF_FILENAME = "Cam-nang-dau-nhot-Phuc-Tho.pdf";
const PRODUCTS_URL = `${SITE_URL}/san-pham`;

export type GuideContact = {
  phone: string;
  email: string;
  zaloUrl: string;
  address: string;
};

// Kept per warm server instance so repeat sends don't re-download the file
// from Blob storage (Blob data transfer is metered). A new upload has a new
// URL, which naturally invalidates this.
let cachedPdf: { url: string; bytes: Buffer } | null = null;

async function loadPdf(url: string): Promise<Buffer> {
  if (cachedPdf?.url === url) return cachedPdf.bytes;

  let bytes: Buffer;
  if (url.startsWith("/")) {
    // Local dev without a Blob token stores uploads under public/ (see storage.ts).
    bytes = await readFile(path.join(process.cwd(), "public", url));
  } else {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    bytes = Buffer.from(await res.arrayBuffer());
  }
  cachedPdf = { url, bytes };
  return bytes;
}

async function buildAttachment(pdf: Buffer, name: string, company: string | null) {
  try {
    const personalized = await personalizeGuidePdf(pdf, company ? `${name} · ${company}` : name);
    if (personalized) return Buffer.from(personalized);
  } catch (err) {
    // Never block the gift on the cosmetic step — send the original file.
    console.error("Không điền được tên khách vào cẩm nang, gửi file gốc:", err);
  }
  return pdf;
}

export function buildGuideEmail(name: string, contact: GuideContact) {
  const phoneDisplay = formatPhoneDisplay(contact.phone);
  const safeName = escapeHtml(name);
  const subject = "Cẩm nang bảo quản & vận hành dầu nhớt - Quà tặng từ Dầu Nhớt Phúc Thọ";

  const html = `<!doctype html>
<html lang="vi">
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#334155;">
  <div style="display:none;max-height:0;overflow:hidden;">Cẩm nang được đính kèm trong email này dưới dạng file PDF.</div>
  <div style="max-width:560px;margin:0 auto;padding:24px 12px;">
    <div style="background:#1e3a8a;border-radius:12px 12px 0 0;padding:20px 24px;">
      <p style="margin:0;font-size:18px;font-weight:bold;color:#ffffff;">Dầu Nhớt Phúc Thọ</p>
      <p style="margin:4px 0 0;font-size:13px;color:#fbbf24;">Cẩm nang bảo quản &amp; vận hành dầu nhớt công nghiệp</p>
    </div>
    <div style="background:#ffffff;border-radius:0 0 12px 12px;padding:24px;font-size:15px;line-height:1.6;">
      <p style="margin:0 0 12px;">Chào Anh/Chị <strong>${safeName}</strong>,</p>
      <p style="margin:0 0 12px;">Cảm ơn Anh/Chị đã quan tâm đến Dầu Nhớt Phúc Thọ. <strong>Cẩm nang bảo quản và vận hành dầu nhớt công nghiệp được đính kèm trong email này</strong> (file PDF).</p>
      <p style="margin:0 0 12px;">Cẩm nang tóm lược các việc cần làm từ khâu nhận hàng, cất giữ, châm dầu đến theo dõi vận hành và lấy mẫu dầu, kèm bộ biểu mẫu in sẵn để đội bảo trì dùng ngay tại hiện trường.</p>
      <p style="margin:0 0 8px;">Nếu cần tư vấn chọn dầu nhớt phù hợp cho thiết bị của mình, đội ngũ kỹ thuật Phúc Thọ luôn sẵn sàng hỗ trợ:</p>
      <ul style="margin:0 0 20px;padding-left:20px;">
        <li>Hotline: <a href="tel:${escapeHtml(contact.phone)}" style="color:#1e3a8a;font-weight:bold;">${escapeHtml(phoneDisplay)}</a></li>
        <li>Zalo: <a href="${escapeHtml(contact.zaloUrl)}" style="color:#1e3a8a;">${escapeHtml(contact.zaloUrl)}</a></li>
        <li>Email: <a href="mailto:${escapeHtml(contact.email)}" style="color:#1e3a8a;">${escapeHtml(contact.email)}</a></li>
      </ul>
      <p style="margin:0 0 24px;text-align:center;">
        <a href="${PRODUCTS_URL}" style="display:inline-block;background:#f59e0b;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:6px;">Xem sản phẩm dầu nhớt</a>
      </p>
      <p style="margin:0;">Trân trọng,<br><strong>Dầu Nhớt Phúc Thọ</strong></p>
      <p style="margin:4px 0 0;font-size:13px;color:#64748b;">${escapeHtml(contact.address)}</p>
    </div>
  </div>
</body>
</html>`;

  const text = [
    `Chào Anh/Chị ${name},`,
    "",
    "Cảm ơn Anh/Chị đã quan tâm đến Dầu Nhớt Phúc Thọ. Cẩm nang bảo quản và vận hành dầu nhớt công nghiệp được đính kèm trong email này (file PDF).",
    "",
    "Cẩm nang tóm lược các việc cần làm từ khâu nhận hàng, cất giữ, châm dầu đến theo dõi vận hành và lấy mẫu dầu, kèm bộ biểu mẫu in sẵn để đội bảo trì dùng ngay tại hiện trường.",
    "",
    "Nếu cần tư vấn chọn dầu nhớt phù hợp cho thiết bị của mình, đội ngũ kỹ thuật Phúc Thọ luôn sẵn sàng hỗ trợ:",
    `- Hotline: ${phoneDisplay}`,
    `- Zalo: ${contact.zaloUrl}`,
    `- Email: ${contact.email}`,
    "",
    `Xem sản phẩm dầu nhớt: ${PRODUCTS_URL}`,
    "",
    "Trân trọng,",
    "Dầu Nhớt Phúc Thọ",
    contact.address,
  ].join("\n");

  return { subject, html, text };
}

export async function sendGuideEmail({
  to,
  name,
  company,
  pdfUrl,
  contact,
}: {
  to: string;
  name: string;
  company: string | null;
  pdfUrl: string;
  contact: GuideContact;
}): Promise<boolean> {
  let pdf: Buffer;
  try {
    pdf = await loadPdf(pdfUrl);
  } catch (err) {
    console.error("Không tải được file cẩm nang để đính kèm:", err);
    return false;
  }

  const { subject, html, text } = buildGuideEmail(name, contact);
  return sendCustomerEmail({
    to,
    subject,
    html,
    text,
    replyTo: contact.email,
    attachments: [
      {
        filename: PDF_FILENAME,
        content: await buildAttachment(pdf, name, company),
        contentType: "application/pdf",
      },
    ],
  });
}
