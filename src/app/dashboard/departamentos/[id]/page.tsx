import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/app/dashboard/current-profile";
import { canAccessScreen } from "@/shared/lib/roles";
import { DepartmentDetailView } from "@/features/departments/presentation/components/department-detail-view";

export default async function DepartamentoDetailPage({
  params,
}: PageProps<"/dashboard/departamentos/[id]">) {
  const profile = await getCurrentProfile();

  if (!canAccessScreen(profile.rol, "/dashboard/departamentos")) redirect("/dashboard");

  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl px-8 py-7">
      <DepartmentDetailView departmentId={Number(id)} />
    </div>
  );
}
