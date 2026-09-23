import { EvaluationType } from "@/features/evaluation-cycles/domain/evaluation-cycle";

const LABEL: Record<EvaluationType, string> = {
  [EvaluationType.Auto]: "Auto",
  [EvaluationType.Evaluacion180]: "180°",
  [EvaluationType.Evaluacion360]: "360°",
};

/** Short display label for a cycle's `tipoEvaluacion` (badge-sized, e.g. "360°"). */
export function evaluationTypeLabel(type: EvaluationType): string {
  return LABEL[type] ?? "360°";
}
