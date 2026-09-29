"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Field } from "@/shared/ui/field";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { BuildingIcon, CheckCircleIcon } from "@/shared/ui/icons";
import { createDepartment } from "@/features/departments/presentation/api/department-client";
import { DEPARTMENTS_QUERY_KEY } from "@/features/departments/presentation/hooks/use-departments";
import { errorMessage } from "@/shared/lib/api-error";

interface FormState {
  nombre: string;
  descripcion: string;
}

const EMPTY: FormState = { nombre: "", descripcion: "" };

/**
 * Department-creation form, meant to be embedded inside a modal (no card
 * wrapper of its own — the modal supplies title/description/icon).
 */
export function CreateDepartmentForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  function update(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createDepartment(form);
      setCreated(true);
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
    } catch (err) {
      setError(
        errorMessage(err, "We couldn't create the department.", {
          byDetail: [
            [
              "tu plan",
              "You've reached your plan's department limit. Upgrade your plan to add more.",
            ],
          ],
        }),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <>
        <Notice
          tone="success"
          icon={<CheckCircleIcon className="h-5 w-5 text-emerald-600" />}
        >
          Department <strong>{form.nombre}</strong> created.
        </Notice>
        <Button type="button" className="mt-5 w-full" onClick={onCreated}>
          Done
        </Button>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        label="Name"
        icon={<BuildingIcon className="h-4 w-4" />}
        value={form.nombre}
        onChange={(e) => update({ nombre: e.target.value })}
        placeholder="Customer Success"
        required
        autoFocus
      />
      <Field
        label="Description"
        value={form.descripcion}
        onChange={(e) => update({ descripcion: e.target.value })}
        placeholder="Onboarding, support and retention of our customers"
      />

      {error && <Notice tone="error">{error}</Notice>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Create department
        </Button>
      </div>
    </form>
  );
}
