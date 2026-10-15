import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { ArrowRightIcon, CheckCircleIcon, SparkleIcon } from "@/shared/ui/icons";

const PLAN_POINTS = [
  "Starter: up to 25 employees · Professional: up to 100, with AI analysis",
  "14 days free, then billed monthly or yearly — cancel anytime",
  "Your card is only charged when the trial ends",
];

/**
 * The person has no EvalFlow plan yet: they choose one (and start the free trial) in the Vexxen catalog,
 * in a new tab, and come back here to continue.
 */
export function PlanStep({
  catalogUrl,
  onBack,
  onCheck,
  error,
  checking,
}: {
  catalogUrl: string;
  onBack: () => void;
  onCheck: () => void;
  error: string | null;
  checking: boolean;
}) {
  return (
    <div>
      <span
        className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
        style={{ background: "var(--brand)" }}
      >
        <SparkleIcon className="h-6 w-6" />
      </span>
      <h2 className="mt-5 text-xl font-bold text-slate-900">Choose your plan</h2>
      <p className="mt-1 text-sm text-slate-500">
        Plans and billing are handled by Vexxen. Pick a plan there to start your 14-day free trial, then come back
        to set up your company.
      </p>

      <ul className="mt-5 space-y-2">
        {PLAN_POINTS.map((text) => (
          <li key={text} className="flex items-start gap-2 text-sm text-slate-700">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
            {text}
          </li>
        ))}
      </ul>

      <a
        href={catalogUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Choose a plan in Vexxen
        <ArrowRightIcon className="h-4 w-4" />
      </a>

      {error && (
        <Notice tone="warning" className="mt-4">
          {error}
        </Notice>
      )}

      <div className="mt-6 flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack} disabled={checking}>
          Back
        </Button>
        <Button type="button" variant="outline" onClick={onCheck} loading={checking}>
          I&apos;ve chosen my plan
        </Button>
      </div>
    </div>
  );
}
