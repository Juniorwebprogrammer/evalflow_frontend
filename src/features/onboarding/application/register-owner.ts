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
      ["UserNombre", "First name is required"],
      ["Apellidos", "Last name is required"],
      ["Email", "Email is required"],
      ["Password", "Password is required"],
      ["CompanyNombre", "Company name is required"],
      ["Cif", "Tax ID is required"],
      ["Sector", "Sector is required"],
      ["DireccionFiscal", "Registered address is required"],
    ];

    for (const [field, message] of required) {
      if (!String(input[field] ?? "").trim()) {
        throw new DomainError(message, 400);
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.Email)) {
      throw new DomainError("Email is not valid", 400);
    }

    if (input.Password.length < 8) {
      throw new DomainError(
        "Password must be at least 8 characters long",
        400,
      );
    }

    if (!Number.isInteger(input.PlanId) || input.PlanId < 0) {
      throw new DomainError("The selected plan is not valid", 400);
    }
  }
}
