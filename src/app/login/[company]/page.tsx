import { LoginView } from "@/features/auth/presentation/components/login-view";

/**
 * Login screen with the company name in the URL path, e.g.
 *   /login/Mi%20Empresa%20EvalFlow
 *
 * Next.js already URL-decodes dynamic route params, so `company` arrives as
 * a plain string ("Mi Empresa EvalFlow"). LoginView then resolves it through
 * our route handler and applies the brand colors; if it does not exist, it
 * falls back to onboarding.
 */
export default async function LoginByCompanyPage({
  params,
}: PageProps<"/login/[company]">) {
  const { company } = await params;
  const companyName = company?.trim() || null;

  return <LoginView companyName={companyName} />;
}
