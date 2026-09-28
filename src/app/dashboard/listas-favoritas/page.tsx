import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/app/dashboard/current-profile";
import { canAccessScreen } from "@/shared/lib/roles";
import { FavoriteListsGrid } from "@/features/favorite-lists/presentation/components/favorite-lists-grid";

export default async function ListasFavoritasPage() {
  const profile = await getCurrentProfile();

  if (!canAccessScreen(profile.rol, "/dashboard/listas-favoritas")) redirect("/dashboard");

  return (
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
  );
}
