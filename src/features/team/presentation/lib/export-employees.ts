import type { EmployeeResponse } from "@/features/team/presentation/api/team-client";

const HEADER = [
  "Nombre",
  "Apellidos",
  "Email",
  "Departamento",
  "Superior directo",
  "Cargo",
  "Rol",
  "Estado",
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
    employee.rol,
    employee.activo ? "Activo" : "Inactivo",
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
  link.download = "empleados.csv";
  link.click();

  URL.revokeObjectURL(url);
}
