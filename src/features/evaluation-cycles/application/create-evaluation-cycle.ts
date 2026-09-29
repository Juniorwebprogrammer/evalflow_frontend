import type {
  CreateEvaluationCycleInput,
  CreateEvaluationCycleResult,
} from "@/features/evaluation-cycles/domain/evaluation-cycle";
import type { EvaluationCycleRepository } from "@/features/evaluation-cycles/domain/evaluation-cycle-repository";
import { DomainError } from "@/core/errors/errors";

/** Creates an evaluation cycle via the backend `POST /evaluation-cycles`. */
export class CreateEvaluationCycle {
  constructor(private readonly cycles: EvaluationCycleRepository) {}

  async execute(
    input: CreateEvaluationCycleInput,
    accessToken: string,
  ): Promise<CreateEvaluationCycleResult> {
    if (!accessToken) {
      throw new DomainError("Invalid session. Please sign in again.", 401);
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

    return this.cycles.create(
      {
        Nombre: input.Nombre.trim(),
        Descripcion: input.Descripcion?.trim() || null,
        FechaInicio: input.FechaInicio,
        FechaFin: input.FechaFin,
        TipoEvaluacion: input.TipoEvaluacion,
      },
      accessToken,
    );
  }
}
