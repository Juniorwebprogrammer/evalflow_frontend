import type { ReactNode } from "react";
import type { Profile } from "@/features/profile/domain/profile";
import { Sidebar } from "@/shared/components/sidebar";
import { RealtimeProvider } from "@/features/realtime/presentation/components/realtime-provider";

/**
 * Authenticated app shell: the sidebar navigation plus a scrollable main area.
 * Feature pages render their view as `children`. `initialProfile` is fetched
 * server-side by the page and seeds the sidebar's profile query, so it shows
 * the actual signed-in user (name + avatar initials) with no loading flash.
 */
export function AppShell({
  initialProfile,
  children,
}: {
  initialProfile: Profile;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar initialProfile={initialProfile} />
      <main className="flex-1 overflow-y-auto">
        <RealtimeProvider>{children}</RealtimeProvider>
      </main>
    </div>
  );
}
