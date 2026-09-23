import type {
  RegisterOwnerInput,
  RegisterOwnerResult,
} from "@/features/onboarding/domain/registration";

/** Port for the onboarding/registration flow. Implemented by infrastructure. */
export interface OnboardingRepository {
  registerOwner(input: RegisterOwnerInput): Promise<RegisterOwnerResult>;
}
