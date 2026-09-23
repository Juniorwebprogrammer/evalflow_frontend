import { redirect } from "next/navigation";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { useCases } from "@/core/di/container";
import { AppShell } from "@/shared/components/app-shell";
import { SubmissionsView } from "@/features/evaluation-submissions/presentation/components/submissions-view";

export default async function MisEvaluacionesPage() {
  const session = await readSession();
  if (!session) redirect("/login");

  let profile;
  try {
    profile = await useCases.getMyProfile.execute(session.jwt);
  } catch {
    // Token invalid/expired or backend unreachable → back to login.
    redirect("/login");
  }

  return (
    <AppShell initialProfile={profile}>
      <div className="mx-auto max-w-7xl px-8 py-7">
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
    </AppShell>
  );
}
