import type {
  AiConfidence,
  AiRecipient,
  AiRiskLevel,
} from "@/features/ai-analysis/domain/ai-analysis";

const RISK_LABEL: Record<AiRiskLevel, string> = {
  Bajo: "Low",
  Medio: "Medium",
  Alto: "High",
};

const CONFIDENCE_LABEL: Record<AiConfidence, string> = {
  Alta: "High",
  Media: "Medium",
  Baja: "Low",
};

const RECIPIENT_LABEL: Record<AiRecipient, string> = {
  RRHH: "HR",
  Evaluado: "Employee",
  Evaluador: "Evaluator",
};

/** The fixed cause categories the backend prompt allows (`AiAnalysisPrompt.Causes`). */
const CAUSE_LABEL: Record<string, string> = {
  "Expectativas no alineadas": "Misaligned expectations",
  "Falta de feedback": "Lack of feedback",
  "Desconocimiento del rol": "Unclear understanding of the role",
  "Sesgo de autopercepción": "Self-perception bias",
  "Evidencia insuficiente": "Insufficient evidence",
  "Diferente criterio de valoración": "Different rating criteria",
  "Contexto o carga de trabajo": "Context or workload",
  Otro: "Other",
};

export function aiRiskLabel(level: AiRiskLevel): string {
  return RISK_LABEL[level] ?? level;
}

export function aiConfidenceLabel(confidence: AiConfidence): string {
  return CONFIDENCE_LABEL[confidence] ?? confidence;
}

export function aiRecipientLabel(recipient: AiRecipient): string {
  return RECIPIENT_LABEL[recipient] ?? recipient;
}

export function aiCauseLabel(cause: string): string {
  return CAUSE_LABEL[cause] ?? cause;
}
