import { BellIcon } from "@/shared/ui/icons";
import { StatsGrid } from "@/features/dashboard/presentation/components/stats-grid";
import { ActiveCycleCard } from "@/features/dashboard/presentation/components/active-cycle-card";
import { RecentActivity } from "@/features/dashboard/presentation/components/recent-activity";

export function DashboardView() {
  return (
    <div className="mx-auto max-w-7xl px-8 py-7">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Resumen del ciclo de evaluación activo
          </p>
        </div>
        <button className="relative rounded-full p-2 text-slate-400 hover:bg-white">
          <BellIcon style={{ width: 20, height: 20 }} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>
      </header>

      <StatsGrid />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ActiveCycleCard />
        <RecentActivity />
      </div>
    </div>
  );
}
