/**
 * Job position (cargo) entities — organizational positions within a
 * company. Request bodies map 1:1 to the backend `Features/JobPositions`
 * contracts (`POST /job-positions`, `PUT /job-positions/{id}`).
 */
export interface JobPositionInput {
  Nombre: string;
  Descripcion?: string | null;
}

/** Mirrors the backend `POST /job-positions` success response. */
export interface CreateJobPositionResult {
  message: string;
  id: number;
}

/** Mirrors the backend generic `{ Message }` response returned by update/delete. */
export interface JobPositionActionResult {
  message: string;
}

/** Mirrors backend `JobPositionDto`, returned by `GET /job-positions`. */
export interface JobPositionSummary {
  id: number;
  nombre: string;
  descripcion: string | null;
  employeeCount: number;
}
