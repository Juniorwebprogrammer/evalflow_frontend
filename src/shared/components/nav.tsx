"use client";

import { useState } from "react";
import { useLinkStatus } from "next/link";
import type { Profile } from "@/features/profile/domain/profile";
import { useProfile } from "@/features/profile/presentation/hooks/use-profile";
import { initials as toInitials } from "@/features/team/presentation/lib/format";
import { Spinner } from "@/shared/ui/spinner";
import {
  GridIcon,
  ClipboardIcon,
  UsersIcon,
  BarsIcon,
  SettingsIcon,
  DocIcon,
  StarIcon,
  MailIcon,
  TrendUpIcon,
} from "@/shared/ui/icons";
import { logout } from "@/app/dashboard/actions";
import { canAccessScreen } from "@/shared/lib/roles";

const NAV = [
  { icon: GridIcon, label: "Dashboard", href: "/dashboard" },
  { icon: DocIcon, label: "Templates", href: "/dashboard/plantillas" },
  { icon: ClipboardIcon, label: "Evaluation cycles", href: "/dashboard/ciclos-evaluacion" },
  { icon: StarIcon, label: "Favorite lists", href: "/dashboard/listas-favoritas" },
  { icon: UsersIcon, label: "Employees", href: "/dashboard/usuarios" },
  { icon: BarsIcon, label: "My evaluations", href: "/dashboard/mis-evaluaciones" },
  { icon: MailIcon, label: "Information requests", href: "/dashboard/solicitudes-informacion" },
  { icon: TrendUpIcon, label: "Evaluation results", href: "/dashboard/resultados-evaluacion" },
  { icon: SettingsIcon, label: "Settings", href: "/dashboard/perfil" },
];

/**
 * Everything the desktop sidebar and the mobile top bar share: the signed-in
 * user (from the `["profile"]` query cache, so edits on the profile page show
 * up instantly), the nav entries their role may open, and sign-out.
 */
export function useShellNav(initialProfile: Profile) {
  const { data: profile } = useProfile(initialProfile);
  const [signingOut, setSigningOut] = useState(false);

  function signOut() {
    setSigningOut(true);
    logout(profile.nombreEmpresa);
  }

  return {
    userName: `${profile.nombre} ${profile.apellidos}`.trim() || "User",
    initials: toInitials(profile.nombre, profile.apellidos),
    avatarVersion: profile.avatarUpdatedAt,
    nav: NAV.filter(({ href }) => canAccessScreen(profile.rol, href)),
    signingOut,
    signOut,
  };
}

/**
 * Spinner shown on the clicked nav link until the navigation commits.
 * Always rendered (opacity toggled) so it never shifts the label. Must be
 * rendered inside a `<Link>`.
 */
export function NavPendingIndicator() {
  const { pending } = useLinkStatus();
  return (
    <Spinner
      aria-hidden={!pending}
      className={`h-3.5 w-3.5 transition-opacity ${pending ? "opacity-100" : "opacity-0"}`}
    />
  );
}
