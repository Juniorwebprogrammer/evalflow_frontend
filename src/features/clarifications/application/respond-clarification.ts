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
      throw new DomainError("Your session is no longer valid. Please sign in again.", 401);
    }
    if (!Number.isInteger(clarificationId) || clarificationId <= 0) {
      throw new DomainError("The ID is not valid.", 400);
    }

    const trimmed = respuesta.trim();
    if (!trimmed) {
      throw new DomainError("The response cannot be empty.", 400);
    }
    if (trimmed.length > CLARIFICATION_RESPONSE_MAX_LENGTH) {
      throw new DomainError(
        `The response cannot exceed ${CLARIFICATION_RESPONSE_MAX_LENGTH} characters.`,
        400,
      );
    }

    return this.clarifications.respond(clarificationId, trimmed, accessToken);
  }
}
