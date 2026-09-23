import "server-only";
import type {
  PendingSubmission,
  SubmissionDetail,
  SubmissionQuestion,
  AnswerInput,
  SubmissionActionResult,
  CycleSubmission,
} from "@/features/evaluation-submissions/domain/evaluation-submission";
import type { EvaluationSubmissionRepository } from "@/features/evaluation-submissions/domain/evaluation-submission-repository";
import { QuestionType } from "@/features/questions/domain/question";
import { BackendClient } from "@/core/http/backend-client";

/** Raw backend `PendingSubmissionDto` (PascalCase, tolerant to variations). */
interface PendingSubmissionDto {
  SubmissionId?: number;
  submissionId?: number;
  TemplateTitle?: string;
  templateTitle?: string;
  CycleName?: string;
  cycleName?: string;
  EvaluatedUserName?: string;
  evaluatedUserName?: string;
  FechaFinCiclo?: string;
  fechaFinCiclo?: string;
}

/** Raw backend `SubmissionQuestionDto` (PascalCase, tolerant to variations). */
interface SubmissionQuestionDto {
  QuestionId?: number;
  questionId?: number;
  Texto?: string;
  texto?: string;
  Tipo?: QuestionType;
  tipo?: QuestionType;
  Opciones?: string[] | null;
  opciones?: string[] | null;
  Orden?: number;
  orden?: number;
}

/** Raw backend `SubmissionDetailDto` (PascalCase, tolerant to variations). */
interface SubmissionDetailDto {
  SubmissionId?: number;
  submissionId?: number;
  IsCompleted?: boolean;
  isCompleted?: boolean;
  CycleName?: string;
  cycleName?: string;
  EvaluatedUserName?: string;
  evaluatedUserName?: string;
  TemplateTitle?: string;
  templateTitle?: string;
  TemplateDescription?: string | null;
  templateDescription?: string | null;
  Questions?: SubmissionQuestionDto[];
  questions?: SubmissionQuestionDto[];
  FechaFinCiclo?: string;
  fechaFinCiclo?: string;
}

/** Raw backend generic `{ Message }` response (PascalCase, tolerant to variations). */
interface MessageDto {
  Message?: string;
  message?: string;
}

/** Raw backend `CycleSubmissionDto` (PascalCase, tolerant to variations). */
interface CycleSubmissionDto {
  SubmissionId?: number;
  submissionId?: number;
  RespondentUserId?: number;
  respondentUserId?: number;
  RespondentUserName?: string;
  respondentUserName?: string;
  EvaluatedUserId?: number;
  evaluatedUserId?: number;
  EvaluatedUserName?: string;
  evaluatedUserName?: string;
  TemplateTitle?: string;
  templateTitle?: string;
  IsCompleted?: boolean;
  isCompleted?: boolean;
  SubmittedAt?: string | null;
  submittedAt?: string | null;
}

function mapPendingSubmission(dto: PendingSubmissionDto): PendingSubmission {
  return {
    submissionId: dto.SubmissionId ?? dto.submissionId ?? 0,
    templateTitle: dto.TemplateTitle ?? dto.templateTitle ?? "",
    cycleName: dto.CycleName ?? dto.cycleName ?? "",
    evaluatedUserName: dto.EvaluatedUserName ?? dto.evaluatedUserName ?? "",
    fechaFinCiclo: dto.FechaFinCiclo ?? dto.fechaFinCiclo ?? "",
  };
}

function mapSubmissionQuestion(dto: SubmissionQuestionDto): SubmissionQuestion {
  return {
    questionId: dto.QuestionId ?? dto.questionId ?? 0,
    texto: dto.Texto ?? dto.texto ?? "",
    tipo: dto.Tipo ?? dto.tipo ?? QuestionType.Escala1a5,
    opciones: dto.Opciones ?? dto.opciones ?? null,
    orden: dto.Orden ?? dto.orden ?? 0,
  };
}

