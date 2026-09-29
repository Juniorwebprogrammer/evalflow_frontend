import "server-only";
import type { CompanyPlan, Plan } from "@/features/plans/domain/plan";
import type { PlanRepository } from "@/features/plans/domain/plan-repository";
import { BackendClient } from "@/core/http/backend-client";
import { UpstreamError } from "@/core/errors/errors";

/** Raw backend `PlanDto` (PascalCase or camelCase). */
type PlanDto = Record<string, unknown>;

function pick<T>(dto: Record<string, unknown>, name: string): T | undefined {
  const camel = name.charAt(0).toLowerCase() + name.slice(1);
  return (dto[name] ?? dto[camel]) as T | undefined;
}

function limit(dto: PlanDto, name: string): number | null {
  const value = pick<number | null>(dto, name);
  return typeof value === "number" ? value : null;
}

function mapPlan(dto: PlanDto): Plan {
  return {
    id: pick<number>(dto, "Id") ?? 0,
    code: pick<string>(dto, "Code") ?? "",
    nombre: pick<string>(dto, "Nombre") ?? "",
    maxEmployees: limit(dto, "MaxEmployees"),
    maxActiveCycles: limit(dto, "MaxActiveCycles"),
    maxCyclesPerYear: limit(dto, "MaxCyclesPerYear"),
    maxCustomTemplates: limit(dto, "MaxCustomTemplates"),
    maxDepartments: limit(dto, "MaxDepartments"),
    hasAiFeatures: Boolean(pick<boolean>(dto, "HasAiFeatures")),
    maxAiAnalysesPerMonth: limit(dto, "MaxAiAnalysesPerMonth"),
  };
}

export class HttpPlanRepository implements PlanRepository {
  constructor(private readonly client: BackendClient) {}

  async list(): Promise<Plan[]> {
    const dtos = await this.client.request<PlanDto[]>("/plans");
    return (dtos ?? []).map(mapPlan);
  }

  async getCompanyPlan(accessToken: string): Promise<CompanyPlan> {
    const dto = await this.client.request<Record<string, unknown>>("/Company/plan", { accessToken });
    const plan = dto && pick<PlanDto>(dto, "Plan");
    const usage = (dto && pick<Record<string, unknown>>(dto, "Usage")) ?? {};
    if (!plan) throw new UpstreamError("El servidor no devolvió el plan de la empresa");

    const count = (name: string) => pick<number>(usage, name) ?? 0;
    return {
      plan: mapPlan(plan),
      usage: {
        employees: count("Employees"),
        activeCycles: count("ActiveCycles"),
        cyclesThisYear: count("CyclesThisYear"),
        customTemplates: count("CustomTemplates"),
        departments: count("Departments"),
        aiAnalysesThisMonth: count("AiAnalysesThisMonth"),
      },
    };
  }
}
