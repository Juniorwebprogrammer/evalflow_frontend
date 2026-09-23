import { redirect } from "next/navigation";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { useCases } from "@/core/di/container";
import { AppShell } from "@/shared/components/app-shell";
import { EvaluationCycleDetailView } from "@/features/evaluation-cycles/presentation/components/evaluation-cycle-detail-view";

export default async function CicloEvaluacionDetailPage({
  params,
}: PageProps<"/dashboard/ciclos-evaluacion/[id]">) {
  const session = await readSession();
  if (!session) redirect("/login");

  let profile;
  try {
    profile = await useCases.getMyProfile.execute(session.jwt);
  } catch {
    // Token invalid/expired or backend unreachable → back to login.
    redirect("/login");
  }

  const { id } = await params;

  return (
    <AppShell initialProfile={profile}>
      <div className="mx-auto max-w-6xl px-8 py-7">
        <EvaluationCycleDetailView cycleId={Number(id)} />
      </div>
    </AppShell>
  );
}
