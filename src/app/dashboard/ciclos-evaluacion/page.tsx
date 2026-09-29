import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/app/dashboard/current-profile";
import { canAccessScreen } from "@/shared/lib/roles";
import { EvaluationCyclesList } from "@/features/evaluation-cycles/presentation/components/evaluation-cycles-list";

export default async function CiclosEvaluacionPage() {
  const profile = await getCurrentProfile();

  if (!canAccessScreen(profile.rol, "/dashboard/ciclos-evaluacion")) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Evaluation cycles</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your company&apos;s evaluation periods and their templates
        </p>
      </header>
      <div className="mt-6">
        <EvaluationCyclesList />
      </div>
    </div>
  );
}
