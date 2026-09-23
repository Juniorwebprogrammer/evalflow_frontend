import type {
  InviteEmployeeInput,
  InviteEmployeeResult,
  AssignDepartmentInput,
  AssignDepartmentResult,
  AssignSuperiorInput,
  AssignSuperiorResult,
  AssignJobPositionInput,
  AssignJobPositionResult,
  Subordinate,
  ToggleUserStatusInput,
  ToggleUserStatusResult,
  AcceptInviteInput,
  AcceptInviteResult,
  Employee,
} from "@/features/team/domain/team";

/** Port for team management. Implemented by the infrastructure layer. */
export interface TeamRepository {
  /**
   * Invites an employee. `accessToken` is the JWT of the authenticated caller,
   * forwarded to the backend as a bearer token.
   */
  invite(
    input: InviteEmployeeInput,
    accessToken: string,
  ): Promise<InviteEmployeeResult>;

  /** Assigns (or unassigns, when `DepartmentId` is `null`) an employee's department. */
  assignDepartment(
    input: AssignDepartmentInput,
    accessToken: string,
  ): Promise<AssignDepartmentResult>;

  /** Assigns (or unassigns, when `SuperiorId` is `null`) an employee's direct superior. */
  assignSuperior(
    input: AssignSuperiorInput,
    accessToken: string,
  ): Promise<AssignSuperiorResult>;

  /** Assigns (or unassigns, when `JobPositionId` is `null`) an employee's job position (cargo). */
  assignJobPosition(
    input: AssignJobPositionInput,
    accessToken: string,
  ): Promise<AssignJobPositionResult>;

  /** Lists the direct reports of the given user. */
  getSubordinates(
    userId: number,
    accessToken: string,
  ): Promise<Subordinate[]>;

  /** Activates or deactivates an employee's account. */
  toggleUserStatus(
    input: ToggleUserStatusInput,
    accessToken: string,
  ): Promise<ToggleUserStatusResult>;

  /** Completes an invitation. Public — no session required. */
  acceptInvite(input: AcceptInviteInput): Promise<AcceptInviteResult>;

  /** Lists every employee of the caller's company (tenant-scoped). */
  getEmployees(accessToken: string): Promise<Employee[]>;
}
