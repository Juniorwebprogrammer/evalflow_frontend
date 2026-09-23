import type {
  Template,
  TemplateInput,
  CreateTemplateResult,
  TemplateActionResult,
} from "@/features/templates/domain/template";

/** Port for template management. Implemented by the infrastructure layer. */
export interface TemplateRepository {
  /**
   * Creates a template for the caller's company. `accessToken` is the JWT
   * of the authenticated caller, forwarded to the backend as a bearer token.
   */
  create(input: TemplateInput, accessToken: string): Promise<CreateTemplateResult>;

  /** Updates a template's fields. */
  update(
    id: number,
    input: TemplateInput,
    accessToken: string,
  ): Promise<TemplateActionResult>;

  /** Deletes a template. */
  remove(id: number, accessToken: string): Promise<TemplateActionResult>;

  /** Returns a template, or `null` when it does not exist. */
  getById(id: number, accessToken: string): Promise<Template | null>;

  /** Lists every template of the caller's company. */
  listAll(accessToken: string): Promise<Template[]>;
}
