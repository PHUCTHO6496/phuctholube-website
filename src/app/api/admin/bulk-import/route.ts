import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db";

// Temporary one-off endpoint for bulk-importing brand images and Shell
// TDS/MSDS documents from local files. Runs upload+DB writes server-side
// since it needs the real BLOB_READ_WRITE_TOKEN, which Vercel deliberately
// never exposes outside its own build/runtime for Sensitive env vars.
// Remove this route once the import is done.

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-import-secret");
  if (!secret || secret !== process.env.BULK_IMPORT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const kind = formData.get("kind");
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (kind === "brand-image") {
    const brand = formData.get("brand");
    if (typeof brand !== "string") {
      return NextResponse.json({ error: "Missing brand" }, { status: 400 });
    }
    const ext = file.name.split(".").pop() ?? "jpg";
    const blob = await put(`brand-images/${brand.toLowerCase()}.${ext}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    const products = await prisma.product.findMany({
      where: { brand, images: { none: {} } },
      select: { id: true, name: true },
    });
    for (const p of products) {
      await prisma.productImage.create({
        data: { productId: p.id, url: blob.url, alt: p.name, sortOrder: 0 },
      });
    }
    return NextResponse.json({ url: blob.url, assignedCount: products.length });
  }

  if (kind === "tds" || kind === "msds") {
    const slug = formData.get("slug");
    if (typeof slug !== "string") {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }
    const blob = await put(`docs/${kind}/${slug}.pdf`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    const field = kind === "tds" ? "tdsUrl" : "msdsUrl";
    await prisma.product.update({ where: { slug }, data: { [field]: blob.url } });
    return NextResponse.json({ url: blob.url });
  }

  return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
}
