import type { EvaluationCycle } from "@/features/evaluation-cycles/domain/evaluation-cycle";
import type { EvaluationCycleRepository } from "@/features/evaluation-cycles/domain/evaluation-cycle-repository";
import { DomainError } from "@/core/errors/errors";

/** Lists every evaluation cycle of the caller's company via the backend `GET /evaluation-cycles`. */
export class GetAllEvaluationCycles {
  constructor(private readonly cycles: EvaluationCycleRepository) {}

  async execute(accessToken: string): Promise<EvaluationCycle[]> {
    if (!accessToken) {
      throw new DomainError("Invalid session. Please sign in again.", 401);
    }

    return this.cycles.listAll(accessToken);
  }
}
