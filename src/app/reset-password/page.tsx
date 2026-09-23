import { ResetPasswordView } from "@/features/auth/presentation/components/reset-password-view";

/**
 * Landing page for the password-recovery email link, e.g.
 *   /reset-password?token=xxxxx
 *
 * Matches the link the backend's `ForgotPasswordHandler` builds. Reads the
 * token from the URL and hands it to ResetPasswordView, which submits it
 * together with the new password against the backend.
 */
export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/reset-password">) {
  const params = await searchParams;
  const raw = params.token;
  const token = (Array.isArray(raw) ? raw[0] : raw)?.trim() || null;

  return <ResetPasswordView token={token} />;
}
