"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Field } from "@/shared/ui/field";
import { Select } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { UserIcon, MailIcon, ArrowRightIcon } from "@/shared/ui/icons";
import { inviteEmployee } from "@/features/team/presentation/api/team-client";
import { errorMessage } from "@/shared/lib/api-error";
import { InviteSuccessNotice } from "@/features/team/presentation/components/invite-success-notice";
import { EMPLOYEES_QUERY_KEY } from "@/features/team/presentation/hooks/use-employees";
import { usePlanLimit } from "@/features/plans/presentation/components/plan-limit";

/**
 * Roles are hardcoded for now — the backend does not expose a roles endpoint
 * yet. Values must match the backend role constants (RRHH / Superior /
 * Employee). Swap this list for a fetched one once `GET /Team/roles` exists.
 */
const ROLES = [
  { value: "Employee", label: "Employee" },
  { value: "Superior", label: "Manager" },
  { value: "RRHH", label: "HR" },
] as const;

interface FormState {
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
}

const EMPTY: FormState = {
  nombre: "",
  apellidos: "",
  email: "",
  rol: ROLES[0].value,
};

interface Notified {
  email: string;
  rolAsignado: string;
}

export function InviteEmployeeForm() {
  const employeeLimit = usePlanLimit("employees");
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notified, setNotified] = useState<Notified | null>(null);

  function update(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotified(null);
    try {
      const result = await inviteEmployee(form);
      setNotified({ email: result.email, rolAsignado: result.rolAsignado });
      setForm(EMPTY);
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
    } catch (err) {
      setError(
        errorMessage(err, "We couldn't send the invitation.", {
          byDetail: [
            ["ya existe", "A user with this email address already exists."],
            ["email no es válido", "Enter a valid email address."],
            ["no es válido para este entorno", "The selected role isn't valid. Choose a different role."],
            [
              "tu plan",
              "You've reached your plan's limit of active employees. Upgrade your plan to invite more.",
            ],
          ],
          byStatus: { 409: "A user with this email address already exists." },
        }),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-slate-900">Invite an employee</h2>
      <p className="mt-0.5 text-sm text-slate-500">
        We&apos;ll email them an invitation to complete their registration.
      </p>

      {notified && (
        <InviteSuccessNotice
          email={notified.email}
          rolAsignado={notified.rolAsignado}
        />
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="First name"
            icon={<UserIcon className="h-4 w-4" />}
            value={form.nombre}
            onChange={(e) => update({ nombre: e.target.value })}
            placeholder="Laura"
            required
          />
          <Field
            label="Last name"
            value={form.apellidos}
            onChange={(e) => update({ apellidos: e.target.value })}
            placeholder="Martinez"
            required
          />
        </div>

        <Field
          label="Email"
          type="email"
          icon={<MailIcon className="h-4 w-4" />}
          value={form.email}
          onChange={(e) => update({ email: e.target.value })}
          placeholder="laura.martinez@company.com"
          required
        />

        <Select
          label="Role"
          options={ROLES.map((r) => ({ value: r.value, label: r.label }))}
          value={form.rol}
          onChange={(e) => update({ rol: e.target.value })}
        />

        {error && <Notice tone="error">{error}</Notice>}

        <Button type="submit" loading={submitting} disabled={employeeLimit.atLimit}>
          Send invitation
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
