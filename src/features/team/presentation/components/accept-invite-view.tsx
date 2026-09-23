"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInvite } from "@/features/team/presentation/api/team-client";
import { ApiError } from "@/shared/lib/api-error";
import { Field } from "@/shared/ui/field";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { BrandPanel } from "@/features/auth/presentation/components/brand-panel";
import {
  UserIcon,
  LockIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
} from "@/shared/ui/icons";

const MIN_PASSWORD_LENGTH = 8;

interface FormState {
  nombre: string;
  apellidos: string;
  password: string;
  confirmPassword: string;
}

const EMPTY: FormState = {
  nombre: "",
  apellidos: "",
  password: "",
  confirmPassword: "",
};

/**
 * Landing screen for the invitation email link, e.g.
 *   /accept-invite?token=xxxxx
 *
 * Completes the invitation against the backend `Team/accept-invite` — the
 * invitee sets their own name and password. Public flow, no session required.
 */
export function AcceptInviteView({ token }: { token: string | null }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  function update(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    try {
      await acceptInvite({
        token: token as string,
        nombre: form.nombre,
        apellidos: form.apellidos,
        password: form.password,
      });
      setAccepted(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo aceptar la invitación. Inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel />

      <div className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-sm">
          {!token ? (
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <AlertTriangleIcon className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-xl font-bold text-slate-900">
                Enlace de invitación no válido
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Revisa el correo de invitación e inténtalo de nuevo, o pide a
                tu administrador que te envíe una nueva.
              </p>
              <Button
                type="button"
                className="mt-6 w-full"
                onClick={() => router.push("/login")}
              >
                Ir a iniciar sesión
              </Button>
            </div>
          ) : accepted ? (
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                <CheckCircleIcon className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-xl font-bold text-slate-900">
                ¡Invitación aceptada!
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Ya puedes iniciar sesión con tu correo y tu nueva contraseña.
              </p>
              <Button
                type="button"
                className="mt-6 w-full"
                onClick={() => router.push("/login")}
              >
                Ir a iniciar sesión
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-900">
                Completa tu registro
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Confirma tus datos y crea una contraseña para acceder a EvalFlow.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                  label="Contraseña"
                  type="password"
                  icon={<LockIcon className="h-4 w-4" />}
                  value={form.password}
                  onChange={(e) => update({ password: e.target.value })}
                  placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
                  minLength={MIN_PASSWORD_LENGTH}
                  required
                />
                <Field
                  label="Confirmar contraseña"
                  type="password"
                  icon={<LockIcon className="h-4 w-4" />}
                  value={form.confirmPassword}
                  onChange={(e) => update({ confirmPassword: e.target.value })}
                  placeholder="Repite la contraseña"
                  minLength={MIN_PASSWORD_LENGTH}
                  required
                />

                {error && <Notice tone="error">{error}</Notice>}

                <Button type="submit" className="w-full" loading={submitting}>
                  Aceptar invitación
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
