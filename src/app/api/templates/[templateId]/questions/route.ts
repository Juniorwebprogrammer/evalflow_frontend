import type { NextRequest } from "next/server";
import type { QuestionInput } from "@/features/questions/domain/question";
import { QuestionType } from "@/features/questions/domain/question";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * GET /api/templates/:templateId/questions
 * Lists every question of a template. Reads the caller's JWT from the
 * session cookie and forwards it to the backend
 * `GET /templates/{templateId}/questions` as a bearer token.
 */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/templates/[templateId]/questions">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { templateId } = await ctx.params;
    const result = await useCases.getQuestionsByTemplate.execute(
      Number(templateId),
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/templates/:templateId/questions
 * Creates a question under a template. Reads the caller's JWT from the
 * session cookie and forwards it to the backend
 * `POST /templates/{templateId}/questions` as a bearer token.
 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/templates/[templateId]/questions">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { templateId } = await ctx.params;
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

    const result = await useCases.createQuestion.execute(
      Number(templateId),
      input,
      session.jwt,
    );

    return Response.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
