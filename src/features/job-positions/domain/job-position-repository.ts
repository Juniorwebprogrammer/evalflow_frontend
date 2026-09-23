import type {
  JobPositionInput,
  CreateJobPositionResult,
  JobPositionActionResult,
  JobPositionSummary,
} from "@/features/job-positions/domain/job-position";

/** Port for job position (cargo) management. Implemented by the infrastructure layer. */
export interface JobPositionRepository {
  /**
   * Creates a job position for the caller's company. `accessToken` is the
   * JWT of the authenticated caller, forwarded to the backend as a bearer
   * token.
   */
  create(
    input: JobPositionInput,
    accessToken: string,
  ): Promise<CreateJobPositionResult>;

  /** Updates a job position's name/description. */
  update(
    id: number,
    input: JobPositionInput,
    accessToken: string,
  ): Promise<JobPositionActionResult>;

  /** Deletes a job position, unassigning it from any employee that held it. */
  remove(id: number, accessToken: string): Promise<JobPositionActionResult>;

  /** Lists every job position of the caller's company, with its employee count. */
  listAll(accessToken: string): Promise<JobPositionSummary[]>;
}
