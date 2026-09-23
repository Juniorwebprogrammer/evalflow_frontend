/**
 * Auth entities — input and output of the sign-in flow.
 * The request body maps 1:1 to the backend `Auth/login` contract.
 */
export interface LoginInput {
  Email: string;
  Password: string;
  /**
   * Company identification obtained from `Company/get/by-name`. It is only
   * held in memory for the login request; once authenticated it travels inside
   * the JWT, so it is never persisted anywhere else.
   */
  IdentificationId: string;
}

/** The tokens + username backend `LoginResponse` carries on a completed sign-in. */
export interface AuthTokensResult {
  message: string;
  username: string;
  jwt: string;
  refreshToken: string;
}

/** Shape returned when the account has 2FA enabled: a code was emailed, no tokens yet. */
export interface Login2FAChallenge {
  message: string;
  email: string;
}

/**
 * Mirrors backend `Auth/login`, which answers one of two shapes depending on
 * whether the account has 2FA enabled: either tokens right away, or a
 * "check your email for a code" challenge that must go through
 * `Auth/verify-2fa` before tokens are issued.
 */
export type LoginResult =
  | ({ requires2FA: false } & AuthTokensResult)
  | ({ requires2FA: true } & Login2FAChallenge);

/** Body for the backend `Auth/verify-2fa` endpoint. */
export interface Verify2FAInput {
  Email: string;
  Code: string;
}

/** Body for the backend `Auth/resend-2fa` endpoint. */
export interface Resend2FAInput {
  Email: string;
}

/** Mirrors the backend `Auth/resend-2fa` response — always a generic message. */
export interface Resend2FAResult {
  message: string;
}

/**
 * The authenticated session persisted (as httpOnly cookies) after a successful
 * login or registration.
 */
export interface AuthSession {
  jwt: string;
  refreshToken: string;
}

/** A single feature granted by a role: its code plus a human-readable description. */
export interface Feature {
  code: string;
  description: string;
}

/**
 * Mirrors the backend `Auth/my-features` response: the caller's role, the
 * features granted to it, and the role's own description. `features` is
 * empty when the role was not found or has none configured (backend answers
 * 404 in both cases).
 */
export interface MyFeatures {
  role: string;
  features: Feature[];
  description: string;
}

/** Body for the backend `Auth/verify-email` endpoint. */
export interface VerifyEmailInput {
  Token: string;
}

/**
 * Mirrors the backend `Auth/verify-email` response. Also used for the
 * "already verified" case, which the backend answers with 200 OK too.
 * `tenantId` is the verified account's company `IdentificationId` — used to
 * send the caller straight to their branded login instead of the generic
 * one. `null` if the account has no company yet.
 */
export interface VerifyEmailResult {
  message: string;
  tenantId: string | null;
}

/** Body for the backend `Auth/resend-verification` endpoint. */
export interface ResendVerificationInput {
  Email: string;
}

/** Mirrors the backend `Auth/resend-verification` response — always a generic message. */
export interface ResendVerificationResult {
  message: string;
}

/** Body for the backend `Auth/forgot-password` endpoint. */
export interface ForgotPasswordInput {
  Email: string;
}

/**
 * Mirrors the backend `Auth/forgot-password` response — always a generic
 * message, whether or not the email matched an active account, so there's
 * nothing to leak either way.
 */
export interface ForgotPasswordResult {
  message: string;
}

/** Body for the backend `Auth/reset-password` endpoint. */
export interface ResetPasswordInput {
  Token: string;
  NewPassword: string;
}

/**
 * Mirrors the backend `Auth/reset-password` response. Invalid/expired
 * tokens come back as a 400 with their own message instead of this shape.
 */
export interface ResetPasswordResult {
  message: string;
}
