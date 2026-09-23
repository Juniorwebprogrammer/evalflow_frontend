/**
 * Template entities — evaluation templates within a company.
 * Request bodies map 1:1 to the backend `Features/Templates` contracts
 * (`POST /templates`, `PUT /templates/{id}`).
 */
export interface TemplateInput {
  Titulo: string;
  Descripcion?: string | null;
  FechaInicio: string;
  FechaFin: string;
  AssignedUserIds: number[];
}

/** Mirrors the backend `POST /templates` success response. */
export interface CreateTemplateResult {
  message: string;
  templateId: number;
}

/** Mirrors the backend generic `{ Message }` response returned by update/delete. */
export interface TemplateActionResult {
  message: string;
}

/**
 * Mirrors the backend template DTO, returned by `GET /templates` and
 * `GET /templates/{id}`. The exact shape wasn't published by the backend
 * snippet (only the request bodies were) — the HTTP repository maps it
 * defensively, tolerating several plausible field names.
 */
export interface Template {
  id: number;
  titulo: string;
  descripcion: string | null;
  fechaInicio: string;
  fechaFin: string;
  assignedUserIds: number[];
}
