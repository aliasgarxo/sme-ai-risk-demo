"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Default credentials — override with env vars in Vercel
// ADMIN_EMAIL, ADMIN_PASSWORD, USER_EMAIL, USER_PASSWORD
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? "admin@sme.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";
const USER_EMAIL     = process.env.USER_EMAIL     ?? "demo@sme.com";
const USER_PASSWORD  = process.env.USER_PASSWORD  ?? "demo123";

export async function login(formData: FormData) {
  const email    = (formData.get("email")    as string ?? "").trim().toLowerCase();
  const password = (formData.get("password") as string ?? "").trim();

  const cookieStore = await cookies();

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    cookieStore.set("app_role", "admin", { path: "/", httpOnly: true, sameSite: "lax" });
    redirect("/admin/dashboard");
  }

  if (email === USER_EMAIL && password === USER_PASSWORD) {
    cookieStore.set("app_role", "user", { path: "/", httpOnly: true, sameSite: "lax" });
    redirect("/dashboard");
  }

  return { error: "Invalid email or password." };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set("app_role", "", { path: "/", maxAge: 0 });
  redirect("/login");
}
