import type { DeleteCompanyInput } from "@/features/company/domain/company";
import type { CompanyRepository } from "@/features/company/domain/company-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Permanently deletes the caller's company (and all its users) via the backend
 * `Company/delete` endpoint. Confirmed by typing the company name (accounts
 * have no EvalFlow password: they sign in with Vexxen).
 */
export class DeleteCompany {
  constructor(private readonly companies: CompanyRepository) {}

  async execute(
    input: DeleteCompanyInput,
    accessToken: string,
  ): Promise<void> {
    if (!accessToken) {
      throw new DomainError("Invalid session. Please sign in again.", 401);
    }
    if (!input.CompanyName.trim()) {
      throw new DomainError("Type the company name to confirm", 400);
    }
    return this.companies.delete(input, accessToken);
  }
}
