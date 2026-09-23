"use client";

import { useDepartments } from "@/features/departments/presentation/hooks/use-departments";
import { DepartmentCard } from "@/features/departments/presentation/components/department-card";
import { Notice } from "@/shared/ui/notice";
import { AlertTriangleIcon, BuildingIcon } from "@/shared/ui/icons";
import { ApiError } from "@/shared/lib/api-error";

/** Department grid (backend `GET /departments`) — tap a card to see its roster. */
export function DepartmentsGrid() {
  const { data: departments, isLoading, error } = useDepartments();

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando departamentos…</p>;
  }

  if (error) {
    return (
      <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
        {error instanceof ApiError
          ? error.message
          : "No se pudo cargar el listado de departamentos."}
      </Notice>
    );
  }

  if (!departments || departments.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-4 text-sm text-slate-500">
        <BuildingIcon className="h-5 w-5 shrink-0 text-slate-400" />
        <span>Todavía no has creado ningún departamento.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {departments.map((department) => (
        <DepartmentCard key={department.id} department={department} />
      ))}
    </div>
  );
}
