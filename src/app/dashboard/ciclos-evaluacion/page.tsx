import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/app/dashboard/current-profile";
import { canAccessScreen } from "@/shared/lib/roles";
import { EvaluationCyclesList } from "@/features/evaluation-cycles/presentation/components/evaluation-cycles-list";

export default async function CiclosEvaluacionPage() {
  const profile = await getCurrentProfile();

  if (!canAccessScreen(profile.rol, "/dashboard/ciclos-evaluacion")) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-7xl px-8 py-7">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Ciclos de evaluación</h1>
        <p className="mt-1 text-sm text-slate-500">
          Periodos de evaluación de tu empresa y sus plantillas asociadas
        </p>
      </header>
      <div className="mt-6">
        <EvaluationCyclesList />
      </div>
    </div>
  );
}
