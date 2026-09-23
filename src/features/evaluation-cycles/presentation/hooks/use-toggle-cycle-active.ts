"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  updateEvaluationCycle,
  type EvaluationCycleResponse,
} from "@/features/evaluation-cycles/presentation/api/evaluation-cycle-client";
import { EVALUATION_CYCLES_QUERY_KEY } from "@/features/evaluation-cycles/presentation/hooks/use-evaluation-cycles";
import { ApiError } from "@/shared/lib/api-error";
import { upsertById } from "@/shared/lib/query-cache";

/**
 * Flips a cycle's `activo` flag on its own, via the same
 * `PUT /evaluation-cycles/{id}` the edit form uses — but sending only that
 * one field changed, so it works as its own dedicated action instead of
 * being buried inside "Editar".
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
        err instanceof ApiError
          ? err.message
          : "No se pudo actualizar el estado del ciclo. Inténtalo de nuevo.",
      );
      throw err;
    } finally {
      setIsToggling(false);
    }
  }

  return { toggle, isToggling, error };
}
