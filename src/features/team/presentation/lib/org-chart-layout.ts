import type { EmployeeResponse } from "@/features/team/presentation/api/team-client";

interface OrgNode {
  employee: EmployeeResponse;
  children: OrgNode[];
}

/**
 * Builds a forest (one tree per root) from the flat employee list plus a
 * parent → children id map. An employee is a root when it never appears as
 * someone else's direct report. Guards against cycles in the source data
 * (shouldn't happen — the backend rejects them — but a stale/bad response
 * must not hang the layout).
 */
function buildForest(
  employees: EmployeeResponse[],
  childrenOf: Record<string, string[]>,
): OrgNode[] {
  const byId = new Map(employees.map((e) => [e.id, e]));
  const hasParent = new Set<string>();
  for (const kids of Object.values(childrenOf)) {
    for (const id of kids) hasParent.add(id);
  }

  function build(id: string, visiting: Set<string>): OrgNode | null {
    const employee = byId.get(id);
    if (!employee || visiting.has(id)) return null;
    const nextVisiting = new Set(visiting).add(id);
    const children = (childrenOf[id] ?? [])
      .map((childId) => build(childId, nextVisiting))
      .filter((n): n is OrgNode => n !== null);
    return { employee, children };
  }

  return employees
    .filter((e) => !hasParent.has(e.id))
    .map((e) => build(e.id, new Set())!)
    .filter(Boolean);
}

export interface OrgChartLayout {
  positions: Map<string, { x: number; y: number }>;
  edges: Array<{ parentId: string; childId: string }>;
  columns: number;
  rows: number;
}

/**
 * Assigns each employee a `(column, row)` slot: row = depth from its root,
 * column = a leaf-based position so siblings never overlap (a simplified
 * tidy-tree layout — internal nodes sit above the average of their children).
 */
export function layoutOrgChart(
  employees: EmployeeResponse[],
  childrenOf: Record<string, string[]>,
): OrgChartLayout {
  const forest = buildForest(employees, childrenOf);
  const positions = new Map<string, { x: number; y: number }>();
  const edges: Array<{ parentId: string; childId: string }> = [];
  let nextColumn = 0;
  let maxDepth = 0;

  function visit(node: OrgNode, depth: number): number {
    maxDepth = Math.max(maxDepth, depth);
    for (const child of node.children) {
      edges.push({ parentId: node.employee.id, childId: child.employee.id });
    }

    if (node.children.length === 0) {
      const x = nextColumn++;
      positions.set(node.employee.id, { x, y: depth });
      return x;
    }

    const childXs = node.children.map((child) => visit(child, depth + 1));
    const x = childXs.reduce((a, b) => a + b, 0) / childXs.length;
    positions.set(node.employee.id, { x, y: depth });
    return x;
  }

  forest.forEach((root) => visit(root, 0));

  return { positions, edges, columns: Math.max(nextColumn, 1), rows: maxDepth + 1 };
}
