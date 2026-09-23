import "server-only";
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
import type { TeamRepository } from "@/features/team/domain/team-repository";
import { BackendClient } from "@/core/http/backend-client";
import { UpstreamError } from "@/core/errors/errors";

/** Raw backend InviteEmployeeResponse (PascalCase, tolerant to variations). */
interface InviteEmployeeDto {
  Message?: string;
  message?: string;
  UserId?: string;
  userId?: string;
  Email?: string;
  email?: string;
  RolAsignado?: string;
  rolAsignado?: string;
}

/** Raw backend generic `{ Message }` response (PascalCase, tolerant to variations). */
interface MessageDto {
  Message?: string;
  message?: string;
}

/**
 * Raw backend `SubordinateDto`. `Cargo` and `Activo` are optional — older
 * backend versions may not send them yet.
 */
interface SubordinateDto {
  Id?: number;
  id?: number;
  Nombre?: string;
  nombre?: string;
  Apellidos?: string;
  apellidos?: string;
  Email?: string;
  email?: string;
  Rol?: string;
  rol?: string;
  Cargo?: string | null;
  cargo?: string | null;
  Activo?: boolean;
  activo?: boolean;
}

/** Raw backend department reference embedded in `GetEmployeeResponse`. */
interface EmployeeDepartmentDto {
  Id?: number;
  id?: number;
  Nombre?: string;
  nombre?: string;
}

/** Raw backend superior reference embedded in `GetEmployeeResponse`. */
interface EmployeeSuperiorDto {
  Id?: number;
  id?: number;
  Nombre?: string;
  nombre?: string;
  Apellidos?: string;
  apellidos?: string;
}

/**
 * Raw backend `GetEmployeeResponse`. Note the backend field is `Apellido`
 * (singular) here, unlike `InviteEmployeeRecord`/`SubordinateDto` which use
 * `Apellidos` — tolerant to both so a backend fix doesn't break this mapping.
 * `Departamento`, `Superior`, `Cargo` and `Activo` are all optional — older
 * backend versions may not send them yet.
 */
interface EmployeeDto {
  Id?: string;
  id?: string;
  Nombre?: string;
  nombre?: string;
  Apellido?: string;
  apellido?: string;
  Apellidos?: string;
  apellidos?: string;
  Email?: string;
  email?: string;
  Rol?: string;
  rol?: string;
  FechaCreacion?: string;
  fechaCreacion?: string;
  Cargo?: string | null;
  cargo?: string | null;
  Activo?: boolean;
  activo?: boolean;
  Departamento?: EmployeeDepartmentDto | null;
  departamento?: EmployeeDepartmentDto | null;
  Superior?: EmployeeSuperiorDto | null;
  superior?: EmployeeSuperiorDto | null;
}

export class HttpTeamRepository implements TeamRepository {
  constructor(private readonly client: BackendClient) {}

  async invite(
    input: InviteEmployeeInput,
    accessToken: string,
  ): Promise<InviteEmployeeResult> {
    const dto = await this.client.request<InviteEmployeeDto>("/Team/invite", {
      method: "POST",
      accessToken,
      body: {
        Nombre: input.Nombre,
        Apellidos: input.Apellidos,
        Email: input.Email,
        Rol: input.Rol,
      },
    });

    if (!dto) {
      throw new UpstreamError(
        "El servidor no devolvió una respuesta de invitación",
      );
    }

    return {
      message: dto.Message ?? dto.message ?? "Invitación enviada",
      userId: dto.UserId ?? dto.userId ?? "",
      email: dto.Email ?? dto.email ?? input.Email,
      rolAsignado: dto.RolAsignado ?? dto.rolAsignado ?? input.Rol,
    };
  }

  async assignDepartment(
    input: AssignDepartmentInput,
    accessToken: string,
  ): Promise<AssignDepartmentResult> {
    const dto = await this.client.request<MessageDto>(
      `/team/${input.UserId}/department`,
      {
        method: "PUT",
        accessToken,
        body: { DepartmentId: input.DepartmentId },
      },
    );

    return {
      message:
        dto?.Message ?? dto?.message ?? "Departamento actualizado correctamente.",
    };
  }

