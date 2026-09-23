/**
 * Department entities — organizational departments within a company.
 * The request body maps 1:1 to the backend `POST /departments` contract.
 */
export interface CreateDepartmentInput {
  Nombre: string;
  Descripcion?: string | null;
}

/** Mirrors the backend `POST /departments` success response. */
export interface CreateDepartmentResult {
  message: string;
  departmentId: number;
}

/** Mirrors backend `DepartmentUserDto` — an employee within a department's roster. */
export interface DepartmentUser {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
}

/** Mirrors backend `DepartmentDetailsDto`, returned by `GET /departments/{id}`. */
export interface DepartmentDetails {
  id: number;
  nombre: string;
  descripcion: string | null;
  fechaCreacion: string;
  usuarios: DepartmentUser[];
}

/** Mirrors backend `DepartmentSummaryDto`, returned by `GET /departments`. */
export interface DepartmentSummary {
  id: number;
  nombre: string;
  descripcion: string | null;
  fechaCreacion: string;
  employeeCount: number;
}
