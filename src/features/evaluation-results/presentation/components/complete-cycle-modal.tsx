"use client";

import { useState } from "react";
import { Modal } from "@/shared/ui/modal";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { AlertTriangleIcon, CheckCircleIcon } from "@/shared/ui/icons";
import { useCompleteEvaluationCycle } from "@/features/evaluation-results/presentation/hooks/use-complete-evaluation-cycle";
import type { CompleteEvaluationCycleResponse } from "@/features/evaluation-results/presentation/api/evaluation-result-client";

/**
 * Confirms completing a cycle: pending forms are auto-completed with their
 * current answers, one result (and PDF report) is stored per employee and
 * the cycle is closed for changes.
 */
export function CompleteCycleModal({
  cycleId,
  cycleName,
  onClose,
}: {
  cycleId: number;
  cycleName: string;
  onClose: () => void;
}) {
  const { complete, isCompleting, error } = useCompleteEvaluationCycle(cycleId);
  const [result, setResult] = useState<CompleteEvaluationCycleResponse | null>(null);

  async function handleConfirm() {
    try {
      setResult(await complete());
    } catch {
      // Error is surfaced via `error` below.
    }
  }

  return (
    <Modal
      onClose={onClose}
      title="Complete evaluation"
      description={cycleName}
      icon={<CheckCircleIcon className="h-5 w-5" />}
      disableClose={isCompleting}
    >
      {result ? (
        <div className="space-y-4">
          <Notice tone="success" icon={<CheckCircleIcon className="h-5 w-5" />}>
            The evaluation is complete. <strong>{result.resultsGenerated}</strong>{" "}
            {result.resultsGenerated === 1 ? "report was" : "reports were"} generated
            {result.autoCompletedSubmissions > 0 && (
              <>
                {" "}and <strong>{result.autoCompletedSubmissions}</strong> pending{" "}
                {result.autoCompletedSubmissions === 1 ? "form was" : "forms were"} completed
                automatically
              </>
            )}
            . Employees can now download them from &ldquo;Evaluation results&rdquo;.
          </Notice>
          <div className="flex justify-end">
            <Button type="button" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-sm text-slate-600">
          <p>When you complete the evaluation:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Any forms still pending will be completed with the answers they have now.</li>
            <li>
              Each employee&apos;s result will be saved with the accepted answer for each question, and
              their PDF report will be generated.
            </li>
            <li>Each employee will receive an email to download their report.</li>
            <li>The cycle will be closed and can no longer be changed.</li>
          </ul>

          {error && (
            <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
              {error}
            </Notice>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isCompleting}>
              Cancel
            </Button>
            <Button type="button" loading={isCompleting} onClick={handleConfirm}>
              Complete evaluation
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
