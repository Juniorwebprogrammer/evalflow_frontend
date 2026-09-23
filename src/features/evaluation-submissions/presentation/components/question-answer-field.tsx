"use client";

import { QuestionType } from "@/features/questions/domain/question";
import type { SubmissionQuestionResponse } from "@/features/evaluation-submissions/presentation/api/evaluation-submission-client";
import { StarIcon } from "@/shared/ui/icons";

const RATING_VALUES = [1, 2, 3, 4, 5];

/**
 * Renders the answer control for one question, switching on its
 * `QuestionType`, and reports the value back as the opaque string the
 * backend expects to store (`RawPayload`):
 * - `Desarrollo` → free text as-is.
 * - `Estrellas` / `Escala1a5` → the chosen number as a string (`"4"`).
 * - `Seleccion` → a JSON-stringified array of the checked option(s), since
 *   the backend's own comment describes it as "radio buttons o checkboxes".
 */
export function QuestionAnswerField({
  question,
  value,
  onChange,
}: {
  question: SubmissionQuestionResponse;
  value: string;
  onChange: (rawPayload: string) => void;
}) {
  switch (question.tipo) {
    case QuestionType.Estrellas: {
      const selected = Number(value) || 0;
      return (
        <div className="flex items-center gap-1.5">
          {RATING_VALUES.map((n) => (
            <button
              key={n}
              type="button"
              title={`${n} de 5`}
              onClick={() => onChange(String(n))}
              className="text-amber-400 transition hover:scale-110"
            >
              <StarIcon
                className="h-7 w-7"
                fill={n <= selected ? "currentColor" : "none"}
              />
            </button>
          ))}
        </div>
      );
    }

    case QuestionType.Escala1a5: {
      const selected = Number(value) || 0;
      return (
        <div className="flex items-center gap-2">
          {RATING_VALUES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(String(n))}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition ${
                n === selected
                  ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      );
    }

    case QuestionType.Seleccion: {
      const selected: string[] = value
        ? (JSON.parse(value) as string[])
        : [];
      const options = question.opciones ?? [];

      function toggle(option: string) {
        const next = selected.includes(option)
          ? selected.filter((o) => o !== option)
          : [...selected, option];
        onChange(JSON.stringify(next));
      }

      return (
        <div className="space-y-1.5">
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center gap-3 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggle(option)}
                className="h-4 w-4 rounded border-slate-300 text-[var(--brand)] focus:ring-[var(--brand)]/30"
              />
              <span className="flex-1">{option}</span>
            </label>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}

/** Whether a question has a non-empty answer, per its `RawPayload` serialization. */
export function isAnswered(tipo: QuestionType, value: string): boolean {
  if (!value) return false;
  if (tipo === QuestionType.Seleccion) {
    try {
      const parsed = JSON.parse(value) as string[];
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  }
  return value.trim().length > 0;
}
