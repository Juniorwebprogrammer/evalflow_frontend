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
      title="Completar evaluación"
      description={cycleName}
      icon={<CheckCircleIcon className="h-5 w-5" />}
      disableClose={isCompleting}
    >
      {result ? (
        <div className="space-y-4">
          <Notice tone="success" icon={<CheckCircleIcon className="h-5 w-5" />}>
            {result.message} Se han generado <strong>{result.resultsGenerated}</strong> informes
            {result.autoCompletedSubmissions > 0 && (
              <>
                {" "}y se han completado automáticamente{" "}
                <strong>{result.autoCompletedSubmissions}</strong> formularios pendientes
              </>
            )}
            . Los empleados ya pueden descargarlos desde «Resultados de evaluación».
          </Notice>
          <div className="flex justify-end">
            <Button type="button" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-sm text-slate-600">
          <p>Al completar la evaluación:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Los formularios que sigan pendientes se completarán con las respuestas que tengan ahora.</li>
            <li>
              Se guardará el resultado de cada empleado con la respuesta aceptada de cada pregunta y se
              generará su informe en PDF.
            </li>
            <li>Cada empleado recibirá un email para descargar su informe.</li>
            <li>El ciclo quedará cerrado y ya no admitirá cambios.</li>
          </ul>

          {error && (
            <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
              {error}
            </Notice>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isCompleting}>
              Cancelar
            </Button>
            <Button type="button" loading={isCompleting} onClick={handleConfirm}>
              Completar evaluación
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
