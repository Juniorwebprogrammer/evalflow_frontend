import type { EvaluationCycleActionResult } from "@/features/evaluation-cycles/domain/evaluation-cycle";
import type { EvaluationCycleRepository } from "@/features/evaluation-cycles/domain/evaluation-cycle-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Toggles whether a template belongs to an evaluation cycle, via the
 * backend `PUT /evaluation-cycles/{cycleId}/templates/{templateId}/toggle`.
 */
export class ToggleTemplateInCycle {
  constructor(private readonly cycles: EvaluationCycleRepository) {}

  async execute(
    cycleId: number,
    templateId: number,
    accessToken: string,
  ): Promise<EvaluationCycleActionResult> {
    if (!accessToken) {
      throw new DomainError("Invalid session. Please sign in again.", 401);
    }
    if (
      !Number.isInteger(cycleId) ||
      cycleId <= 0 ||
      !Number.isInteger(templateId) ||
      templateId <= 0
    ) {
      throw new DomainError("The ID is not valid", 400);
    }

    return this.cycles.toggleTemplate(cycleId, templateId, accessToken);
  }
}
