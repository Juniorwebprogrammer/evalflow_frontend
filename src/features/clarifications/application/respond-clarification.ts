import {
  CLARIFICATION_RESPONSE_MAX_LENGTH,
  type MyClarification,
} from "@/features/clarifications/domain/clarification";
import type { ClarificationRepository } from "@/features/clarifications/domain/clarification-repository";
import { DomainError } from "@/core/errors/errors";

/** Saves the caller's explanation for a clarification request. It can only be sent once. */
export class RespondClarification {
  constructor(private readonly clarifications: ClarificationRepository) {}

  async execute(
    clarificationId: number,
    respuesta: string,
    accessToken: string,
  ): Promise<MyClarification> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(clarificationId) || clarificationId <= 0) {
      throw new DomainError("El identificador no es válido", 400);
    }

    const trimmed = respuesta.trim();
    if (!trimmed) {
      throw new DomainError("La respuesta no puede estar vacía.", 400);
    }
    if (trimmed.length > CLARIFICATION_RESPONSE_MAX_LENGTH) {
      throw new DomainError(
        `La respuesta no puede superar los ${CLARIFICATION_RESPONSE_MAX_LENGTH} caracteres.`,
        400,
      );
    }

    return this.clarifications.respond(clarificationId, trimmed, accessToken);
  }
}
