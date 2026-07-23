"use server";

import { redirect } from "next/navigation";
import { verifyCredentials, createSession, destroySession } from "@/lib/auth";

export type LoginFormState = {
  error?: string;
};

export async function login(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Vui lòng nhập email và mật khẩu" };
  }

  const admin = await verifyCredentials(email, password);
  if (!admin) {
    return { error: "Email hoặc mật khẩu không đúng" };
  }

  await createSession(admin.email);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
