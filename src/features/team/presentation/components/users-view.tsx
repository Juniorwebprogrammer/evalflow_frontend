"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { InviteEmployeeForm } from "@/features/team/presentation/components/invite-employee-form";
import { EmployeeDirectory } from "@/features/team/presentation/components/employee-directory";
import { OrgChart } from "@/features/team/presentation/components/org-chart";
import { useEmployees } from "@/features/team/presentation/hooks/use-employees";
import { DepartmentsGrid } from "@/features/departments/presentation/components/departments-grid";
import { CreateDepartmentModal } from "@/features/departments/presentation/components/create-department-modal";
import { useDepartments } from "@/features/departments/presentation/hooks/use-departments";
import { JobPositionsTable } from "@/features/job-positions/presentation/components/job-positions-table";
import { JobPositionFormModal } from "@/features/job-positions/presentation/components/job-position-form-modal";
import { useJobPositions } from "@/features/job-positions/presentation/hooks/use-job-positions";
import { Button } from "@/shared/ui/button";
import {
  UsersIcon,
  BuildingIcon,
  BriefcaseIcon,
  UserPlusIcon,
  PlusIcon,
  SitemapIcon,
} from "@/shared/ui/icons";

const TABS = [
  { key: "directorio", label: "Directorio", icon: UsersIcon, countOf: "employees" },
  { key: "organigrama", label: "Organigrama", icon: SitemapIcon, countOf: null },
  { key: "departamentos", label: "Departamentos", icon: BuildingIcon, countOf: "departments" },
  { key: "cargos", label: "Cargos", icon: BriefcaseIcon, countOf: "jobPositions" },
  { key: "invitar", label: "Invitar empleados", icon: UserPlusIcon, countOf: null },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const TAB_KEYS = TABS.map((t) => t.key) as readonly TabKey[];

function isTabKey(value: string | null): value is TabKey {
  return value !== null && (TAB_KEYS as readonly string[]).includes(value);
}

/** Users screen: employee directory, department cards, and the invite flow. */
export function UsersView() {
  const searchParams = useSearchParams();
  // Lets links like "Volver a departamentos" (from the department detail
  // page) land back on the right tab, e.g. /dashboard/usuarios?tab=departamentos.
  const initialTab = searchParams.get("tab");
  const [tab, setTab] = useState<TabKey>(isTabKey(initialTab) ? initialTab : "directorio");
  const [showCreateDepartment, setShowCreateDepartment] = useState(false);
  const [showCreateJobPosition, setShowCreateJobPosition] = useState(false);
  // Shared caches with the tabs below — fetched here only for the tab count badges.
  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();
  const { data: jobPositions } = useJobPositions();

  const counts: Record<string, number | undefined> = {
    employees: employees?.length,
    departments: departments?.length,
    jobPositions: jobPositions?.length,
  };

  return (
    <div className="mx-auto max-w-7xl px-8 py-7">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Empleados</h1>
          <p className="mt-1 text-sm text-slate-500">
            Directorio, departamentos y estructura organizativa
          </p>
        </div>

        {tab === "departamentos" && (
          <Button type="button" onClick={() => setShowCreateDepartment(true)}>
            <PlusIcon className="h-4 w-4" />
            Nuevo departamento
          </Button>
        )}

        {tab === "cargos" && (
          <Button type="button" onClick={() => setShowCreateJobPosition(true)}>
            <PlusIcon className="h-4 w-4" />
            Nuevo cargo
          </Button>
        )}
      </header>

      <div className="mt-6 flex gap-1 border-b border-slate-200">
        {TABS.map(({ key, label, icon: Icon, countOf }) => {
          const count = countOf ? counts[countOf] : undefined;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                tab === key
                  ? "border-[var(--brand)] text-[var(--brand)]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                    tab === key
                      ? "bg-[var(--brand)]/10 text-[var(--brand)]"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab === "directorio" && (
        <div className="mt-6">
          <EmployeeDirectory />
        </div>
      )}

      {tab === "organigrama" && (
        <div className="mt-6">
          <OrgChart />
        </div>
      )}

      {tab === "departamentos" && (
        <div className="mt-6">
          <DepartmentsGrid />
        </div>
      )}

      {tab === "cargos" && (
        <div className="mt-6">
          <JobPositionsTable />
        </div>
      )}

      {tab === "invitar" && (
        <div className="mt-6">
          <InviteEmployeeForm />
        </div>
      )}

      {showCreateDepartment && (
        <CreateDepartmentModal onClose={() => setShowCreateDepartment(false)} />
      )}

      {showCreateJobPosition && (
        <JobPositionFormModal onClose={() => setShowCreateJobPosition(false)} />
      )}
    </div>
  );
}
