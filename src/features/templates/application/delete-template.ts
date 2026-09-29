import type { TemplateActionResult } from "@/features/templates/domain/template";
import type { TemplateRepository } from "@/features/templates/domain/template-repository";
import { DomainError } from "@/core/errors/errors";

/** Deletes a template via the backend `DELETE /templates/{id}`. */
export class DeleteTemplate {
  constructor(private readonly templates: TemplateRepository) {}

  async execute(id: number, accessToken: string): Promise<TemplateActionResult> {
    if (!accessToken) {
      throw new DomainError("Your session is invalid. Please sign in again.", 401);
    }
    if (!Number.isInteger(id) || id <= 0) {
      throw new DomainError("The template ID is invalid", 400);
    }

    return this.templates.remove(id, accessToken);
  }
}
