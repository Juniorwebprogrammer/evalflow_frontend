import { redirect } from "next/navigation";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { useCases } from "@/core/di/container";
import { AppShell } from "@/shared/components/app-shell";
import { canAccessScreen } from "@/shared/lib/roles";
import { TemplateDetailView } from "@/features/templates/presentation/components/template-detail-view";

export default async function PlantillaDetailPage({
  params,
}: PageProps<"/dashboard/plantillas/[id]">) {
  const session = await readSession();
  if (!session) redirect("/login");

  let profile;
  try {
    profile = await useCases.getMyProfile.execute(session.jwt);
  } catch {
    // Token invalid/expired or backend unreachable → back to login.
    redirect("/login");
  }

  if (!canAccessScreen(profile.rol, "/dashboard/plantillas")) redirect("/dashboard");

  const { id } = await params;

  return (
    <AppShell initialProfile={profile}>
      <div className="mx-auto max-w-6xl px-8 py-7">
        <TemplateDetailView templateId={Number(id)} />
      </div>
    </AppShell>
  );
}
