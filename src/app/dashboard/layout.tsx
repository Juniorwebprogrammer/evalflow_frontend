import type { ReactNode } from "react";
import { AppShell } from "@/shared/components/app-shell";
import { getCurrentProfile } from "@/app/dashboard/current-profile";

/**
 * Shared shell for every dashboard screen. Living in the layout (instead of
 * each page) keeps the sidebar mounted across navigations, so `loading.tsx`
 * only swaps the main area while the next page loads.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();
  return <AppShell initialProfile={profile}>{children}</AppShell>;
}
