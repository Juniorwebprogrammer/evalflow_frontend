import type { Company } from "@/features/company/domain/company";
import type { CompanyRepository } from "@/features/company/domain/company-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Resolves a company from the name embedded in the URL.
 * Returns `null` when no company matches, so the UI can fall back to onboarding.
 */
export class GetCompanyByName {
  constructor(private readonly companies: CompanyRepository) {}

  async execute(name: string): Promise<Company | null> {
    const trimmed = name?.trim();
    if (!trimmed) {
      throw new DomainError("El nombre de la empresa es obligatorio", 400);
    }
    return this.companies.getByName(trimmed);
  }
}
