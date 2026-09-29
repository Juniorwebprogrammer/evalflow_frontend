import type { Template } from "@/features/templates/domain/template";
import type { TemplateRepository } from "@/features/templates/domain/template-repository";
import { DomainError } from "@/core/errors/errors";

/** Lists every template of the caller's company via the backend `GET /templates`. */
export class ListTemplates {
  constructor(private readonly templates: TemplateRepository) {}

  async execute(accessToken: string): Promise<Template[]> {
    if (!accessToken) {
      throw new DomainError("Your session is invalid. Please sign in again.", 401);
    }

    return this.templates.listAll(accessToken);
  }
}
