import type { AuthConfig } from "@vexxen/auth";

/**
 * The Vexxen popup only needs the public client id: the api key stays in the backend. The origin of this app
 * must be allowed in that Vexxen client (e.g. http://localhost:3002). Defined at module level so the provider
 * doesn't recreate the client on every render.
 */
const clientId = process.env.NEXT_PUBLIC_VEXXEN_CLIENT_ID;
const baseUrl = process.env.NEXT_PUBLIC_VEXXEN_BASE_URL?.replace(/\/+$/, "");

export const vexxenConfig: AuthConfig | null = clientId && baseUrl ? { clientId, baseUrl } : null;

/** Where the person manages their Vexxen account: name, password and two-step verification. */
export const vexxenProfileUrl = baseUrl ? `${baseUrl}/dashboard/profile` : null;
