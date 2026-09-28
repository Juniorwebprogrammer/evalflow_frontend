import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/app/dashboard/current-profile";
import { canAccessScreen } from "@/shared/lib/roles";
import { EvaluationCycleDetailView } from "@/features/evaluation-cycles/presentation/components/evaluation-cycle-detail-view";

export default async function CicloEvaluacionDetailPage({
  params,
}: PageProps<"/dashboard/ciclos-evaluacion/[id]">) {
  const profile = await getCurrentProfile();

  if (!canAccessScreen(profile.rol, "/dashboard/ciclos-evaluacion")) redirect("/dashboard");

  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <EvaluationCycleDetailView cycleId={Number(id)} />
    </div>
  );
}
