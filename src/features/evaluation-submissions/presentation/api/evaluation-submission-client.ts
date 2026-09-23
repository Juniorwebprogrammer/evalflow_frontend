import { ApiError, parseMessage } from "@/shared/lib/api-error";
import type { QuestionType } from "@/features/questions/domain/question";

export interface PendingSubmissionResponse {
  submissionId: number;
  templateTitle: string;
  cycleName: string;
  evaluatedUserName: string;
  fechaFinCiclo: string;
}

/** Lists the caller's pending submissions via our own route handler. */
export async function fetchPendingSubmissions(): Promise<PendingSubmissionResponse[]> {
  const res = await fetch("/api/evaluation-submissions/pending", { method: "GET" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as PendingSubmissionResponse[];
}

/** Lists the caller's completed submissions via our own route handler. */
export async function fetchCompletedSubmissions(): Promise<PendingSubmissionResponse[]> {
  const res = await fetch("/api/evaluation-submissions/completed", { method: "GET" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as PendingSubmissionResponse[];
}

export interface SubmissionQuestionResponse {
  questionId: number;
  texto: string;
  tipo: QuestionType;
  opciones: string[] | null;
  orden: number;
}

export interface SubmissionResponse {
  submissionId: number;
  isCompleted: boolean;
  cycleName: string;
  evaluatedUserName: string;
  templateTitle: string;
  templateDescription: string | null;
  questions: SubmissionQuestionResponse[];
  fechaFinCiclo: string;
}

/** Fetches a submission via our own route handler. Returns `null` when it does not exist (404). */
export async function fetchSubmission(id: number): Promise<SubmissionResponse | null> {
  const res = await fetch(`/api/evaluation-submissions/${id}`, { method: "GET" });
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as SubmissionResponse;
}

export interface AnswerFormInput {
  questionId: number;
  rawPayload: string;
}

export interface SubmissionMessageResponse {
  message: string;
}

/** Saves every answer of a submission via our own route handler. */
export async function saveSubmissionAnswers(
  id: number,
  answers: AnswerFormInput[],
): Promise<SubmissionMessageResponse> {
  const res = await fetch(`/api/evaluation-submissions/${id}/answers`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as SubmissionMessageResponse;
}

export interface CycleSubmissionResponse {
  submissionId: number;
  respondentUserId: number;
  respondentUserName: string;
  evaluatedUserId: number;
  evaluatedUserName: string;
  templateTitle: string;
  isCompleted: boolean;
  submittedAt: string | null;
}

/**
 * Lists every submission of a cycle via our own route handler (Owner/Rrhh
 * only), so RRHH can see who still has to answer.
 */
export async function fetchCycleSubmissions(cycleId: number): Promise<CycleSubmissionResponse[]> {
  const res = await fetch(`/api/evaluation-cycles/${cycleId}/submissions`, {
    method: "GET",
  });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as CycleSubmissionResponse[];
}

/** Deletes a submission via our own route handler (Owner/Rrhh only). */
export async function deleteSubmission(id: number): Promise<SubmissionMessageResponse> {
  const res = await fetch(`/api/evaluation-submissions/${id}`, { method: "DELETE" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as SubmissionMessageResponse;
}
