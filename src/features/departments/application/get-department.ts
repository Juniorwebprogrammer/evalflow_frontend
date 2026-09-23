import type { DepartmentDetails } from "@/features/departments/domain/department";
import type { DepartmentRepository } from "@/features/departments/domain/department-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Fetches a department (with its employee roster) via the backend
 * `GET /departments/{id}`. Returns `null` when it does not exist or does not
 * belong to the caller's company, so the route handler can answer 404.
 */
export class GetDepartment {
  constructor(private readonly departments: DepartmentRepository) {}

  async execute(
    id: number,
    accessToken: string,
  ): Promise<DepartmentDetails | null> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(id) || id <= 0) {
      throw new DomainError("El identificador del departamento no es válido", 400);
    }

    return this.departments.getById(id, accessToken);
  }
}
