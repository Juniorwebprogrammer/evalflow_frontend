import { ApiError, parseMessage } from "@/shared/lib/api-error";

export interface Toggle2FAResponse {
  message: string;
}

/** Enables/disables 2FA for the current user via our own route handler. */
export async function toggle2FA(enable: boolean): Promise<Toggle2FAResponse> {
  const res = await fetch("/api/settings/2fa", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Enable: enable }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as Toggle2FAResponse;
}
