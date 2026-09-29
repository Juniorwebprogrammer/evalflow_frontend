import {
  CLARIFICATION_MESSAGE_MAX_LENGTH,
  type Clarification,
  type CreateClarificationInput,
} from "@/features/clarifications/domain/clarification";
import type { ClarificationRepository } from "@/features/clarifications/domain/clarification-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Asks both the evaluated employee and their evaluator to explain their
 * answers (backend `POST /evaluation-cycles/{cycleId}/clarifications`). The
 * backend emails both participants.
 */
export class CreateClarification {
  constructor(private readonly clarifications: ClarificationRepository) {}

  async execute(
    cycleId: number,
    input: CreateClarificationInput,
    accessToken: string,
  ): Promise<Clarification> {
    if (!accessToken) {
      throw new DomainError("Your session is no longer valid. Please sign in again.", 401);
    }
    if (!Number.isInteger(cycleId) || cycleId <= 0) {
      throw new DomainError("The ID is not valid.", 400);
    }
    if (!Number.isInteger(input.evaluatedUserId) || input.evaluatedUserId <= 0) {
      throw new DomainError("The selected employee is not valid.", 400);
    }
    if (!Number.isInteger(input.templateId) || input.templateId <= 0) {
      throw new DomainError("The selected template is not valid.", 400);
    }
    if (input.questionId !== null && (!Number.isInteger(input.questionId) || input.questionId <= 0)) {
      throw new DomainError("The selected question is not valid.", 400);
    }

    const mensaje = input.mensaje.trim();
    if (!mensaje) {
      throw new DomainError("Tell us what information you need.", 400);
    }
    if (mensaje.length > CLARIFICATION_MESSAGE_MAX_LENGTH) {
      throw new DomainError(
        `The message cannot exceed ${CLARIFICATION_MESSAGE_MAX_LENGTH} characters.`,
        400,
      );
    }

    return this.clarifications.create(cycleId, { ...input, mensaje }, accessToken);
  }
}
