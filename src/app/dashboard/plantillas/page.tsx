import { redirect } from "next/navigation";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { useCases } from "@/core/di/container";
import { AppShell } from "@/shared/components/app-shell";
import { TemplatesTable } from "@/features/templates/presentation/components/templates-table";

export default async function PlantillasPage() {
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
          <h1 className="text-2xl font-bold text-slate-900">Plantillas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Plantillas de evaluación de tu empresa
          </p>
        </header>
        <div className="mt-6">
          <TemplatesTable />
        </div>
      </div>
    </AppShell>
  );
}
