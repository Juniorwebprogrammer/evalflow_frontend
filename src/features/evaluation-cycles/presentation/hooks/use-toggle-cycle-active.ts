"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  updateEvaluationCycle,
  type EvaluationCycleResponse,
} from "@/features/evaluation-cycles/presentation/api/evaluation-cycle-client";
import { EVALUATION_CYCLES_QUERY_KEY } from "@/features/evaluation-cycles/presentation/hooks/use-evaluation-cycles";
import { errorMessage } from "@/shared/lib/api-error";
import { upsertById } from "@/shared/lib/query-cache";
import { CYCLE_SAVE_ERRORS } from "@/features/evaluation-cycles/presentation/components/cycle-errors";

/**
 * Flips a cycle's `activo` flag on its own, via the same
 * `PUT /evaluation-cycles/{id}` the edit form uses — but sending only that
 * one field changed, so it works as its own dedicated action instead of
 * being buried inside "Edit".
 */
export function useToggleCycleActive() {
  const queryClient = useQueryClient();
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(cycle: EvaluationCycleResponse) {
    setIsToggling(true);
    setError(null);
    try {
      await updateEvaluationCycle(cycle.id, {
        nombre: cycle.nombre,
        descripcion: cycle.descripcion ?? undefined,
        fechaInicio: cycle.fechaInicio,
        fechaFin: cycle.fechaFin,
        activo: !cycle.activo,
        tipoEvaluacion: cycle.tipoEvaluacion,
      });

      const updated: EvaluationCycleResponse = { ...cycle, activo: !cycle.activo };
      queryClient.setQueryData<EvaluationCycleResponse[]>(EVALUATION_CYCLES_QUERY_KEY, (old) =>
        upsertById(old, updated),
      );
      return updated;
    } catch (err) {
      setError(
        errorMessage(
          err,
          cycle.activo ? "We couldn't deactivate the cycle." : "We couldn't activate the cycle.",
          { byDetail: CYCLE_SAVE_ERRORS },
        ),
      );
      throw err;
    } finally {
      setIsToggling(false);
    }
  }

  return { toggle, isToggling, error };
}
