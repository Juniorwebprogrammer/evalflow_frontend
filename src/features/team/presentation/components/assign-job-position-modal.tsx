"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/shared/ui/modal";
import { Select } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { BriefcaseIcon, CheckCircleIcon } from "@/shared/ui/icons";
import {
  assignJobPosition,
  type EmployeeResponse,
} from "@/features/team/presentation/api/team-client";
import { EMPLOYEES_QUERY_KEY } from "@/features/team/presentation/hooks/use-employees";
import {
  JOB_POSITIONS_QUERY_KEY,
  useJobPositions,
} from "@/features/job-positions/presentation/hooks/use-job-positions";
import { ApiError } from "@/shared/lib/api-error";

const NONE = "";

/**
 * Assigns an employee's job position (cargo) — picked from the company's
 * job-position catalog, never typed as a raw ID.
 */
export function AssignJobPositionModal({
  employee,
  onClose,
}: {
  employee: EmployeeResponse;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { data: jobPositions } = useJobPositions();
  const [jobPositionId, setJobPositionId] = useState(NONE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const options = [
    { value: NONE, label: "Sin cargo" },
    ...(jobPositions ?? []).map((jp) => ({
      value: String(jp.id),
      label: jp.nombre,
    })),
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await assignJobPosition(
        Number(employee.id),
        jobPositionId ? Number(jobPositionId) : null,
      );
      setDone(true);
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: JOB_POSITIONS_QUERY_KEY });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo asignar el cargo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      title="Asignar cargo"
      description={`Elige el cargo de ${employee.nombre} ${employee.apellidos}.`}
      icon={<BriefcaseIcon className="h-5 w-5" />}
    >
      {done ? (
        <>
          <Notice
            tone="success"
            icon={<CheckCircleIcon className="h-5 w-5 text-emerald-600" />}
          >
            Cargo actualizado correctamente.
          </Notice>
          <Button type="button" className="mt-5 w-full" onClick={onClose}>
            Cerrar
          </Button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Cargo"
            options={options}
            value={jobPositionId}
            onChange={(e) => setJobPositionId(e.target.value)}
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
