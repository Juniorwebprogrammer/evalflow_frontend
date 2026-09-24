import { redirect } from "next/navigation";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { useCases } from "@/core/di/container";
import { AppShell } from "@/shared/components/app-shell";
import { MyEvaluationResultsView } from "@/features/evaluation-results/presentation/components/my-evaluation-results-view";

export default async function ResultadosEvaluacionPage() {
  const session = await readSession();
  if (!session) redirect("/login");

  let profile;
  try {
    profile = await useCases.getMyProfile.execute(session.jwt);
  } catch {
    redirect("/login");
  }

  return (
    <AppShell initialProfile={profile}>
      <div className="mx-auto max-w-5xl px-8 py-7">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">Resultados de evaluación</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tus evaluaciones completadas y sus informes en PDF
          </p>
        </header>
        <div className="mt-6">
          <MyEvaluationResultsView />
        </div>
      </div>
    </AppShell>
  );
}
