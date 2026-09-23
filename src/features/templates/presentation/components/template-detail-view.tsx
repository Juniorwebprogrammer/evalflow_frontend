"use client";

import { useState } from "react";
import Link from "next/link";
import { useTemplate } from "@/features/templates/presentation/hooks/use-template";
import { TemplateFormModal } from "@/features/templates/presentation/components/template-form-modal";
import { QuestionsManager } from "@/features/questions/presentation/components/questions-manager";
import { Notice } from "@/shared/ui/notice";
import { Button } from "@/shared/ui/button";
import { AlertTriangleIcon, ArrowRightIcon, DocIcon, EditIcon, UsersIcon } from "@/shared/ui/icons";
import { ApiError } from "@/shared/lib/api-error";
import { formatDate } from "@/shared/lib/format-date";
import { useMyFeatures } from "@/features/auth/presentation/hooks/use-my-features";
import { isPrivilegedRole } from "@/shared/lib/roles";

/** Template detail (backend `GET /templates/{id}`) plus its questions manager. */
export function TemplateDetailView({ templateId }: { templateId: number }) {
  const { data: template, isLoading, error } = useTemplate(templateId);
  const { data: myFeatures } = useMyFeatures();
  const canManage = isPrivilegedRole(myFeatures?.role);
  const [editing, setEditing] = useState(false);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando plantilla…</p>;
  }

  if (error || !template) {
    return (
      <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
        {error instanceof ApiError
          ? error.message
          : "No se pudo cargar la plantilla."}
      </Notice>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/plantillas"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" />
        Volver a plantillas
      </Link>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)]/10 text-[var(--brand)]">
              <DocIcon className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{template.titulo}</h1>
              {template.descripcion && (
                <p className="mt-1 text-sm text-slate-500">{template.descripcion}</p>
              )}
            </div>
          </div>
          {canManage && (
            <Button type="button" variant="outline" onClick={() => setEditing(true)}>
              <EditIcon className="h-4 w-4" />
              Editar
            </Button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Fecha de inicio
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {formatDate(template.fechaInicio)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Fecha de fin
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {formatDate(template.fechaFin)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Empleados asignados
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-800">
              <UsersIcon className="h-4 w-4 text-slate-400" />
              {template.assignedUserIds.length}
            </p>
          </div>
        </div>
      </section>

      <QuestionsManager templateId={template.id} canManage={canManage} />

      {editing && (
        <TemplateFormModal template={template} onClose={() => setEditing(false)} />
      )}
    </div>
  );
}
