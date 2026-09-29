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
      throw new DomainError("Invalid session. Please sign in again.", 401);
    }
    if (!Number.isInteger(id) || id <= 0) {
      throw new DomainError("Invalid job position ID.", 400);
    }
    if (!input.Nombre.trim()) {
      throw new DomainError("Job position name is required.", 400);
    }

    return this.jobPositions.update(
      id,
      { Nombre: input.Nombre.trim(), Descripcion: input.Descripcion?.trim() || null },
      accessToken,
    );
  }
}
