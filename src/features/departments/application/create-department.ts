import type {
  CreateDepartmentInput,
  CreateDepartmentResult,
} from "@/features/departments/domain/department";
import type { DepartmentRepository } from "@/features/departments/domain/department-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Creates a department for the caller's company via the backend
 * `POST /departments`. Validates the payload before delegating to the
 * department repository.
 */
export class CreateDepartment {
  constructor(private readonly departments: DepartmentRepository) {}

  async execute(
    input: CreateDepartmentInput,
    accessToken: string,
  ): Promise<CreateDepartmentResult> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }

    if (!input.Nombre.trim()) {
      throw new DomainError("El nombre del departamento es obligatorio", 400);
    }

    return this.departments.create(
      { Nombre: input.Nombre.trim(), Descripcion: input.Descripcion?.trim() || null },
      accessToken,
    );
  }
}
