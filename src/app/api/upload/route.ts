import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_SIZE, storeUploadedFile } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Không có tệp nào được gửi lên" }, { status: 400 });
  }
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Định dạng không hỗ trợ (chỉ chấp nhận JPG, PNG, WEBP, GIF, PDF)" },
      { status: 400 }
    );
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    return NextResponse.json({ error: "Tệp vượt quá 10MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await storeUploadedFile(buffer, file.name, file.type);

  return NextResponse.json({ url });
}
