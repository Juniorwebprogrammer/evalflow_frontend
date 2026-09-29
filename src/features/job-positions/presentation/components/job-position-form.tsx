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
import { errorMessage } from "@/shared/lib/api-error";

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
        errorMessage(
          err,
          isEditing
            ? "We couldn't update the job position."
            : "We couldn't create the job position.",
        ),
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
          Job position <strong>{form.nombre}</strong>{" "}
          {isEditing ? "updated" : "created"}.
        </Notice>
        <Button type="button" className="mt-5 w-full" onClick={onSaved}>
          Done
        </Button>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        label="Name"
        icon={<BriefcaseIcon className="h-4 w-4" />}
        value={form.nombre}
        onChange={(e) => update({ nombre: e.target.value })}
        placeholder="Account Manager"
        required
        autoFocus
      />
      <Field
        label="Description"
        value={form.descripcion}
        onChange={(e) => update({ descripcion: e.target.value })}
        placeholder="Manages relationships with key customers"
      />

      {error && <Notice tone="error">{error}</Notice>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {isEditing ? "Save changes" : "Create job position"}
        </Button>
      </div>
    </form>
  );
}
