import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/app/dashboard/current-profile";
import { canAccessScreen } from "@/shared/lib/roles";
import { TemplatesTable } from "@/features/templates/presentation/components/templates-table";

export default async function PlantillasPage() {
  const profile = await getCurrentProfile();

  if (!canAccessScreen(profile.rol, "/dashboard/plantillas")) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
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
  );
}
