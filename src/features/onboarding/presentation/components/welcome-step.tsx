import { Button } from "@/shared/ui/button";
import {
  ShieldIcon,
  ScaleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SparkleIcon,
} from "@/shared/ui/icons";

const WELCOME_POINTS = [
  { icon: ShieldIcon, text: "Responses stay sealed until HR reviews them" },
  { icon: ScaleIcon, text: "Automatic analysis of gaps and bias" },
  { icon: CheckCircleIcon, text: "Objective, traceable mediation between both sides" },
];

export function WelcomeStep({
  firstName,
  email,
  onStart,
  onCancel,
}: {
  firstName: string;
  email: string;
  onStart: () => void;
  onCancel: () => void;
}) {
  return (
    <div>
      <span
        className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
        style={{ background: "var(--brand)" }}
      >
        <SparkleIcon className="h-6 w-6" />
      </span>
      <h2 className="mt-5 text-2xl font-bold text-slate-900">
        Welcome to EvalFlow{firstName ? `, ${firstName}` : ""}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        EvalFlow is the neutral referee for your performance evaluations. It
        seals responses until HR reviews them, pre-analyzes gaps and bias, and
        enables objective, data-driven mediation.
      </p>

      <ul className="mt-6 space-y-3">
        {WELCOME_POINTS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                background: "color-mix(in srgb, var(--brand) 12%, white)",
                color: "var(--brand)",
              }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-sm text-slate-700">{text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-col gap-2">
        <Button onClick={onStart}>
          Set up my company
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        You&apos;re signed in with Vexxen as{" "}
        <span className="font-semibold text-slate-700">{email}</span>. Were you invited by your company? Open the
        link in your invitation email instead.
      </p>
    </div>
  );
}
