"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  EMPLOYEES_QUERY_KEY,
  useEmployees,
} from "@/features/team/presentation/hooks/use-employees";
import { useDepartments } from "@/features/departments/presentation/hooks/use-departments";
import {
  toggleUserStatus,
  type EmployeeResponse,
} from "@/features/team/presentation/api/team-client";
import { departmentAccent } from "@/features/departments/presentation/lib/accent";
import { AssignSuperiorModal } from "@/features/team/presentation/components/assign-superior-modal";
import { AssignJobPositionModal } from "@/features/team/presentation/components/assign-job-position-modal";
import { TeamModal } from "@/features/team/presentation/components/team-modal";
import { exportEmployeesToCsv } from "@/features/team/presentation/lib/export-employees";
import { initials } from "@/features/team/presentation/lib/format";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { DropdownMenu } from "@/shared/ui/dropdown-menu";
import {
  AlertTriangleIcon,
  BriefcaseIcon,
  DownloadIcon,
  PowerIcon,
  ScaleIcon,
  SearchIcon,
  UsersIcon,
} from "@/shared/ui/icons";
import { ApiError } from "@/shared/lib/api-error";

const ALL = "";
const NONE = "__none__";

type Action = {
  type: "superior" | "team" | "job-position";
  employee: EmployeeResponse;
} | null;

/**
 * Full employee directory (backend `Team/list`). Filters and stats below run
 * entirely on the client over the already-fetched list — no extra requests.
 */
export function EmployeeDirectory() {
  const queryClient = useQueryClient();
  const { data: employees, isLoading, error } = useEmployees();
  const { data: departments } = useDepartments();

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState(ALL);
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);
  const [action, setAction] = useState<Action>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  async function handleToggleStatus(employee: EmployeeResponse) {
    setOpenMenuFor(null);
    setToggleError(null);
    setTogglingId(employee.id);
    try {
      await toggleUserStatus(Number(employee.id), !employee.activo);
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
    } catch (err) {
      setToggleError(
        err instanceof ApiError
          ? err.message
          : "No se pudo actualizar el estado del empleado.",
      );
    } finally {
      setTogglingId(null);
    }
  }

  const filtered = useMemo(() => {
    if (!employees) return [];
    const term = search.trim().toLowerCase();
    return employees.filter((e) => {
      const matchesSearch =
        !term ||
        `${e.nombre} ${e.apellidos} ${e.email}`.toLowerCase().includes(term);
      const matchesDepartment =
        departmentFilter === ALL ||
        (departmentFilter === NONE
          ? !e.departamento
          : e.departamento?.id === Number(departmentFilter));
      return matchesSearch && matchesDepartment;
    });
  }, [employees, search, departmentFilter]);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando empleados…</p>;
  }

  if (error) {
    return (
      <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
        {error instanceof ApiError
          ? error.message
          : "No se pudo cargar el listado de empleados."}
      </Notice>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-4 text-sm text-slate-500">
        <UsersIcon className="h-5 w-5 shrink-0 text-slate-400" />
        <span>Todavía no hay empleados en tu organización.</span>
      </div>
    );
  }

  const stats = {
    activos: employees.filter((e) => e.activo).length,
    sinDepartamento: employees.filter((e) => !e.departamento).length,
    sinSuperior: employees.filter((e) => !e.superior).length,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar empleado…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
        >
          <option value={ALL}>Todos los departamentos</option>
          <option value={NONE}>Sin departamento</option>
          {(departments ?? []).map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre}
            </option>
          ))}
        </select>

        <Button
          type="button"
          variant="outline"
          onClick={() => exportEmployeesToCsv(filtered)}
        >
          <DownloadIcon className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      {toggleError && (
        <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
          {toggleError}
        </Notice>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Empleado</th>
              <th className="px-5 py-3">Departamento</th>
              <th className="px-5 py-3">Superior directo</th>
              <th className="px-5 py-3">Cargo</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((employee) => {
              const accent = employee.departamento
                ? departmentAccent(employee.departamento.id)
                : null;

              return (
                <tr key={employee.id}>
                  <td className="flex items-center gap-3 whitespace-nowrap px-5 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/10 text-xs font-bold text-[var(--brand)]">
                      {initials(employee.nombre, employee.apellidos)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {employee.nombre} {employee.apellidos}
                      </p>
                      <p className="truncate text-xs text-slate-500">{employee.email}</p>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-5 py-3">
                    {employee.departamento ? (
                      <span className="inline-flex items-center gap-1.5 text-slate-700">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: accent?.bar }}
                        />
                        {employee.departamento.nombre}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Sin departamento</span>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-5 py-3">
                    {employee.superior ? (
                      <span className="inline-flex items-center gap-2 text-slate-700">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                          {initials(employee.superior.nombre, employee.superior.apellidos)}
                        </span>
                        {employee.superior.nombre} {employee.superior.apellidos[0]}.
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Sin superior</span>
                    )}
                  </td>

                  <td className="max-w-[260px] truncate px-5 py-3 text-slate-600" title={employee.cargo ?? undefined}>
                    {employee.cargo ?? "—"}
                  </td>

                  <td className="whitespace-nowrap px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        employee.activo
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {employee.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="px-5 py-3 text-right">
                    <DropdownMenu
                      open={openMenuFor === employee.id}
                      onOpenChange={(isOpen) =>
                        setOpenMenuFor(isOpen ? employee.id : null)
                      }
                      menuClassName="w-52"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setAction({ type: "superior", employee });
                          setOpenMenuFor(null);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <ScaleIcon className="h-4 w-4 text-slate-400" />
                        Asignar superior
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAction({ type: "job-position", employee });
                          setOpenMenuFor(null);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <BriefcaseIcon className="h-4 w-4 text-slate-400" />
                        Asignar cargo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAction({ type: "team", employee });
                          setOpenMenuFor(null);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <UsersIcon className="h-4 w-4 text-slate-400" />
                        Ver equipo a cargo
                      </button>
                      <button
                        type="button"
                        disabled={togglingId === employee.id}
                        onClick={() => handleToggleStatus(employee)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <PowerIcon
                          className={`h-4 w-4 ${employee.activo ? "text-red-500" : "text-emerald-500"}`}
                        />
                        {employee.activo ? "Desactivar cuenta" : "Activar cuenta"}
                      </button>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="px-5 py-6 text-center text-sm text-slate-500">
            Ningún empleado coincide con los filtros aplicados.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Total activos" value={stats.activos} />
        <StatTile label="Sin departamento" value={stats.sinDepartamento} />
        <StatTile label="Sin superior asignado" value={stats.sinSuperior} />
      </div>

      {action?.type === "superior" && (
        <AssignSuperiorModal
          employee={action.employee}
          employees={employees}
          onClose={() => setAction(null)}
        />
      )}
      {action?.type === "team" && (
        <TeamModal employee={action.employee} onClose={() => setAction(null)} />
      )}
      {action?.type === "job-position" && (
        <AssignJobPositionModal
          employee={action.employee}
          onClose={() => setAction(null)}
        />
      )}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-lg font-bold text-slate-900">{value}</span>
    </div>
  );
}
