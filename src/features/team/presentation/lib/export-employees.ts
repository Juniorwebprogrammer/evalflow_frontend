import type { EmployeeResponse } from "@/features/team/presentation/api/team-client";
import { roleLabel } from "@/features/team/presentation/lib/format";

const HEADER = [
  "First name",
  "Last name",
  "Email",
  "Department",
  "Manager",
  "Job position",
  "Role",
  "Status",
];

function toRow(employee: EmployeeResponse): string[] {
  return [
    employee.nombre,
    employee.apellidos,
    employee.email,
    employee.departamento?.nombre ?? "",
    employee.superior
      ? `${employee.superior.nombre} ${employee.superior.apellidos}`
      : "",
    employee.cargo ?? "",
    roleLabel(employee.rol),
    employee.activo ? "Active" : "Inactive",
  ];
}

function escapeCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/** Downloads the given employees as a CSV file (client-side only, no request involved). */
export function exportEmployeesToCsv(employees: EmployeeResponse[]): void {
  const lines = [HEADER, ...employees.map(toRow)].map((row) =>
    row.map(escapeCsvCell).join(","),
  );
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "employees.csv";
  link.click();

  URL.revokeObjectURL(url);
}