  async assignSuperior(
    input: AssignSuperiorInput,
    accessToken: string,
  ): Promise<AssignSuperiorResult> {
    const dto = await this.client.request<MessageDto>(
      `/team/${input.UserId}/superior`,
      {
        method: "PUT",
        accessToken,
        body: { SuperiorId: input.SuperiorId },
      },
    );

    return {
      message: dto?.Message ?? dto?.message ?? "Superior asignado correctamente.",
    };
  }

  async assignJobPosition(
    input: AssignJobPositionInput,
    accessToken: string,
  ): Promise<AssignJobPositionResult> {
    const dto = await this.client.request<MessageDto>(
      `/team/${input.UserId}/job-position`,
      {
        method: "PUT",
        accessToken,
        body: { JobPositionId: input.JobPositionId },
      },
    );

    return {
      message: dto?.Message ?? dto?.message ?? "Cargo asignado correctamente.",
    };
  }

  async getSubordinates(
    userId: number,
    accessToken: string,
  ): Promise<Subordinate[]> {
    const dto = await this.client.request<SubordinateDto[]>(
      `/team/${userId}/subordinates`,
      { method: "GET", accessToken },
    );

    return (dto ?? []).map((s) => ({
      id: s.Id ?? s.id ?? 0,
      nombre: s.Nombre ?? s.nombre ?? "",
      apellidos: s.Apellidos ?? s.apellidos ?? "",
      email: s.Email ?? s.email ?? "",
      rol: s.Rol ?? s.rol ?? "",
      cargo: s.Cargo ?? s.cargo ?? null,
      activo: s.Activo ?? s.activo ?? true,
    }));
  }

  async toggleUserStatus(
    input: ToggleUserStatusInput,
    accessToken: string,
  ): Promise<ToggleUserStatusResult> {
    const dto = await this.client.request<MessageDto>(
      `/team/${input.UserId}/status`,
      {
        method: "PUT",
        accessToken,
        body: { Activo: input.Activo },
      },
    );

    return {
      message:
        dto?.Message ??
        dto?.message ??
        (input.Activo
          ? "La cuenta del empleado ha sido activada correctamente."
          : "La cuenta del empleado ha sido desactivada correctamente."),
    };
  }

  async getEmployees(accessToken: string): Promise<Employee[]> {
    const dto = await this.client.request<EmployeeDto[]>("/Team/list", {
      method: "GET",
      accessToken,
    });

    return (dto ?? []).map((e) => {
      const departamento = e.Departamento ?? e.departamento;
      const superior = e.Superior ?? e.superior;

      return {
        id: e.Id ?? e.id ?? "",
        nombre: e.Nombre ?? e.nombre ?? "",
        apellidos: e.Apellido ?? e.apellido ?? e.Apellidos ?? e.apellidos ?? "",
        email: e.Email ?? e.email ?? "",
        rol: e.Rol ?? e.rol ?? "",
        fechaCreacion: e.FechaCreacion ?? e.fechaCreacion ?? "",
        cargo: e.Cargo ?? e.cargo ?? null,
        activo: e.Activo ?? e.activo ?? true,
        departamento: departamento
          ? {
              id: departamento.Id ?? departamento.id ?? 0,
              nombre: departamento.Nombre ?? departamento.nombre ?? "",
            }
          : null,
        superior: superior
          ? {
              id: superior.Id ?? superior.id ?? 0,
              nombre: superior.Nombre ?? superior.nombre ?? "",
              apellidos: superior.Apellidos ?? superior.apellidos ?? "",
            }
          : null,
      };
    });
  }

  async acceptInvite(input: AcceptInviteInput): Promise<AcceptInviteResult> {
    const dto = await this.client.request<MessageDto>("/team/accept-invite", {
      method: "POST",
      body: {
        Token: input.Token,
        Nombre: input.Nombre,
        Apellidos: input.Apellidos,
        Password: input.Password,
      },
    });

    return {
      message:
        dto?.Message ??
        dto?.message ??
        "Invitación aceptada correctamente. Ya puedes iniciar sesión.",
    };
  }
}
