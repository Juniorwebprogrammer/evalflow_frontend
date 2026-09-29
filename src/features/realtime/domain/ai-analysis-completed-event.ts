import type { AiAnalysisStatus } from "@/features/ai-analysis/domain/ai-analysis";

/**
 * Mirrors the backend `AiAnalysisCompletedNotification`, sent as the
 * `"AiAnalysisCompleted"` SignalR event on `/hubs/dashboard` when an AI
 * analysis finishes (successfully or not).
 */
export interface AiAnalysisCompletedEvent {
  analysisId: number;
  cycleId: number;
  templateId: number;
  evaluatedUserId: number;
  estado: AiAnalysisStatus;
}
