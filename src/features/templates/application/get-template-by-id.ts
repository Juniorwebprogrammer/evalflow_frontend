import type { Template } from "@/features/templates/domain/template";
import type { TemplateRepository } from "@/features/templates/domain/template-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Fetches a template via the backend `GET /templates/{id}`. Returns `null`
 * when it does not exist, so the route handler can answer 404.
 */
export class GetTemplateById {
  constructor(private readonly templates: TemplateRepository) {}

  async execute(id: number, accessToken: string): Promise<Template | null> {
    if (!accessToken) {
      throw new DomainError("Your session is invalid. Please sign in again.", 401);
    }
    if (!Number.isInteger(id) || id <= 0) {
      throw new DomainError("The template ID is invalid", 400);
    }

    return this.templates.getById(id, accessToken);
  }
}
