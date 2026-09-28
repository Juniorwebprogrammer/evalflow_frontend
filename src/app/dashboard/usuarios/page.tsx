import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/app/dashboard/current-profile";
import { canAccessScreen } from "@/shared/lib/roles";
import { UsersView } from "@/features/team/presentation/components/users-view";

export default async function UsuariosPage() {
  const profile = await getCurrentProfile();

  if (!canAccessScreen(profile.rol, "/dashboard/usuarios")) redirect("/dashboard");

  return <UsersView />;
}
