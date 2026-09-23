import "server-only";
import type {
  Template,
  TemplateInput,
  CreateTemplateResult,
  TemplateActionResult,
} from "@/features/templates/domain/template";
import type { TemplateRepository } from "@/features/templates/domain/template-repository";
import { BackendClient } from "@/core/http/backend-client";
import { UpstreamError } from "@/core/errors/errors";

/** Raw backend template-creation response (PascalCase, tolerant to variations). */
interface CreateTemplateDto {
  Message?: string;
  message?: string;
  TemplateId?: number;
  templateId?: number;
  Id?: number;
  id?: number;
}

/** Raw backend generic `{ Message }` response (PascalCase, tolerant to variations). */
interface MessageDto {
  Message?: string;
  message?: string;
}

/**
 * Raw backend template DTO (PascalCase, tolerant to variations). The exact
 * shape wasn't published — this accepts every plausible alias, mirroring
 * how `JobPositionDto`/`DepartmentSummaryDto` handle the same uncertainty.
 */
interface TemplateDto {
  Id?: number;
  id?: number;
  Titulo?: string;
  titulo?: string;
  Descripcion?: string | null;
  descripcion?: string | null;
  FechaInicio?: string;
  fechaInicio?: string;
  FechaFin?: string;
  fechaFin?: string;
  AssignedUserIds?: number[];
  assignedUserIds?: number[];
}

function mapTemplate(dto: TemplateDto, fallbackId?: number): Template {
  return {
    id: dto.Id ?? dto.id ?? fallbackId ?? 0,
    titulo: dto.Titulo ?? dto.titulo ?? "",
    descripcion: dto.Descripcion ?? dto.descripcion ?? null,
    fechaInicio: dto.FechaInicio ?? dto.fechaInicio ?? "",
    fechaFin: dto.FechaFin ?? dto.fechaFin ?? "",
    assignedUserIds: dto.AssignedUserIds ?? dto.assignedUserIds ?? [],
  };
}

export class HttpTemplateRepository implements TemplateRepository {
  constructor(private readonly client: BackendClient) {}

  async create(
    input: TemplateInput,
    accessToken: string,
  ): Promise<CreateTemplateResult> {
    const dto = await this.client.request<CreateTemplateDto>("/templates", {
      method: "POST",
      accessToken,
      body: {
        Titulo: input.Titulo,
        Descripcion: input.Descripcion ?? null,
        FechaInicio: input.FechaInicio,
        FechaFin: input.FechaFin,
        AssignedUserIds: input.AssignedUserIds,
      },
    });

    if (!dto) {
      throw new UpstreamError(
        "El servidor no devolvió una respuesta al crear la plantilla",
      );
    }

    return {
      message: dto.Message ?? dto.message ?? "Plantilla creada con éxito.",
      templateId: dto.TemplateId ?? dto.templateId ?? dto.Id ?? dto.id ?? 0,
    };
  }

  async update(
    id: number,
    input: TemplateInput,
    accessToken: string,
  ): Promise<TemplateActionResult> {
    const dto = await this.client.request<MessageDto>(`/templates/${id}`, {
      method: "PUT",
      accessToken,
      body: {
        Titulo: input.Titulo,
        Descripcion: input.Descripcion ?? null,
        FechaInicio: input.FechaInicio,
        FechaFin: input.FechaFin,
        AssignedUserIds: input.AssignedUserIds,
      },
    });

    return {
      message: dto?.Message ?? dto?.message ?? "Plantilla actualizada correctamente.",
    };
  }

  async remove(id: number, accessToken: string): Promise<TemplateActionResult> {
    const dto = await this.client.request<MessageDto>(`/templates/${id}`, {
      method: "DELETE",
      accessToken,
    });

    return {
      message: dto?.Message ?? dto?.message ?? "Plantilla eliminada correctamente.",
    };
  }

  async getById(id: number, accessToken: string): Promise<Template | null> {
    const dto = await this.client.request<TemplateDto>(`/templates/${id}`, {
      accessToken,
      allowNotFound: true,
    });

    if (!dto) return null;
    return mapTemplate(dto, id);
  }

  async listAll(accessToken: string): Promise<Template[]> {
    const dto = await this.client.request<TemplateDto[]>("/templates", {
      accessToken,
    });

    return (dto ?? []).map((t) => mapTemplate(t));
  }
}
