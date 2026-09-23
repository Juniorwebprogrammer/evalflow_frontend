import { redirect } from "next/navigation";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { useCases } from "@/core/di/container";
import { AppShell } from "@/shared/components/app-shell";
import { CycleComparisonsView } from "@/features/evaluation-comparisons/presentation/components/cycle-comparisons-view";

export default async function CicloEvaluacionComparacionPage({
  params,
}: PageProps<"/dashboard/ciclos-evaluacion/[id]/comparacion">) {
  const session = await readSession();
  if (!session) redirect("/login");

  let profile;
  try {
    profile = await useCases.getMyProfile.execute(session.jwt);
  } catch {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <AppShell initialProfile={profile}>
      <div className="mx-auto max-w-6xl px-8 py-7">
        <CycleComparisonsView cycleId={Number(id)} />
      </div>
    </AppShell>
  );
}
