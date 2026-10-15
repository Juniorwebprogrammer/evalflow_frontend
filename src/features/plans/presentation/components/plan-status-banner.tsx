"use client";

import { useCompanyPlan } from "@/features/plans/presentation/hooks/use-plans";
import type { PlanState } from "@/features/plans/domain/plan";
import { AlertTriangleIcon, ArrowRightIcon, ClockIcon } from "@/shared/ui/icons";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / DAY_MS));
}

function formatDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long" }) : "";
}

/** What to tell the owner / HR about the plan, or null when there's nothing to say. */
function messageFor(state: PlanState): { tone: "info" | "warning" | "danger"; text: string; action: string } | null {
  if (state.manual) return null;
  switch (state.status) {
    case "trialing": {
      const days = daysUntil(state.trialEndsAt);
      if (days === null || days > 7) return null;
      return {
        tone: "info",
        text: days === 0 ? "Your free trial ends today." : `Your free trial ends in ${days} ${days === 1 ? "day" : "days"} (${formatDate(state.trialEndsAt)}).`,
        action: "Review plan",
      };
    }
    case "canceling":
      return {
        tone: "warning",
        text: `Your EvalFlow plan was canceled. The company becomes read-only on ${formatDate(state.accessEndsAt)}.`,
        action: "Keep my plan",
      };
    case "past_due":
      return {
        tone: "warning",
        text: `The last payment failed. Update the payment method before ${formatDate(state.accessEndsAt)} to keep EvalFlow.`,
        action: "Fix payment",
      };
    case "none":
      return {
        tone: "danger",
        text: "Your company doesn't have an active EvalFlow plan, so it's read-only: you can view everything but can't make changes.",
        action: "Choose a plan",
      };
    default:
      return null;
  }
}

const TONES = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-red-200 bg-red-50 text-red-900",
};

/**
 * Plan notices for the owner and HR (the only roles that can read the company plan): trial ending, plan
 * canceled, payment failed, or read-only. Plans are managed in Vexxen, so the action opens it.
 */
export function PlanStatusBanner() {
  const { data } = useCompanyPlan();
  const message = data ? messageFor(data.state) : null;
  if (!message) return null;

  const Icon = message.tone === "info" ? ClockIcon : AlertTriangleIcon;
  return (
    <div className={`flex flex-col gap-3 border-b px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 ${TONES[message.tone]}`}>
      <p className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        {message.text}
      </p>
      {data?.state.manageUrl && (
        <a
          href={data.state.manageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 font-semibold underline-offset-2 hover:underline"
        >
          {message.action}
          <ArrowRightIcon className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
