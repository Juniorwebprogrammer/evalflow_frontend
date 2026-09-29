"use client";

import { useState } from "react";
import Link from "next/link";
import { useTemplate } from "@/features/templates/presentation/hooks/use-template";
import { TemplateFormModal } from "@/features/templates/presentation/components/template-form-modal";
import { QuestionsManager } from "@/features/questions/presentation/components/questions-manager";
import { Notice } from "@/shared/ui/notice";
import { Button } from "@/shared/ui/button";
import { AlertTriangleIcon, ArrowRightIcon, DocIcon, EditIcon, UsersIcon } from "@/shared/ui/icons";
import { errorMessage } from "@/shared/lib/api-error";
import { formatDate } from "@/shared/lib/format-date";
import { useMyRole } from "@/features/profile/presentation/hooks/use-profile";
import { isPrivilegedRole } from "@/shared/lib/roles";

/** Template detail (backend `GET /templates/{id}`) plus its questions manager. */
export function TemplateDetailView({ templateId }: { templateId: number }) {
  const { data: template, isLoading, error } = useTemplate(templateId);
  const { role } = useMyRole();
  const canManage = isPrivilegedRole(role);
  const [editing, setEditing] = useState(false);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading template…</p>;
  }

  if (error || !template) {
    return (
      <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
        {error
          ? errorMessage(error, "We couldn't load the template.")
          : "We couldn't find this template. It may have been deleted."}
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
        Back to templates
      </Link>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
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
              Edit
            </Button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Start date
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {formatDate(template.fechaInicio)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              End date
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {formatDate(template.fechaFin)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Assigned employees
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
