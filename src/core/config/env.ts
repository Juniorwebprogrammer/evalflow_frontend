import "server-only";

/**
 * Server-only configuration. These values are read from the environment and
 * must never be imported into a Client Component — the api key stays on the
 * server, so the browser only ever talks to our own Next.js route handlers.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno "${name}". Revisa tu archivo .env.local`,
    );
  }
  return value;
}

export const serverEnv = {
  get backendUrl(): string {
    return required("BACKEND_URL").replace(/\/+$/, "");
  },
  get apiKey(): string {
    return required("BACKEND_API_KEY");
  },
  get apiKeyHeader(): string {
    return process.env.BACKEND_API_KEY_HEADER?.trim() || "ApiKey";
  },
};
