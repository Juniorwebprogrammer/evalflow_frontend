import type {
  Company,
  CompanyInfo,
  UpdateCompanyInput,
  DeleteCompanyInput,
} from "@/features/company/domain/company";

/** Port for fetching companies. Implemented by the infrastructure layer. */
export interface CompanyRepository {
  /** Returns the company matching `name`, or `null` when it does not exist. */
  getByName(name: string): Promise<Company | null>;
  /** Returns company details by identificationId, or `null` when missing. */
  getByIdentificationId(identificationId: string): Promise<CompanyInfo | null>;
  /** Updates the caller's company (derived from the JWT on the backend). */
  update(input: UpdateCompanyInput, accessToken: string): Promise<void>;
  /** Permanently deletes the caller's company and all its users. */
  delete(input: DeleteCompanyInput, accessToken: string): Promise<void>;
}
