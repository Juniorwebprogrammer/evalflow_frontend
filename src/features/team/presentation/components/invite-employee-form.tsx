"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Field } from "@/shared/ui/field";
import { Select } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { UserIcon, MailIcon, ArrowRightIcon } from "@/shared/ui/icons";
import { inviteEmployee } from "@/features/team/presentation/api/team-client";
import { ApiError } from "@/shared/lib/api-error";
import { InviteSuccessNotice } from "@/features/team/presentation/components/invite-success-notice";
import { EMPLOYEES_QUERY_KEY } from "@/features/team/presentation/hooks/use-employees";

/**
 * Roles are hardcoded for now — the backend does not expose a roles endpoint
 * yet. Values must match the backend role constants (RRHH / Superior /
 * Employee). Swap this list for a fetched one once `GET /Team/roles` exists.
 */
const ROLES = [
  { value: "Employee", label: "Empleado" },
  { value: "Superior", label: "Superior" },
  { value: "RRHH", label: "RRHH" },
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
        err instanceof ApiError
          ? err.message
          : "No se pudo enviar la invitación. Inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Invitar empleado</h2>
      <p className="mt-0.5 text-sm text-slate-500">
        Enviaremos una invitación por correo para que complete su registro.
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
            label="Nombre"
            icon={<UserIcon className="h-4 w-4" />}
            value={form.nombre}
            onChange={(e) => update({ nombre: e.target.value })}
            placeholder="Laura"
            required
          />
          <Field
            label="Apellidos"
            value={form.apellidos}
            onChange={(e) => update({ apellidos: e.target.value })}
            placeholder="Martínez"
            required
          />
        </div>

        <Field
          label="Correo electrónico"
          type="email"
          icon={<MailIcon className="h-4 w-4" />}
          value={form.email}
          onChange={(e) => update({ email: e.target.value })}
          placeholder="laura.martinez@empresa.es"
          required
        />

        <Select
          label="Rol"
          options={ROLES.map((r) => ({ value: r.value, label: r.label }))}
          value={form.rol}
          onChange={(e) => update({ rol: e.target.value })}
        />

        {error && <Notice tone="error">{error}</Notice>}

        <Button type="submit" loading={submitting}>
          Enviar invitación
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
