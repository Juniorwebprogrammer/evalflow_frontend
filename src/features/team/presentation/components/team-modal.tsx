"use client";

import { Modal } from "@/shared/ui/modal";
import { Notice } from "@/shared/ui/notice";
import { UsersIcon, AlertTriangleIcon } from "@/shared/ui/icons";
import { useSubordinates } from "@/features/team/presentation/hooks/use-subordinates";
import type { EmployeeResponse } from "@/features/team/presentation/api/team-client";
import { ApiError } from "@/shared/lib/api-error";

/** Shows an employee's direct reports (backend `Team/{userId}/subordinates`). */
export function TeamModal({
  employee,
  onClose,
}: {
  employee: EmployeeResponse;
  onClose: () => void;
}) {
  const { data: subordinates, isLoading, error } = useSubordinates(employee.id);

  return (
    <Modal
      onClose={onClose}
      title="Equipo a cargo"
      description={`Empleados que reportan a ${employee.nombre} ${employee.apellidos}.`}
      icon={<UsersIcon className="h-5 w-5" />}
      size="lg"
    >
      {isLoading ? (
        <p className="text-sm text-slate-500">Cargando equipo…</p>
      ) : error ? (
        <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
          {error instanceof ApiError
            ? error.message
            : "No se pudo obtener el equipo de este empleado."}
        </Notice>
      ) : !subordinates || subordinates.length === 0 ? (
        <p className="text-sm text-slate-500">
          Este empleado no tiene a nadie a su cargo todavía.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
          {subordinates.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">
                  {s.nombre} {s.apellidos}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {s.email}
                  {s.cargo && <span> · {s.cargo}</span>}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    s.activo
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {s.activo ? "Activo" : "Inactivo"}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {s.rol}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
