"use client";

import { useState } from "react";
import type { CompanyInfo } from "@/features/company/domain/company";
import { useUpdateCompany } from "@/features/company/presentation/hooks/use-company";
import { Field } from "@/shared/ui/field";
import { Select } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { CompanyLogo } from "@/shared/ui/company-logo";
import {
  BuildingIcon,
  DocIcon,
  GlobeIcon,
  MapPinIcon,
  CheckCircleIcon,
} from "@/shared/ui/icons";
import { ApiError } from "@/shared/lib/api-error";
import { SECTORS } from "@/shared/data/sectors";

type Status = { tone: "success" | "error"; text: string } | null;

/** Extracts the first valid hex from a colors string, or a default brand blue. */
function firstHex(colors: string | null): string {
  const first = (colors ?? "").split(",")[0]?.trim() ?? "";
  if (/^#?[0-9a-fA-F]{6}$/.test(first)) {
    return first.startsWith("#") ? first : `#${first}`;
  }
  return "#2563eb";
}

/**
 * Editable company form. Nombre, LogoUrl, Colors, CIF, Sector and Dirección
 * fiscal are all persisted via the backend `Company/update`.
 */
export function OrganizationForm({
  identificationId,
  company,
  canEdit,
}: {
  identificationId: string;
  company: CompanyInfo;
  canEdit: boolean;
}) {
  const updateMutation = useUpdateCompany(identificationId);

  const initial = {
    nombre: company.nombre,
    logoUrl: company.logoUrl ?? "",
    colors: firstHex(company.colors),
    cif: company.cif,
    sector: company.sector,
    direccionFiscal: company.direccionFiscal,
  };
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [status, setStatus] = useState<Status>(null);

  const dirty =
    form.nombre !== saved.nombre ||
    form.logoUrl !== saved.logoUrl ||
    form.colors !== saved.colors ||
    form.cif !== saved.cif ||
    form.sector !== saved.sector ||
    form.direccionFiscal !== saved.direccionFiscal;

  function update(patch: Partial<typeof initial>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  // Keep the current sector selectable even if it is not in the default list.
  const sectorOptions = (
    form.sector && !SECTORS.includes(form.sector)
      ? [form.sector, ...SECTORS]
      : SECTORS
  ).map((s) => ({ value: s, label: s }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    try {
      await updateMutation.mutateAsync({
        nombre: form.nombre,
        logoUrl: form.logoUrl,
        colors: form.colors,
        cif: form.cif,
        sector: form.sector,
        direccionFiscal: form.direccionFiscal,
      });
      setSaved(form);
      setStatus({ tone: "success", text: "Empresa actualizada correctamente." });
    } catch (err) {
      setStatus({
        tone: "error",
        text:
          err instanceof ApiError
            ? err.message
            : "No se pudo guardar la empresa. Inténtalo de nuevo.",
      });
    }
  }

  const initials = form.nombre
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <form
      onSubmit={handleSave}
      className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-bold text-slate-900">
        Información de la empresa
      </h2>
      <p className="mt-0.5 text-sm text-slate-500">
        Datos legales y de contacto de tu organización
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

      {/* Logo */}
      <div className="mt-5 flex items-center gap-4 rounded-xl bg-slate-50 p-4">
        <CompanyLogo
          key={form.logoUrl}
          logoUrl={form.logoUrl}
          size={64}
          fallback={
            <span className="text-xl font-bold text-white">{initials || "?"}</span>
          }
        />
        <div className="flex-1">
          <Field
            label="URL del logotipo"
            icon={<GlobeIcon className="h-4 w-4" />}
            value={form.logoUrl}
            onChange={(e) => update({ logoUrl: e.target.value })}
            placeholder="https://…/logo.png"
            disabled={!canEdit}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Nombre de la empresa"
          icon={<BuildingIcon className="h-4 w-4" />}
          value={form.nombre}
          onChange={(e) => update({ nombre: e.target.value })}
          disabled={!canEdit}
          required
        />
        <Field
          label="CIF / NIF"
          icon={<DocIcon className="h-4 w-4" />}
          value={form.cif}
          onChange={(e) => update({ cif: e.target.value })}
          disabled={!canEdit}
        />
        <Select
          label="Sector"
          options={sectorOptions}
          value={form.sector}
          onChange={(e) => update({ sector: e.target.value })}
          disabled={!canEdit}
        />
      </div>

      <Field
        className="mt-4"
        label="Dirección fiscal"
        icon={<MapPinIcon className="h-4 w-4" />}
        value={form.direccionFiscal}
        onChange={(e) => update({ direccionFiscal: e.target.value })}
        disabled={!canEdit}
      />

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Color de marca
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={form.colors}
            onChange={(e) => update({ colors: e.target.value })}
            disabled={!canEdit}
            className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Color de marca"
          />
          <span className="font-mono text-sm text-slate-500">{form.colors}</span>
        </div>
      </div>

      {canEdit && (
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setForm(saved);
              setStatus(null);
            }}
            disabled={updateMutation.isPending || !dirty}
          >
            Descartar
          </Button>
          <Button
            type="submit"
            loading={updateMutation.isPending}
            disabled={!dirty}
          >
            <CheckCircleIcon className="h-4 w-4" />
            Guardar empresa
          </Button>
        </div>
      )}
    </form>
  );
}
