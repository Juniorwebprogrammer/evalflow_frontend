"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEvaluationCycles } from "@/features/evaluation-cycles/presentation/hooks/use-evaluation-cycles";
import { useGenerateSubmissions } from "@/features/evaluation-cycles/presentation/hooks/use-generate-submissions";
import { useToggleCycleActive } from "@/features/evaluation-cycles/presentation/hooks/use-toggle-cycle-active";
import { EvaluationCycleFormModal } from "@/features/evaluation-cycles/presentation/components/evaluation-cycle-form-modal";
import { DeleteEvaluationCycleModal } from "@/features/evaluation-cycles/presentation/components/delete-evaluation-cycle-modal";
import { ManageCycleTemplatesModal } from "@/features/evaluation-cycles/presentation/components/manage-cycle-templates-modal";
import {
  evaluationCycleStatus,
  evaluationCycleStatusClass,
  evaluationCycleStatusLabel,
} from "@/features/evaluation-cycles/presentation/components/evaluation-cycle-status";
import { evaluationTypeLabel } from "@/features/evaluation-cycles/presentation/components/evaluation-cycle-type-label";
import { EvaluationType } from "@/features/evaluation-cycles/domain/evaluation-cycle";
import { useTemplates } from "@/features/templates/presentation/hooks/use-templates";
import { useCycleSubmissions } from "@/features/evaluation-submissions/presentation/hooks/use-cycle-submissions";
import { useDeleteSubmission } from "@/features/evaluation-submissions/presentation/hooks/use-delete-submission";
import { useMyFeatures } from "@/features/auth/presentation/hooks/use-my-features";
import { CompleteCycleModal } from "@/features/evaluation-results/presentation/components/complete-cycle-modal";
import { CycleResultsSection } from "@/features/evaluation-results/presentation/components/cycle-results-section";
import { isPrivilegedRole } from "@/shared/lib/roles";
import { Notice } from "@/shared/ui/notice";
import { Button } from "@/shared/ui/button";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClipboardIcon,
  ClockIcon,
  DocIcon,
  EditIcon,
  PowerIcon,
  ScaleIcon,
  SparkleIcon,
  TrashIcon,
  UsersIcon,
} from "@/shared/ui/icons";
import { ApiError } from "@/shared/lib/api-error";
import { formatDate } from "@/shared/lib/format-date";

type ModalAction = "edit" | "delete" | "manage-templates" | "complete" | null;

/**
 * Evaluation cycle detail. The backend has no `GET /evaluation-cycles/{id}`,
 * so this reuses the `GET /evaluation-cycles` list already cached by
 * `useEvaluationCycles` and finds the matching entry — `templateIds` is
 * already part of that DTO, so nothing is lost by not having a dedicated
 * endpoint. Owner/Rrhh get "Editar" / "Gestionar plantillas" / "Eliminar"
 * (moved here from the list) plus a "Generar formularios" button and a
 * progress list of every assigned user's submission
 * (`GET /evaluation-cycles/{cycleId}/submissions`), each deletable.
 */
