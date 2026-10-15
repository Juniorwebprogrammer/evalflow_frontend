"use client";

import type { Profile } from "@/features/profile/domain/profile";
import { Field } from "@/shared/ui/field";
import { Select } from "@/shared/ui/select";
import { UserIcon, MailIcon, ArrowRightIcon } from "@/shared/ui/icons";
import { roleLabel } from "@/features/team/presentation/lib/format";
import { vexxenProfileUrl } from "@/features/auth/presentation/lib/vexxen";
import {
  EXAMPLE_PROFILE,
} from "@/features/profile/presentation/data/example";

/**
 * Name and email come from the Vexxen account (copied on every sign-in), so they're read-only here and
 * edited in Vexxen. Cargo (the user's role) is real but read-only; Departamento is example data.
 */
export function PersonalDataPanel({ profile }: { profile: Profile }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Personal details</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Information visible to your HR team. Your name and email come from your Vexxen account.
          </p>
        </div>
        {vexxenProfileUrl && (
          <a
            href={vexxenProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Edit in Vexxen
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="First name" icon={<UserIcon className="h-4 w-4" />} value={profile.nombre} disabled />
        <Field label="Last name" value={profile.apellidos} disabled />
        <Field
          label="Work email"
          type="email"
          icon={<MailIcon className="h-4 w-4" />}
          value={profile.email}
          disabled
        />
        <Field label="Role" value={roleLabel(profile.rol)} disabled />
        <Select
          label="Department"
          options={[
            {
              value: EXAMPLE_PROFILE.department,
              label: EXAMPLE_PROFILE.department,
            },
          ]}
          value={EXAMPLE_PROFILE.department}
          disabled
        />
      </div>
      <p className="mt-4 text-xs text-slate-500">Changes made in Vexxen show up here the next time you sign in.</p>
    </div>
  );
}
