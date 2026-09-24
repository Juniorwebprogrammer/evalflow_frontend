import type {
  Clarification,
  CreateClarificationInput,
  MyClarification,
} from "@/features/clarifications/domain/clarification";

/** Port for clarification requests. Implemented by the infrastructure layer. */
export interface ClarificationRepository {
  create(cycleId: number, input: CreateClarificationInput, accessToken: string): Promise<Clarification>;

  getByCycle(cycleId: number, evaluatedUserId: number | null, accessToken: string): Promise<Clarification[]>;

  getMine(accessToken: string): Promise<MyClarification[]>;

  respond(clarificationId: number, respuesta: string, accessToken: string): Promise<MyClarification>;
}
