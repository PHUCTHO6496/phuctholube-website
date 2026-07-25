import "server-only";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";

export const ALLOWED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

export async function storeUploadedFile(
  buffer: Buffer,
  originalName: string,
  contentType: string
): Promise<string> {
  const ext = path.extname(originalName) || `.${contentType.split("/")[1]}`;
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;

  // On Vercel, a Blob store token is auto-injected once one is linked to the
  // project — use it so uploads survive across serverless deployments.
  // Locally (no token), fall back to writing into public/uploads for a
  // zero-setup dev experience.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(filename, buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType,
    });
    return blob.url;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return `/uploads/${filename}`;
}
