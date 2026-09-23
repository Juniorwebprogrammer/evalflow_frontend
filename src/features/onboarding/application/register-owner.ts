import type {
  RegisterOwnerInput,
  RegisterOwnerResult,
} from "@/features/onboarding/domain/registration";
import type { OnboardingRepository } from "@/features/onboarding/domain/onboarding-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Registers the first user (owner) together with their company.
 * Validates the payload before delegating to the onboarding backend.
 */
export class RegisterOwner {
  constructor(private readonly onboarding: OnboardingRepository) {}

  async execute(input: RegisterOwnerInput): Promise<RegisterOwnerResult> {
    this.validate(input);
    return this.onboarding.registerOwner(input);
  }

  private validate(input: RegisterOwnerInput): void {
    const required: Array<[keyof RegisterOwnerInput, string]> = [
      ["UserNombre", "El nombre es obligatorio"],
      ["Apellidos", "Los apellidos son obligatorios"],
      ["Email", "El correo electrónico es obligatorio"],
      ["Password", "La contraseña es obligatoria"],
      ["CompanyNombre", "El nombre de la empresa es obligatorio"],
      ["Cif", "El CIF / NIF es obligatorio"],
      ["Sector", "El sector es obligatorio"],
      ["DireccionFiscal", "La dirección fiscal es obligatoria"],
    ];

    for (const [field, message] of required) {
      if (!String(input[field] ?? "").trim()) {
        throw new DomainError(message, 400);
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.Email)) {
      throw new DomainError("El correo electrónico no es válido", 400);
    }

    if (input.Password.length < 8) {
      throw new DomainError(
        "La contraseña debe tener al menos 8 caracteres",
        400,
      );
    }

    if (!Number.isInteger(input.PlanId) || input.PlanId < 0) {
      throw new DomainError("El plan seleccionado no es válido", 400);
    }
  }
}
