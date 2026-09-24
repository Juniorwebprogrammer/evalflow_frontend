import "server-only";
import { serverEnv } from "@/core/config/env";
import { NotFoundError, UpstreamError } from "@/core/errors/errors";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Treat a 404 as `null` instead of throwing. */
  allowNotFound?: boolean;
  /** Bearer access token (JWT) for endpoints that require an authenticated user. */
  accessToken?: string;
}

export interface BackendFile {
  body: ArrayBuffer;
  contentType: string;
  contentDisposition: string | null;
}

/**
 * Thin server-side HTTP client for the EvalFlow backend.
 * Injects the api key header on every request and normalizes errors into
 * domain errors. Only ever runs on the server.
 */
export class BackendClient {
  async request<T>(path: string, options: RequestOptions = {}): Promise<T | null> {
    const { method = "GET", body, allowNotFound = false, accessToken } = options;
    const url = `${serverEnv.backendUrl}${path.startsWith("/") ? path : `/${path}`}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      [serverEnv.apiKeyHeader]: serverEnv.apiKey,
    };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: "no-store",
      });
    } catch {
      throw new UpstreamError("No se pudo contactar con el servidor de EvalFlow");
    }

    if (response.status === 404) {
      if (allowNotFound) return null;
      // Surface the backend's own 404 detail instead of a generic message,
      // so handler-level "not found" reasons are visible.
      throw new NotFoundError(await this.safeErrorMessage(response));
    }

    if (!response.ok) {
      const detail = await this.safeErrorMessage(response);
      throw new UpstreamError(detail, response.status);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    return text ? (JSON.parse(text) as T) : null;
  }

  /** Downloads a binary payload (e.g. a PDF) instead of parsing JSON. */
  async requestFile(
    path: string,
    options: Pick<RequestOptions, "accessToken"> = {},
  ): Promise<BackendFile> {
    const url = `${serverEnv.backendUrl}${path.startsWith("/") ? path : `/${path}`}`;
    const headers: Record<string, string> = {
      [serverEnv.apiKeyHeader]: serverEnv.apiKey,
    };
    if (options.accessToken) {
      headers.Authorization = `Bearer ${options.accessToken}`;
    }

    let response: Response;
    try {
      response = await fetch(url, { method: "GET", headers, cache: "no-store" });
    } catch {
      throw new UpstreamError("No se pudo contactar con el servidor de EvalFlow");
    }

    if (response.status === 404) {
      throw new NotFoundError(await this.safeErrorMessage(response));
    }
    if (!response.ok) {
      throw new UpstreamError(await this.safeErrorMessage(response), response.status);
    }

    return {
      body: await response.arrayBuffer(),
      contentType: response.headers.get("content-type") ?? "application/octet-stream",
      contentDisposition: response.headers.get("content-disposition"),
    };
  }

  private async safeErrorMessage(response: Response): Promise<string> {
    try {
      const text = await response.text();
      if (!text) return `Error ${response.status} del servidor`;
      try {
        const parsed = JSON.parse(text);
        return (
          parsed.message ??
          parsed.Message ??
          parsed.title ??
          parsed.detail ??
          text
        );
      } catch {
        return text;
      }
    } catch {
      return `Error ${response.status} del servidor`;
    }
  }
}
