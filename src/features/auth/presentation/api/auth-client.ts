import { ApiError, parseMessage } from "@/shared/lib/api-error";

/** Login completed right away — tokens are already in the session cookie. */
export interface LoginSuccessResponse {
  requires2FA: false;
  message: string;
  username: string;
}

/** The account has 2FA enabled — a code was emailed, no session yet. */
export interface LoginRequires2FAResponse {
  requires2FA: true;
  message: string;
  email: string;
}

export type LoginResponse = LoginSuccessResponse | LoginRequires2FAResponse;

/**
 * Signs in against our own route handler. `identificationId` comes from the
 * company resolved via the company client and is only kept in memory for this
 * call — after login it lives inside the JWT cookie (unless 2FA is required,
 * in which case no cookie is set yet — see `verify2FA`).
 */
export async function login(input: {
  email: string;
  password: string;
  identificationId: number | null;
}): Promise<LoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Email: input.email,
      Password: input.password,
      IdentificationId:
        input.identificationId == null ? "" : String(input.identificationId),
    }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as LoginResponse;
}

export interface Verify2FAResponse {
  message: string;
  username: string;
}

/**
 * Exchanges the emailed 2FA code for a session via our own route handler.
 * On success the tokens are persisted as httpOnly cookies, same as a normal
 * login.
 */
export async function verify2FA(input: {
  email: string;
  code: string;
}): Promise<Verify2FAResponse> {
  const res = await fetch("/api/auth/verify-2fa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Email: input.email, Code: input.code }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as Verify2FAResponse;
}

export interface Resend2FAResponse {
  message: string;
}

/** Requests a fresh 2FA code be emailed via our own route handler. */
export async function resend2FA(email: string): Promise<Resend2FAResponse> {
  const res = await fetch("/api/auth/resend-2fa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Email: email }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as Resend2FAResponse;
}

export interface FeatureResponse {
  code: string;
  description: string;
}

export interface MyFeaturesResponse {
  role: string;
  features: FeatureResponse[];
  description: string;
}

/**
 * Fetches the current user's role, its granted features, and its
 * description via our own route handler. No body — the session cookie
 * carries the bearer token.
 */
export async function fetchMyFeatures(): Promise<MyFeaturesResponse> {
  const res = await fetch("/api/auth/my-features", { method: "GET" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as MyFeaturesResponse;
}

export interface VerifyEmailResponse {
  message: string;
  tenantId: string | null;
}

/**
 * Validates the token carried by the verification email link against our own
 * route handler. Public — no session cookie involved.
 */
export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  const res = await fetch("/api/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as VerifyEmailResponse;
}

export interface ResendVerificationResponse {
  message: string;
}

/** Requests a fresh email-verification link be sent via our own route handler. */
export async function resendVerification(
  email: string,
): Promise<ResendVerificationResponse> {
  const res = await fetch("/api/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Email: email }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as ResendVerificationResponse;
}

export interface ForgotPasswordResponse {
  message: string;
}

/**
 * Requests a password-reset link be emailed via our own route handler.
 * Public — no session cookie involved.
 */
export async function forgotPassword(
  email: string,
): Promise<ForgotPasswordResponse> {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Email: email }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as ForgotPasswordResponse;
}

export interface ResetPasswordResponse {
  message: string;
}

/**
 * Sets a new password from the reset-link token via our own route handler.
 * Public — no session cookie involved.
 */
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<ResetPasswordResponse> {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as ResetPasswordResponse;
}
