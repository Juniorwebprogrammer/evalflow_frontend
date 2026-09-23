import type { RegisterOwnerInput } from "@/features/onboarding/domain/registration";
import { ApiError, parseMessage } from "@/shared/lib/api-error";

export interface RegisterOwnerResponse {
  message: string;
  userNombre: string;
}

export async function registerOwner(
  input: RegisterOwnerInput,
): Promise<RegisterOwnerResponse> {
  const res = await fetch("/api/onboarding/register-owner", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as RegisterOwnerResponse;
}
