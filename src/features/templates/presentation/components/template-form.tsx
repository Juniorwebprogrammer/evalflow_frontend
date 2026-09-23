"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Field } from "@/shared/ui/field";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { CheckCircleIcon, DocIcon, UsersIcon } from "@/shared/ui/icons";
import {
  createTemplate,
  updateTemplate,
  type TemplateResponse,
} from "@/features/templates/presentation/api/template-client";
import { TEMPLATES_QUERY_KEY } from "@/features/templates/presentation/hooks/use-templates";
import { templateQueryKey } from "@/features/templates/presentation/hooks/use-template";
import { useEmployees } from "@/features/team/presentation/hooks/use-employees";
import { toDateInputValue } from "@/shared/lib/format-date";
import { ApiError } from "@/shared/lib/api-error";
import { upsertById } from "@/shared/lib/query-cache";

interface FormState {
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  assignedUserIds: number[];
}

function toFormState(template?: TemplateResponse): FormState {
  return {
    titulo: template?.titulo ?? "",
    descripcion: template?.descripcion ?? "",
    fechaInicio: template ? toDateInputValue(template.fechaInicio) : "",
    fechaFin: template ? toDateInputValue(template.fechaFin) : "",
    assignedUserIds: template?.assignedUserIds ?? [],
  };
}

/**
 * Template create/edit form, meant to be embedded inside a modal (no card
 * wrapper of its own). Edits when `template` is given, creates otherwise.
 */
export function TemplateForm({
  template,
  onSaved,
  onCancel,
}: {
  template?: TemplateResponse;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEditing = Boolean(template);
  const queryClient = useQueryClient();
  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const [form, setForm] = useState<FormState>(() => toFormState(template));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function toggleAssignee(id: number) {
    setForm((prev) => ({
      ...prev,
      assignedUserIds: prev.assignedUserIds.includes(id)
        ? prev.assignedUserIds.filter((x) => x !== id)
        : [...prev.assignedUserIds, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      let savedId: number;
      if (isEditing && template) {
        await updateTemplate(template.id, form);
        savedId = template.id;
      } else {
        const result = await createTemplate(form);
        savedId = result.templateId;
      }
      setSaved(true);

      // Write the known-good result straight into the cache instead of only
      // invalidating: the GET response's exact field names for
      // `assignedUserIds` aren't guaranteed, so a refetch could otherwise
      // silently reset it to empty right after a successful save.
      const saved: TemplateResponse = {
        id: savedId,
        titulo: form.titulo,
        descripcion: form.descripcion || null,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        assignedUserIds: form.assignedUserIds,
      };
      queryClient.setQueryData<TemplateResponse[]>(TEMPLATES_QUERY_KEY, (old) =>
        upsertById(old, saved),
      );
      queryClient.setQueryData(templateQueryKey(savedId), saved);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : `No se pudo ${isEditing ? "actualizar" : "crear"} la plantilla. Inténtalo de nuevo.`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (saved) {
    return (
      <>
        <Notice
          tone="success"
          icon={<CheckCircleIcon className="h-5 w-5 text-emerald-600" />}
        >
          Plantilla <strong>{form.titulo}</strong>{" "}
          {isEditing ? "actualizada" : "creada"} con éxito.
        </Notice>
        <Button type="button" className="mt-5 w-full" onClick={onSaved}>
          Aceptar
        </Button>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        label="Título"
        icon={<DocIcon className="h-4 w-4" />}
        value={form.titulo}
        onChange={(e) => update({ titulo: e.target.value })}
        placeholder="Evaluación de desempeño H1 2026"
        required
        autoFocus
      />
      <Field
        label="Descripción"
        value={form.descripcion}
        onChange={(e) => update({ descripcion: e.target.value })}
        placeholder="Evaluación semestral de objetivos y competencias"
      />
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Fecha de inicio"
          type="date"
          value={form.fechaInicio}
          onChange={(e) => update({ fechaInicio: e.target.value })}
          required
        />
        <Field
          label="Fecha de fin"
          type="date"
          value={form.fechaFin}
          onChange={(e) => update({ fechaFin: e.target.value })}
          required
        />
      </div>

      <div>
        <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <UsersIcon className="h-4 w-4 text-slate-400" />
          Empleados asignados
        </p>
        <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2">
          {loadingEmployees && (
            <p className="px-2 py-1.5 text-sm text-slate-500">Cargando empleados…</p>
          )}
          {!loadingEmployees && (!employees || employees.length === 0) && (
            <p className="px-2 py-1.5 text-sm text-slate-500">No hay empleados.</p>
          )}
          {employees?.map((employee) => {
            const id = Number(employee.id);
            const checked = form.assignedUserIds.includes(id);
            return (
              <label
                key={employee.id}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAssignee(id)}
                  className="h-4 w-4 rounded border-slate-300 text-[var(--brand)] focus:ring-[var(--brand)]/30"
                />
                {employee.nombre} {employee.apellidos}
              </label>
            );
          })}
        </div>
      </div>

      {error && <Notice tone="error">{error}</Notice>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          {isEditing ? "Guardar cambios" : "Crear plantilla"}
        </Button>
      </div>
    </form>
  );
}
