import type {
  RegisterOwnerInput,
  RegisterOwnerResult,
} from "@/features/onboarding/domain/registration";
import type { OnboardingRepository } from "@/features/onboarding/domain/onboarding-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Creates the company with the person signed in with Vexxen as its owner.
 * Validates the payload before delegating to the onboarding backend, which
 * checks the EvalFlow plan in Vexxen (409 NO_PLAN without one).
 */
export class RegisterOwner {
  constructor(private readonly onboarding: OnboardingRepository) {}

  async execute(input: RegisterOwnerInput, vexxenAccessToken: string): Promise<RegisterOwnerResult> {
    if (!vexxenAccessToken) {
      throw new DomainError("Your Vexxen sign-in has expired. Please sign in again.", 401, "SIGN_IN_AGAIN");
    }
    this.validate(input);
    return this.onboarding.registerOwner(input, vexxenAccessToken);
  }

  private validate(input: RegisterOwnerInput): void {
    const required: Array<[keyof RegisterOwnerInput, string]> = [
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
  }
}
