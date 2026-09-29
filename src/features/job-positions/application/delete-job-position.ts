import type { JobPositionActionResult } from "@/features/job-positions/domain/job-position";
import type { JobPositionRepository } from "@/features/job-positions/domain/job-position-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Deletes a job position via the backend `DELETE /job-positions/{id}`. Any
 * employee holding it is left without a job position on the backend.
 */
export class DeleteJobPosition {
  constructor(private readonly jobPositions: JobPositionRepository) {}

  async execute(id: number, accessToken: string): Promise<JobPositionActionResult> {
    if (!accessToken) {
      throw new DomainError("Invalid session. Please sign in again.", 401);
    }
    if (!Number.isInteger(id) || id <= 0) {
      throw new DomainError("Invalid job position ID.", 400);
    }

    return this.jobPositions.remove(id, accessToken);
  }
}
