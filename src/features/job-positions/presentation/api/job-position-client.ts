import { ApiError, parseMessage } from "@/shared/lib/api-error";

export interface JobPositionSummaryResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  employeeCount: number;
}

/** Lists every job position of the caller's company via our own route handler. */
export async function listJobPositions(): Promise<JobPositionSummaryResponse[]> {
  const res = await fetch("/api/job-positions", { method: "GET" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as JobPositionSummaryResponse[];
}

export interface CreateJobPositionResponse {
  message: string;
  id: number;
}

/**
 * Creates a job position via our own route handler. The bearer token is
 * added server-side from the session cookie, so it never touches the
 * browser.
 */
export async function createJobPosition(input: {
  nombre: string;
  descripcion?: string;
}): Promise<CreateJobPositionResponse> {
  const res = await fetch("/api/job-positions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Nombre: input.nombre,
      Descripcion: input.descripcion || null,
    }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as CreateJobPositionResponse;
}

export interface JobPositionMessageResponse {
  message: string;
}

/** Updates a job position's name/description via our own route handler. */
export async function updateJobPosition(
  id: number,
  input: { nombre: string; descripcion?: string },
): Promise<JobPositionMessageResponse> {
  const res = await fetch(`/api/job-positions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Nombre: input.nombre,
      Descripcion: input.descripcion || null,
    }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as JobPositionMessageResponse;
}

/** Deletes a job position via our own route handler. */
export async function deleteJobPosition(
  id: number,
): Promise<JobPositionMessageResponse> {
  const res = await fetch(`/api/job-positions/${id}`, { method: "DELETE" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as JobPositionMessageResponse;
}
