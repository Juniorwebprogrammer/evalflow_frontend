import type { ReactNode } from "react";
import type { Profile } from "@/features/profile/domain/profile";
import { Sidebar } from "@/shared/components/sidebar";
import { MobileNav } from "@/shared/components/mobile-nav";
import { RealtimeProvider } from "@/features/realtime/presentation/components/realtime-provider";

/**
 * Authenticated app shell: navigation plus a scrollable main area. Desktop
 * (lg+) gets the side menu; smaller screens get a top bar with a drop-down
 * menu so the screen keeps its full width.
 * Feature pages render their view as `children`. `initialProfile` is fetched
 * server-side by the dashboard layout and seeds the sidebar's profile query, so it shows
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
    // `shrink-0`: <body> is a fixed-height flex column, so without it this
    // div shrinks to the viewport and the sticky sidebar scrolls away with it.
    <div className="flex min-h-screen shrink-0 flex-col bg-slate-100 lg:flex-row">
      <Sidebar initialProfile={initialProfile} />
      <MobileNav initialProfile={initialProfile} />
      <main className="min-w-0 flex-1">
        <RealtimeProvider>{children}</RealtimeProvider>
      </main>
    </div>
  );
}
