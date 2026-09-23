"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useQuestions,
  questionsQueryKey,
} from "@/features/questions/presentation/hooks/use-questions";
import {
  updateQuestion,
  type QuestionResponse,
} from "@/features/questions/presentation/api/question-client";
import { QuestionType } from "@/features/questions/domain/question";
import { QuestionFormModal } from "@/features/questions/presentation/components/question-form-modal";
import { DeleteQuestionModal } from "@/features/questions/presentation/components/delete-question-modal";
import { Notice } from "@/shared/ui/notice";
import { Button } from "@/shared/ui/button";
import {
  AlertTriangleIcon,
  EditIcon,
  GripIcon,
  ListIcon,
  PlusIcon,
  TrashIcon,
} from "@/shared/ui/icons";
import { ApiError } from "@/shared/lib/api-error";

const TYPE_BADGE: Record<QuestionType, { label: string; className: string }> = {
  [QuestionType.Estrellas]: { label: "★ Valoración", className: "bg-indigo-100 text-indigo-600" },
  [QuestionType.Seleccion]: { label: "Múltiple", className: "bg-amber-100 text-amber-700" },
  [QuestionType.Escala1a5]: { label: "Escala 1-5", className: "bg-emerald-100 text-emerald-700" },
};

type Action =
  | { type: "create" }
  | { type: "edit"; question: QuestionResponse }
  | { type: "delete"; question: QuestionResponse }
  | null;

interface TopicGroup {
  topic: string;
  questions: QuestionResponse[];
}

/** Position of a question within its topic group, used to scope drag-and-drop. */
interface DragKey {
  topic: string;
  index: number;
}

/**
 * Groups questions by `topic` (blank topic falls under "General"), sorted
 * alphabetically by topic name. Within a group, questions keep the relative
 * order they arrive in — callers pass questions already sorted by `orden`.
 */
function groupByTopic(questions: QuestionResponse[]): TopicGroup[] {
  const map = new Map<string, QuestionResponse[]>();
  for (const question of questions) {
    const topic = question.topic.trim() || "General";
    const group = map.get(topic);
    if (group) {
      group.push(question);
    } else {
      map.set(topic, [question]);
    }
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "es", { sensitivity: "base" }))
    .map(([topic, groupQuestions]) => ({ topic, questions: groupQuestions }));
}

/**
 * Manages a template's questions (backend
 * `GET/POST/PUT/DELETE /templates/{templateId}/questions[...]`), ordered by
 * `orden`. Reordering is done by dragging a question by its grip handle —
 * there's no manual "orden" input. `canManage` hides add/edit/delete/drag
 * for non Owner/Rrhh callers.
 */
