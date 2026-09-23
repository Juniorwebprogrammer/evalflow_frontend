"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/shared/ui/modal";
import { Select } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { ScaleIcon, CheckCircleIcon } from "@/shared/ui/icons";
import {
  assignSuperior,
  type EmployeeResponse,
} from "@/features/team/presentation/api/team-client";
import { ApiError } from "@/shared/lib/api-error";
import { ORG_CHART_QUERY_KEY } from "@/features/team/presentation/hooks/use-org-chart";
import { EMPLOYEES_QUERY_KEY } from "@/features/team/presentation/hooks/use-employees";

const NONE = "";

/**
 * Assigns an employee's direct superior — picked by name from the company
 * directory, never typed as a raw ID.
 */
export function AssignSuperiorModal({
  employee,
  employees,
  onClose,
}: {
  employee: EmployeeResponse;
  employees: EmployeeResponse[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [superiorId, setSuperiorId] = useState(NONE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const options = [
    { value: NONE, label: "Sin superior" },
    ...employees
      .filter((e) => e.id !== employee.id)
      .map((e) => ({ value: e.id, label: `${e.nombre} ${e.apellidos}` })),
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await assignSuperior(
        Number(employee.id),
        superiorId ? Number(superiorId) : null,
      );
      setDone(true);
      queryClient.invalidateQueries({ queryKey: ["subordinates"] });
      queryClient.invalidateQueries({ queryKey: ORG_CHART_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo asignar el superior.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      title="Asignar superior"
      description={`Elige quién será el superior directo de ${employee.nombre} ${employee.apellidos}.`}
      icon={<ScaleIcon className="h-5 w-5" />}
    >
      {done ? (
        <>
          <Notice
            tone="success"
            icon={<CheckCircleIcon className="h-5 w-5 text-emerald-600" />}
          >
            Superior actualizado correctamente.
          </Notice>
          <Button type="button" className="mt-5 w-full" onClick={onClose}>
            Cerrar
          </Button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Superior directo"
            options={options}
            value={superiorId}
            onChange={(e) => setSuperiorId(e.target.value)}
          />

          {error && <Notice tone="error">{error}</Notice>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={submitting}>
              Guardar
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
