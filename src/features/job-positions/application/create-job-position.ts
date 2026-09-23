import type {
  JobPositionInput,
  CreateJobPositionResult,
} from "@/features/job-positions/domain/job-position";
import type { JobPositionRepository } from "@/features/job-positions/domain/job-position-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Creates a job position for the caller's company via the backend
 * `POST /job-positions`. Validates the payload before delegating to the
 * job position repository.
 */
export class CreateJobPosition {
  constructor(private readonly jobPositions: JobPositionRepository) {}

  async execute(
    input: JobPositionInput,
    accessToken: string,
  ): Promise<CreateJobPositionResult> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }

    if (!input.Nombre.trim()) {
      throw new DomainError("El nombre del cargo es obligatorio", 400);
    }

    return this.jobPositions.create(
      { Nombre: input.Nombre.trim(), Descripcion: input.Descripcion?.trim() || null },
      accessToken,
    );
  }
}
