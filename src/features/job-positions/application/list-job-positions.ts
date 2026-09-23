import type { JobPositionSummary } from "@/features/job-positions/domain/job-position";
import type { JobPositionRepository } from "@/features/job-positions/domain/job-position-repository";
import { DomainError } from "@/core/errors/errors";

/** Lists every job position of the caller's company via the backend `GET /job-positions`. */
export class ListJobPositions {
  constructor(private readonly jobPositions: JobPositionRepository) {}

  async execute(accessToken: string): Promise<JobPositionSummary[]> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }

    return this.jobPositions.listAll(accessToken);
  }
}
