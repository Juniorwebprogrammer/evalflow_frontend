import "server-only";
import type {
  CreateDepartmentInput,
  CreateDepartmentResult,
  DepartmentDetails,
  DepartmentSummary,
} from "@/features/departments/domain/department";
import type { DepartmentRepository } from "@/features/departments/domain/department-repository";
import { BackendClient } from "@/core/http/backend-client";
import { UpstreamError } from "@/core/errors/errors";

/** Raw backend department-creation response (PascalCase, tolerant to variations). */
interface CreateDepartmentDto {
  Message?: string;
  message?: string;
  DepartmentId?: number;
  departmentId?: number;
}

/** Raw backend `DepartmentUserDto` (PascalCase, tolerant to variations). */
interface DepartmentUserDto {
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
}

/** Raw backend `DepartmentDetailsDto` (PascalCase, tolerant to variations). */
interface DepartmentDetailsDto {
  Id?: number;
  id?: number;
  Nombre?: string;
  nombre?: string;
  Descripcion?: string | null;
  descripcion?: string | null;
  FechaCreacion?: string;
  fechaCreacion?: string;
  Usuarios?: DepartmentUserDto[];
  usuarios?: DepartmentUserDto[];
}

/** Raw backend `DepartmentSummaryDto` (PascalCase, tolerant to variations). */
interface DepartmentSummaryDto {
  Id?: number;
  id?: number;
  Nombre?: string;
  nombre?: string;
  Descripcion?: string | null;
  descripcion?: string | null;
  FechaCreacion?: string;
  fechaCreacion?: string;
  EmployeeCount?: number;
  employeeCount?: number;
}

export class HttpDepartmentRepository implements DepartmentRepository {
  constructor(private readonly client: BackendClient) {}

  async create(
    input: CreateDepartmentInput,
    accessToken: string,
  ): Promise<CreateDepartmentResult> {
    const dto = await this.client.request<CreateDepartmentDto>("/departments", {
      method: "POST",
      accessToken,
      body: {
        Nombre: input.Nombre,
        Descripcion: input.Descripcion ?? null,
      },
    });

    if (!dto) {
      throw new UpstreamError(
        "El servidor no devolvió una respuesta al crear el departamento",
      );
    }

    return {
      message: dto.Message ?? dto.message ?? "Departamento creado con éxito.",
      departmentId: dto.DepartmentId ?? dto.departmentId ?? 0,
    };
  }

  async getById(
    id: number,
    accessToken: string,
  ): Promise<DepartmentDetails | null> {
    const dto = await this.client.request<DepartmentDetailsDto>(
      `/departments/${id}`,
      { accessToken, allowNotFound: true },
    );

    if (!dto) return null;

    const usuarios = dto.Usuarios ?? dto.usuarios ?? [];

    return {
      id: dto.Id ?? dto.id ?? id,
      nombre: dto.Nombre ?? dto.nombre ?? "",
      descripcion: dto.Descripcion ?? dto.descripcion ?? null,
      fechaCreacion: dto.FechaCreacion ?? dto.fechaCreacion ?? "",
      usuarios: usuarios.map((u) => ({
        id: u.Id ?? u.id ?? 0,
        nombre: u.Nombre ?? u.nombre ?? "",
        apellidos: u.Apellidos ?? u.apellidos ?? "",
        email: u.Email ?? u.email ?? "",
        rol: u.Rol ?? u.rol ?? "",
      })),
    };
  }

  async listAll(accessToken: string): Promise<DepartmentSummary[]> {
    const dto = await this.client.request<DepartmentSummaryDto[]>(
      "/departments",
      { accessToken },
    );

    return (dto ?? []).map((d) => ({
      id: d.Id ?? d.id ?? 0,
      nombre: d.Nombre ?? d.nombre ?? "",
      descripcion: d.Descripcion ?? d.descripcion ?? null,
      fechaCreacion: d.FechaCreacion ?? d.fechaCreacion ?? "",
      employeeCount: d.EmployeeCount ?? d.employeeCount ?? 0,
    }));
  }
}
