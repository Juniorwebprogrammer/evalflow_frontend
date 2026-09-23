import type {
  EvaluationCycle,
  CreateEvaluationCycleInput,
  UpdateEvaluationCycleInput,
  CreateEvaluationCycleResult,
  EvaluationCycleActionResult,
} from "@/features/evaluation-cycles/domain/evaluation-cycle";

/** Port for evaluation-cycle management. Implemented by the infrastructure layer. */
export interface EvaluationCycleRepository {
  /** Creates an evaluation cycle for the caller's company. */
  create(
    input: CreateEvaluationCycleInput,
    accessToken: string,
  ): Promise<CreateEvaluationCycleResult>;

  /** Updates an evaluation cycle's fields, including its active state. */
  update(
    id: number,
    input: UpdateEvaluationCycleInput,
    accessToken: string,
  ): Promise<EvaluationCycleActionResult>;

  /** Deletes an evaluation cycle. */
  remove(id: number, accessToken: string): Promise<EvaluationCycleActionResult>;

  /** Lists every evaluation cycle of the caller's company. */
  listAll(accessToken: string): Promise<EvaluationCycle[]>;

  /** Toggles whether a template belongs to an evaluation cycle. */
  toggleTemplate(
    cycleId: number,
    templateId: number,
    accessToken: string,
  ): Promise<EvaluationCycleActionResult>;

  /**
   * Materializes self/manager submissions for every user assigned to the
   * cycle's templates and emails them a heads-up (backend
   * `POST /evaluation-cycles/{cycleId}/generate-submissions`). Safe to call
   * more than once — the backend skips duplicates.
   */
  generateSubmissions(
    cycleId: number,
    accessToken: string,
  ): Promise<EvaluationCycleActionResult>;
}
