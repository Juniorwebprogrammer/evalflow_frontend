import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/app/dashboard/current-profile";
import { canAccessScreen } from "@/shared/lib/roles";
import { FavoriteListDetailView } from "@/features/favorite-lists/presentation/components/favorite-list-detail-view";

export default async function ListaFavoritaDetailPage({
  params,
}: PageProps<"/dashboard/listas-favoritas/[id]">) {
  const profile = await getCurrentProfile();

  if (!canAccessScreen(profile.rol, "/dashboard/listas-favoritas")) redirect("/dashboard");

  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <FavoriteListDetailView listId={Number(id)} />
    </div>
  );
}
