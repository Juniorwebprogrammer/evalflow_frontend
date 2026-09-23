"use client";

import { useState, useSyncExternalStore } from "react";
import type { Profile } from "@/features/profile/domain/profile";
import { Field } from "@/shared/ui/field";
import { Select } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { UserIcon, MailIcon, CheckCircleIcon } from "@/shared/ui/icons";
import { useUpdateProfile } from "@/features/profile/presentation/hooks/use-profile";
import { ApiError } from "@/shared/lib/api-error";
import {
  EXAMPLE_PROFILE,
  LANGUAGES,
} from "@/features/profile/presentation/data/example";
import {
  getLanguage,
  setLanguage,
  subscribeLanguage,
} from "@/features/profile/presentation/lib/language-preference";

type Status = { tone: "success" | "error"; text: string } | null;

/**
 * Only Nombre + Apellidos are editable and persisted (backend
 * `Profile/update`). Email and Cargo (the user's role) are real but read-only;
 * Departamento is example data. The interface language is a local preference.
 */
export function PersonalDataPanel({ profile }: { profile: Profile }) {
  const updateMutation = useUpdateProfile();
  const [nombre, setNombre] = useState(profile.nombre);
  const [apellidos, setApellidos] = useState(profile.apellidos);
  // Last persisted values — the baseline for detecting unsaved changes.
  const [saved, setSaved] = useState({
    nombre: profile.nombre,
    apellidos: profile.apellidos,
  });
  const [status, setStatus] = useState<Status>(null);

  // Interface language: a local preference read from / written to localStorage
  // via an external store (no visual effect yet).
  const language = useSyncExternalStore(
    subscribeLanguage,
    () => {
      const value = getLanguage(EXAMPLE_PROFILE.language);
      return LANGUAGES.includes(value) ? value : EXAMPLE_PROFILE.language;
    },
    () => EXAMPLE_PROFILE.language,
  );

  const dirty = nombre !== saved.nombre || apellidos !== saved.apellidos;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    try {
      // Optimistic mutation: updates the profile cache immediately (header +
      // this panel on remount) and revalidates against the backend on settle.
      await updateMutation.mutateAsync({ nombre, apellidos });
      setSaved({ nombre, apellidos });
      setStatus({ tone: "success", text: "Perfil actualizado correctamente." });
    } catch (err) {
      setStatus({
        tone: "error",
        text:
          err instanceof ApiError
            ? err.message
            : "No se pudo guardar el perfil. Inténtalo de nuevo.",
      });
    }
  }

  function discard() {
    setNombre(saved.nombre);
    setApellidos(saved.apellidos);
    setStatus(null);
  }

  return (
    <form
      onSubmit={handleSave}
      className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-bold text-slate-900">Datos personales</h2>
      <p className="mt-0.5 text-sm text-slate-500">
        Información visible para tu equipo de RRHH
      </p>

      {status && (
        <Notice
          tone={status.tone}
          className="mt-5"
          icon={
            status.tone === "success" ? (
              <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
            ) : undefined
          }
        >
          {status.text}
        </Notice>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Nombre"
          icon={<UserIcon className="h-4 w-4" />}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <Field
          label="Apellidos"
          value={apellidos}
          onChange={(e) => setApellidos(e.target.value)}
          required
        />
        <Field
          label="Email corporativo"
          type="email"
          icon={<MailIcon className="h-4 w-4" />}
          value={profile.email}
          disabled
        />
        <Field label="Cargo / Posición" value={profile.rol} disabled />
        <Select
          label="Departamento"
          options={[
            {
              value: EXAMPLE_PROFILE.department,
              label: EXAMPLE_PROFILE.department,
            },
          ]}
          value={EXAMPLE_PROFILE.department}
          disabled
        />
        <Select
          label="Idioma de la interfaz"
          options={LANGUAGES.map((l) => ({ value: l, label: l }))}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        />
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={discard}
          disabled={updateMutation.isPending || !dirty}
        >
          Descartar cambios
        </Button>
        <Button
          type="submit"
          loading={updateMutation.isPending}
          disabled={!dirty}
        >
          <CheckCircleIcon className="h-4 w-4" />
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
