import "server-only";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";
import sharp from "sharp";

export const ALLOWED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

// Photos coming out of phone cameras or AI image generators routinely land
// well above what any layout on the site displays them at (see next.config.ts
// image sizes). Shrinking + re-compressing at upload time keeps both Blob
// storage and Blob Data Transfer (billed per byte served, including on
// cache-miss origin fetches) far smaller without a visible quality loss.
// GIFs are left untouched to avoid flattening animation.
const RESIZABLE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_DIMENSION = 2000;

async function optimizeImage(buffer: Buffer, contentType: string): Promise<Buffer> {
  if (!RESIZABLE_IMAGE_TYPES.has(contentType)) return buffer;

  try {
    const image = sharp(buffer).rotate(); // auto-orient from EXIF, then strip metadata
    const resized = image.resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });

    switch (contentType) {
      case "image/jpeg":
        return await resized.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
      case "image/webp":
        return await resized.webp({ quality: 82 }).toBuffer();
      case "image/png":
        return await resized.png({ compressionLevel: 9 }).toBuffer();
      default:
        return buffer;
    }
  } catch {
    // Malformed or unusual image data — fall back to storing it as-is
    // rather than failing the whole upload over an optimization step.
    return buffer;
  }
}

export async function storeUploadedFile(
  buffer: Buffer,
  originalName: string,
  contentType: string
): Promise<string> {
  const optimized = await optimizeImage(buffer, contentType);

  const ext = path.extname(originalName) || `.${contentType.split("/")[1]}`;
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;

  // On Vercel, a Blob store token is auto-injected once one is linked to the
  // project — use it so uploads survive across serverless deployments.
  // Locally (no token), fall back to writing into public/uploads for a
  // zero-setup dev experience.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(filename, optimized, {
      access: "public",
      addRandomSuffix: false,
      contentType,
    });
    return blob.url;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), optimized);

  return `/uploads/${filename}`;
}
