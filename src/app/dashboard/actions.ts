"use server";

import { redirect } from "next/navigation";
import { useCases } from "@/core/di/container";
import { clearSession, readSession } from "@/features/auth/infrastructure/session-cookies";

/**
 * Server Action: revokes the Vexxen session, clears the cookies and returns to the login screen.
 * With `companyName` it lands on that company's branded login (`/login/<company>`).
 */
export async function logout(companyName?: string) {
  const session = await readSession();
  await useCases.logout.execute(session?.refreshToken ?? null);
  await clearSession();
  const company = typeof companyName === "string" ? companyName.trim() : "";
  redirect(company ? `/login/${encodeURIComponent(company)}` : "/login");
}
