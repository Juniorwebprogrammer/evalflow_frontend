import type {
  AcceptDiscrepanciesInput,
  AcceptedDiscrepancy,
} from "@/features/evaluation-comparisons/domain/evaluation-comparison";
import type { EvaluationComparisonRepository } from "@/features/evaluation-comparisons/domain/evaluation-comparison-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Accepts one or more imbalances of an employee's comparison (Owner/HR),
 * choosing which answer becomes the final one in the evaluation result.
 */
export class AcceptDiscrepancies {
  constructor(private readonly comparisons: EvaluationComparisonRepository) {}

  async execute(
    cycleId: number,
    input: AcceptDiscrepanciesInput,
    accessToken: string,
  ): Promise<AcceptedDiscrepancy[]> {
    if (!accessToken) {
      throw new DomainError("Invalid session. Please sign in again.", 401);
    }
    if (!Number.isInteger(cycleId) || cycleId <= 0) {
      throw new DomainError("The ID is not valid", 400);
    }
    if (!Number.isInteger(input.evaluatedUserId) || input.evaluatedUserId <= 0) {
      throw new DomainError("The given employee is not valid", 400);
    }
    if (!Number.isInteger(input.templateId) || input.templateId <= 0) {
      throw new DomainError("The given template is not valid", 400);
    }
    if (input.questionIds.length === 0 || input.questionIds.some((id) => !Number.isInteger(id) || id <= 0)) {
      throw new DomainError("Choose at least one question to accept.", 400);
    }
    if (input.source !== "Superior" && input.source !== "Autoevaluacion") {
      throw new DomainError("The accepted answer is not valid.", 400);
    }

    return this.comparisons.acceptDiscrepancies(cycleId, input, accessToken);
  }
}
