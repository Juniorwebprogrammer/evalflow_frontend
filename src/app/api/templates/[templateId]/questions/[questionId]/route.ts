import type { NextRequest } from "next/server";
import type { QuestionInput } from "@/features/questions/domain/question";
import { QuestionType } from "@/features/questions/domain/question";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * PUT /api/templates/:templateId/questions/:questionId
 * Updates a question. Reads the caller's JWT from the session cookie and
 * forwards it to the backend
 * `PUT /templates/{templateId}/questions/{questionId}` as a bearer token.
 */
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/templates/[templateId]/questions/[questionId]">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { templateId, questionId } = await ctx.params;
    const body = (await request.json().catch(() => null)) as
      | Partial<QuestionInput>
      | null;

    if (!body) {
      throw new DomainError("El cuerpo de la petición no es válido", 400);
    }

    const input: QuestionInput = {
      Texto: String(body.Texto ?? "").trim(),
      Tipo: Number(body.Tipo ?? QuestionType.Escala1a5) as QuestionType,
      Topic: String(body.Topic ?? "").trim(),
      Opciones: Array.isArray(body.Opciones) ? body.Opciones.map(String) : null,
      Orden: Number(body.Orden ?? 0),
    };

    const result = await useCases.updateQuestion.execute(
      Number(templateId),
      Number(questionId),
      input,
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/templates/:templateId/questions/:questionId
 * Deletes a question. Reads the caller's JWT from the session cookie and
 * forwards it to the backend
 * `DELETE /templates/{templateId}/questions/{questionId}` as a bearer token.
 */
export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/templates/[templateId]/questions/[questionId]">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { templateId, questionId } = await ctx.params;
    const result = await useCases.deleteQuestion.execute(
      Number(templateId),
      Number(questionId),
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
