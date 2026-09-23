import { redirect } from "next/navigation";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { useCases } from "@/core/di/container";
import { AppShell } from "@/shared/components/app-shell";
import { FavoriteListsGrid } from "@/features/favorite-lists/presentation/components/favorite-lists-grid";

export default async function ListasFavoritasPage() {
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
          <h1 className="text-2xl font-bold text-slate-900">Listas favoritas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Organiza tus plantillas favoritas en listas personales
          </p>
        </header>
        <div className="mt-6">
          <FavoriteListsGrid />
        </div>
      </div>
    </AppShell>
  );
}
