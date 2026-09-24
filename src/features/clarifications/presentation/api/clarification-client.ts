import { ApiError, parseMessage } from "@/shared/lib/api-error";
import type {
  Clarification,
  ClarificationParticipant,
  ClarificationStatus,
  CreateClarificationInput,
  MyClarification,
} from "@/features/clarifications/domain/clarification";

export type {
  Clarification as ClarificationResponse,
  ClarificationParticipant,
  ClarificationStatus,
  CreateClarificationInput,
  MyClarification as MyClarificationResponse,
};

export async function fetchCycleClarifications(cycleId: number): Promise<Clarification[]> {
  const res = await fetch(`/api/evaluation-cycles/${cycleId}/clarifications`, { method: "GET" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as Clarification[];
}

export async function createClarification(
  cycleId: number,
  input: CreateClarificationInput,
): Promise<Clarification> {
  const res = await fetch(`/api/evaluation-cycles/${cycleId}/clarifications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as Clarification;
}

export async function fetchMyClarifications(): Promise<MyClarification[]> {
  const res = await fetch("/api/clarifications/mine", { method: "GET" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as MyClarification[];
}

export async function respondClarification(
  clarificationId: number,
  respuesta: string,
): Promise<MyClarification> {
  const res = await fetch(`/api/clarifications/${clarificationId}/response`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ respuesta }),
  });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as MyClarification;
}
