import type { NextRequest } from "next/server";
import type {
  UpdateCompanyInput,
  DeleteCompanyInput,
} from "@/features/company/domain/company";
import { useCases } from "@/core/di/container";
import {
  readSession,
  clearSession,
} from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * PUT /api/company → backend `Company/update`.
 * Reads the caller's JWT from the session cookie and forwards it as a bearer
 * token; the backend resolves which company + enforces the allowed roles.
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const body = (await request.json().catch(() => null)) as
      | Partial<UpdateCompanyInput>
      | null;

    if (!body) {
      throw new DomainError("El cuerpo de la petición no es válido", 400);
    }

    const input: UpdateCompanyInput = {
      Nombre: String(body.Nombre ?? "").trim(),
      LogoUrl: String(body.LogoUrl ?? "").trim(),
      Colors: String(body.Colors ?? "").trim(),
      Cif: String(body.Cif ?? "").trim(),
      Sector: String(body.Sector ?? "").trim(),
      DireccionFiscal: String(body.DireccionFiscal ?? "").trim(),
    };

    await useCases.updateCompany.execute(input, session.jwt);

    return Response.json({ message: "Company updated" });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/company → backend `Company/delete`.
 * Permanently deletes the company + all users. On success the session cookies
 * are cleared server-side (the account no longer exists).
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const body = (await request.json().catch(() => null)) as
      | Partial<DeleteCompanyInput>
      | null;

    const input: DeleteCompanyInput = {
      Password: String(body?.Password ?? ""),
    };

    await useCases.deleteCompany.execute(input, session.jwt);
    await clearSession();

    return Response.json({ message: "Company deleted" });
  } catch (error) {
    return handleError(error);
  }
}
