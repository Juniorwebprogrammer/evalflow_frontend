import type { TemplateActionResult } from "@/features/templates/domain/template";
import type { TemplateRepository } from "@/features/templates/domain/template-repository";
import { DomainError } from "@/core/errors/errors";

/** Deletes a template via the backend `DELETE /templates/{id}`. */
export class DeleteTemplate {
  constructor(private readonly templates: TemplateRepository) {}

  async execute(id: number, accessToken: string): Promise<TemplateActionResult> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(id) || id <= 0) {
      throw new DomainError("El identificador de la plantilla no es válido", 400);
    }

    return this.templates.remove(id, accessToken);
  }
}
