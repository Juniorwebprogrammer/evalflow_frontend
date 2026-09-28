"use server";

import { redirect } from "next/navigation";
import { clearSession } from "@/features/auth/infrastructure/session-cookies";

/**
 * Server Action: clears the session cookies and returns to the login screen.
 * With `companyName` it lands on that company's branded login
 * (`/login/<company>`), so the user doesn't have to look it up again.
 */
export async function logout(companyName?: string) {
  await clearSession();
  const company = typeof companyName === "string" ? companyName.trim() : "";
  redirect(company ? `/login/${encodeURIComponent(company)}` : "/login");
}
