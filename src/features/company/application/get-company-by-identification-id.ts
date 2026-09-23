import type { CompanyInfo } from "@/features/company/domain/company";
import type { CompanyRepository } from "@/features/company/domain/company-repository";
import { DomainError } from "@/core/errors/errors";

/** Resolves company details from its identificationId. */
export class GetCompanyByIdentificationId {
  constructor(private readonly companies: CompanyRepository) {}

  async execute(identificationId: string): Promise<CompanyInfo | null> {
    const trimmed = identificationId?.trim();
    if (!trimmed) {
      throw new DomainError("El identificador de empresa es obligatorio", 400);
    }
    return this.companies.getByIdentificationId(trimmed);
  }
}