function mapCycleSubmission(dto: CycleSubmissionDto): CycleSubmission {
  return {
    submissionId: dto.SubmissionId ?? dto.submissionId ?? 0,
    respondentUserId: dto.RespondentUserId ?? dto.respondentUserId ?? 0,
    respondentUserName: dto.RespondentUserName ?? dto.respondentUserName ?? "",
    evaluatedUserId: dto.EvaluatedUserId ?? dto.evaluatedUserId ?? 0,
    evaluatedUserName: dto.EvaluatedUserName ?? dto.evaluatedUserName ?? "",
    templateTitle: dto.TemplateTitle ?? dto.templateTitle ?? "",
    isCompleted: dto.IsCompleted ?? dto.isCompleted ?? false,
    submittedAt: dto.SubmittedAt ?? dto.submittedAt ?? null,
  };
}

function mapSubmissionDetail(dto: SubmissionDetailDto): SubmissionDetail {
  return {
    submissionId: dto.SubmissionId ?? dto.submissionId ?? 0,
    isCompleted: dto.IsCompleted ?? dto.isCompleted ?? false,
    cycleName: dto.CycleName ?? dto.cycleName ?? "",
    evaluatedUserName: dto.EvaluatedUserName ?? dto.evaluatedUserName ?? "",
    templateTitle: dto.TemplateTitle ?? dto.templateTitle ?? "",
    templateDescription: dto.TemplateDescription ?? dto.templateDescription ?? null,
    questions: (dto.Questions ?? dto.questions ?? [])
      .map(mapSubmissionQuestion)
      .sort((a, b) => a.orden - b.orden),
    fechaFinCiclo: dto.FechaFinCiclo ?? dto.fechaFinCiclo ?? "",
  };
}

export class HttpEvaluationSubmissionRepository implements EvaluationSubmissionRepository {
  constructor(private readonly client: BackendClient) {}

  async getPending(accessToken: string): Promise<PendingSubmission[]> {
    const dto = await this.client.request<PendingSubmissionDto[]>(
      "/evaluation-submissions/pending",
      { accessToken },
    );

    return (dto ?? []).map(mapPendingSubmission);
  }

  async getCompleted(accessToken: string): Promise<PendingSubmission[]> {
    const dto = await this.client.request<PendingSubmissionDto[]>(
      "/evaluation-submissions/completed",
      { accessToken },
    );

    return (dto ?? []).map(mapPendingSubmission);
  }

  async getById(
    submissionId: number,
    accessToken: string,
  ): Promise<SubmissionDetail | null> {
    const dto = await this.client.request<SubmissionDetailDto>(
      `/evaluation-submissions/${submissionId}`,
      { accessToken, allowNotFound: true },
    );

    return dto ? mapSubmissionDetail(dto) : null;
  }

  async saveAnswers(
    submissionId: number,
    answers: AnswerInput[],
    accessToken: string,
  ): Promise<SubmissionActionResult> {
    const dto = await this.client.request<MessageDto>(
      `/evaluation-submissions/${submissionId}/answers`,
      {
        method: "PUT",
        accessToken,
        body: { Answers: answers },
      },
    );

    return {
      message:
        dto?.Message ??
        dto?.message ??
        "Respuestas guardadas y formulario completado con éxito.",
    };
  }

  async getByCycle(cycleId: number, accessToken: string): Promise<CycleSubmission[]> {
    const dto = await this.client.request<CycleSubmissionDto[]>(
      `/evaluation-cycles/${cycleId}/submissions`,
      { accessToken },
    );

    return (dto ?? []).map(mapCycleSubmission);
  }

  async remove(submissionId: number, accessToken: string): Promise<SubmissionActionResult> {
    const dto = await this.client.request<MessageDto>(
      `/evaluation-submissions/${submissionId}`,
      { method: "DELETE", accessToken },
    );

    return {
      message: dto?.Message ?? dto?.message ?? "Formulario eliminado correctamente.",
    };
  }
}
