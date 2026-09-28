import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/app/dashboard/current-profile";
import { canAccessScreen } from "@/shared/lib/roles";
import { TemplateDetailView } from "@/features/templates/presentation/components/template-detail-view";

export default async function PlantillaDetailPage({
  params,
}: PageProps<"/dashboard/plantillas/[id]">) {
  const profile = await getCurrentProfile();

  if (!canAccessScreen(profile.rol, "/dashboard/plantillas")) redirect("/dashboard");

  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <TemplateDetailView templateId={Number(id)} />
    </div>
  );
}
