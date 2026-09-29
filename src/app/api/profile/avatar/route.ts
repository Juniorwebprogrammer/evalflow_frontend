import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * GET    /api/profile/avatar  → the caller's profile picture (image bytes).
 * PUT    /api/profile/avatar  → replaces it; body `{ data }` (base64 or data URL).
 * DELETE /api/profile/avatar  → removes it.
 *
 * The browser requests the image as `?v=<avatarUpdatedAt>`, so a changed
 * picture gets a new URL and the old one can be cached privately.
 */
export async function GET() {
  try {
    const session = await requireSession();
    const file = await useCases.getAvatar.execute(session.jwt);

    return new Response(file.body, {
      status: 200,
      headers: {
        "Content-Type": file.contentType,
        "Cache-Control": "private, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = (await request.json().catch(() => null)) as { data?: unknown } | null;
    if (!body || typeof body.data !== "string") {
      throw new DomainError("The request is not valid.", 400);
    }

    const avatarUpdatedAt = await useCases.uploadAvatar.execute(body.data, session.jwt);
    return Response.json({ avatarUpdatedAt });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE() {
  try {
    const session = await requireSession();
    await useCases.deleteAvatar.execute(session.jwt);
    return Response.json({ message: "Profile photo removed." });
  } catch (error) {
    return handleError(error);
  }
}

async function requireSession() {
  const session = await readSession();
  if (!session) {
    throw new DomainError("Your session has expired. Please sign in again.", 401);
  }
  return session;
}
