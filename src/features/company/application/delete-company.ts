import type { DeleteCompanyInput } from "@/features/company/domain/company";
import type { CompanyRepository } from "@/features/company/domain/company-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Permanently deletes the caller's company (and all its users) via the backend
 * `Company/delete` endpoint. Requires the current account password as
 * confirmation.
 */
export class DeleteCompany {
  constructor(private readonly companies: CompanyRepository) {}

  async execute(
    input: DeleteCompanyInput,
    accessToken: string,
  ): Promise<void> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!input.Password) {
      throw new DomainError("La contraseña es obligatoria", 400);
    }
    return this.companies.delete(input, accessToken);
  }
}
