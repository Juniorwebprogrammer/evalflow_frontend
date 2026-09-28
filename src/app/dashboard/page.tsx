import { getCurrentProfile } from "@/app/dashboard/current-profile";
import { DashboardView } from "@/features/dashboard/presentation/components/dashboard-view";

export default async function DashboardPage() {
  // Auth check (redirects to /login); memoized with the layout's call.
  await getCurrentProfile();

  return <DashboardView />;
}
