import type { MyClarification } from "@/features/clarifications/domain/clarification";
import type { ClarificationRepository } from "@/features/clarifications/domain/clarification-repository";
import { DomainError } from "@/core/errors/errors";

/** Lists the clarification requests addressed to the caller (as evaluated or evaluator). */
export class GetMyClarifications {
  constructor(private readonly clarifications: ClarificationRepository) {}

  async execute(accessToken: string): Promise<MyClarification[]> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }

    return this.clarifications.getMine(accessToken);
  }
}
