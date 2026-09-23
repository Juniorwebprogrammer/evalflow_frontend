import type { NextRequest } from "next/server";
import type { TemplateInput } from "@/features/templates/domain/template";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * GET /api/templates/:id
 * Returns a template. Reads the caller's JWT from the session cookie and
 * forwards it to the backend `GET /templates/{id}` as a bearer token.
 * Answers 404 (not an error body) when the template does not exist.
 */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/templates/[templateId]">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { templateId } = await ctx.params;
    const template = await useCases.getTemplateById.execute(
      Number(templateId),
      session.jwt,
    );

    if (!template) {
      return Response.json(
        { message: "Plantilla no encontrada." },
        { status: 404 },
      );
    }

    return Response.json(template);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/templates/:id
 * Updates a template. Reads the caller's JWT from the session cookie and
 * forwards it to the backend `PUT /templates/{id}` as a bearer token.
 */
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/templates/[templateId]">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { templateId } = await ctx.params;
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

    const result = await useCases.updateTemplate.execute(
      Number(templateId),
      input,
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/templates/:id
 * Deletes a template. Reads the caller's JWT from the session cookie and
 * forwards it to the backend `DELETE /templates/{id}` as a bearer token.
 */
export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/templates/[templateId]">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { templateId } = await ctx.params;
    const result = await useCases.deleteTemplate.execute(
      Number(templateId),
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
