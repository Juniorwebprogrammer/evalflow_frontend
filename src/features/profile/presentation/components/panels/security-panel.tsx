"use client";

import { vexxenProfileUrl } from "@/features/auth/presentation/lib/vexxen";
import { ArrowRightIcon, KeyIcon, LockIcon, ShieldIcon } from "@/shared/ui/icons";

const ITEMS = [
  { icon: LockIcon, title: "Password", text: "Change it or reset it from your Vexxen account." },
  {
    icon: ShieldIcon,
    title: "Two-step verification",
    text: "Turn on a code by email each time you sign in, with recovery codes in case you lose access.",
  },
  { icon: KeyIcon, title: "Sessions", text: "Changing your password in Vexxen signs you out of EvalFlow on every device." },
];

/**
 * EvalFlow signs in with Vexxen: the password and two-step verification are managed there, for every Vexxen
 * app at once.
 */
export function SecurityPanel() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-slate-900">Security</h2>
      <p className="mt-0.5 text-sm text-slate-500">
        You sign in to EvalFlow with your Vexxen account. Its security settings apply to every Vexxen app.
      </p>

      <ul className="mt-5 space-y-4">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "color-mix(in srgb, var(--brand) 12%, white)", color: "var(--brand)" }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="text-sm text-slate-500">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      {vexxenProfileUrl && (
        <a
          href={vexxenProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Manage security in Vexxen
          <ArrowRightIcon className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
