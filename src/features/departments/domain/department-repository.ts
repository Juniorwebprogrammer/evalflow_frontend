import type {
  CreateDepartmentInput,
  CreateDepartmentResult,
  DepartmentDetails,
  DepartmentSummary,
} from "@/features/departments/domain/department";

/** Port for department management. Implemented by the infrastructure layer. */
export interface DepartmentRepository {
  /**
   * Creates a department for the caller's company. `accessToken` is the JWT
   * of the authenticated caller, forwarded to the backend as a bearer token.
   */
  create(
    input: CreateDepartmentInput,
    accessToken: string,
  ): Promise<CreateDepartmentResult>;

  /**
   * Returns a department (with its employee roster), or `null` when it does
   * not exist or does not belong to the caller's company.
   */
  getById(id: number, accessToken: string): Promise<DepartmentDetails | null>;

  /** Lists every department of the caller's company, with its employee count. */
  listAll(accessToken: string): Promise<DepartmentSummary[]>;
}
