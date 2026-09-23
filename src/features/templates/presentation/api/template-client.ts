import { ApiError, parseMessage } from "@/shared/lib/api-error";

export interface TemplateResponse {
  id: number;
  titulo: string;
  descripcion: string | null;
  fechaInicio: string;
  fechaFin: string;
  assignedUserIds: number[];
}

/** Lists every template of the caller's company via our own route handler. */
export async function listTemplates(): Promise<TemplateResponse[]> {
  const res = await fetch("/api/templates", { method: "GET" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as TemplateResponse[];
}

/** Fetches a template via our own route handler. Returns `null` when it does not exist (404). */
export async function fetchTemplate(id: number): Promise<TemplateResponse | null> {
  const res = await fetch(`/api/templates/${id}`, { method: "GET" });
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as TemplateResponse;
}

export interface TemplateFormInput {
  titulo: string;
  descripcion?: string
  fechaInicio: string;
  fechaFin: string;
  assignedUserIds: number[];
}

export interface CreateTemplateResponse {
  message: string;
  templateId: number;
}

/**
 * Creates a template via our own route handler. The bearer token is added
 * server-side from the session cookie, so it never touches the browser.
 */
export async function createTemplate(
  input: TemplateFormInput,
): Promise<CreateTemplateResponse> {
  const res = await fetch("/api/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Titulo: input.titulo,
      Descripcion: input.descripcion || null,
      FechaInicio: input.fechaInicio,
      FechaFin: input.fechaFin,
      AssignedUserIds: input.assignedUserIds,
    }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as CreateTemplateResponse;
}

export interface TemplateMessageResponse {
  message: string;
}

/** Updates a template via our own route handler. */
export async function updateTemplate(
  id: number,
  input: TemplateFormInput,
): Promise<TemplateMessageResponse> {
  const res = await fetch(`/api/templates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Titulo: input.titulo,
      Descripcion: input.descripcion || null,
      FechaInicio: input.fechaInicio,
      FechaFin: input.fechaFin,
      AssignedUserIds: input.assignedUserIds,
    }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as TemplateMessageResponse;
}

/** Deletes a template via our own route handler. */
export async function deleteTemplate(id: number): Promise<TemplateMessageResponse> {
  const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as TemplateMessageResponse;
}
