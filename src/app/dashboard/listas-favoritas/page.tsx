import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/app/dashboard/current-profile";
import { canAccessScreen } from "@/shared/lib/roles";
import { FavoriteListsGrid } from "@/features/favorite-lists/presentation/components/favorite-lists-grid";

export default async function ListasFavoritasPage() {
  const profile = await getCurrentProfile();

  if (!canAccessScreen(profile.rol, "/dashboard/listas-favoritas")) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Favorite lists</h1>
        <p className="mt-1 text-sm text-slate-500">
          Organize your favorite templates into personal lists
        </p>
      </header>
      <div className="mt-6">
        <FavoriteListsGrid />
      </div>
    </div>
  );
}
