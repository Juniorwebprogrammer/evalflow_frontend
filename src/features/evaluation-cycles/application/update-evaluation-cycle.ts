import type {
  UpdateEvaluationCycleInput,
  EvaluationCycleActionResult,
} from "@/features/evaluation-cycles/domain/evaluation-cycle";
import type { EvaluationCycleRepository } from "@/features/evaluation-cycles/domain/evaluation-cycle-repository";
import { DomainError } from "@/core/errors/errors";

/** Updates an evaluation cycle via the backend `PUT /evaluation-cycles/{id}`. */
export class UpdateEvaluationCycle {
  constructor(private readonly cycles: EvaluationCycleRepository) {}

  async execute(
    id: number,
    input: UpdateEvaluationCycleInput,
    accessToken: string,
  ): Promise<EvaluationCycleActionResult> {
    if (!accessToken) {
      throw new DomainError("Invalid session. Please sign in again.", 401);
    }
    if (!Number.isInteger(id) || id <= 0) {
      throw new DomainError("The cycle ID is not valid", 400);
    }
    if (!input.Nombre.trim()) {
      throw new DomainError("The cycle name is required", 400);
    }
    if (!input.FechaInicio || !input.FechaFin) {
      throw new DomainError("Start and end dates are required", 400);
    }
    if (new Date(input.FechaFin) < new Date(input.FechaInicio)) {
      throw new DomainError(
        "The end date can't be before the start date",
        400,
      );
    }

    return this.cycles.update(
      id,
      {
        Nombre: input.Nombre.trim(),
        Descripcion: input.Descripcion?.trim() || null,
        Activo: input.Activo,
        FechaInicio: input.FechaInicio,
        FechaFin: input.FechaFin,
        TipoEvaluacion: input.TipoEvaluacion,
      },
      accessToken,
    );
  }
}
