import { redirect } from "next/navigation";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { useCases } from "@/core/di/container";
import { AppShell } from "@/shared/components/app-shell";
import { canAccessScreen } from "@/shared/lib/roles";
import { UsersView } from "@/features/team/presentation/components/users-view";

export default async function UsuariosPage() {
  const session = await readSession();
  if (!session) redirect("/login");

  let profile;
  try {
    profile = await useCases.getMyProfile.execute(session.jwt);
  } catch {
    // Token invalid/expired or backend unreachable → back to login.
    redirect("/login");
  }

  if (!canAccessScreen(profile.rol, "/dashboard/usuarios")) redirect("/dashboard");

  return (
    <AppShell initialProfile={profile}>
      <UsersView />
    </AppShell>
  );
}
