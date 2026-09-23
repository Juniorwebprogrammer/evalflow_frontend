import { ApiError, parseMessage } from "@/shared/lib/api-error";

export interface InviteEmployeeResponse {
  message: string;
  userId: string;
  email: string;
  rolAsignado: string;
}

/**
 * Invites an employee via our own route handler. The bearer token is added
 * server-side from the session cookie, so it never touches the browser.
 */
export async function inviteEmployee(input: {
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
}): Promise<InviteEmployeeResponse> {
  const res = await fetch("/api/team/invite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Nombre: input.nombre,
      Apellidos: input.apellidos,
      Email: input.email,
      Rol: input.rol,
    }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as InviteEmployeeResponse;
}

export interface MessageResponse {
  message: string;
}

/**
 * Assigns (or unassigns, passing `departmentId: null`) an employee's
 * department via our own route handler.
 */
export async function assignDepartment(
  userId: number,
  departmentId: number | null,
): Promise<MessageResponse> {
  const res = await fetch(`/api/team/${userId}/department`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ DepartmentId: departmentId }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as MessageResponse;
}

/**
 * Assigns (or unassigns, passing `superiorId: null`) an employee's direct
 * superior via our own route handler.
 */
export async function assignSuperior(
  userId: number,
  superiorId: number | null,
): Promise<MessageResponse> {
  const res = await fetch(`/api/team/${userId}/superior`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ SuperiorId: superiorId }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as MessageResponse;
}

/**
 * Assigns (or unassigns, passing `jobPositionId: null`) an employee's job
 * position (cargo) via our own route handler.
 */
export async function assignJobPosition(
  userId: number,
  jobPositionId: number | null,
): Promise<MessageResponse> {
  const res = await fetch(`/api/team/${userId}/job-position`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ JobPositionId: jobPositionId }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as MessageResponse;
}

export interface SubordinateResponse {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
  cargo: string | null;
  activo: boolean;
}

/** Lists the direct reports of a user via our own route handler. */
export async function getSubordinates(
  userId: number,
): Promise<SubordinateResponse[]> {
  const res = await fetch(`/api/team/${userId}/subordinates`, {
    method: "GET",
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as SubordinateResponse[];
}

export interface EmployeeDepartmentResponse {
  id: number;
  nombre: string;
}

export interface EmployeeSuperiorResponse {
  id: number;
  nombre: string;
  apellidos: string;
}

export interface EmployeeResponse {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
  fechaCreacion: string;
  cargo: string | null;
  activo: boolean;
  departamento: EmployeeDepartmentResponse | null;
  superior: EmployeeSuperiorResponse | null;
}

/** Lists every employee of the caller's company via our own route handler. */
export async function listEmployees(): Promise<EmployeeResponse[]> {
  const res = await fetch("/api/team/list", { method: "GET" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as EmployeeResponse[];
}

/**
 * Activates (or deactivates) an employee's account via our own route
 * handler.
 */
export async function toggleUserStatus(
  userId: number,
  activo: boolean,
): Promise<MessageResponse> {
  const res = await fetch(`/api/team/${userId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Activo: activo }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as MessageResponse;
}

export interface OrgChartData {
  employees: EmployeeResponse[];
  /** Maps an employee id to the ids of its direct reports. */
  childrenOf: Record<string, string[]>;
}

/**
 * Builds the full reporting graph by combining `Team/list` with a
 * `Team/{id}/subordinates` call per employee — there is no single backend
 * endpoint for this yet. A failed lookup for one employee degrades to "no
 * known reports" for that employee instead of failing the whole chart.
 */
export async function fetchOrgChart(): Promise<OrgChartData> {
  const employees = await listEmployees();

  const entries = await Promise.all(
    employees.map(async (employee) => {
      try {
        const subordinates = await getSubordinates(Number(employee.id));
        return [employee.id, subordinates.map((s) => String(s.id))] as const;
      } catch {
        return [employee.id, []] as const;
      }
    }),
  );

  return { employees, childrenOf: Object.fromEntries(entries) };
}

/**
 * Completes an employee invitation via our own route handler. Public — no
 * session cookie involved.
 */
export async function acceptInvite(input: {
  token: string;
  nombre: string;
  apellidos: string;
  password: string;
}): Promise<MessageResponse> {
  const res = await fetch("/api/team/accept-invite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Token: input.token,
      Nombre: input.nombre,
      Apellidos: input.apellidos,
      Password: input.password,
    }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as MessageResponse;
}
