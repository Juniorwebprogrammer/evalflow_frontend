"use client";

import type { ReactNode } from "react";
import { StatCard } from "@/features/dashboard/presentation/components/stat-card";
import { useDashboardStats } from "@/features/dashboard/presentation/hooks/use-dashboard-stats";
import {
  UsersIcon,
  ClipboardIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
} from "@/shared/ui/icons";
import { formatDate } from "@/shared/lib/format-date";
import { Notice } from "@/shared/ui/notice";
import { ApiError } from "@/shared/lib/api-error";

interface Stat {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  sub: string;
}

export function StatsGrid() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />} className="mt-6">
        {error instanceof ApiError ? error.message : "No se pudieron cargar las estadísticas."}
      </Notice>
    );
  }

  const { activeCycle } = stats;
  const progress =
    activeCycle && activeCycle.totalSubmissions > 0
      ? Math.round((activeCycle.completedCount / activeCycle.totalSubmissions) * 100)
      : null;

  const items: Stat[] = [
    {
      icon: <UsersIcon style={{ width: 20, height: 20 }} />,
      iconBg: "#eef2ff",
      iconColor: "#4f46e5",
      value: String(stats.activeEmployeesCount),
      label: "Empleados activos",
      sub: `${stats.departmentsCount} departamentos`,
    },
    {
      icon: <ClipboardIcon style={{ width: 20, height: 20 }} />,
      iconBg: "#f5f3ff",
      iconColor: "#7c3aed",
      value: String(stats.activeCyclesCount),
      label: "Ciclos activos",
      sub: activeCycle ? `${activeCycle.nombre} en curso` : "Sin ciclo activo",
    },
    {
      icon: <ClockIcon style={{ width: 20, height: 20 }} />,
      iconBg: "#fff7ed",
      iconColor: "#ea580c",
      value: String(stats.totalPendingSubmissions),
      label: "Pendientes",
      sub: activeCycle ? `Plazo: ${formatDate(activeCycle.fechaFin)}` : "—",
    },
    {
      icon: <CheckCircleIcon style={{ width: 20, height: 20 }} />,
      iconBg: "#ecfdf5",
      iconColor: "#059669",
      value: String(stats.totalCompletedSubmissions),
      label: "Completadas",
      sub: progress !== null ? `${progress}% del ciclo` : "—",
    },
  ];

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