export function QuestionsManager({
  templateId,
  canManage,
}: {
  templateId: number;
  canManage: boolean;
}) {
  const queryClient = useQueryClient();
  const { data: questions, isLoading, error } = useQuestions(templateId);
  const [action, setAction] = useState<Action>(null);
  const [dragKey, setDragKey] = useState<DragKey | null>(null);
  const [overKey, setOverKey] = useState<DragKey | null>(null);
  const [reordering, setReordering] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);
  // A fast drag can fire dragstart → dragover → drop before React commits
  // the setDragKey state update, so reading `dragKey` (state) inside the
  // drop handler can see a stale `null` and silently no-op — no request, no
  // UI change. A ref is written/read synchronously, so it can't race.
  const dragKeyRef = useRef<DragKey | null>(null);

  const groups = questions ? groupByTopic(questions) : [];

  function handleDragStart(topic: string, index: number, e: React.DragEvent) {
    const key: DragKey = { topic, index };
    dragKeyRef.current = key;
    setDragKey(key);
    e.dataTransfer.effectAllowed = "move";
    // Fallback source-of-truth in case the ref gets reset by an unrelated
    // re-render before drop (e.g. Firefox needs data set to allow the drag).
    e.dataTransfer.setData("text/plain", JSON.stringify(key));
  }

  function handleDragEnd() {
    dragKeyRef.current = null;
    setDragKey(null);
    setOverKey(null);
  }

  async function handleDrop(topic: string, dropIndex: number, e: React.DragEvent) {
    e.preventDefault();
    setOverKey(null);
    let from = dragKeyRef.current;
    if (!from) {
      try {
        from = JSON.parse(e.dataTransfer.getData("text/plain")) as DragKey;
      } catch {
        from = null;
      }
    }
    dragKeyRef.current = null;
    setDragKey(null);
    // Reordering is scoped to a single topic group — a drop onto a
    // different group's list is a no-op.
    if (!from || from.topic !== topic || !questions) return;
    if (from.index === dropIndex) return;

    const previousOrden = new Map(questions.map((q) => [q.id, q.orden]));
    const targetGroup = groups.find((g) => g.topic === topic);
    if (!targetGroup) return;

    const reorderedGroupQuestions = [...targetGroup.questions];
    const [moved] = reorderedGroupQuestions.splice(from.index, 1);
    if (!moved) return;
    reorderedGroupQuestions.splice(dropIndex, 0, moved);

    // Flatten every group back into a single list — group order stays
    // alphabetical, only the dragged group's internal order changed — and
    // renumber `orden` sequentially across that flattened order.
    const withNewOrder = groups
      .map((g) => (g.topic === topic ? reorderedGroupQuestions : g.questions))
      .flat()
      .map((q, i) => ({ ...q, orden: i + 1 }));

    // Optimistic UI update — see the note in question-form.tsx on why we
    // write the known-good result straight into the cache.
    queryClient.setQueryData<QuestionResponse[]>(questionsQueryKey(templateId), withNewOrder);

    const changed = withNewOrder.filter((q) => previousOrden.get(q.id) !== q.orden);
    if (changed.length === 0) return;

    setReordering(true);
    setReorderError(null);
    try {
      await Promise.all(
        changed.map((q) =>
          updateQuestion(templateId, q.id, {
            texto: q.texto,
            tipo: q.tipo,
            topic: q.topic,
            opciones: q.opciones,
            orden: q.orden,
          }),
        ),
      );
    } catch (err) {
      setReorderError(
        err instanceof ApiError
          ? err.message
          : "No se pudo guardar el nuevo orden. Actualiza la página e inténtalo de nuevo.",
      );
    } finally {
      setReordering(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando preguntas…</p>;
  }

  if (error) {
    return (
      <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
        {error instanceof ApiError
          ? error.message
          : "No se pudo cargar el listado de preguntas."}
      </Notice>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">Preguntas</h2>
        {canManage && (
          <Button type="button" onClick={() => setAction({ type: "create" })}>
            <PlusIcon className="h-4 w-4" />
            Nueva pregunta
          </Button>
        )}
      </div>

      {(!questions || questions.length === 0) && (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-4 text-sm text-slate-500">
          <ListIcon className="h-5 w-5 shrink-0 text-slate-400" />
          <span>Esta plantilla todavía no tiene preguntas.</span>
        </div>
      )}

      {questions && questions.length > 0 && (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.topic}>
              <h3 className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase">
                {group.topic}
              </h3>
              <ol className="space-y-2">
                {group.questions.map((question, index) => {
                  const badge = TYPE_BADGE[question.tipo];
                  const isOver = overKey?.topic === group.topic && overKey.index === index;
                  const isDragging =
                    dragKey?.topic === group.topic && dragKey.index === index;
                  return (
                    <li
                      key={question.id}
                      onDragOver={(e) => {
                        // Always preventDefault (not gated on drag state) —
                        // the same race that breaks the drop handler can
                        // otherwise skip this too and the browser refuses
                        // the drop entirely.
                        e.preventDefault();
                        // Reordering is scoped to a single topic group —
                        // show a "not allowed" cursor and skip the
                        // highlight when dragging across groups.
                        if (dragKeyRef.current && dragKeyRef.current.topic !== group.topic) {
                          e.dataTransfer.dropEffect = "none";
                          return;
                        }
                        e.dataTransfer.dropEffect = "move";
                        setOverKey({ topic: group.topic, index });
                      }}
                      onDrop={(e) => handleDrop(group.topic, index, e)}
                      className={`rounded-lg bg-slate-50 px-4 py-3.5 transition ${
                        isOver ? "ring-2 ring-[var(--brand)]/40" : ""
                      } ${isDragging ? "opacity-40" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        {canManage && (
                          <span
                            draggable={!reordering}
                            onDragStart={(e) => handleDragStart(group.topic, index, e)}
                            onDragEnd={handleDragEnd}
                            title="Arrastra para reordenar dentro del mismo topic"
                            className="mt-0.5 flex h-7 w-5 shrink-0 cursor-grab items-center justify-center text-slate-300 transition hover:text-slate-500 active:cursor-grabbing"
                          >
                            <GripIcon className="h-4 w-4" />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                          <p className="mt-1.5 text-sm text-slate-800">{question.texto}</p>
                          {question.tipo === QuestionType.Seleccion &&
                            question.opciones &&
                            question.opciones.length > 0 && (
                              <p className="mt-1 text-xs text-slate-500">
                                {question.opciones.join(" · ")}
                              </p>
                            )}
                        </div>
                        {canManage && (
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              title="Editar"
                              onClick={() => setAction({ type: "edit", question })}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              title="Eliminar"
                              onClick={() => setAction({ type: "delete", question })}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-100 hover:text-red-600"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      )}

      {reorderError && <Notice tone="error">{reorderError}</Notice>}

      {action?.type === "create" && (
        <QuestionFormModal
          templateId={templateId}
          nextOrden={(questions?.length ?? 0) + 1}
          onClose={() => setAction(null)}
        />
      )}
      {action?.type === "edit" && (
        <QuestionFormModal
          templateId={templateId}
          question={action.question}
          onClose={() => setAction(null)}
        />
      )}
      {action?.type === "delete" && (
        <DeleteQuestionModal
          templateId={templateId}
          question={action.question}
          onClose={() => setAction(null)}
        />
      )}
    </div>
  );
}
