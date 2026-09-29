"use client";

import { useState, useSyncExternalStore } from "react";
import type { Profile } from "@/features/profile/domain/profile";
import { Field } from "@/shared/ui/field";
import { Select } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { UserIcon, MailIcon, CheckCircleIcon } from "@/shared/ui/icons";
import { useUpdateProfile } from "@/features/profile/presentation/hooks/use-profile";
import { errorMessage } from "@/shared/lib/api-error";
import { roleLabel } from "@/features/team/presentation/lib/format";
import {
  EXAMPLE_PROFILE,
} from "@/features/profile/presentation/data/example";

type Status = { tone: "success" | "error"; text: string } | null;

/**
 * Only Nombre + Apellidos are editable and persisted (backend
 * `Profile/update`). Email and Cargo (the user's role) are real but read-only;
 * Departamento is example data.
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

  const dirty = nombre !== saved.nombre || apellidos !== saved.apellidos;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    try {
      // Optimistic mutation: updates the profile cache immediately (header +
      // this panel on remount) and revalidates against the backend on settle.
      await updateMutation.mutateAsync({ nombre, apellidos });
      setSaved({ nombre, apellidos });
      setStatus({ tone: "success", text: "Profile updated." });
    } catch (err) {
      setStatus({
        tone: "error",
        text: errorMessage(err, "We couldn't save your profile."),
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
      className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6"
    >
      <h2 className="text-lg font-bold text-slate-900">Personal details</h2>
      <p className="mt-0.5 text-sm text-slate-500">
        Information visible to your HR team
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
          label="First name"
          icon={<UserIcon className="h-4 w-4" />}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <Field
          label="Last name"
          value={apellidos}
          onChange={(e) => setApellidos(e.target.value)}
          required
        />
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

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={discard}
          disabled={updateMutation.isPending || !dirty}
        >
          Discard changes
        </Button>
        <Button
          type="submit"
          loading={updateMutation.isPending}
          disabled={!dirty}
        >
          <CheckCircleIcon className="h-4 w-4" />
          Save changes
        </Button>
      </div>
    </form>
  );
}
