import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAuthorizedAgent, unauthorizedResponse } from "@/lib/agent-auth";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_SIZE, storeUploadedFile } from "@/lib/storage";

const schema = z.object({
  filename: z.string().trim().optional(),
  contentBase64: z.string().trim().optional(),
  contentType: z.string().trim().optional(),
  imageUrl: z.string().trim().url().optional(),
});

export async function POST(request: NextRequest) {
  if (!isAuthorizedAgent(request)) return unauthorizedResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body phải là JSON hợp lệ" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const { filename, contentBase64, contentType, imageUrl } = parsed.data;

  if (!contentBase64 && !imageUrl) {
    return NextResponse.json(
      { error: "Cần cung cấp contentBase64 (kèm contentType) hoặc imageUrl" },
      { status: 422 }
    );
  }
  if (contentBase64 && imageUrl) {
    return NextResponse.json(
      { error: "Chỉ cung cấp một trong hai: contentBase64 hoặc imageUrl" },
      { status: 422 }
    );
  }

  let buffer: Buffer;
  let resolvedType: string;

  if (contentBase64) {
    if (!contentType) {
      return NextResponse.json(
        { error: "Thiếu contentType khi dùng contentBase64" },
        { status: 422 }
      );
    }
    if (!ALLOWED_UPLOAD_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: `contentType không hỗ trợ. Chỉ chấp nhận: ${ALLOWED_UPLOAD_TYPES.join(", ")}` },
        { status: 422 }
      );
    }
    try {
      buffer = Buffer.from(contentBase64, "base64");
    } catch {
      return NextResponse.json({ error: "contentBase64 không hợp lệ" }, { status: 422 });
    }
    resolvedType = contentType;
  } else {
    let res: Response;
    try {
      res = await fetch(imageUrl!);
    } catch {
      return NextResponse.json({ error: "Không tải được imageUrl" }, { status: 422 });
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: `Không tải được imageUrl (HTTP ${res.status})` },
        { status: 422 }
      );
    }
    const headerType = res.headers.get("content-type")?.split(";")[0].trim();
    if (!headerType || !ALLOWED_UPLOAD_TYPES.includes(headerType)) {
      return NextResponse.json(
        { error: `Loại nội dung từ imageUrl không hỗ trợ (${headerType ?? "không xác định"})` },
        { status: 422 }
      );
    }
    buffer = Buffer.from(await res.arrayBuffer());
    resolvedType = headerType;
  }

  if (buffer.length === 0) {
    return NextResponse.json({ error: "Tệp rỗng" }, { status: 422 });
  }
  if (buffer.length > MAX_UPLOAD_SIZE) {
    return NextResponse.json({ error: "Tệp vượt quá 10MB" }, { status: 422 });
  }

  const url = await storeUploadedFile(
    buffer,
    filename ?? `agent-upload.${resolvedType.split("/")[1]}`,
    resolvedType
  );

  return NextResponse.json({ url });
}
