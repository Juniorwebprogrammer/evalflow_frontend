"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Select } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import {
  ArrowRightIcon,
  BuildingIcon,
  AlertTriangleIcon,
  PlusIcon,
  XIcon,
} from "@/shared/ui/icons";
import {
  useDepartment,
  departmentQueryKey,
} from "@/features/departments/presentation/hooks/use-department";
import { DEPARTMENTS_QUERY_KEY } from "@/features/departments/presentation/hooks/use-departments";
import {
  EMPLOYEES_QUERY_KEY,
  useEmployees,
} from "@/features/team/presentation/hooks/use-employees";
import { assignDepartment } from "@/features/team/presentation/api/team-client";
import { ApiError } from "@/shared/lib/api-error";
import { formatDate } from "@/shared/lib/format-date";

/**
 * Department detail: its full roster (backend `GET /departments/{id}`) and
 * lets the caller assign or remove employees — using a name picker sourced
 * from the company directory (`Team/list`), never a raw ID. There's no
 * update/delete for a department on the backend, so this view is read/roster
 * management only.
 */
export function DepartmentDetailView({ departmentId }: { departmentId: number }) {
  const queryClient = useQueryClient();
  const { data: detail, isLoading, error } = useDepartment(departmentId);
  const { data: allEmployees } = useEmployees();

  const [showPicker, setShowPicker] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [busyEmployeeId, setBusyEmployeeId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function refreshDepartment() {
    queryClient.invalidateQueries({ queryKey: departmentQueryKey(departmentId) });
    queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
    // The employee directory shows each employee's department — keep it in sync too.
    queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEmployeeId) return;
    setActionError(null);
    setBusyEmployeeId(selectedEmployeeId);
    try {
      await assignDepartment(Number(selectedEmployeeId), departmentId);
      setSelectedEmployeeId("");
      setShowPicker(false);
      refreshDepartment();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "No se pudo asignar el empleado.",
      );
    } finally {
      setBusyEmployeeId(null);
    }
  }

  async function handleRemove(employeeId: string) {
    setActionError(null);
    setBusyEmployeeId(employeeId);
    try {
      await assignDepartment(Number(employeeId), null);
      refreshDepartment();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "No se pudo quitar al empleado.",
      );
    } finally {
      setBusyEmployeeId(null);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando departamento…</p>;
  }

  if (error || !detail) {
    return (
      <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
        {error instanceof ApiError ? error.message : "No se pudo cargar el departamento."}
      </Notice>
    );
  }

  const rosterIds = new Set(detail.usuarios.map((u) => String(u.id)));
  const availableEmployees = (allEmployees ?? []).filter((e) => !rosterIds.has(e.id));

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/usuarios?tab=departamentos"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" />
        Volver a departamentos
      </Link>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)]/10 text-[var(--brand)]">
            <BuildingIcon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{detail.nombre}</h1>
            {detail.descripcion && (
              <p className="mt-1 text-sm text-slate-500">{detail.descripcion}</p>
            )}
            <p className="mt-1 text-xs text-slate-400">
              Creado el {formatDate(detail.fechaCreacion)}
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Empleados ({detail.usuarios.length})
          </h2>
          {!showPicker && (
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)] hover:underline"
            >
              <PlusIcon className="h-4 w-4" />
              Asignar empleados
            </button>
          )}
        </div>

        {showPicker && (
          <form
            onSubmit={handleAssign}
            className="flex items-end gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
          >
            <Select
              className="flex-1"
              label="Empleado"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              options={[
                { value: "", label: "Selecciona un empleado" },
                ...availableEmployees.map((e) => ({
                  value: e.id,
                  label: `${e.nombre} ${e.apellidos}`,
                })),
              ]}
            />
            <Button
              type="submit"
              variant="outline"
              loading={busyEmployeeId === selectedEmployeeId && busyEmployeeId !== null}
              disabled={!selectedEmployeeId}
            >
              Asignar
            </Button>
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              title="Cancelar"
              className="p-2 text-slate-400 hover:text-slate-600"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </form>
        )}

        {availableEmployees.length === 0 && showPicker && (
          <p className="text-xs text-slate-400">
            Todos los empleados de tu empresa ya están en este departamento.
          </p>
        )}

        {actionError && <Notice tone="error">{actionError}</Notice>}

        {detail.usuarios.length === 0 ? (
          <p className="text-sm text-slate-500">
            Este departamento todavía no tiene empleados asignados.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white shadow-sm">
            {detail.usuarios.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {u.nombre} {u.apellidos}
                  </p>
                  <p className="truncate text-xs text-slate-500">{u.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {u.rol}
                  </span>
                  <button
                    type="button"
                    title="Quitar del departamento"
                    disabled={busyEmployeeId === String(u.id)}
                    onClick={() => handleRemove(String(u.id))}
                    className="text-slate-400 transition hover:text-red-600 disabled:opacity-40"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
