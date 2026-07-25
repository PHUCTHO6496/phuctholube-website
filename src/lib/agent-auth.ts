import "server-only";
import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function isAuthorizedAgent(request: NextRequest): boolean {
  const key = process.env.AGENT_API_KEY;
  if (!key) return false;

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;

  return safeEqual(header.slice(7), key);
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
