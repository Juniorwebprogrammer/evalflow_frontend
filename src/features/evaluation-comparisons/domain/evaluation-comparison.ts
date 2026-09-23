import type { QuestionType } from "@/features/questions/domain/question";

export type AlignmentLevel = "Alineado" | "Leve" | "Desequilibrio" | "NoComparable";

export type GapDirection = "Ninguna" | "Sobrevaloracion" | "Infravaloracion";

export interface QuestionComparison {
  questionId: number;
  texto: string;
  tipo: QuestionType;
  topic: string;
  orden: number;
  selfValue: number | null;
  managerValue: number | null;
  selfOptions: string[] | null;
  managerOptions: string[] | null;
  gap: number | null;
  level: AlignmentLevel;
  direction: GapDirection;
}

export interface TopicComparison {
  topic: string;
  numericQuestions: number;
  averageSelf: number | null;
  averageManager: number | null;
  averageGap: number | null;
  level: AlignmentLevel;
  direction: GapDirection;
}

export interface ComparisonSummary {
  totalQuestions: number;
  alineadas: number;
  leves: number;
  desequilibrios: number;
  noComparables: number;
  alignmentPercentage: number | null;
  averageSelf: number | null;
  averageManager: number | null;
  averageAbsoluteGap: number | null;
  hasImbalances: boolean;
}

export interface EmployeeComparison {
  evaluatedUserId: number;
  evaluatedUserName: string;
  templateId: number;
  templateTitle: string;
  managerUserId: number | null;
  managerName: string | null;
  selfCompleted: boolean;
  managerCompleted: boolean;
  isComparable: boolean;
  summary: ComparisonSummary | null;
  topics: TopicComparison[];
  questions: QuestionComparison[];
}

export interface CycleComparisons {
  cycleId: number;
  cycleName: string;
  comparisons: EmployeeComparison[];
}
