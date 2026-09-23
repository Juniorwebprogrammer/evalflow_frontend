"use client";

import { useMemo, useState } from "react";
import { useJobPositions } from "@/features/job-positions/presentation/hooks/use-job-positions";
import type { JobPositionSummaryResponse } from "@/features/job-positions/presentation/api/job-position-client";
import { JobPositionFormModal } from "@/features/job-positions/presentation/components/job-position-form-modal";
import { DeleteJobPositionModal } from "@/features/job-positions/presentation/components/delete-job-position-modal";
import { Notice } from "@/shared/ui/notice";
import { DropdownMenu } from "@/shared/ui/dropdown-menu";
import {
  AlertTriangleIcon,
  BriefcaseIcon,
  EditIcon,
  SearchIcon,
  TrashIcon,
  UsersIcon,
} from "@/shared/ui/icons";
import { ApiError } from "@/shared/lib/api-error";

type Action =
  | { type: "edit"; position: JobPositionSummaryResponse }
  | { type: "delete"; position: JobPositionSummaryResponse }
  | null;

/**
 * Job position (cargo) directory (backend `GET /job-positions`) — same
 * table layout as the employee directory: a search box, a table with a
 * per-row actions menu, and summary stat tiles below.
 */
export function JobPositionsTable() {
  const { data: positions, isLoading, error } = useJobPositions();

  const [search, setSearch] = useState("");
  const [openMenuFor, setOpenMenuFor] = useState<number | null>(null);
  const [action, setAction] = useState<Action>(null);

  const filtered = useMemo(() => {
    if (!positions) return [];
    const term = search.trim().toLowerCase();
    if (!term) return positions;
    return positions.filter((p) =>
      `${p.nombre} ${p.descripcion ?? ""}`.toLowerCase().includes(term),
    );
  }, [positions, search]);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando cargos…</p>;
  }

  if (error) {
    return (
      <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
        {error instanceof ApiError
          ? error.message
          : "No se pudo cargar el listado de cargos."}
      </Notice>
    );
  }

  if (!positions || positions.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-4 text-sm text-slate-500">
        <BriefcaseIcon className="h-5 w-5 shrink-0 text-slate-400" />
        <span>Todavía no has creado ningún cargo.</span>
      </div>
    );
  }

  const stats = {
    total: positions.length,
    sinDescripcion: positions.filter((p) => !p.descripcion).length,
    empleadosAsignados: positions.reduce((sum, p) => sum + p.employeeCount, 0),
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cargo…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Cargo</th>
              <th className="px-5 py-3">Descripción</th>
              <th className="px-5 py-3">Empleados asignados</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((position) => (
              <tr key={position.id}>
                <td className="whitespace-nowrap px-5 py-3">
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
                      <BriefcaseIcon className="h-4 w-4" />
                    </span>
                    <span className="font-semibold text-slate-900">
                      {position.nombre}
                    </span>
                  </span>
                </td>

                <td
                  className="max-w-[320px] truncate px-5 py-3 text-slate-600"
                  title={position.descripcion ?? undefined}
                >
                  {position.descripcion ?? (
                    <span className="text-slate-400 italic">Sin descripción</span>
                  )}
                </td>

                <td className="whitespace-nowrap px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 text-slate-700">
                    <UsersIcon className="h-4 w-4 text-slate-400" />
                    {position.employeeCount}
                  </span>
                </td>

                <td className="px-5 py-3 text-right">
                  <DropdownMenu
                    open={openMenuFor === position.id}
                    onOpenChange={(isOpen) =>
                      setOpenMenuFor(isOpen ? position.id : null)
                    }
                    menuClassName="w-44"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setAction({ type: "edit", position });
                        setOpenMenuFor(null);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <EditIcon className="h-4 w-4 text-slate-400" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAction({ type: "delete", position });
                        setOpenMenuFor(null);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Eliminar
                    </button>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="px-5 py-6 text-center text-sm text-slate-500">
            Ningún cargo coincide con la búsqueda.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Total de cargos" value={stats.total} />
        <StatTile label="Sin descripción" value={stats.sinDescripcion} />
        <StatTile label="Empleados con cargo" value={stats.empleadosAsignados} />
      </div>

      {action?.type === "edit" && (
        <JobPositionFormModal
          position={action.position}
          onClose={() => setAction(null)}
        />
      )}
      {action?.type === "delete" && (
        <DeleteJobPositionModal
          position={action.position}
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
