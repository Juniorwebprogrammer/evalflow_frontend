import type { UpdateCompanyInput } from "@/features/company/domain/company";
import type { CompanyRepository } from "@/features/company/domain/company-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Updates the caller's company via the backend `Company/update` endpoint.
 * The backend resolves which company from the JWT + enforces the allowed roles.
 */
export class UpdateCompany {
  constructor(private readonly companies: CompanyRepository) {}

  async execute(
    input: UpdateCompanyInput,
    accessToken: string,
  ): Promise<void> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!input.Nombre.trim()) {
      throw new DomainError("El nombre de la empresa es obligatorio", 400);
    }
    return this.companies.update(input, accessToken);
  }
}
