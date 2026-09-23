"use server";

import { redirect } from "next/navigation";
import { clearSession } from "@/features/auth/infrastructure/session-cookies";

/** Server Action: clears the session cookies and returns to the login screen. */
export async function logout() {
  await clearSession();
  redirect("/login");
}
