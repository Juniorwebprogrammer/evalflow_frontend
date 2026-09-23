import type { NextRequest } from "next/server";
import type { TemplateInput } from "@/features/templates/domain/template";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * GET /api/templates
 * Lists every template of the caller's company. Reads the caller's JWT from
 * the session cookie and forwards it to the backend `GET /templates` as a
 * bearer token.
 */
export async function GET() {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const result = await useCases.listTemplates.execute(session.jwt);

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/templates
 * Creates a template for the caller's company. Reads the caller's JWT from
 * the session cookie and forwards it to the backend `POST /templates` as a
 * bearer token (the api key is added by the BackendClient).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const body = (await request.json().catch(() => null)) as
      | Partial<TemplateInput>
      | null;

    if (!body) {
      throw new DomainError("El cuerpo de la petición no es válido", 400);
    }

    const input: TemplateInput = {
      Titulo: String(body.Titulo ?? "").trim(),
      Descripcion: body.Descripcion ? String(body.Descripcion).trim() : null,
      FechaInicio: String(body.FechaInicio ?? ""),
      FechaFin: String(body.FechaFin ?? ""),
      AssignedUserIds: Array.isArray(body.AssignedUserIds)
        ? body.AssignedUserIds.map(Number)
        : [],
    };

    const result = await useCases.createTemplate.execute(input, session.jwt);

    return Response.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
