import type {
  LoginInput,
  LoginResult,
  MyFeatures,
  VerifyEmailInput,
  VerifyEmailResult,
  AuthTokensResult,
  Verify2FAInput,
  Resend2FAInput,
  Resend2FAResult,
  ResendVerificationInput,
  ResendVerificationResult,
  ForgotPasswordInput,
  ForgotPasswordResult,
  ResetPasswordInput,
  ResetPasswordResult,
} from "@/features/auth/domain/auth";

/** Port for the authentication flow. Implemented by the infrastructure layer. */
export interface AuthRepository {
  login(input: LoginInput): Promise<LoginResult>;
  /** Returns the caller's role, the features it grants, and its description. */
  getMyFeatures(accessToken: string): Promise<MyFeatures>;
  /** Validates the token from the email verification link. Public — no session. */
  verifyEmail(input: VerifyEmailInput): Promise<VerifyEmailResult>;
  /** Completes a 2FA login challenge, exchanging the emailed code for tokens. */
  verify2FA(input: Verify2FAInput): Promise<AuthTokensResult>;
  /** Requests a new 2FA code be emailed, replacing any pending one. */
  resend2FA(input: Resend2FAInput): Promise<Resend2FAResult>;
  /** Requests a new email-verification link, replacing any pending one. */
  resendVerification(
    input: ResendVerificationInput,
  ): Promise<ResendVerificationResult>;
  /** Requests a password-reset link be emailed. Public — no session. */
  forgotPassword(input: ForgotPasswordInput): Promise<ForgotPasswordResult>;
  /** Sets a new password from the emailed reset link's token. Public — no session. */
  resetPassword(input: ResetPasswordInput): Promise<ResetPasswordResult>;
}
