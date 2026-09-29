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
import { errorMessage } from "@/shared/lib/api-error";
import { SUPERIOR_ERRORS } from "@/features/team/presentation/lib/superior-errors";
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
    { value: NONE, label: "No manager" },
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
        errorMessage(err, "We couldn't assign the manager.", {
          byDetail: SUPERIOR_ERRORS,
        }),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      title="Assign manager"
      description={`Choose who will be the manager of ${employee.nombre} ${employee.apellidos}.`}
      icon={<ScaleIcon className="h-5 w-5" />}
    >
      {done ? (
        <>
          <Notice
            tone="success"
            icon={<CheckCircleIcon className="h-5 w-5 text-emerald-600" />}
          >
            Manager updated.
          </Notice>
          <Button type="button" className="mt-5 w-full" onClick={onClose}>
            Close
          </Button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Manager"
            options={options}
            value={superiorId}
            onChange={(e) => setSuperiorId(e.target.value)}
          />

          {error && <Notice tone="error">{error}</Notice>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
