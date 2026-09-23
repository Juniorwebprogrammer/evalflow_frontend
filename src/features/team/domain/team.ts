/**
 * Team entities — inviting employees to the organization.
 * The request body maps 1:1 to the backend `Team/invite` contract.
 */
export interface InviteEmployeeInput {
  Nombre: string;
  Apellidos: string;
  Email: string;
  Rol: string;
}

/** Mirrors backend `InviteEmployeeResponse`. */
export interface InviteEmployeeResult {
  message: string;
  userId: string;
  email: string;
  rolAsignado: string;
}

/** Body for the backend `PUT /team/{userId}/department`. `null` unassigns. */
export interface AssignDepartmentInput {
  UserId: number;
  DepartmentId: number | null;
}

/** Mirrors the backend department-assignment response — always a generic message. */
export interface AssignDepartmentResult {
  message: string;
}

/** Body for the backend `PUT /team/{userId}/superior`. `null` unassigns. */
export interface AssignSuperiorInput {
  UserId: number;
  SuperiorId: number | null;
}

/** Mirrors the backend superior-assignment response — always a generic message. */
export interface AssignSuperiorResult {
  message: string;
}

/** Body for the backend `PUT /team/{userId}/job-position`. `null` unassigns. */
export interface AssignJobPositionInput {
  UserId: number;
  JobPositionId: number | null;
}

/** Mirrors the backend job-position-assignment response — always a generic message. */
export interface AssignJobPositionResult {
  message: string;
}

/**
 * Mirrors backend `SubordinateDto`. `cargo` and `activo` are optional on the
 * wire — older backend versions may not send them yet.
 */
export interface Subordinate {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
  cargo: string | null;
  activo: boolean;
}

/** The department an employee belongs to, as embedded in `GetEmployeeResponse`. */
export interface EmployeeDepartmentRef {
  id: number;
  nombre: string;
}

/** The direct superior of an employee, as embedded in `GetEmployeeResponse`. */
export interface EmployeeSuperiorRef {
  id: number;
  nombre: string;
  apellidos: string;
}

/**
 * Mirrors backend `GetEmployeeResponse` (the full employee directory for the
 * tenant). `departamento`, `superior` and `cargo` are optional — the backend
 * may not populate them yet, in which case they arrive as `null`.
 */
export interface Employee {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
  fechaCreacion: string;
  cargo: string | null;
  activo: boolean;
  departamento: EmployeeDepartmentRef | null;
  superior: EmployeeSuperiorRef | null;
}

/** Body for the backend `PUT /team/{userId}/status`. */
export interface ToggleUserStatusInput {
  UserId: number;
  Activo: boolean;
}

/** Mirrors the backend status-toggle response — always a generic message. */
export interface ToggleUserStatusResult {
  message: string;
}

/**
 * Body for the backend `POST /team/accept-invite`. Public flow — completes
 * the invitation started by `Team/invite`, setting the employee's own name
 * and password.
 */
export interface AcceptInviteInput {
  Token: string;
  Nombre: string;
  Apellidos: string;
  Password: string;
}

/** Mirrors the backend `POST /team/accept-invite` response — a generic message. */
export interface AcceptInviteResult {
  message: string;
}
