import type { RegisterOwnerInput } from "@/features/onboarding/domain/registration";
import { toApiError } from "@/shared/lib/api-error";

export interface RegisterOwnerResponse {
  message: string;
  userNombre: string;
  planStatus: string;
}

/** Creates the company; on success the owner is already signed in (session cookies set). */
export async function registerOwner(
  input: RegisterOwnerInput,
): Promise<RegisterOwnerResponse> {
  const res = await fetch("/api/onboarding/register-owner", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) throw await toApiError(res);
  return (await res.json()) as RegisterOwnerResponse;
}
