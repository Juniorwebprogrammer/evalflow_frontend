/**
 * Mirrors the backend `EvaluationCompletedNotification`, sent as the
 * `"EvaluationCompleted"` SignalR event on `/hubs/dashboard` whenever a
 * respondent (subordinate or evaluator) finishes and saves a submission.
 */
export interface EvaluationCompletedEvent {
  submissionId: number;
  cycleId: number;
  respondentUserId: number;
  respondentUserName: string;
  evaluatedUserId: number;
  evaluatedUserName: string;
  templateTitle: string;
  isSelfEvaluation: boolean;
  timestamp: string;
}

/** One live entry in the dashboard's "actividad reciente" feed. */
export interface LiveActivityItem {
  id: string;
  respondentUserName: string;
  evaluatedUserName: string;
  isSelfEvaluation: boolean;
  timestamp: string;
}
