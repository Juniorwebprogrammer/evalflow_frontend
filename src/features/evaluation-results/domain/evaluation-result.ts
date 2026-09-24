/**
 * Evaluation results — the frozen outcome of each employee's evaluation,
 * generated when Owner/RRHH completes a cycle. Mirrors the backend
 * `Features/EvaluationResults` contracts; the PDF report is rendered by the
 * backend from the stored result.
 */

export interface EvaluationResultSummary {
  id: number;
  cycleId: number;
  cycleName: string;
  templateId: number;
  templateTitle: string;
  evaluatedUserId: number;
  evaluatedUserName: string;
  completedAt: string;
  averageFinal: number | null;
}

export interface CompleteEvaluationCycleResult {
  message: string;
  resultsGenerated: number;
  autoCompletedSubmissions: number;
  completedAt: string;
}

export interface EvaluationResultFile {
  body: ArrayBuffer;
  contentType: string;
  contentDisposition: string | null;
}
