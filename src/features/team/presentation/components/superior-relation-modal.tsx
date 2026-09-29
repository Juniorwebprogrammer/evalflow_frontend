"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/shared/ui/modal";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { ScaleIcon } from "@/shared/ui/icons";
import {
  assignSuperior,
  type EmployeeResponse,
} from "@/features/team/presentation/api/team-client";
import { ORG_CHART_QUERY_KEY } from "@/features/team/presentation/hooks/use-org-chart";
import { EMPLOYEES_QUERY_KEY } from "@/features/team/presentation/hooks/use-employees";
import { errorMessage } from "@/shared/lib/api-error";
import { SUPERIOR_ERRORS } from "@/features/team/presentation/lib/superior-errors";

/** Confirms creating or removing a single "reports to" edge in the org chart. */
export function SuperiorRelationModal({
  type,
  employee,
  superior,
  onClose,
}: {
  type: "connect" | "disconnect";
  /** The employee whose superior is changing. */
  employee: EmployeeResponse;
  /** The superior being assigned (connect) or removed (disconnect). */
  superior: EmployeeResponse;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      await assignSuperior(
        Number(employee.id),
        type === "connect" ? Number(superior.id) : null,
      );
      queryClient.invalidateQueries({ queryKey: ORG_CHART_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["subordinates"] });
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      onClose();
    } catch (err) {
      setError(
        errorMessage(
          err,
          type === "connect"
            ? "We couldn't assign the manager."
            : "We couldn't remove the reporting line.",
          { byDetail: SUPERIOR_ERRORS },
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const employeeName = `${employee.nombre} ${employee.apellidos}`;
  const superiorName = `${superior.nombre} ${superior.apellidos}`;

  return (
    <Modal
      onClose={onClose}
      title={type === "connect" ? "Assign manager" : "Remove reporting line"}
      icon={<ScaleIcon className="h-5 w-5" />}
      disableClose={submitting}
    >
      <p className="text-sm text-slate-600">
        {type === "connect" ? (
          <>
            Make <strong>{superiorName}</strong> the manager of{" "}
            <strong>{employeeName}</strong>?
          </>
        ) : (
          <>
            Remove <strong>{superiorName}</strong> as the manager of{" "}
            <strong>{employeeName}</strong>?
          </>
        )}
      </p>

      {error && (
        <Notice tone="error" className="mt-4">
          {error}
        </Notice>
      )}

      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          type="button"
          variant={type === "disconnect" ? "danger" : "primary"}
          loading={submitting}
          onClick={handleConfirm}
        >
          {type === "connect" ? "Assign" : "Remove"}
        </Button>
      </div>
    </Modal>
  );
}
