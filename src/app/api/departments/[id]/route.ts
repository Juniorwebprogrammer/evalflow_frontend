import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * GET /api/departments/:id
 * Returns a department (with its employee roster). Reads the caller's JWT
 * from the session cookie and forwards it to the backend
 * `GET /departments/{id}` as a bearer token. Answers 404 (not an error body)
 * when the department does not exist or belongs to another company.
 */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/departments/[id]">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { id } = await ctx.params;
    const department = await useCases.getDepartment.execute(
      Number(id),
      session.jwt,
    );

    if (!department) {
      return Response.json(
        { message: "Departamento no encontrado o no pertenece a tu empresa." },
        { status: 404 },
      );
    }

    return Response.json(department);
  } catch (error) {
    return handleError(error);
  }
}
