/**
 * The backend has no dedicated error code for "email not verified" — it
 * answers with a plain 400 + message, same shape as any other login
 * rejection. We detect it by matching the message text.
 *
 * Keep this in sync with `LoginHandler.ValidateCredentialsAndTenant` in the
 * backend if that copy ever changes.
 */
const EMAIL_NOT_VERIFIED_HINT = "verificar tu correo";

export function isEmailNotVerifiedError(message: string): boolean {
  return message.toLowerCase().includes(EMAIL_NOT_VERIFIED_HINT);
}
