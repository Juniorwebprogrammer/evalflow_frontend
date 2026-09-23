import { ApiError, parseMessage } from "@/shared/lib/api-error";

export interface DepartmentSummaryResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  fechaCreacion: string;
  employeeCount: number;
}

/** Lists every department of the caller's company via our own route handler. */
export async function listDepartments(): Promise<DepartmentSummaryResponse[]> {
  const res = await fetch("/api/departments", { method: "GET" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as DepartmentSummaryResponse[];
}

export interface CreateDepartmentResponse {
  message: string;
  departmentId: number;
}

/**
 * Creates a department via our own route handler. The bearer token is added
 * server-side from the session cookie, so it never touches the browser.
 */
export async function createDepartment(input: {
  nombre: string;
  descripcion?: string;
}): Promise<CreateDepartmentResponse> {
  const res = await fetch("/api/departments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Nombre: input.nombre,
      Descripcion: input.descripcion || null,
    }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as CreateDepartmentResponse;
}

export interface DepartmentUserResponse {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
}

export interface DepartmentDetailsResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  fechaCreacion: string;
  usuarios: DepartmentUserResponse[];
}

/**
 * Fetches a department (with its employee roster) via our own route handler.
 * Returns `null` when it does not exist (404).
 */
export async function fetchDepartment(
  id: number,
): Promise<DepartmentDetailsResponse | null> {
  const res = await fetch(`/api/departments/${id}`, { method: "GET" });

  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as DepartmentDetailsResponse;
}
