"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTemplates } from "@/features/templates/presentation/hooks/use-templates";
import type { TemplateResponse } from "@/features/templates/presentation/api/template-client";
import { TemplateFormModal } from "@/features/templates/presentation/components/template-form-modal";
import { DeleteTemplateModal } from "@/features/templates/presentation/components/delete-template-modal";
import { Notice } from "@/shared/ui/notice";
import { Button } from "@/shared/ui/button";
import { DropdownMenu } from "@/shared/ui/dropdown-menu";
import {
  AlertTriangleIcon,
  DocIcon,
  EditIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  UsersIcon,
} from "@/shared/ui/icons";
import { ApiError } from "@/shared/lib/api-error";
import { formatDate } from "@/shared/lib/format-date";
import { useMyFeatures } from "@/features/auth/presentation/hooks/use-my-features";
import { isPrivilegedRole } from "@/shared/lib/roles";

type Action =
  | { type: "create" }
  | { type: "edit"; template: TemplateResponse }
  | { type: "delete"; template: TemplateResponse }
  | null;

/**
 * Template directory (backend `GET /templates`) — a search box, a table
 * with a per-row actions menu, and a "Nueva plantilla" button restricted to
 * Owner/Rrhh.
 */
export function TemplatesTable() {
  const { data: templates, isLoading, error } = useTemplates();
  const { data: myFeatures } = useMyFeatures();
  const canManage = isPrivilegedRole(myFeatures?.role);

  const [search, setSearch] = useState("");
  const [openMenuFor, setOpenMenuFor] = useState<number | null>(null);
  const [action, setAction] = useState<Action>(null);

  const filtered = useMemo(() => {
    if (!templates) return [];
    const term = search.trim().toLowerCase();
    if (!term) return templates;
    return templates.filter((t) =>
      `${t.titulo} ${t.descripcion ?? ""}`.toLowerCase().includes(term),
    );
  }, [templates, search]);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando plantillas…</p>;
  }

  if (error) {
    return (
      <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
        {error instanceof ApiError
          ? error.message
          : "No se pudo cargar el listado de plantillas."}
      </Notice>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar plantilla…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
          />
        </div>
        {canManage && (
          <Button type="button" onClick={() => setAction({ type: "create" })}>
            <PlusIcon className="h-4 w-4" />
            Nueva plantilla
          </Button>
        )}
      </div>

      {(!templates || templates.length === 0) && (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-4 text-sm text-slate-500">
          <DocIcon className="h-5 w-5 shrink-0 text-slate-400" />
          <span>Todavía no hay ninguna plantilla creada.</span>
        </div>
      )}

      {templates && templates.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Título</th>
                <th className="px-5 py-3">Fecha inicio</th>
                <th className="px-5 py-3">Fecha fin</th>
                <th className="px-5 py-3">Asignados</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((template) => (
                <tr key={template.id}>
                  <td className="whitespace-nowrap px-5 py-3">
                    <Link
                      href={`/dashboard/plantillas/${template.id}`}
                      className="flex items-center gap-3 hover:underline"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
                        <DocIcon className="h-4 w-4" />
                      </span>
                      <span className="font-semibold text-slate-900">
                        {template.titulo}
                      </span>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                    {formatDate(template.fechaInicio)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                    {formatDate(template.fechaFin)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 text-slate-700">
                      <UsersIcon className="h-4 w-4 text-slate-400" />
                      {template.assignedUserIds.length}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <DropdownMenu
                      open={openMenuFor === template.id}
                      onOpenChange={(isOpen) =>
                        setOpenMenuFor(isOpen ? template.id : null)
                      }
                      menuClassName="w-44"
                    >
                      <Link
                        href={`/dashboard/plantillas/${template.id}`}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <DocIcon className="h-4 w-4 text-slate-400" />
                        Ver preguntas
                      </Link>
                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setAction({ type: "edit", template });
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
                              setAction({ type: "delete", template });
                              setOpenMenuFor(null);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Eliminar
                          </button>
                        </>
                      )}
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <p className="px-5 py-6 text-center text-sm text-slate-500">
              Ninguna plantilla coincide con la búsqueda.
            </p>
          )}
        </div>
      )}

      {action?.type === "create" && (
        <TemplateFormModal onClose={() => setAction(null)} />
      )}
      {action?.type === "edit" && (
        <TemplateFormModal template={action.template} onClose={() => setAction(null)} />
      )}
      {action?.type === "delete" && (
        <DeleteTemplateModal template={action.template} onClose={() => setAction(null)} />
      )}
    </div>
  );
}
