"use client";

import { useMyRole } from "@/features/profile/presentation/hooks/use-profile";
import { isPrivilegedRole } from "@/shared/lib/roles";
import { useDashboardStats } from "@/features/dashboard/presentation/hooks/use-dashboard-stats";
import { ActiveCycleCard } from "@/features/dashboard/presentation/components/active-cycle-card";
import { RecentActivity } from "@/features/dashboard/presentation/components/recent-activity";
import { MyEvaluationsCard } from "@/features/dashboard/presentation/components/my-evaluations-card";
import {
  CycleStatusCard,
  TeamByDepartmentCard,
  TeamByRoleCard,
  TemplateProgressCard,
} from "@/features/dashboard/presentation/components/company-charts";

/**
 * Dashboard home. Owner/Rrhh get the company view (cycle progress, team and
 * cycle breakdowns); everyone else gets their own evaluations plus the
 * active cycle's overall progress.
 */
export function DashboardView() {
  const { role } = useMyRole();
  const canManage = isPrivilegedRole(role);

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            {canManage
              ? "An overview of your organization and the active evaluation cycle"
              : "Your evaluations and the active evaluation cycle"}
          </p>
        </div>
        {canManage && <CompanySummary />}
      </header>

      {canManage ? (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ActiveCycleCard canManage className="lg:col-span-2" />
          <TemplateProgressCard />
          <CycleStatusCard />
          <TeamByRoleCard />
          <RecentActivity />
          <TeamByDepartmentCard className="lg:col-span-3" />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <MyEvaluationsCard />
          <ActiveCycleCard canManage={false} />
        </div>
      )}
    </div>
  );
}

/** Headline company counts as one compact strip instead of separate cards. */
function CompanySummary() {
  const { data: stats } = useDashboardStats();
  const items = [
    { label: "Active employees", value: stats?.activeEmployeesCount },
    { label: "Departments", value: stats?.departmentsCount },
    { label: "Active cycles", value: stats?.activeCyclesCount },
  ];

  return (
    <dl className="flex divide-x divide-slate-200 rounded-xl border border-slate-100 bg-white py-2.5 shadow-sm">
      {items.map(({ label, value }) => (
        <div key={label} className="px-4 sm:px-5">
          <dt className="text-xs text-slate-500">{label}</dt>
          <dd className="text-lg font-bold tabular-nums text-slate-900">
            {value ?? <span className="inline-block h-5 w-8 animate-pulse rounded bg-slate-100" />}
          </dd>
        </div>
      ))}
    </dl>
  );
}