export function EvaluationCycleDetailView({ cycleId }: { cycleId: number }) {
  const router = useRouter();
  const { data: cycles, isLoading, error } = useEvaluationCycles();
  const { data: templates } = useTemplates();
  const { data: myFeatures } = useMyFeatures();
  const canManage = isPrivilegedRole(myFeatures?.role);
  const { generate, isGenerating, error: generateError, message } =
    useGenerateSubmissions(cycleId);
  const { toggle: toggleActive, isToggling, error: toggleError } = useToggleCycleActive();
  const [modalAction, setModalAction] = useState<ModalAction>(null);

  const cycle = cycles?.find((c) => c.id === cycleId);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando ciclo de evaluación…</p>;
  }

  if (error) {
    return (
      <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
        {error instanceof ApiError
          ? error.message
          : "No se pudo cargar el ciclo de evaluación."}
      </Notice>
    );
  }

  if (!cycle) {
    return (
      <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
        No se encontró este ciclo de evaluación.
      </Notice>
    );
  }

  const status = evaluationCycleStatus(cycle);
  const isCompleted = cycle.fechaCompletado !== null;
  const cycleTemplates = (templates ?? []).filter((t) => cycle.templateIds.includes(t.id));

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/ciclos-evaluacion"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" />
        Volver a ciclos de evaluación
      </Link>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)]/10 text-[var(--brand)]">
              <ClipboardIcon className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900">{cycle.nombre}</h1>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${evaluationCycleStatusClass(status)}`}
                >
                  {evaluationCycleStatusLabel(status)}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {evaluationTypeLabel(cycle.tipoEvaluacion)}
                </span>
              </div>
              {cycle.descripcion && (
                <p className="mt-1 text-sm text-slate-500">{cycle.descripcion}</p>
              )}
            </div>
          </div>

          {canManage && isCompleted && cycle.tipoEvaluacion === EvaluationType.Evaluacion360 && (
            <Link
              href={`/dashboard/ciclos-evaluacion/${cycleId}/comparacion`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ScaleIcon className="h-4 w-4" />
              Ver comparación
            </Link>
          )}

          {canManage && !isCompleted && (
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" loading={isGenerating} onClick={() => generate()}>
                <SparkleIcon className="h-4 w-4" />
                Generar formularios
              </Button>
              <Button type="button" variant="outline" onClick={() => setModalAction("complete")}>
                <CheckCircleIcon className="h-4 w-4" />
                Completar evaluación
              </Button>
              {cycle.tipoEvaluacion === EvaluationType.Evaluacion360 && (
                <Link
                  href={`/dashboard/ciclos-evaluacion/${cycleId}/comparacion`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <ScaleIcon className="h-4 w-4" />
                  Comparar evaluaciones
                </Link>
              )}
              <Button
                type="button"
                variant="outline"
                loading={isToggling}
                onClick={() => toggleActive(cycle)}
              >
                <PowerIcon className="h-4 w-4" />
                {cycle.activo ? "Desactivar ciclo" : "Activar ciclo"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalAction("manage-templates")}
              >
                <DocIcon className="h-4 w-4" />
                Gestionar plantillas
              </Button>
              <Button type="button" variant="outline" onClick={() => setModalAction("edit")}>
                <EditIcon className="h-4 w-4" />
                Editar
              </Button>
              <button
                type="button"
                title="Eliminar"
                onClick={() => setModalAction("delete")}
                className="rounded-lg p-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Fecha de inicio
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-800">
              <CalendarIcon className="h-4 w-4 text-slate-400" />
              {formatDate(cycle.fechaInicio)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Fecha de fin
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-800">
              <CalendarIcon className="h-4 w-4 text-slate-400" />
              {formatDate(cycle.fechaFin)}
            </p>
          </div>
        </div>

        {message && (
          <Notice tone="success" className="mt-5">
            {message}
          </Notice>
        )}
        {generateError && (
          <Notice tone="error" className="mt-5">
            {generateError}
          </Notice>
        )}
        {toggleError && (
          <Notice tone="error" className="mt-5">
            {toggleError}
          </Notice>
        )}
        {isCompleted && (
          <Notice tone="success" icon={<CheckCircleIcon className="h-5 w-5" />} className="mt-5">
            Evaluación completada el {formatDate(cycle.fechaCompletado ?? "")}. El ciclo está cerrado y
            los resultados de cada empleado ya están guardados.
          </Notice>
        )}
      </section>

      {canManage && isCompleted && <CycleResultsSection cycleId={cycleId} />}

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">
          Plantillas del ciclo ({cycleTemplates.length})
        </h2>

        {cycleTemplates.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            Este ciclo todavía no tiene plantillas asignadas.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {cycleTemplates.map((template) => (
              <Link
                key={template.id}
                href={`/dashboard/plantillas/${template.id}`}
                className="flex items-center gap-3 rounded-lg border border-slate-100 px-3.5 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <DocIcon className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="flex-1 truncate font-medium">{template.titulo}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {canManage && <CycleProgressSection cycleId={cycleId} enabled={canManage} />}

      {modalAction === "complete" && (
        <CompleteCycleModal
          cycleId={cycleId}
          cycleName={cycle.nombre}
          onClose={() => setModalAction(null)}
        />
      )}
      {modalAction === "edit" && (
        <EvaluationCycleFormModal cycle={cycle} onClose={() => setModalAction(null)} />
      )}
      {modalAction === "delete" && (
        <DeleteEvaluationCycleModal
          cycle={cycle}
          onClose={() => setModalAction(null)}
          onDeleted={() => router.push("/dashboard/ciclos-evaluacion")}
        />
      )}
      {modalAction === "manage-templates" && (
        <ManageCycleTemplatesModal cycleId={cycleId} onClose={() => setModalAction(null)} />
      )}
    </div>
  );
}

/**
 * Progress of every assigned user's submission for this cycle
 * (`GET /evaluation-cycles/{cycleId}/submissions`, Owner/Rrhh only) — who
 * has to answer, who they're evaluating, and whether they're done, each
 * deletable in case of a mistake.
 */
function CycleProgressSection({ cycleId, enabled }: { cycleId: number; enabled: boolean }) {
  const { data: submissions, isLoading, error } = useCycleSubmissions(cycleId, { enabled });
  const { remove, pendingId, error: deleteError } = useDeleteSubmission(cycleId);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
        <UsersIcon className="h-4 w-4 text-slate-400" />
        Usuarios asignados {submissions ? `(${submissions.length})` : ""}
      </h2>

      {isLoading && (
        <p className="mt-3 text-sm text-slate-500">Cargando progreso del ciclo…</p>
      )}

      {error && (
        <Notice tone="error" className="mt-3" icon={<AlertTriangleIcon className="h-5 w-5" />}>
          {error instanceof ApiError
            ? error.message
            : "No se pudo cargar el progreso del ciclo."}
        </Notice>
      )}

      {submissions && submissions.length === 0 && (
        <p className="mt-3 text-sm text-slate-500">
          Todavía no se han generado formularios para este ciclo — usa
          &ldquo;Generar formularios&rdquo; arriba.
        </p>
      )}

      {submissions && submissions.length > 0 && (
        <div className="mt-3 space-y-2">
          {submissions.map((submission) => (
            <div
              key={submission.submissionId}
              className="flex flex-col gap-3 rounded-lg border border-slate-100 px-3.5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-800">
                  {submission.respondentUserName}{" "}
                  <span className="font-normal text-slate-500">
                    evalúa a {submission.evaluatedUserName}
                  </span>
                </p>
                <p className="text-xs text-slate-400">{submission.templateTitle}</p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    submission.isCompleted
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {submission.isCompleted ? (
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                  ) : (
                    <ClockIcon className="h-3.5 w-3.5" />
                  )}
                  {submission.isCompleted ? "Completado" : "Pendiente"}
                </span>

                {confirmingId === submission.submissionId ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">¿Eliminar?</span>
                    <Button
                      type="button"
                      variant="danger"
                      loading={pendingId === submission.submissionId}
                      onClick={async () => {
                        try {
                          await remove(submission.submissionId);
                          setConfirmingId(null);
                        } catch {
                          // Error is surfaced via `deleteError` below.
                        }
                      }}
                      className="px-2.5 py-1.5 text-xs"
                    >
                      Confirmar
                    </Button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className="text-xs font-medium text-slate-500 hover:text-slate-700"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    title="Eliminar formulario"
                    onClick={() => setConfirmingId(submission.submissionId)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteError && (
        <Notice tone="error" className="mt-3">
          {deleteError}
        </Notice>
      )}
    </section>
  );
}
