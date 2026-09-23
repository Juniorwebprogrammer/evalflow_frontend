import { VerifyEmailView } from "@/features/auth/presentation/components/verify-email-view";

/**
 * Landing page for the verification email link, e.g.
 *   /auth/verify-email?token=xxxxx
 *
 * The path mirrors the backend endpoint name (`Auth/verify-email`) because
 * that's what the email template links to. Reads the token from the URL and
 * hands it to VerifyEmailView, which validates it against the backend.
 */
export default async function VerifyEmailPage({
  searchParams,
}: PageProps<"/auth/verify-email">) {
  const params = await searchParams;
  const raw = params.token;
  const token = (Array.isArray(raw) ? raw[0] : raw)?.trim() || null;

  return <VerifyEmailView token={token} />;
}
