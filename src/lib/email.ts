import "server-only";
import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return transporter;
}

export async function sendOwnerNotification(subject: string, html: string) {
  const t = getTransporter();
  if (!t) {
    console.error(
      "Bỏ qua gửi email thông báo: chưa cấu hình GMAIL_USER / GMAIL_APP_PASSWORD"
    );
    return;
  }

  const from = process.env.GMAIL_USER!;
  const to = process.env.NOTIFY_EMAIL || from;

  try {
    await t.sendMail({
      from: `"Website Phúc Thọ" <${from}>`,
      to,
      subject,
      html,
    });
    console.log("Đã gửi email thông báo:", subject);
  } catch (err) {
    console.error("Gửi email thông báo thất bại:", err);
  }
}

export function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
