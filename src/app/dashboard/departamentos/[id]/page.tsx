import { redirect } from "next/navigation";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { useCases } from "@/core/di/container";
import { AppShell } from "@/shared/components/app-shell";
import { canAccessScreen } from "@/shared/lib/roles";
import { DepartmentDetailView } from "@/features/departments/presentation/components/department-detail-view";

export default async function DepartamentoDetailPage({
  params,
}: PageProps<"/dashboard/departamentos/[id]">) {
  const session = await readSession();
  if (!session) redirect("/login");

  let profile;
  try {
    profile = await useCases.getMyProfile.execute(session.jwt);
  } catch {
    // Token invalid/expired or backend unreachable → back to login.
    redirect("/login");
  }

  if (!canAccessScreen(profile.rol, "/dashboard/departamentos")) redirect("/dashboard");

  const { id } = await params;

  return (
    <AppShell initialProfile={profile}>
      <div className="mx-auto max-w-6xl px-8 py-7">
        <DepartmentDetailView departmentId={Number(id)} />
      </div>
    </AppShell>
  );
}
