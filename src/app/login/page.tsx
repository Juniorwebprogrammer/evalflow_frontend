import { LoginView } from "@/features/auth/presentation/components/login-view";

/**
 * Login screen. Reads the company name from the URL (?company= or ?empresa=).
 * When present, LoginView resolves the company through our route handler;
 * when absent, it opens the onboarding flow automatically.
 */
export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const raw = params.company ?? params.empresa;
  const companyName = (Array.isArray(raw) ? raw[0] : raw)?.trim() || null;

  return <LoginView companyName={companyName} />;
}
