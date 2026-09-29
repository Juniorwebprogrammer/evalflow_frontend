import type {
  TemplateInput,
  TemplateActionResult,
} from "@/features/templates/domain/template";
import type { TemplateRepository } from "@/features/templates/domain/template-repository";
import { DomainError } from "@/core/errors/errors";

/** Updates a template via the backend `PUT /templates/{id}`. */
export class UpdateTemplate {
  constructor(private readonly templates: TemplateRepository) {}

  async execute(
    id: number,
    input: TemplateInput,
    accessToken: string,
  ): Promise<TemplateActionResult> {
    if (!accessToken) {
      throw new DomainError("Your session is invalid. Please sign in again.", 401);
    }
    if (!Number.isInteger(id) || id <= 0) {
      throw new DomainError("The template ID is invalid", 400);
    }
    if (!input.Titulo.trim()) {
      throw new DomainError("The template title is required", 400);
    }
    if (!input.FechaInicio || !input.FechaFin) {
      throw new DomainError("The start and end dates are required", 400);
    }
    if (new Date(input.FechaFin) < new Date(input.FechaInicio)) {
      throw new DomainError(
        "The end date can't be earlier than the start date",
        400,
      );
    }

    return this.templates.update(
      id,
      {
        Titulo: input.Titulo.trim(),
        Descripcion: input.Descripcion?.trim() || null,
        FechaInicio: input.FechaInicio,
        FechaFin: input.FechaFin,
        AssignedUserIds: input.AssignedUserIds ?? [],
      },
      accessToken,
    );
  }
}
