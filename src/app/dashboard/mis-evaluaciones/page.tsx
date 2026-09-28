import { getCurrentProfile } from "@/app/dashboard/current-profile";
import { SubmissionsView } from "@/features/evaluation-submissions/presentation/components/submissions-view";

export default async function MisEvaluacionesPage() {
  // Auth check (redirects to /login); memoized with the layout's call.
  await getCurrentProfile();

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Mis evaluaciones</h1>
        <p className="mt-1 text-sm text-slate-500">
          Formularios de evaluación que tienes pendientes o ya completaste
        </p>
      </header>
      <div className="mt-6">
        <SubmissionsView />
      </div>
    </div>
  );
}
