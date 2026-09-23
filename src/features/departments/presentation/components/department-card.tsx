import Link from "next/link";
import type { DepartmentSummaryResponse } from "@/features/departments/presentation/api/department-client";
import { departmentAccent } from "@/features/departments/presentation/lib/accent";
import { BuildingIcon, UsersIcon } from "@/shared/ui/icons";

/** Clickable department summary card — opens the department's detail page. */
export function DepartmentCard({ department }: { department: DepartmentSummaryResponse }) {
  const accent = departmentAccent(department.id);

  return (
    <Link
      href={`/dashboard/departamentos/${department.id}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="h-1.5 w-full" style={{ background: accent.bar }} />
      <span className="flex flex-1 flex-col gap-3 p-5">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: accent.soft, color: accent.text }}
        >
          <BuildingIcon className="h-5 w-5" />
        </span>
        <span className="block">
          <span className="block text-base font-bold text-slate-900">
            {department.nombre}
          </span>
          {department.descripcion && (
            <span className="mt-0.5 line-clamp-2 block text-sm text-slate-500">
              {department.descripcion}
            </span>
          )}
        </span>
        <span className="mt-auto flex items-center gap-1.5 text-sm text-slate-500">
          <UsersIcon className="h-4 w-4 text-slate-400" />
          {department.employeeCount}{" "}
          {department.employeeCount === 1 ? "empleado" : "empleados"}
        </span>
      </span>
    </Link>
  );
}
