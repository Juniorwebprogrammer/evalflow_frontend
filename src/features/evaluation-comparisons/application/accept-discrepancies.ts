import type {
  AcceptDiscrepanciesInput,
  AcceptedDiscrepancy,
} from "@/features/evaluation-comparisons/domain/evaluation-comparison";
import type { EvaluationComparisonRepository } from "@/features/evaluation-comparisons/domain/evaluation-comparison-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Accepts one or more imbalances of an employee's comparison (Owner/RRHH),
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
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(cycleId) || cycleId <= 0) {
      throw new DomainError("El identificador no es válido", 400);
    }
    if (!Number.isInteger(input.evaluatedUserId) || input.evaluatedUserId <= 0) {
      throw new DomainError("El empleado indicado no es válido", 400);
    }
    if (!Number.isInteger(input.templateId) || input.templateId <= 0) {
      throw new DomainError("La plantilla indicada no es válida", 400);
    }
    if (input.questionIds.length === 0 || input.questionIds.some((id) => !Number.isInteger(id) || id <= 0)) {
      throw new DomainError("Indica al menos una pregunta a aceptar.", 400);
    }
    if (input.source !== "Superior" && input.source !== "Autoevaluacion") {
      throw new DomainError("La respuesta aceptada no es válida.", 400);
    }

    return this.comparisons.acceptDiscrepancies(cycleId, input, accessToken);
  }
}
