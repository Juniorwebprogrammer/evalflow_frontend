import type { EvaluationCycleActionResult } from "@/features/evaluation-cycles/domain/evaluation-cycle";
import type { EvaluationCycleRepository } from "@/features/evaluation-cycles/domain/evaluation-cycle-repository";
import { DomainError } from "@/core/errors/errors";

/** Deletes an evaluation cycle via the backend `DELETE /evaluation-cycles/{id}`. */
export class DeleteEvaluationCycle {
  constructor(private readonly cycles: EvaluationCycleRepository) {}

  async execute(
    id: number,
    accessToken: string,
  ): Promise<EvaluationCycleActionResult> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(id) || id <= 0) {
      throw new DomainError("El identificador del ciclo no es válido", 400);
    }

    return this.cycles.remove(id, accessToken);
  }
}
