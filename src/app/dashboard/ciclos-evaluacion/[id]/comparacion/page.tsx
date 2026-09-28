import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/app/dashboard/current-profile";
import { canAccessScreen } from "@/shared/lib/roles";
import { CycleComparisonsView } from "@/features/evaluation-comparisons/presentation/components/cycle-comparisons-view";

export default async function CicloEvaluacionComparacionPage({
  params,
}: PageProps<"/dashboard/ciclos-evaluacion/[id]/comparacion">) {
  const profile = await getCurrentProfile();

  if (!canAccessScreen(profile.rol, "/dashboard/ciclos-evaluacion")) redirect("/dashboard");

  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <CycleComparisonsView cycleId={Number(id)} />
    </div>
  );
}
