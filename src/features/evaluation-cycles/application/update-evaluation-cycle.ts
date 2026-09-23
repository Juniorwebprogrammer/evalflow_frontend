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
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(id) || id <= 0) {
      throw new DomainError("El identificador del ciclo no es válido", 400);
    }
    if (!input.Nombre.trim()) {
      throw new DomainError("El nombre del ciclo es obligatorio", 400);
    }
    if (!input.FechaInicio || !input.FechaFin) {
      throw new DomainError("Las fechas de inicio y fin son obligatorias", 400);
    }
    if (new Date(input.FechaFin) < new Date(input.FechaInicio)) {
      throw new DomainError(
        "La fecha de fin no puede ser anterior a la fecha de inicio",
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
