import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/app/dashboard/current-profile";
import { canAccessScreen } from "@/shared/lib/roles";
import { MyClarificationsView } from "@/features/clarifications/presentation/components/my-clarifications-view";

export default async function SolicitudesInformacionPage() {
  const profile = await getCurrentProfile();

  if (!canAccessScreen(profile.rol, "/dashboard/solicitudes-informacion")) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Information requests</h1>
        <p className="mt-1 text-sm text-slate-500">
          HR is asking you to explain some of the answers in your evaluations
        </p>
      </header>
      <div className="mt-6">
        <MyClarificationsView />
      </div>
    </div>
  );
}
