import type {
  TemplateInput,
  CreateTemplateResult,
} from "@/features/templates/domain/template";
import type { TemplateRepository } from "@/features/templates/domain/template-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Creates a template for the caller's company via the backend
 * `POST /templates`. Validates the payload before delegating to the
 * template repository.
 */
export class CreateTemplate {
  constructor(private readonly templates: TemplateRepository) {}

  async execute(
    input: TemplateInput,
    accessToken: string,
  ): Promise<CreateTemplateResult> {
    if (!accessToken) {
      throw new DomainError("Your session is invalid. Please sign in again.", 401);
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

    return this.templates.create(
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
