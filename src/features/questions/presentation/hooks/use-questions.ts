"use client";

import { useQuery } from "@tanstack/react-query";
import { listQuestions } from "@/features/questions/presentation/api/question-client";

export function questionsQueryKey(templateId: number) {
  return ["questions", templateId] as const;
}

/** Reads a template's question list (backend `GET .../questions`). */
export function useQuestions(templateId: number) {
  return useQuery({
    queryKey: questionsQueryKey(templateId),
    queryFn: () => listQuestions(templateId),
  });
}
