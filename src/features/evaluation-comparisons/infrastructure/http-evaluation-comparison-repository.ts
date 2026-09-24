import "server-only";
import type {
  AcceptDiscrepanciesInput,
  AcceptedAnswerSource,
  AcceptedDiscrepancy,
  AlignmentLevel,
  ComparisonSummary,
  CycleComparisons,
  EmployeeComparison,
  GapDirection,
  QuestionComparison,
  TopicComparison,
} from "@/features/evaluation-comparisons/domain/evaluation-comparison";
import type { EvaluationComparisonRepository } from "@/features/evaluation-comparisons/domain/evaluation-comparison-repository";
import { QuestionType } from "@/features/questions/domain/question";
import { BackendClient } from "@/core/http/backend-client";

interface QuestionComparisonDto {
  questionId?: number;
  texto?: string;
  tipo?: QuestionType;
  topic?: string;
  orden?: number;
  selfValue?: number | null;
  managerValue?: number | null;
  selfOptions?: string[] | null;
  managerOptions?: string[] | null;
  gap?: number | null;
  level?: AlignmentLevel;
  direction?: GapDirection;
  acceptedSource?: AcceptedAnswerSource | null;
}

interface TopicComparisonDto {
  topic?: string;
  numericQuestions?: number;
  averageSelf?: number | null;
  averageManager?: number | null;
  averageGap?: number | null;
  level?: AlignmentLevel;
  direction?: GapDirection;
}

interface ComparisonSummaryDto {
  totalQuestions?: number;
  alineadas?: number;
  leves?: number;
  desequilibrios?: number;
  noComparables?: number;
  alignmentPercentage?: number | null;
  averageSelf?: number | null;
  averageManager?: number | null;
  averageAbsoluteGap?: number | null;
  hasImbalances?: boolean;
}

interface EmployeeComparisonDto {
  evaluatedUserId?: number;
  evaluatedUserName?: string;
  evaluatedRol?: string;
  templateId?: number;
  templateTitle?: string;
  managerUserId?: number | null;
  managerName?: string | null;
  selfCompleted?: boolean;
  managerCompleted?: boolean;
  isComparable?: boolean;
  summary?: ComparisonSummaryDto | null;
  topics?: TopicComparisonDto[];
  questions?: QuestionComparisonDto[];
  pendingImbalances?: number;
}

interface CycleComparisonsDto {
  cycleId?: number;
  cycleName?: string;
  isCompleted?: boolean;
  completedAt?: string | null;
  pendingImbalances?: number;
  comparisons?: EmployeeComparisonDto[];
}

interface AcceptedDiscrepancyDto {
  questionId?: number;
  source?: AcceptedAnswerSource;
  acceptedAt?: string;
}

function mapQuestion(dto: QuestionComparisonDto): QuestionComparison {
  return {
    questionId: dto.questionId ?? 0,
    texto: dto.texto ?? "",
    tipo: dto.tipo ?? QuestionType.Escala1a5,
    topic: dto.topic ?? "General",
    orden: dto.orden ?? 0,
    selfValue: dto.selfValue ?? null,
    managerValue: dto.managerValue ?? null,
    selfOptions: dto.selfOptions ?? null,
    managerOptions: dto.managerOptions ?? null,
    gap: dto.gap ?? null,
    level: dto.level ?? "NoComparable",
    direction: dto.direction ?? "Ninguna",
    acceptedSource: dto.acceptedSource ?? null,
  };
}

function mapTopic(dto: TopicComparisonDto): TopicComparison {
  return {
    topic: dto.topic ?? "General",
    numericQuestions: dto.numericQuestions ?? 0,
    averageSelf: dto.averageSelf ?? null,
    averageManager: dto.averageManager ?? null,
    averageGap: dto.averageGap ?? null,
    level: dto.level ?? "NoComparable",
    direction: dto.direction ?? "Ninguna",
  };
}

function mapSummary(dto: ComparisonSummaryDto): ComparisonSummary {
  return {
    totalQuestions: dto.totalQuestions ?? 0,
    alineadas: dto.alineadas ?? 0,
    leves: dto.leves ?? 0,
    desequilibrios: dto.desequilibrios ?? 0,
    noComparables: dto.noComparables ?? 0,
    alignmentPercentage: dto.alignmentPercentage ?? null,
    averageSelf: dto.averageSelf ?? null,
    averageManager: dto.averageManager ?? null,
    averageAbsoluteGap: dto.averageAbsoluteGap ?? null,
    hasImbalances: dto.hasImbalances ?? false,
  };
}

function mapEmployeeComparison(dto: EmployeeComparisonDto): EmployeeComparison {
  return {
    evaluatedUserId: dto.evaluatedUserId ?? 0,
    evaluatedUserName: dto.evaluatedUserName ?? "",
    evaluatedRol: dto.evaluatedRol ?? "",
    templateId: dto.templateId ?? 0,
    templateTitle: dto.templateTitle ?? "",
    managerUserId: dto.managerUserId ?? null,
    managerName: dto.managerName ?? null,
    selfCompleted: dto.selfCompleted ?? false,
    managerCompleted: dto.managerCompleted ?? false,
    isComparable: dto.isComparable ?? false,
    summary: dto.summary ? mapSummary(dto.summary) : null,
    topics: (dto.topics ?? []).map(mapTopic),
    questions: (dto.questions ?? []).map(mapQuestion).sort((a, b) => a.orden - b.orden),
    pendingImbalances: dto.pendingImbalances ?? 0,
  };
}

export class HttpEvaluationComparisonRepository implements EvaluationComparisonRepository {
  constructor(private readonly client: BackendClient) {}

  async getByCycle(
    cycleId: number,
    evaluatedUserId: number | null,
    accessToken: string,
  ): Promise<CycleComparisons> {
    const query = evaluatedUserId ? `?evaluatedUserId=${evaluatedUserId}` : "";
    const dto = await this.client.request<CycleComparisonsDto>(
      `/evaluation-cycles/${cycleId}/comparisons${query}`,
      { accessToken },
    );

    return {
      cycleId: dto?.cycleId ?? cycleId,
      cycleName: dto?.cycleName ?? "",
      isCompleted: dto?.isCompleted ?? false,
      completedAt: dto?.completedAt ?? null,
      pendingImbalances: dto?.pendingImbalances ?? 0,
      comparisons: (dto?.comparisons ?? []).map(mapEmployeeComparison),
    };
  }

  async acceptDiscrepancies(
    cycleId: number,
    input: AcceptDiscrepanciesInput,
    accessToken: string,
  ): Promise<AcceptedDiscrepancy[]> {
    const dto = await this.client.request<AcceptedDiscrepancyDto[]>(
      `/evaluation-cycles/${cycleId}/discrepancies/acceptances`,
      { method: "PUT", body: input, accessToken },
    );
    return (dto ?? []).map((a) => ({
      questionId: a.questionId ?? 0,
      source: a.source ?? input.source,
      acceptedAt: a.acceptedAt ?? "",
    }));
  }
}
