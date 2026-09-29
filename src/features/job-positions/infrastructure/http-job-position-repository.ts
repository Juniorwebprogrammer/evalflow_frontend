import "server-only";
import type {
  JobPositionInput,
  CreateJobPositionResult,
  JobPositionActionResult,
  JobPositionSummary,
} from "@/features/job-positions/domain/job-position";
import type { JobPositionRepository } from "@/features/job-positions/domain/job-position-repository";
import { BackendClient } from "@/core/http/backend-client";
import { UpstreamError } from "@/core/errors/errors";

/** Raw backend job-position-creation response (PascalCase, tolerant to variations). */
interface CreateJobPositionDto {
  Message?: string;
  message?: string;
  Id?: number;
  id?: number;
}

/** Raw backend generic `{ Message }` response (PascalCase, tolerant to variations). */
interface MessageDto {
  Message?: string;
  message?: string;
}

/**
 * Raw backend `JobPositionDto` (PascalCase, tolerant to variations). The
 * backend doesn't publish the exact field name for the assigned-employee
 * count, so this accepts every plausible alias — mirroring the naming the
 * equivalent `DepartmentSummaryDto.EmployeeCount` already uses.
 */
interface JobPositionDto {
  Id?: number;
  id?: number;
  Nombre?: string;
  nombre?: string;
  Descripcion?: string | null;
  descripcion?: string | null;
  EmployeeCount?: number;
  employeeCount?: number;
  UsuariosCount?: number;
  usuariosCount?: number;
  Usuarios?: number;
  usuarios?: number;
}

export class HttpJobPositionRepository implements JobPositionRepository {
  constructor(private readonly client: BackendClient) {}

  async create(
    input: JobPositionInput,
    accessToken: string,
  ): Promise<CreateJobPositionResult> {
    const dto = await this.client.request<CreateJobPositionDto>(
      "/job-positions",
      {
        method: "POST",
        accessToken,
        body: {
          Nombre: input.Nombre,
          Descripcion: input.Descripcion ?? null,
        },
      },
    );

    if (!dto) {
      throw new UpstreamError(
        "The server did not return a response when creating the job position.",
      );
    }

    return {
      message: dto.Message ?? dto.message ?? "Job position created.",
      id: dto.Id ?? dto.id ?? 0,
    };
  }

  async update(
    id: number,
    input: JobPositionInput,
    accessToken: string,
  ): Promise<JobPositionActionResult> {
    const dto = await this.client.request<MessageDto>(
      `/job-positions/${id}`,
      {
        method: "PUT",
        accessToken,
        body: {
          Nombre: input.Nombre,
          Descripcion: input.Descripcion ?? null,
        },
      },
    );

    return {
      message: dto?.Message ?? dto?.message ?? "Job position updated.",
    };
  }

  async remove(id: number, accessToken: string): Promise<JobPositionActionResult> {
    const dto = await this.client.request<MessageDto>(
      `/job-positions/${id}`,
      { method: "DELETE", accessToken },
    );

    return {
      message:
        dto?.Message ??
        dto?.message ??
        "Job position deleted. Employees who held it no longer have a job position.",
    };
  }

  async listAll(accessToken: string): Promise<JobPositionSummary[]> {
    const dto = await this.client.request<JobPositionDto[]>("/job-positions", {
      accessToken,
    });

    return (dto ?? []).map((jp) => ({
      id: jp.Id ?? jp.id ?? 0,
      nombre: jp.Nombre ?? jp.nombre ?? "",
      descripcion: jp.Descripcion ?? jp.descripcion ?? null,
      employeeCount:
        jp.EmployeeCount ??
        jp.employeeCount ??
        jp.UsuariosCount ??
        jp.usuariosCount ??
        jp.Usuarios ??
        jp.usuarios ??
        0,
    }));
  }
}
