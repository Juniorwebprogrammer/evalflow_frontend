"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Field } from "@/shared/ui/field";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { BriefcaseIcon, CheckCircleIcon } from "@/shared/ui/icons";
import {
  createJobPosition,
  updateJobPosition,
  type JobPositionSummaryResponse,
} from "@/features/job-positions/presentation/api/job-position-client";
import { JOB_POSITIONS_QUERY_KEY } from "@/features/job-positions/presentation/hooks/use-job-positions";
import { EMPLOYEES_QUERY_KEY } from "@/features/team/presentation/hooks/use-employees";
import { ApiError } from "@/shared/lib/api-error";

interface FormState {
  nombre: string;
  descripcion: string;
}

function toFormState(position?: JobPositionSummaryResponse): FormState {
  return {
    nombre: position?.nombre ?? "",
    descripcion: position?.descripcion ?? "",
  };
}

/**
 * Job-position create/edit form, meant to be embedded inside a modal (no
 * card wrapper of its own — the modal supplies title/description/icon).
 * Edits when `position` is given, creates otherwise.
 */
export function JobPositionForm({
  position,
  onSaved,
  onCancel,
}: {
  position?: JobPositionSummaryResponse;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEditing = Boolean(position);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(() => toFormState(position));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isEditing && position) {
        await updateJobPosition(position.id, form);
      } else {
        await createJobPosition(form);
      }
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: JOB_POSITIONS_QUERY_KEY });
      // Renaming a job position changes the `cargo` string embedded in every
      // employee that holds it — keep the employee directory in sync too.
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : `No se pudo ${isEditing ? "actualizar" : "crear"} el cargo. Inténtalo de nuevo.`,
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
          Cargo <strong>{form.nombre}</strong>{" "}
          {isEditing ? "actualizado" : "creado"} con éxito.
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
        label="Nombre"
        icon={<BriefcaseIcon className="h-4 w-4" />}
        value={form.nombre}
        onChange={(e) => update({ nombre: e.target.value })}
        placeholder="Enfermero/a"
        required
        autoFocus
      />
      <Field
        label="Descripción"
        value={form.descripcion}
        onChange={(e) => update({ descripcion: e.target.value })}
        placeholder="Atención directa al paciente en planta"
      />

      {error && <Notice tone="error">{error}</Notice>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          {isEditing ? "Guardar cambios" : "Crear cargo"}
        </Button>
      </div>
    </form>
  );
}
