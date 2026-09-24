"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Field } from "@/shared/ui/field";
import { Select } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { CheckCircleIcon, ClipboardIcon } from "@/shared/ui/icons";
import {
  createEvaluationCycle,
  updateEvaluationCycle,
  type EvaluationCycleResponse,
} from "@/features/evaluation-cycles/presentation/api/evaluation-cycle-client";
import { EvaluationType } from "@/features/evaluation-cycles/domain/evaluation-cycle";
import { EVALUATION_CYCLES_QUERY_KEY } from "@/features/evaluation-cycles/presentation/hooks/use-evaluation-cycles";
import { toDateInputValue } from "@/shared/lib/format-date";
import { ApiError } from "@/shared/lib/api-error";
import { upsertById } from "@/shared/lib/query-cache";

const EVALUATION_TYPE_OPTIONS = [
  { value: String(EvaluationType.Evaluacion360), label: "360° — Autoevaluación + evaluador" },
  { value: String(EvaluationType.Evaluacion180), label: "180° — Solo el evaluador" },
  { value: String(EvaluationType.Auto), label: "Auto — Solo autoevaluación" },
];

interface FormState {
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  tipoEvaluacion: EvaluationType;
}

function toFormState(cycle?: EvaluationCycleResponse): FormState {
  return {
    nombre: cycle?.nombre ?? "",
    descripcion: cycle?.descripcion ?? "",
    fechaInicio: cycle ? toDateInputValue(cycle.fechaInicio) : "",
    fechaFin: cycle ? toDateInputValue(cycle.fechaFin) : "",
    activo: cycle?.activo ?? true,
    tipoEvaluacion: cycle?.tipoEvaluacion ?? EvaluationType.Evaluacion360,
  };
}

/**
 * Evaluation-cycle create/edit form, meant to be embedded inside a modal.
 * Edits when `cycle` is given, creates otherwise. Whether the cycle is
 * active has its own dedicated "Activar/Desactivar" button on the detail
 * page — this form only ever carries the current value through unchanged
 * on an edit, it doesn't expose a control for it.
 */
export function EvaluationCycleForm({
  cycle,
  onSaved,
  onCancel,
}: {
  cycle?: EvaluationCycleResponse;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEditing = Boolean(cycle);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(() => toFormState(cycle));
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
      let savedCycle: EvaluationCycleResponse;
      if (isEditing && cycle) {
        await updateEvaluationCycle(cycle.id, form);
        savedCycle = {
          id: cycle.id,
          nombre: form.nombre,
          descripcion: form.descripcion || null,
          activo: form.activo,
          fechaInicio: form.fechaInicio,
          fechaFin: form.fechaFin,
          tipoEvaluacion: form.tipoEvaluacion,
          // Preserve the cycle's known membership — editing its own fields
          // must not reset which templates it contains.
          templateIds: cycle.templateIds,
          fechaCompletado: cycle.fechaCompletado,
        };
      } else {
        const result = await createEvaluationCycle(form);
        savedCycle = {
          id: result.evaluationCycleId,
          nombre: form.nombre,
          descripcion: form.descripcion || null,
          activo: true,
          fechaInicio: form.fechaInicio,
          fechaFin: form.fechaFin,
          tipoEvaluacion: form.tipoEvaluacion,
          templateIds: [],
          fechaCompletado: null,
        };
      }
      setSaved(true);

      // Write the known-good result straight into the cache instead of only
      // invalidating — see the equivalent note in template-form.tsx.
      queryClient.setQueryData<EvaluationCycleResponse[]>(EVALUATION_CYCLES_QUERY_KEY, (old) =>
        upsertById(old, savedCycle),
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : `No se pudo ${isEditing ? "actualizar" : "crear"} el ciclo. Inténtalo de nuevo.`,
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
          Ciclo <strong>{form.nombre}</strong> {isEditing ? "actualizado" : "creado"} con éxito.
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
        label="Nombre del ciclo"
        icon={<ClipboardIcon className="h-4 w-4" />}
        value={form.nombre}
        onChange={(e) => update({ nombre: e.target.value })}
        placeholder="Ej. Evaluación H1 2026"
        required
        autoFocus
      />
      <Field
        label="Descripción"
        value={form.descripcion}
        onChange={(e) => update({ descripcion: e.target.value })}
        placeholder="Ciclo semestral de evaluación de desempeño"
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
          label="Fecha de cierre"
          type="date"
          value={form.fechaFin}
          onChange={(e) => update({ fechaFin: e.target.value })}
          required
        />
      </div>

      <Select
        label="Tipo de evaluación"
        options={EVALUATION_TYPE_OPTIONS}
        value={String(form.tipoEvaluacion)}
        onChange={(e) => update({ tipoEvaluacion: Number(e.target.value) as EvaluationType })}
      />

      {error && <Notice tone="error">{error}</Notice>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          {isEditing ? "Guardar cambios" : "Crear ciclo"}
        </Button>
      </div>
    </form>
  );
}
