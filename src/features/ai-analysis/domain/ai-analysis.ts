/**
 * AI analysis of one employee's evaluation (per cycle and template). Mirrors
 * the backend `AiEvaluationAnalysisDto` / `AiAnalysisResultDto`
 * (`GET|POST /evaluation-cycles/{id}/ai-analysis`). Growth and Enterprise only.
 */
export type AiAnalysisStatus = "Pendiente" | "Procesando" | "Completado" | "Error";

export type AiRiskLevel = "Bajo" | "Medio" | "Alto";

export type AiConfidence = "Baja" | "Media" | "Alta";

export type AiRecipient = "RRHH" | "Evaluado" | "Evaluador";

export interface AiProbableCause {
  tema: string;
  preguntaIds: number[];
  causa: string;
  explicacion: string;
  evidencia: string[];
  confianza: AiConfidence;
}

export interface AiRecommendation {
  destinatario: AiRecipient;
  accion: string;
}

export interface AiSuggestedClarification {
  preguntaId: number | null;
  mensaje: string;
}

export interface AiAnalysisResult {
  resumen: string;
  nivelRiesgo: AiRiskLevel;
  fortalezas: string[];
  areasDeMejora: string[];
  causasProbables: AiProbableCause[];
  patrones: string[];
  recomendaciones: AiRecommendation[];
  solicitudesSugeridas: AiSuggestedClarification[];
  limitaciones: string[];
}

export interface AiAnalysis {
  id: number;
  evaluationCycleId: number;
  templateId: number;
  evaluatedUserId: number;
  estado: AiAnalysisStatus;
  model: string | null;
  fechaCreacion: string;
  fechaCompletado: string | null;
  errorMensaje: string | null;
  result: AiAnalysisResult | null;
}

export interface RequestAiAnalysisInput {
  /** Only this employee; every employee with completed answers when omitted. */
  evaluatedUserId?: number;
  templateId?: number;
  /** Regenerate even if the evaluation didn't change (spends quota). */
  force?: boolean;
}

export interface RequestAiAnalysisResult {
  created: number;
  reused: number;
  analyses: AiAnalysis[];
}

export function isAiAnalysisInProgress(analysis: AiAnalysis): boolean {
  return analysis.estado === "Pendiente" || analysis.estado === "Procesando";
}
