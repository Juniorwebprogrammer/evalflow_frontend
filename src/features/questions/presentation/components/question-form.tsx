"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Field } from "@/shared/ui/field";
import { Select } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { CheckCircleIcon, PlusIcon, TrashIcon } from "@/shared/ui/icons";
import {
  createQuestion,
  updateQuestion,
  type QuestionResponse,
} from "@/features/questions/presentation/api/question-client";
import { QuestionType } from "@/features/questions/domain/question";
import { questionsQueryKey } from "@/features/questions/presentation/hooks/use-questions";
import { errorMessage } from "@/shared/lib/api-error";
import { upsertById } from "@/shared/lib/query-cache";

const QUESTION_TYPE_OPTIONS = [
  { value: String(QuestionType.Estrellas), label: "Stars (1 to 5)" },
  { value: String(QuestionType.Seleccion), label: "Multiple choice" },
  { value: String(QuestionType.Escala1a5), label: "Numeric scale (1 to 5)" },
] as const;

interface FormState {
  texto: string;
  tipo: QuestionType;
  topic: string;
  opciones: string[];
  orden: number;
}

function toFormState(question?: QuestionResponse, nextOrden?: number): FormState {
  return {
    texto: question?.texto ?? "",
    tipo: question?.tipo ?? QuestionType.Escala1a5,
    topic: question?.topic ?? "General",
    opciones: question?.opciones && question.opciones.length > 0 ? question.opciones : ["", ""],
    orden: question?.orden ?? nextOrden ?? 1,
  };
}

/**
 * Question create/edit form, meant to be embedded inside a modal. Edits when
 * `question` is given, creates otherwise. `nextOrden` seeds the default
 * order for a new question (e.g. the template's question count + 1).
 */
export function QuestionForm({
  templateId,
  question,
  nextOrden,
  onSaved,
  onCancel,
}: {
  templateId: number;
  question?: QuestionResponse;
  nextOrden?: number;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEditing = Boolean(question);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(() => toFormState(question, nextOrden));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function updateOption(index: number, value: string) {
    setForm((prev) => ({
      ...prev,
      opciones: prev.opciones.map((o, i) => (i === index ? value : o)),
    }));
  }

  function addOption() {
    setForm((prev) => ({ ...prev, opciones: [...prev.opciones, ""] }));
  }

  function removeOption(index: number) {
    setForm((prev) => ({
      ...prev,
      opciones: prev.opciones.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const input = {
      texto: form.texto,
      tipo: form.tipo,
      topic: form.topic,
      opciones: form.tipo === QuestionType.Seleccion ? form.opciones : null,
      orden: form.orden,
    };
    try {
      let savedId: number;
      if (isEditing && question) {
        await updateQuestion(templateId, question.id, input);
        savedId = question.id;
      } else {
        const result = await createQuestion(templateId, input);
        savedId = result.questionId;
      }
      setSaved(true);

      // Write the known-good result straight into the cache instead of only
      // invalidating — see the equivalent note in template-form.tsx.
      const saved: QuestionResponse = {
        id: savedId,
        templateId,
        texto: input.texto,
        tipo: input.tipo,
        topic: input.topic,
        opciones: input.opciones ?? null,
        orden: input.orden,
      };
      queryClient.setQueryData<QuestionResponse[]>(questionsQueryKey(templateId), (old) =>
        upsertById(old, saved).sort((a, b) => a.orden - b.orden),
      );
    } catch (err) {
      setError(
        errorMessage(
          err,
          isEditing
            ? "We couldn't update the question."
            : "We couldn't create the question.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (saved) {
    return (
      <>
        <Notice
          tone="success"
          icon={<CheckCircleIcon className="h-5 w-5 text-emerald-600" />}
        >
          Question {isEditing ? "updated" : "created"} successfully.
        </Notice>
        <Button type="button" className="mt-5 w-full" onClick={onSaved}>
          OK
        </Button>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        label="Question text"
        value={form.texto}
        onChange={(e) => update({ texto: e.target.value })}
        placeholder="How would you rate overall performance?"
        required
        autoFocus
      />

      <Field
        label="Topic"
        value={form.topic}
        onChange={(e) => update({ topic: e.target.value })}
        placeholder="General"
        required
      />

      <Select
        label="Type"
        value={String(form.tipo)}
        onChange={(e) => update({ tipo: Number(e.target.value) as QuestionType })}
        options={QUESTION_TYPE_OPTIONS}
      />
      {/*
        No manual "order" field — the order is set by dragging questions in
        the list (see QuestionsManager). A new question is appended at the
        end (`nextOrden`); an edit keeps the question's current position.
      */}

      {form.tipo === QuestionType.Seleccion && (
        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">Options</p>
          <div className="space-y-2">
            {form.opciones.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  className="w-full flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={form.opciones.length <= 2}
                  className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Remove option"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand)] hover:underline"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Add option
          </button>
        </div>
      )}

      {error && <Notice tone="error">{error}</Notice>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {isEditing ? "Save changes" : "Create question"}
        </Button>
      </div>
    </form>
  );
}
