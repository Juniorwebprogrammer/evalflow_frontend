"use client";

import type { ComponentType, SVGProps } from "react";
import { UserIcon, LockIcon, KeyIcon, BuildingIcon, CrownIcon } from "@/shared/ui/icons";
import { isOwnerRole } from "@/shared/lib/roles";

export type ProfileTab = "personal" | "security" | "role" | "organization";

const TABS: Array<{
  id: ProfileTab;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  ownerOnly?: boolean;
}> = [
  { id: "personal", label: "Datos personales", icon: UserIcon },
  { id: "security", label: "Contraseña y seguridad", icon: LockIcon },
  { id: "role", label: "Rol y permisos", icon: KeyIcon },
  { id: "organization", label: "Organización", icon: BuildingIcon, ownerOnly: true },
];

/** Tabs `rol` may open — the "Organización" (company control) tab is Owner-only. */
export function canOpenProfileTab(rol: string, tab: ProfileTab): boolean {
  const ownerOnly = TABS.find(({ id }) => id === tab)?.ownerOnly;
  return !ownerOnly || isOwnerRole(rol);
}

export function ProfileNav({
  rol,
  active,
  onChange,
}: {
  rol: string;
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}) {
  return (
    <nav className="space-y-1 rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
      {TABS.filter(({ id }) => canOpenProfileTab(rol, id)).map(({ id, label, icon: Icon, ownerOnly }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-[var(--brand)]/10 text-[var(--brand)]"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Icon style={{ width: 18, height: 18 }} />
            <span className="flex-1 text-left">{label}</span>
            {ownerOnly && (
              <CrownIcon
                style={{ width: 14, height: 14 }}
                className="text-amber-400"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
