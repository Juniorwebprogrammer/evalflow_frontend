import type { DepartmentSummary } from "@/features/departments/domain/department";
import type { DepartmentRepository } from "@/features/departments/domain/department-repository";
import { DomainError } from "@/core/errors/errors";

/** Lists every department of the caller's company via the backend `GET /departments`. */
export class ListDepartments {
  constructor(private readonly departments: DepartmentRepository) {}

  async execute(accessToken: string): Promise<DepartmentSummary[]> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }

    return this.departments.listAll(accessToken);
  }
}
