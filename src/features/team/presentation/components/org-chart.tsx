"use client";

import { useMemo, useState } from "react";
import { useOrgChart } from "@/features/team/presentation/hooks/use-org-chart";
import { layoutOrgChart } from "@/features/team/presentation/lib/org-chart-layout";
import { initials } from "@/features/team/presentation/lib/format";
import type { EmployeeResponse } from "@/features/team/presentation/api/team-client";
import { SuperiorRelationModal } from "@/features/team/presentation/components/superior-relation-modal";
import { Notice } from "@/shared/ui/notice";
import { AlertTriangleIcon, UsersIcon } from "@/shared/ui/icons";
import { ApiError } from "@/shared/lib/api-error";

const COLUMN_WIDTH = 200;
const ROW_HEIGHT = 132;
const NODE_WIDTH = 172;
const NODE_HEIGHT = 68;

type PendingAction =
  | { type: "connect"; employee: EmployeeResponse; superior: EmployeeResponse }
  | { type: "disconnect"; employee: EmployeeResponse; superior: EmployeeResponse };

/**
 * Visual, ER-diagram-style editor for the reporting hierarchy: employees are
 * nodes, "reports to" relationships are lines between them. Click an
 * employee, then click who their superior should be; click a line to remove
 * that relationship.
 */
export function OrgChart() {
  const { data, isLoading, error } = useOrgChart();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const layout = useMemo(() => {
    if (!data) return null;
    return layoutOrgChart(data.employees, data.childrenOf);
  }, [data]);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando organigrama…</p>;
  }

  if (error) {
    return (
      <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
        {error instanceof ApiError
          ? error.message
          : "No se pudo cargar el organigrama."}
      </Notice>
    );
  }

  if (!data || data.employees.length === 0 || !layout) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-4 text-sm text-slate-500">
        <UsersIcon className="h-5 w-5 shrink-0 text-slate-400" />
        <span>Todavía no hay empleados en tu organización.</span>
      </div>
    );
  }

  const byId = new Map(data.employees.map((e) => [e.id, e]));
  const width = layout.columns * COLUMN_WIDTH;
  const height = layout.rows * ROW_HEIGHT;

  function pixelOf(id: string) {
    const slot = layout!.positions.get(id)!;
    return {
      x: slot.x * COLUMN_WIDTH + COLUMN_WIDTH / 2,
      y: slot.y * ROW_HEIGHT + ROW_HEIGHT / 2,
    };
  }

  function handleNodeClick(employee: EmployeeResponse) {
    if (!selectedId) {
      setSelectedId(employee.id);
      return;
    }
    if (selectedId === employee.id) {
      setSelectedId(null);
      return;
    }
    const selectedEmployee = byId.get(selectedId);
    setSelectedId(null);
    if (!selectedEmployee) return;
    setPendingAction({ type: "connect", employee: selectedEmployee, superior: employee });
  }

  return (
    <div className="space-y-3">
      <Notice tone="info">
        {selectedId ? (
          <>
            Ahora haz clic en quién será el superior directo de{" "}
            <strong>
              {byId.get(selectedId)?.nombre} {byId.get(selectedId)?.apellidos}
            </strong>
            . <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="ml-1 font-semibold text-[var(--brand)] hover:underline"
            >
              Cancelar
            </button>
          </>
        ) : (
          "Haz clic en un empleado y luego en quien será su superior directo. Haz clic en una línea para quitar esa relación."
        )}
      </Notice>

      <div className="overflow-auto rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div
          className="relative"
          style={{ width, height, minWidth: "100%" }}
        >
          <svg
            className="absolute inset-0"
            width={width}
            height={height}
            style={{ pointerEvents: "none" }}
          >
            {layout.edges.map(({ parentId, childId }) => {
              const parent = pixelOf(parentId);
              const child = pixelOf(childId);
              const p1y = parent.y + NODE_HEIGHT / 2;
              const p2y = child.y - NODE_HEIGHT / 2;
              const midY = (p1y + p2y) / 2;
              const path = `M ${parent.x},${p1y} C ${parent.x},${midY} ${child.x},${midY} ${child.x},${p2y}`;
              const midX = (parent.x + child.x) / 2;

              return (
                <g key={`${parentId}-${childId}`}>
                  <path
                    d={path}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth={2}
                  />
                  <g
                    style={{ pointerEvents: "auto", cursor: "pointer" }}
                    onClick={() =>
                      setPendingAction({
                        type: "disconnect",
                        employee: byId.get(childId)!,
                        superior: byId.get(parentId)!,
                      })
                    }
                  >
                    <circle cx={midX} cy={midY} r={9} fill="#f1f5f9" stroke="#cbd5e1" />
                    <path
                      d={`M ${midX - 3},${midY - 3} L ${midX + 3},${midY + 3} M ${midX + 3},${midY - 3} L ${midX - 3},${midY + 3}`}
                      stroke="#64748b"
                      strokeWidth={1.4}
                    />
                  </g>
                </g>
              );
            })}
          </svg>

          {data.employees.map((employee) => {
            const { x, y } = pixelOf(employee.id);
            const isSelected = selectedId === employee.id;
            return (
              <button
                key={employee.id}
                type="button"
                onClick={() => handleNodeClick(employee)}
                className={`absolute flex items-center gap-2.5 rounded-xl border bg-white px-3 py-2.5 text-left shadow-sm transition hover:shadow-md ${
                  isSelected
                    ? "border-[var(--brand)] ring-2 ring-[var(--brand)]/30"
                    : "border-slate-200"
                }`}
                style={{
                  left: x,
                  top: y,
                  width: NODE_WIDTH,
                  height: NODE_HEIGHT,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/10 text-xs font-bold text-[var(--brand)]">
                  {initials(employee.nombre, employee.apellidos)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900">
                    {employee.nombre} {employee.apellidos}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {employee.rol}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {pendingAction && (
        <SuperiorRelationModal
          type={pendingAction.type}
          employee={pendingAction.employee}
          superior={pendingAction.superior}
          onClose={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}
