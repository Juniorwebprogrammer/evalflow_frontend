import type {
  JobPositionInput,
  JobPositionActionResult,
} from "@/features/job-positions/domain/job-position";
import type { JobPositionRepository } from "@/features/job-positions/domain/job-position-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Updates a job position's name/description via the backend
 * `PUT /job-positions/{id}`.
 */
export class UpdateJobPosition {
  constructor(private readonly jobPositions: JobPositionRepository) {}

  async execute(
    id: number,
    input: JobPositionInput,
    accessToken: string,
  ): Promise<JobPositionActionResult> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(id) || id <= 0) {
      throw new DomainError("El identificador del cargo no es válido", 400);
    }
    if (!input.Nombre.trim()) {
      throw new DomainError("El nombre del cargo es obligatorio", 400);
    }

    return this.jobPositions.update(
      id,
      { Nombre: input.Nombre.trim(), Descripcion: input.Descripcion?.trim() || null },
      accessToken,
    );
  }
}
