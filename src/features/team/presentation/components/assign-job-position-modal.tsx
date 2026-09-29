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
import { errorMessage } from "@/shared/lib/api-error";

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
    { value: NONE, label: "No job position" },
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
        errorMessage(err, "We couldn't assign the job position.", {
          byDetail: [
            [
              "el cargo no existe",
              "This job position no longer exists. Refresh the page and choose another one.",
            ],
          ],
        }),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      title="Assign job position"
      description={`Choose the job position for ${employee.nombre} ${employee.apellidos}.`}
      icon={<BriefcaseIcon className="h-5 w-5" />}
    >
      {done ? (
        <>
          <Notice
            tone="success"
            icon={<CheckCircleIcon className="h-5 w-5 text-emerald-600" />}
          >
            Job position updated.
          </Notice>
          <Button type="button" className="mt-5 w-full" onClick={onClose}>
            Close
          </Button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Job position"
            options={options}
            value={jobPositionId}
            onChange={(e) => setJobPositionId(e.target.value)}
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
