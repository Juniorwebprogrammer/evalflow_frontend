import "server-only";
import {
  EvaluationType,
  type EvaluationCycle,
  type CreateEvaluationCycleInput,
  type UpdateEvaluationCycleInput,
  type CreateEvaluationCycleResult,
  type EvaluationCycleActionResult,
} from "@/features/evaluation-cycles/domain/evaluation-cycle";
import type { EvaluationCycleRepository } from "@/features/evaluation-cycles/domain/evaluation-cycle-repository";
import { BackendClient } from "@/core/http/backend-client";
import { UpstreamError } from "@/core/errors/errors";

/** Raw backend evaluation-cycle-creation response (PascalCase, tolerant to variations). */
interface CreateEvaluationCycleDto {
  Message?: string;
  message?: string;
  EvaluationCycleId?: number;
  evaluationCycleId?: number;
  Id?: number;
  id?: number;
}

/** Raw backend generic `{ Message }` response (PascalCase, tolerant to variations). */
interface MessageDto {
  Message?: string;
  message?: string;
}

/**
 * Raw backend evaluation-cycle DTO (PascalCase, tolerant to variations). The
 * exact shape wasn't published — this accepts every plausible alias,
 * including for the member-template-id list.
 */
interface EvaluationCycleDto {
  Id?: number;
  id?: number;
  Nombre?: string;
  nombre?: string;
  Descripcion?: string | null;
  descripcion?: string | null;
  Activo?: boolean;
  activo?: boolean;
  FechaInicio?: string;
  fechaInicio?: string;
  FechaFin?: string;
  fechaFin?: string;
  TemplateIds?: number[];
  templateIds?: number[];
  Templates?: Array<{ Id?: number; id?: number }>;
  templates?: Array<{ Id?: number; id?: number }>;
  TipoEvaluacion?: EvaluationType;
  tipoEvaluacion?: EvaluationType;
}

function mapEvaluationCycle(dto: EvaluationCycleDto): EvaluationCycle {
  const templateIds =
    dto.TemplateIds ??
    dto.templateIds ??
    (dto.Templates ?? dto.templates ?? [])
      .map((t) => t.Id ?? t.id ?? 0)
      .filter(Boolean);

  return {
    id: dto.Id ?? dto.id ?? 0,
    nombre: dto.Nombre ?? dto.nombre ?? "",
    descripcion: dto.Descripcion ?? dto.descripcion ?? null,
    activo: dto.Activo ?? dto.activo ?? false,
    fechaInicio: dto.FechaInicio ?? dto.fechaInicio ?? "",
    fechaFin: dto.FechaFin ?? dto.fechaFin ?? "",
    templateIds,
    tipoEvaluacion: dto.TipoEvaluacion ?? dto.tipoEvaluacion ?? EvaluationType.Evaluacion360,
  };
}

export class HttpEvaluationCycleRepository implements EvaluationCycleRepository {
  constructor(private readonly client: BackendClient) {}

  async create(
    input: CreateEvaluationCycleInput,
    accessToken: string,
  ): Promise<CreateEvaluationCycleResult> {
    const dto = await this.client.request<CreateEvaluationCycleDto>(
      "/evaluation-cycles",
      {
        method: "POST",
        accessToken,
        body: {
          Nombre: input.Nombre,
          Descripcion: input.Descripcion ?? null,
          FechaInicio: input.FechaInicio,
          FechaFin: input.FechaFin,
          TipoEvaluacion: input.TipoEvaluacion,
        },
      },
    );

    if (!dto) {
      throw new UpstreamError(
        "El servidor no devolvió una respuesta al crear el ciclo de evaluación",
      );
    }

    return {
      message: dto.Message ?? dto.message ?? "Ciclo de evaluación creado con éxito.",
      evaluationCycleId:
        dto.EvaluationCycleId ?? dto.evaluationCycleId ?? dto.Id ?? dto.id ?? 0,
    };
  }

  async update(
    id: number,
    input: UpdateEvaluationCycleInput,
    accessToken: string,
  ): Promise<EvaluationCycleActionResult> {
    const dto = await this.client.request<MessageDto>(
      `/evaluation-cycles/${id}`,
      {
        method: "PUT",
        accessToken,
        body: {
          Nombre: input.Nombre,
          Descripcion: input.Descripcion ?? null,
          Activo: input.Activo,
          FechaInicio: input.FechaInicio,
          FechaFin: input.FechaFin,
          TipoEvaluacion: input.TipoEvaluacion,
        },
      },
    );

    return {
      message:
        dto?.Message ?? dto?.message ?? "Ciclo de evaluación actualizado correctamente.",
    };
  }

  async remove(
    id: number,
    accessToken: string,
  ): Promise<EvaluationCycleActionResult> {
    const dto = await this.client.request<MessageDto>(
      `/evaluation-cycles/${id}`,
      { method: "DELETE", accessToken },
    );

    return {
      message:
        dto?.Message ?? dto?.message ?? "Ciclo de evaluación eliminado correctamente.",
    };
  }

  async listAll(accessToken: string): Promise<EvaluationCycle[]> {
    const dto = await this.client.request<EvaluationCycleDto[]>(
      "/evaluation-cycles",
      { accessToken },
    );

    return (dto ?? []).map(mapEvaluationCycle);
  }

  async toggleTemplate(
    cycleId: number,
    templateId: number,
    accessToken: string,
  ): Promise<EvaluationCycleActionResult> {
    const dto = await this.client.request<MessageDto>(
      `/evaluation-cycles/${cycleId}/templates/${templateId}/toggle`,
      { method: "PUT", accessToken },
    );

    return {
      message:
        dto?.Message ?? dto?.message ?? "Ciclo de evaluación actualizado correctamente.",
    };
  }

  async generateSubmissions(
    cycleId: number,
    accessToken: string,
  ): Promise<EvaluationCycleActionResult> {
    const dto = await this.client.request<MessageDto>(
      `/evaluation-cycles/${cycleId}/generate-submissions`,
      { method: "POST", accessToken },
    );

    return {
      message: dto?.Message ?? dto?.message ?? "Formularios generados con éxito.",
    };
  }
}
